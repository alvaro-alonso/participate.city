import Web3 from "web3";
import VotingArtifact from "../../build/contracts/Voting.json";

const App = {
  web3: null,
  account: null,
  candidates: ['Rama', 'Nick', 'Jose'],
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VotingArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        VotingArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      this.getVotes();

    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  getVotes: async function() {
    const { totalVotesFor } = this.meta.methods;
    const balanceTable = document.getElementById("voteTable");

    const results = await Promise.all(this.candidates.map((candidate) => totalVotesFor(Web3.utils.asciiToHex(candidate)).call()))
    balanceTable.innerHTML = '';
    let rowNum = 0;
    for (const votes of results) {
      const row = balanceTable.insertRow(rowNum);
      const nameCell = row.insertCell(0);
      const balanceCell = row.insertCell(1);
      nameCell.innerHTML = this.candidates[rowNum];
      balanceCell.innerHTML = votes;
      rowNum += 1;
    }
  },

  voteFor: async function() {
    const input = document.getElementById("candidate");
    const candidate = input.value;
    console.log(candidate, this.candidates);
    if (this.candidates.includes(candidate)) {
      this.setStatus('Your vote is being processed, have some patience');
      const { voteForCandidate } = this.meta.methods;
      await voteForCandidate(Web3.utils.asciiToHex(candidate)).send({ from: this.account });
      this.setStatus('Your vote has been processed');
    } else {
      this.setStatus(`Wrong candidate. Please choose between ${this.candidates}`);
    }

    await this.getVotes();
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },
};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
    );
  }

  App.start();

});
