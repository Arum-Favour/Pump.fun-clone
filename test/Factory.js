const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function () {

    it("should have a name", async function () {
        // Fetch the contract
        const Factory = await ethers.getContractFactory("Factory")
        // Deploy the contract
        const factory = await Factory.deploy()
        //check the name
        const name = await factory.name()
        console.log(name);
    })
})
