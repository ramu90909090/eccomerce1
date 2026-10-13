const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    navbar: {
      brandName: { type: String, default: "KHASTORE" },
      brandSubtitle: { type: String, default: "Premium Deals" },
      logoUrl: { type: String, default: "" },
      showSparkleIcon: { type: Boolean, default: true }
    },
    footer: {
      brandName: { type: String, default: "KHASTORE" },
      brandSubtitle: { type: String, default: "Premium Deals 2026" },
      logoUrl: { type: String, default: "" },
      description: {
        type: String,
        default:
          "Direct factory pricing aur authentic lifestyle & electronic gadgets ka India ka leading online hub. High quality, instant pan-India dispatch ke sath."
      },
      trustGuarantees: {
        type: [
          {
            title: String,
            subtitle: String,
            iconKey: String,
            gradient: String
          }
        ],
        default: [
          {
            title: "Free Express Delivery",
            subtitle: "All India over ₹499",
            iconKey: "truck",
            gradient: "from-violet-600 to-indigo-600"
          },
          {
            title: "100% Genuine Items",
            subtitle: "Direct Brand Warranty",
            iconKey: "shield",
            gradient: "from-pink-500 to-rose-600"
          },
          {
            title: "7-Day Free Returns",
            subtitle: "No questions asked",
            iconKey: "rotate",
            gradient: "from-amber-500 to-orange-600"
          },
          {
            title: "Dedicated Support",
            subtitle: "24/7 Fast assistance",
            iconKey: "headphones",
            gradient: "from-emerald-500 to-teal-600"
          }
        ]
      },
      socialLinks: {
        instagram: { type: String, default: "https://instagram.com" },
        twitter: { type: String, default: "https://twitter.com" },
        youtube: { type: String, default: "https://youtube.com" }
      },
      quickLinks: {
        type: [{ label: String, url: String }],
        default: [
          { label: "Home Page", url: "/" },
          { label: "All Products", url: "/products" },
          { label: "About Us", url: "/about" },
          { label: "Contact Us", url: "/contact" }
        ]
      },
      customerDesk: {
        address: { type: String, default: "Hazratganj, Lucknow, UP - 226001" },
        phone: { type: String, default: "+91 98765 43210" },
        email: { type: String, default: "support@khastore.com" }
      },
      newsletter: {
        title: { type: String, default: "Exclusive Offers" },
        subtitle: {
          type: String,
          default: "Festive discounts aur new drops ki instant notifications payein."
        }
      },
      copyrightText: { type: String, default: "© 2026 KHASTORE. All rights reserved." },
      heartNotice: { type: String, default: "for direct Indian shoppers" },
      paymentModes: {
        type: [String],
        default: ["UPI", "VISA", "MasterCard", "COD"]
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);