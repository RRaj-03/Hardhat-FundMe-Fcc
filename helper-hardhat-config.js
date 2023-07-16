const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
}
const DevelopmentChains = ["hardhat", "localhost"]
const Decimals = 8
const InitaialAnswer = 200000000000
module.exports = {
    Decimals,
    InitaialAnswer,
    networkConfig,
    DevelopmentChains,
}
