import React from "react";

import eth_image from "../images/eth-diamond.png";
import zkt_image from "../images/zokrates.png";
import ipfs_image from "../images/ipfs.png";
import fleek_image from "../images/fleek.jpg";
import react_image from "../images/react.png";

const footer = () => {
  return (
    <div>
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
              <li><a href="https://github.com/alvaro-alonso/participate.city"><i class="fa fa-github"></i></a></li>
              {/* <li><a class="faicon-facebook" href="#"><i class="fa fa-facebook"></i></a></li>
              <li><a class="faicon-twitter" href="#"><i class="fa fa-twitter"></i></a></li>
              <li><a class="faicon-dribble" href="#"><i class="fa fa-dribbble"></i></a></li>
              <li><a class="faicon-linkedin" href="#"><i class="fa fa-linkedin"></i></a></li> */}
            </ul>
          </div>
          <div class="one_quarter">
            <h6 class="heading">Powered By:</h6>
              <img class="stack-logo" src={ eth_image } alt="ethereum" />
              <img class="stack-logo" src={ zkt_image } alt="zokrates" />
              <img class="stack-logo" src={ ipfs_image } alt="ipfs" />
              <img class="stack-logo" src={ fleek_image } alt="fleek" />
              <img class="stack-logo" src={ react_image } alt="react" />
          </div>
          {/* ################################################################################## --> */}
        </footer>
      </div>
      <div class="wrapper row5">
        <div id="copyright" class="hoc clear"> 
          {/* <!-- ################################################################################################ --> */}
          <p class="fl_left">Copyright &copy; 2020 - All Rights Reserved - participate.city</p>
          <p class="fl_right">Template by <a href="https://www.os-templates.com/" title="Free Website Templates">OS Templates</a></p>
          {/* <!-- ################################################################################################ --> */}
        </div>
      </div>
    </div>
  );
}

export default footer;