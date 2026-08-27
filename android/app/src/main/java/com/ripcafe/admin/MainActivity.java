package com.ripcafe.admin;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {

    private BluetoothPrinterPlugin printerPlugin;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BluetoothPrinterPlugin.class);
        super.onCreate(savedInstanceState);

        printerPlugin = new BluetoothPrinterPlugin(this);
        checkAndRequestPermissions();

        try {
            Intent serviceIntent = new Intent(this, OrderPollingService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            WebSettings settings = webView.getSettings();
            
            // Allow background audio autoplay without requiring initial user tap
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setDomStorageEnabled(true);
            settings.setJavaScriptEnabled(true);
            settings.setDatabaseEnabled(true);

            // Expose native bluetooth printer bridge directly to JavaScript in WebView
            if (printerPlugin != null) {
                webView.addJavascriptInterface(printerPlugin, "AndroidBluetoothPrinter");
            }

            // Universal Native Bluetooth Polyfill script
            String polyfillJs = "javascript:(function() {" +
                    "if (window.__rip_bt_polyfilled) return;" +
                    "window.__rip_bt_polyfilled = true;" +
                    "if (!navigator.bluetooth) {" +
                    "  navigator.bluetooth = {" +
                    "    requestDevice: async function() {" +
                    "      return {" +
                    "        name: 'Bluetooth Thermal Printer'," +
                    "        gatt: {" +
                    "          connected: true," +
                    "          connect: async function() {" +
                    "            return {" +
                    "              getPrimaryServices: async function() {" +
                    "                return [{" +
                    "                  getCharacteristics: async function() {" +
                    "                    return [{" +
                    "                      properties: { write: true, writeWithoutResponse: true }," +
                    "                      writeValue: async function(buf) {" +
                    "                        var b = new Uint8Array(buf.buffer || buf);" +
                    "                        var s = '';" +
                    "                        for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);" +
                    "                        if (window.AndroidBluetoothPrinter) window.AndroidBluetoothPrinter.printRawBase64(window.btoa(s), '');" +
                    "                      }," +
                    "                      writeValueWithoutResponse: async function(buf) {" +
                    "                        var b = new Uint8Array(buf.buffer || buf);" +
                    "                        var s = '';" +
                    "                        for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);" +
                    "                        if (window.AndroidBluetoothPrinter) window.AndroidBluetoothPrinter.printRawBase64(window.btoa(s), '');" +
                    "                      }" +
                    "                    }];" +
                    "                  }" +
                    "                }];" +
                    "              }" +
                    "            };" +
                    "          }," +
                    "          disconnect: function() {}" +
                    "        }" +
                    "      };" +
                    "    }" +
                    "  };" +
                    "}" +
                    "})()";

            webView.evaluateJavascript(polyfillJs, null);
        }
    }

    private void checkAndRequestPermissions() {
        List<String> permissionsNeeded = new ArrayList<>();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.BLUETOOTH_CONNECT);
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.BLUETOOTH_SCAN);
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }

        if (!permissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsNeeded.toArray(new String[0]), 101);
        }
    }
}
