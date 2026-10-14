const Order = require("../models/Order");
const Product = require("../models/Product");

// 1. Create New Order (Stock abhi deduct nahi hoga, sirf order log hoga)
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

    // Format items schema
    const formattedItems = items.map((it) => ({
      product: it.product || it.id || it._id,
      name: it.name,
      image: Array.isArray(it.images) && it.images.length > 0 ? it.images[0] : it.image,
      price: it.finalPrice || it.price,
      quantity: it.quantity || 1,
      total: (it.finalPrice || it.price) * (it.quantity || 1)
    }));

    // Create Order with default status 'Processing' / 'Pending'
    const newOrder = await Order.create({
      orderId,
      user: userId || req.user?._id || null,
      items: formattedItems,
      shippingDetails,
      paymentInfo: {
        mode: paymentInfo.mode,
        utrNumber: paymentInfo.utrNumber || "N/A",
        status: paymentInfo.mode === "cod" ? "Not Verified" : "Processing"
      },
      orderStatus: "Pending",
      pricing,
      stockDeducted: false // Stock tabhi deduct hoga jab payment verify hogi
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

// 2. Update Order & Payment Status (Yahan Payment "Verified" hone par Stock Deduct hoga)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // =========================================================================
    // CONDITION 1: Payment Status "Verified" hua aur pehle deduct nahi hua tha
    // =========================================================================
    if (paymentStatus === "Verified" && !order.stockDeducted) {
      // Check karein ki stock available hai ya nahi
      for (const item of order.items) {
        const prod = await Product.findById(item.product);
        if (!prod) {
          return res.status(404).json({
            success: false,
            message: `Product "${item.name}" system me nahi mila.`
          });
        }
        if (prod.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Product "${prod.name}" me sirf ${prod.stock} items bache hain, jabki order me ${item.quantity} hain. Stock kam nahi kiya ja sakta.`
          });
        }
      }

      // Stock minus karein jitni quantity order hui hai
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }

      order.stockDeducted = true;
    }

    // =========================================================================
    // CONDITION 2: Agar pehle Verified tha aur ab Cancelled ya Rejected hua to Stock Wapas Return (+ add) karein
    // =========================================================================
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

    // Update Statuses
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentInfo.status = paymentStatus;
    if (notes !== undefined) order.notes = notes;

    await order.save();

    res.status(200).json({
      success: true,
      message:
        paymentStatus === "Verified"
          ? "Payment verify ho gayi aur product stock successfully deduct ho gaya!"
          : "Order status successfully update ho gaya.",
      data: order
    });
  } catch (error) {
    console.error("Order update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get All Orders with Advanced Filters, Search & Pagination (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const {
      search,
      orderStatus,
      paymentStatus,
      paymentMode,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    if (search && search.trim()) {
      const regex = { $regex: search.trim(),$options: "i" };
      query.$or = [
        { orderId: regex },
        { "shippingDetails.name": regex },
        { "shippingDetails.phone": regex },
        { "shippingDetails.email": regex },
        { "paymentInfo.utrNumber": regex }
      ];
    }

    if (orderStatus && orderStatus !== "All") {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== "All") {
      query["paymentInfo.status"] = paymentStatus;
    }

    if (paymentMode && paymentMode !== "All") {
      query["paymentInfo.mode"] = paymentMode;
    }

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),
      Order.countDocuments(query)
    ]);

    const [totalRevenueData, pendingOrdersCount, deliveredOrdersCount] = await Promise.all([
      Order.aggregate([
        { $match: { "paymentInfo.status": "Verified" } }, // Sirf verified revenue
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

// 4. Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Agar stock deduct ho chuka tha toh delete karne se pehle restore karein
    if (order.stockDeducted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};