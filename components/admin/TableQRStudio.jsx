"use client";

import { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import { getTableToken } from "@/lib/tableHashes";

export default function TableQRStudio({ tables = [], refreshTables }) {
  const [qrUrls, setQrUrls] = useState({});
  const [useShortUrl, setUseShortUrl] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [customDomain, setCustomDomain] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardTheme, setCardTheme] = useState("dark-gold"); // 'dark-gold' or 'clean-white'

  // Auto-detect base URL (e.g. window.location.origin)
  const currentOrigin = useMemo(() => {
    if (typeof window !== "undefined") {
      return customDomain.trim() || window.location.origin;
    }
    return "https://cafe-app-developergokulk-3345s-projects.vercel.app";
  }, [customDomain]);

  // Deduplicate tables by tableNumber & guarantee tables 1-8 exist with exact hashes
  const uniqueTables = useMemo(() => {
    const map = new Map();
    if (Array.isArray(tables) && tables.length > 0) {
      tables.forEach((t) => {
        const num = Number(t.tableNumber);
        if (num && !map.has(num)) {
          map.set(num, {
            id: t.id || num,
            tableNumber: num,
            tableToken: t.tableToken || getTableToken(num),
            status: t.status || "available",
          });
        }
      });
    }

    // Ensure all 1 to 8 tables are always present
    for (let i = 1; i <= 8; i++) {
      if (!map.has(i)) {
        map.set(i, {
          id: i,
          tableNumber: i,
          tableToken: getTableToken(i),
          status: "available",
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.tableNumber - b.tableNumber);
  }, [tables]);

  // Generate QR Code data URLs for each unique table using unguessable cryptographic token
  useEffect(() => {
    let isMounted = true;
    async function generateAllQRs() {
      setIsGenerating(true);
      const generated = {};
      for (const table of uniqueTables) {
        // True un-guessable cryptographic hash (e.g. /t/9e4439763b)
        const token = table.tableToken || getTableToken(table.tableNumber);
        const targetPath = `/t/${token}`;
        const fullUrl = `${currentOrigin}${targetPath}`;

        try {
          const dataUrl = await QRCode.toDataURL(fullUrl, {
            width: 700,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
            errorCorrectionLevel: "H",
          });
          generated[table.tableNumber] = { dataUrl, fullUrl, targetPath };
        } catch (err) {
          console.error("QR Generation error for table", table.tableNumber, err);
        }
      }
      if (isMounted) {
        setQrUrls(generated);
        setIsGenerating(false);
      }
    }

    generateAllQRs();
    return () => {
      isMounted = false;
    };
  }, [uniqueTables, currentOrigin]);

  // Download individual Table Tent Stand Card PNG (Matches Preview Exactly 1:1) - No Link Edition
  const handleDownloadQR = (table) => {
    const qrInfo = qrUrls[table.tableNumber];
    if (!qrInfo) return;

    const canvas = document.createElement("canvas");
    canvas.width = 900; // Exact preview proportion
    canvas.height = 1350; // Balanced vertical proportion matching on-screen card
    const ctx = canvas.getContext("2d");

    // 1. Rich Ambient Cafe Radial Gradient Background
    if (cardTheme === "dark-gold") {
      const bgGrad = ctx.createRadialGradient(450, 450, 50, 450, 675, 750);
      bgGrad.addColorStop(0, "#1F1528"); // warm roasted amber-espresso glow in center
      bgGrad.addColorStop(0.45, "#120D1A"); // deep coffee bean velvet
      bgGrad.addColorStop(1, "#07050A"); // dark luxury obsidian edge
      ctx.fillStyle = bgGrad;
    } else {
      const bgGrad = ctx.createRadialGradient(450, 450, 50, 450, 675, 750);
      bgGrad.addColorStop(0, "#FFFFFF"); // bright clean center
      bgGrad.addColorStop(0.6, "#FAF8F5"); // warm crema ivory
      bgGrad.addColorStop(1, "#F0EAE1"); // artisan parchment edge
      ctx.fillStyle = bgGrad;
    }
    ctx.fillRect(0, 0, 900, 1350);

    // 2. Subtle Cafe & Culinary Background Watermarks
    ctx.save();
    ctx.fillStyle = cardTheme === "dark-gold" ? "rgba(245, 158, 11, 0.045)" : "rgba(100, 70, 30, 0.045)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const watermarks = [
      { text: "☕", x: 90, y: 140, size: 65, r: -0.12 },
      { text: "🥐", x: 810, y: 150, size: 60, r: 0.15 },
      { text: "🍰", x: 90, y: 520, size: 55, r: 0.1 },
      { text: "🍴", x: 815, y: 530, size: 70, r: -0.15 },
      { text: "🧋", x: 90, y: 840, size: 60, r: -0.1 },
      { text: "🍹", x: 810, y: 860, size: 65, r: 0.12 },
      { text: "☕", x: 100, y: 1180, size: 70, r: 0.18 },
      { text: "🍔", x: 800, y: 1180, size: 60, r: -0.15 },
    ];

    for (const w of watermarks) {
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(w.r);
      ctx.font = `${w.size}px sans-serif`;
      ctx.fillText(w.text, 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // 3. Double Outer Border (Luxury Bistro Style)
    ctx.strokeStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(20, 20, 860, 1310, 40);
    ctx.stroke();

    // Inner thin accent border
    ctx.strokeStyle = cardTheme === "dark-gold" ? "rgba(245, 158, 11, 0.3)" : "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(36, 36, 828, 1278, 32);
    ctx.stroke();

    // Corner menu brackets
    ctx.strokeStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
    ctx.lineWidth = 3;
    const m = 48;
    const len = 28;
    // Top-Left
    ctx.beginPath(); ctx.moveTo(m, m + len); ctx.lineTo(m, m); ctx.lineTo(m + len, m); ctx.stroke();
    // Top-Right
    ctx.beginPath(); ctx.moveTo(900 - m - len, m); ctx.lineTo(900 - m, m); ctx.lineTo(900 - m, m + len); ctx.stroke();
    // Bottom-Left
    ctx.beginPath(); ctx.moveTo(m, 1350 - m - len); ctx.lineTo(m, 1350 - m); ctx.lineTo(m + len, 1350 - m); ctx.stroke();
    // Bottom-Right
    ctx.beginPath(); ctx.moveTo(900 - m - len, 1350 - m); ctx.lineTo(900 - m, 1350 - m); ctx.lineTo(900 - m, 1350 - m - len); ctx.stroke();

    // 4. Cafe Brand Header & Logo
    const logoImg = new Image();
    const qrImg = new Image();

    let logoLoaded = false;
    let qrLoaded = false;

    const renderCanvas = () => {
      if (!logoLoaded || !qrLoaded) return;

      // Draw Prominent Circular Logo Emblem (Matching Preview Exactly)
      try {
        ctx.save();
        const circleCenterX = 450;
        const circleCenterY = 135;
        const radius = 75; // Diameter: 150px

        // Soft ambient golden shadow for depth
        if (cardTheme === "dark-gold") {
          ctx.shadowColor = "rgba(245, 158, 11, 0.4)";
          ctx.shadowBlur = 20;
        } else {
          ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
          ctx.shadowBlur = 14;
        }

        // Circular black base
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw cropped circular logo
        const imgSize = radius * 2;
        ctx.drawImage(
          logoImg,
          circleCenterX - radius,
          circleCenterY - radius,
          imgSize,
          imgSize
        );

        // Subtle outer gold/black ring accent
        ctx.strokeStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      } catch {
        // Fallback if logo fails to draw
      }

      ctx.fillStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
      ctx.font = "900 42px serif, Georgia";
      ctx.textAlign = "center";
      ctx.fillText("REST IN PEACE CAFE", 450, 250);

      // Location Sub-brand
      ctx.fillStyle = cardTheme === "dark-gold" ? "#E2E8F0" : "#4B5563";
      ctx.font = "600 20px sans-serif";
      ctx.fillText("📍 Sitra ,Coimbatore", 450, 288);

      ctx.fillStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
      ctx.font = "bold 23px sans-serif";
      ctx.fillText("Browse together, order as one", 450, 336);

      ctx.fillStyle = cardTheme === "dark-gold" ? "#CBD5E1" : "#374151";
      ctx.font = "500 16px sans-serif";
      ctx.fillText("To ensure seamless billing, please submit your table's order from a single device.", 450, 368);

      // 5. Table Number Badge (Pill)
      ctx.fillStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
      ctx.beginPath();
      ctx.roundRect(275, 410, 350, 78, 39);
      ctx.fill();

      ctx.fillStyle = cardTheme === "dark-gold" ? "#000000" : "#FFFFFF";
      ctx.font = "900 36px sans-serif";
      ctx.fillText(`TABLE ${table.tableNumber}`, 450, 464);

      // 6. Draw QR Code Container
      // White pedestal behind QR
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(205, 515, 490, 525, 32);
      ctx.fill();

      // Inner border for QR
      ctx.strokeStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(205, 515, 490, 525, 32);
      ctx.stroke();

      // Top mini header inside QR pedestal
      ctx.fillStyle = cardTheme === "dark-gold" ? "#161020" : "#F3F4F6";
      ctx.beginPath();
      ctx.roundRect(230, 532, 440, 34, 17);
      ctx.fill();
      ctx.fillStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#111827";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("📱 SCAN CAMERA TO VIEW DIGITAL MENU", 450, 554);

      ctx.drawImage(qrImg, 235, 580, 430, 430);

      // 7. Table Assistance Footer Callout (Strictly 1 Line, No URL Link)
      ctx.fillStyle = cardTheme === "dark-gold" ? "#FDE68A" : "#1F2937";
      ctx.font = "bold 21px sans-serif";
      ctx.fillText("🛎️ Need assistance? Use the \"Staff\" button on your phone", 450, 1110);

      // 8. Decorative bottom accent
      ctx.fillStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
      ctx.beginPath();
      ctx.roundRect(360, 1175, 180, 5, 2.5);
      ctx.fill();

      // Download file
      const link = document.createElement("a");
      link.download = `RIP_Cafe_Table_${table.tableNumber}_Stand.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    logoImg.onload = () => {
      logoLoaded = true;
      renderCanvas();
    };
    logoImg.onerror = () => {
      logoLoaded = true;
      renderCanvas();
    };
    logoImg.src = "/logo.png";

    qrImg.onload = () => {
      qrLoaded = true;
      renderCanvas();
    };
    qrImg.src = qrInfo.dataUrl;
  };

  // Copy Link
  const handleCopyLink = (table) => {
    const qrInfo = qrUrls[table.tableNumber];
    if (!qrInfo) return;
    navigator.clipboard.writeText(qrInfo.fullUrl);
    setCopiedId(table.tableNumber);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Print All Table Stands
  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── TOP CONTROLS & HEADER ── */}
      <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#16121E] via-[#0E0C15] to-[#08070D] p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-2xl text-amber-400 shadow-inner">
              📱
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Table QR Stand Studio</h2>
              <p className="text-xs text-slate-400">Acrylic Table Tent Stand Cards ready to display & print ({uniqueTables.length} Tables)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Theme Toggle */}
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 text-xs">
              <button
                onClick={() => setCardTheme("dark-gold")}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${cardTheme === "dark-gold" ? "bg-amber-500 text-black shadow" : "text-slate-400 hover:text-white"}`}
              >
                ✨ Luxury Gold
              </button>
              <button
                onClick={() => setCardTheme("clean-white")}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${cardTheme === "clean-white" ? "bg-white text-black shadow" : "text-slate-400 hover:text-white"}`}
              >
                📄 Clean Print
              </button>
            </div>

            <button
              onClick={handlePrintAll}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition active:scale-95 cursor-pointer"
            >
              <span>🖨️</span>
              <span>Print All Stands</span>
            </button>
          </div>
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/2 border border-white/5">
            <div>
              <p className="font-bold text-slate-200">🛡️ Tamper-Proof Cryptographic URLs</p>
              <p className="text-[11px] text-slate-400">Uses secret cryptographic hash tokens (`/t/hash`) with zero table number in the URL to prevent tampering</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
              Active
            </span>
          </div>

          <div className="flex flex-col justify-center p-3.5 rounded-2xl bg-white/2 border border-white/5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Active Domain Origin
            </label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder={typeof window !== "undefined" ? window.location.origin : "https://cafe-app-developergokulk-3345s-projects.vercel.app"}
              className="w-full bg-[#08070D] border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── TABLE TENT STAND CARDS GRID (DESIGN 2) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
        {uniqueTables.map((table) => {
          const qrInfo = qrUrls[table.tableNumber];
          const isCopied = copiedId === table.tableNumber;
          const isDark = cardTheme === "dark-gold";

          return (
            <div
              key={table.tableNumber}
              className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 shadow-2xl border-4 overflow-hidden ${isDark
                  ? "border-amber-500/40 bg-gradient-to-b from-[#181222] via-[#0E0C15] to-[#07060A] text-white hover:border-amber-400 hover:shadow-[0_12px_36px_rgba(245,158,11,0.2)]"
                  : "border-black bg-gradient-to-b from-[#FAF8F5] via-white to-[#F2EDE4] text-black hover:shadow-2xl"
                }`}
              style={{ minHeight: "630px" }}
            >
              {/* Subtle Ambient Cafe Watermarks */}
              <div className="absolute top-2 left-3 text-2xl opacity-10 select-none pointer-events-none">☕</div>
              <div className="absolute top-2 right-3 text-2xl opacity-10 select-none pointer-events-none">🥐</div>
              <div className="absolute bottom-16 left-3 text-2xl opacity-10 select-none pointer-events-none">🍰</div>
              <div className="absolute bottom-16 right-3 text-2xl opacity-10 select-none pointer-events-none">🍴</div>

              {/* Stand Header */}
              <div className="text-center px-1 relative z-10">
                <div className="flex justify-center mb-3">
                  <div className={`w-24 h-24 rounded-full bg-black p-1 shadow-2xl border-2 flex items-center justify-center overflow-hidden transition-transform hover:scale-105 ${
                    isDark ? "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "border-black"
                  }`}>
                    <img
                      src="/logo.png"
                      alt="Rest in Peace Cafe"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>

                <h3 className={`text-xl font-black uppercase tracking-wider font-serif ${isDark ? "gold-gradient-text" : "text-black"}`}>
                  Rest In Peace Cafe
                </h3>
                <p className={`text-[11px] font-semibold tracking-wide mt-0.5 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                  📍 Sitra ,Coimbatore
                </p>
                <p className={`text-xs font-bold mt-2.5 ${isDark ? "text-amber-400" : "text-black"}`}>
                  Browse together, order as one
                </p>
                <p className={`text-[10px] font-medium leading-tight mt-1 max-w-[270px] mx-auto ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                  To ensure seamless billing, please submit your table's order from a single device.
                </p>
              </div>

              {/* Table Pill Badge */}
              <div className="my-3 flex justify-center relative z-10">
                <div className={`px-6 py-2 rounded-full font-black text-sm tracking-wider uppercase shadow-md ${isDark
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-black text-white"
                  }`}>
                  Table {table.tableNumber}
                </div>
              </div>

              {/* QR Code Canvas Box */}
              <div className="flex justify-center my-2 relative z-10">
                <div className={`p-3 rounded-2xl bg-white shadow-2xl border-4 text-center ${isDark ? "border-amber-500/40" : "border-black"}`}>
                  <div className="mb-2 px-2 py-0.5 rounded-md bg-gray-100 text-[9px] font-bold text-gray-800 uppercase tracking-wide">
                    📱 Scan Camera to View Menu
                  </div>
                  {qrInfo?.dataUrl ? (
                    <img
                      src={qrInfo.dataUrl}
                      alt={`Table ${table.tableNumber} QR`}
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-slate-500 text-xs">
                      Rendering QR…
                    </div>
                  )}
                </div>
              </div>

              {/* Assistance Callout (Strict Single Line) */}
              <div className="text-center my-2 space-y-1 px-1 relative z-10">
                <p className={`text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis ${isDark ? "text-amber-300" : "text-gray-900"}`} title='Need assistance? Use the "Staff" button on your phone'>
                  🛎️ Need assistance? Use the "Staff" button on your phone
                </p>
                <p className={`text-[10px] font-mono truncate px-2 py-1 rounded-md ${isDark ? "bg-black/50 text-slate-400 border border-white/5" : "bg-gray-100 text-gray-600"}`}>
                  {qrInfo?.targetPath || `/table/${table.tableNumber}`}
                </p>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => handleDownloadQR(table)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold transition active:scale-95 cursor-pointer ${isDark
                      ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                      : "bg-black text-white hover:bg-gray-800"
                    }`}
                  title="Download Print Stand PNG"
                >
                  <span>⬇️</span>
                  <span>Save PNG</span>
                </button>

                <button
                  onClick={() => handleCopyLink(table)}
                  className={`flex items-center justify-center gap-1 rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer ${isCopied
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : isDark
                        ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <span>{isCopied ? "✓" : "🔗"}</span>
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>

                <a
                  href={qrInfo?.fullUrl || `/table/${table.tableNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-1 rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer ${isDark
                      ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                      : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <span>↗️</span>
                  <span>Test</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PRINT-ONLY TABLE STAND SHEET (1 STICKER PER FULL PAGE) ── */}
      <div className="hidden print:block bg-white text-black p-0 m-0">
        {uniqueTables.map((table) => {
          const qrInfo = qrUrls[table.tableNumber];
          return (
            <div
              key={`print-${table.tableNumber}`}
              className="w-full flex flex-col items-center justify-between border-[8px] border-black p-12 text-center bg-white rounded-[44px] box-border"
              style={{
                pageBreakAfter: "always",
                breakAfter: "page",
                pageBreakInside: "avoid",
                breakInside: "avoid",
                minHeight: "94vh",
                margin: "0 auto 40px auto",
              }}
            >
              {/* Brand Header */}
              <div className="pt-2">
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 rounded-full bg-black p-1.5 border-4 border-black flex items-center justify-center overflow-hidden shadow-md">
                    <img
                      src="/logo.png"
                      alt="Rest in Peace Cafe"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>
                <h1 className="text-4xl font-black tracking-wider uppercase font-serif">Rest in Peace Cafe</h1>
                <p className="text-base text-gray-700 font-bold tracking-wide mt-1">Sitra ,Coimbatore</p>
                <p className="text-xl text-black font-black mt-3">Browse together, order as one</p>
                <p className="text-xs text-gray-800 font-semibold mt-1 max-w-lg mx-auto">
                  To ensure seamless billing, please submit your table's order from a single device.
                </p>
              </div>

              {/* Table Pill */}
              <div className="my-3 px-12 py-3.5 rounded-full bg-black text-white font-black text-3xl tracking-wider uppercase shadow-md">
                Table {table.tableNumber}
              </div>

              {/* High-Contrast QR */}
              {qrInfo?.dataUrl && (
                <div className="p-5 border-4 border-black rounded-3xl my-2">
                  <img
                    src={qrInfo.dataUrl}
                    alt={`Table ${table.tableNumber} QR`}
                    className="w-72 h-72 object-contain"
                  />
                </div>
              )}

              {/* Footer Callouts (Strictly 1 Line) */}
              <div className="pb-2 text-center">
                <p className="text-base font-black text-black whitespace-nowrap">
                  🛎️ Need assistance? Use the "Staff" button on your phone
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
