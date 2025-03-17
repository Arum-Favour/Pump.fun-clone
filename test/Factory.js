const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function () {

    async function deployFactoryFixture() {
        // Fetch the contract
        const Factory = await ethers.getContractFactory("Factory")
        // Deploy the contract
        const factory = await Factory.deploy()
        return { factory }
    }
})
