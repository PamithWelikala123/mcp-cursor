import { XAPIHubClient } from '../services/xapihub-client.js';
import { XAPIHubConfig } from '../types/xapihub.js';

/**
 * Test script for the getCatalogues functionality
 */
async function testGetCatalogues() {
  // Load configuration from environment
  const config: XAPIHubConfig = {
    baseUrl: process.env.XAPIHUB_BASE_URL || 'https://api-dev.xapihub.io',
    token: process.env.XAPIHUB_TOKEN || ''
  };

  if (!config.token) {
    console.error('XAPIHUB_TOKEN environment variable is required');
    process.exit(1);
  }

  const client = new XAPIHubClient(config);

  // Test data from the curl request provided
  const organizationId = '66b8efd5fdb72f0460114474';
  const projectId = '66b8f07d81c92f24067fb0d6';

  console.log('Testing getCatalogues functionality...');
  console.log(`Organization ID: ${organizationId}`);
  console.log(`Project ID: ${projectId}`);
  console.log('---');

  try {
    const result = await client.getCatalogues(organizationId, projectId);
    
    if (result.success) {
      console.log('✅ SUCCESS: Catalogues retrieved successfully');
      console.log(`Found ${result.data?.length || 0} catalogues`);
      
      if (result.data && result.data.length > 0) {
        console.log('\nCatalogues:');
        result.data.forEach((catalogue, index) => {
          console.log(`${index + 1}. ${catalogue.name} (ID: ${catalogue.id})`);
          if (catalogue.description) {
            console.log(`   Description: ${catalogue.description}`);
          }
          if (catalogue.version) {
            console.log(`   Version: ${catalogue.version}`);
          }
          if (catalogue.status) {
            console.log(`   Status: ${catalogue.status}`);
          }
        });
      }
    } else {
      console.log('❌ FAILED: Could not retrieve catalogues');
      console.log(`Error: ${result.error}`);
      console.log(`Message: ${result.message}`);
    }
  } catch (error) {
    console.error('❌ EXCEPTION:', error);
  }
}

// Run the test
testGetCatalogues().catch(console.error);
