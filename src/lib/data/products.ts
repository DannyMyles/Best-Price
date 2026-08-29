import { Product } from "@/lib/types";
import { slugify } from "@/lib/format";

function make(p: Omit<Product, "slug">): Product {
  return { ...p, slug: slugify(`${p.name}-${p.sku}`) };
}

export const products: Product[] = [
  // iPad
  make({
    sku: "MD7F4AB/A",
    name: 'iPad Wi-Fi + Cellular 128GB Silver A16',
    category: "tablets",
    price: 79999,
    color: "Silver",
    inStock: true,
    badge: "New",
    images: ["https://images.unsplash.com/photo-1524600870520-229b3f2cc406?q=80&w=1600&auto=format&fit=crop"],
    description:
      "The everyday iPad, now with the A16 chip. Lightweight, fast, and ready for cellular connectivity on the go.",
    specs: [
      { label: "Chip", value: "Apple A16" },
      { label: "Storage", value: "128GB" },
      { label: "Connectivity", value: "Wi-Fi + Cellular" },
      { label: "Color", value: "Silver" },
    ],
  }),
  make({
    sku: "MCFV4AB/A",
    name: 'iPad Air 11" M3 Wi-Fi + Cellular 128GB',
    category: "tablets",
    price: 109999,
    color: "Grey",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1679759799183-8899c0d67b43?q=80&w=1600&auto=format&fit=crop"],
    description:
      "iPad Air with the M3 chip delivers a huge leap in performance for creative work, all in a thin, light design.",
    specs: [
      { label: "Chip", value: "Apple M3" },
      { label: "Display", value: '11" Liquid Retina' },
      { label: "Storage", value: "128GB" },
      { label: "Connectivity", value: "Wi-Fi + Cellular" },
      { label: "Color", value: "Grey" },
    ],
  }),
  make({
    sku: "MCG34AB/A",
    name: 'iPad Air 11" M3 Wi-Fi + Cellular 256GB',
    category: "tablets",
    price: 129999,
    color: "Purple",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1585789574212-15ee78d0e7d9?q=80&w=1600&auto=format&fit=crop"],
    description:
      "More storage for photos, apps and projects, with the same powerful M3 performance in a striking purple finish.",
    specs: [
      { label: "Chip", value: "Apple M3" },
      { label: "Display", value: '11" Liquid Retina' },
      { label: "Storage", value: "256GB" },
      { label: "Connectivity", value: "Wi-Fi + Cellular" },
      { label: "Color", value: "Purple" },
    ],
  }),
  make({
    sku: "ME7W4LL/A",
    name: 'iPad Pro 13" M5 Wi-Fi + Cellular 256GB',
    category: "tablets",
    price: 184999,
    inStock: true,
    badge: "Best Seller",
    images: ["https://images.unsplash.com/photo-1565443492615-7e3d2324d925?q=80&w=1600&auto=format&fit=crop"],
    description:
      "The ultimate iPad experience. The M5 chip and stunning 13-inch display make this the most capable iPad ever.",
    specs: [
      { label: "Chip", value: "Apple M5" },
      { label: "Display", value: '13" Ultra Retina XDR' },
      { label: "Storage", value: "256GB" },
      { label: "Connectivity", value: "Wi-Fi + Cellular" },
    ],
  }),
  make({
    sku: "ME2N4LL/A",
    name: 'iPad Pro 11" M5 Wi-Fi + Cellular 256GB',
    category: "tablets",
    price: 159999,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1524600870520-229b3f2cc406?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Pro-level performance in a compact 11-inch design, powered by the all-new M5 chip.",
    specs: [
      { label: "Chip", value: "Apple M5" },
      { label: "Display", value: '11" Ultra Retina XDR' },
      { label: "Storage", value: "256GB" },
      { label: "Connectivity", value: "Wi-Fi + Cellular" },
    ],
  }),
  make({
    sku: "ME2Q4ALL/A",
    name: 'iPad Pro 11" M5 Wi-Fi + Cellular 512GB',
    category: "tablets",
    price: 214999,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1679759799183-8899c0d67b43?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Maximum storage on the 11-inch iPad Pro, for pro workflows that demand more space and speed.",
    specs: [
      { label: "Chip", value: "Apple M5" },
      { label: "Display", value: '11" Ultra Retina XDR' },
      { label: "Storage", value: "512GB" },
      { label: "Connectivity", value: "Wi-Fi + Cellular" },
    ],
  }),

  // MacBook Air
  make({
    sku: "MC6U4B/A",
    name: "MacBook Air 13\" M4 16GB/512GB Sky Blue",
    category: "laptops",
    price: 164999,
    color: "Sky Blue",
    inStock: true,
    badge: "Best Seller",
    images: ["https://images.unsplash.com/photo-1628115367019-607aedaee62a?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Strikingly thin and fast, the M4 MacBook Air is built for all-day battery life and effortless portability.",
    specs: [
      { label: "Chip", value: "Apple M4" },
      { label: "Memory", value: "16GB" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Display", value: '13.6" Liquid Retina' },
      { label: "Color", value: "Sky Blue" },
    ],
  }),

  // MacBook (Neo line)
  make({
    sku: "MHFC4B/A",
    name: 'MacBook 13" 8GB/512GB Silver',
    category: "laptops",
    price: 119999,
    color: "Silver",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1558625628-8b7292e0c335?q=80&w=1600&auto=format&fit=crop"],
    description:
      "A dependable everyday laptop with plenty of storage for photos, files and applications.",
    specs: [
      { label: "Memory", value: "8GB" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Display", value: '13"' },
      { label: "Color", value: "Silver" },
    ],
  }),
  make({
    sku: "MHFD4B/A",
    name: 'MacBook 13" 8GB/256GB Citrus',
    category: "laptops",
    price: 94999,
    color: "Citrus",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1620116377917-3998e4937a3a?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Light, colorful and capable — a great entry point for browsing, study and everyday productivity.",
    specs: [
      { label: "Memory", value: "8GB" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Display", value: '13"' },
      { label: "Color", value: "Citrus" },
    ],
  }),
  make({
    sku: "MHFA4B/A",
    name: 'MacBook 13" 8GB/256GB Silver',
    category: "laptops",
    price: 94999,
    color: "Silver",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1529405147636-6aaa3abe9536?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Light, colorful and capable — a great entry point for browsing, study and everyday productivity.",
    specs: [
      { label: "Memory", value: "8GB" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Display", value: '13"' },
      { label: "Color", value: "Silver" },
    ],
  }),
  make({
    sku: "MHFF4B/A",
    name: 'MacBook 13" 8GB/256GB Indigo',
    category: "laptops",
    price: 94999,
    color: "Indigo",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1558625628-8b7292e0c335?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Light, colorful and capable — a great entry point for browsing, study and everyday productivity.",
    specs: [
      { label: "Memory", value: "8GB" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Display", value: '13"' },
      { label: "Color", value: "Indigo" },
    ],
  }),

  // MacBook Pro
  make({
    sku: "MDE14B/A",
    name: 'MacBook Pro 14" M5 16GB/1TB Space Black',
    category: "laptops",
    price: 239999,
    color: "Space Black",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1465418031253-26bca286214c?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Pro performance with the new M5 chip, a stunning Liquid Retina XDR display and all-day battery life.",
    specs: [
      { label: "Chip", value: "Apple M5" },
      { label: "Memory", value: "16GB" },
      { label: "Storage", value: "1TB SSD" },
      { label: "Display", value: '14" Liquid Retina XDR' },
      { label: "Color", value: "Space Black" },
    ],
  }),
  make({
    sku: "MDE54B/A",
    name: 'MacBook Pro 14" M5 16GB/1TB Silver',
    category: "laptops",
    price: 239999,
    color: "Silver",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1531938716357-224c16b5ace3?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Pro performance with the new M5 chip, a stunning Liquid Retina XDR display and all-day battery life.",
    specs: [
      { label: "Chip", value: "Apple M5" },
      { label: "Memory", value: "16GB" },
      { label: "Storage", value: "1TB SSD" },
      { label: "Display", value: '14" Liquid Retina XDR' },
      { label: "Color", value: "Silver" },
    ],
  }),
  make({
    sku: "MGDR4B/A",
    name: 'MacBook Pro 14" M5 Pro 24GB/1TB Space Black',
    category: "laptops",
    price: 314999,
    color: "Space Black",
    inStock: true,
    badge: "Best Seller",
    images: ["https://images.unsplash.com/photo-1733325021308-1c114fbef778?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Elevated performance with the M5 Pro chip — built for demanding creative and professional workflows.",
    specs: [
      { label: "Chip", value: "Apple M5 Pro" },
      { label: "Memory", value: "24GB" },
      { label: "Storage", value: "1TB SSD" },
      { label: "Display", value: '14" Liquid Retina XDR' },
      { label: "Color", value: "Space Black" },
    ],
  }),
  make({
    sku: "MDE04B/A",
    name: 'MacBook Pro 14" M5 16GB/512GB Space Black',
    category: "laptops",
    price: 224999,
    color: "Space Black",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1465418031253-26bca286214c?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Pro performance with the new M5 chip in a 512GB configuration, ready for work anywhere.",
    specs: [
      { label: "Chip", value: "Apple M5" },
      { label: "Memory", value: "16GB" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Display", value: '14" Liquid Retina XDR' },
      { label: "Color", value: "Space Black" },
    ],
  }),
  make({
    sku: "MGDN4B/A",
    name: 'MacBook Pro 14" M5 Pro 24GB/1TB Silver',
    category: "laptops",
    price: 314999,
    color: "Silver",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1531938716357-224c16b5ace3?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Elevated performance with the M5 Pro chip — built for demanding creative and professional workflows.",
    specs: [
      { label: "Chip", value: "Apple M5 Pro" },
      { label: "Memory", value: "24GB" },
      { label: "Storage", value: "1TB SSD" },
      { label: "Display", value: '14" Liquid Retina XDR' },
      { label: "Color", value: "Silver" },
    ],
  }),

  // iMac
  make({
    sku: "MWUC3B/A",
    name: '24" iMac 8-Core M4 16GB/256GB Silver',
    category: "desktops",
    price: 199999,
    color: "Silver",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1601919263076-4a6a8514c461?q=80&w=1600&auto=format&fit=crop"],
    description:
      "A stunning all-in-one desktop powered by the M4 chip, with a vivid 24-inch 4.5K Retina display.",
    specs: [
      { label: "Chip", value: "Apple M4 (8-Core)" },
      { label: "Memory", value: "16GB" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Display", value: '24" 4.5K Retina' },
      { label: "Color", value: "Silver" },
    ],
  }),
  make({
    sku: "MWUV3B/A",
    name: '24" iMac 10-Core M4 16GB/512GB Silver',
    category: "desktops",
    price: 249999,
    color: "Silver",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1483388147740-e5c70536042e?q=80&w=1600&auto=format&fit=crop"],
    description:
      "More GPU cores and more storage for creative work, gaming and everyday multitasking.",
    specs: [
      { label: "Chip", value: "Apple M4 (10-Core)" },
      { label: "Memory", value: "16GB" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Display", value: '24" 4.5K Retina' },
      { label: "Color", value: "Silver" },
    ],
  }),
  make({
    sku: "MWV13B/A",
    name: '24" iMac 10-Core M4 16GB/256GB Blue',
    category: "desktops",
    price: 219999,
    color: "Blue",
    inStock: true,
    badge: "New",
    images: ["https://images.unsplash.com/photo-1495521939206-a217db9df264?q=80&w=1600&auto=format&fit=crop"],
    description:
      "A striking blue finish paired with the 10-core M4 chip for smooth, vibrant everyday computing.",
    specs: [
      { label: "Chip", value: "Apple M4 (10-Core)" },
      { label: "Memory", value: "16GB" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Display", value: '24" 4.5K Retina' },
      { label: "Color", value: "Blue" },
    ],
  }),
  make({
    sku: "MD2T4B/A",
    name: '24" iMac 10-Core M4 24GB/512GB Blue',
    category: "desktops",
    price: 284999,
    color: "Blue",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1601919263076-4a6a8514c461?q=80&w=1600&auto=format&fit=crop"],
    description:
      "The top-tier 24-inch iMac configuration — more memory and storage in a beautiful blue finish.",
    specs: [
      { label: "Chip", value: "Apple M4 (10-Core)" },
      { label: "Memory", value: "24GB" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Display", value: '24" 4.5K Retina' },
      { label: "Color", value: "Blue" },
    ],
  }),

  // Microsoft Surface
  make({
    sku: "SFP9-I7-16-256",
    name: "Surface Pro 9 Core i7 12th Gen 16GB/256GB",
    category: "laptops",
    price: 164999,
    color: "Graphite",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1665686310429-ee43624978fa?q=80&w=1600&auto=format&fit=crop"],
    description:
      "A powerful 2-in-1 Windows device — laptop performance with tablet flexibility, built for hybrid work.",
    specs: [
      { label: "Processor", value: "Intel Core i7, 12th Gen" },
      { label: "Memory", value: "16GB" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Graphics", value: "Intel Iris Xe" },
    ],
  }),
  make({
    sku: "SFP-SIGN-KB",
    name: "Surface Pro Signature Keyboard",
    category: "accessories",
    price: null,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1600&auto=format&fit=crop"],
    description:
      "A full keyboard with trackpad that attaches magnetically to Surface Pro for a true laptop feel.",
    specs: [
      { label: "Compatibility", value: "Surface Pro 9 / 10 / 11" },
      { label: "Connection", value: "Magnetic, wireless" },
    ],
  }),

  // Accessories
  make({
    sku: "MUF82ZM/A",
    name: "Multiport Adapter",
    category: "accessories",
    price: null,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Connect USB, HDMI and more to your Mac or iPad with this compact, reliable adapter.",
    specs: [{ label: "Ports", value: "USB-C, USB-A, HDMI" }],
  }),
  make({
    sku: "MX2D32M/A",
    name: "Apple Pencil Pro",
    category: "accessories",
    price: null,
    inStock: true,
    badge: "New",
    images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Precision, tilt and pressure sensitivity with haptic feedback for a natural drawing and writing feel.",
    specs: [
      { label: "Compatibility", value: "iPad Pro, iPad Air" },
      { label: "Charging", value: "Magnetic, wireless" },
    ],
  }),
  make({
    sku: "MK2E3ZM/A",
    name: "Magic Mouse — Silver",
    category: "accessories",
    price: null,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1630515787921-0086c7cca853?q=80&w=1600&auto=format&fit=crop"],
    description:
      "A wireless, rechargeable mouse with a Multi-Touch surface for effortless gestures.",
    specs: [{ label: "Connection", value: "Bluetooth" }],
  }),
  make({
    sku: "MUVT3B/A",
    name: "20W USB-C Power Adapter",
    category: "accessories",
    price: null,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Fast, efficient charging for iPhone, iPad and other USB-C compatible devices.",
    specs: [{ label: "Output", value: "20W USB-C Power Delivery" }],
  }),
  make({
    sku: "MUQ93ZM/A",
    name: "USB-C to Lightning Cable",
    category: "accessories",
    price: null,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1600&auto=format&fit=crop"],
    description: "Fast charging and sync cable for Lightning-equipped devices.",
    specs: [{ label: "Length", value: "1m" }],
  }),

  // Phones
  make({
    sku: "SM-A556-256",
    name: "Samsung Galaxy A55 5G 256GB",
    category: "phones",
    price: 55999,
    color: "Awesome Navy",
    inStock: true,
    badge: "Best Seller",
    images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1600&auto=format&fit=crop"],
    description:
      "A bright 6.6\" 120Hz Super AMOLED display, 50MP OIS camera and all-day 5000mAh battery.",
    specs: [
      { label: "Display", value: '6.6" FHD+ 120Hz AMOLED' },
      { label: "Storage", value: "256GB (+ microSD)" },
      { label: "RAM", value: "8GB" },
      { label: "Battery", value: "5000mAh" },
      { label: "Network", value: "5G" },
    ],
  }),
  make({
    sku: "IP15-128-BLK",
    name: "Apple iPhone 15 128GB",
    category: "phones",
    price: 129999,
    color: "Black",
    inStock: true,
    featured: true,
    images: ["https://images.unsplash.com/photo-1592286927505-1def25e5c0f6?q=80&w=1600&auto=format&fit=crop"],
    description:
      "The A16 Bionic chip, a 48MP main camera with 2x Telephoto, and USB-C — in a durable colour-infused glass design.",
    specs: [
      { label: "Chip", value: "A16 Bionic" },
      { label: "Display", value: '6.1" Super Retina XDR' },
      { label: "Storage", value: "128GB" },
      { label: "Camera", value: "48MP main + 12MP ultra-wide" },
      { label: "Port", value: "USB-C" },
    ],
  }),
  make({
    sku: "PX8-128-OBS",
    name: "Google Pixel 8 128GB",
    category: "phones",
    price: 94999,
    compareAtPrice: 109999,
    color: "Obsidian",
    inStock: true,
    badge: "Sale",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Google Tensor G3, an outstanding 50MP camera with Magic Editor, and 7 years of OS updates.",
    specs: [
      { label: "Chip", value: "Google Tensor G3" },
      { label: "Display", value: '6.2" OLED 120Hz' },
      { label: "Storage", value: "128GB" },
      { label: "RAM", value: "8GB" },
    ],
  }),
  make({
    sku: "RN13P-256",
    name: "Xiaomi Redmi Note 13 Pro 256GB",
    category: "phones",
    price: 33999,
    color: "Midnight Black",
    inStock: true,
    stockCount: 3,
    images: ["https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=1600&auto=format&fit=crop"],
    description:
      "A 200MP camera, 120Hz AMOLED display and 67W turbo charging at a hard-to-beat price.",
    specs: [
      { label: "Display", value: '6.67" 120Hz AMOLED' },
      { label: "Camera", value: "200MP OIS" },
      { label: "Storage", value: "256GB" },
      { label: "Charging", value: "67W" },
    ],
  }),
  make({
    sku: "S24U-512-TIT",
    name: "Samsung Galaxy S24 Ultra 512GB",
    category: "phones",
    price: 214999,
    color: "Titanium Grey",
    inStock: true,
    badge: "New",
    images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Built-in S Pen, a 200MP camera system with 5x optical zoom, and a titanium frame with Galaxy AI.",
    specs: [
      { label: "Display", value: '6.8" QHD+ 120Hz' },
      { label: "Storage", value: "512GB" },
      { label: "RAM", value: "12GB" },
      { label: "Zoom", value: "5x optical / 100x Space Zoom" },
    ],
  }),

  // Cameras
  make({
    sku: "CAN-M50II-KIT",
    name: "Canon EOS M50 Mark II Mirrorless Kit (15-45mm)",
    category: "cameras",
    price: 75999,
    inStock: true,
    badge: "Best Seller",
    featured: true,
    images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1600&auto=format&fit=crop"],
    description:
      "A 24.1MP APS-C sensor, vari-angle touchscreen and 4K video — a favourite for creators and vloggers.",
    specs: [
      { label: "Sensor", value: "24.1MP APS-C CMOS" },
      { label: "Video", value: "4K24 / 1080p60" },
      { label: "Screen", value: "Vari-angle touchscreen" },
      { label: "Lens mount", value: "Canon EF-M" },
      { label: "Kit lens", value: "EF-M 15-45mm IS STM" },
    ],
  }),
  make({
    sku: "NIK-Z50-KIT",
    name: "Nikon Z50 Mirrorless Kit (16-50mm)",
    category: "cameras",
    price: 109999,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop"],
    description:
      "20.9MP DX-format sensor, 11 fps burst and 4K UHD video in a compact, weather-sealed body.",
    specs: [
      { label: "Sensor", value: "20.9MP DX CMOS" },
      { label: "Video", value: "4K UHD 30p" },
      { label: "Burst", value: "11 fps" },
      { label: "Lens mount", value: "Nikon Z" },
    ],
  }),
  make({
    sku: "SNY-ZVE10-KIT",
    name: "Sony ZV-E10 Vlogging Camera (16-50mm)",
    category: "cameras",
    price: 94999,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Made for content: 24.2MP sensor, side-flip screen, Product Showcase and a directional 3-capsule mic.",
    specs: [
      { label: "Sensor", value: "24.2MP APS-C Exmor" },
      { label: "Video", value: "4K (no crop) / S&Q" },
      { label: "Screen", value: "Side-flip vari-angle" },
      { label: "Lens mount", value: "Sony E" },
    ],
  }),
  make({
    sku: "NIK-B500",
    name: "Nikon COOLPIX B500 Digital Camera",
    category: "cameras",
    price: 39999,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1606980625114-40300a2e5b2e?q=80&w=1600&auto=format&fit=crop"],
    description:
      "40x optical zoom (80x Dynamic Fine), tilting screen and Snapbridge Bluetooth — runs on AA batteries.",
    specs: [
      { label: "Zoom", value: "40x optical (1600mm equiv.)" },
      { label: "Sensor", value: "16MP CMOS" },
      { label: "Video", value: "1080p Full HD" },
      { label: "Power", value: "4x AA batteries" },
    ],
  }),

  // Camera Lenses
  make({
    sku: "CAN-EF50-18",
    name: "Canon EF 50mm f/1.8 STM Lens",
    category: "lenses",
    price: 18999,
    inStock: true,
    badge: "Best Seller",
    images: ["https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=1600&auto=format&fit=crop"],
    description:
      "The classic 'nifty fifty' — bright f/1.8 aperture for portraits and low light, with quiet STM focusing.",
    specs: [
      { label: "Focal length", value: "50mm" },
      { label: "Aperture", value: "f/1.8" },
      { label: "Mount", value: "Canon EF (full-frame)" },
      { label: "Filter", value: "49mm" },
    ],
  }),
  make({
    sku: "NIK-AFP-70300",
    name: "Nikon AF-P DX NIKKOR 70-300mm f/4.5-6.3G ED",
    category: "lenses",
    price: 34999,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Lightweight telephoto zoom with Vibration Reduction — reach for wildlife, sports and events.",
    specs: [
      { label: "Focal length", value: "70-300mm" },
      { label: "Aperture", value: "f/4.5-6.3" },
      { label: "Mount", value: "Nikon F (DX)" },
      { label: "Stabilisation", value: "VR" },
    ],
  }),
  make({
    sku: "SNY-E55210",
    name: "Sony E 55-210mm f/4.5-6.3 OSS Lens",
    category: "lenses",
    price: 32999,
    inStock: true,
    stockCount: 2,
    images: ["https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=1600&auto=format&fit=crop"],
    description:
      "A compact E-mount telephoto zoom with Optical SteadyShot — a natural next lens after your kit lens.",
    specs: [
      { label: "Focal length", value: "55-210mm" },
      { label: "Aperture", value: "f/4.5-6.3" },
      { label: "Mount", value: "Sony E (APS-C)" },
      { label: "Stabilisation", value: "OSS" },
    ],
  }),

  // TVs
  make({
    sku: "SNY-55X75K",
    name: 'Sony 55" X75K 4K UHD Google TV',
    category: "tvs",
    price: 84999,
    inStock: true,
    badge: "Best Seller",
    featured: true,
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1600&auto=format&fit=crop"],
    description:
      "4K HDR with the X1 processor, Google TV, Chromecast and hands-free voice search.",
    specs: [
      { label: "Screen size", value: '55"' },
      { label: "Resolution", value: "4K UHD (3840×2160)" },
      { label: "Platform", value: "Google TV" },
      { label: "HDR", value: "HDR10 / HLG" },
    ],
  }),
  make({
    sku: "SNY-50X75K",
    name: 'Sony 50" X75K 4K UHD Google TV',
    category: "tvs",
    price: 75999,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1461151304267-38535e780c79?q=80&w=1600&auto=format&fit=crop"],
    description:
      "The same 4K HDR Google TV experience in a 50-inch size — great for living rooms and bedrooms.",
    specs: [
      { label: "Screen size", value: '50"' },
      { label: "Resolution", value: "4K UHD" },
      { label: "Platform", value: "Google TV" },
      { label: "Refresh", value: "60Hz" },
    ],
  }),
  make({
    sku: "HIS-43A6K",
    name: 'Hisense 43" A6K 4K UHD Smart TV',
    category: "tvs",
    price: 42999,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1467293622093-9f15c96be70f?q=80&w=1600&auto=format&fit=crop"],
    description:
      "4K UHD with Dolby Vision & HDR10, VIDAA smart platform and Game Mode Plus — excellent value.",
    specs: [
      { label: "Screen size", value: '43"' },
      { label: "Resolution", value: "4K UHD" },
      { label: "Platform", value: "VIDAA U6" },
      { label: "HDR", value: "Dolby Vision / HDR10" },
    ],
  }),
  make({
    sku: "HIS-65A6K",
    name: 'Hisense 65" A6K 4K UHD Smart TV',
    category: "tvs",
    price: 84999,
    inStock: true,
    images: ["https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=1600&auto=format&fit=crop"],
    description:
      "A big-screen 65-inch 4K experience with Dolby Vision, DTS Virtual:X and bezel-less design.",
    specs: [
      { label: "Screen size", value: '65"' },
      { label: "Resolution", value: "4K UHD" },
      { label: "Platform", value: "VIDAA U6" },
      { label: "Audio", value: "DTS Virtual:X" },
    ],
  }),
  make({
    sku: "SNY-65X80L",
    name: 'Sony 65" X80L 4K UHD Google TV',
    category: "tvs",
    price: 134999,
    inStock: true,
    badge: "New",
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1600&auto=format&fit=crop"],
    description:
      "4K HDR Processor X1, Triluminos Pro colour and Google TV — a premium 65-inch centrepiece.",
    specs: [
      { label: "Screen size", value: '65"' },
      { label: "Resolution", value: "4K UHD" },
      { label: "Processor", value: "4K HDR Processor X1" },
      { label: "Platform", value: "Google TV" },
    ],
  }),

  // Audio & Home Theatre
  make({
    sku: "SNY-HTS400",
    name: "Sony HT-S400 2.1ch Soundbar with Wireless Subwoofer",
    category: "audio",
    price: 34999,
    inStock: true,
    badge: "Best Seller",
    images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1600&auto=format&fit=crop"],
    description:
      "330W of punchy 2.1-channel sound with a wireless subwoofer and S-Force Pro Front Surround.",
    specs: [
      { label: "Channels", value: "2.1ch" },
      { label: "Power", value: "330W" },
      { label: "Subwoofer", value: "Wireless" },
      { label: "Connectivity", value: "HDMI ARC, Bluetooth, Optical" },
    ],
  }),
  make({
    sku: "JBL-FLIP6",
    name: "JBL Flip 6 Portable Bluetooth Speaker",
    category: "audio",
    price: 16999,
    color: "Black",
    inStock: true,
    featured: true,
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Bold JBL Original Pro Sound, IP67 waterproof and dustproof, with 12 hours of playtime.",
    specs: [
      { label: "Battery life", value: "12 hours" },
      { label: "Rating", value: "IP67 waterproof + dustproof" },
      { label: "Connectivity", value: "Bluetooth 5.1" },
    ],
  }),
  make({
    sku: "SNY-WHCH720N",
    name: "Sony WH-CH720N Wireless Noise-Cancelling Headphones",
    category: "audio",
    price: 21999,
    compareAtPrice: 26999,
    color: "Black",
    inStock: true,
    badge: "Sale",
    images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Sony's lightest noise-cancelling headphones — Integrated Processor V1, multipoint and 35hr battery.",
    specs: [
      { label: "Type", value: "Over-ear, wireless" },
      { label: "ANC", value: "Yes (Processor V1)" },
      { label: "Battery life", value: "35 hours" },
      { label: "Weight", value: "192g" },
    ],
  }),
  make({
    sku: "JBL-T520BT",
    name: "JBL Tune 520BT Wireless On-Ear Headphones",
    category: "audio",
    price: 7999,
    color: "Blue",
    inStock: true,
    images: ["https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1600&auto=format&fit=crop"],
    description:
      "JBL Pure Bass Sound, a massive 57-hour battery and Speed Charge — everyday wireless on a budget.",
    specs: [
      { label: "Type", value: "On-ear, wireless" },
      { label: "Battery life", value: "57 hours" },
      { label: "Charge", value: "Speed Charge (5 min = 3 hr)" },
    ],
  }),
  make({
    sku: "SNY-SRSXB100",
    name: "Sony SRS-XB100 Portable Bluetooth Speaker",
    category: "audio",
    price: 6499,
    color: "Black",
    inStock: true,
    stockCount: 3,
    images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1600&auto=format&fit=crop"],
    description:
      "Pocket-sized sound with a built-in strap, 16-hour battery and IP67 water and dust resistance.",
    specs: [
      { label: "Battery life", value: "16 hours" },
      { label: "Rating", value: "IP67" },
      { label: "Extras", value: "Detachable strap, stereo pairing" },
    ],
  }),
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string) {
  return products.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter((p) => p.category === product.category && p.sku !== product.sku)
    .slice(0, limit);
}
