#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 XAPIHub MCP Extension Setup\n');
console.log('This script will help you configure your XAPIHub MCP extension for Cursor.\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setup() {
  try {
    // Get XAPIHub configuration
    console.log('📡 XAPIHub Configuration:');
    const baseUrl =  'https://api-dev.xapihub.io/platform/1.0.0';
    const token = await askQuestion('Enter your XAPIHub Bearer Token: ');

    if (!token) {
      console.error('❌ Bearer token is required!');
      process.exit(1);
    }

    // Create .env file
    const envContent = `# XAPIHub Configuration
XAPIHUB_BASE_URL=${baseUrl}
XAPIHUB_TOKEN=${token}

# MCP Server Configuration
MCP_SERVER_NAME=xapihub-mcp-server
MCP_SERVER_VERSION=1.0.0
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Created .env file');

    // Update cursor-mcp-config.json
    const cursorConfig = {
      mcpServers: {
        xapihub: {
          command: "node",
          args: [path.resolve("dist/index.js")],
          env: {
            XAPIHUB_BASE_URL: baseUrl,
            XAPIHUB_TOKEN: token
          },
          description: "XAPIHub API integration for Cursor",
          disabled: false
        }
      }
    };

    fs.writeFileSync('cursor-mcp-config.json', JSON.stringify(cursorConfig, null, 2));
    console.log('✅ Updated cursor-mcp-config.json');

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test the connection: npm run test-connection');
    console.log('2. Add the MCP server to your Cursor configuration:');
    console.log('   - Open Cursor settings');
    console.log('   - Go to MCP Servers section');
    console.log('   - Add the configuration from cursor-mcp-config.json');
    console.log('3. Restart Cursor to load the extension');
    console.log('\n💡 Usage in Cursor:');
    console.log('   - Ask: "Get my XAPIHub user details"');
    console.log('   - Ask: "Test XAPIHub connection"');
    console.log('   - Use Ctrl+Shift+P and search for "XAPIHub"');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup();
