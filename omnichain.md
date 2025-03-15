### **1. ZetaChain Omnichain Contract Setup (For Azuro and Beyond)**

#### **A. Minimal Omnichain Contract for Azuro**

Even if you’re using existing Azuro contracts, you need a ZetaChain contract to handle cross-chain logic. Example:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@zetachain/protocol-contracts/contracts/ZetaInterfaces.sol";

contract AzuroCrossChain {
    Zeta public zeta;

    constructor(address zeta_) {
        zeta = Zeta(zeta_);
    }

    // Send bets to Azuro on another chain
    function forwardBet(
        uint256 destinationChainId,
        address azuroContract,
        bytes calldata betData
    ) external payable {
        zeta.send(
            Zeta.SendInput({
                destinationChainId: destinationChainId,
                destinationAddress: azuroContract,
                data: betData,
                gasLimit: 500000,
                message: new bytes(0),
                zetaValueAndGas: msg.value
            })
        );
    }

    // Receive results from Azuro (via ZetaChain)
    function onZetaMessage(Zeta.Message calldata message) external {
        // Decode message from Azuro and handle logic
    }
}
```

#### **B. Deploying to ZetaChain**

1. **Compile and Deploy** using Hardhat/Truffle to ZetaChain’s testnet (Athens 3).
2. **Connect to Azuro**: Use Azuro’s SDK to encode bet data (`betData`) for the destination chain (e.g., Polygon).

---

### **2. Extending to Bitcoin, Solana, and TON via ZetaChain**

#### **A. Bitcoin Integration**

ZetaChain natively supports Bitcoin via **pegged BTC (zBTC)**. Steps:

1. **Lock BTC on ZetaChain**: Users send BTC to ZetaChain’s Bitcoin vault address.
2. **Mint zBTC**: Use ZetaChain’s omnichain contracts to mint zBTC (wrapped BTC).
3. **Use zBTC in Azuro**: Pass zBTC to Azuro contracts via the omnichain contract.

```javascript
// Use ZetaChain's Bitcoin connector
import { prepareLockBTC } from "@zetachain/bitcoin-connector";

const tx = await prepareLockBTC({
  amount: "0.01", // BTC amount
  destinationAddress: "YOUR_OMNICHAIN_CONTRACT_ADDRESS",
});
```

#### **B. Solana and TON Integration**

ZetaChain uses **IBC-like cross-chain messaging** for non-EVM chains. Example flow:

1. **Send Data from Solana/TON**:
   - Use ZetaChain’s Solana/TON program to send messages to ZetaChain.
2. **Handle on ZetaChain**:
   - Use the omnichain contract’s `onZetaMessage` to process incoming data.
3. **Forward to Azuro**:
   - Encode the data into Azuro-compatible bets and forward to EVM chains.

**Solana Example (Sending a Bet)**:

```rust
// Solana program to send messages to ZetaChain
use zetachain_solana::send_message;

fn send_bet_to_zeta(ctx: Context<SendBet>, bet_amount: u64) -> Result<()> {
    let message = format!("bet:{}:{}", ctx.accounts.user.key(), bet_amount);
    send_message(
        ctx.accounts.zetachain_program.to_account_info(),
        message.as_bytes(),
    )?;
    Ok(())
}
```

#### **C. Universal IBC Setup**

For true IBC (e.g., Cosmos chains), use ZetaChain’s **IBC relayer**:

1. **Configure IBC Channels** in ZetaChain’s relayer config.

2. **Map Azuro Data to IBC Packets**:
   
   ```javascript
   const ibcPacket = {
     sourcePort: "azuro",
     sourceChannel: "channel-0",
     data: encodeAzuroBet(betData), // Encode using Protobuf
   };
   ```

3. **Handle Acknowledgements** in your omnichain contract.

---

### **3. Integrating Li.Fi Widget & WalletConnect with Particle Network**

#### **A. Li.Fi Widget for Cross-Chain Swaps**

1. **Replace Li.Fi’s Default Wallet with Particle**:
   
   ```javascript
   import { LiFiWidget } from '@lifi/widget';
   import { ParticleProvider } from '@particle-network/provider';
   
   const particleProvider = new ParticleProvider(particle.auth);
   
   <LiFiWidget
     config={{
       walletManagement: {
         signer: particleProvider,
       },
       // Specify chains (ZetaChain, Bitcoin, etc.)
       chains: {
         allow: [7001, 80001, 18332] // ZetaChain, Polygon, Bitcoin Testnet
       }
     }}
   />
   ```

2. **Bridge Assets to ZetaChain**:
   
   - Use Li.Fi to swap tokens from other chains to ZetaChain’s native gas token (ZETA) or zBTC.

#### **B. WalletConnect + Particle Network Hybrid Auth**

1. **Use Particle as WalletConnect Provider**:
   
   ```javascript
   import { ParticleNetwork } from '@particle-network/auth';
   import WalletConnect from '@walletconnect/client';
   
   const particle = new ParticleNetwork({ ... });
   const connector = new WalletConnect({
     bridge: "https://bridge.walletconnect.org",
     qrcodeModal: QRCodeModal,
     provider: new ParticleProvider(particle.auth), // Particle handles signing
   });
   ```

2. **Prioritize Particle for Social Logins**:
   
   - Hide WalletConnect’s QR code if Particle’s social auth is used.

#### **C. Unified Auth Flow**

```javascript
// Auth options: Particle (social) or WalletConnect (self-custody)
async function login(authMethod) {
  if (authMethod === 'particle') {
    await particle.auth.login({ preferredAuthType: "google" });
  } else {
    await connector.connect();
  }
}
```

---

### **4. Critical Checks**

1. **ZetaChain’s Supported Chains**:
   - Confirm Bitcoin/Solana/TON are supported via [ZetaChain’s docs](https://www.zetachain.com/docs/).
2. **Azuro Data Encoding**:
   - Ensure bet payloads are encoded in a format Azuro’s contracts accept (e.g., ABI-encoded `(uint256 marketId, uint256 amount)`).
3. **Gas Fees on Non-EVM Chains**:
   - Use ZetaChain’s gas station to subsidize Bitcoin/Solana/TON transactions.

---

### **5. Troubleshooting Flow**

- **Li.Fi Fails to Bridge to ZetaChain**:  
  
  - Check if ZetaChain is whitelisted in Li.Fi’s `chains.allow`.  
  - Use ZetaChain’s [faucet](https://labs.zetachain.com/faucet) for testnet ZETA.  

- **Bitcoin TX Stuck**:  
  
  - Monitor ZetaChain’s Bitcoin vault address using [BlockCypher](https://live.blockcypher.com/btc-testnet/).  

- **WalletConnect Conflicts with Particle**:  
  
  - Ensure only one provider is active at a time (e.g., disconnect Particle before using WC).  

---

### **Next Steps**

1. Start with **ZetaChain <> Azuro** on testnets.  
2. Add **Bitcoin** using zBTC.  
3. Extend to **Solana/TON** using ZetaChain’s cross-chain examples.  
4. Replace Li.Fi’s default providers with Particle/WalletConnect.  

#### **Workflow with Aider**:

1. **Share API/SDK Docs**:  
   Paste the latest documentation (e.g., Azuro’s API endpoints, ZetaChain’s omnichain ABI) into Aider.  
2. **Request Code Snippets**:  
   Example prompt:  
   *“Generate a function using Li.Fi’s SDK to swap ZETA to MATIC on ZetaChain, then forward to Azuro.”*  
3. **Iterate with Feedback**:  
   Refine the output using error messages or specific requirements.

### **1. Key Constraints to Enforce**

- **No Direct ZetaChain Liquidity**: Avoid using ZetaChain’s native pools (low TVL). Route swaps via Axelar/THORChain but use ZetaChain for cross-chain messaging.
- **Fee Parity**: Ensure total user fees (swap + platform) ≤ 1.5%, matching Li.Fi’s baseline.
- **Particle Auth**: Use Particle’s ZetaChain integration for social logins and fee abstraction.

---

### **2. Implementation Phases**

#### **Phase 1: Particle + ZetaChain Auth Setup**

```javascript
// From Particle's ZetaChain docs (linked)
import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';
import { ZetaChain } from '@particle-network/chains';

const particleConfig = {
  projectId: "YOUR_PROJECT_ID",
  clientKey: "YOUR_CLIENT_KEY",
  appId: "YOUR_APP_ID",
  chain: ZetaChain, // Force ZetaChain as default
  wallet: { 
    visible: true,
    customStyle: {
      supportChains: [ZetaChain], // Hide other chains to avoid liquidity issues
    }
  }
};

// Initialize with ZetaChain-only support
const provider = new ParticleProvider(particleConfig);
```

#### **Phase 2: Cross-Chain Betting via ZetaChain (No Native Liquidity)**

```javascript
// Route swaps via Axelar/THORChain but use ZetaChain for messaging
async function placeBet(sourceAsset, amount, prediction) {
  // 1. Swap to USDT using external LPs (Axelar/THOR)
  const swapTx = await externalSwap({
    from: sourceAsset, 
    to: "USDT",
    amount,
    via: "axelar" // or "thorchain"
  });

  // 2. Forward to Azuro via ZetaChain's omnichain
  const zetaTx = await zeta.sendTransaction({
    data: encodeAzuroBet(prediction),
    to: AZURO_POLYGON_ADDRESS,
    value: 0 // Gas handled by Particle
  });

  // 3. Apply fee (total 1.5% = 0.5% swap + 1% Azuro)
  deductFee(amount, 0.015); 
}
```

#### **Phase 3: Dynamic Fee Adjustment**

```solidity
// AzuroFeeCalculator.sol
contract FeeCalculator {
  uint256 public constant TARGET_FEE = 15; // 1.5% in basis points

  function calculateAzuroFee(uint256 swapCostBps) public pure returns (uint256) {
    require(swapCostBps <= TARGET_FEE, "Swap too expensive");
    return TARGET_FEE - swapCostBps; // Adjust Azuro fee to cap total at 1.5%
  }
}
```

#### **Phase 4: Fallback to Li.Fi (If THOR Fails)**

```javascript
// Monitor liquidity and fallback
let swapProvider = "axelar";

async function checkLiquidity(amount) {
  const axelarLiquidity = await axelar.getBalance("USDT");
  if (axelarLiquidity < amount) {
    swapProvider = "lifi";
    console.log("Falling back to Li.Fi");
  }
}
```

---

### **3. Critical Dependencies**

1. **Particle’s ZetaChain SDK**: Enforce ZetaChain as the default chain to avoid UI confusion.
2. **External Liquidity APIs**:
   - THORChain: `thornode-api`
3. **Fee Enforcement**: Hardcode fee logic to prevent LLM from "optimizing" into ZetaChain’s liquidity.

---

### **4. LLM Instruction Guidelines**

1. **Avoid ZetaChain Liquidity**:
   - *"Do not use ZetaChain’s swap() or addLiquidity() methods. Route all swaps via  THORChain."*
2. **Fee Enforcement**:
   - *"Total user cost must be 1.5%. If the swap provider’s fee is 0.5%, set Azuro’s fee to 1%."*
3. **Error Handling**:
   - *"If Axelar/THORChain swaps fail, retry with Li.Fi but log the incident."*

---

### **5. Testing Commands for LLM**

```bash
# Test ZetaChain-Particle auth flow
npm run test:auth

# Verify fee enforcement (1.5% total)
npm run test:fees

# Simulate liquidity failure
MOCK_LIQUIDITY=100 npm run test:swap
```
