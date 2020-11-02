import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Finder from './Finder';
import Deployer from "./Deployer";
import Election from './Election';

import './style/layout.css';
import { Header, Home, Footer } from './components'


export default function App (props) {

  return(<>
    <Router>
      <Header />

      <Switch>
        <Route path="/deploy_election" children={<Deployer />} ></Route>
        <Route path="/vote" children={<Finder />} ></Route>
        <Route path="/election/:id" children={<Election />} ></Route>
        <Route path="/" children={<Home />} ></Route>
      </Switch>

      <Footer />

      {/* <!-- ################################################################################################ --> */}
      <a id="backtotop" href="#top"><i class="fa fa-chevron-up"></i></a>
      {/* <!-- JAVASCRIPTS -<!DOCTYPE html> */}
      {/* <script src="layout/scripts/jquery.min.js"></script>
      <script src="layout/scripts/jquery.backtotop.js"></script>
      <script src="layout/scripts/jquery.mobilemenu.js"></script> */}
    </Router>
  </>);
}