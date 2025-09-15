#!/usr/bin/env node

import { AuthService } from './dist/services/auth.js';
import { CalendarService } from './dist/services/calendar.js';
import { ConfigManager } from './dist/services/config.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function testCalendarAPI() {
  console.log('🗓️  Google Calendar API Local Test\n');
  console.log('==================================\n');

  let authService, calendarService;

  try {
    // Initialize services
    console.log('📋 1. Initializing services...');
    const configManager = new ConfigManager();
    await configManager.loadConfig();

    authService = new AuthService(
      configManager.getCredentialsPath(),
      configManager.getTokenPath()
    );

    console.log('✅ Services initialized');

    // Load credentials
    console.log('\n📁 2. Loading credentials...');
    await authService.loadCredentials(configManager.getCredentialsPath());
    console.log('✅ Credentials loaded');

    // Check authentication
    console.log('\n🔐 3. Checking authentication...');
    if (!authService.isAuthenticated()) {
      console.log('⚠️  Not authenticated. Starting OAuth2 flow...');

      try {
        await authService.authorize();
      } catch (error) {
        if (error.message.includes('Authorization required')) {
          console.log('\n🔗 Please complete the OAuth2 authorization:');
          console.log('1. Visit the URL shown above');
          console.log('2. Complete the Google authorization');
          console.log('3. Copy the authorization code');

          const authCode = await askQuestion('\nEnter the authorization code: ');

          console.log('\n🔄 Processing authorization code...');
          await authService.setAuthorizationCode(authCode.trim());
          console.log('✅ Authorization completed and tokens saved!');
        } else {
          throw error;
        }
      }
    } else {
      console.log('✅ Already authenticated');
    }

    // Initialize calendar service
    calendarService = new CalendarService(authService, configManager);
    console.log('✅ Calendar service ready');

    // Test API calls
    console.log('\n🧪 4. Testing Calendar API calls...\n');

    // Test 1: List recent events
    console.log('📅 Test 1: Listing recent events...');
    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const events = await calendarService.listEvents({
        timeMin: oneWeekAgo.toISOString(),
        timeMax: now.toISOString(),
        maxResults: 10,
        orderBy: 'startTime',
        singleEvents: true,
        showDeleted: false
      });

      console.log(`✅ Found ${events.length} events in the past week`);
      if (events.length > 0) {
        console.log('📋 Recent events:');
        events.slice(0, 3).forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.summary} (${event.start.dateTime || event.start.date})`);
        });
        if (events.length > 3) {
          console.log(`   ... and ${events.length - 3} more events`);
        }
      } else {
        console.log('   No events found in the past week');
      }
    } catch (error) {
      console.error('❌ Failed to list events:', error.message);
    }

    // Test 2: Create a test event
    console.log('\n📝 Test 2: Creating a test event...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0); // 2 PM tomorrow

      const endTime = new Date(tomorrow);
      endTime.setHours(15, 0, 0, 0); // 3 PM tomorrow

      const testEvent = await calendarService.createEvent({
        summary: 'MCP Server Test Event',
        description: 'This is a test event created by the Google Calendar MCP Server',
        start: {
          dateTime: tomorrow.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        status: 'confirmed'
      });

      console.log('✅ Test event created successfully!');
      console.log(`   Event ID: ${testEvent.id}`);
      console.log(`   Title: ${testEvent.summary}`);
      console.log(`   Start: ${testEvent.start.dateTime}`);

      // Test 3: Update the test event
      console.log('\n✏️  Test 3: Updating the test event...');
      const updatedEvent = await calendarService.updateEvent({
        eventId: testEvent.id,
        summary: 'MCP Server Test Event (Updated)',
        description: 'This test event has been updated successfully!',
        location: 'Test Location'
      });

      console.log('✅ Test event updated successfully!');
      console.log(`   New title: ${updatedEvent.summary}`);
      console.log(`   Location: ${updatedEvent.location}`);

      // Test 4: Search for the test event
      console.log('\n🔍 Test 4: Searching for the test event...');
      const searchResults = await calendarService.searchEvents({
        q: 'MCP Server Test',
        maxResults: 5
      });

      console.log(`✅ Search completed, found ${searchResults.length} matching events`);
      if (searchResults.length > 0) {
        console.log('🔍 Search results:');
        searchResults.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.summary} (${event.id})`);
        });
      }

      // Ask if user wants to delete the test event
      const shouldDelete = await askQuestion('\n🗑️  Delete the test event? (y/n): ');

      if (shouldDelete.toLowerCase() === 'y' || shouldDelete.toLowerCase() === 'yes') {
        console.log('\n🗑️  Test 5: Deleting the test event...');
        await calendarService.deleteEvent({ eventId: testEvent.id });
        console.log('✅ Test event deleted successfully!');
      } else {
        console.log('\n📌 Test event kept in calendar');
      }

    } catch (error) {
      console.error('❌ Failed to create/update test event:', error.message);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n✅ Your Google Calendar MCP Server is working correctly!');
    console.log('\n📋 Next steps:');
    console.log('1. Add the server to your Claude Desktop configuration');
    console.log('2. Restart Claude Desktop');
    console.log('3. Start using calendar commands in Claude');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);

    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Try these troubleshooting steps:');
      console.log('1. Check that your credentials.json file is valid');
      console.log('2. Make sure you completed the OAuth2 authorization');
      console.log('3. Check that the Calendar API is enabled in Google Cloud Console');
    }

    process.exit(1);
  } finally {
    rl.close();
  }
}

console.log('Starting Google Calendar API test...\n');
testCalendarAPI().catch(error => {
  console.error('❌ Unexpected error:', error);
  rl.close();
  process.exit(1);
});