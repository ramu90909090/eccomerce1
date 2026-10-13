const ContactConfig = require("../models/ContactConfig");

// Helper to get or initialize config document
const getOrCreateConfig = async () => {
  let config = await ContactConfig.findOne();
  if (!config) {
    config = await ContactConfig.create({
      carouselCards: [
        {
          icon: "Phone",
          title: "Direct Calling Desk",
          desc: "Instant live agent support",
          contact: "+91 98765 43210",
          contactSub: "Active Mon - Sat (9:00 AM - 8:00 PM)",
          action: "tel:+919876543210",
          btnText: "Call Now",
          gradient: "from-blue-500 to-cyan-500"
        },
        {
          icon: "MessageCircle",
          title: "WhatsApp Priority Chat",
          desc: "Live order updates & quick query",
          contact: "+91 98765 43210",
          contactSub: "Instant reply within 2 minutes",
          action: "https://wa.me/919876543210",
          btnText: "Start Chat",
          gradient: "from-emerald-500 to-teal-500"
        },
        {
          icon: "Mail",
          title: "Official Email Support",
          desc: "Formal ticketing & billing query",
          contact: "support@khastore.com",
          contactSub: "Turnaround time: 2 - 4 Hours",
          action: "mailto:support@khastore.com",
          btnText: "Send Mail",
          gradient: "from-pink-500 to-rose-500"
        }
      ],
      faqs: [
        {
          question: "Order dispatch hone me kitna time lagta hai?",
          answer: "Hum sabhi orders ko 24 ghante ke andar warehouse se dispatch karte hain."
        },
        {
          question: "Product return kaise karein?",
          answer: "7 dinon ke andar return request place karke free pickup prapt karein."
        }
      ]
    });
  }
  return config;
};

// 1. GET Page Configuration (Public)
exports.getContactConfig = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. UPDATE Global Banner, Map, Form Configuration (Admin)
exports.updateGeneralConfig = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    if (req.body.banner) config.banner = { ...config.banner, ...req.body.banner };
    if (req.body.mapConfig) config.mapConfig = { ...config.mapConfig, ...req.body.mapConfig };
    if (req.body.formConfig) config.formConfig = { ...config.formConfig, ...req.body.formConfig };

    await config.save();
    res.status(200).json({ success: true, message: "General configuration updated", data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. CARDS CRUD (Admin)
exports.addCard = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    config.carouselCards.push(req.body);
    await config.save();
    res.status(201).json({ success: true, message: "Card added", data: config.carouselCards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    const card = config.carouselCards.id(req.params.cardId);
    if (!card) return res.status(404).json({ success: false, message: "Card not found" });

    Object.assign(card, req.body);
    await config.save();
    res.status(200).json({ success: true, message: "Card updated", data: config.carouselCards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    config.carouselCards.pull({ _id: req.params.cardId });
    await config.save();
    res.status(200).json({ success: true, message: "Card deleted", data: config.carouselCards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. FAQS CRUD (Admin)
exports.addFaq = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    config.faqs.push(req.body);
    await config.save();
    res.status(201).json({ success: true, message: "FAQ added", data: config.faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFaq = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    const faq = config.faqs.id(req.params.faqId);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });

    Object.assign(faq, req.body);
    await config.save();
    res.status(200).json({ success: true, message: "FAQ updated", data: config.faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    config.faqs.pull({ _id: req.params.faqId });
    await config.save();
    res.status(200).json({ success: true, message: "FAQ deleted", data: config.faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};