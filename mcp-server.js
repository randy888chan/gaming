#!/usr/bin/env node
/**
 * Universal Stigmergy MCP Server Template
 * 
 * This server can be copied to any project directory to enable Roo Code integration
 * with Stigmergy. It automatically detects and connects to the appropriate Stigmergy instance.
 */

import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-detect Stigmergy configuration
const PROJECT_ROOT = process.cwd();
const PROJECT_NAME = path.basename(PROJECT_ROOT);

// Intelligent port detection (projects use 3011, main Stigmergy uses 3010)
const STIGMERGY_PORT = PROJECT_ROOT.includes('Stigmergy') ? 3010 : 3011;
const STIGMERGY_API_URL = `http://localhost:${STIGMERGY_PORT}`;

console.error(`🔗 Stigmergy MCP Server for ${PROJECT_NAME}`);
console.error(`📍 Project: ${PROJECT_ROOT}`);
console.error(`🌐 Stigmergy API: ${STIGMERGY_API_URL}`);

async function stigmergyRequest(endpoint, data = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: STIGMERGY_PORT,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          // If JSON parsing fails, return raw response
          resolve({ 
            success: false, 
            raw_response: responseData,
            error: 'Could not parse JSON response from Stigmergy',
            endpoint: endpoint,
            port: STIGMERGY_PORT
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Stigmergy API connection failed (${STIGMERGY_API_URL}): ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

const server = {
  name: "stigmergy-universal",
  version: "1.0.0",
  
  async listTools() {
    return [
      {
        name: "stigmergy_coordinate",
        description: "Send coordination requests to Stigmergy system for project analysis and enhancement",
        inputSchema: {
          type: "object",
          properties: {
            command: { 
              type: "string", 
              description: "Natural language command for Stigmergy (e.g., 'analyze project structure', 'enrich documentation', 'coordinate development tasks')" 
            },
            context: { 
              type: "string", 
              description: "Additional context about the request" 
            },
            priority: {
              type: "string",
              description: "Request priority",
              enum: ["low", "normal", "high", "urgent"],
              default: "normal"
            }
          },
          required: ["command"]
        }
      },
      {
        name: "stigmergy_status",
        description: "Check Stigmergy system status and configuration",
        inputSchema: {
          type: "object",
          properties: {
            check_type: { 
              type: "string", 
              description: "Type of status check",
              enum: ["health", "agents", "config", "connectivity"]
            }
          }
        }
      },
      {
        name: "stigmergy_project_setup",
        description: "Set up Stigmergy integration for current project",
        inputSchema: {
          type: "object",
          properties: {
            project_type: {
              type: "string",
              description: "Type of project (auto-detected if not specified)"
            }
          }
        }
      }
    ];
  },

  async callTool(name, args) {
    try {
      switch (name) {
        case "stigmergy_coordinate":
          try {
            const response = await stigmergyRequest('/api/chat', {
              agentId: 'system',
              prompt: `🤝 COORDINATION REQUEST FROM ROO CODE MCP

Project: ${PROJECT_NAME}
Command: ${args.command}
Context: ${args.context || 'No additional context provided'}
Priority: ${args.priority || 'normal'}
Source: Roo Code IDE via Universal MCP Server
Project Path: ${PROJECT_ROOT}
Timestamp: ${new Date().toISOString()}

Please coordinate with appropriate Stigmergy agents to handle this request. This is a universal MCP request that should work seamlessly regardless of the project type or location.`,
              metadata: {
                source: 'roo_code_universal_mcp',
                working_directory: PROJECT_ROOT,
                project_name: PROJECT_NAME,
                request_type: 'coordination',
                priority: args.priority || 'normal'
              }
            });
            
            return {
              success: true,
              message: `Command sent to Stigmergy system agent (${PROJECT_NAME})`,
              stigmergy_response: response,
              api_endpoint: STIGMERGY_API_URL,
              project_context: {
                name: PROJECT_NAME,
                path: PROJECT_ROOT,
                port: STIGMERGY_PORT
              }
            };
          } catch (error) {
            return {
              success: false,
              error: `Failed to communicate with Stigmergy: ${error.message}`,
              troubleshooting: {
                check_stigmergy_running: `curl ${STIGMERGY_API_URL}`,
                expected_port: STIGMERGY_PORT,
                project_path: PROJECT_ROOT,
                suggestion: "Ensure Stigmergy is running. Try: npm run stigmergy:start"
              }
            };
          }
        
        case "stigmergy_status":
          try {
            const response = await stigmergyRequest('/', {});
            return {
              success: true,
              status: "Stigmergy API accessible",
              endpoint: STIGMERGY_API_URL,
              check_type: args.check_type || 'health',
              project_info: {
                name: PROJECT_NAME,
                path: PROJECT_ROOT,
                port: STIGMERGY_PORT
              },
              response: response
            };
          } catch (error) {
            return {
              success: false,
              status: "Stigmergy API not accessible",
              error: error.message,
              endpoint: STIGMERGY_API_URL,
              project_info: {
                name: PROJECT_NAME,
                path: PROJECT_ROOT,
                port: STIGMERGY_PORT
              },
              troubleshooting: {
                start_command: `cd ${PROJECT_ROOT} && npm run stigmergy:start`,
                check_port: `lsof -i :${STIGMERGY_PORT}`,
                verify_connection: `curl ${STIGMERGY_API_URL}`
              }
            };
          }
        
        case "stigmergy_project_setup":
          return {
            success: true,
            message: "Universal MCP server is ready for this project",
            setup_info: {
              project_name: PROJECT_NAME,
              project_path: PROJECT_ROOT,
              stigmergy_port: STIGMERGY_PORT,
              mcp_server_path: __filename,
              ready: true
            },
            next_steps: [
              "Start Stigmergy with: npm run stigmergy:start",
              "Use stigmergy_coordinate tool for project coordination",
              "All coordination requests will be automatically routed to the correct Stigmergy instance"
            ]
          };
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: name,
        args: args,
        project_context: {
          name: PROJECT_NAME,
          path: PROJECT_ROOT
        }
      };
    }
  }
};

// MCP Protocol Handler
process.stdin.on('data', async (data) => {
  try {
    const message = JSON.parse(data.toString());
    let response;

    switch (message.method) {
      case 'initialize':
        response = {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { 
              name: server.name, 
              version: server.version,
              description: `Universal Stigmergy coordination server for ${PROJECT_NAME}`
            }
          }
        };
        break;

      case 'tools/list':
        response = {
          jsonrpc: "2.0",
          id: message.id,
          result: { tools: await server.listTools() }
        };
        break;

      case 'tools/call':
        const result = await server.callTool(
          message.params.name, 
          message.params.arguments || {}
        );
        response = {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          }
        };
        break;

      default:
        response = {
          jsonrpc: "2.0",
          id: message.id,
          error: {
            code: -32601,
            message: "Method not found"
          }
        };
    }

    process.stdout.write(JSON.stringify(response) + '\n');
  } catch (error) {
    const errorResponse = {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32603,
        message: "Internal error",
        data: error.message
      }
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
});

console.error(`✅ Universal Stigmergy MCP Server started for ${PROJECT_NAME}`);