"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import AdminLogin from "./AdminLogin";
import UsersPanel from "./UsersPanel";
import TableQRStudio from "./TableQRStudio";
import RevenueAnalytics from "./RevenueAnalytics";
import { formatDriveImageUrl } from "@/lib/imageUtils";

// ─────────────────────────────────────────────
// SVG ICON SET
// ─────────────────────────────────────────────
const Icon = {
  Grid: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Orders: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Tables: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18" />
    </svg>
  ),
  TableConfig: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  QrCode: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  ),
  Products: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Trending: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Delete: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Flame: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-3.5 h-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Skull: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2A9 9 0 003 11c0 3.25 1.72 6.09 4.3 7.62V20a1 1 0 001 1h1a1 1 0 001-1v-1h4v1a1 1 0 001 1h1a1 1 0 001-1v-1.38C19.28 17.09 21 14.25 21 11A9 9 0 0012 2zm-3.5 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm7 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM9.5 16a.5.5 0 010-1h5a.5.5 0 010 1h-5z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Revenue: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Toggle: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    </svg>
  ),
  Tags: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Billing: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const INITIAL_ORDERS = [
  { id: "RIP-1042", table: 3, items: [{ name: "Phantom Dark Roast Espresso", qty: 2 }, { name: "Midnight Charcoal Croissant", qty: 1 }], total: 460, status: "preparing", time: "11:02 AM", waiter: "Arjun" },
  { id: "RIP-1043", table: 7, items: [{ name: "Skeleton Club Sandwich", qty: 1 }, { name: "Gothic Caramel Macchiato", qty: 1 }], total: 455, status: "received", time: "11:08 AM", waiter: "Priya" },
  { id: "RIP-1044", table: 1, items: [{ name: "Witch's Brew Cold Coffee", qty: 3 }, { name: "Haunted Truffle Fries", qty: 1 }], total: 730, status: "ready", time: "10:52 AM", waiter: "Kiran" },
  { id: "RIP-1045", table: 5, items: [{ name: "Graveyard Matcha Latte", qty: 2 }], total: 420, status: "served", time: "10:40 AM", waiter: "Meena" },
  { id: "RIP-1046", table: 9, items: [{ name: "Vampire Velvet Cake Slice", qty: 1 }, { name: "Blood-Orange Iced Hibiscus", qty: 2 }], total: 550, status: "preparing", time: "11:15 AM", waiter: "Ravi" },
  { id: "RIP-1047", table: 2, items: [{ name: "Shadow Smoked Avocado Toast", qty: 1 }], total: 240, status: "received", time: "11:22 AM", waiter: "Arjun" },
  { id: "RIP-1048", table: 4, items: [{ name: "Phantom Dark Roast Espresso", qty: 1 }, { name: "Skeleton Club Sandwich", qty: 2 }], total: 660, status: "served", time: "10:30 AM", waiter: "Priya" },
];

const ORDER_STATUS_CONFIG = {
  pending: { label: "Received", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30", dot: "bg-blue-400" },
  received: { label: "Received", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30", dot: "bg-blue-400" },
  preparing: { label: "Preparing", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30", dot: "bg-amber-400 animate-pulse" },
  ready: { label: "Ready", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30", dot: "bg-emerald-400" },
  served: { label: "Served", color: "text-slate-400", bg: "bg-slate-400/10 border-slate-400/30", dot: "bg-slate-400" },
  cancelled: { label: "Cancelled", color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/30", dot: "bg-rose-500" },
};

const TABLE_STATUS_CONFIG = {
  available: { label: "Available", gradient: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/40", dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/10" },
  occupied: { label: "Occupied", gradient: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/40", dot: "bg-amber-400 animate-pulse", text: "text-amber-400", bg: "bg-amber-400/10" },
  served: { label: "All Served", gradient: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/40", dot: "bg-blue-400", text: "text-blue-400", bg: "bg-blue-400/10" },
};

const DIETARY_CONFIG = {
  veg: { label: "Veg", color: "text-emerald-400", bg: "bg-emerald-400/15 border-emerald-400/40" },
  "non-veg": { label: "Non-Veg", color: "text-rose-400", bg: "bg-rose-400/15 border-rose-400/40" },
  vegan: { label: "Vegan", color: "text-teal-400", bg: "bg-teal-400/15 border-teal-400/40" },
};

// Helper to map Prisma order to admin order shape
function mapOrderToAdmin(order) {
  const rawStatus = (order.status || "").toLowerCase();
  const normalizedStatus = rawStatus === "pending" ? "received" : rawStatus || "received";

  return {
    id: `RIP-${order.id}`,
    rawId: order.id,
    table: order.session?.table?.tableNumber || 1,
    items: order.orderItems ? order.orderItems.map((item) => ({
      name: item.dish?.name || "Item",
      qty: item.quantity,
      customizations: item.customizations || null,
    })) : [],
    rawItems: order.orderItems ? order.orderItems.map((item) => ({
      id: item.id,
      dishId: item.dishId,
      name: item.dish?.name || "Item",
      quantity: item.quantity,
      price: Number(item.price),
      customizations: item.customizations || null,
    })) : [],
    total: Number(order.totalAmount),
    status: normalizedStatus,
    notes: order.notes || null,
    time: new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt: order.createdAt,
    waiter: order.session?.customer?.name || "Customer",
    customerName: order.session?.customer?.name || "Guest",
    customerPhone: order.session?.customer?.phone || "—",
  };
}

// Helper to map a Prisma dish row to the shape the admin UI expects
function mapDishToProduct(dish) {
  return {
    id: dish.id,
    name: dish.name,
    category: dish.category?.name || "Uncategorized",
    categoryId: dish.categoryId,
    price: Number(dish.price),
    available: dish.available,
    dietary: dish.dietary,
    isBestseller: dish.isBestseller,
    isSpooky: dish.isSpooky,
    image: dish.imageUrl || "",
    description: dish.description || "",
    prepTime: dish.prepTime || "",
    calories: dish.calories || "",
    hasCustomization: dish.hasCustomization,
    options: dish.options,
  };
}

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  const acc = accent || "amber";
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-${acc}-500/25 bg-gradient-to-br from-[#13121C] to-[#0A090E] p-3.5 sm:p-5 shadow-xl transition-all`}>
      <div className={`absolute -top-6 -right-6 h-16 sm:h-20 w-16 sm:w-20 rounded-full bg-${acc}-500/10 blur-xl pointer-events-none`} />
      <div className={`mb-2 sm:mb-3 inline-flex items-center justify-center rounded-xl bg-${acc}-500/10 border border-${acc}-500/30 p-2 sm:p-2.5 text-${acc}-400`}>
        {icon}
      </div>
      <div className={`text-xl sm:text-2xl font-extrabold text-${acc}-300 leading-tight truncate`}>{value}</div>
      <div className="text-[11px] sm:text-xs font-semibold text-slate-300 mt-0.5 truncate">{label}</div>
      {sub && <div className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 sm:mt-1 truncate">{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────
function Badge({ cfg }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// ORDER EDIT MODAL
// ─────────────────────────────────────────────
function OrderEditModal({ order, products, onClose, onSave }) {
  const [editItems, setEditItems] = useState(
    order.rawItems.map((i) => ({ ...i }))
  );
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [addDishId, setAddDishId] = useState("");

  const total = editItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const updateQty = (idx, delta) => {
    setEditItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const newQty = Math.max(1, item.quantity + delta);
      return { ...item, quantity: newQty };
    }));
  };

  const removeItem = (idx) => {
    setEditItems(prev => prev.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    if (!addDishId) return;
    const dish = products.find(p => p.id === Number(addDishId));
    if (!dish) return;
    const existing = editItems.findIndex(i => i.dishId === dish.id);
    if (existing >= 0) {
      updateQty(existing, 1);
    } else {
      setEditItems(prev => [...prev, { dishId: dish.id, name: dish.name, quantity: 1, price: dish.price }]);
    }
    setAddDishId("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/orders/${order.rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          items: editItems.map(i => ({ dishId: i.dishId, quantity: i.quantity, price: i.price })),
        }),
      });
      await onSave();
      onClose();
    } catch (err) {
      console.error("Failed to save order:", err);
    }
    setSaving(false);
  };

  const STATUS_OPTIONS = ["received", "preparing", "ready", "served"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#13121C] to-[#0A090E] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 px-6 py-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-amber-300">Edit Order {order.id}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Table {order.table} · {order.waiter}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition"><Icon.Close /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Status</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {STATUS_OPTIONS.map(s => {
                const cfg = ORDER_STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`rounded-xl border py-2 text-[10px] font-bold uppercase tracking-wide transition ${status === s ? `${cfg.bg} ${cfg.color}` : "bg-[#0F0E17] border-amber-900/30 text-slate-500 hover:border-amber-500/30"
                      }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items list */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Items</label>
            <div className="mt-2 space-y-2">
              {editItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/2 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500">₹{item.price} each · ₹{(item.price * item.quantity).toFixed(2)} total</p>
                  </div>
                  {/* Qty stepper */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQty(idx, -1)}
                      className="h-6 w-6 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-bold transition"
                    >−</button>
                    <span className="text-sm font-bold text-white w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(idx, 1)}
                      className="h-6 w-6 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-bold transition"
                    >+</button>
                  </div>
                  {/* Remove */}
                  <button
                    onClick={() => removeItem(idx)}
                    className="shrink-0 text-rose-500 hover:text-rose-400 transition p-1 rounded-lg hover:bg-rose-500/10"
                    title="Remove item"
                  >
                    <Icon.Delete />
                  </button>
                </div>
              ))}
              {editItems.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-3">No items. Add at least one below.</p>
              )}
            </div>
          </div>

          {/* Add item */}
          {products.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Item</label>
              <div className="flex gap-2 mt-2">
                <select
                  value={addDishId}
                  onChange={e => setAddDishId(e.target.value)}
                  className="flex-1 rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-amber-400 transition appearance-none"
                >
                  <option value="">Select a dish…</option>
                  {products.filter(p => p.available).map(p => (
                    <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>
                  ))}
                </select>
                <button
                  onClick={addItem}
                  disabled={!addDishId}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600/20 border border-amber-500/40 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon.Plus /> Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between border-t border-amber-500/20 px-6 py-4">
          <div className="text-sm">
            <span className="text-slate-500">New Total: </span>
            <span className="font-extrabold text-amber-400">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition">Cancel</button>
            <button
              disabled={saving || editItems.length === 0}
              onClick={handleSave}
              className="rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-sm font-bold text-white hover:from-amber-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ORDERS PANEL
// ─────────────────────────────────────────────
function OrdersPanel({ orders = [], setOrders, onUpdateOrderStatus, products = [], refreshOrders, isChef = false }) {
  // ── Day tab: "today" | "yesterday" | "all" ──
  const [dayTab, setDayTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cyclingOrderId, setCyclingOrderId] = useState(null);

  const USER_PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedId(null);
  }, [search, filterStatus, dayTab]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  // ── Split orders into today vs yesterday vs all ──
  const { todayOrders, yesterdayOrders, allOrders, todayLabel, yesterdayLabel } = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const fmt = (d) =>
      d.toLocaleDateString([], { day: "2-digit", month: "short" });

    const safeOrders = Array.isArray(orders) ? orders : [];

    const todayOrders = safeOrders.filter((o) => {
      const t = new Date(o.createdAt || Date.now());
      return t >= todayStart && t <= todayEnd;
    });
    const yesterdayOrders = safeOrders.filter((o) => {
      const t = new Date(o.createdAt || Date.now());
      return t >= yesterdayStart && t <= yesterdayEnd;
    });

    return {
      todayOrders,
      yesterdayOrders,
      allOrders: safeOrders,
      todayLabel: fmt(todayStart),
      yesterdayLabel: fmt(yesterdayStart),
    };
  }, [orders]);

  const isYesterday = dayTab === "yesterday";
  const dayOrders = dayTab === "today" ? todayOrders : dayTab === "yesterday" ? yesterdayOrders : allOrders;

  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    return dayOrders
      .filter((o) => filterStatus === "all" || (o.status || "").toLowerCase() === filterStatus.toLowerCase())
      .filter((o) => {
        if (!q) return true;
        const idStr = String(o.id || "").toLowerCase();
        const tableStr = String(o.table || "");
        const waiterStr = String(o.waiter || o.customerName || "").toLowerCase();
        return idStr.includes(q) || tableStr.includes(q) || waiterStr.includes(q);
      });
  }, [dayOrders, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / USER_PAGE_SIZE) || 1;

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * USER_PAGE_SIZE;
    return filtered.slice(start, start + USER_PAGE_SIZE);
  }, [filtered, currentPage]);

  const getNextStatus = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending" || s === "received") return "preparing";
    if (s === "preparing") return "ready";
    if (s === "ready") return "served";
    return "served";
  };

  const nextStatusLabel = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "cancelled") return "Cancelled";
    if (s === "pending" || s === "received") return "Mark Preparing";
    if (s === "preparing") return "Mark Ready";
    if (s === "ready") return "Mark Served";
    return "Served ✓";
  };

  const cycleStatus = async (order) => {
    const orderKey = order.id || order.rawId;
    if (cyclingOrderId === orderKey) return;
    setCyclingOrderId(orderKey);

    const nextStatus = getNextStatus(order.status);
    if (nextStatus === (order.status || "").toLowerCase()) {
      setCyclingOrderId(null);
      return;
    }

    // 1. Instant 0ms Optimistic UI update across all parent & local states with polling guard
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(order.rawId, nextStatus);
    } else if (setOrders) {
      setOrders((prev) =>
        prev.map((o) =>
          o.rawId === order.rawId || o.id === order.id ? { ...o, status: nextStatus } : o
        )
      );
    }

    // 2. Broadcast immediately to any open chef/kitchen/customer screens
    try {
      if (typeof window !== "undefined" && window.BroadcastChannel) {
        new BroadcastChannel("rip_cafe_live_sync").postMessage({ type: "ORDER_UPDATE", orderId: order.rawId, status: nextStatus });
      }
    } catch (e) {}

    // 3. Sync to database in background
    try {
      await fetch(`/api/orders/${order.rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to update order status:", err);
      if (refreshOrders) refreshOrders();
    } finally {
      setTimeout(() => setCyclingOrderId(null), 300);
    }
  };

  const handleCancelOrder = async (order) => {
    // 1. Instant 0ms Optimistic UI update
    if (setOrders) {
      setOrders((prev) =>
        prev.map((o) =>
          o.rawId === order.rawId || o.id === order.id ? { ...o, status: "cancelled" } : o
        )
      );
    }
    setCancellingOrder(null);

    // 2. Broadcast cancellation
    try {
      if (typeof window !== "undefined" && window.BroadcastChannel) {
        new BroadcastChannel("rip_cafe_live_sync").postMessage({ type: "ORDER_CANCELLED", orderId: order.rawId });
      }
    } catch (e) {}

    // 3. Sync to backend in background
    try {
      const res = await fetch(`/api/orders/${order.rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", isAdmin: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
      if (refreshOrders) refreshOrders();
      alert("Error cancelling order: " + err.message);
    }
  };

  const stats = useMemo(() => {
    const total = dayOrders.filter((o) => (o.status || "").toLowerCase() !== "cancelled").reduce((s, o) => s + (Number(o.total) || 0), 0);
    return {
      total,
      received: dayOrders.filter((o) => ["received", "pending"].includes((o.status || "").toLowerCase())).length,
      preparing: dayOrders.filter((o) => (o.status || "").toLowerCase() === "preparing").length,
      ready: dayOrders.filter((o) => (o.status || "").toLowerCase() === "ready").length,
    };
  }, [dayOrders]);

  return (
    <div className="flex flex-col gap-5 font-sans">

      {/* ── Day Tab Switcher ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-xl border border-amber-500/20 bg-[#0C0B12] p-1 gap-1">
          {/* All Orders */}
          <button
            onClick={() => setDayTab("all")}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${dayTab === "all"
              ? "bg-gradient-to-r from-amber-600/30 to-amber-500/15 border border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              : "text-slate-500 hover:text-amber-400"
              }`}
          >
            All Orders
            <span className="ml-0.5 flex items-center justify-center min-w-[18px] h-4 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-extrabold px-1">
              {allOrders.length}
            </span>
          </button>

          {/* Today */}
          <button
            onClick={() => setDayTab("today")}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${dayTab === "today"
              ? "bg-gradient-to-r from-amber-600/30 to-amber-500/15 border border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              : "text-slate-500 hover:text-amber-400"
              }`}
          >
            Today
            <span className="ml-0.5 flex items-center justify-center min-w-[18px] h-4 rounded-full bg-amber-500/30 text-amber-300 text-[9px] font-extrabold px-1">
              {todayOrders.length}
            </span>
          </button>

          {/* Yesterday */}
          <button
            onClick={() => setDayTab("yesterday")}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${dayTab === "yesterday"
              ? "bg-gradient-to-r from-violet-600/30 to-violet-500/15 border border-violet-400/50 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.15)]"
              : "text-slate-500 hover:text-violet-400"
              }`}
          >
            Yesterday
            <span className="ml-0.5 flex items-center justify-center min-w-[18px] h-4 rounded-full bg-violet-500/30 text-violet-300 text-[9px] font-extrabold px-1">
              {yesterdayOrders.length}
            </span>
          </button>
        </div>

        {/* Date label */}
        <span className="text-[10px] text-slate-500 font-medium">
          {dayTab === "today" ? todayLabel : dayTab === "yesterday" ? yesterdayLabel : "Showing all recent cafe orders"}
        </span>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { icon: <Icon.Orders />, label: "Total Orders", value: dayOrders.length, sub: isYesterday ? "Yesterday" : "Today", accent: isYesterday ? "violet" : "amber" },
          { icon: <Icon.Clock />, label: "Pending", value: stats.received, sub: "Awaiting kitchen", accent: "blue" },
          { icon: <Icon.Flame />, label: "In Kitchen", value: stats.preparing, sub: "Being prepared", accent: "amber" },
          isChef
            ? { icon: <Icon.Check />, label: "Ready to Serve", value: stats.ready, sub: "Ready on counter", accent: "emerald" }
            : { icon: <Icon.Revenue />, label: "Revenue", value: `₹${stats.total.toLocaleString()}`, sub: isYesterday ? "Yesterday total" : "Today so far", accent: "emerald" },
        ].map(({ icon, label, value, sub, accent }) => (
          <div key={label} className={`relative overflow-hidden rounded-xl border border-${accent}-500/25 bg-gradient-to-br from-[#13121C] to-[#0A090E] p-3 sm:p-5 shadow-lg`}>
            <div className={`absolute -top-4 -right-4 h-12 w-12 rounded-full bg-${accent}-500/10 blur-xl pointer-events-none`} />
            <div className={`inline-flex items-center justify-center rounded-lg bg-${accent}-500/10 border border-${accent}-500/30 p-1.5 text-${accent}-400 mb-2`}>
              {icon}
            </div>
            <div className={`text-lg sm:text-2xl font-extrabold text-${accent}-300 leading-none`}>{value}</div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-1">{label}</div>
            <div className="text-[9px] text-slate-500 mt-0.5 hidden sm:block">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3">
        {/* Search bar */}
        <div className={`relative flex items-center rounded-xl border bg-[#0C0B12] px-4 py-3 transition ${isYesterday ? "border-violet-500/30 focus-within:border-violet-400" : "border-amber-500/30 focus-within:border-amber-400"}`}>
          <Icon.Search />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, table number, waiter..."
            className="ml-3 flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-500 hover:text-slate-300 text-xs">
              ✕
            </button>
          )}
        </div>

        {/* Status filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Orders", count: dayOrders.length },
            { id: "received", label: "Received", count: stats.received },
            { id: "preparing", label: "Preparing", count: stats.preparing },
            { id: "ready", label: "Ready", count: stats.ready },
            { id: "served", label: "Served", count: dayOrders.filter((o) => (o.status || "").toLowerCase() === "served").length },
            { id: "cancelled", label: "Cancelled", count: dayOrders.filter((o) => (o.status || "").toLowerCase() === "cancelled").length },
          ].map((chip) => {
            const active = filterStatus === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilterStatus(chip.id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold whitespace-nowrap transition cursor-pointer ${active
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm"
                  : "border-white/5 bg-white/3 text-slate-400 hover:border-white/10 hover:text-white"
                  }`}
              >
                {chip.label}
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${active ? "bg-amber-400/30 text-amber-200 font-extrabold" : "bg-white/5 text-slate-500"}`}>
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Orders list ── */}
      <div className="space-y-3">
        {paginatedOrders.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#0C0B12] p-8 text-center text-slate-500">
            <div className="text-3xl mb-2">🍽️</div>
            <p className="text-sm font-semibold">No orders found</p>
            <p className="text-xs text-slate-600 mt-1">Try selecting another tab or clearing search filters</p>
          </div>
        ) : (
          paginatedOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            const cfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.received;

            // Highlight color based on status / day
            const containerCls =
              order.status === "preparing"
                ? "border-amber-500/40 bg-gradient-to-r from-[#18130B] to-[#0D0B10] shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                : order.status === "ready"
                  ? "border-emerald-500/30 bg-gradient-to-r from-[#0B1812] to-[#0D0B10]"
                  : order.status === "cancelled"
                    ? "border-rose-500/20 bg-gradient-to-r from-[#180B0B] to-[#0D0B10] opacity-60"
                    : isYesterday
                      ? "border-violet-500/20 bg-gradient-to-r from-[#130E20] to-[#0A090E]"
                      : "border-white/10 bg-gradient-to-b from-[#13121C] to-[#0A090E]";

            return (
              <div key={order.id} className={`rounded-2xl border transition-all duration-200 ${containerCls}`}>

                {/* ── Card header (always visible, tappable) ── */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  {/* Row 1: Order ID + Table badge + Amount + Chevron */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-mono ${isYesterday ? "text-violet-400" : "text-amber-400"}`}>{order.id}</span>
                      <span className={`rounded-lg px-2 py-0.5 font-extrabold text-xs border ${isYesterday ? "bg-violet-950/50 border-violet-500/30 text-violet-300" : "bg-amber-950/50 border-amber-500/30 text-amber-300"}`}>
                        T{order.table}
                      </span>
                      {isYesterday && (
                        <span className="text-[8px] font-bold text-violet-500 uppercase tracking-widest border border-violet-500/20 rounded-md px-1.5 py-0.5 bg-violet-500/5">
                          prev day
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isChef && <span className="text-sm font-extrabold text-white">₹{order.total}</span>}
                      <div className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        <Icon.ChevronDown />
                      </div>
                    </div>
                  </div>

                {/* Row 2: Customer name + phone */}
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {order.customerName}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {order.customerPhone}
                  </span>
                </div>

                {/* Row 3: Items preview + Time + Status badge & Quick Action */}
                <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                  <div className="text-[11px] text-slate-400 line-clamp-1 flex-1 min-w-[150px]">
                    {order.items.map(i => `${i.name} ×${i.qty}`).join(" · ")}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Icon.Clock />{order.time}
                    </span>
                    <Badge cfg={cfg} />
                    {order.status !== "served" && order.status !== "cancelled" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cycleStatus(order);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-[10px] sm:text-xs font-extrabold shadow-sm active:scale-95 transition cursor-pointer"
                        title="Click to advance order status directly"
                      >
                        {cyclingOrderId === (order.id || order.rawId) ? (
                          <div className="h-3 w-3 rounded-full border-2 border-black/40 border-t-black animate-spin shrink-0" />
                        ) : (
                          <span className="text-xs">⚡</span>
                        )}
                        <span>{nextStatusLabel(order.status)}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer Note Snippet (visible when card is collapsed) */}
                {!isExpanded && order.notes && (
                  <div className="mt-2.5 text-xs text-amber-200 bg-gradient-to-r from-amber-950/60 to-amber-900/30 border border-amber-500/40 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
                    <span className="shrink-0 text-amber-400 font-bold">📝 Kitchen Note:</span>
                    <span className="italic font-medium text-amber-100 truncate">{order.notes}</span>
                  </div>
                )}
              </div>

              {/* ── Expanded detail ── */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">

                  {/* Customer / Kitchen Special Note */}
                  {order.notes && (
                    <div className="rounded-xl bg-gradient-to-r from-amber-950/70 to-amber-900/40 border border-amber-500/50 p-3 text-xs text-amber-200 flex items-start gap-2.5 shadow-md">
                      <span className="text-lg text-amber-400 shrink-0">📝</span>
                      <div className="flex-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block font-mono">Kitchen Note / Customer Instructions</span>
                        <p className="italic text-white mt-1 text-xs font-semibold leading-relaxed bg-black/30 p-2 rounded-lg border border-amber-500/20">{order.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Item list */}
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Items</div>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="rounded-lg bg-white/3 border border-white/5 px-3 py-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-200 font-medium">{item.name}</span>
                          <span className="text-amber-400 font-bold font-mono">×{item.qty}</span>
                        </div>
                        {item.customizations && (
                          <p className="text-[10px] text-amber-300/80 mt-1">
                            ↳ {item.customizations}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action buttons — stacked on mobile, side-by-side on sm+ */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={() => setEditOrder(order)}
                      disabled={order.status === "cancelled"}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs sm:text-sm font-bold text-amber-400 hover:bg-amber-500/20 active:bg-amber-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Icon.Edit /> Edit Order
                    </button>
                    {order.status !== "cancelled" && (
                      <button
                        onClick={() => setCancellingOrder(order)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs sm:text-sm font-bold text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 active:scale-95 transition cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Order
                      </button>
                    )}
                    <button
                      onClick={() => cycleStatus(order)}
                      disabled={order.status === "served" || order.status === "cancelled"}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-2.5 text-xs sm:text-sm font-bold text-white hover:from-amber-500 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
                    >
                      {cyclingOrderId === (order.id || order.rawId) ? (
                        <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin shrink-0" />
                      ) : (
                        <Icon.Check />
                      )}
                      <span>{nextStatusLabel(order.status)}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="rounded-xl border border-slate-700 bg-[#0F0E17] px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-amber-300 disabled:opacity-40 transition"
          >
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`rounded-xl min-w-[38px] py-2.5 text-xs font-bold transition ${currentPage === p
                  ? isYesterday
                    ? "bg-gradient-to-r from-violet-600 to-violet-700 border border-violet-400/50 text-white shadow-md"
                    : "bg-gradient-to-r from-amber-600 to-amber-700 border border-amber-400/50 text-white shadow-md"
                  : "bg-[#0F0E17] border border-amber-900/30 text-slate-400 hover:text-amber-300"
                  }`}
              >
                {p}
              </button>
            );
          })}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="rounded-xl border border-slate-700 bg-[#0F0E17] px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-amber-300 disabled:opacity-40 transition"
          >
            Next ›
          </button>
        </div>
      )}

      {/* ── Order Edit Modal ── */}
      {editOrder && (
        <OrderEditModal
          order={editOrder}
          products={products}
          onClose={() => setEditOrder(null)}
          onSave={refreshOrders}
        />
      )}

      {/* ── Cancel Order Confirmation Modal ── */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[24px] border border-rose-500/40 bg-gradient-to-b from-[#1E1116] to-[#0A0507] p-6 text-center shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/50 bg-gradient-to-tr from-rose-500/10 to-rose-600/20 text-rose-400 text-xl mb-4">
              ⚠️
            </div>
            <h3 className="text-base font-extrabold text-white">Cancel Order {cancellingOrder.id}?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Table {cancellingOrder.table} · {cancellingOrder.customerName}
              <br />
              Are you sure you want to cancel this order? This will mark the order as cancelled and update table/session totals.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCancellingOrder(null)}
                className="flex-1 rounded-xl border border-slate-700 bg-[#0F0E17] py-2.5 text-xs font-bold text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={() => handleCancelOrder(cancellingOrder)}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 border border-rose-450 py-2.5 text-xs font-bold text-white shadow-md hover:from-rose-500 hover:to-rose-600 transition active:scale-95 cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS PANEL (Includes User & Staff Management and Tax Config)
// ─────────────────────────────────────────────
function SettingsPanel({ currentUser }) {
  return (
    <div className="flex flex-col gap-6 font-sans max-w-6xl mx-auto">
      <UsersPanel currentUser={currentUser} />
    </div>
  );
}

// ─────────────────────────────────────────────
// BILLING PANEL (DB-driven)
// ─────────────────────────────────────────────
function BillingPanel() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.bluetooth) {
      setIsBluetoothSupported(true);
    }
  }, []);

  const fetchBills = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions?status=ended");
      if (!res.ok) throw new Error("failed to fetch billing sessions");
      const data = await res.json();
      setBills(data);
    } catch (err) {
      console.error("Failed to load billing history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
    const interval = setInterval(fetchBills, 10000);
    return () => clearInterval(interval);
  }, [fetchBills]);

  // Helper: sum item subtotals for non-cancelled orders in a session
  // Uses item.subtotal (server-computed) to guarantee accuracy
  const sessionActiveTotal = (orders) => {
    return (orders || [])
      .filter(o => (o.status || "").toUpperCase() !== "CANCELLED")
      .reduce((s, o) => {
        const itemSum = (o.orderItems || []).reduce((a, i) => a + Number(i.subtotal ?? (Number(i.price) * i.quantity)), 0);
        return s + itemSum;
      }, 0);
  };

  const stats = useMemo(() => {
    const totalBills = bills.length;
    const totalRev = bills.reduce((sum, b) => sum + sessionActiveTotal(b.orders), 0);
    const avgVal = totalBills > 0 ? (totalRev / totalBills).toFixed(2) : "0.00";
    return {
      totalBills,
      totalRev: totalRev.toLocaleString("en-IN"),
      avgVal: Number(avgVal).toLocaleString("en-IN"),
    };
  }, [bills]);

  const filteredBills = useMemo(() => {
    if (!searchQuery.trim()) return bills;
    const query = searchQuery.toLowerCase();
    return bills.filter((b) => {
      const customerName = b.customer?.name?.toLowerCase() || "";
      const customerPhone = b.customer?.phone || "";
      const billId = `BILL-${b.id}`.toLowerCase();
      const tableNo = `T${b.table?.tableNumber}`.toLowerCase();
      return (
        customerName.includes(query) ||
        customerPhone.includes(query) ||
        billId.includes(query) ||
        tableNo.includes(query)
      );
    });
  }, [bills, searchQuery]);

  const ITEMS_PER_PAGE = 7;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE) || 1;

  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBills.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBills, currentPage]);

  // Receipt for selected bill — consolidate items and resolve names safely
  const receiptItems = useMemo(() => {
    if (!selectedBill) return [];
    const activeOrders = (selectedBill.orders || []).filter(
      (o) => (o.status || "").toUpperCase() !== "CANCELLED"
    );
    const rawItems = activeOrders.flatMap((o) => o.orderItems || o.items || []);

    const grouped = {};
    rawItems.forEach((item) => {
      const name = (item.dish?.name || item.name || item.dishName || "Item").trim();
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || item.qty || 1);
      const key = `${name}_${price}`;

      if (!grouped[key]) {
        grouped[key] = {
          name,
          price,
          quantity: qty,
          subtotal: price * qty,
        };
      } else {
        grouped[key].quantity += qty;
        grouped[key].subtotal += price * qty;
      }
    });

    return Object.values(grouped);
  }, [selectedBill]);

  const receiptTotal = useMemo(() => {
    return receiptItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
  }, [receiptItems]);

  const [btStatus, setBtStatus] = useState(""); // ""|"connecting"|"printing"|"done"|"error"

  const printBluetoothReceipt = async () => {
    if (!selectedBill) return;

    if (!navigator.bluetooth) {
      alert(
        "Web Bluetooth is not supported in this browser or context.\n\n" +
        "To enable it:\n" +
        "1. Use Google Chrome or Microsoft Edge.\n" +
        "2. Access the dashboard via 'http://localhost:3000' (not 127.0.0.1 or local network IP) or HTTPS.\n\n" +
        "Alternatively, please use the 'Print / Save as PDF' button below to print directly using your system's printer driver."
      );
      return;
    }

    setBtStatus("connecting");
    try {
      // --- 1. Pair with printer ---
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "000018f0-0000-1000-8000-00805f9b34fb", // common BLE printer service
          "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // Xprinter / common
          "49535343-fe7d-4ae5-8fa9-9fafd205e455", // ISSC
          "0000ffe0-0000-1000-8000-00805f9b34fb", // HM-10 / Custom
          "0000ae30-0000-1000-8000-00805f9b34fb", // Custom Chinese
          "00001101-0000-1000-8000-00805f9b34fb", // SPP fallback
        ],
      });

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      let printChar = null;
      for (const svc of services) {
        const chars = await svc.getCharacteristics();
        for (const ch of chars) {
          if (ch.properties.write || ch.properties.writeWithoutResponse) {
            printChar = ch;
            break;
          }
        }
        if (printChar) break;
      }

      if (!printChar) throw new Error("No writable characteristic found on this printer.");

      setBtStatus("printing");

      // --- 2. Build ESC/POS byte array ---
      const ESC = 0x1b;
      const GS = 0x1d;
      const LF = 0x0a;

      // Encoder for text
      const enc = new TextEncoder();

      // Helper: ESC/POS bytes for common commands
      const CMD = {
        init: [ESC, 0x40],           // ESC @ — Initialize
        normalMode: [ESC, 0x21, 0x00], // ESC ! 0 — Standard print mode
        resetSize: [GS, 0x21, 0x00],  // GS ! 0 — 1x width, 1x height character size
        centerAlign: [ESC, 0x61, 0x01],     // ESC a 1 — Center
        leftAlign: [ESC, 0x61, 0x00],     // ESC a 0 — Left
        rightAlign: [ESC, 0x61, 0x02],     // ESC a 2 — Right
        boldOn: [ESC, 0x45, 0x01],     // ESC E 1 — Bold on
        boldOff: [ESC, 0x45, 0x00],     // ESC E 0 — Bold off
        dblWidthOff: [GS, 0x21, 0x00],     // GS ! 0x00 — Normal size
        feed3: [ESC, 0x64, 0x03],     // ESC d 3 — Feed 3 lines
        cut: [GS, 0x56, 0x41, 0x00], // GS V A — Partial cut
      };

      // Build receipt content as byte segments (Exact 32 Columns for 58mm Thermal Rolls)
      const LINE = "--------------------------------";
      const date = new Date(selectedBill.endedAt || selectedBill.createdAt || Date.now()).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true
      });

      const printTotal = receiptItems.reduce(
        (s, i) => s + Number(i.subtotal ?? (Number(i.price) * i.quantity)), 0
      );

      const segments = [
        // Init & enforce standard 1x scale
        ...CMD.init,
        ...CMD.normalMode,
        ...CMD.resetSize,
        ...CMD.dblWidthOff,
        // Header (Standard 1x width bold title — fits on single line)
        ...CMD.centerAlign,
        ...CMD.boldOn,
        ...enc.encode("REST IN PEACE CAFE"), LF,
        ...CMD.boldOff,
        ...enc.encode("Sitra ,Coimbatore"), LF,
        ...enc.encode(date), LF,
        ...enc.encode(LINE), LF,
        // Bill info
        ...CMD.leftAlign,
        ...enc.encode(`Bill : BILL-${selectedBill.id}`), LF,
        ...enc.encode(`Table: Table ${selectedBill.table?.tableNumber || "-"}`), LF,
        ...enc.encode(`Guest: ${selectedBill.customer?.name || "Guest"}`), LF,
        ...enc.encode(`Phone: ${selectedBill.customer?.phone || "-"}`), LF,
        ...enc.encode(LINE), LF,
        // Column header
        ...CMD.boldOn,
        ...enc.encode("ITEM                 QTY     AMT"), LF,
        ...CMD.boldOff,
        ...enc.encode(LINE), LF,
      ];

      // Item lines - Full dish names with clean 32-col layout
      for (const item of receiptItems) {
        const fullName = (item.name || item.dish?.name || "Item").trim();
        const qty = item.quantity;
        const rate = Number(item.price).toFixed(2);
        const lineAmt = Number(item.subtotal ?? (Number(item.price) * item.quantity));
        const amtStr = `Rs.${lineAmt.toFixed(2)}`;

        if (fullName.length <= 15) {
          const namePad = fullName.padEnd(16);
          const qtyPad = `${qty}x`.padEnd(5);
          const amtPad = amtStr.padStart(11);
          segments.push(...enc.encode(`${namePad}${qtyPad}${amtPad}`), LF);
        } else {
          // Line 1: Full dish name (wrap if longer than 32 chars)
          const words = fullName.split(" ");
          let curLine = "";
          for (const w of words) {
            if ((curLine + (curLine ? " " : "") + w).length <= 32) {
              curLine += (curLine ? " " : "") + w;
            } else {
              if (curLine) segments.push(...enc.encode(curLine), LF);
              curLine = w;
            }
          }
          if (curLine) segments.push(...enc.encode(curLine), LF);

          // Line 2: Qty x Rate on left, Total Amount on right (32 columns)
          const detailStr = `  ${qty} x Rs.${rate}`;
          const spaceCount = Math.max(1, 32 - detailStr.length - amtStr.length);
          segments.push(...enc.encode(`${detailStr}${" ".repeat(spaceCount)}${amtStr}`), LF);
        }
      }

      // Totals
      const totalStr = `Rs.${printTotal.toFixed(2)}`;
      const totalLabel = "TOTAL AMOUNT:";
      const totalSpaces = Math.max(1, 32 - totalLabel.length - totalStr.length);

      segments.push(
        ...enc.encode(LINE), LF,
        ...CMD.boldOn,
        ...CMD.leftAlign,
        ...enc.encode(`${totalLabel}${" ".repeat(totalSpaces)}${totalStr}`), LF,
        ...CMD.boldOff,
        ...enc.encode(LINE), LF,
        ...CMD.centerAlign,
        ...enc.encode("Payment Settled [PAID]"), LF,
        ...enc.encode("Thank You! Visit Again"), LF,
        // Feed & cut
        ...CMD.feed3,
        ...CMD.cut,
      );

      // --- 3. Send in BLE MTU-safe chunks ---
      const bytes = new Uint8Array(segments);
      const CHUNK = 100; // safe for most BLE thermal printers
      for (let i = 0; i < bytes.length; i += CHUNK) {
        const chunk = bytes.slice(i, i + CHUNK);
        if (printChar.properties.writeWithoutResponse) {
          await printChar.writeValueWithoutResponse(chunk);
        } else {
          await printChar.writeValue(chunk);
        }
        // Small delay between chunks to avoid buffer overflow
        await new Promise(r => setTimeout(r, 20));
      }

      device.gatt.disconnect();
      setBtStatus("done");
      setTimeout(() => setBtStatus(""), 3000);
    } catch (err) {
      console.error("BT Print error:", err);
      setBtStatus("error");
      setTimeout(() => setBtStatus(""), 4000);
      if (!err.message?.includes("cancelled")) {
        alert("Print failed: " + err.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-5 font-sans">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {/* Settled Revenue */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/25 bg-gradient-to-br from-[#13121C] to-[#0A090E] p-3 sm:p-5 shadow-lg">
          <div className="absolute -top-4 -right-4 h-14 w-14 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
          <div className="inline-flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-1.5 text-emerald-400 mb-2">
            <Icon.Revenue />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-300 leading-none">₹{stats.totalRev}</div>
          <div className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-1">Settled Revenue</div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 hidden sm:block">Total sales settled</div>
        </div>

        {/* Total Bills */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/25 bg-gradient-to-br from-[#13121C] to-[#0A090E] p-3 sm:p-5 shadow-lg">
          <div className="absolute -top-4 -right-4 h-14 w-14 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
          <div className="inline-flex items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 p-1.5 text-amber-400 mb-2">
            <Icon.Orders />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-amber-300 leading-none">{stats.totalBills}</div>
          <div className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-1">Total Bills</div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 hidden sm:block">Completed sessions</div>
        </div>

        {/* Avg. Bill Value — spans 2 cols on mobile so it sits centred */}
        <div className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-xl border border-violet-500/25 bg-gradient-to-br from-[#13121C] to-[#0A090E] p-3 sm:p-5 shadow-lg flex sm:block items-center gap-3">
          <div className="absolute -top-4 -right-4 h-14 w-14 rounded-full bg-violet-500/10 blur-xl pointer-events-none" />
          <div className="inline-flex items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/30 p-1.5 text-violet-400 mb-0 sm:mb-2 shrink-0">
            <Icon.Trending />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-extrabold text-violet-300 leading-none sm:mt-0">₹{stats.avgVal}</div>
            <div className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-1">Avg. Bill Value</div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 hidden sm:block">Revenue per session</div>
          </div>
        </div>
      </div>

      {/* ── Bills list panel ── */}
      <div className="bg-[#0D0C14] border border-amber-500/10 rounded-2xl p-4 sm:p-5 shadow-xl">

        {/* Header + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">Settled Sessions Registry</h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search guest, phone, table…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-[#09080E] border border-amber-950/40 px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/50 transition-all"
            />
            <div className="absolute left-3 top-2.5 text-slate-500">
              <Icon.Search />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-14 text-center text-slate-500 text-sm">Loading billing records…</div>
        ) : filteredBills.length === 0 ? (
          <div className="py-14 text-center text-slate-600 italic text-sm">No billings found.</div>
        ) : (
          <>
            {/* ── Desktop / Tablet table (hidden on small phones) ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Bill ID</th>
                    <th className="py-3 px-3">Table</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3 hidden md:table-cell">Settled Time</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedBills.map((b) => {
                    const sessionTotal = (b.orders || []).filter(o => (o.status || "").toUpperCase() !== "CANCELLED").reduce((sum, o) => sum + Number(o.totalAmount), 0);
                    const checkoutTime = b.endedAt
                      ? new Date(b.endedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                      " " + new Date(b.endedAt).toLocaleDateString([], { month: "short", day: "numeric" })
                      : "—";

                    return (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-3 px-3 font-mono font-bold text-amber-400">BILL-{b.id}</td>
                        <td className="py-3 px-3">
                          <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 font-semibold text-amber-300 text-[10px]">
                            T{b.table?.tableNumber}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white truncate max-w-[120px]">{b.customer?.name}</div>
                          <div className="text-[10px] text-slate-500">{b.customer?.phone}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-400 hidden md:table-cell">{checkoutTime}</td>
                        <td className="py-3 px-3 text-right font-extrabold text-white">₹{sessionTotal.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedBill(b)}
                            className="bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:bg-amber-500 group-hover:text-black py-1.5 px-3 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-200"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list (visible only on small screens) ── */}
            <div className="flex flex-col gap-4 sm:hidden">
              {paginatedBills.map((b) => {
                const sessionTotal = (b.orders || []).filter(o => (o.status || "").toUpperCase() !== "CANCELLED").reduce((sum, o) => sum + Number(o.totalAmount), 0);
                const checkoutTime = b.endedAt
                  ? new Date(b.endedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                  "  ·  " + new Date(b.endedAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
                  : "—";

                return (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#13121C] to-[#09080E] p-5 shadow-lg"
                  >
                    {/* Top row: Bill ID + Table badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono font-extrabold text-amber-400 text-base tracking-wide">BILL-{b.id}</span>
                      <span className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-amber-300 text-sm font-bold">
                        Table {b.table?.tableNumber}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/5 mb-3" />

                    {/* Customer info */}
                    <div className="mb-3">
                      <div className="text-base font-bold text-white mb-0.5">{b.customer?.name}</div>
                      <div className="text-sm text-slate-400">{b.customer?.phone}</div>
                    </div>

                    {/* Time + Amount row */}
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Settled</div>
                        <div className="text-xs text-slate-300">{checkoutTime}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Total</div>
                        <div className="text-2xl font-extrabold text-white">₹{sessionTotal.toLocaleString("en-IN")}</div>
                      </div>
                    </div>

                    {/* Full-width View button */}
                    <button
                      onClick={() => setSelectedBill(b)}
                      className="w-full py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 active:bg-amber-500 active:text-black text-sm font-bold uppercase tracking-wide transition-all"
                    >
                      View Receipt
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-white/5">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                Showing <span className="font-bold text-amber-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–
                <span className="font-bold text-amber-300">{Math.min(currentPage * ITEMS_PER_PAGE, filteredBills.length)}</span>{" "}
                of <span className="font-bold text-white">{filteredBills.length}</span> bills
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-amber-900/30 bg-[#09080E] px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ‹ Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg border min-w-[32px] py-1.5 text-xs font-bold transition ${currentPage === page
                      ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                      : "border-amber-900/30 bg-[#09080E] text-slate-400 hover:text-white"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-amber-900/30 bg-[#09080E] px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Receipt Modal Overlay (works on all screen sizes) ── */}
      {selectedBill && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setSelectedBill(null)}
        >
          <div
            className="w-full sm:w-auto sm:max-w-sm bg-[#0D0C14] border border-amber-500/20 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl font-sans max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-white/5">
              <h3 className="font-bold text-white text-sm">Checkout Receipt</h3>
              <button
                onClick={() => setSelectedBill(null)}
                className="h-7 w-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Receipt body */}
            <style>{`
              @media print {
                @page {
                  margin: 0;
                  size: 58mm auto; /* Native 58mm continuous thermal roll size */
                }
                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                  width: 58mm !important;
                  max-width: 58mm !important;
                  font-family: monospace, -apple-system, sans-serif !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body * { visibility: hidden; }
                #printable-receipt, #printable-receipt * { visibility: visible; }
                #printable-receipt {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 58mm !important;
                  max-width: 58mm !important;
                  margin: 0 !important;
                  padding: 3mm 2.5mm !important; /* Safe padding for 58mm thermal rolls */
                  background: white !important;
                  color: black !important;
                  border: none !important;
                  box-shadow: none !important;
                  font-size: 8.5pt !important;
                  line-height: 1.25 !important;
                  box-sizing: border-box !important;
                  overflow: visible !important;
                }
                #printable-receipt * {
                  color: black !important;
                  background: transparent !important;
                  border-color: #000 !important;
                  word-break: break-word !important;
                  overflow-wrap: break-word !important;
                }
              }
            `}</style>
            <div id="printable-receipt" className="rounded-xl border border-dashed border-amber-500/30 bg-[#07060A] p-4 font-mono text-slate-300 text-xs shadow-inner">
              <div className="text-center mb-4">
                <div className="text-amber-400 print:text-black font-bold text-xs uppercase tracking-wider">Rest In Peace Cafe</div>
                <div className="text-[9px] text-slate-500 print:text-gray-600 uppercase mt-0.5">Sitra ,Coimbatore</div>
                <div className="text-[10px] text-slate-500 print:text-black mt-2">─────────────────────</div>
              </div>

              <div className="space-y-1 mb-4 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-400 print:text-gray-600">Bill ID:</span><span className="text-white print:text-black font-bold">BILL-{selectedBill.id}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 print:text-gray-600">Table:</span><span className="text-white print:text-black font-semibold">Table {selectedBill.table?.tableNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 print:text-gray-600">Guest:</span><span className="text-white print:text-black font-semibold">{selectedBill.customer?.name || "Guest"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 print:text-gray-600">Phone:</span><span className="text-white print:text-black">{selectedBill.customer?.phone || "—"}</span></div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Time:</span>
                  <span className="text-white print:text-black">
                    {selectedBill.endedAt ? new Date(selectedBill.endedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-3">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-dashed border-white/20 print:border-black/50 text-[10px] text-slate-400 print:text-black font-bold">
                      <th className="text-left py-1 font-bold">ITEM</th>
                      <th className="text-center py-1 px-1 font-bold w-9">QTY</th>
                      <th className="text-right py-1 font-bold w-16">AMT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dashed divide-white/5 print:divide-black/20">
                    {receiptItems.map((item, idx) => {
                      const itemName = item.name || item.dish?.name || "Item";
                      const lineTotal = Number(item.subtotal ?? (Number(item.price) * item.quantity));
                      return (
                        <tr key={idx} className="align-top">
                          <td className="py-1.5 pr-1 text-white print:text-black font-medium break-words">
                            <div className="leading-tight font-semibold">{itemName}</div>
                            <div className="text-[9px] text-slate-400 print:text-gray-600 font-normal">
                              ₹{Number(item.price).toFixed(2)} each
                            </div>
                          </td>
                          <td className="py-1.5 px-1 text-center text-slate-300 print:text-black font-bold whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="py-1.5 pl-1 text-right text-slate-200 print:text-black font-bold font-mono whitespace-nowrap">
                            ₹{lineTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between text-xs font-bold border-t border-dashed border-white/10 print:border-black/30 pt-3 mt-1">
                <span className="text-amber-400 print:text-black uppercase tracking-wider">Total Amount:</span>
                <span className="text-white print:text-black text-sm font-mono font-black">₹{receiptTotal.toFixed(2)}</span>
              </div>

              <div className="text-[9px] text-slate-500 uppercase mt-0.5 text-center">Thank You! Visit Again </div>

              <div className="text-center text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-4">
                Payment Settled ✓
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex flex-col gap-3">
              {/* Highlighted Stylish Direct Bluetooth Print Button */}
              <button
                onClick={printBluetoothReceipt}
                disabled={isBluetoothSupported && (btStatus === "connecting" || btStatus === "printing")}
                className={`relative group overflow-hidden w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 px-4 text-xs font-extrabold tracking-wider transition-all duration-300 active:scale-[0.98] cursor-pointer border ${btStatus === "done"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-300 text-white shadow-[0_0_25px_rgba(16,185,129,0.55)]"
                  : btStatus === "error"
                    ? "bg-gradient-to-r from-rose-500 to-rose-600 border-rose-300 text-white shadow-[0_0_25px_rgba(244,63,94,0.55)]"
                    : "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:via-amber-200 hover:to-amber-400 border-amber-200 text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_35px_rgba(245,158,11,0.8)]"
                  }`}
              >
                {/* Ambient Shimmer Light effect across button */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                {btStatus === "connecting" && (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-black/40 border-t-black animate-spin" />
                    <span className="uppercase tracking-widest text-black">Connecting Printer…</span>
                  </>
                )}
                {btStatus === "printing" && (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-black/40 border-t-black animate-spin" />
                    <span className="uppercase tracking-widest text-black">Printing Thermal Slip…</span>
                  </>
                )}
                {btStatus === "done" && (
                  <span className="flex items-center gap-1.5 uppercase tracking-widest">
                    <span>✓</span> Printed Successfully!
                  </span>
                )}
                {btStatus === "error" && (
                  <span className="flex items-center gap-1.5 uppercase tracking-widest">
                    <span>✕</span> Print Failed — Retry
                  </span>
                )}
                {btStatus === "" && (
                  <>
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/10 text-sm">
                      🖨️
                    </span>
                    <span className="uppercase font-black text-black tracking-wider text-[11px] sm:text-xs">
                      Direct Bluetooth Print
                    </span>
                    <span className="ml-auto rounded-full bg-black/15 px-2 py-0.5 text-[9px] font-extrabold uppercase text-black">
                      58mm
                    </span>
                  </>
                )}
              </button>

              {/* Standard browser print (Secondary / Alternative) */}
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60 hover:border-slate-600 transition active:scale-95 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                System Print (Alternative)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TABLE STATUS PANEL (DB-driven)
// ─────────────────────────────────────────────
function mapTableSessionsFromDb(dbTable) {
  const activeSessions = dbTable.sessions || [];

  if (activeSessions.length === 0) {
    return [{
      id: dbTable.id,
      tableNumber: dbTable.tableNumber,
      tableToken: dbTable.tableToken || `t_${dbTable.tableNumber}`,
      status: "available",
      customerName: null,
      customerPhone: null,
      sessionId: null,
      since: null,
      orders: [],
      cardId: `table-${dbTable.id}`,
      cardLabel: `T${dbTable.tableNumber}`,
    }];
  }

  return activeSessions.map((session, index) => {
    const customer = session.customer || null;
    const orders = session.orders || [];

    // Ignore cancelled orders when determining served status
    const nonCancelledOrders = orders.filter(o => o.status !== "CANCELLED");
    const allServed = nonCancelledOrders.length > 0 && nonCancelledOrders.every(
      (o) => ["SERVED", "COMPLETED"].includes(o.status)
    );
    const status = allServed ? "served" : "occupied";

    // Format table number with suffix if active sessions exist
    const cardLabel = activeSessions.length === 1
      ? `T${dbTable.tableNumber}`
      : `T${dbTable.tableNumber}-${String.fromCharCode(65 + index)}`;

    return {
      id: dbTable.id,
      tableNumber: dbTable.tableNumber,
      tableToken: dbTable.tableToken || `t_${dbTable.tableNumber}`,
      status,
      customerName: customer?.name || null,
      customerPhone: customer?.phone || null,
      sessionId: session.id,
      since: session.startedAt ? new Date(session.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
      cardId: `table-${dbTable.id}-session-${session.id}`,
      cardLabel,
      orders: orders.map((o) => ({
        id: o.id,
        orderId: `RIP-${o.id}`,
        status: o.status.toLowerCase(),
        total: Number(o.totalAmount),
        notes: o.notes || null,
        time: new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        items: o.orderItems?.map((oi) => ({
          name: oi.dish?.name || "Item",
          qty: oi.quantity,
          price: Number(oi.price),
          customizations: oi.customizations || null,
        })) || [],
      })),
    };
  });
}

function TablesPanel({ tables, refreshTables }) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedTable, setExpandedTable] = useState(null);
  const [completing, setCompleting] = useState(null);
  const [tableToComplete, setTableToComplete] = useState(null);

  const stats = useMemo(() => ({
    available: tables.filter(t => t.status === "available").length,
    occupied: tables.filter(t => t.status === "occupied").length,
    served: tables.filter(t => t.status === "served").length,
  }), [tables]);

  const filtered = filterStatus === "all" ? tables : tables.filter(t => t.status === filterStatus);

  const handleComplete = async (table) => {
    if (!table.sessionId) return;

    const hasUnserved = table.orders && table.orders.some(
      (o) => !["served", "completed", "cancelled"].includes((o.status || "").toLowerCase())
    );

    if (hasUnserved) {
      setTableToComplete(table);
      return;
    }

    await executeComplete(table);
  };

  const executeComplete = async (table) => {
    setCompleting(table.sessionId);
    try {
      const res = await fetch(`/api/sessions/${table.sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENDED" }),
      });
      if (!res.ok) throw new Error("Failed to complete");
      await refreshTables();
      setExpandedTable(null);
    } catch (err) {
      console.error("Failed to complete table session:", err);
    } finally {
      setCompleting(null);
      setTableToComplete(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Icon.Check />} label="Available" value={stats.available} sub="Ready to seat" accent="emerald" />
        <StatCard icon={<Icon.Users />} label="Occupied" value={stats.occupied} sub="Guests seated" accent="amber" />
        <StatCard icon={<Icon.Check />} label="All Served" value={stats.served} sub="Awaiting completion" accent="blue" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "available", "occupied", "served"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition cursor-pointer ${filterStatus === s
              ? "bg-amber-500/20 border border-amber-400/60 text-amber-300"
              : "bg-[#0F0E17] border border-amber-900/30 text-slate-400 hover:text-amber-300"
              }`}
          >
            {s === "all" ? "All Tables" : TABLE_STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(table => {
          const cfg = TABLE_STATUS_CONFIG[table.status] || TABLE_STATUS_CONFIG.available;
          const isExpanded = expandedTable === table.cardId;
          const totalRevenue = table.orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

          return (
            <div
              key={table.cardId}
              className={`group relative overflow-hidden rounded-2xl border ${cfg.border} bg-gradient-to-br ${cfg.gradient} from-[#13121C] to-[#0A090E] shadow-xl transition-all duration-300`}
            >
              {/* Glow */}
              <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full opacity-30 blur-xl pointer-events-none"
                style={{ background: table.status === "available" ? "#10b981" : table.status === "occupied" ? "#f59e0b" : "#3b82f6" }}
              />

              {/* Header — always visible */}
              <div
                className="relative p-4 cursor-pointer"
                onClick={() => setExpandedTable(isExpanded ? null : table.cardId)}
              >
                {/* Table number + status */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-2xl font-extrabold text-white leading-none">{table.cardLabel}</div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </div>
                </div>

                {/* Customer info (if session active) */}
                {table.customerName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {table.customerName}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {table.customerPhone}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 italic mt-1">No active guests</div>
                )}

                {/* Since + Order count summary */}
                <div className="flex items-center justify-between mt-2">
                  {table.since && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Icon.Clock />
                      <span>Since {table.since}</span>
                    </div>
                  )}
                  {table.orders.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Icon.Orders />
                      <span>{table.orders.length} order{table.orders.length > 1 ? "s" : ""}</span>
                      <span className="text-amber-400 font-bold">₹{totalRevenue}</span>
                    </div>
                  )}
                </div>

                {/* Expand hint */}
                {table.status !== "available" && (
                  <div className="flex justify-center mt-2">
                    <div className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      <Icon.ChevronDown />
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded: Orders list + Complete Button */}
              {isExpanded && table.status !== "available" && (
                <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                  {/* Orders list */}
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Session Orders</div>
                  <div className="space-y-2">
                    {table.orders.length === 0 ? (
                      <div className="text-xs text-slate-600 text-center py-3 italic">No orders yet</div>
                    ) : (
                      table.orders.map((order) => {
                        const orderCfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.received;
                        return (
                          <div key={order.id} className={`rounded-xl border ${orderCfg.bg} bg-[#09080E] p-3`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-amber-400 font-mono">{order.orderId}</span>
                                <span className="text-[9px] text-slate-500">{order.time}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">₹{order.total}</span>
                                <Badge cfg={orderCfg} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="text-[10px]">
                                  <div className="flex justify-between">
                                    <span className="text-slate-300">{item.name}</span>
                                    <span className="text-slate-400 font-mono">x{item.qty}</span>
                                  </div>
                                  {item.customizations && (
                                    <p className="text-[9px] text-amber-300/70 ml-1">
                                      ↳ {item.customizations}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                            {order.notes && (
                              <div className="mt-2 rounded-md bg-amber-950/50 border border-amber-500/25 px-2 py-1 text-[10px] text-amber-200 flex items-start gap-1">
                                <span className="text-amber-400 shrink-0">📝</span>
                                <span className="italic leading-tight">{order.notes}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Actions: End Session Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => handleComplete(table)}
                      disabled={completing === table.sessionId}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 border border-emerald-400/50 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:from-emerald-500 hover:to-emerald-600 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {completing === table.sessionId ? (
                        <>
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>Completing…</span>
                        </>
                      ) : (
                        <>
                          <Icon.Check />
                          <span>Orders Completed</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── CUSTOM SESSION COMPLETION WARNING MODAL ── */}
      {tableToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[24px] border border-amber-500/40 bg-gradient-to-b from-[#1E1116] to-[#0A0507] p-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/50 bg-amber-955 bg-gradient-to-tr from-amber-500/10 to-amber-600/20 text-amber-400 text-xl mb-4">
              🛎️
            </div>
            <h3 className="text-base font-extrabold text-white">Unserved Orders Remaining</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This table session still has items preparing or ready in the kitchen. Are you sure you want to end the session and complete the order?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setTableToComplete(null)}
                className="flex-1 rounded-xl border border-slate-700 bg-[#0F0E17] py-2.5 text-xs font-bold text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
              >
                No, Keep Session
              </button>
              <button
                onClick={() => executeComplete(tableToComplete)}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 border border-emerald-450 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-emerald-600 transition active:scale-95 cursor-pointer"
              >
                Yes, Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MANAGE TABLES PANEL (Dedicated Add / Remove / Layout Configuration)
// ─────────────────────────────────────────────
function ManageTablesPanel({ tables, refreshTables }) {
  const [newTableNumber, setNewTableNumber] = useState("");
  const [tableToDelete, setTableToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => ({
    total: tables.length,
    available: tables.filter(t => t.status === "available").length,
    occupied: tables.filter(t => t.status === "occupied").length,
  }), [tables]);

  // Auto-calculate next recommended table number
  const nextRecommendedTableNumber = useMemo(() => {
    if (tables.length === 0) return 1;
    const maxNum = Math.max(...tables.map(t => Number(t.tableNumber) || 0));
    return maxNum + 1;
  }, [tables]);

  useEffect(() => {
    if (!newTableNumber) {
      setNewTableNumber(String(nextRecommendedTableNumber));
    }
  }, [nextRecommendedTableNumber]);

  const handleAddTable = async (e) => {
    e.preventDefault();
    const num = Number(newTableNumber);
    if (!num || isNaN(num) || num <= 0) {
      setFormError("Please enter a valid positive table number (e.g. 11)");
      return;
    }
    setActionLoading(true);
    setFormError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber: num }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create table");
      await refreshTables();
      setSuccessMsg(`Table ${num} added successfully to cafe layout!`);
      setNewTableNumber(String(num + 1));
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTable = async (table) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tables/${table.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete table");
      await refreshTables();
      setTableToDelete(null);
      setSuccessMsg(`Table ${table.tableNumber} removed from cafe layout.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    const q = searchQuery.toLowerCase();
    return tables.filter(t =>
      String(t.tableNumber).includes(q) ||
      (t.status || "").toLowerCase().includes(q) ||
      (t.customerName || "").toLowerCase().includes(q)
    );
  }, [tables, searchQuery]);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Icon.Tables />} label="Total Configured" value={stats.total} sub="Physical cafe tables" accent="amber" />
        <StatCard icon={<Icon.Check />} label="Available Tables" value={stats.available} sub="Ready for new guests" accent="emerald" />
        <StatCard icon={<Icon.Users />} label="Occupied Tables" value={stats.occupied} sub="Active customer sessions" accent="rose" />
      </div>

      {/* Add Table Card */}
      <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-[#14121E] to-[#0A090E] p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-lg">
            ➕
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Add New Dining Table</h3>
            <p className="text-xs text-slate-400">Configure a new physical table in the cafe layout and generate its digital menu route</p>
          </div>
        </div>

        <form onSubmit={handleAddTable} className="flex flex-col sm:flex-row items-start sm:items-end gap-3.5">
          <div className="w-full sm:w-64">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Table Number
            </label>
            <div className="relative flex items-center rounded-xl border border-amber-500/30 bg-[#08070D] px-3.5 py-2.5 focus-within:border-amber-400 transition shadow-inner">
              <span className="text-amber-400 font-bold text-sm mr-2 font-mono">T</span>
              <input
                type="number"
                min="1"
                step="1"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder="e.g. 11"
                className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder-slate-600"
              />
            </div>
          </div>

          <div className="flex-1 w-full sm:w-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 hidden sm:block">Customer Route Preview</div>
            <div className="rounded-xl border border-white/5 bg-white/2 px-3.5 py-2.5 text-xs text-slate-400 font-mono flex items-center justify-between">
              <span>Route: <span className="text-amber-300 font-bold">/table/{newTableNumber || "X"}</span></span>
              <span className="text-[10px] text-slate-500">Auto-generated</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading || !newTableNumber}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400/50 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:from-amber-400 hover:to-amber-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {actionLoading ? "Adding…" : "Add Table"}
          </button>
        </form>

        {formError && (
          <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl animate-in fade-in">
            ⚠️ {formError}
          </div>
        )}

        {successMsg && (
          <div className="mt-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl animate-in fade-in">
            ✅ {successMsg}
          </div>
        )}
      </div>

      {/* Tables Registry List */}
      <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#13121C] to-[#0A090E] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Icon.Tables /> Configured Cafe Tables ({tables.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage live dining tables or remove unused tables</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search table number…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-[#08070D] border border-amber-900/30 px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/50 transition"
            />
            <div className="absolute left-3 top-2.5 text-slate-500 text-xs">
              🔍
            </div>
          </div>
        </div>

        {/* Table layout cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTables.map((t) => {
            const cfg = TABLE_STATUS_CONFIG[t.status] || TABLE_STATUS_CONFIG.available;
            const isOccupied = t.status !== "available";

            return (
              <div
                key={t.id || t.cardId}
                className="flex items-center justify-between p-4 rounded-xl bg-[#09080E] border border-white/5 hover:border-amber-500/30 transition shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-extrabold text-base">
                    T{t.tableNumber}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      Table {t.tableNumber}
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <a
                      href={`/table/${t.tableNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline mt-1 inline-flex items-center gap-1 font-mono font-semibold"
                    >
                      /table/{t.tableNumber} ↗
                    </a>
                  </div>
                </div>

                <div>
                  {isOccupied ? (
                    <span
                      title="This table is currently occupied by guests and cannot be removed until the session is completed."
                      className="text-[10px] text-slate-400 font-semibold px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg cursor-not-allowed inline-block"
                    >
                      Active Seating
                    </span>
                  ) : (
                    <button
                      onClick={() => setTableToDelete(t)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition active:scale-95 cursor-pointer"
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── REMOVE TABLE CONFIRMATION MODAL ── */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[24px] border border-rose-500/40 bg-gradient-to-b from-[#1E1116] to-[#0A0507] p-6 text-center shadow-[0_0_30px_rgba(244,63,94,0.25)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/50 bg-rose-500/10 text-rose-400 text-xl mb-4">
              🗑️
            </div>
            <h3 className="text-base font-extrabold text-white">Remove Table {tableToDelete.tableNumber}?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">Table {tableToDelete.tableNumber}</strong> from the cafe layout?
              This table will no longer appear in the table overview or table status screen.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setTableToDelete(null)}
                className="flex-1 rounded-xl border border-slate-700 bg-[#0F0E17] py-2.5 text-xs font-bold text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleDeleteTable(tableToDelete)}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 border border-rose-450 py-2.5 text-xs font-bold text-white shadow-md hover:from-rose-500 hover:to-rose-600 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Removing…" : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PRODUCT FORM MODAL  (receives categories from DB)
// ─────────────────────────────────────────────
function ProductModal({ product, categories, onSave, onClose }) {
  const defaultCatId = categories.length > 0 ? categories[0].id : 1;
  const [form, setForm] = useState(
    product
      ? {
        ...product,
        categoryId: product.categoryId || defaultCatId,
        image: product.image || product.imageUrl || "",
        prepTime: product.prepTime || "",
        calories: product.calories || "",
      }
      : {
        name: "",
        categoryId: defaultCatId,
        price: "",
        available: true,
        dietary: "veg",
        isBestseller: false,
        image: "",
        description: "",
        prepTime: "",
        calories: "",
      }
  );
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#13121C] to-[#0A090E] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 px-6 py-4">
          <h3 className="text-base font-bold text-amber-300">{product?.id ? "Edit Product" : "Add New Product"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <Icon.Close />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Image URL preview */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Image URL</label>
              <span className="text-[10px] text-amber-400/90 font-medium">✨ Google Drive links supported</span>
            </div>
            <input
              value={form.image}
              onChange={e => {
                const val = e.target.value;
                const formatted = formatDriveImageUrl(val);
                set("image", formatted);
              }}
              placeholder="https://drive.google.com/file/d/... or direct image link"
              className="mt-1.5 w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400 transition"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Paste direct image URLs or Google Drive sharing links (ensure permission is set to "Anyone with the link").
            </p>
            {form.image && (
              <div className="relative mt-2">
                <img
                  src={form.image}
                  alt="Product preview"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="h-28 w-full object-cover rounded-xl border border-amber-500/20 bg-black/40"
                />
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Name *</label>
            <input
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="e.g. Phantom Dark Roast"
              className="mt-1.5 w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
            <input
              value={form.description || ""}
              onChange={e => set("description", e.target.value)}
              placeholder="A short description…"
              className="mt-1.5 w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Category + Price row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={form.categoryId}
                onChange={e => set("categoryId", Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-400 transition appearance-none"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => set("price", e.target.value)}
                placeholder="0"
                className="mt-1.5 w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* PREP TIME + CALORIES */}
          <div className="grid grid-cols-2 gap-3">

            {/* PREP TIME */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Prep Time
              </label>

              <input
                type="text"
                value={form.prepTime || ""}
                onChange={(e) =>
                  set("prepTime", e.target.value)
                }
                placeholder="e.g. 10-15 min"
                className="mt-1.5 w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* CALORIES */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Calories
              </label>

              <input
                type="text"
                value={form.calories || ""}
                onChange={(e) =>
                  set("calories", e.target.value)
                }
                placeholder="e.g. 250 kcal"
                className="mt-1.5 w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400 transition"
              />
            </div>

          </div>
          {/* Dietary */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dietary Type</label>
            <div className="flex gap-2 mt-1.5">
              {["veg", "non-veg", "vegan"].map(d => {
                const cfg = DIETARY_CONFIG[d];
                return (
                  <button
                    key={d}
                    onClick={() => set("dietary", d)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${form.dietary === d ? `${cfg.bg} ${cfg.color}` : "bg-[#0F0E17] border-amber-900/30 text-slate-500"}`}
                  >{cfg.label}</button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-3">
            {[
              { key: "available", label: "Available" },
              { key: "isBestseller", label: "Bestseller" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => set(key, !form[key])}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition ${form[key] ? "bg-amber-500/20 border-amber-400/60 text-amber-300" : "bg-[#0F0E17] border-amber-900/30 text-slate-500"}`}
              >
                <span className={`h-2 w-2 rounded-full ${form[key] ? "bg-amber-400" : "bg-slate-600"}`} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-amber-500/20 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-600 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition">
            Cancel
          </button>
          <button
            disabled={saving || !form.name || !form.price}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-2.5 text-sm font-bold text-white shadow-md hover:from-amber-500 hover:to-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : product?.id ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PRODUCTS PANEL  (fetches from /api/dishes, does CRUD)
// ─────────────────────────────────────────────
function ProductsPanel({ products, setProducts, onUpdateProductAvailability, categories, refreshProducts, isChef = false }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const filtered = useMemo(() => products.filter(p =>
    (catFilter === "all" || p.category === catFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [products, search, catFilter]);

  // ── CREATE or UPDATE via API ──
  const handleSave = async (form) => {
    try {
      const payload = {
        name: form.name,
        categoryId:
          Number(form.categoryId) ||
          (categories.length > 0
            ? categories[0].id
            : 1),
        price: Number(form.price),
        dietary: form.dietary || "veg",
        isBestseller: !!form.isBestseller,
        isSpooky: !!form.isSpooky,
        available:
          form.available !== undefined
            ? form.available
            : true,
        imageUrl:
          formatDriveImageUrl(form.image || form.imageUrl) ||
          null,
        description:
          form.description ||
          null,
        prepTime:
          form.prepTime ||
          null,
        calories:
          form.calories ||
          null,
        hasCustomization:
          !!form.hasCustomization,
        options:
          form.options || null,
      };

      if (form.id) {
        // UPDATE
        await fetch(`/api/dishes/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE
        await fetch("/api/dishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      refreshProducts();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // ── DELETE via API ──
  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await fetch(`/api/dishes/${id}`, { method: "DELETE" });
      refreshProducts();
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setDeleting(false);
    setDeleteConfirm(null);
  };

  // ── TOGGLE AVAILABILITY via API (0ms Instant Optimistic UI) ──
  const toggleAvailable = async (id, currentAvail) => {
    const isCurrentlyAvail = currentAvail !== false;
    const nextAvail = !isCurrentlyAvail;
    const numId = Number(id);
    setTogglingId(numId);

    // 1. Instant 0ms local state update on Admin screen with guard
    if (onUpdateProductAvailability) {
      onUpdateProductAvailability(numId, nextAvail);
    } else if (setProducts) {
      setProducts((prev) =>
        prev.map((p) => (Number(p.id) === numId ? { ...p, available: nextAvail } : p))
      );
    }

    // 2. Broadcast immediately to any open customer screens (0ms sync)
    try {
      if (typeof window !== "undefined" && window.BroadcastChannel) {
        new BroadcastChannel("rip_cafe_live_sync").postMessage({
          type: "MENU_UPDATE",
          dishId: numId,
          available: nextAvail,
          version: Date.now().toString(),
        });
      }
    } catch (e) {}

    // 3. Save to database in background
    try {
      await fetch(`/api/dishes/${numId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: nextAvail }),
      });
    } catch (err) {
      console.error("Toggle failed:", err);
      if (refreshProducts) refreshProducts();
    } finally {
      setTimeout(() => setTogglingId(null), 300);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Icon.Products />} label="Total Products" value={products.length} accent="amber" />
        <StatCard icon={<Icon.Check />} label="Available" value={products.filter(p => p.available !== false).length} accent="emerald" />
        <StatCard icon={<Icon.Star />} label="Bestsellers" value={products.filter(p => p.isBestseller).length} accent="amber" />
        <StatCard icon={<Icon.Toggle />} label="Unavailable" value={products.filter(p => p.available === false).length} accent="rose" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">

        {/* Search */}
        <div className="relative w-full flex items-center rounded-xl border border-amber-500/30 bg-[#0C0B12] px-4 py-2.5 focus-within:border-amber-400 transition">
          <Icon.Search />

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>

        {/* Category + Add Product */}
        <div className="grid grid-cols-2 gap-3">

          {/* Category */}
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="min-w-0 w-full rounded-xl border border-amber-500/25 bg-[#0C0B12] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-amber-400 transition"
          >
            <option value="all">
              All Categories
            </option>

            {categories.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Add Product */}
          <button
            onClick={() => {
              setEditTarget(null);
              setShowModal(true);
            }}
            className="w-full min-w-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-3 py-2.5 text-sm font-bold text-white shadow-md hover:from-amber-500 hover:to-amber-600 transition"
          >
            <Icon.Plus />
            <span className="truncate">
              Add Product
            </span>
          </button>

        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(product => {
          const isAvail = product.available !== false;
          const dietCfg = DIETARY_CONFIG[product.dietary] || DIETARY_CONFIG.veg;
          const isToggling = togglingId === Number(product.id);
          return (
            <div key={product.id} className={`group relative rounded-2xl border ${isAvail ? "border-amber-500/25" : "border-rose-500/30"} bg-gradient-to-b from-[#13121C] to-[#0A090E] overflow-hidden shadow-xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-amber-500/10 flex flex-col justify-between`}>
              {/* Image */}
              <div className="relative h-36 overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${!isAvail ? "opacity-35 grayscale" : ""}`} loading="lazy" />
                ) : (
                  <div className={`h-full w-full bg-slate-800 flex items-center justify-center text-slate-600 text-xs ${!isAvail ? "opacity-35" : ""}`}>No image</div>
                )}
                {/* Badges overlay */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${dietCfg.bg} ${dietCfg.color}`}>{dietCfg.label}</span>
                  {product.isBestseller && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold text-black uppercase">Best</span>}
                </div>
                {!isAvail && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                    <span className="rounded-full bg-rose-950/80 border border-rose-500/50 px-3 py-1 text-[11px] font-extrabold text-rose-300 uppercase tracking-wider shadow-lg">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium mb-1">{product.category}</div>
                  <div className="text-sm font-bold text-white line-clamp-1">{product.name}</div>
                  <div className="flex items-center justify-between mt-2">
                    {!isChef && <div className="text-base font-extrabold text-amber-400">₹{product.price}</div>}
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${isAvail ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`}>
                      {isAvail ? "AVAILABLE" : "UNAVAILABLE"}
                    </span>
                  </div>
                </div>

                {/* Action row */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  {/* Toggle available Switch */}
                  <button
                    onClick={() => toggleAvailable(product.id, isAvail)}
                    className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                      isAvail
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                        : "bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25"
                    }`}
                    title={isAvail ? "Click to set UNAVAILABLE (Sold Out)" : "Click to set AVAILABLE (In Stock)"}
                  >
                    <div className="flex items-center gap-1.5 truncate mr-1">
                      {isToggling ? (
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-white/40 border-t-white animate-spin shrink-0" />
                      ) : (
                        <span className={`h-2 w-2 rounded-full shrink-0 ${isAvail ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
                      )}
                      <span className="truncate">{isAvail ? "Available" : "Unavailable"}</span>
                    </div>
                    <div className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors p-0.5 ${isAvail ? "bg-emerald-500" : "bg-slate-700"}`}>
                      <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${isAvail ? "translate-x-3" : "translate-x-0"}`} />
                    </div>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => { setEditTarget(product); setShowModal(true); }}
                    className="flex items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                    title="Edit Product"
                  >
                    <Icon.Edit />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirm(product)}
                    className="flex items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                    title="Delete Product"
                  >
                    <Icon.Delete />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showModal && (
        <ProductModal
          product={editTarget}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 rounded-2xl border border-rose-500/30 bg-[#13121C] p-6 text-center shadow-2xl max-w-sm w-full">
            <div className="flex justify-center mb-3 text-rose-400"><Icon.Delete /></div>
            <h3 className="text-base font-bold text-white mb-1">Delete Product?</h3>
            <p className="text-sm text-amber-300 font-semibold mb-1 truncate px-2">&ldquo;{deleteConfirm.name}&rdquo;</p>
            <p className="text-xs text-slate-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl border border-slate-600 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition">Cancel</button>
              <button disabled={deleting} onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 py-2.5 text-sm font-bold text-white hover:from-rose-500 transition disabled:opacity-50">{deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CATEGORIES PANEL
// ─────────────────────────────────────────────
function CategoriesPanel({ categories, products, refreshCategories }) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to create");
      } else {
        setNewName("");
        refreshCategories();
      }
    } catch (err) {
      setError("Network error");
    }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to delete");
      } else {
        refreshCategories();
      }
    } catch (err) {
      setError("Network error");
    }
    setDeleting(false);
    setDeleteConfirm(null);
  };

  const PALETTE = ["#d97706", "#2563eb", "#0d9488", "#ea580c", "#9333ea", "#e11d48", "#16a34a", "#0891b2"];

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard icon={<Icon.Tags />} label="Total Categories" value={categories.length} accent="amber" />
        <StatCard icon={<Icon.Products />} label="Menu Items" value={products.length} sub="Across all categories" accent="emerald" />
        <StatCard icon={<Icon.Star />} label="Avg Items / Category" value={categories.length ? (products.length / categories.length).toFixed(1) : "0"} sub="Per category" accent="violet" />
      </div>

      {/* Add new category */}
      <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#13121C] to-[#0A090E] p-4 sm:p-5 shadow-xl">

        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Icon.Plus />
          Add New Category
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 w-full">

          {/* Category Name */}
          <input
            value={newName}
            onChange={e => {
              setNewName(e.target.value);
              setError("");
            }}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Starters, Desserts..."
            className="w-full min-w-0 flex-1 rounded-xl border border-amber-500/25 bg-[#0C0B12] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-amber-400 transition"
          />

          {/* Add Category Button */}
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-sm font-bold text-white hover:from-amber-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon.Plus />

            <span>
              {adding ? "Adding…" : "Add Category"}
            </span>
          </button>

        </div>

        {error && (
          <p className="mt-2 text-xs text-rose-400">
            {error}
          </p>
        )}

      </div>

      {/* Categories list */}
      <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#13121C] to-[#0A090E] p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Icon.Tags /> All Categories</h3>
        {categories.length === 0 && (
          <div className="py-10 text-center text-slate-500 text-sm">No categories found. Add one above.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat, i) => {
            const catProds = products.filter(p => p.category === cat.name);
            const color = PALETTE[i % PALETTE.length];
            return (
              <div
                key={cat.id}
                className="group relative flex items-center gap-3 rounded-2xl border border-white/8 bg-white/2 px-4 py-4 hover:border-amber-500/30 transition-all duration-200"
                style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
              >
                {/* Color dot */}
                <div className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
                  <Icon.Tags />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{cat.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{catProds.length} product{catProds.length !== 1 ? "s" : ""}</div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => setDeleteConfirm(cat)}
                  className="shrink-0 flex items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/5 p-2 text-rose-400 hover:bg-rose-500/20 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                  title="Delete category"
                >
                  <Icon.Delete />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 rounded-2xl border border-rose-500/30 bg-[#13121C] p-6 text-center shadow-2xl max-w-sm w-full">
            <div className="flex justify-center mb-3 text-rose-400"><Icon.Delete /></div>
            <h3 className="text-base font-bold text-white mb-1">Delete Category?</h3>
            <p className="text-sm text-amber-300 font-semibold mb-1">&ldquo;{deleteConfirm.name}&rdquo;</p>
            <p className="text-xs text-slate-400 mb-1">All products in this category will become uncategorised.</p>
            <p className="text-xs text-rose-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl border border-slate-600 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition">Cancel</button>
              <button disabled={deleting} onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 py-2.5 text-sm font-bold text-white hover:from-rose-500 transition disabled:opacity-50">{deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TRENDING TODAY PANEL  (uses products from DB, orders still mock)
// ─────────────────────────────────────────────
function TrendingPanel({ products, categories, orders }) {
  const trending = useMemo(() => {
    const counts = {};
    orders.forEach(o => o.items.forEach(item => {
      counts[item.name] = (counts[item.name] || 0) + item.qty;
    }));

    return products
      .map(p => ({ ...p, orderCount: counts[p.name] || 0 }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 8);
  }, [products, orders]);

  const maxOrders = Math.max(...trending.map(p => p.orderCount), 1);

  const hourlyData = [
    { hour: "9AM", orders: 5 },
    { hour: "10AM", orders: 14 },
    { hour: "11AM", orders: 22 },
    { hour: "12PM", orders: 31 },
    { hour: "1PM", orders: 27 },
    { hour: "2PM", orders: 18 },
    { hour: "3PM", orders: 12 },
    { hour: "4PM", orders: 9 },
  ];

  const maxHourly = Math.max(...hourlyData.map(h => h.orders));

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Icon.Flame />} label="Hottest Item" value={trending[0]?.name.split(" ").slice(0, 2).join(" ") || "—"} sub={`${trending[0]?.orderCount || 0} ordered`} accent="amber" />
        <StatCard icon={<Icon.Products />} label="Menu Items" value={products.length} sub="In database" accent="amber" />
        <StatCard icon={<Icon.Orders />} label="Orders Today" value={orders.length} sub="Total placed" accent="blue" />
        <StatCard icon={<Icon.Users />} label="Covers Today" value={12} sub="Unique tables" accent="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top items list */}
        <div className="lg:col-span-2 rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#13121C] to-[#0A090E] p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 p-2 text-amber-400">
              <Icon.Trending />
            </div>
            <h3 className="text-sm font-bold text-white">Top Ordered Items Today</h3>
          </div>
          <div className="space-y-4">
            {trending.length === 0 && <div className="text-sm text-slate-500 text-center py-8">No order data yet.</div>}
            {trending.map((product, idx) => {
              const pct = (product.orderCount / maxOrders) * 100;
              const dietCfg = DIETARY_CONFIG[product.dietary] || DIETARY_CONFIG.veg;
              return (
                <div key={product.id} className="flex items-center gap-3 group">
                  <div className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-xl font-extrabold text-xs ${idx < 3 ? "bg-amber-500/20 border border-amber-400/40 text-amber-300" : "bg-slate-800 text-slate-500"}`}>
                    {idx + 1}
                  </div>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="shrink-0 h-9 w-9 rounded-xl object-cover border border-amber-500/20" />
                  ) : (
                    <div className="shrink-0 h-9 w-9 rounded-xl bg-slate-800 border border-amber-500/20" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs font-semibold text-slate-200 truncate">{product.name}</span>
                      {idx === 0 && <Icon.Flame />}
                      {product.isBestseller && <Icon.Star />}
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${idx === 0 ? "bg-gradient-to-r from-amber-500 to-amber-400" : idx < 3 ? "bg-gradient-to-r from-amber-600 to-amber-500" : "bg-gradient-to-r from-slate-600 to-slate-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-extrabold text-amber-400">{product.orderCount}</div>
                    <span className={`text-[9px] font-bold ${dietCfg.color}`}>{dietCfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly chart */}
        <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#13121C] to-[#0A090E] p-5 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 p-2 text-blue-400">
              <Icon.Clock />
            </div>
            <h3 className="text-sm font-bold text-white">Hourly Orders</h3>
          </div>

          <div className="flex-1 flex items-end gap-2">
            {hourlyData.map((h, i) => {
              const pct = (h.orders / maxHourly) * 100;
              const isNow = i === 2;
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-bold text-amber-400 tabular-nums">{h.orders}</span>
                  <div className="w-full rounded-t-md overflow-hidden" style={{ height: "80px" }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-700 ${isNow ? "bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-gradient-to-t from-slate-700 to-slate-600"}`}
                      style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500">{h.hour}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <div className="text-xs text-slate-400">Peak hour: <span className="text-amber-400 font-bold">12PM (31 orders)</span></div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#13121C] to-[#0A090E] p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">Products by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => {
            const catProds = products.filter(p => p.category === cat.name);
            const count = catProds.length;
            const total = products.length || 1;
            const pct = ((count / total) * 100).toFixed(0);
            return (
              <div key={cat.id} className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/2 p-3">
                <div className="relative h-14 w-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e1e2e" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke={["#d97706", "#2563eb", "#0d9488", "#ea580c", "#9333ea", "#e11d48"][i % 6]}
                      strokeWidth="3"
                      strokeDasharray={`${pct} ${100 - pct}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-extrabold text-white">{pct}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] font-bold text-slate-300 leading-snug">{cat.name.split(" ")[0]}</div>
                  <div className="text-[9px] text-slate-500">{count} items</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN ADMIN DASHBOARD
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Guard against background polling overwriting in-flight optimistic status updates
  const recentLocalUpdatesRef = useRef(new Map());
  const recentProductUpdatesRef = useRef(new Map());

  const handleUpdateOrderStatus = useCallback((rawId, nextStatus) => {
    recentLocalUpdatesRef.current.set(rawId, { status: nextStatus, timestamp: Date.now() });
    setOrders((prev) =>
      prev.map((o) =>
        o.rawId === rawId || o.id === rawId || o.id === `RIP-${rawId}` ? { ...o, status: nextStatus } : o
      )
    );
  }, []);

  const handleUpdateProductAvailability = useCallback((dishId, nextAvail) => {
    const numId = Number(dishId);
    recentProductUpdatesRef.current.set(numId, { available: nextAvail, timestamp: Date.now() });
    setProducts((prev) =>
      prev.map((p) => (Number(p.id) === numId ? { ...p, available: nextAvail } : p))
    );
  }, []);

  // ── Session check on mount ──
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setCurrentUser(data.user);
          } else {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    }
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setCurrentUser(null);
  };

  // ── Fetch orders from DB with optimistic guard ──
  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const mapped = data.map(mapOrderToAdmin);
      const now = Date.now();

      setOrders(mapped.map((o) => {
        const local = recentLocalUpdatesRef.current.get(o.rawId);
        if (local && (now - local.timestamp < 6000)) {
          // Local update is fresh, keep optimistic status until server catches up
          return { ...o, status: local.status };
        }
        return o;
      }));
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // ── Fetch products from DB with optimistic guard ──
  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/dishes?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const mapped = data.map(mapDishToProduct);
      const now = Date.now();
      setProducts(mapped.map((p) => {
        const local = recentProductUpdatesRef.current.get(Number(p.id));
        if (local && (now - local.timestamp < 6000)) {
          // Local update is fresh, keep optimistic state until server catches up
          return { ...p, available: local.available };
        }
        return p;
      }));
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // ── Fetch categories from DB ──
  const refreshCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const initialNotifLoaded = useRef(false);
  const playedNotificationIdsRef = useRef(new Set());

  // Play synthesized service bell sound 3 times using Web Audio API (offline & CORS-free)
  const playBellSoundThrice = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      let playCount = 0;

      const triggerDing = () => {
        if (playCount >= 3) return;

        const now = ctx.currentTime;

        // Fundamental high frequency (1500Hz) and secondary clean overtone (2400Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(1500, now);
        osc2.frequency.setValueAtTime(2400, now);

        // Exponential volume decay envelope
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.35, now + 0.03); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.65); // Decay

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.7);
        osc2.start(now);
        osc2.stop(now + 0.7);

        playCount++;
        setTimeout(triggerDing, 400); // 400ms interval between rings
      };

      triggerDing();
    } catch (e) {
      console.warn("Web Audio API sound synthesis failed:", e);
    }
  }, []);

  // ── Fetch notifications from API ──
  const refreshNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;

      setNotifications(data);

      if (initialNotifLoaded.current) {
        // Find truly new notifications that have never played the bell
        const trulyNew = data.filter((n) => !playedNotificationIdsRef.current.has(String(n.id)));
        if (trulyNew.length > 0) {
          trulyNew.forEach((n) => playedNotificationIdsRef.current.add(String(n.id)));
          playBellSoundThrice();
        }
      } else {
        // On initial mount, mark all existing notifications as known
        data.forEach((n) => playedNotificationIdsRef.current.add(String(n.id)));
        initialNotifLoaded.current = true;
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, [playBellSoundThrice]);

  // ── Dismiss notification with instant optimistic UI update ──
  const handleDismissNotification = async (id) => {
    // 1. Instant local removal (0ms visual feedback)
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    playedNotificationIdsRef.current.add(id);

    // 2. Persist dismissal to database in background
    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
    }
  };

  // ── Dismiss all notifications at once ──
  const handleClearAllNotifications = async () => {
    const currentIds = notifications.map((n) => n.id);
    currentIds.forEach((id) => playedNotificationIdsRef.current.add(id));
    setNotifications([]);

    try {
      await Promise.all(
        currentIds.map((id) =>
          fetch(`/api/notifications?id=${id}`, { method: "DELETE" })
        )
      );
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  // ── Fetch tables from DB ──
  const refreshTables = useCallback(async () => {
    try {
      const res = await fetch("/api/tables");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setTables(data.flatMap(mapTableSessionsFromDb));
    } catch (err) {
      console.error("Failed to load tables:", err);
    } finally {
      setTablesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    refreshProducts();
    refreshCategories();
    refreshOrders();
    refreshNotifications();
    refreshTables();

    // ── Live instant sync via BroadcastChannel (0ms cross-tab update) ──
    let bc = null;
    try {
      if (typeof window !== "undefined" && window.BroadcastChannel) {
        bc = new BroadcastChannel("rip_cafe_live_sync");
        bc.onmessage = (msg) => {
          if (msg.data?.type === "ORDER_UPDATE" || msg.data?.type === "ORDER_CANCELLED") {
            refreshOrders();
            refreshTables();
          } else if (msg.data?.type === "MENU_UPDATE") {
            refreshProducts();
            refreshCategories();
          }
        };
      }
    } catch (e) {}

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      refreshOrders();
      refreshNotifications();
      refreshTables();
    }, 4000);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, [currentUser, refreshProducts, refreshCategories, refreshOrders, refreshNotifications, refreshTables]);

  const isChef = currentUser?.role === "CHEF";

  const navItems = useMemo(() => {
    const items = [
      { id: "overview", label: "Overview", icon: <Icon.Grid />, chefAllowed: true },
      { id: "orders", label: "View Orders", icon: <Icon.Orders />, chefAllowed: true },
      { id: "products", label: "Products", icon: <Icon.Products />, chefAllowed: true },
      { id: "tables", label: "Table Status", icon: <Icon.Tables />, chefAllowed: true },
      { id: "billing", label: "Billing", icon: <Icon.Billing />, chefAllowed: true },
      { id: "table-qr", label: "Table QR Codes", icon: <Icon.QrCode />, chefAllowed: false },
      { id: "manage-tables", label: "Manage Tables", icon: <Icon.TableConfig />, chefAllowed: false },
      { id: "revenue", label: "Revenue Analytics", icon: <Icon.Revenue />, chefAllowed: false },
      { id: "categories", label: "Categories", icon: <Icon.Tags />, chefAllowed: false },
      { id: "trending", label: "Trending Today", icon: <Icon.Trending />, chefAllowed: false },
      { id: "settings", label: "Settings", icon: <Icon.Edit />, chefAllowed: false },
    ];
    if (isChef) {
      return items.filter((item) => item.chefAllowed);
    }
    return items;
  }, [isChef]);

  // Overview stats — cancelled orders excluded from revenue
  const overviewStats = useMemo(() => {
    const revenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
    const occupied = tables.filter(t => t.status === "occupied").length;
    const pendingOrders = orders.filter(o => !['served', 'cancelled'].includes(o.status)).length;
    const topProduct = products.length > 0 ? products[0] : null;
    return { revenue, occupied, pendingOrders, topProduct };
  }, [orders, tables, products]);

  // Chef Kitchen Preparing Orders list — strictly only today's orders currently in "preparing" status
  const kitchenPreparingOrders = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter((o) => {
      const isToday = o.createdAt && new Date(o.createdAt).toDateString() === today;
      return isToday && (o.status || "").toLowerCase() === "preparing";
    });
  }, [orders]);

  // Aggregate preparing dish quantities strictly from today's orders with status "preparing"
  const preparingDishesSummary = useMemo(() => {
    const today = new Date().toDateString();
    const preparingOrders = orders.filter((o) => {
      const isToday = o.createdAt && new Date(o.createdAt).toDateString() === today;
      return isToday && (o.status || "").toLowerCase() === "preparing";
    });

    const dishMap = {};
    preparingOrders.forEach((o) => {
      o.items?.forEach((item) => {
        const name = item.name || "Dish";
        dishMap[name] = (dishMap[name] || 0) + (item.qty || 1);
      });
    });

    return Object.entries(dishMap).map(([name, qty]) => ({ name, qty }));
  }, [orders]);

  const handleCycleOrderStatus = async (order) => {
    const s = (order.status || "").toLowerCase();
    const nextStatus = (s === "pending" || s === "received")
      ? "preparing"
      : s === "preparing"
      ? "ready"
      : "served";

    // Instant optimistic local state update
    setOrders((prev) =>
      prev.map((o) =>
        o.rawId === order.rawId || o.id === order.id ? { ...o, status: nextStatus } : o
      )
    );

    try {
      if (typeof window !== "undefined" && window.BroadcastChannel) {
        new BroadcastChannel("rip_cafe_live_sync").postMessage({ type: "ORDER_UPDATE", orderId: order.rawId, status: nextStatus });
      }
    } catch (e) {}

    try {
      await fetch(`/api/orders/${order.rawId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to update order status:", err);
      refreshOrders();
    }
  };

  const getNextStatusLabel = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "cancelled") return "Cancelled";
    if (s === "pending" || s === "received") return "Mark Preparing";
    if (s === "preparing") return "Mark Ready";
    if (s === "ready") return "Mark Served";
    return "Served ✓";
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#030304] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AdminLogin onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030304] via-[#080710] to-[#040406] text-slate-100 antialiased font-sans selection:bg-amber-500 selection:text-black flex">

      {/* ── SIDEBAR ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-amber-500/15 bg-gradient-to-b from-[#0D0C14] to-[#060509] shadow-2xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 lg:flex`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-amber-500/20">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/50 border border-amber-500/30 p-1 shadow-[0_0_15px_rgba(245,158,11,0.25)] overflow-hidden">
            <img
              src="/logo.png"
              alt="Rest In Peace Cafe Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="text-xs font-extrabold text-amber-400 tracking-widest uppercase leading-none">Rest In Peace</div>
            <div className="text-[9px] text-slate-500 tracking-widest uppercase mt-0.5">
              {currentUser?.role === "CHEF" ? "Chef Portal" : "Admin Panel"}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === item.id
                ? "bg-gradient-to-r from-amber-600/25 to-amber-500/10 border border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                : "text-slate-400 hover:bg-amber-500/5 hover:text-amber-300 hover:border hover:border-amber-500/20 border border-transparent"
                }`}
            >
              <span className={activeTab === item.id ? "text-amber-400" : "text-slate-500"}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom info */}
        <div className="px-5 py-4 border-t border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] text-slate-400">Live · Sitra, Coimbatore</span>
          </div>
          <div className="text-[9px] text-slate-600 mt-0.5">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-amber-500/15 bg-[#0A090E]/95 px-3 sm:px-6 py-3 backdrop-blur-xl shadow-md">
          {/* Mobile hamburger + Page title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              className="lg:hidden flex flex-col justify-center items-center gap-1 p-1.5 rounded-lg bg-white/5 border border-white/10 text-amber-400 hover:bg-white/10 active:scale-95 transition shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Menu"
            >
              <span className="h-0.5 w-4 bg-amber-400 rounded" />
              <span className="h-0.5 w-4 bg-amber-400 rounded" />
              <span className="h-0.5 w-4 bg-amber-400 rounded" />
            </button>

            {/* Page title */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-amber-400 shrink-0">{navItems.find(n => n.id === activeTab)?.icon}</span>
              <h1 className="text-sm sm:text-base font-bold text-white truncate">{navItems.find(n => n.id === activeTab)?.label}</h1>
            </div>
          </div>

          {/* Right: notification + admin badge + logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 p-2 text-amber-400 hover:bg-amber-500/20 transition active:scale-95 cursor-pointer"
                title="Service Notifications"
              >
                <Icon.Bell />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown (Adaptive on mobile & desktop) */}
              {showNotifDropdown && (
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 z-50 w-auto sm:w-80 rounded-2xl border border-amber-500/30 bg-[#0F0E16]/98 backdrop-blur-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.9)] text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-3">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Service Notifications</span>
                    <div className="flex items-center gap-2">
                      {notifications.length > 1 && (
                        <button
                          onClick={handleClearAllNotifications}
                          className="text-[10px] text-amber-400/80 hover:text-amber-300 transition px-1.5 py-0.5 rounded hover:bg-amber-500/10 cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifDropdown(false)}
                        className="text-slate-500 hover:text-white transition px-2 py-0.5 rounded-md hover:bg-white/5 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                    {/* Waiter Calls Section */}
                    {notifications.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Waiter Requests</div>
                        {notifications.map((notif) => (
                          <div key={notif.id} className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-white/2 border border-white/5 hover:border-amber-500/30 transition">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="shrink-0 flex items-center justify-center rounded-lg bg-amber-955/60 border border-amber-500/30 text-amber-400 font-extrabold w-8 h-8 text-[11px]">
                                T{notif.tableNumber}
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-200 truncate">{notif.message}</p>
                                <p className="text-[9px] text-slate-500">{new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDismissNotification(notif.id)}
                              className="shrink-0 flex h-7 items-center justify-center rounded-lg bg-[#16121D] border border-amber-500/20 px-2 text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition active:scale-95 cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {notifications.length === 0 && (
                      <div className="text-center py-6 text-slate-500">
                        <div className="inline-block p-2 bg-slate-800/40 rounded-full mb-1 text-slate-600">🛎️</div>
                        <p className="font-semibold text-slate-400">All quiet right now</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">No active table calls.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-2.5 sm:px-3 py-1.5">
              <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs font-extrabold text-black uppercase shadow-sm shrink-0">
                {currentUser?.role === "CHEF" ? "👨‍🍳" : "🛡️"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-300 leading-tight max-w-[90px] md:max-w-none truncate">{currentUser?.name || "User"}</span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${currentUser?.role === "CHEF" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-violet-500/20 text-violet-300 border-violet-500/30"}`}>
                    {currentUser?.role === "CHEF" ? "Chef" : "Admin"}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 leading-tight max-w-[120px] md:max-w-none truncate">{currentUser?.email || "admin@ripcafe.com"}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Log Out"
              className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 transition active:scale-95 cursor-pointer"
            >
              <Icon.Logout />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">
                {/* Welcome */}
                <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-r from-[#16131F] to-[#0A090E] p-6 shadow-xl relative overflow-hidden">
                  <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
                  <div className="relative">
                    <h2 className="text-xl font-extrabold text-white mb-1">
                      {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"}, {currentUser?.name || "User"} {currentUser?.role === "CHEF" ? "👨‍🍳" : "☕"}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {currentUser?.role === "CHEF" ? "Here are active kitchen orders and dish operations for today." : "Here's what's happening at Rest In Peace Cafe today."}
                    </p>
                  </div>
                </div>

                {/* Chef Preparing Dishes Summary Card (Below Greetings) */}
                {isChef && (
                  <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#1A1429] via-[#0E0C18] to-[#08070F] p-5 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-lg text-amber-300">
                          👨‍🍳
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                            Preparing Dishes ({preparingDishesSummary.reduce((sum, d) => sum + d.qty, 0)} total items)
                          </h3>
                          <p className="text-xs text-slate-400">Aggregated quantities of dishes requiring kitchen preparation</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
                      >
                        View Kitchen Orders →
                      </button>
                    </div>

                    {preparingDishesSummary.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-xs italic">
                        ✨ No active preparing dishes in kitchen right now. Ready for new orders!
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {preparingDishesSummary.map((d, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-xl bg-white/3 border border-amber-500/20 px-3.5 py-2.5">
                            <span className="text-xs font-bold text-slate-100 truncate mr-2">{d.name}</span>
                            <span className="rounded-lg bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-xs font-mono font-extrabold text-amber-300 shrink-0">
                              ×{d.qty}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Key metrics */}
                <div className={`grid gap-4 ${isChef ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
                  {!isChef && (
                    <StatCard
                      icon={<Icon.Revenue />}
                      label="Today's Revenue"
                      value={`₹${overviewStats.revenue.toLocaleString()}`}
                      sub="Live total"
                      accent="amber"
                    />
                  )}
                  <StatCard icon={<Icon.Users />} label="Tables Occupied" value={`${overviewStats.occupied}/${tables.length}`} sub="Right now" accent="rose" />
                  <StatCard icon={<Icon.Orders />} label="Active Orders" value={overviewStats.pendingOrders} sub="Needs attention" accent="blue" />
                  <StatCard icon={<Icon.Products />} label="Menu Items" value={products.length} sub={productsLoading ? "Loading…" : "In database"} accent="amber" />
                </div>

                {/* Quick panels (Same for Admin & Chef: Recent Orders + Table Overview) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent orders */}
                  <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#13121C] to-[#0A090E] p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2"><Icon.Orders /> Recent Orders</h3>
                      <button onClick={() => setActiveTab("orders")} className="text-[10px] text-amber-400 hover:text-amber-300 transition font-semibold">View All →</button>
                    </div>
                    <div className="space-y-2">
                      {orders.slice(0, 4).map(o => {
                        const cfg = ORDER_STATUS_CONFIG[o.status];
                        return (
                          <div key={o.id} className="flex items-center justify-between rounded-xl bg-white/2 border border-white/5 px-3 py-2.5">
                            <div>
                              <div className="text-xs font-bold text-amber-400 font-mono">{o.id}</div>
                              <div className="text-[10px] text-slate-500">Table {o.table} · {o.time}</div>
                            </div>
                            <div className="text-right">
                              {!isChef && <div className="text-xs font-bold text-white">₹{o.total}</div>}
                              <Badge cfg={cfg} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Table quick view */}
                  <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#13121C] to-[#0A090E] p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2"><Icon.Tables /> Table Overview</h3>
                      <button onClick={() => setActiveTab("tables")} className="text-[10px] text-amber-400 hover:text-amber-300 transition font-semibold">Manage →</button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {tables.map(t => {
                        const cfg = TABLE_STATUS_CONFIG[t.status] || TABLE_STATUS_CONFIG.available;
                        return (
                          <div
                            key={t.cardId || t.id}
                            className={`flex flex-col items-center justify-center rounded-xl border ${cfg.border} bg-gradient-to-br ${cfg.gradient} aspect-square p-1 cursor-pointer hover:scale-105 transition`}
                            onClick={() => setActiveTab("tables")}
                          >
                            <span className="text-xs sm:text-sm font-extrabold text-white">{t.cardLabel || `T${t.tableNumber}`}</span>
                            <span className={`h-1.5 w-1.5 rounded-full mt-0.5 ${cfg.dot}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (ordersLoading ? <div className="py-16 text-center text-slate-500">Loading orders…</div> : <OrdersPanel orders={orders} setOrders={setOrders} onUpdateOrderStatus={handleUpdateOrderStatus} products={products} refreshOrders={refreshOrders} isChef={isChef} />)}
            {activeTab === "tables" && (tablesLoading ? <div className="py-16 text-center text-slate-500">Loading tables…</div> : <TablesPanel tables={tables} refreshTables={refreshTables} />)}
            {activeTab === "table-qr" && (tablesLoading ? <div className="py-16 text-center text-slate-500">Loading tables…</div> : <TableQRStudio tables={tables} refreshTables={refreshTables} />)}
            {activeTab === "manage-tables" && (tablesLoading ? <div className="py-16 text-center text-slate-500">Loading tables…</div> : <ManageTablesPanel tables={tables} refreshTables={refreshTables} />)}
            {activeTab === "billing" && <BillingPanel />}
            {activeTab === "revenue" && (ordersLoading ? <div className="py-16 text-center text-slate-500">Loading revenue analytics…</div> : <RevenueAnalytics orders={orders} products={products} categories={categories} />)}
            {activeTab === "products" && (productsLoading ? <div className="py-16 text-center text-slate-500">Loading products…</div> : <ProductsPanel products={products} setProducts={setProducts} onUpdateProductAvailability={handleUpdateProductAvailability} categories={categories} refreshProducts={refreshProducts} isChef={isChef} />)}
            {activeTab === "categories" && <CategoriesPanel categories={categories} products={products} refreshCategories={refreshCategories} />}
            {activeTab === "trending" && <TrendingPanel products={products} categories={categories} orders={orders} />}
            {activeTab === "settings" && (!isChef ? <SettingsPanel currentUser={currentUser} /> : <div className="py-16 text-center text-slate-400 text-sm">Access Denied: Only Admin can access Settings</div>)}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EDIT BILL MODAL (Active & Settled Bills)
// ─────────────────────────────────────────────
function EditBillModal({ session, products, onClose, onSave }) {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialize items from session's orders (supports orderItems and mapped items)
  useEffect(() => {
    if (!session) return;
    const agg = {};
    (session.orders || []).forEach(o => {
      if ((o.status || "").toLowerCase() === "cancelled") return;
      const rawItems = o.items || o.orderItems || [];
      rawItems.forEach(i => {
        const dishId = i.dishId || i.dish?.id || i.id;
        const name = i.name || i.dish?.name || "Item";
        const price = Number(i.price);
        const qty = Number(i.qty || i.quantity || 1);
        if (dishId) {
          if (agg[dishId]) {
            agg[dishId].quantity += qty;
          } else {
            agg[dishId] = {
              dishId,
              name,
              price,
              quantity: qty
            };
          }
        }
      });
    });
    setItems(Object.values(agg));
  }, [session]);

  const billTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return (products || []).slice(0, 8);
    const q = searchQuery.toLowerCase();
    return (products || []).filter(p => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  const updateQty = (dishId, delta) => {
    setItems(prev => {
      return prev.map(item => {
        if (item.dishId === dishId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeItem = (dishId) => {
    setItems(prev => prev.filter(item => item.dishId !== dishId));
  };

  const addProductToBill = (product) => {
    setItems(prev => {
      const existing = prev.find(item => item.dishId === product.id);
      if (existing) {
        return prev.map(item =>
          item.dishId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, {
          dishId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1
        }];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = items.map(i => ({
        dishId: i.dishId,
        quantity: i.quantity,
        price: i.price
      }));
      await onSave(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const tableDisplay = session.tableNumber || session.table?.tableNumber || "-";
  const customerDisplay = session.customerName || session.customer?.name || "Walk-in Guest";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-2xl border border-amber-500/25 bg-gradient-to-br from-[#13121C] to-[#09080E] p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-hidden">

        {/* Left Side: Current Bill Items */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                ✏️ Edit Bill Details
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Table {tableDisplay} • {customerDisplay}
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {items.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                No items in bill. Use the right panel to search and add menu items.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.dishId} className="flex items-center justify-between bg-white/5 border border-white/5 p-3 rounded-xl hover:border-white/10 transition">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">₹{item.price} each</div>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => updateQty(item.dishId, -1)}
                      className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white active:scale-90 flex items-center justify-center text-sm font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-white font-mono w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.dishId, 1)}
                      className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white active:scale-90 flex items-center justify-center text-sm font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Line total & remove */}
                  <div className="w-20 text-right font-mono text-xs font-bold text-white pl-3">
                    ₹{item.price * item.quantity}
                  </div>
                  <button
                    onClick={() => removeItem(item.dishId)}
                    className="h-7 w-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center justify-center text-xs transition active:scale-90 cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Total */}
          <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Bill Amount</div>
              <div className="text-xl font-extrabold text-amber-400 font-mono">₹{billTotal.toLocaleString("en-IN")}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-bold active:scale-95 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400/50 text-black text-xs font-bold active:scale-95 transition disabled:opacity-55 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)]"
              >
                {saving ? "Saving Changes…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Add Menu Search */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 flex flex-col min-h-0">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search Menu Items</div>
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Type dish name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-[#09080E] border border-amber-950/40 px-3.5 py-2.5 pl-9 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/50 transition"
            />
            <div className="absolute left-3 top-3 text-slate-500 text-xs">
              🔍
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px] md:min-h-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-600 italic text-xs">
                No matching dishes found.
              </div>
            ) : (
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addProductToBill(p)}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-transparent hover:border-amber-500/30 hover:bg-amber-500/5 cursor-pointer transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400">₹{p.price}</div>
                  </div>
                  <div className="h-6 w-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">
                    +
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

