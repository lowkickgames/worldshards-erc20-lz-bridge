import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'

import { Options } from '@layerzerolabs/lz-v2-utilities'

describe('WorldShardsOFT Test', function () {
    const eidA = 1
    const eidB = 2
    let WorldShardsOFTMock: ContractFactory
    let WorldShardsOFT: ContractFactory
    let EndpointV2Mock: ContractFactory
    let ProxyAdminMock: ContractFactory
    let TransparentUpgradeableProxyMock: ContractFactory
    let ownerA: SignerWithAddress
    let ownerB: SignerWithAddress
    let endpointOwner: SignerWithAddress
    let oftA: Contract
    let oftB: Contract
    let mockEndpointV2A: Contract
    let mockEndpointV2B: Contract

    before(async function () {
        WorldShardsOFTMock = await ethers.getContractFactory('WorldShardsOFTMock')
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

        const implementationA = await WorldShardsOFTMock.deploy(mockEndpointV2A.address)
        const implementationB = await WorldShardsOFT.deploy(mockEndpointV2B.address)

        const proxyAdminA = await ProxyAdminMock.deploy(ownerA.address)
        const proxyAdminB = await ProxyAdminMock.deploy(ownerB.address)

        const initDataA = implementationA.interface.encodeFunctionData('initialize', ['aOFT', 'aOFT', ownerA.address])
        const initDataB = implementationB.interface.encodeFunctionData('initialize', ['bOFT', 'bOFT', ownerB.address])

        const proxyA = await TransparentUpgradeableProxyMock.deploy(
            implementationA.address,
            proxyAdminA.address,
            initDataA
        )
        const proxyB = await TransparentUpgradeableProxyMock.deploy(
            implementationB.address,
            proxyAdminB.address,
            initDataB
        )

        oftA = WorldShardsOFTMock.attach(proxyA.address)
        oftB = WorldShardsOFTMock.attach(proxyB.address)

        await mockEndpointV2A.setDestLzEndpoint(oftB.address, mockEndpointV2B.address)
        await mockEndpointV2B.setDestLzEndpoint(oftA.address, mockEndpointV2A.address)

        await oftA.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(oftB.address, 32))
        await oftB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(oftA.address, 32))
    })

    describe('Basic Functionality', function () {
        it('should have correct name and symbol', async function () {
            expect(await oftA.name()).to.equal('aOFT')
            expect(await oftA.symbol()).to.equal('aOFT')
            expect(await oftB.name()).to.equal('bOFT')
            expect(await oftB.symbol()).to.equal('bOFT')
        })

        it('should mint tokens correctly', async function () {
            const amount = ethers.utils.parseEther('100')
            await oftA.mint(ownerA.address, amount)
            expect((await oftA.balanceOf(ownerA.address)).toString()).to.equal(amount.toString())
        })

        it('should transfer tokens locally', async function () {
            const amount = ethers.utils.parseEther('50')
            await oftA.mint(ownerA.address, amount)
            await oftA.connect(ownerA).transfer(ownerB.address, ethers.utils.parseEther('10'))
            expect((await oftA.balanceOf(ownerB.address)).toString()).to.equal(ethers.utils.parseEther('10').toString())
            expect((await oftA.balanceOf(ownerA.address)).toString()).to.equal(ethers.utils.parseEther('40').toString())
        })

        it('should approve and transferFrom', async function () {
            const amount = ethers.utils.parseEther('100')
            await oftA.mint(ownerA.address, amount)
            await oftA.connect(ownerA).approve(ownerB.address, ethers.utils.parseEther('30'))
            await oftA.connect(ownerB).transferFrom(ownerA.address, ownerB.address, ethers.utils.parseEther('20'))
            expect((await oftA.balanceOf(ownerB.address)).toString()).to.equal(ethers.utils.parseEther('20').toString())
            expect((await oftA.allowance(ownerA.address, ownerB.address)).toString()).to.equal(ethers.utils.parseEther('10').toString())
        })
    })

    describe('Cross-chain Functionality', function () {
        it('should send a token from A address to B address via each OFT', async function () {
            const initialAmount = ethers.utils.parseEther('100')
            await oftA.mint(ownerA.address, initialAmount)

            const tokensToSend = ethers.utils.parseEther('1')

            const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

            const sendParam = [
                eidB,
                ethers.utils.zeroPad(ownerB.address, 32),
                tokensToSend,
                tokensToSend,
                options,
                '0x',
                '0x',
            ]

            const [nativeFee] = await oftA.quoteSend(sendParam, false)

            await oftA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })

            const finalBalanceA = await oftA.balanceOf(ownerA.address)
            const finalBalanceB = await oftB.balanceOf(ownerB.address)

            expect(finalBalanceA.toString()).to.equal(initialAmount.sub(tokensToSend).toString())
            expect(finalBalanceB.toString()).to.equal(tokensToSend.toString())
        })  

        it('should handle multiple cross-chain transfers', async function () {
            const initialAmount = ethers.utils.parseEther('1000')
            await oftA.mint(ownerA.address, initialAmount)

            const tokensToSend = ethers.utils.parseEther('10')

            const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

            for (let i = 0; i < 3; i++) {
                const sendParam = [
                    eidB,
                    ethers.utils.zeroPad(ownerB.address, 32),
                    tokensToSend,
                    tokensToSend,
                    options,
                    '0x',
                    '0x',
                ]

                const [nativeFee] = await oftA.quoteSend(sendParam, false)
                await oftA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })
            }

            const finalBalanceA = await oftA.balanceOf(ownerA.address)
            const finalBalanceB = await oftB.balanceOf(ownerB.address)

            expect(finalBalanceA.toString()).to.equal(initialAmount.sub(tokensToSend.mul(3)).toString())
            expect(finalBalanceB.toString()).to.equal(tokensToSend.mul(3).toString())
        })
    })

    describe('Edge Cases', function () {
        it('should handle zero amount transfers', async function () {
            await oftA.mint(ownerA.address, ethers.utils.parseEther('1'))
            
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

            const [nativeFee] = await oftA.quoteSend(sendParam, false)
            await oftA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })

            const finalBalanceA = await oftA.balanceOf(ownerA.address)
            const finalBalanceB = await oftB.balanceOf(ownerB.address)

            expect(finalBalanceA.toString()).to.equal(ethers.utils.parseEther('1').toString())
            expect(finalBalanceB.toString()).to.equal('0')
        })

        it('should handle large amounts', async function () {
            const largeAmount = ethers.utils.parseEther('1000000')
            await oftA.mint(ownerA.address, largeAmount)

            const tokensToSend = ethers.utils.parseEther('100000')

            const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

            const sendParam = [
                eidB,
                ethers.utils.zeroPad(ownerB.address, 32),
                tokensToSend,
                tokensToSend,
                options,
                '0x',
                '0x',
            ]

            const [nativeFee] = await oftA.quoteSend(sendParam, false)
            await oftA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })

            const finalBalanceA = await oftA.balanceOf(ownerA.address)
            const finalBalanceB = await oftB.balanceOf(ownerB.address)

            expect(finalBalanceA.toString()).to.equal(largeAmount.sub(tokensToSend).toString())
            expect(finalBalanceB.toString()).to.equal(tokensToSend.toString())
        })
    })
})
