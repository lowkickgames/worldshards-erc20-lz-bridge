import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'WorldShardsOFT'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [endpointV2Deployment.address],
        log: true,
        skipIfAlreadyDeployed: false,
        proxy: {
            viaAdminContract: 'ProxyAdmin',
            execute: {
                init: {
                    methodName: 'initialize',
                    args: ['WorldShards', 'SHARDS', deployer],
                },
            },
            proxyContract: 'OpenZeppelinTransparentProxy',
        },
    })

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
}

deploy.tags = [contractName]

export default deploy
