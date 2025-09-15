#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { ConfigManager } from './dist/services/config.js';

async function testAuth() {
  console.log('🔐 Testing Google Calendar Authentication...\n');

  try {
    const configManager = new ConfigManager();
    await configManager.loadConfig();

    const authService = new AuthService(
      configManager.getCredentialsPath(),
      configManager.getTokenPath()
    );

    console.log('📁 Loading credentials from:', configManager.getCredentialsPath());
    await authService.loadCredentials(configManager.getCredentialsPath());

    console.log('✅ Credentials loaded successfully');

    // Check if already authenticated
    if (authService.isAuthenticated()) {
      console.log('✅ Already authenticated!');
      console.log('🎉 Your Google Calendar MCP Server is ready to use!');
    } else {
      console.log('⚠️  Authentication required');
      console.log('📋 To complete setup:');
      console.log('1. Run the server: node dist/index.js --credentials ./config/credentials.json');
      console.log('2. Follow the authorization URL that will be printed');
      console.log('3. Complete the Google authorization flow');
      console.log('4. The server will save tokens automatically');

      // Try to start auth flow
      try {
        await authService.authorize();
      } catch (error) {
        if (error.message.includes('Authorization required')) {
          console.log('\n🔗 OAuth2 flow needs to be completed');
        } else {
          throw error;
        }
      }
    }

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);

    if (error.message.includes('ENOENT')) {
      console.log('\n💡 Troubleshooting:');
      console.log('- Make sure credentials.json exists in config/ directory');
      console.log('- Check that the file has valid JSON format');
    }

    process.exit(1);
  }
}

testAuth();