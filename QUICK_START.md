# 🚀 XAPIHub MCP Extension - Quick Start

## What You Have

A complete Cursor MCP extension that integrates with XAPIHub API, built in TypeScript with the following features:

- ✅ **MCP Server**: Full TypeScript implementation using the official MCP SDK
- ✅ **XAPIHub Integration**: Direct API connection with authentication
- ✅ **User Management**: Get current user details from XAPIHub
- ✅ **Connection Testing**: Built-in diagnostics and health checks
- ✅ **Cursor Integration**: Ready to install in Cursor IDE

## 📁 Project Structure

```
xapihub-mcp-extension/
├── src/
│   ├── types/xapihub.ts           # TypeScript definitions
│   ├── services/xapihub-client.ts # API client implementation
│   ├── server.ts                  # MCP server logic
│   ├── index.ts                   # Main entry point
│   └── test/test-connection.ts    # Connection test script
├── dist/                          # Compiled JavaScript (auto-generated)
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── mcp-manifest.json              # MCP extension manifest
├── cursor-mcp-config.json         # Cursor MCP configuration
├── setup.js                       # Interactive setup script
└── README.md                      # Full documentation
```

## 🔧 Installation & Setup

### 1. Quick Setup (Recommended)
```bash
# Run the interactive setup
npm run setup
```

### 2. Manual Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env with your credentials
# XAPIHUB_BASE_URL=https://api-dev.xapihub.io
# XAPIHUB_TOKEN=your_bearer_token_here

# Build the project
npm run build
```

### 3. Test Connection
```bash
# Test your XAPIHub connection
npm run test-connection
```

## 🔌 Cursor Integration

### Option 1: Manual MCP Configuration

Add this to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "xapihub": {
      "command": "node",
      "args": ["C:/full/path/to/your/dist/index.js"],
      "env": {
        "XAPIHUB_BASE_URL": "https://api-dev.xapihub.io",
        "XAPIHUB_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

### Option 2: Use Generated Config

1. After running `npm run setup`, copy the contents of `cursor-mcp-config.json`
2. Add it to your Cursor MCP configuration
3. Restart Cursor

## 🎯 Usage in Cursor

Once configured, you can use these tools in Cursor:

### Available Tools:
- **`get_current_user`**: Get your XAPIHub user details
- **`test_xapihub_connection`**: Test API connectivity

### How to Use:

1. **Chat Interface**:
   ```
   "Get my XAPIHub user details"
   "Test my XAPIHub connection"
   "What's my organization info from XAPIHub?"
   ```

2. **Command Palette** (`Ctrl+Shift+P`):
   - Search for "XAPIHub"
   - Select available commands

3. **Direct Tool Calls**:
   - Tools are automatically available in Cursor's context
   - AI can use them to answer your questions about XAPIHub

## 🧪 Testing

### Test Your Setup:
```bash
# Test API connection
npm run test-connection

# Start MCP server manually (for debugging)
npm start
```

### Expected Output:
```
🔍 Testing XAPIHub API Connection...
📡 Base URL: https://api-dev.xapihub.io
🔑 Token: eyJhbGciOiJSUzI1NiI...

1️⃣ Testing basic connection...
✅ Connection successful!

2️⃣ Testing getCurrentUser endpoint...
✅ User data retrieved successfully!
👤 User Details:
   • Username: your_username
   • Email: your_email@example.com
   • Organization: your_org_id
   ...

🎉 All tests passed! Your XAPIHub MCP extension is ready to use.
```

## 🛠️ Development

### Available Scripts:
```bash
npm run build         # Compile TypeScript
npm run dev          # Watch mode for development
npm run start        # Start MCP server
npm run test-connection # Test XAPIHub API
npm run setup        # Interactive configuration
npm run clean        # Clean build directory
```

### Adding New Features:

1. **Add New API Endpoints**: Extend `XAPIHubClient` in `src/services/xapihub-client.ts`
2. **Add New Tools**: Add to `src/server.ts` in the tools list and handlers
3. **Update Types**: Modify `src/types/xapihub.ts` for new data structures

## 🐛 Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check your `XAPIHUB_TOKEN` is valid and not expired
   - Verify token format (should be a long JWT string)

2. **"Connection refused"**
   - Verify `XAPIHUB_BASE_URL` is correct
   - Check network connectivity

3. **"MCP server not found in Cursor"**
   - Ensure you've restarted Cursor after adding MCP configuration
   - Check the file path in your MCP config is absolute and correct

4. **"Module not found" errors**
   - Run `npm install` to ensure all dependencies are installed
   - Run `npm run build` to compile TypeScript

### Debug Mode:
```bash
# Set debug environment and start server
DEBUG=* npm start
```

## 🎉 Success! 

Your XAPIHub MCP extension is now ready! You can:

- ✅ Connect to XAPIHub API from Cursor
- ✅ Get user details and organization info
- ✅ Test connections and diagnose issues
- ✅ Extend with more XAPIHub endpoints as needed

## 📚 Next Steps

1. **Test in Cursor**: Try asking "What are my XAPIHub user details?"
2. **Add More Tools**: Extend the client with additional XAPIHub endpoints
3. **Share with Team**: Package and distribute to other developers
4. **Contribute**: Submit improvements back to the project

---

**Need Help?** Check the full `README.md` for detailed documentation, or create an issue in the repository.
