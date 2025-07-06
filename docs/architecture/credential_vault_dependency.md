# Credential Vault Dependency for Polymarket-ZetaChain Integration

This document outlines the dependency on a secure credential vault system for managing sensitive information used by the Polymarket-ZetaChain worker.

## Rationale

The `wrangler.toml` configuration for the `polymarket-zetachain-worker` currently includes placeholders for sensitive data such as `ZETACHAIN_PRIVATE_KEY`, `POLYMARKET_API_KEY`, and `POLYMARKET_API_SECRET`. Hardcoding these values, especially the private key, is a significant security risk and is strictly prohibited in production environments.

To ensure the security and integrity of these credentials, a robust credential vault system must be integrated. This system will be responsible for:

*   **Secure Storage:** Storing sensitive keys and API secrets in an encrypted and access-controlled manner.
*   **Runtime Retrieval:** Providing a secure mechanism for the worker to retrieve credentials at runtime without exposing them in plain text.
*   **Access Control:** Implementing fine-grained access control to ensure only authorized services and personnel can access specific credentials.
*   **Rotation:** Facilitating the periodic rotation of credentials to minimize the impact of potential compromises.

## Recommended Credential Vault Solutions

While the specific choice of credential vault may depend on the overall infrastructure and security policies, common solutions include:

*   **Cloud Provider Secret Managers:**
    *   AWS Secrets Manager
    *   Google Cloud Secret Manager
    *   Azure Key Vault
*   **Dedicated Secret Management Tools:**
    *   HashiCorp Vault
    *   CyberArk Conjur

## Implementation Considerations

Future implementations should focus on:

1.  **Integration with Worker Environment:** Adapting the worker's deployment environment (e.g., Cloudflare Workers, Kubernetes) to securely fetch secrets from the chosen vault. This often involves using environment variables populated by the vault or SDKs provided by the vault solution.
2.  **Least Privilege:** Ensuring the worker only has access to the specific secrets it needs, and with the minimum necessary permissions.
3.  **Auditing and Logging:** Implementing comprehensive auditing and logging of all secret access attempts to detect and respond to unauthorized access.
4.  **Local Development:** Providing a secure and convenient way for developers to manage credentials during local development without compromising production security (e.g., using `.env` files for local testing, but excluded from version control).

## Action Items

*   Identify and select a suitable credential vault solution.
*   Integrate the chosen credential vault into the CI/CD pipeline for secure deployment.
*   Update the `polymarket-zetachain-worker` to retrieve credentials from the vault at runtime.
*   Establish clear procedures for credential rotation and access management.