const AboutConfig = require("../models/AboutConfig");

// Helper to seed initial config if not exists
const getOrCreateAboutConfig = async () => {
  let config = await AboutConfig.findOne();
  if (!config) {
    config = await AboutConfig.create({
      hero: {
        badge: "Redefining Online Shopping Experience",
        headingPrefix: "Humara Maqsad:",
        headingHighlight: "Quality & Bharosa Har Order Par",
        description:
          "KHASTORE par hum tech gadgets, authentic lifestyle wear aur home upgrades ko affordably deliver karte hain.",
        isEnabled: true
      },
      stats: [
        { number: 75000, suffix: "+", label: "Delivered Orders", change: "Pan-India Reach" },
        { number: 120, suffix: "+", label: "Genuine Brands", change: "Verified Partners" },
        { number: 4.8, suffix: " ★", isDecimal: true, label: "Customer Rating", change: "Based on 15k+ Reviews" },
        { number: 24, prefix: "< ", suffix: " Hrs", label: "Dispatch Speed", change: "Fastest Fulfilment" }
      ],
      infrastructure: [
        {
          tag: "Flagship Experience Store",
          title: "Physical Retail & Demo Lounge",
          desc: "Walk in, try products hands-on aur direct store pickup support.",
          icon: "Store",
          images: [
            {
              url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
              caption: "Store Front",
              isActive: true
            }
          ]
        },
        {
          tag: "Central Logistics Hub",
          title: "Smart Inventory & Dispatch",
          desc: "Daily 2,000+ orders ka barcode-controlled automated packaging.",
          icon: "Boxes",
          images: [
            {
              url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
              caption: "Warehouse Rack",
              isActive: true
            }
          ]
        },
        {
          tag: "Headquarters & Labs",
          title: "Tech & Customer Support HQ",
          desc: "Customer grievances, engineering and design operations floor.",
          icon: "Building2",
          images: [
            {
              url: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80",
              caption: "Support Wing",
              isActive: true
            }
          ]
        }
      ],
      founder: {
        name: "Rahul Sharma",
        designation: "Founder & CEO",
        quote: "Customer ka bharosa kisi bhi marketing campaign se badhkar hai.",
        visionStory:
          "Jab humne KHASTORE shuru kiya tha, humara ek hi principle tha: jo item user ko mile, wo 100% genuine ho aur reasonable price me mile.",
        images: [
          {
            url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
            isActive: true
          }
        ],
        socials: {
          linkedin: "#",
          twitter: "#",
          email: "founder@khastore.com"
        },
        isEnabled: true
      },
      pillars: [
        {
          icon: "ShieldCheck",
          title: "100% Genuine Brands",
          color: "from-blue-500 to-cyan-500",
          desc: "Direct OEM tie-ups bina kisi middleman ya fake products ke risk ke."
        },
        {
          icon: "Truck",
          title: "Lightning Fast Dispatch",
          color: "from-pink-500 to-rose-500",
          desc: "Advanced packaging aur 24 ghante ke andar direct courier partner handover."
        },
        {
          icon: "Award",
          title: "Multi-Tier Quality Check",
          color: "from-amber-500 to-orange-500",
          desc: "Har product dispatch hone se pehle 4 physical quality checks se guzarta hai."
        },
        {
          icon: "HeartHandshake",
          title: "Customer-First Support",
          color: "from-violet-500 to-indigo-500",
          desc: "Hassle-free 7-day replacements aur instant UPI return resolution."
        }
      ],
      milestones: [
        { year: "2023", title: "The Inception", desc: "Lucknow me ek single room workspace aur 50 curated items se safar shuru kiya." },
        { year: "2024", title: "Direct-to-Consumer", desc: "10,000+ satisfied customers tak express delivery network establish kiya." },
        { year: "2025", title: "High-Tech Fulfilment", desc: "Automated warehouse & quality inspection hub setup kiya." },
        { year: "2026", title: "National Footprint", desc: "50,000+ active monthly buyers aur pan-India express network coverage." }
      ],
      cta: {
        heading: "Experience the Quality Yourself",
        description: "Latest gadgets, curated fashion aur reliable lifestyle items direct warehouse price par order karein.",
        buttonText: "Start Shopping Now",
        buttonLink: "/products",
        isEnabled: true
      }
    });
  }
  return config;
};

// 1. GET Configuration (Public)
exports.getAboutConfig = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. UPDATE General Sections (Hero, Founder text, CTA)
exports.updateGeneralSections = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    if (req.body.hero) config.hero = { ...config.hero, ...req.body.hero };
    if (req.body.founder) config.founder = { ...config.founder, ...req.body.founder };
    if (req.body.cta) config.cta = { ...config.cta, ...req.body.cta };

    await config.save();
    res.status(200).json({ success: true, message: "General content updated", data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. STATS CRUD
exports.addStat = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    config.stats.push(req.body);
    await config.save();
    res.status(201).json({ success: true, message: "Stat added", data: config.stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStat = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    const stat = config.stats.id(req.params.statId);
    if (!stat) return res.status(404).json({ success: false, message: "Stat not found" });

    Object.assign(stat, req.body);
    await config.save();
    res.status(200).json({ success: true, message: "Stat updated", data: config.stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStat = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    config.stats.pull({ _id: req.params.statId });
    await config.save();
    res.status(200).json({ success: true, message: "Stat deleted", data: config.stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. INFRASTRUCTURE & MULTI-IMAGE MANAGEMENT
exports.addInfraItem = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    config.infrastructure.push(req.body);
    await config.save();
    res.status(201).json({ success: true, message: "Infrastructure item added", data: config.infrastructure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInfraItem = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    const infra = config.infrastructure.id(req.params.infraId);
    if (!infra) return res.status(404).json({ success: false, message: "Item not found" });

    Object.assign(infra, req.body);
    await config.save();
    res.status(200).json({ success: true, message: "Infrastructure item updated", data: config.infrastructure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteInfraItem = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    config.infrastructure.pull({ _id: req.params.infraId });
    await config.save();
    res.status(200).json({ success: true, message: "Item deleted", data: config.infrastructure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle active image inside Infrastructure
exports.toggleInfraImageActive = async (req, res) => {
  try {
    const { infraId, imageIndex } = req.params;
    const config = await getOrCreateAboutConfig();
    const infra = config.infrastructure.id(infraId);
    if (!infra || !infra.images[imageIndex]) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    infra.images[imageIndex].isActive = !infra.images[imageIndex].isActive;
    await config.save();
    res.status(200).json({ success: true, message: "Image active status toggled", data: infra });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. PILLARS CRUD
exports.addPillar = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    config.pillars.push(req.body);
    await config.save();
    res.status(201).json({ success: true, message: "Pillar added", data: config.pillars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePillar = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    const pillar = config.pillars.id(req.params.pillarId);
    if (!pillar) return res.status(404).json({ success: false, message: "Pillar not found" });

    Object.assign(pillar, req.body);
    await config.save();
    res.status(200).json({ success: true, message: "Pillar updated", data: config.pillars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePillar = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    config.pillars.pull({ _id: req.params.pillarId });
    await config.save();
    res.status(200).json({ success: true, message: "Pillar deleted", data: config.pillars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. MILESTONES CRUD
exports.addMilestone = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    config.milestones.push(req.body);
    await config.save();
    res.status(201).json({ success: true, message: "Milestone added", data: config.milestones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    const milestone = config.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: "Milestone not found" });

    Object.assign(milestone, req.body);
    await config.save();
    res.status(200).json({ success: true, message: "Milestone updated", data: config.milestones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMilestone = async (req, res) => {
  try {
    const config = await getOrCreateAboutConfig();
    config.milestones.pull({ _id: req.params.milestoneId });
    await config.save();
    res.status(200).json({ success: true, message: "Milestone deleted", data: config.milestones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};