import React from 'react';
import { Link } from "react-router-dom";

import './App.css';


class Deployer extends React.Component {

  constructor(props) {
    super(props);
    this.meta = props.meta;
    this.state = { 
      status: '',
      candidates: [],
    };
    console.log(props);
  }

  updateCandidate(event){
    this.setState({inputedCandidate : event.target.value})
  }

  updateBudget(event){
    const budget = parseInt(event.target.value);
    if (Number.isNaN(budget)){
      this.setState({
        budget: undefined,
        status: 'budget must be and integer'});
    } else {
      this.setState({
        budget,
        status: '',
      });
    }
  }

  addCandidate() {
    let { inputedCandidate, candidates } = this.state;
    console.log(inputedCandidate, candidates);
    candidates.push(inputedCandidate);
    this.setState({
      candidates,
      inputedCandidate: '',
    });
  }

  async deploy() {
    const { budget, candidates } = this.state;
    const { deployElection } = this.meta.methods;
    if (budget && candidates.length > 0) {
      await deployElection(candidates, budget);
    }
  }

  render() {
    return (
      <div>
        <h1>Deployer</h1>

        <p>{this.state.status}</p>

        <div className="container">
          <p>election budget:</p>
          <input type="text" id="budget" onChange={this.updateBudget.bind(this)} placeholder="elections budget"></input>
        </div>

        <div className="container" id="candidates">
          <p>candidates</p>
          <input type="text" id="candidate" value={this.state.inputedCandidate} onChange={this.updateCandidate.bind(this)} placeholder="choose a candidate" />
          <button onClick={this.addCandidate.bind(this)}>add</button>
          {this.state.candidates.length > 0? <ul>{this.state.candidates.map(candidate => <li key={candidate}>{candidate}</li>)}</ul> : null}
        </div>

        <button onClick={this.deploy.bind(this)}>Deploy</button>
        <Link to="/" ><button>Home</button></Link>
      </div>
    );
  }
}

  
export default Deployer;
