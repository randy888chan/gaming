import { ingestDocuments } from "../../src/services/documentIngestion";
import fs from "fs/promises";
import path from "path";
import { validate } from "jsonschema";
import yaml from "js-yaml";

// Mock fs, jsonschema, yaml, and use_mcp_tool to control test environment
jest.mock("fs/promises");
jest.mock("jsonschema", () => ({
  validate: jest.fn(),
}));
jest.mock("js-yaml", () => ({
  load: jest.fn(),
}));

// Mock use_mcp_tool directly on the global object
// This is necessary because use_mcp_tool is provided by the MCP environment, not an importable module.
declare const use_mcp_tool: jest.Mock;
Object.defineProperty(global, "use_mcp_tool", { value: jest.fn() });

describe("Document Ingestion Workflow", () => {
  const mockProjectDocsDir = path.join(process.cwd(), "project_docs");

  // Mock the document schema content
  const mockDocumentSchemaContent = JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Document Metadata Schema",
    "description": "Schema for validating document metadata and content structure.",
    "type": "object",
    "required": [
      "title",
      "creationDate",
      "author",
      "documentType",
      "version",
      "owner",
      "content"
    ],
    "properties": {
      "title": {
        "type": "string",
        "description": "The title of the document."
      },
      "creationDate": {
        "type": "string",
        "format": "date",
        "description": "The date the document was created (YYYY-MM-DD)."
      },
      "author": {
        "type": "string",
        "description": "The author of the document."
      },
      "documentType": {
        "type": "string",
        "enum": [
          "API",
          "PRD",
          "Architecture",
          "UserStory",
          "TestPlan",
          "Other"
        ],
        "description": "The type of document."
      },
      "version": {
        "type": "string",
        "description": "The version of the document (e.0.0')."
      },
      "owner": {
        "type": "string",
        "description": "The owner or responsible party for the document."
      },
      "content": {
        "type": "object",
        "required": [
          "sections"
        ],
        "properties": {
          "sections": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "title",
                "body"
              ],
              "properties": {
                "title": {
                  "type": "string",
                  "description": "The title of the section."
                },
                "body": {
                  "type": "string",
                  "description": "The content of the section in markdown format."
                }
              }
            }
          }
        }
      },
      "dependencies": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "A list of other documents this document depends on."
      },
      "compliance": {
        "type": "object",
        "properties": {
          "corePrinciples": {
            "type": "boolean",
            "description": "Indicates adherence to core principles."
          },
          "securityStandards": {
            "type": "boolean",
            "description": "Indicates adherence to security standards."
          }
        },
        "required": [
          "corePrinciples"
        ]
      }
    },
    "additionalProperties": true
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (validate as jest.Mock).mockReturnValue({ valid: true });
    (yaml.load as jest.Mock).mockImplementation((content) => {
      if (content.includes("title: My YAML Document")) {
        return {
          title: "My YAML Document",
          author: "Jane Doe",
          version: "2.0.0",
          dependencies: ["dep1", "dep2"],
        };
      }
      if (content.includes("title: Doc1") && content.includes("dependencies: [TrulyNonExistentDoc]")) {
        return {
          title: "Doc1",
          dependencies: ["TrulyNonExistentDoc"],
        };
      }
      if (content.includes("title: Doc1") && content.includes("dependencies: [Doc2]")) {
        return {
          title: "Doc1",
          dependencies: ["Doc2"],
        };
      }
      if (content.includes("title: Doc2")) {
        return {
          title: "Doc2",
          dependencies: [],
        };
      }
      if (content.includes("title: Invalid Doc")) {
        return { title: "Invalid Doc" };
      }
      return {};
    });
    (use_mcp_tool as jest.Mock).mockResolvedValue({ findings: [] }); // No security findings by default

    // Mock fs.readFile to return the schema content when requested
    (fs.readFile as jest.Mock).mockImplementation((filePath, encoding) => {
      const absoluteSchemaPath = path.join(process.cwd(), "docs", "architecture", "document-schema.json");
      if (filePath === absoluteSchemaPath) {
        return Promise.resolve(mockDocumentSchemaContent);
      }
      // Default behavior for other files
      return Promise.resolve("# Test Document");
    });
  });

  test("should scan for markdown files in project_docs/", async () => {
    (fs.readdir as jest.Mock).mockResolvedValue([
      "doc1.md",
      "image.png",
      "doc2.md",
    ]);
    // fs.readFile is already mocked in beforeEach for general case

    await ingestDocuments();

    expect(fs.readdir).toHaveBeenCalledWith(mockProjectDocsDir);
    expect(fs.readFile).toHaveBeenCalledWith(
      path.join(mockProjectDocsDir, "doc1.md"),
      "utf-8"
    );
    expect(fs.readFile).toHaveBeenCalledWith(
      path.join(mockProjectDocsDir, "doc2.md"),
      "utf-8"
    );
  });

  test("should extract metadata and content from markdown files with YAML front matter", async () => {
    const mockMarkdownContent = `---
title: My YAML Document
author: Jane Doe
version: 2.0.0
dependencies: [dep1, dep2]
---
# My YAML Document

This is the body.`;
    (fs.readdir as jest.Mock).mockResolvedValue(["test-yaml-doc.md"]);
    (fs.readFile as jest.Mock).mockImplementation((filePath, encoding) => {
      const absoluteSchemaPath = path.join(process.cwd(), "docs", "architecture", "document-schema.json");
      if (filePath === absoluteSchemaPath) {
        return Promise.resolve(mockDocumentSchemaContent);
      }
      if (filePath.includes("test-yaml-doc.md")) {
        return Promise.resolve(mockMarkdownContent);
      }
      return Promise.resolve("");
    });

    await ingestDocuments();

    const expectedDocument = expect.objectContaining({
      title: "My YAML Document",
      author: "Jane Doe",
      version: "2.0.0",
      dependencies: ["dep1", "dep2"],
      creationDate: expect.any(String),
      documentType: "API",
      owner: "bmad-master",
      compliance: { corePrinciples: true, securityStandards: true },
      content: {
        sections: [
          {
            title: "Main Content",
            body: "# My YAML Document\n\nThis is the body.",
          },
        ],
      },
    });
    expect(validate).toHaveBeenCalledWith(expectedDocument, JSON.parse(mockDocumentSchemaContent));
  });

  test("should extract metadata and content from markdown files without YAML front matter", async () => {
    const mockMarkdownContent = `# My Document\n\nThis is the body.`;
    (fs.readdir as jest.Mock).mockResolvedValue(["test-doc.md"]);
    (fs.readFile as jest.Mock).mockImplementation((filePath, encoding) => {
      const absoluteSchemaPath = path.join(process.cwd(), "docs", "architecture", "document-schema.json");
      if (filePath === absoluteSchemaPath) {
        return Promise.resolve(mockDocumentSchemaContent);
      }
      if (filePath.includes("test-doc.md")) {
        return Promise.resolve(mockMarkdownContent);
      }
      return Promise.resolve("");
    });

    await ingestDocuments();

    const expectedDocument = expect.objectContaining({
      title: "My Document",
      documentType: "API",
      version: "1.0.0",
      owner: "bmad-master",
      author: "System",
      creationDate: expect.any(String),
      compliance: { corePrinciples: true, securityStandards: true },
      content: {
        sections: [{ title: "Main Content", body: mockMarkdownContent }],
      },
    });
    expect(validate).toHaveBeenCalledWith(expectedDocument, JSON.parse(mockDocumentSchemaContent));
  });

  test("should validate document against schema", async () => {
    (fs.readdir as jest.Mock).mockResolvedValue(["valid-doc.md"]);
    (fs.readFile as jest.Mock).mockImplementation((filePath, encoding) => {
      const absoluteSchemaPath = path.join(process.cwd(), "docs", "architecture", "document-schema.json");
      if (filePath === absoluteSchemaPath) {
        return Promise.resolve(mockDocumentSchemaContent);
      }
      if (filePath.includes("valid-doc.md")) {
        return Promise.resolve("# Valid Doc");
      }
      return Promise.resolve("");
    });

    await ingestDocuments();

    expect(validate).toHaveBeenCalled();
    expect((validate as jest.Mock).mock.results[0].value.valid).toBe(true);
  });

  test("should log validation errors for invalid documents", async () => {
    (fs.readdir as jest.Mock).mockResolvedValue(["invalid-doc.md"]);
    (fs.readFile as jest.Mock).mockImplementation((filePath, encoding) => {
      const absoluteSchemaPath = path.join(process.cwd(), "docs", "architecture", "document-schema.json");
      if (filePath === absoluteSchemaPath) {
        return Promise.resolve(mockDocumentSchemaContent);
      }
      if (filePath.includes("invalid-doc.md")) {
        return Promise.resolve("# Invalid Doc");
      }
      return Promise.resolve("");
    });
    (validate as jest.Mock).mockReturnValue({
      valid: false,
      errors: [{ message: "Error" }],
    });
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await ingestDocuments();

    expect(consoleSpy).toHaveBeenCalledWith("Document validation errors:", [
      { message: "Error" },
    ]);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed schema validation for document:")
    );
    consoleSpy.mockRestore();
  });

  test("should perform security checks using Semgrep", async () => {
    const mockMarkdownContent = `# Document with eval\n\nconsole.log(eval("1+1"));`;
    (fs.readdir as jest.Mock).mockResolvedValue(["secure-doc.md"]);
    (fs.readFile as jest.Mock).mockImplementation((filePath, encoding) => {
      const absoluteSchemaPath = path.join(process.cwd(), "docs", "architecture", "document-schema.json");
      if (filePath === absoluteSchemaPath) {
        return Promise.resolve(mockDocumentSchemaContent);
      }
      if (filePath.includes("secure-doc.md")) {
        return Promise.resolve(mockMarkdownContent);
      }
      return Promise.resolve("");
    });
    (global as any).use_mcp_tool.mockResolvedValue({
      findings: [{ ruleId: "detect-eval-usage" }],
    });

    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    await ingestDocuments();

    expect((global as any).use_mcp_tool).toHaveBeenCalledWith(
      "semgrep",
      "semgrep_scan_with_custom_rule",
      expect.any(Object)
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Security findings for"),
      expect.any(Array)
    );
    consoleWarnSpy.mockRestore();
    const validatedDocument = (validate as jest.Mock).mock.calls[0][0];
    expect(validatedDocument.compliance.securityStandards).toBe(false);
  });

  test("should pass security checks if no findings", async () => {
    const mockMarkdownContent = `# Secure Document\n\nconsole.log("safe code");`;
    (fs.readdir as jest.Mock).mockResolvedValue(["secure-doc.md"]);
    (fs.readFile as jest.Mock).mockImplementation((filePath, encoding) => {
      const absoluteSchemaPath = path.join(process.cwd(), "docs", "architecture", "document-schema.json");
      if (filePath === absoluteSchemaPath) {
        return Promise.resolve(mockDocumentSchemaContent);
      }
      if (filePath.includes("secure-doc.md")) {
        return Promise.resolve(mockMarkdownContent);
      }
      return Promise.resolve("");
    });
    (global as any).use_mcp_tool.mockResolvedValue({ findings: [] });

    await ingestDocuments();

    expect((global as any).use_mcp_tool).toHaveBeenCalledWith(
      "semgrep",
      "semgrep_scan_with_custom_rule",
      expect.any(Object)
    );
    const consoleWarnSpy = jest.spyOn(console, "warn");
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
    const validatedDocument = (validate as jest.Mock).mock.calls[0][0];
    expect(validatedDocument.compliance.securityStandards).toBe(true);
  });

  test("should resolve document dependencies", async () => {
    const doc1Content = `---
title: Doc1
dependencies: [Doc2]
---
# Doc1`;
    const doc2Content = `---
title: Doc2
---
# Doc2`;

    (fs.readdir as jest.Mock).mockResolvedValue(["doc1.md", "doc2.md"]);
    (fs.readFile as jest.Mock).mockImplementation((filePath) => {
      const absoluteSchemaPath = path.join(process.cwd(), "docs", "architecture", "document-schema.json");
      if (filePath === absoluteSchemaPath) {
        return Promise.resolve(mockDocumentSchemaContent);
      }
      if (filePath.includes("doc1.md")) return Promise.resolve(doc1Content);
      if (filePath.includes("doc2.md")) return Promise.resolve(doc2Content);
      return Promise.resolve("");
    });

    await ingestDocuments();

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Unresolved dependency")
    );
    consoleErrorSpy.mockRestore();
  });

  test("should fail if dependencies are unresolved", async () => {
    const doc1Content = `---
title: Doc1
dependencies: [TrulyNonExistentDoc]
---
# Doc1`;

    (fs.readdir as jest.Mock).mockResolvedValue(["doc1.md"]);
    (fs.readFile as jest.Mock).mockImplementation((filePath) => {
      const absoluteSchemaPath = path.join(process.cwd(), "docs", "architecture", "document-schema.json");
      if (filePath === absoluteSchemaPath) {
        return Promise.resolve(mockDocumentSchemaContent);
      }
      if (filePath.includes("doc1.md")) {
        return Promise.resolve(doc1Content);
      }
      return Promise.resolve("");
    });

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await ingestDocuments();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unresolved dependency for Doc1: TrulyNonExistentDoc")
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Updating system state to: DEPENDENCY_FAILED for document: Doc1"
    );
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test("should update system state to INGESTION_COMPLETE", async () => {
    (fs.readdir as jest.Mock).mockResolvedValue([]);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await ingestDocuments();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Updating system state to: INGESTION_COMPLETE"
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Document ingestion workflow completed."
    );
    consoleSpy.mockRestore();
  });

  test("should handle errors during file processing and update state", async () => {
    (fs.readdir as jest.Mock).mockResolvedValue(["error-doc.md"]);
    (fs.readFile as jest.Mock).mockImplementation((filePath) => {
      const absoluteSchemaPath = path.join(process.cwd(), "docs", "architecture", "document-schema.json");
      if (filePath === absoluteSchemaPath) {
        return Promise.resolve(mockDocumentSchemaContent);
      }
      if (filePath.includes("error-doc.md")) {
        return Promise.reject(new Error("File read error"));
      }
      return Promise.resolve("");
    });
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await ingestDocuments();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error extracting metadata from file:"),
      expect.any(Error)
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Updating system state to: INGESTION_FAILED for document: error-doc.md"
      )
    );
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test("should correctly infer documentType based on file path", async () => {
    const mockFiles = [
      "prd.md",
      "integration-test-plan.md",
      "api-documentation.md",
      "architecture-overview.md", // Added for Architecture
      "user-story-feature-x.md", // Added for UserStory
    ];
    (fs.readdir as jest.Mock).mockImplementation((dirPath) => {
      if (dirPath === mockProjectDocsDir) {
        return Promise.resolve(mockFiles);
      }
      return Promise.resolve([]);
    });
    (fs.readFile as jest.Mock).mockImplementation((filePath) => {
      const absoluteSchemaPath = path.join(process.cwd(), "docs", "architecture", "document-schema.json");
      if (filePath === absoluteSchemaPath) {
        return Promise.resolve(mockDocumentSchemaContent);
      }
      if (filePath.includes("prd.md")) return Promise.resolve("# PRD Document");
      if (filePath.includes("integration-test-plan.md"))
        return Promise.resolve("# Integration Test Plan");
      if (filePath.includes("api-documentation.md"))
        return Promise.resolve("# API Documentation");
      if (filePath.includes("architecture-overview.md"))
        return Promise.resolve("# Architecture Overview");
      if (filePath.includes("user-story-feature-x.md"))
        return Promise.resolve("# User Story Feature X");
      return Promise.resolve("# Document Content");
    });

    await ingestDocuments();

    const calls = (validate as jest.Mock).mock.calls;

    const prdCall = calls.find((call) => call[0].documentType === "PRD");
    expect(prdCall).toBeDefined();

    const testPlanCall = calls.find(
      (call) => call[0].documentType === "TestPlan"
    );
    expect(testPlanCall).toBeDefined();

    const apiCall = calls.find((call) => call[0].documentType === "API");
    expect(apiCall).toBeDefined();

    const archCall = calls.find(
      (call) => call[0].documentType === "Architecture"
    );
    expect(archCall).toBeDefined();

    const storyCall = calls.find(
      (call) => call[0].documentType === "UserStory"
    );
    expect(storyCall).toBeDefined();
  });
});
