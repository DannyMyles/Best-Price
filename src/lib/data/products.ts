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
    category: "ipad",
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
    category: "ipad",
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
    category: "ipad",
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
    category: "ipad",
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
    category: "ipad",
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
    category: "ipad",
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
    category: "macbook-air",
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
    category: "macbook",
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
    category: "macbook",
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
    category: "macbook",
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
    category: "macbook",
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
    category: "macbook-pro",
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
    category: "macbook-pro",
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
    category: "macbook-pro",
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
    category: "macbook-pro",
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
    category: "macbook-pro",
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
    category: "imac",
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
    category: "imac",
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
    category: "imac",
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
    category: "imac",
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
    category: "surface",
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
    category: "surface",
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
