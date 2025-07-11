# QA Protocol

This protocol outlines the steps for performing quality assurance checks, including linting, testing, and security scans.

## 1. Linting

Run linters to ensure code style and quality.

### Frontend Linting (if applicable)

```bash
npm run format
```

### Backend Linting (if applicable)

```bash
npm run lint:backend
```

### Solidity Linting (if applicable)

```bash
forge fmt --check
```

## 2. Testing

Execute unit, integration, and end-to-end tests.

### Unit Tests

```bash
npm test --unit
```

### Integration Tests

```bash
npm test --integration
```

### End-to-End Tests

```bash
npm test --e2e
```

### Solidity Tests

```bash
forge test
```

## 3. Security Scans

Perform security scans to identify vulnerabilities.

### Static Analysis (e.g., Semgrep, Slither)

```bash
semgrep --config auto .
slither .
```

### Dependency Vulnerability Scan (e.g., npm audit)

```bash
npm audit
```

---

**Note:** Adjust commands based on the specific project setup and technologies used.
