import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'WorldShardsOFTAdapter'

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
        args: [
            '0xF1B3F105ce02e383BC1BD15DC9E3AE76403D09Cd', // token
            endpointV2Deployment.address, // LayerZero's EndpointV2 address
        ],
        log: true,
        skipIfAlreadyDeployed: false,
        proxy: {
            viaAdminContract: "ProxyAdmin",
            execute: {
              init: {
                methodName: 'initialize',
                args: [deployer],
              },
            },
            proxyContract: 'OpenZeppelinTransparentProxy',
          },
    })

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
}

deploy.tags = [contractName]

export default deploy
