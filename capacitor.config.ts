import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.duses.tavla',
  appName: 'Düşeş Tavla',
  webDir: 'out',
  backgroundColor: '#120b07',
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
  plugins: {
    // Gerçek AdMob App ID'nizi .env dosyasına yazın, örn:
    // NEXT_PUBLIC_ADMOB_APP_ID=ca-app-pub-XXXX~YYYY
  },
};

export default config;
