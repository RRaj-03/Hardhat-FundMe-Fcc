const { network } = require("hardhat")
const { networkConfig, DevelopmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/Verify")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let EthUsdPriceFeedAddress
    if (DevelopmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        EthUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        EthUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [EthUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmation: network.config.blockConfirmation || 1,
    })
    if (
        !DevelopmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("---------------------------------")
}
module.exports.tags = ["all", "fundme"]
