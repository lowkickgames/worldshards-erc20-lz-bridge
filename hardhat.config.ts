import 'dotenv/config'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'
import '@nomicfoundation/hardhat-verify'
import { EndpointId } from '@layerzerolabs/lz-definitions'

//
// importing hardhat tasks
//

import './tasks'

//
// rpc urls
//

const BSC_RPC_URL = process.env.BSC_RPC_URL || ''
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || ''
const BASE_RPC_URL = process.env.BASE_RPC_URL || ''
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL || ''

//
// explorer api keys
//

const BSC_EXPLORER_API_KEY = process.env.BSC_EXPLORER_API_KEY || ''
const ETHEREUM_EXPLORER_API_KEY = process.env.ETHEREUM_EXPLORER_API_KEY || ''
const BASE_EXPLORER_API_KEY = process.env.BASE_EXPLORER_API_KEY || ''
const ARBITRUM_EXPLORER_API_KEY = process.env.ARBITRUM_EXPLORER_API_KEY || ''

//
// signer private key (for deployer)
//

const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = [SIGNER_PRIVATE_KEY || '']
if (accounts == null) {
    console.warn(
        'Could not find SIGNER_PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

//
// hardhat configuration
//

const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.28',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        'bsc-mainnet': {
            eid: EndpointId.BSC_V2_MAINNET,
            url: BSC_RPC_URL,
            chainId: 56,
            accounts,
        },
        'ethereum-mainnet': {
            eid: EndpointId.ETHEREUM_V2_MAINNET,
            url: ETHEREUM_RPC_URL,
            chainId: 1,
            accounts,
        },
        'base-mainnet': {
            eid: EndpointId.BASE_V2_MAINNET,
            url: BASE_RPC_URL,
            chainId: 8453,
            accounts,
        },
        'arbitrum-mainnet': {
            eid: EndpointId.ARBITRUM_V2_MAINNET,
            url: ARBITRUM_RPC_URL,
            chainId: 42161,
            accounts,
        },
        hardhat: {
            allowUnlimitedContractSize: true,
        },
    },
    etherscan: {
        apiKey: {
            bsc: BSC_EXPLORER_API_KEY,
            ethereum: ETHEREUM_EXPLORER_API_KEY,
            base: BASE_EXPLORER_API_KEY,
            arbitrumOne: ARBITRUM_EXPLORER_API_KEY,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    sourcify: {
        enabled: false,
    },
}

export default config
