import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const SettingsContext = createContext();

export const defaultSettings = {
  navbar: {
    brandName: "KHASTORE",
    brandSubtitle: "Premium Deals",
    logoUrl: "",
    showSparkleIcon: true
  },
  footer: {
    brandName: "KHASTORE",
    brandSubtitle: "Premium Deals 2026",
    logoUrl: "",
    description:
      "Direct factory pricing aur authentic lifestyle & electronic gadgets ka India ka leading online hub. High quality, instant pan-India dispatch ke sath.",
    trustGuarantees: [
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
    ],
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
      youtube: "https://youtube.com"
    },
    quickLinks: [
      { label: "Home Page", url: "/" },
      { label: "All Products", url: "/products" },
      { label: "About Us", url: "/about" },
      { label: "Contact Us", url: "/contact" }
    ],
    customerDesk: {
      address: "Hazratganj, Lucknow, UP - 226001",
      phone: "+91 98765 43210",
      email: "support@khastore.com"
    },
    newsletter: {
      title: "Exclusive Offers",
      subtitle: "Festive discounts aur new drops ki instant notifications payein."
    },
    copyrightText: "© 2026 KHASTORE. All rights reserved.",
    heartNotice: "for direct Indian shoppers",
    paymentModes: ["UPI", "VISA", "MasterCard", "COD"]
  }
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await API.get("/settings");
      if (res.data?.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.log("Using default site settings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);