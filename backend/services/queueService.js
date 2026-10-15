const WhatsappLog = require("../models/WhatsappLog");
const whatsappService = require("./whatsappService");

let isProcessingQueue = false;

// 1. Add message into DB queue
const queueMessage = async ({
  orderId,
  recipientNumber,
  recipientType,
  triggerType,
  messageBody
}) => {
  try {
    const log = await WhatsappLog.create({
      orderId,
      recipientNumber,
      recipientType,
      triggerType,
      messageBody,
      status: "Pending"
    });

    // Trigger queue processing
    processQueue();
    return log;
  } catch (err) {
    console.error("Queue insertion error:", err);
  }
};

// 2. Continuous FIFO Queue Runner with 3-Retry mechanism
const processQueue = async () => {
  if (isProcessingQueue) return;
  if (whatsappService.getClientStatus() !== "READY") {
    return; // Will automatically pick up when WhatsApp reconnects
  }

  isProcessingQueue = true;

  try {
    // Pick pending or failed messages with retries < 3
    const pendingLog = await WhatsappLog.findOne({
      status: { $in: ["Pending", "Failed"] },
      retries: { $lt: 3 }
    }).sort({ createdAt: 1 });

    if (!pendingLog) {
      isProcessingQueue = false;
      return;
    }

    const formattedPhone = whatsappService.formatWhatsAppNumber(pendingLog.recipientNumber);

    if (!formattedPhone) {
      pendingLog.status = "Not Reachable";
      pendingLog.errorReason = "Invalid mobile number format.";
      await pendingLog.save();
      isProcessingQueue = false;
      return processQueue();
    }

    // Step 2.1: Check if WhatsApp account exists for this number
    const isRegistered = await whatsappService.isUserRegisteredOnWhatsApp(formattedPhone);

    if (!isRegistered) {
      pendingLog.status = "Not Reachable";
      pendingLog.errorReason = "Number is not registered on WhatsApp.";
      await pendingLog.save();
      console.log(`⚠️ Skipped: ${pendingLog.recipientNumber} has no WhatsApp account.`);

      isProcessingQueue = false;
      return setTimeout(processQueue, 1500);
    }

    // Step 2.2: Send message
    try {
      await whatsappService.sendTextMessage(formattedPhone, pendingLog.messageBody);

      pendingLog.status = "Sent";
      pendingLog.sentAt = new Date();
      pendingLog.errorReason = "";
      await pendingLog.save();
      console.log(`📤 WhatsApp sent to ${pendingLog.recipientNumber} for order ${pendingLog.orderId}`);
    } catch (sendError) {
      pendingLog.retries += 1;
      pendingLog.errorReason = sendError.message || "Failed to deliver message";

      if (pendingLog.retries >= pendingLog.maxRetries) {
        pendingLog.status = "Not Reachable";
        console.error(`❌ Max retries reached for ${pendingLog.recipientNumber}. Marked as Not Reachable.`);
      } else {
        pendingLog.status = "Failed";
        console.warn(`🔄 Retry ${pendingLog.retries}/3 for ${pendingLog.recipientNumber}`);
      }

      await pendingLog.save();
    }

    // Delay 2.5 seconds between messages to prevent congestion and number suspension
    setTimeout(() => {
      isProcessingQueue = false;
      processQueue();
    }, 2500);
  } catch (globalError) {
    console.error("Queue Processor Error:", globalError);
    isProcessingQueue = false;
  }
};

module.exports = {
  queueMessage,
  processQueue
};