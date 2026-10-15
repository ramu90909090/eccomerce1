const WhatsappLog = require("../models/WhatsappLog");
const whatsappService = require("../services/whatsappService");
const { processQueue } = require("../services/queueService");

// 1. Get Live Session Status
exports.getSessionStatus = (req, res) => {
  res.status(200).json({
    success: true,
    status: whatsappService.getClientStatus(),
    qrCode: whatsappService.getQrCode(),
    connectedNumber: whatsappService.getConnectedAdminNumber()
  });
};

// 2. Reconnect using saved session
exports.reconnectSession = async (req, res) => {
  try {
    await whatsappService.reconnectExistingSession();
    res.status(200).json({
      success: true,
      message: "Purane session se reconnect kiya ja raha hai..."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Start Fresh Session & Delete All Old WhatsApp Logs
exports.startNewSession = async (req, res) => {
  try {
    // Purana session cache delete karein
    await whatsappService.resetAndStartNewSession();

    // Naya session shuru hote hi purane sabhi logs delete karein
    const deleteResult = await WhatsappLog.deleteMany({});
    console.log(`🗑️ Cleared ${deleteResult.deletedCount} old WhatsApp logs for new session.`);

    res.status(200).json({
      success: true,
      message: "Purana session aur saare puraane logs delete ho gaye. Naya QR ban raha hai..."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Disconnect / Logout
exports.logoutSession = async (req, res) => {
  try {
    await whatsappService.disconnectClient();
    res.status(200).json({ success: true, message: "WhatsApp session successfully disconnect kar diya gaya." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get Logs (Pagination, Filter, Search)
exports.getWhatsappLogs = async (req, res) => {
  try {
    const { search, status, triggerType, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search && search.trim()) {
      const regex = { $regex: search.trim(),$options: "i" };
      query.$or = [{ orderId: regex }, { recipientNumber: regex }, { messageBody: regex }];
    }

    if (status && status !== "All") query.status = status;
    if (triggerType && triggerType !== "All") query.triggerType = triggerType;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const [logs, total] = await Promise.all([
      WhatsappLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(perPage),
      WhatsappLog.countDocuments(query)
    ]);

    const [sentCount, pendingCount, failedCount, notReachableCount] = await Promise.all([
      WhatsappLog.countDocuments({ status: "Sent" }),
      WhatsappLog.countDocuments({ status: "Pending" }),
      WhatsappLog.countDocuments({ status: "Failed" }),
      WhatsappLog.countDocuments({ status: "Not Reachable" })
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        totalPages: Math.ceil(total / perPage) || 1,
        currentPage,
        limit: perPage
      },
      stats: {
        sentCount,
        pendingCount,
        failedCount,
        notReachableCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Retry single message
exports.retryMessage = async (req, res) => {
  try {
    const log = await WhatsappLog.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: "Log nahi mila" });

    log.status = "Pending";
    log.retries = 0;
    log.errorReason = "";
    await log.save();

    processQueue();
    res.status(200).json({ success: true, message: "Message dobara queue me add ho gaya." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Bulk Delete Logs
exports.bulkDeleteLogs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ success: false, message: "Koi log select nahi kiya." });
    }

    await WhatsappLog.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, message: `${ids.length} logs delete kar diye gaye.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};