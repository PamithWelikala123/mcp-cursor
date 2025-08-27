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
          {
            name: 'get_recent_accessed_projects',
            description: 'Get recent accessed projects for a specific organization from XAPIHub API',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The organization ID to get projects for',
                },
              },
              required: ['organizationId'],
            },
          },
          {
            name: 'search_projects',
            description: 'Search for projects in an organization with comprehensive filtering and pagination options',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The organization ID to search projects in',
                },
                searchString: {
                  type: 'string',
                  description: 'Search string to filter projects by name or description (optional)',
                },
                isAssign: {
                  type: 'boolean',
                  description: 'Whether to include assigned projects (default: true)',
                },
                page: {
                  type: 'number',
                  description: 'Page number for pagination (default: 0)',
                },
                size: {
                  type: 'number',
                  description: 'Number of results per page (default: 12)',
                },
                isDefault: {
                  type: 'boolean',
                  description: 'Whether to include default projects (default: false)',
                },
                sort: {
                  type: 'string',
                  description: 'Sort criteria (default: "name,asc")',
                },
              },
              required: ['organizationId'],
            },
          },
          {
            name: 'get_catalogues',
            description: 'Get catalogues for a specific organization and project from XAPIHub API',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The organization ID',
                },
                projectId: {
                  type: 'string',
                  description: 'The project ID to get catalogues for',
                },
              },
              required: ['organizationId', 'projectId'],
            },
          },
          {
            name: 'get_api_details',
            description: 'Get API details for a specific catalogue collection using filter endpoint from XAPIHub API',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The organization ID',
                },
                projectId: {
                  type: 'string',
                  description: 'The project ID',
                },
                catalogueId: {
                  type: 'string',
                  description: 'The catalogue ID',
                },
                collectionId: {
                  type: 'string',
                  description: 'The collection ID (rootCollectionId from catalogue)',
                },
                creators: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of creator IDs to filter by (optional)',
                },
                collections: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of collection IDs to filter by (optional)',
                },
                projects: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of project IDs to filter by (optional)',
                },
                page: {
                  type: 'number',
                  description: 'Page number for pagination (default: 0)',
                },
                size: {
                  type: 'number',
                  description: 'Number of results per page (default: 8)',
                },
              },
              required: ['organizationId', 'projectId', 'catalogueId', 'collectionId'],
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

          case 'get_recent_accessed_projects':
            return await this.handleGetRecentAccessedProjects(args);

          case 'search_projects':
            return await this.handleSearchProjects(args);

          case 'get_catalogues':
            return await this.handleGetCatalogues(args);

          case 'get_api_details':
            return await this.handleGetApiDetails(args);

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

  private async handleGetRecentAccessedProjects(args: any) {
    if (!args || !args.organizationId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'organizationId parameter is required'
      );
    }

    const result = await this.xapiClient.getRecentAccessedProjects(args.organizationId);
    
    if (result.success && result.data) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Recent accessed projects retrieved successfully',
              organizationId: args.organizationId,
              projects: result.data.map(project => ({
                id: project.id,
                name: project.name,
                description: project.description,
                enableKanbanBoard: project.enableKanbanBoard
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
              error: result.error || 'Failed to retrieve recent accessed projects',
              message: result.message,
              organizationId: args.organizationId
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleSearchProjects(args: any) {
    if (!args || !args.organizationId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'organizationId parameter is required'
      );
    }

    const searchParams = {
      organizationId: args.organizationId,
      searchString: args.searchString || "",
      isAssign: args.isAssign !== undefined ? args.isAssign : true,
      page: args.page !== undefined ? args.page : 0,
      size: args.size !== undefined ? args.size : 12,
      isDefault: args.isDefault !== undefined ? args.isDefault : false,
      sort: args.sort || "name,asc"
    };

    const result = await this.xapiClient.searchProjects(searchParams);
    
    if (result.success && result.data) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Project search completed successfully',
              searchParams: searchParams,
              pagination: {
                totalElements: result.data.totalElements,
                totalPages: result.data.totalPages,
                size: result.data.size,
                number: result.data.number,
                first: result.data.first,
                last: result.data.last
              },
              projects: result.data.content.map(project => ({
                id: project.id,
                name: project.name,
                description: project.description,
                enableKanbanBoard: project.enableKanbanBoard
              })),
              count: result.data.content.length
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
              error: result.error || 'Failed to search projects',
              message: result.message,
              searchParams: searchParams
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGetCatalogues(args: any) {
    if (!args || !args.organizationId || !args.projectId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Both organizationId and projectId parameters are required'
      );
    }

    const result = await this.xapiClient.getCatalogues(args.organizationId, args.projectId);
    
    if (result.success && result.data) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Catalogues retrieved successfully',
              organizationId: args.organizationId,
              projectId: args.projectId,
              catalogues: result.data.map(catalogue => ({
                id: catalogue.id,
                name: catalogue.name,
                description: catalogue.description,
                version: catalogue.version,
                status: catalogue.status,
                createdOn: catalogue.createdOn,
                modifiedOn: catalogue.modifiedOn,
                rootCollectionId: catalogue.rootCollectionId
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
              error: result.error || 'Failed to retrieve catalogues',
              message: result.message,
              organizationId: args.organizationId,
              projectId: args.projectId
            }, null, 2)
          }
        ]
      };
    }
  }

  private async handleGetApiDetails(args: any) {
    if (!args || !args.organizationId || !args.projectId || !args.catalogueId || !args.collectionId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'organizationId, projectId, catalogueId, and collectionId parameters are required'
      );
    }

    const apiFilterParams = {
      organizationId: args.organizationId,
      projectId: args.projectId,
      catalogueId: args.catalogueId,
      collectionId: args.collectionId,
      creators: args.creators || [],
      collections: args.collections || [],
      projects: args.projects || [],
      page: args.page !== undefined ? args.page : 0,
      size: args.size !== undefined ? args.size : 8
    };

    const result = await this.xapiClient.getApiDetails(apiFilterParams);
    
    if (result.success && result.data) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'API details retrieved successfully',
              filterParams: apiFilterParams,
              pagination: {
                totalElements: result.data.totalElements,
                totalPages: result.data.totalPages,
                size: result.data.size,
                number: result.data.number,
                first: result.data.first,
                last: result.data.last
              },
              apis: result.data.content.map(api => ({
                id: api.id,
                name: api.name,
                description: api.description,
                version: api.version,
                status: api.status
              })),
              count: result.data.content.length
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
              error: result.error || 'Failed to retrieve API details',
              message: result.message,
              filterParams: apiFilterParams
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
