require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.1",
  defaultNetwork: "goerli",
  networks: {
     hardhat: {},
     goerli: {
        url: process.env.API_URL,
        accounts: [process.env.PRIVATE_KEY]
     }
  },
  etherscan: {
    apiKey: process.env.ETH_KEY
  }
};