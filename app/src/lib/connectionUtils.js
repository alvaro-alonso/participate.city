import web3 from "web3";


export const start = async (artifact, artifactAddress) => {

  try {
    // get contract instance
    if (window.ethereum) {
      // use MetaMask's provider
      const provider = new web3(window.ethereum);
      await window.ethereum.enable();
      console.log('ethereum detected');
      const networkId = await provider.eth.net.getId();
      const deployedNetwork = artifact.networks[networkId];
      const address = artifactAddress || deployedNetwork.address;
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
    } else {
      return new web3( web3.currentProvider || "http://127.0.0.1:7545" );
    }
  } catch (error) {
    console.error("Could not connect to contract or chain.");
    console.error(error);
  }
}