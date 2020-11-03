import React from "react";
import { Link } from "react-router-dom";

import backgroundImg from '../images/abstract_network.jpg'
import speakerImg from '../images/speaker.png';
import voteImg from '../images/vote.png';

const home = () => {
  return (<>
    <div class="wrapper row2">
      <main class="hoc container clear"> 
        <div class="group excerpt">
          <article class="one_half first">
            <div class="btmspace-30"><img src={speakerImg} alt=""/></div>
            <h6 class="heading">Organize an election</h6>
            <p>Decide the subject and the eligible voters of the election.
              Each vote is unique and inmutable as it is stored on the blockchain.
              Assess any time the results of the election
              &hellip;
            </p>
            <footer><Link to='/deploy_election'><button class="btn">Create Election</button></Link></footer>
            {/* <footer><a href="#">Service Details &raquo;</a></footer> */}
          </article>
          <article class="one_half">
            <div class="btmspace-30" ><img src={voteImg} alt=""/></div>
            <h6 class="heading">cast a ballot</h6>
            <p>As an eligible voter cast your ballot anonymously.
              Scrutinize at any time the results of the elections.
              The only requirement is an ethereum address &hellip;
            </p>
            <footer><Link to='/vote'><button class="btn">Vote</button></Link></footer>
          </article>
        </div>
      </main>
    </div>

    <div class="wrapper row3 bgded overlay" style={{backgroundImage: 'url(' + backgroundImg + ')'}} >
      <section class="hoc container clear"> 
        {/* <!-- ################################################################################################ --> */}
        <div class="sectiontitle">
          <h6 class="heading">The benefits of participate.city</h6>
          {/* <p>using participate.city has multiple advantages</p> */}
        </div>
        <ul class="nospace group overview">
          <li class="one_third">
            <article><i class="fa fa-shield"></i>
              <h6 class="heading">Secure</h6>
              <p>
                Votes are stored on the blockchain, thus each ballot is unique and inmutable once casted.
              </p>
              {/* <footer><a href="#">View Details &raquo;</a></footer> */}
            </article>
          </li>
          <li class="one_third">
            <article><i class="fa fa-user-secret"></i>
              <h6 class="heading">  Anonimity  </h6>
              <p>
                Voters collect their ballots with a zero knowledge proof of identity.
                the election is public, but the account can not be traced to an individual.
              </p>
              {/* <footer><a href="#">View Details &raquo;</a></footer> */}
            </article>
          </li>
          <li class="one_third">
            <article>  <i class="fa fa-eye"></i>  
              <h6 class="heading">  Transparent  </h6>
              <p>
                Votes are stored on Ethereum, allowing anyone to assess the result of the election.
              </p>
              {/* <footer><a href="#">View Details &raquo;</a></footer> */}
            </article>
          </li>
          <li class="one_third">
            <article>  <i class="fa fa-lock"></i>  
              <h6 class="heading">  Trustless  </h6>
              <p>
                Ballots are stored on the blockchain and the applications logic is implemented in smart contracts.
                No additional server in between or hidden steps.
              </p>
              {/* <footer><a href="#">View Details &raquo;</a></footer> */}
            </article>
          </li>
          
          <li class="one_third">
            <article>  <i class="fa fa-address-card-o"></i>  
              <h6 class="heading">  Authorized  </h6>
              <p>
                As an organizer decide who is allowed to participate in the election.
                Only users which proof eligibility (PoE) will receive a ballot.
              </p>
              {/* <footer><a href="#">View Details &raquo;</a></footer> */}
            </article>
          </li>

          <li class="one_third">
            <article>  <i class="fa fa-gears"></i>  
              <h6 class="heading">  Simple and Efficient  </h6>
              <p>The whole process blockchains and zero knowledge proofs to deliver fast and easy to understand process</p>
              {/* <footer><a href="#">View Details &raquo;</a></footer> */}
            </article>
          </li>
        </ul>
        {/* <footer class="center"><Link to='/app'><a class="btn" href="#">Go to Application</a></Link></footer> */}
        {/* <!-- ################################################################################################ --> */}
      </section>
    </div>
  </>);
}

export default home;