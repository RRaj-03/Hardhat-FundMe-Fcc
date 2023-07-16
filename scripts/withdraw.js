const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundme = await ethers.getContract("FundMe", deployer)
    console.log("Withdrawing from Contract....")
    const transactionResponse = await fundme.withdraw()
    await transactionResponse.wait(1)
    console.log("Withdrawn!")
}
main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log(err)
        process.exit(1)
    })
