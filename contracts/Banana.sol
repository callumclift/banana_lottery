pragma solidity ^0.6.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

//will inherit from ERC20 & ERC20Detailed - allows us to create an ERC20 token very quickly
contract Banana is ERC20 {
    //call the constructor of ERC20Detailed and pass it the ticker, name and number of decimals
    constructor() ERC20('BANANA', 'Banana token') public {}
    
    function faucet(address to, uint amount) external {
    _mint(to, amount);
  }
}