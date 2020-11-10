import React from "react";
import { Link } from "react-router-dom";

import backgroundImg from '../images/abstract_network.jpg'

const header = () => {
  return (
    <div class="bgded overlay light" style={{ backgroundImage: 'url(' + backgroundImg + ')' }} >
      {/* <!-- ################################################################################################ --> */}
      <div class="wrapper row1">
        <header id="header" class="hoc clear">
          {/* <!-- ################################################################################################ --> */}
          <div id="logo" class="fl_left">
            <h1><Link to="/">participate.city</Link></h1>
          </div>
          <nav id="mainav" class="fl_right">
        <ul class="clear">
          <li><a class="drop" href="!#" >Technology</a>
            <ul>
              <li><a href="https://github.com/alvaro-alonso/participate.city/blob/tree/master/white_paper/participate_city_whitepaper.pdf">White Paper</a></li>
            </ul>
          </li>
          {/*
          <li><a class="drop" href="#">Technology</a>
            <ul>
              <li><a href="#">Level 2</a></li>
              <li><a class="drop" href="#">Level 2 + Drop</a>
              <ul>
                <li><a href="#">Level 3</a></li>
                <li><a href="#">Level 3</a></li>
                <li><a href="#">Level 3</a></li>
              </ul>
              </li>
              <li><a href="#">Level 2</a></li>
            </ul>
          </li>
          */}
          <li><a class="drop" href="!#">Application</a>
          <ul>
            <li><Link to="/deploy_election" >Create An Election</Link></li>
            <li><Link to="/vote" >Cast A Vote</Link></li>
          </ul>
          </li>
        </ul>
        </nav>
          {/* <!-- ################################################################################################ --> */}
        </header>
      </div>
      {/* <!-- ################################################################################################ --> */}
      <div id="pageintro" class="hoc clear">
        <article>
          {/* <h3 class="heading">Participate.city</h3> */}
          <h4 class="heading">secure and anonymous online voting</h4>
          {/* <footer><Link to='/app'><a class="btn" href="#">Go to Application</a></Link></footer> */}
        </article>
      </div>
      {/* <!-- ################################################################################################ --> */}
    </div>
  );
}

export default header;