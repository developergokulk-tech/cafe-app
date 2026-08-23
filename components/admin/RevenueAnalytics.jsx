"use client";

import { useState, useMemo } from "react";

export default function RevenueAnalytics({ orders = [], products = [], categories = [] }) {
  const [timeframe, setTimeframe] = useState("today"); // 'today', 'weekly', 'monthly', 'yearly', 'custom'
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'served', 'completed', 'active'
  const [searchLedger, setSearchLedger] = useState("");

  // Normalize and parse order dates safely
  const validOrders = useMemo(() => {
    return (orders || []).map((o) => {
      const dateObj = o.createdAt ? new Date(o.createdAt) : new Date();
      const amount = Number(o.total ?? o.totalAmount ?? o.numericTotal ?? 0);
      const isCancelled = (o.status || "").toLowerCase() === "cancelled";
      return {
        ...o,
        numericTotal: amount,
        orderDate: dateObj,
        isCancelled,
        tableNumber: o.tableNumber || o.table || 1,
      };
    });
  }, [orders]);

  // Filter orders based on active timeframe
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return validOrders.filter((o) => {
      // Exclude cancelled orders from revenue calculation
      if (o.isCancelled) return false;

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "served" && (o.status || "").toLowerCase() !== "served") return false;
        if (statusFilter === "preparing" && (o.status || "").toLowerCase() !== "preparing") return false;
      }

      const oDate = o.orderDate;

      if (timeframe === "today") {
        return oDate >= todayStart && oDate <= todayEnd;
      } else if (timeframe === "weekly") {
        // Last 7 days
        const sevenDaysAgo = new Date(todayStart);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        return oDate >= sevenDaysAgo && oDate <= todayEnd;
      } else if (timeframe === "monthly") {
        // Current calendar month
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        return oDate >= firstDayOfMonth && oDate <= todayEnd;
      } else if (timeframe === "yearly") {
        // Current calendar year
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        return oDate >= firstDayOfYear && oDate <= todayEnd;
      } else if (timeframe === "custom") {
        if (!customStartDate || !customEndDate) return true;
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return oDate >= start && oDate <= end;
      }
      return true;
    });
  }, [validOrders, timeframe, customStartDate, customEndDate, statusFilter]);

  // Key KPI Metrics
  const kpis = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.numericTotal, 0);
    const orderCount = filteredOrders.length;
    const avgOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;
    
    // Unique Customers
    const customerSet = new Set();
    filteredOrders.forEach((o) => {
      const phone = o.customerPhone || o.customer?.phone;
      const name = o.customerName || o.customer?.name;
      if (phone && phone !== "—") customerSet.add(phone);
      else if (name && name !== "Guest" && name !== "Customer") customerSet.add(name);
    });

    const uniqueCustomers = customerSet.size || orderCount;

    return {
      totalRevenue,
      orderCount,
      avgOrderValue,
      uniqueCustomers,
    };
  }, [filteredOrders]);

  // Chart data aggregation based on timeframe
  const chartData = useMemo(() => {
    if (timeframe === "today") {
      // 24-hour breakdown (Group into 2-hour blocks)
      const hours = Array.from({ length: 12 }, (_, i) => ({
        label: `${i * 2}:00`,
        hourStart: i * 2,
        hourEnd: i * 2 + 1,
        revenue: 0,
        count: 0,
      }));

      filteredOrders.forEach((o) => {
        const h = o.orderDate.getHours();
        const blockIdx = Math.min(Math.floor(h / 2), 11);
        hours[blockIdx].revenue += o.numericTotal;
        hours[blockIdx].count += 1;
      });

      const maxRev = Math.max(...hours.map((h) => h.revenue), 1);
      return {
        type: "hourly",
        title: "Today's Hourly Revenue Trend",
        items: hours.map((h) => ({
          ...h,
          percentage: (h.revenue / maxRev) * 100,
        })),
      };
    } else if (timeframe === "weekly") {
      // Last 7 Days breakdown
      const days = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        days.push({
          dateStr: d.toDateString(),
          label: d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }),
          revenue: 0,
          count: 0,
        });
      }

      filteredOrders.forEach((o) => {
        const oDateStr = o.orderDate.toDateString();
        const found = days.find((d) => d.dateStr === oDateStr);
        if (found) {
          found.revenue += o.numericTotal;
          found.count += 1;
        }
      });

      const maxRev = Math.max(...days.map((d) => d.revenue), 1);
      return {
        type: "daily",
        title: "Last 7 Days Revenue Trend",
        items: days.map((d) => ({
          ...d,
          percentage: (d.revenue / maxRev) * 100,
        })),
      };
    } else if (timeframe === "monthly") {
      // Current Month Weeks / Days
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Group into 4 or 5 intervals
      const buckets = [];
      const chunkSize = 5;
      for (let start = 1; start <= daysInMonth; start += chunkSize) {
        const end = Math.min(start + chunkSize - 1, daysInMonth);
        buckets.push({
          label: `${start}-${end} ${now.toLocaleDateString("en-US", { month: "short" })}`,
          startDay: start,
          endDay: end,
          revenue: 0,
          count: 0,
        });
      }

      filteredOrders.forEach((o) => {
        const day = o.orderDate.getDate();
        const bucket = buckets.find((b) => day >= b.startDay && day <= b.endDay);
        if (bucket) {
          bucket.revenue += o.numericTotal;
          bucket.count += 1;
        }
      });

      const maxRev = Math.max(...buckets.map((b) => b.revenue), 1);
      return {
        type: "monthly-chunks",
        title: `This Month (${now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}) Revenue Trend`,
        items: buckets.map((b) => ({
          ...b,
          percentage: (b.revenue / maxRev) * 100,
        })),
      };
    } else {
      // Yearly or Custom: Month by Month
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
        (m, idx) => ({
          monthIdx: idx,
          label: m,
          revenue: 0,
          count: 0,
        })
      );

      filteredOrders.forEach((o) => {
        const mIdx = o.orderDate.getMonth();
        if (months[mIdx]) {
          months[mIdx].revenue += o.numericTotal;
          months[mIdx].count += 1;
        }
      });

      const maxRev = Math.max(...months.map((m) => m.revenue), 1);
      return {
        type: "yearly",
        title: "Annual Revenue Performance",
        items: months.map((m) => ({
          ...m,
          percentage: (m.revenue / maxRev) * 100,
        })),
      };
    }
  }, [filteredOrders, timeframe]);

  // Top Selling Items in the filtered timeframe
  const topSellingItems = useMemo(() => {
    const itemMap = {};
    filteredOrders.forEach((o) => {
      const items = o.rawItems || o.items || o.orderItems || [];
      items.forEach((it) => {
        const name = it.name || it.dish?.name || "Special Dish";
        const qty = Number(it.quantity || it.qty || 1);
        const price = Number(it.price || it.dish?.price || 0);
        const total = price > 0 ? qty * price : (o.numericTotal / Math.max(items.length, 1));

        if (!itemMap[name]) {
          itemMap[name] = { name, quantity: 0, revenue: 0 };
        }
        itemMap[name].quantity += qty;
        itemMap[name].revenue += total;
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders]);

  // Filtered Ledger orders for search
  const ledgerOrders = useMemo(() => {
    return filteredOrders.filter((o) => {
      if (!searchLedger.trim()) return true;
      const q = searchLedger.toLowerCase();
      const id = String(o.id || "").toLowerCase();
      const num = String(o.orderNumber || "").toLowerCase();
      const table = String(o.tableNumber || "").toLowerCase();
      const cust = String(o.customerName || "").toLowerCase();
      return id.includes(q) || num.includes(q) || table.includes(q) || cust.includes(q);
    });
  }, [filteredOrders, searchLedger]);

  // Export to CSV Spreadsheet
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No revenue transactions to export for this timeframe.");
      return;
    }

    const headers = ["Order ID", "Date", "Time", "Table Number", "Customer Name", "Customer Phone", "Items", "Status", "Total (INR)"];
    
    const rows = filteredOrders.map((o) => {
      const d = o.orderDate;
      const dateStr = d.toLocaleDateString("en-IN");
      const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const itemsStr = (o.items || o.orderItems || [])
        .map((it) => `${it.quantity}x ${it.name || it.dish?.name || "Item"}`)
        .join(" | ");

      return [
        `#${o.id || o.orderNumber}`,
        dateStr,
        timeStr,
        `Table ${o.tableNumber}`,
        `"${(o.customerName || "Guest").replace(/"/g, '""')}"`,
        `"${o.customerPhone || "N/A"}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.status || "Completed",
        o.numericTotal,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RIP_Cafe_Revenue_Report_${timeframe}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Financial Summary Statement
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── TOP HEADER & TIMEFRAME SELECTOR ── */}
      <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#16121E] via-[#0E0C15] to-[#08070D] p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-2xl text-amber-400 shadow-inner">
              💰
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">Revenue & Financial Analytics</h2>
              <p className="text-xs text-slate-400">Daily, weekly, and monthly revenue performance with audit reports</p>
            </div>
          </div>

          {/* Action Buttons: Export & Print */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2.5 text-xs font-extrabold text-emerald-300 hover:bg-emerald-500/25 transition active:scale-95 cursor-pointer shadow"
            >
              <span>📊</span>
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition active:scale-95 cursor-pointer"
            >
              <span>🖨️</span>
              <span>Print Financial Report</span>
            </button>
          </div>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5">
          <div className="flex flex-wrap items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-1.5 text-xs">
            <button
              onClick={() => setTimeframe("today")}
              className={`px-4 py-2 rounded-xl font-extrabold transition cursor-pointer ${
                timeframe === "today" ? "bg-amber-500 text-black shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              ☀️ Today (Daily)
            </button>
            <button
              onClick={() => setTimeframe("weekly")}
              className={`px-4 py-2 rounded-xl font-extrabold transition cursor-pointer ${
                timeframe === "weekly" ? "bg-amber-500 text-black shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              📅 This Week (7 Days)
            </button>
            <button
              onClick={() => setTimeframe("monthly")}
              className={`px-4 py-2 rounded-xl font-extrabold transition cursor-pointer ${
                timeframe === "monthly" ? "bg-amber-500 text-black shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              🗓️ This Month
            </button>
            <button
              onClick={() => setTimeframe("yearly")}
              className={`px-4 py-2 rounded-xl font-extrabold transition cursor-pointer ${
                timeframe === "yearly" ? "bg-amber-500 text-black shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              📈 Full Year
            </button>
            <button
              onClick={() => setTimeframe("custom")}
              className={`px-4 py-2 rounded-xl font-extrabold transition cursor-pointer ${
                timeframe === "custom" ? "bg-amber-500 text-black shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              🔍 Custom Dates
            </button>
          </div>

          {/* Custom Date Range Picker */}
          {timeframe === "custom" && (
            <div className="flex items-center gap-2 bg-black/60 border border-amber-500/30 rounded-2xl px-3 py-1.5 text-xs">
              <span className="text-slate-400">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-[#08070D] border border-white/10 rounded-lg px-2 py-1 text-amber-300 outline-none text-xs"
              />
              <span className="text-slate-400">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-[#08070D] border border-white/10 rounded-lg px-2 py-1 text-amber-300 outline-none text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gross Revenue */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#161220] via-[#0E0C15] to-[#08070D] p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-wider">
            <span>Gross Revenue</span>
            <span className="text-base">💳</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-amber-300 font-serif tracking-tight">
            ₹{kpis.totalRevenue.toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Across {kpis.orderCount} completed orders
          </p>
        </div>

        {/* Total Orders */}
        <div className="rounded-3xl border border-white/10 bg-[#0E0C15] p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Total Orders</span>
            <span className="text-base">🧾</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-white">
            {kpis.orderCount}
          </div>
          <p className="mt-1 text-[11px] text-emerald-400 font-medium">
            100% Fulfilled & Served
          </p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="rounded-3xl border border-white/10 bg-[#0E0C15] p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Avg Bill Size (AOV)</span>
            <span className="text-base">📊</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-white font-serif">
            ₹{kpis.avgOrderValue.toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Average ticket per dining table
          </p>
        </div>

        {/* Unique Diners / Customers */}
        <div className="rounded-3xl border border-white/10 bg-[#0E0C15] p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Unique Diners</span>
            <span className="text-base">👥</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-white">
            {kpis.uniqueCustomers}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Customer registrations & guests
          </p>
        </div>
      </div>

      {/* ── VISUAL REVENUE BAR CHART & TOP ITEMS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Revenue Bar Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0E0C15] p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base">{chartData.title}</h3>
              <p className="text-xs text-slate-400">Sales velocity and order distribution</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
              ₹{kpis.totalRevenue.toLocaleString("en-IN")} Total
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mt-6 flex items-end gap-2 sm:gap-3 h-52 sm:h-60 pt-6 px-2">
            {chartData.items.map((it, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Tooltip on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition pointer-events-none absolute -top-10 bg-slate-900 border border-amber-500/40 px-2 py-1 rounded-lg text-[10px] text-amber-300 whitespace-nowrap shadow-xl z-20">
                  ₹{it.revenue.toLocaleString("en-IN")} ({it.count} orders)
                </div>

                {/* Animated Bar */}
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-amber-600/80 to-amber-400 group-hover:to-amber-300 transition-all duration-300 shadow-md shadow-amber-500/10"
                  style={{
                    height: `${Math.max(it.percentage, 6)}%`,
                    minHeight: it.revenue > 0 ? "18px" : "6px",
                  }}
                />

                {/* Label */}
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-white truncate max-w-full text-center">
                  {it.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Revenue Contributing Dishes */}
        <div className="rounded-3xl border border-white/10 bg-[#0E0C15] p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div className="border-b border-white/5 pb-4">
            <h3 className="font-extrabold text-white text-base">Top Revenue Dishes</h3>
            <p className="text-xs text-slate-400">Highest grossing items in this timeframe</p>
          </div>

          <div className="mt-4 flex flex-col gap-3.5">
            {topSellingItems.length > 0 ? (
              topSellingItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/2 border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 font-extrabold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.quantity} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-amber-300 font-serif">₹{item.revenue.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No dish sales recorded in this timeframe
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FINANCIAL ORDER TRANSACTIONS LEDGER ── */}
      <div className="rounded-3xl border border-white/10 bg-[#0E0C15] p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="font-extrabold text-white text-base">Financial Transaction Ledger</h3>
            <p className="text-xs text-slate-400">Detailed itemized record of {ledgerOrders.length} transactions</p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchLedger}
              onChange={(e) => setSearchLedger(e.target.value)}
              placeholder="Search by ID, Table, Customer..."
              className="w-full bg-[#08070D] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-400 outline-none"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Table</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Items Summary</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ledgerOrders.length > 0 ? (
                ledgerOrders.map((o) => {
                  const d = o.orderDate;
                  const dateFormatted = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
                  const timeFormatted = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                  const itemsList = o.items || o.orderItems || [];

                  return (
                    <tr key={o.id} className="hover:bg-white/2 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                        #{o.id || o.orderNumber}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        <span>{dateFormatted}</span>
                        <span className="text-[10px] text-slate-500 block">{timeFormatted}</span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white">
                        Table {o.tableNumber}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-200 block">{o.customerName || "Guest"}</span>
                        {o.customerPhone && (
                          <span className="text-[10px] text-slate-400 font-mono">{o.customerPhone}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 max-w-xs truncate" title={itemsList.map(i => `${i.quantity}x ${i.name || i.dish?.name}`).join(", ")}>
                        {itemsList.length > 0
                          ? itemsList.map((it) => `${it.quantity}x ${it.name || it.dish?.name || "Item"}`).join(", ")
                          : "Order Items"}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          {o.status || "Served"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-amber-300 font-serif text-sm">
                        ₹{o.numericTotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                    No transactions found matching your filter criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PRINT-ONLY FINANCIAL SUMMARY STATEMENT (Hidden on screen, prints cleanly) ── */}
      <div className="hidden print:block bg-white text-black p-8">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-black uppercase tracking-wider font-serif">Rest In Peace Cafe</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Official Financial Revenue Statement</p>
          <p className="text-xs text-gray-500 mt-1">
            Generated on: {new Date().toLocaleString("en-IN")} | Timeframe: {timeframe.toUpperCase()}
          </p>
        </div>

        {/* Summary Table */}
        <div className="grid grid-cols-4 gap-4 border-2 border-black p-4 mb-6 text-center">
          <div>
            <p className="text-xs font-bold text-gray-600">GROSS REVENUE</p>
            <p className="text-xl font-black">₹{kpis.totalRevenue.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600">TOTAL ORDERS</p>
            <p className="text-xl font-black">{kpis.orderCount}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600">AVERAGE BILL (AOV)</p>
            <p className="text-xl font-black">₹{kpis.avgOrderValue.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600">TOTAL DINERS</p>
            <p className="text-xl font-black">{kpis.uniqueCustomers}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="w-full text-left text-xs border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100 border-b border-black font-bold">
              <th className="p-2 border-r border-black">#ID</th>
              <th className="p-2 border-r border-black">Date & Time</th>
              <th className="p-2 border-r border-black">Table</th>
              <th className="p-2 border-r border-black">Customer</th>
              <th className="p-2 border-r border-black">Items</th>
              <th className="p-2 text-right">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.id} className="border-b border-gray-300">
                <td className="p-2 border-r border-black font-mono">#{o.id || o.orderNumber}</td>
                <td className="p-2 border-r border-black">{o.orderDate.toLocaleString("en-IN")}</td>
                <td className="p-2 border-r border-black">Table {o.tableNumber}</td>
                <td className="p-2 border-r border-black">{o.customerName || "Guest"}</td>
                <td className="p-2 border-r border-black">
                  {(o.items || o.orderItems || []).map((it) => `${it.quantity}x ${it.name || it.dish?.name || "Item"}`).join(", ")}
                </td>
                <td className="p-2 text-right font-bold">₹{o.numericTotal.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 pt-4 border-t border-black flex justify-between text-xs text-gray-600">
          <p>Verified by Cafe Management System</p>
          <p>Authorized Signature: _______________________</p>
        </div>
      </div>
    </div>
  );
}
