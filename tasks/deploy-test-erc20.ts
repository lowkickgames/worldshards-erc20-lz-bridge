import { task } from 'hardhat/config'

task('task:deploy-test-erc20', 'Deploys TestERC20 smart contract')
    .addParam('recipient')
    .setAction(async (taskArgs, hre) => {
        const recipient = taskArgs.recipient || '0x0000000000000000000000000000000000000000'

        const TestERC20 = await hre.ethers.getContractFactory('TestERC20')
        const testERC20 = await TestERC20.deploy(recipient)
        await testERC20.deployed()
        console.log('TestERC20 deployed to:', testERC20.address)
    })
