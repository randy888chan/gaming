# Gaming Platform Coding Standards

## Language Conventions
- TypeScript: Strict mode enforced
- Solidity: 0.8.19+ with OpenZeppelin contracts
- React: Functional components with hooks

## Security Requirements
1. All EVM contracts must have Slither analysis passes
2. Frontend must validate all ZetaChain responses
3. Cryptographic functions use audited libraries only

## Style Guidelines
- Airbnb TypeScript style guide
- Smart contract NatSpec documentation
- 120 character line limits
- 2 space indentation

## Review Process
- 2 senior dev approvals for cross-chain features
- Automated SonarCloud checks required