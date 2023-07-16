const { network } = require("hardhat")
const {
    DevelopmentChains,
    Decimals,
    InitaialAnswer,
} = require("../helper-hardhat-config")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    if (DevelopmentChains.includes(network.name)) {
        log("Loacal network Detected. Deploying Mocks....")
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [Decimals, InitaialAnswer],
        })
        log("Mocks Deployed")
        log("--------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
