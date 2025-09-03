# WorldShards $SHARDS Bridge

This project contains the bridge contract for the $SHARDS token of [WorldShards Game](https://www.worldshards.online/).

The bridge enables seamless transfer of [$SHARDS tokens](https://github.com/lowkickgames/worldshards-erc20-token) between different blockchain networks.

For more information about the $SHARDS token, please visit the [official wiki page](https://wiki.worldshards.online/usdshards-token).

## Official $SHARDS Bridge Contract Addresses

The bridge is currently deployed on BNB Smart Chain and Ethereum.

- Bridge address on BNB Smart Chain: [0x6Efe65C2426b51E9AA0427B96C313E5D8715FD06](https://bscscan.com/address/0x6efe65c2426b51e9aa0427b96c313e5d8715fd06). The bridge contract address on BNB Smart Chain **differs** from the $SHARDS token contract address.

- Bridge address on Ethereum: [0x6Efe65C2426b51E9AA0427B96C313E5D8715FD06](https://etherscan.io/address/0x6efe65c2426b51e9aa0427b96c313e5d8715fd06). The bridge contract address on Ethereum **is the same** as the $SHARDS token contract address.

## Security Audit

This project has undergone security audit to ensure the integrity and safety of the smart contracts. The audit were conducted by reputable third-party company specializing in blockchain security.

| Audit Company | Audit Date | Commit Hash | Audit Report |
| ------------- | ---------- | ----------- | ------------ |
| [Oxorio](https://oxor.io/) | 2025-08-01 | [95d1352](https://github.com/lowkickgames/worldshards-erc20-lz-bridge/commit/95d13526fe3a3ab1b7c66920b89ead8e48dbe97a) | [Report PDF](https://oxor-io.github.io/public_audits/WorldShards/Worldshards-ERC20-Layerzero-Bridge-Audit-Report.pdf) |

## Overview

The cross-chain token bridge is implemented using the LayerZero V2 Omnichain Fungible Token (OFT) Standard.

On BNB Smart Chain, the `OFTAdapter` contract is used to lock and unlock $SHARDS tokens during cross-chain transfers.

On Ethereum network, the `OFT` contract is used to mint and burn $SHARDS tokens during cross-chain transfers.

These contracts are designed to work together to ensure a unified token supply across all networks.

More information can be found in the [official documentation](https://docs.layerzero.network/v2/developers/evm/oft/quickstart).

- Language: Solidity v0.8.28
- Project framework: Hardhat + TypeScript
- Nodejs: >=20.19.4

## Installation & Usage

1. Install packages

    ```bash
    npm install
    ```

2. Build project

    ```bash
    npm run compile
    ```

### Testing

```bash
npm test
```

### Run linter

For .sol files

```bash
npm run lint:sol
```

For .ts files

```bash
npm run lint:js
```

## Usage

1. Check network in ```hardhat.config.ts``` ([docs](https://hardhat.org/config/))

2. Setup environment variables:

    ```bash
    cp .env.example .env
    ```

    then edit RPC URLs and SIGNER_PRIVATE_KEY

3. Deploy contracts:

    Deploy OFT Adapter on BSC:

    ```bash
    npx hardhat lz:deploy --ci --tags WorldShardsOFTAdapter --networks bsc-mainnet
    ```

    Deploy OFT on Ethereum:

    ```bash
    npx hardhat lz:deploy --ci --tags WorldShardsOFT --networks ethereum-mainnet
    ```

4. Wire the contracts:

    ```bash
    npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
    ```

5. Check peer connections:

    ```bash
    npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts
    ```

6. Send tokens cross-chain:

    From BSC to Ethereum:

    ```bash
    npx hardhat lz:oft:send --src-eid 30102 --dst-eid 30101 --amount 10 --to 0x58dFB535c6B3db61b0BACa876Bb6fD69C19Fd385
    ```

    From Ethereum to BSC:

    ```bash
    npx hardhat lz:oft:send --src-eid 30101 --dst-eid 30102 --amount 10 --to 0x58dFB535c6B3db61b0BACa876Bb6fD69C19Fd385
    ```

7. Verify contracts (optional):

    ```bash
    npx hardhat verify <contract address> <arguments> --network <network name>
    ```

## Network LayerZero v2 EIDs

| Network | EID |
|---------|-----|
| BSC Mainnet | 30102 |
| Ethereum Mainnet | 30101 |
| Base Mainnet | 30184 |
| Arbitrum Mainnet | 30110 |
