import web3 from "web3";

export const web3Provider = (provider) => {
  if (!provider) {
    if (window.ethereum) {
      // use MetaMask's provider
      const prov = new web3(window.ethereum);
      window.ethereum.enable();
      console.log('ethereum detected');
      return prov;
    } else {
      return new web3( web3.currentProvider || "http://127.0.0.1:7545" );
    }
  } else {
    return provider;
  }
} 

export const start = async (provider, artifact, artifactAddress) => {

  try {
    // get contract instance
    const networkId = await provider.eth.net.getId();
    const deployedNetwork = artifact.networks[networkId];
    const address = artifactAddress || deployedNetwork.address;
    console.log(`network: ${networkId}\ndeployedNetwork: ${deployedNetwork}`);
    // get accounts
    const accounts = await provider.eth.getAccounts();
    return {
      meta: new provider.eth.Contract(
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