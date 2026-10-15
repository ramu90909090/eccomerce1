const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const SiteSettings = require("../models/SiteSettings");
const jwt = require("jsonwebtoken");
const { queueMessage } = require("../services/queueService");
const whatsappService = require("../services/whatsappService");
const getAdminWhatsappPhone = require("../utils/getAdminWhatsappPhone");

// Currency Formatter Helper
const formatCurrency = (amt) => `₹${Number(amt || 0).toLocaleString("en-IN")}`;

// Template 1: Order Placement Confirmation Message (Customer & Admin)
const getOrderPlacedMessage = ({ storeName, order, recipientName, isForAdmin = false }) => {
  const itemList = order.items
    .map((it) => `• ${it.name} (Qty: ${it.quantity}) - ${formatCurrency(it.total)}`)
    .join("\n");

  if (isForAdmin) {
    return (
      `🔔 *NEW ORDER RECEIVED - ${storeName.toUpperCase()}*\n\n` +
      `📦 *Order ID:* ${order.orderId}\n` +
      `👤 *Customer:* ${order.shippingDetails.name}\n` +
      `📞 *Phone:* ${order.shippingDetails.phone}\n` +
      `📍 *City:* ${order.shippingDetails.city} - ${order.shippingDetails.pincode}\n` +
      `💳 *Payment Mode:* ${order.paymentInfo.mode.toUpperCase()} (UTR: ${order.paymentInfo.utrNumber})\n\n` +
      `*Order Items:*\n${itemList}\n\n` +
      `💰 *Total Amount:* ${formatCurrency(order.pricing.totalPayable)}\n\n` +
      `Admin panel se order review aur payment verify karein.`
    );
  }

  return (
    `🎉 *ORDER CONFIRMED - ${storeName.toUpperCase()}*\n\n` +
    `Namaste *${recipientName}* ji,\n` +
    `Aapka order safaltapoorvak receive ho gaya hai.\n\n` +
    `📦 *Order ID:* ${order.orderId}\n` +
    `📅 *Date:* ${new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}\n\n` +
    `*Items Ordered:*\n${itemList}\n\n` +
    `💰 *Grand Total:* ${formatCurrency(order.pricing.totalPayable)}\n` +
    `🚚 *Delivery To:* ${order.shippingDetails.address}, ${order.shippingDetails.city} (${order.shippingDetails.pincode})\n\n` +
    `Status update hote hi aapko WhatsApp par suchit kar diya jayega.\n` +
    `Thank you for shopping with *${storeName}*! ❤️`
  );
};

// Template 2: Order Delivery Status Update Message
const getStatusUpdateMessage = ({ storeName, order, newStatus }) => {
  let emoji = "🚚";
  let statusNote = "";

  if (newStatus === "Processing") {
    emoji = "⚙️";
    statusNote = "Aapka order pack kiya ja raha hai.";
  } else if (newStatus === "Shipped") {
    emoji = "📦";
    statusNote = "Aapka parcel courier partner ko hand-over kar diya gaya hai aur delivery ke liye nikal chuka hai.";
  } else if (newStatus === "Delivered") {
    emoji = "✅";
    statusNote = "Aapka parcel safaltapoorvak deliver ho gaya hai. Hum aasha karte hain aapko product pasand aaya hoga!";
  } else if (newStatus === "Cancelled") {
    emoji = "❌";
    statusNote = "Aapka order cancel kar diya gaya hai. Kisi bhi query ke liye support desk par sampark karein.";
  }

  return (
    `${emoji} *ORDER STATUS UPDATE - ${storeName.toUpperCase()}*\n\n` +
    `Namaste *${order.shippingDetails.name}* ji,\n\n` +
    `Aapke order *${order.orderId}* ka delivery status update ho gaya hai:\n\n` +
    `📍 *Current Status:* *${newStatus.toUpperCase()}*\n` +
    `📝 *Details:* ${statusNote}\n` +
    (order.notes ? `💬 *Tracking Note:* ${order.notes}\n` : "") +
    `\nKisi bhi sahayata ke liye hamare customer desk par sampark karein.\n` +
    `Team *${storeName}*`
  );
};

// Template 3: Payment Verification Status Update Message (NEW)
const getPaymentStatusUpdateMessage = ({ storeName, order, newPaymentStatus }) => {
  let emoji = "💳";
  let statusNote = "";

  if (newPaymentStatus === "Verified") {
    emoji = "✅";
    statusNote = "Aapki payment aur bank UTR safaltapoorvak verify ho chuki hai. Aapka order process kiya ja raha hai!";
  } else if (newPaymentStatus === "Rejected") {
    emoji = "❌";
    statusNote = "Aapke dwara diya gaya bank UTR number verify nahi ho saka ya payment receive nahi hui. Kripya sahi UTR submit karein ya support se contact karein.";
  } else if (newPaymentStatus === "Processing") {
    emoji = "⏳";
    statusNote = "Aapka bank payment verification process me hai.";
  } else if (newPaymentStatus === "Not Verified") {
    emoji = "⚠️";
    statusNote = "Aapki payment abhi tak verify nahi hui hai.";
  } else if (newPaymentStatus === "Cancelled") {
    emoji = "🚫";
    statusNote = "Payment transaction cancel mark kar diya gaya hai.";
  }

  return (
    `${emoji} *PAYMENT STATUS UPDATE - ${storeName.toUpperCase()}*\n\n` +
    `Namaste *${order.shippingDetails.name}* ji,\n\n` +
    `Aapke order *${order.orderId}* ka payment verification status update hua hai:\n\n` +
    `💳 *Payment Status:* *${newPaymentStatus.toUpperCase()}*\n` +
    `🔢 *UTR / Ref No:* ${order.paymentInfo.utrNumber || "N/A"}\n` +
    `💰 *Order Amount:* ${formatCurrency(order.pricing.totalPayable)}\n` +
    `📝 *Update Note:* ${statusNote}\n` +
    (order.notes ? `💬 *Admin Note:* ${order.notes}\n` : "") +
    `\nKisi bhi query ya problem ke liye hamare support desk par message karein.\n` +
    `Team *${storeName}*`
  );
};

// =========================================================================
// 1. CREATE NEW ORDER
// =========================================================================
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

    let finalUserId = userId || null;
    if (!finalUserId) {
      const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_default_secret_key_2026");
          finalUserId = decoded.id;
        } catch (e) {
          // Proceed as guest
        }
      }
    }

    const formattedItems = items.map((it) => ({
      product: it.product || it.id || it._id,
      name: it.name,
      image: Array.isArray(it.images) && it.images.length > 0 ? it.images[0] : it.image,
      price: it.finalPrice || it.price,
      quantity: it.quantity || 1,
      total: (it.finalPrice || it.price) * (it.quantity || 1)
    }));

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

    const settings = await SiteSettings.findOne();
    const storeName = settings?.navbar?.brandName || "KHASTORE";

    const dynamicAdminPhone =
      (await getAdminWhatsappPhone()) ||
      whatsappService.getConnectedAdminNumber();

    const customerShippingPhone = newOrder.shippingDetails.phone;
    const customerMsg = getOrderPlacedMessage({
      storeName,
      order: newOrder,
      recipientName: newOrder.shippingDetails.name,
      isForAdmin: false
    });

    await queueMessage({
      orderId: newOrder.orderId,
      recipientNumber: customerShippingPhone,
      recipientType: "customer",
      triggerType: "order_placed",
      messageBody: customerMsg
    });

    if (finalUserId) {
      const regUser = await User.findById(finalUserId);
      if (
        regUser &&
        regUser.mobile &&
        regUser.mobile !== customerShippingPhone &&
        regUser.mobile !== "N/A"
      ) {
        await queueMessage({
          orderId: newOrder.orderId,
          recipientNumber: regUser.mobile,
          recipientType: "customer",
          triggerType: "order_placed",
          messageBody: customerMsg
        });
      }
    }

    if (dynamicAdminPhone) {
      const adminMsg = getOrderPlacedMessage({
        storeName,
        order: newOrder,
        recipientName: "Admin",
        isForAdmin: true
      });

      await queueMessage({
        orderId: newOrder.orderId,
        recipientNumber: dynamicAdminPhone,
        recipientType: "admin",
        triggerType: "order_placed",
        messageBody: adminMsg
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully. Payment verification & notifications pending.",
      data: newOrder
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 2. GET USER ORDERS
// =========================================================================
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const userEmail = req.user?.email;
    const userPhone = req.user?.mobile || req.user?.phone;

    const { search, orderStatus, page = 1, limit = 5 } = req.query;

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
      const regex = { $regex: search.trim(),$options: "i" };
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

// =========================================================================
// 3. UPDATE ORDER STATUS & PAYMENT VERIFICATION (With WhatsApp Triggers)
// =========================================================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const previousOrderStatus = order.orderStatus;
    const previousPaymentStatus = order.paymentInfo?.status;

    // 1. Stock Deduction if payment is Verified
    if (paymentStatus === "Verified" && !order.stockDeducted) {
      for (const item of order.items) {
        const prod = await Product.findById(item.product);
        if (!prod) {
          return res.status(404).json({
            success: false,
            message: `Product "${item.name}" database me nahi mila.`
          });
        }
        if (prod.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Product "${prod.name}" me sirf ${prod.stock} bache hain, order quantity: ${item.quantity}.`
          });
        }
      }

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
      order.stockDeducted = true;
    }

    // 2. Restore stock if Cancelled/Rejected after previous verification
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

    // Save updated fields
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentInfo.status = paymentStatus;
    if (notes !== undefined) order.notes = notes;

    await order.save();

    // 3. Fetch Dynamic Store Name
    const settings = await SiteSettings.findOne();
    const storeName = settings?.navbar?.brandName || "KHASTORE";

    // 4. TRIGGER 1: Order Status Changed Message (e.g. Shipped, Delivered)
    if (orderStatus && orderStatus !== previousOrderStatus) {
      const statusMsg = getStatusUpdateMessage({
        storeName,
        order,
        newStatus: orderStatus
      });

      await queueMessage({
        orderId: order.orderId,
        recipientNumber: order.shippingDetails.phone,
        recipientType: "customer",
        triggerType: "status_updated",
        messageBody: statusMsg
      });
    }

    // 5. TRIGGER 2: Payment Status Changed Message (e.g. Verified, Rejected)
    if (paymentStatus && paymentStatus !== previousPaymentStatus) {
      const paymentMsg = getPaymentStatusUpdateMessage({
        storeName,
        order,
        newPaymentStatus: paymentStatus
      });

      await queueMessage({
        orderId: order.orderId,
        recipientNumber: order.shippingDetails.phone,
        recipientType: "customer",
        triggerType: "payment_verified",
        messageBody: paymentMsg
      });
    }

    res.status(200).json({
      success: true,
      message:
        paymentStatus === "Verified"
          ? "Payment verify ho gayi, stock deduct hua aur customer ko payment verification alert bhej diya gaya!"
          : "Order details aur customer notification update ho gayi.",
      data: order
    });
  } catch (error) {
    console.error("updateOrderStatus Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 4. GET ALL ORDERS (Admin CRM)
// =========================================================================
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

    if (orderStatus && orderStatus !== "All") query.orderStatus = orderStatus;
    if (paymentStatus && paymentStatus !== "All") query["paymentInfo.status"] = paymentStatus;
    if (paymentMode && paymentMode !== "All") query["paymentInfo.mode"] = paymentMode;

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

// =========================================================================
// 5. DELETE ORDER (Admin with Stock Safety)
// =========================================================================
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