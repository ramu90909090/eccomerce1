const mongoose = require("mongoose");

const statItemSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  prefix: { type: String, default: "", trim: true },
  suffix: { type: String, default: "+", trim: true },
  isDecimal: { type: Boolean, default: false },
  label: { type: String, required: true, trim: true },
  change: { type: String, default: "", trim: true }
});

const infraItemSchema = new mongoose.Schema({
  tag: { type: String, required: true, trim: true }, // e.g. Flagship Store
  title: { type: String, required: true, trim: true },
  desc: { type: String, required: true, trim: true },
  icon: { type: String, default: "Store" }, // Store, Boxes, Building2
  images: [
    {
      url: { type: String, required: true, trim: true },
      caption: { type: String, default: "", trim: true },
      isActive: { type: Boolean, default: true }
    }
  ]
});

const pillarSchema = new mongoose.Schema({
  icon: { type: String, default: "ShieldCheck" }, // ShieldCheck, Truck, Award, HeartHandshake
  title: { type: String, required: true, trim: true },
  color: { type: String, default: "from-blue-500 to-cyan-500" },
  desc: { type: String, required: true, trim: true }
});

const milestoneSchema = new mongoose.Schema({
  year: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  desc: { type: String, required: true, trim: true }
});

const aboutConfigSchema = new mongoose.Schema(
  {
    hero: {
      badge: { type: String, default: "Redefining Online Shopping Experience" },
      headingPrefix: { type: String, default: "Humara Maqsad:" },
      headingHighlight: { type: String, default: "Quality & Bharosa Har Order Par" },
      description: {
        type: String,
        default:
          "KHASTORE par hum tech gadgets, authentic lifestyle wear aur home upgrades ko affordably aapke door-step tak deliver karte hain. Koi hidden charges nahi, seedha transparent pricing."
      },
      isEnabled: { type: Boolean, default: true }
    },
    stats: [statItemSchema],
    infrastructure: [infraItemSchema],
    founder: {
      name: { type: String, default: "Rahul Sharma" },
      designation: { type: String, default: "Founder & CEO" },
      quote: {
        type: String,
        default: "Customer ka bharosa kisi bhi marketing campaign se badhkar hai."
      },
      visionStory: {
        type: String,
        default:
          "Jab humne KHASTORE shuru kiya tha, humara ek hi principle tha: jo item user ko mile, wo 100% genuine ho aur reasonable price me mile. Hum kisi bhi middle-agent commission ko hata kar seedha benefit apne Indian consumers ko pass on karte hain."
      },
      images: [
        {
          url: { type: String, required: true },
          isActive: { type: Boolean, default: true }
        }
      ],
      socials: {
        linkedin: { type: String, default: "" },
        twitter: { type: String, default: "" },
        email: { type: String, default: "founder@khastore.com" }
      },
      isEnabled: { type: Boolean, default: true }
    },
    pillars: [pillarSchema],
    milestones: [milestoneSchema],
    cta: {
      heading: { type: String, default: "Experience the Quality Yourself" },
      description: {
        type: String,
        default: "Latest gadgets, curated fashion aur reliable lifestyle items direct warehouse price par order karein."
      },
      buttonText: { type: String, default: "Start Shopping Now" },
      buttonLink: { type: String, default: "/products" },
      isEnabled: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutConfig", aboutConfigSchema);