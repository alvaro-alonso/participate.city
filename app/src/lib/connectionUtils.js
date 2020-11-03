import web3 from "web3";

const web3Provider = async () => {
  if (window.ethereum) {
    // use MetaMask's provider
    const prov = new web3(window.ethereum);
    await window.ethereum.enable();
    console.log('ethereum detected');
    return prov;
  } else {
    return new web3( web3.currentProvider || "http://127.0.0.1:7545" );
  }
} 

export const start = async (artifact, artifactAddress) => {

  try {
    // get contract instance
    const provider = await web3Provider();
    const networkId = await provider.eth.net.getId();
    console.log(networkId);
    const deployedNetwork = artifact.networks[networkId];
    const address = artifactAddress || deployedNetwork.address;
    console.log(`network: ${networkId}\ndeployedNetwork: ${deployedNetwork}`);
    // get accounts
    const accounts = await provider.eth.getAccounts();
    return {
      provider,
      artifact: new provider.eth.Contract(
        artifact.abi,
        address,
      ),
      artifactAddress: address,
      account: accounts[0],
    };
  } catch (error) {
    console.error("Could not connect to contract or chain.");
    console.error(error);
  }
}