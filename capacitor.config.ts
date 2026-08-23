import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ripcafe.admin',
  appName: 'RIP Cafe Staff',
  webDir: 'public',
  server: {
    // 👈 Pointing to production /admin portal
    // When testing locally, you can change this to http://YOUR_PC_IP:3000/admin
    url: 'https://cafe-app-developergokulk-tech.vercel.app/admin',
    cleartext: true,
    allowNavigation: ['*'],
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#07060A',
    webContentsDebuggingEnabled: true,
  },
};

export default config;
