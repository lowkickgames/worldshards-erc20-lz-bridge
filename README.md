# WorldShards ERC20 LayerZero Bridge

Cross-chain ERC20 token bridge using LayerZero protocol

- Language: Solidity v0.8.28
- Project framework: Hardhat + TypeScript
- Nodejs: >=18.16.0

## Installation & Usage

1. Install packages
```
npm install
```

2. Build project
```
npm run compile
```

### Testing

```
npm test
```

### Run linter

For .sol files
```
npm run lint:sol
```

For .ts files
```
npm run lint:js
```

## Usage

1. Check network in ```hardhat.config.ts``` ([docs](https://hardhat.org/config/))

2. Setup environment variables:
```
cp .env.example .env
```

then edit RPC URLs and SIGNER_PRIVATE_KEY

3. Deploy contracts:

Deploy OFT Adapter on BSC:
```
npx hardhat lz:deploy --ci --tags WorldShardsOFTAdapter --networks bsc-mainnet
```

Deploy OFT on Ethereum:
```
npx hardhat lz:deploy --ci --tags WorldShardsOFT --networks ethereum-mainnet
```

4. Wire the contracts:
```
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

5. Check peer connections:
```
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts
```

6. Send tokens cross-chain:

From BSC to Ethereum:
```
npx hardhat lz:oft:send --src-eid 30102 --dst-eid 30101 --amount 10 --to 0x58dFB535c6B3db61b0BACa876Bb6fD69C19Fd385
```

From Ethereum to BSC:
```
npx hardhat lz:oft:send --src-eid 30101 --dst-eid 30102 --amount 10 --to 0x58dFB535c6B3db61b0BACa876Bb6fD69C19Fd385
```

7. Verify contracts (optional):
```
npx hardhat verify <contract address> <arguments> --network <network name>
```

## Network LayerZero v2 EIDs

| Network | EID |
|---------|-----|
| BSC Mainnet | 30102 |
| Ethereum Mainnet | 30101 |
| Base Mainnet | 30184 |
| Arbitrum Mainnet | 30110 |

## Deployed Contracts

coming soon
