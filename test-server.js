#!/usr/bin/env node

import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { spawn } from 'child_process';

async function testMCPServer() {
  console.log('🧪 Testing Google Calendar MCP Server...\n');

  // Start the MCP server process
  const serverProcess = spawn('node', [
    'dist/index.js',
    '--credentials',
    './config/credentials.json'
  ], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });

  let serverStarted = false;
  let serverError = '';

  // Listen for server errors
  serverProcess.stderr.on('data', (data) => {
    const message = data.toString();
    console.error('Server stderr:', message);
    serverError += message;

    if (message.includes('Google Calendar MCP Server running on stdio')) {
      serverStarted = true;
      console.log('✅ Server started successfully');
      testClient();
    }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });

  async function testClient() {
    try {
      // Create MCP client
      const transport = new StdioClientTransport({
        stdin: serverProcess.stdout,
        stdout: serverProcess.stdin
      });

      const client = new Client({
        name: 'test-client',
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      console.log('📡 Connecting to MCP server...');
      await client.connect(transport);
      console.log('✅ Connected to server');

      // Test listing tools
      console.log('🔧 Testing tool listing...');
      const tools = await client.listTools();
      console.log('✅ Available tools:', tools.tools.map(t => t.name).join(', '));

      // Test that we have the expected tools
      const expectedTools = ['create_event', 'update_event', 'delete_event', 'list_events', 'search_events'];
      const availableTools = tools.tools.map(t => t.name);

      for (const tool of expectedTools) {
        if (availableTools.includes(tool)) {
          console.log(`✅ Tool '${tool}' is available`);
        } else {
          console.log(`❌ Tool '${tool}' is missing`);
        }
      }

      console.log('\n🎉 Basic MCP server test completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('1. Complete Google OAuth2 authorization (if using OAuth2)');
      console.log('2. Add server to Claude Desktop configuration:');
      console.log('   {');
      console.log('     "mcpServers": {');
      console.log('       "google-calendar": {');
      console.log('         "command": "node",');
      console.log(`         "args": ["${process.cwd()}/dist/index.js", "--credentials", "${process.cwd()}/config/credentials.json"]`);
      console.log('       }');
      console.log('     }');
      console.log('   }');

      await client.close();
      serverProcess.kill();
      process.exit(0);

    } catch (error) {
      console.error('❌ Client test failed:', error.message);
      serverProcess.kill();
      process.exit(1);
    }
  }

  // Timeout after 10 seconds
  setTimeout(() => {
    if (!serverStarted) {
      console.error('❌ Server failed to start within 10 seconds');
      if (serverError) {
        console.error('Server error output:', serverError);
      }
      serverProcess.kill();
      process.exit(1);
    }
  }, 10000);
}

testMCPServer().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});