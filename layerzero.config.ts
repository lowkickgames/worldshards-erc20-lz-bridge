// prettier-ignore-file

import { EndpointId } from '@layerzerolabs/lz-definitions'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { TwoWayConfig, generateConnectionsConfig } from '@layerzerolabs/metadata-tools'
import { OAppEnforcedOption } from '@layerzerolabs/toolbox-hardhat'

import type { OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

//
// bridge contract list
//

const bscContract: OmniPointHardhat = {
    eid: EndpointId.BSC_V2_MAINNET,
    contractName: 'WorldShardsOFTAdapter',
}

const baseContract: OmniPointHardhat = {
    eid: EndpointId.BASE_V2_MAINNET,
    contractName: 'WorldShardsOFT',
}

// const ethContract: OmniPointHardhat = {
//     eid: EndpointId.ETHEREUM_V2_MAINNET,
//     contractName: 'WorldShardsOFT',
// }

//
// lz config options
//

const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
    {
        msgType: 1,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 80000,
        value: 0,
    },
]

//
// pathways
//

const pathways: TwoWayConfig[] = [
    [bscContract, baseContract, [['LayerZero Labs'], []], [5, 5], [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS]],
]

export default async function () {
    const connections = await generateConnectionsConfig(pathways)
    return {
        contracts: [{ contract: bscContract }, { contract: baseContract }],
        connections,
    }
}
