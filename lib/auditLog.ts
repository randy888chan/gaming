import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';

// Initialize IPFS client
const ipfs = create({
  url: process.env.IPFS_API || 'https://ipfs.particle.network'
});

// Initialize Ethereum provider
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC);
const auditContract = new ethers.Contract(
  process.env.AUDIT_CONTRACT_ADDRESS!,
  [
    'function storeAuditHash(bytes32 hash) public',
    'event AuditHashStored(bytes32 indexed hash, uint256 timestamp)'
  ],
  provider
);

export async function auditLog(userId: string, eventType: string, details: object) {
  // Create structured log data
  const logEntry = {
    userId,
    eventType,
    timestamp: new Date().toISOString(),
    details: maskSensitiveData(details)
  };

  // Convert to JSON and encrypt
  const logData = JSON.stringify(logEntry);
  
  try {
    // Store log in IPFS
    const { cid } = await ipfs.add(logData);
    
    // Store CID hash on-chain
    const tx = await auditContract.storeAuditHash(ethers.utils.id(cid.toString()));
    await tx.wait();
    
    console.log(`Audit log stored at CID: ${cid.toString()}`);
    console.log(`Transaction hash: ${tx.hash}`);
  } catch (error) {
    console.error('Error storing audit log:', error);
    throw new Error('Failed to store audit log');
  }
}

function maskSensitiveData(data: any): any {
  const maskedData = { ...data };
  // Example: Mask email fields
  if (maskedData.email) {
    maskedData.email = '[MASKED_EMAIL]';
  }
  if (maskedData.new_email) {
    maskedData.new_email = '[MASKED_EMAIL]';
  }
  if (maskedData.old_email) {
    maskedData.old_email = '[MASKED_EMAIL]';
  }
  // Add more masking rules as needed for other PII
  return maskedData;
}