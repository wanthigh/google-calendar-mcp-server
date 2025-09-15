#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { ConfigManager } from './dist/services/config.js';

async function authorizeApp() {
  console.log('🔐 Google Calendar OAuth2 Authorization\n');

  try {
    const configManager = new ConfigManager();
    await configManager.loadConfig();

    const authService = new AuthService(
      configManager.getCredentialsPath(),
      configManager.getTokenPath()
    );

    await authService.loadCredentials(configManager.getCredentialsPath());

    if (authService.isAuthenticated()) {
      console.log('✅ Already authenticated!');
      console.log('🎉 Your app is ready to use!');
      process.exit(0);
    }

    try {
      await authService.authorize();
    } catch (error) {
      if (error.message.includes('Authorization required')) {
        console.log('\n🔗 Authorization URL generated above.');
        console.log('\n📋 Steps to complete:');
        console.log('1. Copy the URL and open it in your browser');
        console.log('2. Sign in to your Google account');
        console.log('3. Allow the app to access your calendar');
        console.log('4. Copy the authorization code from the redirect URL');
        console.log('5. Run: node complete-auth.js [AUTHORIZATION_CODE]');
        console.log('\nExample: node complete-auth.js 4/0AX4XfWh...');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Authorization setup failed:', error.message);
    process.exit(1);
  }
}

authorizeApp();