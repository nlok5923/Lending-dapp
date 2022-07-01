

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("performing deploy with the address", deployer.address);
  
    const token = await ethers.getContractFactory("LendNSST");
    const Token = await token.deploy();
    console.log("address ", Token.address);
  }
  
  main()
  .then(() => process.exit(0))
  .catch(error => {
  console.error(error);
  process.exit(1);
  });