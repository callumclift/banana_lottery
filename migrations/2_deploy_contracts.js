const Banana = artifacts.require('Banana.sol');
const Lottery = artifacts.require('Lottery.sol');

module.exports = async function(deployer, network, accounts) {

    await Promise.all(
        [Banana, Lottery].map(contract => deployer.deploy(contract))
        );

    const [banana, lottery] = await Promise.all(
        [Banana, Lottery].map(contract => contract.deployed())
    );

    //create an amount of 1000 tokens that we convert to Wei
    const amount = web3.utils.toWei('1000000');
    await banana.faucet(accounts[0], amount);

    await lottery.setBananaAddress(banana.address);

}