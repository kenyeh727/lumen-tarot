import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lumen.tarot',
  appName: 'Lumen Tarot',
  webDir: 'dist',
  server: {
    url: "http://192.168.50.199:3000",
    cleartext: true
  }
};

export default config;
