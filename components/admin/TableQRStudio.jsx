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

  // Download individual Table Tent Stand Card PNG (Matches Design 2)
  const handleDownloadQR = (table) => {
    const qrInfo = qrUrls[table.tableNumber];
    if (!qrInfo) return;

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");

    // 1. Background
    ctx.fillStyle = cardTheme === "dark-gold" ? "#0A090E" : "#FFFFFF";
    ctx.fillRect(0, 0, 900, 1200);

    // 2. Rounded Outer Border
    ctx.strokeStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(24, 24, 852, 1152, 36);
    ctx.stroke();

    // 3. Cafe Brand Header
    ctx.fillStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
    ctx.font = "900 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("REST IN PEACE CAFE", 450, 120);

    ctx.fillStyle = cardTheme === "dark-gold" ? "#94A3B8" : "#4B5563";
    ctx.font = "600 24px sans-serif";
    ctx.fillText("Scan to View Menu & Place Your Order", 450, 175);

    // 4. Table Number Badge (Pill)
    ctx.fillStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
    ctx.beginPath();
    ctx.roundRect(275, 220, 350, 80, 40);
    ctx.fill();

    ctx.fillStyle = cardTheme === "dark-gold" ? "#000000" : "#FFFFFF";
    ctx.font = "900 40px sans-serif";
    ctx.fillText(`TABLE ${table.tableNumber}`, 450, 276);

    // 5. Draw QR Code Container
    const img = new Image();
    img.onload = () => {
      // White box behind QR
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(175, 345, 550, 550, 28);
      ctx.fill();

      // Inner border for QR
      ctx.strokeStyle = cardTheme === "dark-gold" ? "#F59E0B" : "#000000";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(175, 345, 550, 550, 28);
      ctx.stroke();

      ctx.drawImage(img, 205, 375, 490, 490);

      // 6. Table Assistance Footer Callout
      ctx.fillStyle = cardTheme === "dark-gold" ? "#E2E8F0" : "#1F2937";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("🛎️ Need assistance? Use the \"Staff\" button on your phone", 450, 965);

      ctx.fillStyle = cardTheme === "dark-gold" ? "#94A3B8" : "#6B7280";
      ctx.font = "20px sans-serif";
      ctx.fillText("Water · Cutlery · Bill · Fast Service", 450, 1010);

      // 7. Clean Direct URL
      ctx.fillStyle = cardTheme === "dark-gold" ? "#64748B" : "#9CA3AF";
      ctx.font = "18px monospace";
      ctx.fillText(qrInfo.fullUrl, 450, 1090);

      // Download file
      const link = document.createElement("a");
      link.download = `RIP_Cafe_Table_${table.tableNumber}_Stand.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = qrInfo.dataUrl;
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
              className={`relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 shadow-2xl border-4 ${
                isDark
                  ? "border-amber-500/40 bg-gradient-to-b from-[#161320] via-[#0E0C15] to-[#07060A] text-white hover:border-amber-400 hover:shadow-[0_12px_36px_rgba(245,158,11,0.2)]"
                  : "border-black bg-white text-black hover:shadow-2xl"
              }`}
              style={{ minHeight: "520px" }}
            >
              {/* Stand Header */}
              <div className="text-center">
                <h3 className={`text-xl font-black uppercase tracking-wider font-serif ${isDark ? "gold-gradient-text" : "text-black"}`}>
                  Rest In Peace Cafe
                </h3>
                <p className={`text-xs font-semibold mt-0.5 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                  Scan to View Menu & Place Your Order
                </p>
              </div>

              {/* Table Pill Badge */}
              <div className="my-4 flex justify-center">
                <div className={`px-6 py-2 rounded-full font-black text-sm tracking-wider uppercase shadow-md ${
                  isDark
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-black text-white"
                }`}>
                  Table {table.tableNumber}
                </div>
              </div>

              {/* QR Code Canvas Box */}
              <div className="flex justify-center my-2">
                <div className={`p-3.5 rounded-2xl bg-white shadow-2xl border-4 ${isDark ? "border-amber-500/40" : "border-black"}`}>
                  {qrInfo?.dataUrl ? (
                    <img
                      src={qrInfo.dataUrl}
                      alt={`Table ${table.tableNumber} QR`}
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-slate-500 text-xs">
                      Rendering QR…
                    </div>
                  )}
                </div>
              </div>

              {/* Assistance Callout */}
              <div className="text-center my-2 space-y-1">
                <p className={`text-xs font-bold ${isDark ? "text-amber-300" : "text-gray-900"}`}>
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
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold transition active:scale-95 cursor-pointer ${
                    isDark
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
                  className={`flex items-center justify-center gap-1 rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                    isCopied
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
                  className={`flex items-center justify-center gap-1 rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                    isDark
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

      {/* ── PRINT-ONLY TABLE STAND SHEET (Hidden on screen, visible on Print / PDF) ── */}
      <div className="hidden print:grid print:grid-cols-2 print:gap-8 print:p-6 bg-white text-black">
        {uniqueTables.map((table) => {
          const qrInfo = qrUrls[table.tableNumber];
          return (
            <div
              key={`print-${table.tableNumber}`}
              className="page-break-inside-avoid flex flex-col items-center justify-between border-4 border-black p-8 rounded-3xl text-center bg-white"
              style={{ minHeight: "520px" }}
            >
              <div>
                <h1 className="text-2xl font-black tracking-wider uppercase font-serif">Rest in Peace Cafe</h1>
                <p className="text-xs text-gray-600 font-semibold mt-1">Scan to View Menu & Place Your Order</p>
              </div>

              <div className="my-4 px-8 py-2 rounded-full bg-black text-white font-black text-xl tracking-wider uppercase">
                Table {table.tableNumber}
              </div>

              {qrInfo?.dataUrl && (
                <div className="p-3 border-4 border-black rounded-2xl my-2">
                  <img
                    src={qrInfo.dataUrl}
                    alt={`Table ${table.tableNumber} QR`}
                    className="w-52 h-52 object-contain"
                  />
                </div>
              )}

              <div className="text-xs text-gray-800 font-bold space-y-1 mt-2">
                <p>🛎️ Need assistance? Use the "Staff" button on your phone</p>
                <p className="text-[10px] text-gray-500 font-mono">{qrInfo?.fullUrl}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
