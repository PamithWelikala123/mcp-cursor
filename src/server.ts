import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { XAPIHubClient } from './services/xapihub-client.js';
import { XAPIHubConfig } from './types/xapihub.js';

/**
 * XAPIHub MCP Server
 * Provides tools for interacting with XAPIHub API through Cursor
 */
export class XAPIHubMCPServer {
  private server: Server;
  private xapiClient: XAPIHubClient;

  constructor(config: XAPIHubConfig) {
    this.server = new Server(
      {
        name: 'xapihub-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.xapiClient = new XAPIHubClient(config);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_current_user',
            description: 'Get current user details from XAPIHub API',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'test_xapihub_connection',
            description: 'Test connection to XAPIHub API',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'get_accessed_organizations',
            description: 'Get recent accessed organizations from XAPIHub API',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_current_user':
            return await this.handleGetCurrentUser();

          case 'test_xapihub_connection':
            return await this.handleTestConnection();

          case 'get_accessed_organizations':
            return await this.handleGetAccessedOrganizations();

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${errorMessage}`
        );
      }
    });
  }

  private async handleGetCurrentUser() {
    const result = await this.xapiClient.getCurrentUser();
    
    if (result.success && result.data) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Current user details retrieved successfully',
              user: {
                id: result.data.id,
                username: result.data.username,
                email: result.data.email,
                createdOn: result.data.createdOn,
                modifiedOn: result.data.modifiedOn
              }
            }, null, 2)
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: result.error || 'Failed to retrieve user details',
              message: result.message
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleTestConnection() {
    const result = await this.xapiClient.testConnection();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: result.success,
            connected: result.data,
            message: result.message,
            error: result.error
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetAccessedOrganizations() {
    const result = await this.xapiClient.getAccessedOrganizations();
    
    if (result.success && result.data) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Accessed organizations retrieved successfully',
              organizations: result.data.map(org => ({
                id: org.id,
                name: org.name,
                description: org.description,
                organizationVisibility: org.organizationVisibility,
                createdOn: org.createdOn,
                modifiedOn: org.modifiedOn
              })),
              count: result.data.length
            }, null, 2)
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: result.error || 'Failed to retrieve accessed organizations',
              message: result.message
            }, null, 2)
          }
        ]
      };
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('XAPIHub MCP server running on stdio');
  }
}
