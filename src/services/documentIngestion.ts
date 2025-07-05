import fs from 'fs/promises';
import path from 'path';
import { validate } from 'jsonschema';
import documentSchema from '../../docs/architecture/document-schema.json';
import yaml from 'js-yaml';

// Declare use_mcp_tool as a global function to satisfy TypeScript
declare const use_mcp_tool: (serverName: string, toolName: string, args: any) => Promise<any>;

interface DocumentMetadata {
  title: string;
  creationDate: string;
  author: string;
  documentType: string;
  version: string;
  owner: string;
  content: {
    sections: Array<{
      title: string;
      body: string;
    }>;
  };
  dependencies?: string[];
  compliance?: {
    corePrinciples: boolean;
    securityStandards?: boolean;
  };
}

async function scanProjectDocs(directory: string): Promise<string[]> {
  const files = await fs.readdir(directory);
  // Resolve each file path against the base directory to prevent path traversal
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => path.resolve(directory, file));
}

async function extractMetadataAndContent(filePath: string): Promise<DocumentMetadata> {
  const content = await fs.readFile(filePath, 'utf-8');
  
  let metadata: any = {};
  let markdownContent = content;

  // Parse YAML front matter
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (frontMatterMatch) {
    try {
      metadata = yaml.load(frontMatterMatch[1]);
      markdownContent = frontMatterMatch[2];
    } catch (e) {
      console.error(`Error parsing YAML front matter in ${filePath}:`, e);
    }
  }

  const titleMatch = markdownContent.match(/^#\s*(.*)/m);
  const title = metadata.title || (titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md'));

  const sections = [{ title: "Main Content", body: markdownContent }];

  const creationDate = metadata.creationDate || new Date().toISOString().split('T')[0];
  const author = metadata.author || "System";
  const version = metadata.version || "1.0.0";
  const owner = metadata.owner || "bmad-master";
  const dependencies = metadata.dependencies || [];

  let documentType: DocumentMetadata['documentType'] = metadata.documentType || 'API';
  if (filePath.includes('prd.md')) {
    documentType = 'PRD';
  } else if (filePath.includes('architecture')) {
    documentType = 'Architecture';
  } else if (filePath.includes('story')) {
    documentType = 'UserStory';
  } else if (filePath.includes('test-plan')) {
    documentType = 'TestPlan';
  }

  return {
    title,
    creationDate,
    author,
    documentType,
    version,
    owner,
    content: { sections },
    dependencies,
    compliance: { corePrinciples: true, securityStandards: false } // securityStandards will be updated by securityCheck
  };
}

async function securityCheck(document: DocumentMetadata): Promise<boolean> {
  const codeFiles = [{ filename: document.title + '.md', content: document.content.sections[0].body }];

  // Semgrep rule for detecting 'eval()' usage (example for OWASP A03: Injection)
  const evalRule = `
rules:
  - id: detect-eval-usage
    message: "Detected 'eval()' usage, which can lead to arbitrary code execution. Consider safer alternatives."
    severity: ERROR
    languages:
      - typescript
      - javascript
    patterns:
      - pattern: "eval(...)"
  `;

  // Semgrep rule for detecting hardcoded secrets (example for OWASP A07: Identification and Authentication Failures)
  const hardcodedSecretRule = `
rules:
  - id: detect-hardcoded-secret
    message: "Detected potential hardcoded secret. Avoid embedding sensitive information directly in code."
    severity: WARNING
    languages:
      - typescript
      - javascript
      - python
      - go
      - java
    patterns:
      - pattern-regex: "(password|secret|api_key|token)\\s*=\\s*['\\"].*['\\"]"
  `;

  // Combine rules for a more comprehensive check
  const combinedRules = `
rules:
  - id: detect-eval-usage
    message: "Detected 'eval()' usage, which can lead to arbitrary code execution. Consider safer alternatives."
    severity: ERROR
    languages:
      - typescript
      - javascript
    patterns:
      - pattern: "eval(...)"
  - id: detect-hardcoded-secret
    message: "Detected potential hardcoded secret. Avoid embedding sensitive information directly in code."
    severity: WARNING
    languages:
      - typescript
      - javascript
      - python
      - go
      - java
    patterns:
      - pattern-regex: "(password|secret|api_key|token)\\s*=\\s*['\\"].*['\\"]"
  `;

  try {
    const evalScanResult = await use_mcp_tool('semgrep', 'semgrep_scan_with_custom_rule', {
      code_files: codeFiles,
      rule: evalRule,
    });

    const secretScanResult = await use_mcp_tool('semgrep', 'semgrep_scan_with_custom_rule', {
      code_files: codeFiles,
      rule: hardcodedSecretRule,
    });

    const combinedScanResult = await use_mcp_tool('semgrep', 'semgrep_scan_with_custom_rule', {
      code_files: codeFiles,
      rule: combinedRules,
    });

    const findings = [...evalScanResult.findings, ...secretScanResult.findings, ...combinedScanResult.findings];

    if (findings.length > 0) {
      console.warn(`Security findings for ${document.title}:`, findings);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Error during security scan for ${document.title}:`, error);
    return false;
  }
}

function validateDocument(document: DocumentMetadata): boolean {
  const result = validate(document, documentSchema);
  if (!result.valid) {
    console.error("Document validation errors:", result.errors);
  }
  return result.valid;
}

async function resolveDependencies(document: DocumentMetadata, allDocuments: Map<string, DocumentMetadata>): Promise<boolean> {
  if (!document.dependencies || document.dependencies.length === 0) {
    return true;
  }

  for (const dep of document.dependencies) {
    if (!allDocuments.has(dep)) {
      console.error(`Unresolved dependency for ${document.title}: ${dep}`);
      return false;
    }
  }
  return true;
}

async function createSearchIndex(document: DocumentMetadata): Promise<void> {
  // Simulate Elasticsearch indexing
  console.log(`Simulating indexing document: ${document.title}`);
  // In a real scenario, this would send the document to an Elasticsearch cluster
  // For now, we'll just log the action.
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation
}

async function updateSystemState(state: string, documentTitle?: string): Promise<void> {
  // Simulate state management service update
  const message = documentTitle ? `Updating system state to: ${state} for document: ${documentTitle}` : `Updating system state to: ${state}`;
  console.log(message);
  // In a real scenario, this would interact with a state management service
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async operation
}

export async function ingestDocuments(): Promise<void> {
  const projectDocsDir = path.join(process.cwd(), 'project_docs');
  const markdownFiles = await scanProjectDocs(projectDocsDir);
  const allDocuments = new Map<string, DocumentMetadata>();

  // First pass: extract metadata and content for all documents
  for (const filePath of markdownFiles) {
    try {
      const document = await extractMetadataAndContent(filePath);
      allDocuments.set(document.title, document);
    } catch (error) {
      console.error(`Error extracting metadata from file: ${filePath}`, error);
      await updateSystemState('INGESTION_FAILED', path.basename(filePath));
    }
  }

  // Second pass: validate, perform security checks, resolve dependencies, and index
  for (const [title, document] of allDocuments.entries()) {
    console.log(`Processing document: ${title}`);
    try {
      await updateSystemState('PROCESSING', title);

      // 1. Schema Validation
      if (!validateDocument(document)) {
        console.error(`Failed schema validation for document: ${title}`);
        await updateSystemState('VALIDATION_FAILED', title);
        continue;
      }

      // 2. Security Compliance
      const isSecure = await securityCheck(document);
      document.compliance!.securityStandards = isSecure;
      if (!isSecure) {
        console.error(`Failed security compliance for document: ${title}`);
        await updateSystemState('SECURITY_FAILED', title);
        continue;
      }

      // 3. Document Dependency Resolution
      if (!await resolveDependencies(document, allDocuments)) {
        console.error(`Failed dependency resolution for document: ${title}`);
        await updateSystemState('DEPENDENCY_FAILED', title);
        continue;
      }

      // 4. Search Indexing
      await createSearchIndex(document);
      console.log(`Successfully ingested and indexed: ${title}`);
      await updateSystemState('INGESTED_AND_INDEXED', title);

    } catch (error) {
      console.error(`Error processing document: ${title}`, error);
      await updateSystemState('INGESTION_FAILED', title);
    }
  }
  await updateSystemState('INGESTION_COMPLETE');
  console.log('Document ingestion workflow completed.');
}