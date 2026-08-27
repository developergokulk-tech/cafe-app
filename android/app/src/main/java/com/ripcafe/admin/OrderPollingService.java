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
    private static final String API_URL = "https://restinpeacecafe.vercel.app/api/orders";
    private static final String CHANNEL_ID_ORDERS = "rip_orders_channel_high";
    private static final String CHANNEL_ID_SERVICE = "rip_background_service_channel";
    private static final int SERVICE_NOTIFICATION_ID = 9901;
    private static final long POLL_INTERVAL_MS = 4000; // 4 seconds

    private Handler handler;
    private Runnable pollRunnable;
    private final Set<Integer> knownOrderIds = new HashSet<>();
    private boolean isInitialLoad = true;
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
                fetchOrdersInBackground();
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
                    "Order Listener Service",
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
            ordersChannel.setDescription("Loud notifications when new customer orders arrive");
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
        int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                : PendingIntent.FLAG_UPDATE_CURRENT;

        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, flags);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID_SERVICE)
                .setContentTitle("RIP Cafe Live Order Monitor")
                .setContentText("Active · Listening for new incoming customer orders")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();

        startForeground(SERVICE_NOTIFICATION_ID, notification);
    }

    private void fetchOrdersInBackground() {
        new Thread(() -> {
            HttpURLConnection conn = null;
            try {
                URL url = new URL(API_URL);
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                conn.setRequestProperty("User-Agent", "RIPCafe-Android-Background-Poller");

                int code = conn.getResponseCode();
                if (code == 200) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = in.readLine()) != null) {
                        sb.append(line);
                    }
                    in.close();

                    JSONArray ordersArray = new JSONArray(sb.toString());
                    processOrdersResponse(ordersArray);
                }
            } catch (Exception e) {
                // Silently handle temporary connection glitches
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        }).start();
    }

    private void processOrdersResponse(JSONArray ordersArray) {
        try {
            boolean hasPendingOrders = false;

            for (int i = 0; i < ordersArray.length(); i++) {
                JSONObject o = ordersArray.getJSONObject(i);
                int orderId = o.optInt("id", 0);
                String status = o.optString("status", "").toUpperCase();

                boolean isUnaccepted = "PENDING".equals(status) || "RECEIVED".equals(status);
                if (isUnaccepted) {
                    hasPendingOrders = true;
                }

                if (isInitialLoad) {
                    knownOrderIds.add(orderId);
                } else {
                    if (!knownOrderIds.contains(orderId) && isUnaccepted) {
                        knownOrderIds.add(orderId);

                        // Extract info
                        int tableNum = 0;
                        if (o.has("session") && !o.isNull("session")) {
                            JSONObject session = o.getJSONObject("session");
                            if (session.has("table") && !session.isNull("table")) {
                                tableNum = session.getJSONObject("table").optInt("tableNumber", 0);
                            }
                        }

                        String total = o.optString("totalAmount", "0");
                        JSONArray items = o.optJSONArray("orderItems");
                        int itemsCount = items != null ? items.length() : 1;

                        triggerBackgroundOrderAlert(orderId, tableNum, total, itemsCount);
                    }
                }
            }

            if (isInitialLoad) {
                isInitialLoad = false;
            }

            // Stop ringing if no pending orders exist anymore (order was accepted)
            if (!hasPendingOrders && isRinging) {
                stopRingingAlert();
            }

        } catch (Exception e) {
            Log.w(TAG, "Error processing orders JSON: " + e.getMessage());
        }
    }

    private void triggerBackgroundOrderAlert(int orderId, int tableNumber, String total, int itemCount) {
        new Handler(Looper.getMainLooper()).post(() -> {
            try {
                Context ctx = getApplicationContext();

                // 1. Build Full-Screen / Heads-up Notification
                Intent openAppIntent = new Intent(ctx, MainActivity.class);
                openAppIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                openAppIntent.putExtra("orderId", String.valueOf(orderId));

                int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                        ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        : PendingIntent.FLAG_UPDATE_CURRENT;

                PendingIntent contentPendingIntent = PendingIntent.getActivity(ctx, orderId, openAppIntent, flags);

                // Stop ring action button in notification
                Intent stopRingIntent = new Intent(ctx, OrderPollingService.class);
                stopRingIntent.setAction("STOP_RINGING");
                PendingIntent stopPendingIntent = PendingIntent.getService(ctx, orderId + 5000, stopRingIntent, flags);

                String title = "🔔 NEW ORDER: Table " + (tableNumber > 0 ? tableNumber : "—");
                String message = itemCount + " item(s) • Total: ₹" + total + " • Tap to open & accept";

                Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
                if (soundUri == null) {
                    soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                }

                NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, CHANNEL_ID_ORDERS)
                        .setSmallIcon(android.R.drawable.ic_dialog_alert)
                        .setContentTitle(title)
                        .setContentText(message)
                        .setStyle(new NotificationCompat.BigTextStyle().bigText(message + "\n\nRinging until accepted by Chef or Admin."))
                        .setPriority(NotificationCompat.PRIORITY_MAX)
                        .setCategory(NotificationCompat.CATEGORY_CALL)
                        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                        .setAutoCancel(true)
                        .setSound(soundUri)
                        .setVibrate(new long[]{0, 600, 200, 600, 200, 600})
                        .setContentIntent(contentPendingIntent)
                        .setFullScreenIntent(contentPendingIntent, true)
                        .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Silence Ring", stopPendingIntent)
                        .addAction(android.R.drawable.ic_input_add, "Accept Order", contentPendingIntent);

                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    nm.notify(orderId, builder.build());
                }

                // 2. Start continuous ringing loop
                startRingingAlert();

            } catch (Exception e) {
                Log.e(TAG, "Failed to trigger background alert: " + e.getMessage());
            }
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
