const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function () {
    const FEE = ethers.parseUnits("0.01", 18);


    async function deployFactoryFixture() {
        // Fetch accounts
        const [deployer, creator, buyer] = await ethers.getSigners();
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
        return { factory, token, deployer, creator, buyer }
    }

    async function buyTokenFixture() {
        const { factory, token, creator, buyer } = await deployFactoryFixture();

        const AMOUNT = ethers.parseUnits("10000", 18);
        const COST = ethers.parseUnits("1", 18);

        //Buy Tokens
        const transaction = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST });
        await transaction.wait();
        return { factory, token, creator, buyer }
    }

    describe("Deployment", function () {
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
    describe("Buying", function () {
        const AMOUNT = ethers.parseUnits("10000", 18);
        const COST = ethers.parseUnits("1", 18);

        //check contract received the ETH
        it("should update the ETH balance", async function () {
            const { factory } = await loadFixture(buyTokenFixture);

            const balance = await ethers.provider.getBalance(await factory.getAddress());

            expect(balance).to.equal(FEE + COST);
        })

        //Check that buyer received tokens
        it("Should update token balances", async function () {
            const { token, buyer } = await loadFixture(buyTokenFixture);
            const balance = await token.balanceOf(buyer.address);
            expect(balance).to.equal(AMOUNT);
        })

        it("should update the token sale", async function () {
            const { factory, token } = await loadFixture(buyTokenFixture);

            const sale = await factory.tokenToSale(await token.getAddress());

            expect(sale.sold).to.equal(AMOUNT);
            expect(sale.raised).to.equal(COST);
            expect(sale.isOpen).to.equal(true);
        })

        it("should increase base cost", async function () {
            const { factory, token } = await loadFixture(buyTokenFixture);

            const sale = await factory.tokenToSale(await token.getAddress());
            const cost = await factory.getCost(sale.sold);

            expect(cost).to.be.equal(ethers.parseUnits("0.0002"));
        })
    })

    describe("Depositing", function () {
        const AMOUNT = ethers.parseUnits("10000", 18);
        const COST = ethers.parseUnits("2", 18);

        it("Sale should be closed and successfully deposited", async function () {
            const { factory, token, buyer, creator } = await loadFixture(buyTokenFixture);

            //Buy tokens again to reach target
            const buyTx = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST });
            await buyTx.wait();

            const sale = await factory.tokenToSale(await token.getAddress());
            expect(sale.isOpen).to.equal(false);

            const depositTx = await factory.connect(creator).deposit(await token.getAddress());
            await depositTx.wait();

            const balance = await token.balanceOf(creator.address);
            expect(balance).to.equal(ethers.parseUnits("980000", 18));
        })
    })
})


