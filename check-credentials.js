#!/usr/bin/env node

import fs from 'fs';

function checkCredentialsType() {
  console.log('🔍 Checking current credentials configuration...\n');

  try {
    const credentialsPath = './config/credentials.json';
    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
    const credentials = JSON.parse(credentialsContent);

    if (credentials.type === 'service_account') {
      console.log('✅ Service Account credentials detected');
      console.log(`   Client Email: ${credentials.client_email}`);
      console.log(`   Project ID: ${credentials.project_id}`);
      console.log('\n📋 Next steps for Service Account:');
      console.log('1. Share your Google Calendar with the service account email');
      console.log('2. Run: node test-local.js');

    } else if (credentials.installed) {
      console.log('⚠️  OAuth2 User credentials detected');
      console.log(`   Client ID: ${credentials.installed.client_id}`);
      console.log(`   Project ID: ${credentials.installed.project_id}`);
      console.log('\n❌ OAuth2 Issue: App not verified by Google');
      console.log('\n📋 Solutions:');
      console.log('1. Add yourself as test user in Google Cloud Console');
      console.log('2. Or switch to Service Account (recommended)');
      console.log('\n🔗 Useful links:');
      console.log('   OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent');
      console.log('   Service Accounts: https://console.cloud.google.com/iam-admin/serviceaccounts');

    } else {
      console.log('❓ Unknown credentials format');
      console.log('Please check your credentials.json file');
    }

  } catch (error) {
    console.error('❌ Error reading credentials:', error.message);
  }
}

checkCredentialsType();