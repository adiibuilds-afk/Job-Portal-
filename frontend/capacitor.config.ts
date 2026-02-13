import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jobgrid.app',
  appName: 'JobGrid',
  webDir: 'out',
  server: {
    url: 'https://jobgrid.in',
    allowNavigation: ['jobgrid.in', '*.jobgrid.in'],
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Badge: {
      persist: true,
      autoClear: false,
    }
  }
};

export default config;
