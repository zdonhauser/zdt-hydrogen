# MCP Server Setup Instructions

## Microsoft Playwright MCP Server

The Microsoft Playwright MCP server has been installed globally and is ready to use with Claude Desktop.

### Claude Desktop Configuration

Add this configuration to your Claude Desktop settings (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp"]
    }
  }
}
```

### What This Enables

With the Playwright MCP server connected, you can:

1. **Natural Language Testing**: Describe test scenarios in plain English
   - "Test the party booking form with invalid dates"
   - "Navigate to the checkout and verify all form fields work"

2. **Intelligent Browser Automation**: 
   - Uses accessibility tree instead of screenshots
   - More reliable and deterministic than visual-based testing
   - Works with screen readers and other assistive technologies

3. **Test Generation**:
   - Generate Playwright tests by describing user flows
   - Create comprehensive e2e test suites through conversation
   - Automatically handle complex scenarios like form validation

4. **Debugging Support**:
   - Step through tests interactively
   - Get detailed feedback on failures
   - Understand why tests are failing

### Security Note

This is the **official Microsoft Playwright MCP server** - it's been verified as trustworthy and secure. Avoid using third-party MCP servers for testing until the ecosystem matures.

### Usage Examples

Once configured, you can ask Claude to:
- "Create an e2e test for the party booking flow"
- "Test that the shopping cart works correctly" 
- "Verify all forms have proper validation"
- "Check that the mobile navigation works"

The MCP server will translate these requests into actual Playwright test code and can even run the tests for you.