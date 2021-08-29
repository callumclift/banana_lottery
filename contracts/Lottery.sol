// SPDX-License-Identifier: MIT
pragma solidity 0.6.6;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract Lottery is VRFConsumerBase {
    
   
    
    bytes32 internal keyHash;
    uint256 internal fee;
    
    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }
    
    //add a mapping array of previous winners with the amount that they won
    
    address public admin;
    address [] public playerList;
    uint public bananaBalance;
    uint public bananaFee = 2;
    uint public lotteryId;
    uint public randomNumber;
    address public bananaAddress;
    struct LotteryResult {
        address addr;
        uint winnings;
        uint date;
    }
    mapping(uint => LotteryResult) public lotteryResults;
    
    /**
     * Constructor inherits VRFConsumerBase
     * 
     * Network: Binance Smart Chain Testnet
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     */
    constructor() 
        VRFConsumerBase(
            0xa555fC018435bef5A13C6c6870a9d4C11DEC329C, // VRF Coordinator
            0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06  // LINK Token
        ) public
    {
        keyHash = 0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186;
        fee = 0.1 * 10 ** 18; // 0.1 LINK
        admin = msg.sender;
    }
    
    function deposit()
        external {
            require(IERC20(bananaAddress).balanceOf(msg.sender) > 2, 'insufficient banana balance');
            bool canDeposit = true;
            for (uint i = 0; i < playerList.length; i++) {
                if(playerList[i] == msg.sender){
                    canDeposit = false;
                }
            }
            require(canDeposit == true, 'already entered this round');
            IERC20(bananaAddress).transferFrom(
                msg.sender,
                address(this),
                2 * 10 ** 18
            );
            bananaBalance = bananaBalance.add(bananaFee);
            playerList.push(msg.sender);
    }
    
    function completeRound()
        onlyAdmin()
        external {
        randomNumber=random()%playerList.length;
        address winningAddress = playerList[randomNumber];
        IERC20(bananaAddress).transfer(winningAddress, bananaBalance * 10 ** 18);
        lotteryResults[lotteryId] = LotteryResult(
            winningAddress,
            bananaBalance,
            block.timestamp);
        lotteryId = lotteryId.add(1);
        bananaBalance = 0;
        randomNumber = 0;
        delete playerList;

    }

    function getBananaFee() external view returns(uint){
        return bananaFee;
    }

    function getPlayerList() external view returns(address[] memory){
        return playerList;
    }
    
 
    
    function setBananaFee(uint amount) onlyAdmin() external {
        bananaFee = amount;
    }

    function setBananaAddress(address addr) onlyAdmin() external {
        bananaAddress = addr;
    }

    //just need to send ether to the address of the smart contract
    receive() external payable {}
    
    /** 
     * Requests randomness 
     */
    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) > fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomNumber = randomness.mod(playerList.length -1);
    }


    function random() private view returns (uint) {
        // sha3 and now have been deprecated
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, playerList)));
        // convert hash to integer
        // players is an array of entrants
        
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, 'only admin');
        _;
    }
}