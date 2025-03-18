const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function () {
    const FEE = ethers.parseUnits("0.01", 18);


    async function deployFactoryFixture() {
        // Fetch accounts
        const [deployer, creator] = await ethers.getSigners();
        // Fetch the contract
        const Factory = await ethers.getContractFactory("Factory")
        // Deploy the contract
        const factory = await Factory.deploy(FEE);

        //Create tOKEN
        const transaction = await factory.connect(creator).create("Test Token", "TT", { value: FEE });
        await transaction.wait();

        //Get the token Address
        const tokenAddress = await factory.tokens(0);
        const token = await ethers.getContractAt("Token", tokenAddress);
        return { factory, token, deployer, creator }
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

    describe("Creating", async function () {
        it("should set the owner", async function () {
            const { factory, token } = await loadFixture(deployFactoryFixture);
            expect(await token.owner()).to.equal(await factory.getAddress());
        })

        it("should set the creator", async function () {
            const { token, creator } = await loadFixture(deployFactoryFixture);
            expect(await token.creator()).to.equal(creator.address);
        })

        it("should set the supply", async function () {
            const { factory, token } = await loadFixture(deployFactoryFixture);
            const totalSupply = ethers.parseUnits("1000000", 18)
            expect(await token.balanceOf(await factory.getAddress())).to.equal(totalSupply)
        })

        it("should update the ETH balance", async function () {
            const { factory } = await loadFixture(deployFactoryFixture);

            const balance = await ethers.provider.getBalance(await factory.getAddress());
            expect(balance).to.equal(FEE);
        })

        it("should create the sale", async function () {
            const { factory, token, creator } = await loadFixture(deployFactoryFixture);

            const count = await factory.totalTokens();
            expect(count).to.equal(1)

            const sale = await factory.getTokenSale(0)

            expect(sale.token).to.equal(await token.getAddress());
            expect(sale.creator).to.equal(creator.address);
            expect(sale.sold).to.equal(0);
            expect(sale.raised).to.equal(0);
            expect(sale.isOpen).to.equal(true);
        })
    })
})
