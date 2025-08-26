# XAPIHub MCP Extension for Cursor

A Model Context Protocol (MCP) extension that integrates XAPIHub API with Cursor IDE, allowing developers to interact with XAPIHub services directly from their development environment.

## Features

- 🔐 **User Authentication**: Get current user details from XAPIHub
- 🔗 **API Integration**: Direct connection to XAPIHub API endpoints
- ⚡ **Real-time Data**: Fetch live data from your XAPIHub organization
- 🛠️ **Developer Tools**: Built-in connection testing and diagnostics

## Installation

### Prerequisites

- Node.js 18+ 
- Cursor IDE with MCP support
- XAPIHub account and API token

### Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo-url>
   cd xapihub-mcp-extension
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your XAPIHub credentials:
   ```env
   XAPIHUB_BASE_URL=https://api-dev.xapihub.io
   XAPIHUB_TOKEN=your_bearer_token_here
   ```

3. **Build the Extension**
   ```bash
   npm run build
   ```

4. **Install in Cursor**
   - Open Cursor IDE
   - Go to Extensions > Install from VSIX
   - Select the built extension package
   - Or configure MCP server manually (see below)

## Manual MCP Server Configuration

If you prefer to run the MCP server directly, add this to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "xapihub": {
      "command": "node",
      "args": ["path/to/your/dist/index.js"],
      "env": {
        "XAPIHUB_BASE_URL": "https://api-dev.xapihub.io",
        "XAPIHUB_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

## Available Tools

### `get_current_user`
Retrieves current user details from XAPIHub API.

**Example Response:**
```json
{
  "success": true,
  "message": "Current user details retrieved successfully",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "fullName": "John Doe",
    "organization": "org_id",
    "organizationType": "PREMIUM",
    "userType": "ORGANIZATION_OWNER",
    "userOrganizationAssociation": "OWNER",
    "organizationVisibility": "PUBLIC",
    "emailVerified": true,
    "readOnlyOrganization": false,
    "projectCount": 5,
    "userScopes": ""
  }
}
```

### `test_xapihub_connection`
Tests connectivity to XAPIHub API.

**Example Response:**
```json
{
  "success": true,
  "connected": true,
  "message": "Successfully connected to XAPIHub API"
}
```

## Usage in Cursor

Once installed, you can use the XAPIHub tools in several ways:

1. **Command Palette**: 
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "XAPIHub" to see available commands

2. **MCP Tools**:
   - Use the tools directly in your code context
   - Ask Cursor to "Get my XAPIHub user details"
   - Request "Test XAPIHub connection"

3. **Chat Integration**:
   - Ask Cursor: "What are my XAPIHub user details?"
   - Request: "Check if I'm connected to XAPIHub"

## Development

### Project Structure
```
src/
├── types/
│   └── xapihub.ts          # TypeScript type definitions
├── services/
│   └── xapihub-client.ts   # XAPIHub API client
├── server.ts               # MCP server implementation
└── index.ts                # Main entry point
```

### Scripts
- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm run start` - Start the MCP server
- `npm test` - Run tests (when implemented)

### Adding New Tools

1. Define the tool in `src/server.ts`:
   ```typescript
   {
     name: 'your_tool_name',
     description: 'Tool description',
     inputSchema: {
       type: 'object',
       properties: {
         // Define input parameters
       },
       required: [],
     },
   }
   ```

2. Implement the handler:
   ```typescript
   case 'your_tool_name':
     return await this.handleYourTool(args);
   ```

3. Add the implementation method:
   ```typescript
   private async handleYourTool(args: any) {
     // Implementation
   }
   ```

## API Reference

The extension uses the XAPIHub REST API. Current endpoint:

- `GET /platform/1.0.0/users/current-user` - Get current user details

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Verify your `XAPIHUB_TOKEN` is correct and not expired
   - Check that the token has proper permissions

2. **Connection Failed**
   - Ensure `XAPIHUB_BASE_URL` is correct
   - Check network connectivity
   - Verify API endpoint is accessible

3. **MCP Server Not Starting**
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed
   - Check console for error messages

### Debug Mode

To enable debug logging, set environment variable:
```bash
DEBUG=xapihub:* npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- GitHub Issues: [Create an issue](https://github.com/xapihub/cursor-mcp-extension/issues)
- Documentation: [XAPIHub Docs](https://docs.xapihub.io)
- Email: support@xapihub.io
