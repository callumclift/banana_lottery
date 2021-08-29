import Web3 from 'web3';
//contract artifact of our DEX - these are produced every time we compile our smart contracts or we deploy them
import Lottery from './contracts/Lottery.json';
import Banana from './contracts/Banana.json';


const getWeb3 = () => {
  return new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log("Injected web3 detected.");
        resolve(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider(
          "http://localhost:9545"
        );
        const web3 = new Web3(provider);
        console.log("No web3 instance injected, using Local web3.");
        resolve(web3);
      }
    });
  });
};
  
const getLottery = async web3 => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Lottery.networks[networkId];
    return new web3.eth.Contract(
      Lottery.abi,
      deployedNetwork && deployedNetwork.address,
      );
  };

  const getBanana = async web3 => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Banana.networks[networkId];
    return new web3.eth.Contract(
      Banana.abi,
      deployedNetwork && deployedNetwork.address,
      );
  };

  const disconnect = async web3 => {
    await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [
        {
          eth_accounts: {}
        }
      ]
    });
  }

  const connect = async web3 => {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [
        {
          eth_accounts: {}
        }
      ]
    });
  }
  
  export { getWeb3, getLottery, getBanana, disconnect, connect };
