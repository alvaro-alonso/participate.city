import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Finder from './Finder';
import Deployer from "./Deployer";

import './style/layout.css';
import { header, actions, argument, footer } from './layout'


export default function Home (props) {

  // function showInfoPage(props) {
  //   const { infoPage } = props;
  //   if (infoPage) {
  //     return <>
  //       {actions}
  //       {argument}
  //       {footer}
  //     </>
  //   } else {
  //     return <></>;
  //   }
  // }

  return(<>
    <Router>
      {header} 
      {actions}
      {argument}
      {footer} 

      <div>
        <Switch>
          {/* <Route path="/election/:id" children={<Election provider={provider} />} ></Route> */}
          <Route path="/deploy_election" children={<Deployer />} ></Route>
          {/* <Route path="/" onClick={showSearch} ></Route> */}
        </Switch>
      </div>
      {/* <!-- ################################################################################################ -->
      <!-- ################################################################################################ -->
      <!-- ################################################################################################ --> */}
      <a id="backtotop" href="#top"><i class="fa fa-chevron-up"></i></a>
      {/* <!-- JAVASCRIPTS -<!DOCTYPE html> */}
      <script src="layout/scripts/jquery.min.js"></script>
      <script src="layout/scripts/jquery.backtotop.js"></script>
      <script src="layout/scripts/jquery.mobilemenu.js"></script>
    </Router>
  </>);
}