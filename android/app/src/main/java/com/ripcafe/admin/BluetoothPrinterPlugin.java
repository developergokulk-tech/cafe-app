package com.ripcafe.admin;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Base64;
import android.webkit.JavascriptInterface;

import androidx.core.app.NotificationCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(name = "BluetoothPrinter")
public class BluetoothPrinterPlugin extends Plugin {

    private static final String PREFS_NAME = "rip_printer_prefs";
    private static final String KEY_DEFAULT_PRINTER = "default_printer_mac";
    private static final String CHANNEL_ID = "rip_orders_channel";
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");

    private Context context;

    public BluetoothPrinterPlugin() {
    }

    public BluetoothPrinterPlugin(Context context) {
        this.context = context;
    }

    private Context getActiveContext() {
        if (context != null) return context;
        if (getContext() != null) return getContext();
        return null;
    }

    // ==========================================
    // CAPACITOR PLUGIN METHODS
    // ==========================================

    @PluginMethod
    public void getPairedPrinters(PluginCall call) {
        try {
            JSArray printers = getPairedPrintersArray();
            JSObject ret = new JSObject();
            ret.put("printers", printers);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void setDefaultPrinter(PluginCall call) {
        String address = call.getString("address");
        if (address == null || address.isEmpty()) {
            call.reject("Address is required");
            return;
        }
        setDefaultPrinterMac(address);
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("savedAddress", address);
        call.resolve(ret);
    }

    @PluginMethod
    public void getDefaultPrinter(PluginCall call) {
        String mac = getDefaultPrinterMac();
        JSObject ret = new JSObject();
        ret.put("address", mac);
        call.resolve(ret);
    }

    @PluginMethod
    public void printReceipt(PluginCall call) {
        String base64Data = call.getString("data");
        String address = call.getString("address");
        if (base64Data == null || base64Data.isEmpty()) {
            call.reject("Print data is required");
            return;
        }

        new Thread(() -> {
            try {
                String result = executePrint(base64Data, address);
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", result);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Print failed: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void sendNotification(PluginCall call) {
        String title = call.getString("title", "New Order Received");
        String message = call.getString("body", "Tap to open and accept order");
        String orderId = call.getString("orderId", "");
        dispatchNotification(title, message, orderId);
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    // ==========================================
    // JAVASCRIPT INTERFACE METHODS (FOR WEBVIEW)
    // ==========================================

    @JavascriptInterface
    public String getPairedPrintersJson() {
        try {
            JSONArray arr = new JSONArray();
            BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
            if (adapter == null || !adapter.isEnabled()) {
                return "[]";
            }
            String defaultMac = getDefaultPrinterMac();
            Set<BluetoothDevice> pairedDevices = adapter.getBondedDevices();
            if (pairedDevices != null) {
                for (BluetoothDevice device : pairedDevices) {
                    JSONObject obj = new JSONObject();
                    obj.put("name", device.getName() != null ? device.getName() : "Unknown Device");
                    obj.put("address", device.getAddress());
                    obj.put("isDefault", device.getAddress().equalsIgnoreCase(defaultMac));
                    arr.put(obj);
                }
            }
            return arr.toString();
        } catch (Exception e) {
            return "[]";
        }
    }

    @JavascriptInterface
    public boolean setDefaultPrinterMac(String address) {
        Context ctx = getActiveContext();
        if (ctx == null || address == null) return false;
        SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_DEFAULT_PRINTER, address).apply();
        return true;
    }

    @JavascriptInterface
    public String getDefaultPrinterMac() {
        Context ctx = getActiveContext();
        if (ctx == null) return "";
        SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String saved = prefs.getString(KEY_DEFAULT_PRINTER, "");
        if (saved != null && !saved.isEmpty()) {
            return saved;
        }

        // Auto-select first printer-like device if not saved yet
        try {
            BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
            if (adapter != null && adapter.isEnabled()) {
                Set<BluetoothDevice> paired = adapter.getBondedDevices();
                if (paired != null) {
                    // Search for device with printer keywords
                    for (BluetoothDevice d : paired) {
                        String name = (d.getName() != null ? d.getName() : "").toLowerCase();
                        if (name.contains("printer") || name.contains("pos") || name.contains("58") ||
                            name.contains("80") || name.contains("xp") || name.contains("rp") ||
                            name.contains("thermal") || name.contains("inner") || name.contains("bt-")) {
                            return d.getAddress();
                        }
                    }
                    // Fallback to first bonded device
                    if (!paired.isEmpty()) {
                        return paired.iterator().next().getAddress();
                    }
                }
            }
        } catch (Exception ignored) {}

        return "";
    }

    @JavascriptInterface
    public String printRawBase64(String base64Data, String targetMac) {
        try {
            return executePrint(base64Data, targetMac);
        } catch (Exception e) {
            return "ERROR: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public void postOrderNotification(String title, String message, String orderId) {
        dispatchNotification(title, message, orderId);
    }

    @JavascriptInterface
    public void triggerPhoneVibrate(int durationMs) {
        Context ctx = getActiveContext();
        if (ctx == null) return;
        try {
            Vibrator vibrator = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(durationMs);
                }
            }
        } catch (Exception ignored) {}
    }

    // ==========================================
    // CORE PRINT & NOTIFICATION LOGIC
    // ==========================================

    private JSArray getPairedPrintersArray() {
        JSArray arr = new JSArray();
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null || !adapter.isEnabled()) {
            return arr;
        }
        String defaultMac = getDefaultPrinterMac();
        Set<BluetoothDevice> pairedDevices = adapter.getBondedDevices();
        if (pairedDevices != null) {
            for (BluetoothDevice device : pairedDevices) {
                JSObject obj = new JSObject();
                obj.put("name", device.getName() != null ? device.getName() : "Unknown Device");
                obj.put("address", device.getAddress());
                obj.put("isDefault", device.getAddress().equalsIgnoreCase(defaultMac));
                arr.put(obj);
            }
        }
        return arr;
    }

    private synchronized String executePrint(String base64Data, String targetMac) throws Exception {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) {
            throw new Exception("Bluetooth is not supported on this device");
        }
        if (!adapter.isEnabled()) {
            throw new Exception("Bluetooth is disabled. Please turn on Bluetooth in settings");
        }

        String mac = targetMac;
        if (mac == null || mac.isEmpty()) {
            mac = getDefaultPrinterMac();
        }

        if (mac == null || mac.isEmpty()) {
            throw new Exception("No paired Bluetooth printer found. Please pair your thermal printer in Android Bluetooth settings first.");
        }

        BluetoothDevice device = null;
        try {
            device = adapter.getRemoteDevice(mac);
        } catch (IllegalArgumentException e) {
            throw new Exception("Invalid Bluetooth MAC address: " + mac);
        }

        if (device == null) {
            throw new Exception("Printer device not found for address: " + mac);
        }

        // Cancel discovery as it slows down connections significantly
        adapter.cancelDiscovery();

        byte[] printBytes = Base64.decode(base64Data, Base64.DEFAULT);
        if (printBytes == null || printBytes.length == 0) {
            throw new Exception("Empty print payload");
        }

        BluetoothSocket socket = null;
        OutputStream out = null;
        Exception lastException = null;

        // Try standard SPP RFCOMM UUID first
        try {
            socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
            socket.connect();
        } catch (Exception e1) {
            lastException = e1;
            // Fallback via reflection for stubborn printer chipsets
            try {
                Method m = device.getClass().getMethod("createRfcommSocket", new Class[]{int.class});
                socket = (BluetoothSocket) m.invoke(device, 1);
                if (socket != null) {
                    socket.connect();
                    lastException = null;
                }
            } catch (Exception e2) {
                lastException = e2;
            }
        }

        if (lastException != null || socket == null || !socket.isConnected()) {
            if (socket != null) {
                try { socket.close(); } catch (Exception ignored) {}
            }
            throw new Exception("Could not connect to printer (" + device.getName() + " - " + mac + "). Ensure printer is ON and within range.");
        }

        try {
            out = socket.getOutputStream();
            out.write(printBytes);
            out.flush();
            // Small pause for hardware buffer processing
            Thread.sleep(150);
            
            // Auto-remember this successful printer address
            setDefaultPrinterMac(mac);
            return "SUCCESS: Printed to " + device.getName();
        } finally {
            if (out != null) {
                try { out.close(); } catch (Exception ignored) {}
            }
            if (socket != null) {
                try { socket.close(); } catch (Exception ignored) {}
            }
        }
    }

    private static final int ORDER_NOTIFICATION_ID = 8888;

    public void dispatchNotification(String title, String message, String orderId) {
        Context ctx = getActiveContext();
        if (ctx == null) return;

        try {
            NotificationManager notificationManager = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (notificationManager == null) return;

            Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        "Kitchen & Order Alerts",
                        NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Incoming customer orders and table notifications");
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{0, 500, 200, 500, 200, 500});
                
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .build();
                channel.setSound(defaultSoundUri, audioAttributes);
                notificationManager.createNotificationChannel(channel);
            }

            Intent intent = new Intent(ctx, MainActivity.class);
            intent.setAction(Intent.ACTION_MAIN);
            intent.addCategory(Intent.CATEGORY_LAUNCHER);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            intent.putExtra("orderId", orderId);

            int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                    ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    : PendingIntent.FLAG_UPDATE_CURRENT;

            PendingIntent pendingIntent = PendingIntent.getActivity(ctx, 100, intent, flags);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_dialog_info)
                    .setContentTitle(title)
                    .setContentText(message)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(message))
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setOnlyAlertOnce(true)
                    .setVibrate(new long[]{0, 500, 200, 500, 200, 500})
                    .setSound(defaultSoundUri)
                    .setAutoCancel(true)
                    .setContentIntent(pendingIntent);

            // Single unified notification ID prevents multiple duplicate notification cards
            notificationManager.notify(ORDER_NOTIFICATION_ID, builder.build());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @JavascriptInterface
    public void cancelOrderNotification() {
        Context ctx = getActiveContext();
        if (ctx == null) return;
        try {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancel(ORDER_NOTIFICATION_ID);
            }
        } catch (Exception ignored) {}
    }
}
