"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import QRCode from "qrcode";

export default function TableQRStudio({ tables = [], refreshTables }) {
  const [qrUrls, setQrUrls] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [useHashedUrl, setUseHashedUrl] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [customDomain, setCustomDomain] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const printContainerRef = useRef(null);

  // Auto-detect base URL (e.g. https://your-cafe.vercel.app or window.location.origin)
  const currentOrigin = useMemo(() => {
    if (typeof window !== "undefined") {
      return customDomain.trim() || window.location.origin;
    }
    return "https://ripcafe.vercel.app";
  }, [customDomain]);

  // Generate QR Code data URLs for each table
  useEffect(() => {
    let isMounted = true;
    async function generateAllQRs() {
      setIsGenerating(true);
      const generated = {};
      for (const table of tables) {
        const token = table.tableToken || `t_${table.tableNumber}`;
        const targetPath = useHashedUrl ? `/t/${token}` : `/table/${table.tableNumber}`;
        const fullUrl = `${currentOrigin}${targetPath}`;

        try {
          const dataUrl = await QRCode.toDataURL(fullUrl, {
            width: 600,
            margin: 2,
            color: {
              dark: "#0F0E16",
              light: "#FFFFFF",
            },
            errorCorrectionLevel: "H",
          });
          generated[table.id] = { dataUrl, fullUrl, targetPath };
        } catch (err) {
          console.error("QR Generation error for table", table.tableNumber, err);
        }
      }
      if (isMounted) {
        setQrUrls(generated);
        setIsGenerating(false);
      }
    }

    if (tables.length > 0) {
      generateAllQRs();
    }
    return () => {
      isMounted = false;
    };
  }, [tables, useHashedUrl, currentOrigin]);

  // Download individual QR Code PNG
  const handleDownloadQR = (table) => {
    const qrInfo = qrUrls[table.id];
    if (!qrInfo) return;

    // Create a canvas with table branding and table number label
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#0A090E";
    ctx.fillRect(0, 0, 800, 1000);

    // Border
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 760, 960);

    // Header Title
    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("REST IN PEACE CAFE", 400, 100);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "24px sans-serif";
    ctx.fillText("Scan to View Menu & Order", 400, 150);

    // Table Badge
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath();
    ctx.roundRect(250, 190, 300, 70, 20);
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(`TABLE # ${table.tableNumber}`, 400, 240);

    // Draw QR Code Image
    const img = new Image();
    img.onload = () => {
      // White box behind QR for max contrast
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(140, 300, 520, 520, 24);
      ctx.fill();

      ctx.drawImage(img, 160, 320, 480, 480);

      // Footer
      ctx.fillStyle = "#CBD5E1";
      ctx.font = "22px sans-serif";
      ctx.fillText("Call Waiter · Order Food · Digital Bill", 400, 890);

      ctx.fillStyle = "#64748B";
      ctx.font = "18px monospace";
      ctx.fillText(qrInfo.fullUrl, 400, 935);

      // Trigger Download
      const link = document.createElement("a");
      link.download = `RIP-Cafe-Table-${table.tableNumber}-QR.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = qrInfo.dataUrl;
  };

  // Copy Link to Clipboard
  const handleCopyLink = (table) => {
    const qrInfo = qrUrls[table.id];
    if (!qrInfo) return;
    navigator.clipboard.writeText(qrInfo.fullUrl);
    setCopiedId(table.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Print All Table Stand Cards
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
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Table QR Code Studio</h2>
              <p className="text-xs text-slate-400">Generate, test, download, and print dining table stand QR cards</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrintAll}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition active:scale-95 cursor-pointer"
            >
              <span>🖨️</span>
              <span>Print All Table Stands</span>
            </button>
          </div>
        </div>

        {/* Studio Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
          {/* Security URL Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/2 border border-white/5">
            <div>
              <p className="font-bold text-slate-200">Tamper-Proof Hashed URLs</p>
              <p className="text-[11px] text-slate-400">Uses secret table tokens (`/t/token`) to prevent fake orders</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useHashedUrl}
                onChange={(e) => setUseHashedUrl(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Base URL Input */}
          <div className="flex flex-col justify-center p-3.5 rounded-2xl bg-white/2 border border-white/5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Active Production Domain
            </label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder={typeof window !== "undefined" ? window.location.origin : "https://your-cafe.vercel.app"}
              className="w-full bg-[#08070D] border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── TABLE QR GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {tables.map((table) => {
          const qrInfo = qrUrls[table.id];
          const isCopied = copiedId === table.id;

          return (
            <div
              key={table.id}
              className="group relative flex flex-col items-center justify-between rounded-3xl border border-amber-500/20 bg-gradient-to-b from-[#14121E] to-[#0A090E] p-5 shadow-xl hover:border-amber-500/40 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] transition-all duration-300"
            >
              {/* Card Top: Table Number & Status */}
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-xs">
                    T{table.tableNumber}
                  </span>
                  <span className="text-sm font-extrabold text-white">Table #{table.tableNumber}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${table.status === 'occupied' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {table.status || 'Available'}
                </span>
              </div>

              {/* QR Code Canvas Box */}
              <div className="relative my-2 flex items-center justify-center rounded-2xl bg-white p-3.5 shadow-2xl border-4 border-amber-500/30 group-hover:scale-105 transition-transform duration-300">
                {qrInfo?.dataUrl ? (
                  <img
                    src={qrInfo.dataUrl}
                    alt={`QR Code for Table ${table.tableNumber}`}
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR…
                  </div>
                )}
              </div>

              {/* URL Snippet */}
              <div className="w-full my-2 text-center">
                <p className="text-[10px] text-slate-400 truncate font-mono px-2 py-1 rounded-lg bg-black/40 border border-white/5">
                  {qrInfo?.targetPath || `/table/${table.tableNumber}`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5 w-full mt-2">
                {/* Download Button */}
                <button
                  onClick={() => handleDownloadQR(table)}
                  className="flex items-center justify-center gap-1 rounded-xl bg-amber-500/10 border border-amber-500/30 py-2 text-[10px] font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition cursor-pointer"
                  title="Download Table Stand QR Image (PNG)"
                >
                  <span>⬇️</span>
                  <span>PNG</span>
                </button>

                {/* Copy Link Button */}
                <button
                  onClick={() => handleCopyLink(table)}
                  className={`flex items-center justify-center gap-1 rounded-xl border py-2 text-[10px] font-bold transition active:scale-95 cursor-pointer ${isCopied ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                  title="Copy Customer Ordering Link"
                >
                  <span>{isCopied ? "✓" : "🔗"}</span>
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>

                {/* Open Test in New Tab */}
                <a
                  href={qrInfo?.fullUrl || `/table/${table.tableNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 rounded-xl bg-white/5 border border-white/10 py-2 text-[10px] font-bold text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition cursor-pointer"
                  title="Test Menu in New Tab"
                >
                  <span>↗️</span>
                  <span>Test</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PRINT-ONLY TABLE STAND SHEET (Hidden on screen, visible when printing) ── */}
      <div className="hidden print:grid print:grid-cols-2 print:gap-8 print:p-4 bg-white text-black">
        {tables.map((table) => {
          const qrInfo = qrUrls[table.id];
          return (
            <div
              key={`print-${table.id}`}
              className="page-break-inside-avoid flex flex-col items-center justify-between border-4 border-black p-6 rounded-3xl text-center bg-white"
              style={{ minHeight: "450px" }}
            >
              <div>
                <h1 className="text-2xl font-black tracking-wider uppercase">Rest in Peace Cafe</h1>
                <p className="text-xs text-gray-600 font-medium">Scan to View Menu & Place Your Order</p>
              </div>

              <div className="my-3 px-6 py-1.5 rounded-full bg-black text-white font-black text-lg tracking-wider">
                TABLE # {table.tableNumber}
              </div>

              {qrInfo?.dataUrl && (
                <img
                  src={qrInfo.dataUrl}
                  alt={`Table ${table.tableNumber} QR`}
                  className="w-48 h-48 border-2 border-black p-2 rounded-xl my-2"
                />
              )}

              <div className="text-[11px] text-gray-700 font-semibold space-y-0.5">
                <p>🛎️ Need assistance? Use the "Staff" button on your phone</p>
                <p className="text-[9px] text-gray-500 font-mono">{qrInfo?.fullUrl}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
