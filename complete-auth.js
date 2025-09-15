#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { ConfigManager } from './dist/services/config.js';

async function completeAuth() {
  const authCode = process.argv[2];

  if (!authCode) {
    console.log('❌ Please provide the authorization code');
    console.log('Usage: node complete-auth.js [AUTHORIZATION_CODE]');
    console.log('Example: node complete-auth.js 4/0AX4XfWh...');
    process.exit(1);
  }

  console.log('🔄 Completing OAuth2 authorization...\n');

  try {
    const configManager = new ConfigManager();
    await configManager.loadConfig();

    const authService = new AuthService(
      configManager.getCredentialsPath(),
      configManager.getTokenPath()
    );

    await authService.loadCredentials(configManager.getCredentialsPath());

    console.log('🔐 Processing authorization code...');
    await authService.setAuthorizationCode(authCode.trim());

    console.log('✅ Authorization completed successfully!');
    console.log('🎉 Your Google Calendar MCP Server is now authenticated!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: node test-local.js (to test API functionality)');
    console.log('2. Add to Claude Desktop configuration');
    console.log('3. Start using calendar commands in Claude');

  } catch (error) {
    console.error('❌ Authorization failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('- Make sure you copied the entire authorization code');
    console.log('- Check that the code is not expired (try getting a new one)');
    console.log('- Verify your internet connection');
    process.exit(1);
  }
}

completeAuth();