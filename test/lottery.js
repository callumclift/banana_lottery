const { expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const Lottery = artifacts.require('Lottery.sol');
const Banana = artifacts.require('Banana.sol');

contract('Lottery', (accounts) => {
    let lottery, banana;
    beforeEach(async () => {
        lottery = await Lottery.new();
        banana = await Banana.new();
        //web3.eth.sendTransaction({from: accounts[0], to: lottery.address, value: 1000});
        const amount = web3.utils.toWei('1000000');
        await banana.faucet(accounts[0], amount);
        await lottery.setBananaAddress(banana.address);
    });

    it('it should not allow non admins to set banana fee', async () => {
        await banana.approve(
                    lottery.address,
                    2,
                    {from: accounts[0]}
                );
        await lottery.deposit({from: accounts[0]});
        //await expectRevert(lottery.setBananaFee(10, {from: accounts[1]}), 'no banana in balance');
        //await lottery.setBananaFee(10, {from: accounts[1]});  
    });

    // it('should allow users with bananas to deposit', async () => {
    //     await banana.approve(
    //         lottery.address,
    //         amount,
    //         {from: accounts[0]}
    //     );
    //     await lottery.deposit({from: accounts[0]})
    // });

    // it('should NOT allow users with no bananas to deposit', async () => {
    //     await expectRevert(lottery.deposit({from: accounts[1]}), 'no banana in balance');
    // });
});

