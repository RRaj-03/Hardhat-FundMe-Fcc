const { ethers, getNamedAccounts, network } = require("hardhat")
const { DevelopmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")
DevelopmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundme
          let deployer
          const sendValue = ethers.parseEther("0.2")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundme = await ethers.getContract("FundMe", deployer)
          })
          it("allows people to fund and withdraw", async function () {
              await fundme.fund({ value: sendValue })
              await fundme.withdraw()
              const endingBalance = await fundme.runner.provider.getBalance(
                  await fundme.getAddress()
              )
              assert.equal(0, parseInt(endingBalance))
          })
      })
