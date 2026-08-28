package com.ripcafe.admin;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashSet;
import java.util.Set;

public class OrderPollingService extends Service {

    private static final String TAG = "OrderPollingService";
    private static final String ORDERS_API = "https://restinpeacecafe.vercel.app/api/orders";
    private static final String NOTIFS_API = "https://restinpeacecafe.vercel.app/api/notifications";

    private static final String CHANNEL_ID_ORDERS = "rip_orders_channel_high";
    private static final String CHANNEL_ID_SERVICE = "rip_background_service_channel";

    private static final int SERVICE_NOTIFICATION_ID = 9901;
    private static final int ORDER_NOTIFICATION_ID = 8888;
    private static final int WAITER_NOTIFICATION_ID = 8889;

    private static final long POLL_INTERVAL_MS = 3500; // 3.5 seconds

    private Handler handler;
    private Runnable pollRunnable;

    private final Set<Integer> notifiedOrderIds = new HashSet<>();
    private final Set<String> notifiedWaiterCalls = new HashSet<>();
    private int lastAlertedOrderId = -1;
    private int lastAlertedPendingCount = -1;

    private Ringtone activeRingtone;
    private Handler ringingLoopHandler;
    private Runnable ringingLoopRunnable;
    private boolean isRinging = false;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
        startForegroundServiceNotification();

        handler = new Handler(Looper.getMainLooper());
        ringingLoopHandler = new Handler(Looper.getMainLooper());

        pollRunnable = new Runnable() {
            @Override
            public void run() {
                fetchOrdersAndNotifsInBackground();
                handler.postDelayed(this, POLL_INTERVAL_MS);
            }
        };

        handler.post(pollRunnable);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && "STOP_RINGING".equals(intent.getAction())) {
            stopRingingAlert();
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (handler != null && pollRunnable != null) {
            handler.removeCallbacks(pollRunnable);
        }
        stopRingingAlert();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;

            // 1. Silent channel for persistent background polling service
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID_SERVICE,
                    "Order Monitor Service",
                    NotificationManager.IMPORTANCE_LOW
            );
            serviceChannel.setDescription("Keeps app connected in background for instant order alerts");
            serviceChannel.setShowBadge(false);
            nm.createNotificationChannel(serviceChannel);

            // 2. High Priority Loud channel for Incoming Order Alerts
            Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            if (soundUri == null) {
                soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }

            NotificationChannel ordersChannel = new NotificationChannel(
                    CHANNEL_ID_ORDERS,
                    "Incoming Order Ring Alerts",
                    NotificationManager.IMPORTANCE_HIGH
            );
            ordersChannel.setDescription("Loud notifications when new customer orders or waiter calls arrive");
            ordersChannel.enableVibration(true);
            ordersChannel.setVibrationPattern(new long[]{0, 500, 200, 500, 200, 500});
            ordersChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                    .build();
            ordersChannel.setSound(soundUri, audioAttributes);
            nm.createNotificationChannel(ordersChannel);
        }
    }

    private void startForegroundServiceNotification() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setAction(Intent.ACTION_MAIN);
        intent.addCategory(Intent.CATEGORY_LAUNCHER);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                : PendingIntent.FLAG_UPDATE_CURRENT;

        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, flags);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID_SERVICE)
                .setContentTitle("RIP Cafe Live Monitor")
                .setContentText("Active · Listening for orders & table service calls")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();

        startForeground(SERVICE_NOTIFICATION_ID, notification);
    }

    private void fetchOrdersAndNotifsInBackground() {
        new Thread(() -> {
            fetchOrders();
            fetchWaiterCalls();
        }).start();
    }

    private void fetchOrders() {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(ORDERS_API + "?t=" + System.currentTimeMillis());
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(4000);
            conn.setRequestProperty("User-Agent", "RIPCafe-Android-Poller");

            if (conn.getResponseCode() == 200) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) {
                    sb.append(line);
                }
                in.close();

                JSONArray ordersArray = new JSONArray(sb.toString());
                processOrders(ordersArray);
            }
        } catch (Exception ignored) {
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private void fetchWaiterCalls() {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(NOTIFS_API + "?t=" + System.currentTimeMillis());
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(4000);
            conn.setRequestProperty("User-Agent", "RIPCafe-Android-Poller");

            if (conn.getResponseCode() == 200) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) {
                    sb.append(line);
                }
                in.close();

                JSONArray notifsArray = new JSONArray(sb.toString());
                processWaiterCalls(notifsArray);
            }
        } catch (Exception ignored) {
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private void processOrders(JSONArray ordersArray) {
        try {
            int pendingCount = 0;
            int lastPendingTable = 0;
            String lastPendingTotal = "0";
            int lastPendingItems = 1;
            int lastPendingOrderId = 0;

            for (int i = 0; i < ordersArray.length(); i++) {
                JSONObject o = ordersArray.getJSONObject(i);
                int orderId = o.optInt("id", 0);
                String status = o.optString("status", "").toUpperCase();

                boolean isUnaccepted = "PENDING".equals(status) || "RECEIVED".equals(status);
                if (isUnaccepted) {
                    pendingCount++;
                    lastPendingOrderId = orderId;

                    if (o.has("session") && !o.isNull("session")) {
                        JSONObject session = o.getJSONObject("session");
                        if (session.has("table") && !session.isNull("table")) {
                            lastPendingTable = session.getJSONObject("table").optInt("tableNumber", 0);
                        }
                    }
                    lastPendingTotal = o.optString("totalAmount", "0");
                    JSONArray items = o.optJSONArray("orderItems");
                    lastPendingItems = items != null ? items.length() : 1;
                }
            }

            if (pendingCount > 0) {
                // Post/update single unified notification card only when new order arrives or pending count changes
                if (lastPendingOrderId != lastAlertedOrderId || pendingCount != lastAlertedPendingCount) {
                    lastAlertedOrderId = lastPendingOrderId;
                    lastAlertedPendingCount = pendingCount;
                    triggerOrderAlert(lastPendingOrderId, lastPendingTable, lastPendingTotal, lastPendingItems, pendingCount);
                }
                // Keep ringing until all orders are accepted
                startRingingAlert();
            } else {
                // All orders accepted: stop ringing & clear order notification card
                lastAlertedOrderId = -1;
                lastAlertedPendingCount = 0;
                if (isRinging) {
                    stopRingingAlert();
                }
                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    nm.cancel(ORDER_NOTIFICATION_ID);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error in processOrders: " + e.getMessage());
        }
    }

    private void processWaiterCalls(JSONArray notifsArray) {
        try {
            for (int i = 0; i < notifsArray.length(); i++) {
                JSONObject n = notifsArray.getJSONObject(i);
                String id = n.optString("id", "");
                int table = n.optInt("tableNumber", 0);
                String msg = n.optString("message", "Waiter Assistance");

                if (!notifiedWaiterCalls.contains(id)) {
                    notifiedWaiterCalls.add(id);
                    triggerWaiterCallAlert(table, msg);
                }
            }
        } catch (Exception ignored) {}
    }

    private void triggerOrderAlert(int orderId, int tableNumber, String total, int itemCount, int totalPending) {
        new Handler(Looper.getMainLooper()).post(() -> {
            try {
                Context ctx = getApplicationContext();

                Intent openAppIntent = new Intent(ctx, MainActivity.class);
                openAppIntent.setAction(Intent.ACTION_MAIN);
                openAppIntent.addCategory(Intent.CATEGORY_LAUNCHER);
                openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                openAppIntent.putExtra("orderId", String.valueOf(orderId));

                int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                        ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        : PendingIntent.FLAG_UPDATE_CURRENT;

                PendingIntent contentPendingIntent = PendingIntent.getActivity(ctx, 100, openAppIntent, flags);

                Intent stopRingIntent = new Intent(ctx, OrderPollingService.class);
                stopRingIntent.setAction("STOP_RINGING");
                PendingIntent stopPendingIntent = PendingIntent.getService(ctx, 200, stopRingIntent, flags);

                String title = totalPending > 1
                        ? "🔔 " + totalPending + " NEW ORDERS WAITING ACCEPTANCE"
                        : "🔔 NEW ORDER: Table " + (tableNumber > 0 ? tableNumber : "—");

                String message = itemCount + " item(s) • Total: ₹" + total + " • Tap to open & accept";

                Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
                if (soundUri == null) {
                    soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                }

                NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, CHANNEL_ID_ORDERS)
                        .setSmallIcon(android.R.drawable.ic_dialog_alert)
                        .setContentTitle(title)
                        .setContentText(message)
                        .setStyle(new NotificationCompat.BigTextStyle().bigText(message + "\n\nRinging continuously until accepted by Chef or Admin."))
                        .setPriority(NotificationCompat.PRIORITY_MAX)
                        .setCategory(NotificationCompat.CATEGORY_CALL)
                        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                        .setOnlyAlertOnce(true)
                        .setAutoCancel(true)
                        .setSound(soundUri)
                        .setVibrate(new long[]{0, 600, 200, 600, 200, 600})
                        .setContentIntent(contentPendingIntent)
                        .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Silence Ring", stopPendingIntent)
                        .addAction(android.R.drawable.ic_input_add, "Accept Order", contentPendingIntent);

                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    nm.notify(ORDER_NOTIFICATION_ID, builder.build());
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to trigger order alert: " + e.getMessage());
            }
        });
    }

    private void triggerWaiterCallAlert(int tableNumber, String message) {
        new Handler(Looper.getMainLooper()).post(() -> {
            try {
                Context ctx = getApplicationContext();

                Intent openAppIntent = new Intent(ctx, MainActivity.class);
                openAppIntent.setAction(Intent.ACTION_MAIN);
                openAppIntent.addCategory(Intent.CATEGORY_LAUNCHER);
                openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);

                int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                        ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        : PendingIntent.FLAG_UPDATE_CURRENT;

                PendingIntent contentPendingIntent = PendingIntent.getActivity(ctx, 300, openAppIntent, flags);

                String title = "🛎️ WAITER CALL: Table " + (tableNumber > 0 ? tableNumber : "—");

                NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, CHANNEL_ID_ORDERS)
                        .setSmallIcon(android.R.drawable.ic_dialog_info)
                        .setContentTitle(title)
                        .setContentText(message)
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                        .setOnlyAlertOnce(true)
                        .setAutoCancel(true)
                        .setContentIntent(contentPendingIntent);

                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    nm.notify(WAITER_NOTIFICATION_ID, builder.build());
                }

                // Play brief chime
                playRingOnce();
            } catch (Exception ignored) {}
        });
    }

    private void startRingingAlert() {
        if (isRinging) return;
        isRinging = true;

        playRingOnce();

        ringingLoopRunnable = new Runnable() {
            @Override
            public void run() {
                if (isRinging) {
                    playRingOnce();
                    ringingLoopHandler.postDelayed(this, 2500);
                }
            }
        };

        ringingLoopHandler.postDelayed(ringingLoopRunnable, 2500);
    }

    private void playRingOnce() {
        try {
            // Vibrate
            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createWaveform(new long[]{0, 400, 150, 400}, -1));
                } else {
                    v.vibrate(new long[]{0, 400, 150, 400}, -1);
                }
            }

            // Sound
            Uri alertUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            if (alertUri == null) {
                alertUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }
            if (alertUri != null) {
                if (activeRingtone != null && activeRingtone.isPlaying()) {
                    activeRingtone.stop();
                }
                activeRingtone = RingtoneManager.getRingtone(getApplicationContext(), alertUri);
                if (activeRingtone != null) {
                    activeRingtone.play();
                }
            }
        } catch (Exception ignored) {}
    }

    private void stopRingingAlert() {
        isRinging = false;
        if (ringingLoopHandler != null && ringingLoopRunnable != null) {
            ringingLoopHandler.removeCallbacks(ringingLoopRunnable);
        }
        if (activeRingtone != null) {
            try {
                activeRingtone.stop();
            } catch (Exception ignored) {}
        }
    }
}
