// backend/controllers/orderController.js

const Order = require("../models/Order");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");

// 1. Create New Order (Reliable User Association)
exports.createOrder = async (req, res) => {
  try {
    const {
      orderId,
      items,
      shippingDetails,
      paymentInfo,
      pricing,
      userId
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Order items cannot be empty." });
    }

    // Identify Logged-In User either from Auth Token or Explicit userId
    let finalUserId = userId || null;
    if (!finalUserId) {
      const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_default_secret_key_2026");
          finalUserId = decoded.id;
        } catch (e) {
          // Token invalid, proceed as guest
        }
      }
    }

    // Format items schema
    const formattedItems = items.map((it) => ({
      product: it.product || it.id || it._id,
      name: it.name,
      image: Array.isArray(it.images) && it.images.length > 0 ? it.images[0] : it.image,
      price: it.finalPrice || it.price,
      quantity: it.quantity || 1,
      total: (it.finalPrice || it.price) * (it.quantity || 1)
    }));

    // Create Order with accurate user reference
    const newOrder = await Order.create({
      orderId,
      user: finalUserId,
      items: formattedItems,
      shippingDetails,
      paymentInfo: {
        mode: paymentInfo.mode,
        utrNumber: paymentInfo.utrNumber || "N/A",
        status: paymentInfo.mode === "cod" ? "Not Verified" : "Processing"
      },
      orderStatus: "Pending",
      pricing,
      stockDeducted: false
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully. Payment verification pending.",
      data: newOrder
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Logged-in User Orders (Matching user ID OR Email/Phone fallback)
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const userEmail = req.user?.email;
    const userPhone = req.user?.mobile || req.user?.phone;

    const { search, orderStatus, page = 1, limit = 5 } = req.query;

    // Robust matching: Check User ID OR Email matching user's account
    let query = {
      $or: [
        { user: userId },
        ...(userEmail ? [{ "shippingDetails.email": userEmail }] : []),
        ...(userPhone ? [{ "shippingDetails.phone": userPhone }] : [])
      ]
    };

    if (orderStatus && orderStatus !== "All") {
      query.orderStatus = orderStatus;
    }

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      query.$and = [
        {
          $or: [
            { orderId: regex },
            { "items.name": regex },
            { "paymentInfo.utrNumber": regex }
          ]
        }
      ];
    }

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),
      Order.countDocuments(query)
    ]);

    const [deliveredCount, pendingCount] = await Promise.all([
      Order.countDocuments({ ...query, orderStatus: "Delivered" }),
      Order.countDocuments({
        ...query,
        orderStatus: { $in: ["Pending", "Processing", "Shipped"] }
      })
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / perPage) || 1,
        currentPage,
        limit: perPage
      },
      stats: {
        totalOrders,
        pendingOrders: pendingCount,
        deliveredOrders: deliveredCount
      }
    });
  } catch (error) {
    console.error("getMyOrders Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Order Status & Payment Verification (Admin update trigger)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Deduct stock if payment is Verified
    if (paymentStatus === "Verified" && !order.stockDeducted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
      order.stockDeducted = true;
    }

    // Restore stock if cancelled/rejected after deduction
    const isCancelledOrRejected =
      orderStatus === "Cancelled" ||
      paymentStatus === "Rejected" ||
      paymentStatus === "Cancelled";

    if (isCancelledOrRejected && order.stockDeducted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
      order.stockDeducted = false;
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentInfo.status = paymentStatus;
    if (notes !== undefined) order.notes = notes;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { search, orderStatus, paymentStatus, paymentMode, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { orderId: regex },
        { "shippingDetails.name": regex },
        { "shippingDetails.phone": regex },
        { "shippingDetails.email": regex },
        { "paymentInfo.utrNumber": regex }
      ];
    }

    if (orderStatus && orderStatus !== "All") query.orderStatus = orderStatus;
    if (paymentStatus && paymentStatus !== "All") query["paymentInfo.status"] = paymentStatus;
    if (paymentMode && paymentMode !== "All") query["paymentInfo.mode"] = paymentMode;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const [orders, totalOrders] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(perPage),
      Order.countDocuments(query)
    ]);

    const [totalRevenueData, pendingOrdersCount, deliveredOrdersCount] = await Promise.all([
      Order.aggregate([
        { $match: { "paymentInfo.status": "Verified" } },
        { $group: { _id: null, total: { $sum: "$pricing.totalPayable" } } }
      ]),
      Order.countDocuments({ orderStatus: "Pending" }),
      Order.countDocuments({ orderStatus: "Delivered" })
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / perPage) || 1,
        currentPage,
        limit: perPage
      },
      stats: {
        totalOrders,
        totalRevenue: totalRevenueData[0]?.total || 0,
        pendingOrders: pendingOrdersCount,
        deliveredOrders: deliveredOrdersCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.stockDeducted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};