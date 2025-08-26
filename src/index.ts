#!/usr/bin/env node

import { config } from 'dotenv';
import { XAPIHubMCPServer } from './server.js';
import { XAPIHubConfig } from './types/xapihub.js';

// Load environment variables
config();

/**
 * Main entry point for the XAPIHub MCP Server
 */
async function main() {
  // Validate required environment variables
  const baseUrl = process.env.XAPIHUB_BASE_URL;
  const token = process.env.XAPIHUB_TOKEN;

  if (!baseUrl) {
    console.error('Error: XAPIHUB_BASE_URL environment variable is required');
    process.exit(1);
  }

  if (!token) {
    console.error('Error: XAPIHUB_TOKEN environment variable is required');
    process.exit(1);
  }

  // Create server configuration
  const xapiConfig: XAPIHubConfig = {
    baseUrl,
    token,
  };

  try {
    // Initialize and start the MCP server
    const server = new XAPIHubMCPServer(xapiConfig);
    await server.run();
  } catch (error) {
    console.error('Failed to start XAPIHub MCP server:', error);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
