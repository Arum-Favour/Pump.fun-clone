const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function () {
    const FEE = ethers.parseUnits("0.01", 18);


    async function deployFactoryFixture() {
        // Fetch accounts
        const [deployer] = await ethers.getSigners();
        // Fetch the contract
        const Factory = await ethers.getContractFactory("Factory")
        // Deploy the contract
        const factory = await Factory.deploy(FEE);
        return { factory, deployer }
    }

    describe("deployment", function () {
        it("should set a fee", async function () {
            const { factory } = await loadFixture(deployFactoryFixture)
            expect(await factory.i_fee()).to.equal(FEE)
        })

        it("should set the Owner", async function () {
            const { factory, deployer } = await loadFixture(deployFactoryFixture);
            expect(await factory.owner()).to.equal(deployer.address);
        })
    })
})
