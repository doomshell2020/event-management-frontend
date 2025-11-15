import React from 'react';
import { Row } from 'react-bootstrap';
import Link from "next/link";
// import * as Switcherdatacustam from "../../../../shared/data/switcher/Switcherdatacustam";
import Seo from '@/shared/layout-components/seo/seo';
const Error500 = () => (
  <div >
      <Seo title={"500"}/>

    <div className="square-box">
      {" "}
      <div></div> <div></div> <div></div> <div></div> <div></div> <div></div>{" "}
      <div></div> <div></div> <div></div> <div></div> <div></div> <div></div>{" "}
      <div></div> <div></div> <div></div>{" "}
    </div>
    <div
      className="page"
      // onClick={() => Switcherdatacustam.Swichermainrightremove()}
    >
      {/* <!-- Main-error-wrapper --> */}
      <div className="main-error-wrapper page page-h">
        <div>
          <h1 className="text-white">
            500<span className="tx-20">error</span>
          </h1>
          <h2 className="text-white">
            Oopps. The page you were looking for {`doesn't`} exist.
          </h2>
          <h6 className="tx-white-6">
            You may have mistyped the address or the page may have moved.
          </h6>
          <Link className="btn btn-light" href={`/components/dashboards/dashboard1/`}>
            Back to Home
          </Link>
        </div>
      </div>
      {/* <!-- /Main-error-wrapper --> */}
    </div>
    <Row className="row">
      <div className="d-flex">
        
      </div>
    </Row>
  </div>
);

Error500.propTypes = {};

Error500.defaultProps = {};

Error500.layout = "Authenticationlayout"

export default Error500;
