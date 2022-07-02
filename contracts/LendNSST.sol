pragma solidity ^0.8.1;
import "./SafeMath.sol";
// 0x2DD44A5882E66f3AD757505cAA858679E39DB750

contract NotSoStable {
    function mint(address to, uint256 amount) public {}
    function burn(address from, uint256 amount) public {}
}

contract LendNSST is NotSoStable {
    using SafeMath for uint256;

    struct userStatus {
        uint256 colleteral;
        uint256 debt;
    }
    address coinContractAddress = 0x03CB0E12B4466A6b5c5D7815D26C267D2B8d2c7C;
    uint256 val = 1;
    mapping(address => userStatus) public status;
    NotSoStable coinContract;
    // just for simplicity now 
    uint256 colleterizationRatio = val.mul(1).div(1);

    modifier checkTokenBalance(uint256 _tokens) {
        require(status[msg.sender].debt >= _tokens, "Not enough tokens");
        _;
    }

    constructor() {
        coinContract = NotSoStable(coinContractAddress);
    }

    // we pegged 1NSST coin equals to 1 USD
    // considering collaterization ration = 0.75
    function depositEther(uint256 _amountInUSD) public payable {
        status[msg.sender].debt += _amountInUSD;
        status[msg.sender].colleteral += msg.value; 
        coinContract.mint(msg.sender, 1000000000000000000 * (_amountInUSD));
    }

    function withDrawEther(uint256 _repayEth, uint256 _tokens) public {
        status[msg.sender].debt -= _tokens;
        status[msg.sender].colleteral -= _repayEth;
        coinContract.burn(msg.sender, 1000000000000000000 * (_tokens));
        payable(msg.sender).transfer(_repayEth);
    }

    function getName() public pure returns (string memory) {
        return "LendNSST";
    }

    receive() external payable {

    }

    fallback() external {

    }
}