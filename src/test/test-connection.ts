#!/usr/bin/env node

import { config } from 'dotenv';
import { XAPIHubClient } from '../services/xapihub-client.js';
import { XAPIHubConfig } from '../types/xapihub.js';

// Load environment variables
config();

/**
 * Test script to verify XAPIHub API connection
 * Run with: npm run test-connection
 */
async function testConnection() {
  console.log('🔍 Testing XAPIHub API Connection...\n');

  // Validate environment variables
  const baseUrl = process.env.XAPIHUB_BASE_URL;
  const token = process.env.XAPIHUB_TOKEN;

  if (!baseUrl) {
    console.error('❌ Error: XAPIHUB_BASE_URL environment variable is required');
    process.exit(1);
  }

  if (!token) {
    console.error('❌ Error: XAPIHUB_TOKEN environment variable is required');
    process.exit(1);
  }

  console.log(`📡 Base URL: ${baseUrl}`);
  console.log(`🔑 Token: ${token.substring(0, 20)}...${token.substring(token.length - 10)}\n`);

  // Create client and test connection
  const config: XAPIHubConfig = { baseUrl, token };
  const client = new XAPIHubClient(config);

  try {
    // Test basic connection
    console.log('1️⃣ Testing basic connection...');
    const connectionTest = await client.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Connection successful!\n');
    } else {
      console.log('❌ Connection failed:', connectionTest.error);
      return;
    }

    // Test getting current user
    console.log('2️⃣ Testing getCurrentUser endpoint...');
    const userResult = await client.getCurrentUser();
    
    if (userResult.success && userResult.data) {
      console.log('✅ User data retrieved successfully!');
      console.log('👤 User Details:');
      console.log(`   • ID: ${userResult.data.id}`);
      console.log(`   • Username: ${userResult.data.username}`);
      console.log(`   • Email: ${userResult.data.email}`);
    } else {
      console.log('❌ Failed to get user data:', userResult.error);
      return;
    }

    // Test getting accessed organizations
    console.log('\n3️⃣ Testing getAccessedOrganizations endpoint...');
    const orgResult = await client.getAccessedOrganizations();
    
    if (orgResult.success && orgResult.data) {
      console.log('✅ Organizations data retrieved successfully!');
      console.log('🏢 Organizations Details:');
      console.log(`   • Total organizations: ${orgResult.data.length}`);
      
      if (orgResult.data.length > 0) {
        orgResult.data.forEach((org, index) => {
          console.log(`   • Organization ${index + 1}:`);
          console.log(`     - ID: ${org.id}`);
          console.log(`     - Name: ${org.name}`);
          console.log(`     - Visibility: ${org.organizationVisibility}`);
        });
      }
    } else {
      console.log('❌ Failed to get organizations data:', orgResult.error);
      console.log('ℹ️ This might be expected if you have no accessible organizations or need different permissions.');
    }

    console.log('\n🎉 All tests completed! Your XAPIHub MCP extension is ready to use.');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run the test
testConnection().catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
