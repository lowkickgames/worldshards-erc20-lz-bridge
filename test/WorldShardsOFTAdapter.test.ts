import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'

import { Options } from '@layerzerolabs/lz-v2-utilities'

describe('WorldShardsOFTAdapter Test', function () {
    const eidA = 1
    const eidB = 2
    let TestERC20: ContractFactory
    let WorldShardsOFTAdapter: ContractFactory
    let WorldShardsOFT: ContractFactory
    let EndpointV2Mock: ContractFactory
    let ProxyAdminMock: ContractFactory
    let TransparentUpgradeableProxyMock: ContractFactory
    let ownerA: SignerWithAddress
    let ownerB: SignerWithAddress
    let endpointOwner: SignerWithAddress
    let testTokenA: Contract
    let adapterA: Contract
    let oftB: Contract
    let mockEndpointV2A: Contract
    let mockEndpointV2B: Contract

    before(async function () {
        TestERC20 = await ethers.getContractFactory('TestERC20')
        WorldShardsOFTAdapter = await ethers.getContractFactory('WorldShardsOFTAdapter')
        WorldShardsOFT = await ethers.getContractFactory('WorldShardsOFT')
        ProxyAdminMock = await ethers.getContractFactory('ProxyAdminMock')
        TransparentUpgradeableProxyMock = await ethers.getContractFactory('TransparentUpgradeableProxyMock')

        const signers = await ethers.getSigners()
        ;[ownerA, ownerB, endpointOwner] = signers

        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(EndpointV2MockArtifact.abi, EndpointV2MockArtifact.bytecode, endpointOwner)
    })

    beforeEach(async function () {
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA)
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB)

        testTokenA = await TestERC20.deploy(ownerA.address)

        const adapterImplementationA = await WorldShardsOFTAdapter.deploy(testTokenA.address, mockEndpointV2A.address)

        const oftImplementationB = await WorldShardsOFT.deploy(mockEndpointV2B.address)

        const proxyAdminA = await ProxyAdminMock.deploy(ownerA.address)
        const proxyAdminB = await ProxyAdminMock.deploy(ownerB.address)

        const adapterInitDataA = adapterImplementationA.interface.encodeFunctionData('initialize', [ownerA.address])
        const oftInitDataB = oftImplementationB.interface.encodeFunctionData('initialize', ['OFT-B', 'OFT-B', ownerB.address])

        const adapterProxyA = await TransparentUpgradeableProxyMock.deploy(
            adapterImplementationA.address,
            proxyAdminA.address,
            adapterInitDataA
        )

        const oftProxyB = await TransparentUpgradeableProxyMock.deploy(
            oftImplementationB.address,
            proxyAdminB.address,
            oftInitDataB
        )

        adapterA = WorldShardsOFTAdapter.attach(adapterProxyA.address)
        oftB = WorldShardsOFT.attach(oftProxyB.address)

        await mockEndpointV2A.setDestLzEndpoint(oftB.address, mockEndpointV2B.address)
        await mockEndpointV2B.setDestLzEndpoint(adapterA.address, mockEndpointV2A.address)

        await adapterA.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(oftB.address, 32))
        await oftB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(adapterA.address, 32))
    })

    describe('Basic Functionality', function () {
        it('should have correct underlying token', async function () {
            expect(await testTokenA.name()).to.equal('TestERC20')
            expect(await testTokenA.symbol()).to.equal('TestERC20')
            
            expect(await oftB.name()).to.equal('OFT-B')
            expect(await oftB.symbol()).to.equal('OFT-B')
        })

        it('should allow token approval for adapter', async function () {
            const amount = ethers.utils.parseEther('100')
            await testTokenA.connect(ownerA).approve(adapterA.address, amount)
            expect((await testTokenA.allowance(ownerA.address, adapterA.address)).toString()).to.equal(amount.toString())
        })

        it('should check approval required', async function () {
            const approvalRequired = await adapterA.approvalRequired()
            expect(approvalRequired).to.be.true
        })

        it('should get underlying token address', async function () {
            const tokenAddress = await adapterA.token()
            expect(tokenAddress).to.equal(testTokenA.address)
        })
    })

    describe('Cross-chain Functionality', function () {
        it('should send tokens from adapter to OFT', async function () {
            const sendAmount = ethers.utils.parseEther('25')
            
            await testTokenA.connect(ownerA).approve(adapterA.address, sendAmount)
            
            const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
            
            const sendParam = [
                eidB,
                ethers.utils.zeroPad(ownerB.address, 32),
                sendAmount,
                sendAmount,
                options,
                '0x',
                '0x',
            ]
            
            const [nativeFee] = await adapterA.quoteSend(sendParam, false)
            await adapterA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })
            
            const initialBalance = ethers.utils.parseEther('5000000000')
            expect((await testTokenA.balanceOf(ownerA.address)).toString()).to.equal(initialBalance.sub(sendAmount).toString())
            expect((await oftB.balanceOf(ownerB.address)).toString()).to.equal(sendAmount.toString())
        })

        it('should handle multiple cross-chain transfers', async function () {
            const sendAmount = ethers.utils.parseEther('50')
            const totalAmount = sendAmount.mul(3)
            
            await testTokenA.connect(ownerA).approve(adapterA.address, totalAmount)
            
            const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
            
            for (let i = 0; i < 3; i++) {
                const sendParam = [
                    eidB,
                    ethers.utils.zeroPad(ownerB.address, 32),
                    sendAmount,
                    sendAmount,
                    options,
                    '0x',
                    '0x',
                ]
                
                const [nativeFee] = await adapterA.quoteSend(sendParam, false)
                await adapterA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })
            }
            
            const initialBalance = ethers.utils.parseEther('5000000000')
            expect((await testTokenA.balanceOf(ownerA.address)).toString()).to.equal(initialBalance.sub(totalAmount).toString())
            expect((await oftB.balanceOf(ownerB.address)).toString()).to.equal(totalAmount.toString())
        })
    })

    describe('Integration Tests', function () {
        it('should work with adapter to OFT transfers', async function () {
            const sendAmount = ethers.utils.parseEther('50')
            
            await testTokenA.connect(ownerA).approve(adapterA.address, sendAmount)
            
            const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
            
            const sendParam = [
                eidB,
                ethers.utils.zeroPad(ownerB.address, 32),
                sendAmount,
                sendAmount,
                options,
                '0x',
                '0x',
            ]
            
            const [nativeFee] = await adapterA.quoteSend(sendParam, false)
            await adapterA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })
            
            const initialBalance = ethers.utils.parseEther('5000000000')
            expect((await testTokenA.balanceOf(ownerA.address)).toString()).to.equal(initialBalance.sub(sendAmount).toString())
            expect((await oftB.balanceOf(ownerB.address)).toString()).to.equal(sendAmount.toString())
        })

        it('should handle complex adapter scenarios', async function () {
            const sendAmount = ethers.utils.parseEther('25')
            
            await testTokenA.connect(ownerA).approve(adapterA.address, sendAmount)
            
            const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
            
            const sendParam = [
                eidB,
                ethers.utils.zeroPad(ownerB.address, 32),
                sendAmount,
                sendAmount,
                options,
                '0x',
                '0x',
            ]
            
            const [nativeFee] = await adapterA.quoteSend(sendParam, false)
            await adapterA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })
            
            const initialBalance = ethers.utils.parseEther('5000000000')
            expect((await testTokenA.balanceOf(ownerA.address)).toString()).to.equal(initialBalance.sub(sendAmount).toString())
            expect((await oftB.balanceOf(ownerB.address)).toString()).to.equal(sendAmount.toString())
        })
    })

    describe('Edge Cases', function () {
        it('should handle zero amount transfers', async function () {
            await testTokenA.connect(ownerA).approve(adapterA.address, ethers.utils.parseEther('1'))
            
            const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
            
            const sendParam = [
                eidB,
                ethers.utils.zeroPad(ownerB.address, 32),
                0,
                0,
                options,
                '0x',
                '0x',
            ]
            
            const [nativeFee] = await adapterA.quoteSend(sendParam, false)
            await adapterA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })
            
            const initialBalance = ethers.utils.parseEther('5000000000')
            expect((await testTokenA.balanceOf(ownerA.address)).toString()).to.equal(initialBalance.toString())
            expect((await oftB.balanceOf(ownerB.address)).toString()).to.equal('0')
        })

        it('should handle large amounts', async function () {
            const largeAmount = ethers.utils.parseEther('1000000')
            const currentBalance = await testTokenA.balanceOf(ownerA.address)
            expect(currentBalance.gte(largeAmount)).to.be.true
            
            await testTokenA.connect(ownerA).approve(adapterA.address, largeAmount)
            
            const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
            
            const sendParam = [
                eidB,
                ethers.utils.zeroPad(ownerB.address, 32),
                largeAmount,
                largeAmount,
                options,
                '0x',
                '0x',
            ]
            
            const [nativeFee] = await adapterA.quoteSend(sendParam, false)
            await adapterA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })
            
            const initialBalance = ethers.utils.parseEther('5000000000')
            expect((await testTokenA.balanceOf(ownerA.address)).toString()).to.equal(initialBalance.sub(largeAmount).toString())
            expect((await oftB.balanceOf(ownerB.address)).toString()).to.equal(largeAmount.toString())
        })
    })
}) 