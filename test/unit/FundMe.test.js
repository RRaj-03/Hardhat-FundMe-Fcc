const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { DevelopmentChains } = require("../../helper-hardhat-config")
!DevelopmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe, MockV3Aggregator
          let deployer
          const sendValue = ethers.parseEther("1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", async function () {
              it("sets the pricefeed address correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  const address = await MockV3Aggregator.getAddress()
                  assert.equal(response, address)
              })
          })
          describe("fund", async function () {
              it("It fails when not send enough eth", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("Updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(parseInt(response), parseInt(sendValue))
              })
              it("Adds funder to Funders array", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunder(0)
                  assert.equal(response, deployer)
              })
          })
          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("Withdraw eth from a single funder", async function () {
                  const startingFundMeBalance =
                      await fundMe.runner.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const startingDeployerBalance =
                      await fundMe.runner.provider.getBalance(deployer)
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const endingFundMeBallance =
                      await fundMe.runner.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const endingDeployerBalance =
                      await fundMe.runner.provider.getBalance(deployer)
                  assert.equal(parseInt(endingFundMeBallance), 0)
                  assert.equal(
                      (
                          startingDeployerBalance + startingFundMeBalance
                      ).toString(),
                      (
                          endingDeployerBalance +
                          transactionReceipt.gasUsed *
                              transactionReceipt.gasPrice
                      ).toString()
                  )
              })
              it("Withdraw eth from multiple funder", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 0; i < accounts.length; i++) {
                      const FundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await FundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.runner.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const startingDeployerBalance =
                      await fundMe.runner.provider.getBalance(deployer)
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const endingFundMeBallance =
                      await fundMe.runner.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const endingDeployerBalance =
                      await fundMe.runner.provider.getBalance(deployer)
                  assert.equal(parseInt(endingFundMeBallance), 0)
                  assert.equal(
                      (
                          startingDeployerBalance + startingFundMeBalance
                      ).toString(),
                      (
                          endingDeployerBalance +
                          transactionReceipt.gasUsed *
                              transactionReceipt.gasPrice
                      ).toString()
                  )
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  for (let i = 0; i < accounts.length; i++) {
                      assert.equal(
                          0,
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          )
                      )
                  }
              })
              it("Only allows owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const AttackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      AttackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })
          // describe("Cheaperwithdraw", async function () {
          //     beforeEach(async function () {
          //         await fundMe.fund({ value: sendValue })
          //     })
          //     it("Withdraw eth from a single funder", async function () {
          //         const startingFundMeBalance =
          //             await fundMe.runner.provider.getBalance(
          //                 await fundMe.getAddress()
          //             )
          //         const startingDeployerBalance =
          //             await fundMe.runner.provider.getBalance(deployer)
          //         const transactionResponse = await fundMe.CheaperWithdraw()
          //         const transactionReceipt = await transactionResponse.wait(1)

          //         const endingFundMeBallance =
          //             await fundMe.runner.provider.getBalance(
          //                 await fundMe.getAddress()
          //             )
          //         const endingDeployerBalance =
          //             await fundMe.runner.provider.getBalance(deployer)
          //         assert.equal(parseInt(endingFundMeBallance), 0)
          //         assert.equal(
          //             (startingDeployerBalance + startingFundMeBalance).toString(),
          //             (
          //                 endingDeployerBalance +
          //                 transactionReceipt.gasUsed * transactionReceipt.gasPrice
          //             ).toString()
          //         )
          //     })
          //     it("Withdraw eth from multiple funder", async function () {
          //         const accounts = await ethers.getSigners()
          //         for (let i = 0; i < accounts.length; i++) {
          //             const FundMeConnectedContract = await fundMe.connect(
          //                 accounts[i]
          //             )
          //             await FundMeConnectedContract.fund({ value: sendValue })
          //         }
          //         const startingFundMeBalance =
          //             await fundMe.runner.provider.getBalance(
          //                 await fundMe.getAddress()
          //             )
          //         const startingDeployerBalance =
          //             await fundMe.runner.provider.getBalance(deployer)
          //         const transactionResponse = await fundMe.CheaperWithdraw()
          //         const transactionReceipt = await transactionResponse.wait(1)
          //         const endingFundMeBallance =
          //             await fundMe.runner.provider.getBalance(
          //                 await fundMe.getAddress()
          //             )
          //         const endingDeployerBalance =
          //             await fundMe.runner.provider.getBalance(deployer)
          //         assert.equal(parseInt(endingFundMeBallance), 0)
          //         assert.equal(
          //             (startingDeployerBalance + startingFundMeBalance).toString(),
          //             (
          //                 endingDeployerBalance +
          //                 transactionReceipt.gasUsed * transactionReceipt.gasPrice
          //             ).toString()
          //         )
          //         await expect(fundMe.getFunder(0)).to.be.reverted
          //         for (let i = 0; i < accounts.length; i++) {
          //             assert.equal(
          //                 0,
          //                 await fundMe.getAddressToAmountFunded(accounts[i].address)
          //             )
          //         }
          //     })
          //     it("Only allows owner to CheaperWithdraw", async function () {
          //         const accounts = await ethers.getSigners()
          //         const attacker = accounts[1]
          //         const AttackerConnectedContract = await fundMe.connect(attacker)
          //         await expect(
          //             AttackerConnectedContract.CheaperWithdraw()
          //         ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
          //     })
          // })
      })
