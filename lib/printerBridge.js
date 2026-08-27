/**
 * RIP Cafe - Universal Thermal Bluetooth Printer & Notification Bridge
 * Supports Android Native Bluetooth SPP (Capacitor/WebView) and Web Bluetooth / System Print
 */

// Helper to convert Uint8Array to Base64
export function uint8ArrayToBase64(bytes) {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== "undefined" ? window.btoa(binary) : "";
}

// Detect if running inside Android Native App wrapper
export function isAndroidNativeApp() {
  if (typeof window === "undefined") return false;
  if (window.AndroidBluetoothPrinter) return true;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  return false;
}

// Get list of paired Bluetooth devices
export async function getPairedBluetoothPrinters() {
  if (typeof window === "undefined") return [];

  // 1. Android Native JavascriptInterface bridge
  if (window.AndroidBluetoothPrinter?.getPairedPrintersJson) {
    try {
      const json = window.AndroidBluetoothPrinter.getPairedPrintersJson();
      const list = JSON.parse(json || "[]");
      return list;
    } catch (e) {
      console.warn("Failed to get paired printers via Android bridge:", e);
    }
  }

  // 2. Capacitor Plugin bridge
  if (window.Capacitor?.Plugins?.BluetoothPrinter?.getPairedPrinters) {
    try {
      const res = await window.Capacitor.Plugins.BluetoothPrinter.getPairedPrinters();
      return res.printers || [];
    } catch (e) {
      console.warn("Failed to get paired printers via Capacitor:", e);
    }
  }

  return [];
}

// Set default / preferred Bluetooth printer
export async function setDefaultBluetoothPrinter(address) {
  if (typeof window === "undefined" || !address) return false;

  try {
    localStorage.setItem("rip_default_bt_printer", address);
  } catch (e) {}

  if (window.AndroidBluetoothPrinter?.setDefaultPrinterMac) {
    return window.AndroidBluetoothPrinter.setDefaultPrinterMac(address);
  }

  if (window.Capacitor?.Plugins?.BluetoothPrinter?.setDefaultPrinter) {
    try {
      await window.Capacitor.Plugins.BluetoothPrinter.setDefaultPrinter({ address });
      return true;
    } catch (e) {}
  }

  return true;
}

// Get saved default Bluetooth printer MAC
export function getDefaultBluetoothPrinterMac() {
  if (typeof window === "undefined") return "";

  if (window.AndroidBluetoothPrinter?.getDefaultPrinterMac) {
    const mac = window.AndroidBluetoothPrinter.getDefaultPrinterMac();
    if (mac) return mac;
  }

  try {
    return localStorage.getItem("rip_default_bt_printer") || "";
  } catch (e) {
    return "";
  }
}

// Build ESC/POS formatted byte buffer for standard 58mm thermal rolls (32 cols)
export function generateEscPosReceipt(bill, items = []) {
  const ESC = 0x1b;
  const GS = 0x1d;
  const LF = 0x0a;

  const enc = new TextEncoder();
  const segments = [];

  const pushBytes = (...bytes) => {
    bytes.forEach((b) => segments.push(b));
  };

  const pushText = (text) => {
    const encoded = enc.encode(text);
    for (let i = 0; i < encoded.length; i++) {
      segments.push(encoded[i]);
    }
  };

  // Commands
  const CMD = {
    init: [ESC, 0x40],
    normalMode: [ESC, 0x21, 0x00],
    resetSize: [GS, 0x21, 0x00],
    centerAlign: [ESC, 0x61, 0x01],
    leftAlign: [ESC, 0x61, 0x00],
    rightAlign: [ESC, 0x61, 0x02],
    boldOn: [ESC, 0x45, 0x01],
    boldOff: [ESC, 0x45, 0x00],
    feed3: [ESC, 0x64, 0x03],
    cut: [GS, 0x56, 0x41, 0x00],
  };

  const LINE = "--------------------------------";
  const dateStr = new Date(bill.endedAt || bill.createdAt || Date.now()).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.subtotal ?? Number(item.price || 0) * Number(item.quantity || 1)),
    0
  );

  // 1. Initialize
  pushBytes(...CMD.init);
  pushBytes(...CMD.normalMode);
  pushBytes(...CMD.resetSize);

  // 2. Header
  pushBytes(...CMD.centerAlign);
  pushBytes(...CMD.boldOn);
  pushText("REST IN PEACE CAFE\n");
  pushBytes(...CMD.boldOff);
  pushText("Sitra, Coimbatore\n");
  pushText(dateStr + "\n");
  pushText(LINE + "\n");

  // 3. Bill & Table Info
  pushBytes(...CMD.leftAlign);
  pushText(`Bill : BILL-${bill.id || bill.rawId || ""}\n`);
  pushText(`Table: Table ${bill.table?.tableNumber || bill.tableNumber || "-"}\n`);
  pushText(`Guest: ${bill.customer?.name || "Guest"}\n`);
  if (bill.customer?.phone) {
    pushText(`Phone: ${bill.customer.phone}\n`);
  }
  pushText(LINE + "\n");

  // 4. Column Header (32 cols: 16 ITEM | 5 QTY | 11 AMT)
  pushBytes(...CMD.boldOn);
  pushText("ITEM                 QTY     AMT\n");
  pushBytes(...CMD.boldOff);
  pushText(LINE + "\n");

  // 5. Items
  for (const item of items) {
    const fullName = (item.name || item.dish?.name || item.dishName || "Item").trim();
    const qty = Number(item.quantity || item.qty || 1);
    const rate = Number(item.price || 0).toFixed(2);
    const lineAmt = Number(item.subtotal ?? rate * qty);
    const amtStr = `Rs.${lineAmt.toFixed(2)}`;

    if (fullName.length <= 15) {
      const namePad = fullName.padEnd(16);
      const qtyPad = `${qty}x`.padEnd(5);
      const amtPad = amtStr.padStart(11);
      pushText(`${namePad}${qtyPad}${amtPad}\n`);
    } else {
      // Split into wrapped lines
      const words = fullName.split(" ");
      let curLine = "";
      for (const w of words) {
        if ((curLine + (curLine ? " " : "") + w).length <= 32) {
          curLine += (curLine ? " " : "") + w;
        } else {
          if (curLine) pushText(curLine + "\n");
          curLine = w;
        }
      }
      if (curLine) pushText(curLine + "\n");

      // Details row: "  2 x Rs.120.00" on left, "Rs.240.00" on right
      const detailStr = `  ${qty} x Rs.${rate}`;
      const spaces = Math.max(1, 32 - detailStr.length - amtStr.length);
      pushText(`${detailStr}${" ".repeat(spaces)}${amtStr}\n`);
    }
  }

  // 6. Totals
  const totalStr = `Rs.${totalAmount.toFixed(2)}`;
  const totalLabel = "TOTAL AMOUNT:";
  const totalSpaces = Math.max(1, 32 - totalLabel.length - totalStr.length);

  pushText(LINE + "\n");
  pushBytes(...CMD.boldOn);
  pushBytes(...CMD.leftAlign);
  pushText(`${totalLabel}${" ".repeat(totalSpaces)}${totalStr}\n`);
  pushBytes(...CMD.boldOff);
  pushText(LINE + "\n");

  // 7. Footer
  pushBytes(...CMD.centerAlign);
  pushText("Payment Settled [PAID]\n");
  pushText("Thank You! Visit Again\n");

  // 8. Feed and Cut
  pushBytes(...CMD.feed3);
  pushBytes(...CMD.cut);

  return new Uint8Array(segments);
}

// High-level Print Dispatcher
export async function printThermalReceipt(bill, items, targetMac = null) {
  if (!bill) throw new Error("No bill selected for printing");

  const escPosBytes = generateEscPosReceipt(bill, items);
  const base64Data = uint8ArrayToBase64(escPosBytes);

  // --- Path A: Android Native App (Direct Bluetooth SPP) ---
  if (window.AndroidBluetoothPrinter?.printRawBase64) {
    const result = window.AndroidBluetoothPrinter.printRawBase64(base64Data, targetMac || "");
    if (result && result.startsWith("ERROR:")) {
      throw new Error(result.replace("ERROR:", "").trim());
    }
    return { success: true, message: result || "Printed successfully" };
  }

  if (window.Capacitor?.Plugins?.BluetoothPrinter?.printReceipt) {
    try {
      const res = await window.Capacitor.Plugins.BluetoothPrinter.printReceipt({
        data: base64Data,
        address: targetMac || "",
      });
      return { success: true, message: res.message || "Printed successfully" };
    } catch (err) {
      throw new Error(err.message || "Print failed via Capacitor");
    }
  }

  // --- Path B: Desktop Web Bluetooth (Chrome / Edge) ---
  if (typeof navigator !== "undefined" && navigator.bluetooth) {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "000018f0-0000-1000-8000-00805f9b34fb",
          "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
          "49535343-fe7d-4ae5-8fa9-9fafd205e455",
          "0000ffe0-0000-1000-8000-00805f9b34fb",
          "0000ae30-0000-1000-8000-00805f9b34fb",
          "00001101-0000-1000-8000-00805f9b34fb",
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

      if (!printChar) throw new Error("No writable print service found on this Bluetooth device.");

      const CHUNK = 100;
      for (let i = 0; i < escPosBytes.length; i += CHUNK) {
        const chunk = escPosBytes.slice(i, i + CHUNK);
        if (printChar.properties.writeWithoutResponse) {
          await printChar.writeValueWithoutResponse(chunk);
        } else {
          await printChar.writeValue(chunk);
        }
        await new Promise((r) => setTimeout(r, 20));
      }

      device.gatt.disconnect();
      return { success: true, message: "Printed successfully via Web Bluetooth" };
    } catch (btErr) {
      if (btErr.name === "NotFoundError" || btErr.message?.includes("cancelled")) {
        throw new Error("Bluetooth connection cancelled by user");
      }
      console.warn("Web Bluetooth error:", btErr);
      throw btErr;
    }
  }

  // --- Path C: Browser System Print fallback ---
  if (typeof window !== "undefined" && window.print) {
    window.print();
    return { success: true, message: "Opened system print dialog" };
  }

  throw new Error("Printing is not supported in this environment");
}

// Send system notification to phone notification bar
export function sendPhoneNotification(title, message, orderId = "") {
  if (typeof window === "undefined") return;

  // 1. Android Native bridge
  if (window.AndroidBluetoothPrinter?.postOrderNotification) {
    try {
      window.AndroidBluetoothPrinter.postOrderNotification(title, message, String(orderId || ""));
    } catch (e) {
      console.warn("Failed to post native notification:", e);
    }
  }

  // 2. Capacitor Plugin bridge
  if (window.Capacitor?.Plugins?.BluetoothPrinter?.sendNotification) {
    try {
      window.Capacitor.Plugins.BluetoothPrinter.sendNotification({
        title,
        body: message,
        orderId: String(orderId || ""),
      });
    } catch (e) {}
  }

  // 3. Web Notification API fallback
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body: message,
        icon: "/favicon.ico",
        tag: `order-${orderId || Date.now()}`,
        requireInteraction: true,
      });
    } catch (e) {}
  }
}
