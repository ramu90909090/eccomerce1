// backend/utils/getAdminWhatsappPhone.js
const mongoose = require("mongoose");

// Schema definitions fallback support
const getAdminWhatsappPhone = async () => {
  try {
    // 1. Try to fetch from Contact Us CMS Configuration
    const ContactConfig = mongoose.models.ContactConfig || mongoose.model("ContactConfig");
    const contactData = await ContactConfig.findOne();

    if (contactData && Array.isArray(contactData.carouselCards)) {
      // Find the card designated for WhatsApp
      const waCard = contactData.carouselCards.find(
        (c) =>
          c.title?.toLowerCase().includes("whatsapp") ||
          c.icon?.toLowerCase() === "messagecircle" ||
          c.action?.includes("wa.me")
      );

      if (waCard) {
        // Extract raw number from action link (e.g., https://wa.me/918187921060 -> 918187921060)
        if (waCard.action && waCard.action.includes("wa.me/")) {
          const matched = waCard.action.match(/wa\.me\/(\d+)/);
          if (matched && matched[1]) {
            return matched[1];
          }
        }

        // Or clean the contact string (e.g., "+91 81879 21060" -> "918187921060")
        if (waCard.contact) {
          const cleaned = waCard.contact.replace(/\D/g, "");
          if (cleaned.length >= 10) {
            return cleaned.length === 10 ? `91${cleaned}` : cleaned;
          }
        }
      }
    }

    // 2. Fallback to SiteSettings footer phone if contact card not found
    const SiteSettings = mongoose.models.SiteSettings || mongoose.model("SiteSettings");
    const siteData = await SiteSettings.findOne();
    if (siteData?.footer?.customerDesk?.phone) {
      const cleaned = siteData.footer.customerDesk.phone.replace(/\D/g, "");
      if (cleaned.length >= 10) {
        return cleaned.length === 10 ? `91${cleaned}` : cleaned;
      }
    }

    // 3. Fallback to environment variable or hardcoded default
    return process.env.ADMIN_WHATSAPP_PHONE || "918187921060";
  } catch (err) {
    console.error("Error fetching dynamic admin WhatsApp phone:", err);
    return process.env.ADMIN_WHATSAPP_PHONE || "918187921060";
  }
};

module.exports = getAdminWhatsappPhone;