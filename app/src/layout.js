import React from 'react';
import { Link } from "react-router-dom";

import backgroundImg from './images/abstract_network.jpg'
import speakerImg from './images/speaker.png';
import voteImg from './images/vote.png';

export const header = <>
  <div class="bgded overlay light" style={{backgroundImage: 'url(' + backgroundImg + ')'}} > 
    {/* <!-- ################################################################################################ --> */}
    <div class="wrapper row1">
      <header id="header" class="hoc clear"> 
        {/* <!-- ################################################################################################ --> */}
        <div id="logo" class="fl_left">
          <h1><a href="index.html">participate.city</a></h1>
        </div>
        {/* <nav id="mainav" class="fl_right">
          <ul class="clear">
            <li><a class="drop" href="#">About</a>
              <ul>
                <li><a href="pages/gallery.html">Gallery</a></li>
                <li><a href="pages/full-width.html">Full Width</a></li>
                <li><a href="pages/sidebar-left.html">Sidebar Left</a></li>
                <li><a href="pages/sidebar-right.html">Sidebar Right</a></li>
                <li><a href="pages/basic-grid.html">Basic Grid</a></li>
              </ul>
            </li>
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
            <li><a class="drop" href="#">Application</a>
              <ul>
                <li><a href="pages/gallery.html">Create An Election</a></li>
                <li><a href="pages/full-width.html">Cast A Vote</a></li>
              </ul>
            </li>
          </ul>
        </nav> */}
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
</>;

export const actions = <>
  <div class="wrapper row2">
    <main class="hoc container clear"> 
      <div class="group excerpt">
        <article class="one_half first">
          <a class="imgover btmspace-30"><img src={speakerImg} alt=""/></a>
          <h6 class="heading">Organize an election</h6>
          <p>Decide the subject and the eligible voters of the election.
            Each vote is unique and inmutable as it is stored on the blockchain.
            Assess any time the results of the election
            &hellip;</p>
          {/* <footer><a href="#">Service Details &raquo;</a></footer> */}
        </article>
        <article class="one_half">
          <a class="imgover btmspace-30" href="#"><img src={voteImg} alt=""/></a>
          <h6 class="heading">cast a ballot</h6>
          <p>As an eligible voter cast your ballot anonymously.
            Scrutinize at any time the results of the elections.
            The only requirement is an ethereum address &hellip;</p>
          {/* <footer><a href="#">Service Details &raquo;</a></footer> */}
        </article>
      </div>
    </main>
  </div>
</>;

export const argument = <>
  <div class="wrapper row3 bgded overlay" style={{backgroundImage: 'url(' + backgroundImg + ')'}} >
    <section class="hoc container clear"> 
      {/* <!-- ################################################################################################ --> */}
      <div class="sectiontitle">
        <h6 class="heading">The benefits of participate.city</h6>
        {/* <p>using participate.city has multiple advantages</p> */}
      </div>
      <ul class="nospace group overview">
        <li class="one_third">
          <article><a href="#"><i class="fa fa-shield"></i></a>
            <h6 class="heading"><a href="#">Secure</a></h6>
            <p>
              Votes are stored on the blockchain, thus each ballot is unique and inmutable once casted.
            </p>
            {/* <footer><a href="#">View Details &raquo;</a></footer> */}
          </article>
        </li>
        <li class="one_third">
          <article><a href="#"><i class="fa fa-user-secret"></i></a>
            <h6 class="heading"><a href="#">Anonimity</a></h6>
            <p>
              Voters collect their ballots with a zero knowledge proof of identity.
              the election is public, but the account can not be traced to an individual.
            </p>
            {/* <footer><a href="#">View Details &raquo;</a></footer> */}
          </article>
        </li>
        <li class="one_third">
          <article><a href="#"><i class="fa fa-eye"></i></a>
            <h6 class="heading"><a href="#">Transparent</a></h6>
            <p>
              Votes are stored on Ethereum, allowing anyone to assess the result of the election.
            </p>
            {/* <footer><a href="#">View Details &raquo;</a></footer> */}
          </article>
        </li>
        <li class="one_third">
          <article><a href="#"><i class="fa fa-lock"></i></a>
            <h6 class="heading"><a href="#">Trustless</a></h6>
            <p>
              Ballots are stored on the blockchain and the applications logic is implemented in smart contracts.
              No additional server in between or hidden steps.
            </p>
            {/* <footer><a href="#">View Details &raquo;</a></footer> */}
          </article>
        </li>
        
        <li class="one_third">
          <article><a href="#"><i class="fa fa-address-card-o"></i></a>
            <h6 class="heading"><a href="#">Authorized</a></h6>
            <p>
              As an organizer decide who is allowed to participate in the election.
              Only users which proof eligibility (PoE) will receive a ballot.
            </p>
            {/* <footer><a href="#">View Details &raquo;</a></footer> */}
          </article>
        </li>

        <li class="one_third">
          <article><a href="#"><i class="fa fa-gears"></i></a>
            <h6 class="heading"><a href="#">Simple and Efficient</a></h6>
            <p>The whole process blockchains and zero knowledge proofs to deliver fast and easy to understand process</p>
            {/* <footer><a href="#">View Details &raquo;</a></footer> */}
          </article>
        </li>
      </ul>
      {/* <footer class="center"><Link to='/app'><a class="btn" href="#">Go to Application</a></Link></footer> */}
      {/* <!-- ################################################################################################ --> */}
    </section>
  </div>
</>;

export const footer = <>
  <div class="wrapper row4">
    <footer id="footer" class="hoc clear"> 
      {/* <!-- ################################################################################################ --> */}
      {/* <article class="one_quarter first">
        <h6 class="heading">background</h6>
        <p>Ullamcorper quam eleifend donec vulputate ligula vel lacus vulputate ac efficitur odio malesuada curabitur nec nisl ac sapien dictum.</p>
        <p>Scelerisque eget nec massa cras tristique sapien vel tortor varius a varius lacus&hellip;</p>
        <p class="nospace"><a href="#">Read More</a></p>
      </article> */}
      <div class="one_quarter">
        <h6 class="heading">About us:</h6>
        {/* <ul class="nospace btmspace-30 linklist contact">
          <li><i class="fa fa-map-marker"></i>
            <address>
            Street Name &amp; Number, Berlin, Postcode/Zip 
            </address>
          </li>
          <!-- <li><i class="fa fa-phone"></i> +00 (123) 456 7890</li>
          <li><i class="fa fa-envelope-o"></i> info@domain.com</li>
        </ul> */}
        <ul class="faico clear">
          <li><a href="#"><i class="fa fa-github"></i></a></li>
          {/* <li><a class="faicon-facebook" href="#"><i class="fa fa-facebook"></i></a></li>
          <li><a class="faicon-twitter" href="#"><i class="fa fa-twitter"></i></a></li>
          <li><a class="faicon-dribble" href="#"><i class="fa fa-dribbble"></i></a></li>
          <li><a class="faicon-linkedin" href="#"><i class="fa fa-linkedin"></i></a></li> */}
        </ul>
      </div>
      {/* <div class="one_quarter">
        <h6 class="heading">FAQ</h6>
        <ul class="nospace linklist">
          <li><a href="#">Egestas cursus purus</a></li>
          <li><a href="#">Quis rutrum est accumsan</a></li>
          <li><a href="#">Sed nunc commodo massa</a></li>
          <li><a href="#">Vel elit eleifend</a></li>
          <li><a href="#">Sollicitudin morbi feugiat</a></li>
        </ul>
      </div> */}
      {/* ################################################################################## --> */}
    </footer>
  </div>
  {/* <!-- ################################################################################################ --> */}
  {/* <!-- ################################################################################################ -->
  <!-- ################################################################################################ --> */}
  <div class="wrapper row5">
    <div id="copyright" class="hoc clear"> 
      {/* <!-- ################################################################################################ --> */}
      <p class="fl_left">Copyright &copy; 2020 - All Rights Reserved - <a href="#">participate.city</a></p>
      <p class="fl_right">Template by <a target="_blank" href="https://www.os-templates.com/" title="Free Website Templates">OS Templates</a></p>
      {/* <!-- ################################################################################################ --> */}
    </div>
  </div>
</>;