import React from 'react';
import { Button, Row, Col, Form } from "react-bootstrap";
import Countdown from 'react-countdown';
import Link from "next/link";
// import * as Switcherdatacustam from "../../../../shared/data/switcher/Switcherdatacustam";
import Seo from '@/shared/layout-components/seo/seo';
const render = ({ days, hours, minutes, seconds }) =>  (
    <Row className=" row-sm mx-auto">
      <div
        id="count-down"
        className="center-block mt-3 mb-3 mx-auto"
      >
        <div className="clock-presenter days_dash">
          <div className="digit">{days}</div>
          <br />
          <p className="mt-2">Days</p>
        </div>
        <div className="clock-presenter hours_dash">
          <div className="digit">{hours}</div>
          <br />
          <p className="mt-2">Hours</p>
        </div>
        <div className="clock-presenter minutes_dash">
          <div className="digit">{minutes}</div>
          <br />
          <p className="mt-2">Minutes</p>
        </div>
        <div className="clock-presenter seconds_dash">
          <div className="digit">{seconds}</div>
          <br />
          <p className="mt-2">Seconds</p>
        </div>
      </div>
    </Row>
  );
const Underconstructions = () => (
   <Countdown date={Date.now() + 3088800000} renderer={render} />
);
const UnderConstruction = () => (
  <div >
      <Seo title={"Under Construction"}/>

    <div className="cover-image">
      <div className="page">
        <Row>
          <div className="d-flex">
            
          </div>
        </Row>
        <div
          className="page-single"
          // onClick={() => Switcherdatacustam.Swichermainrightremove()}
        >
          <div className="container">
            <Row>
              <div className="col mx-auto">
                <Row className=" py-4 justify-content-center">
                  <Col xl={5} className=" card-sigin-main ">
                    <div className="card-sigin">
                      <div className="">
                        <div>
                          <h2 className="tx-30 text-center">
                            Under Maintenance
                          </h2>
                          <p className="tx-12 text-muted text-center">
                            Our website is currently undergoing scheduled
                            maintenance. We Should be back shortly. Thank you
                            for your patience!
                          </p>
                              <Underconstructions />
                          <div className="input-group mt-5 text-center sub-input mt-1 ms-auto me-auto mt-6">
                            <Form.Control
                              type="text"
                              className="form-control input-lg "
                              placeholder="Enter your Email"
                            />
                            <div className="input-group-append ">
                              <Button
                                type="button"
                                className="btn Sub  btn-primary btn-lg bd-te-3  bd-be-3"
                              >
                                Subscribe
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 d-flex text-center justify-content-center">
                            <Link
                              href="https://www.facebook.com/"
                              target="_blank"
                              className="btn btn-icon btn-facebook me-3"
                              type="button"
                            >
                              <span className="btn-inner--icon">
                                {" "}
                                <i className="bx bxl-facebook tx-18 tx-prime"></i>{" "}
                              </span>
                            </Link>
                            <Link
                              href="https://www.twitter.com/"
                              target="_blank"
                              className="btn btn-icon me-3"
                              type="button"
                            >
                              <span className="btn-inner--icon">
                                {" "}
                                <i className="bx bxl-twitter tx-18 tx-prime"></i>{" "}
                              </span>
                            </Link>
                            <Link
                              href="https://www.linkedin.com/"
                              target="_blank"
                              className="btn btn-icon me-3"
                              type="button"
                            >
                              <span className="btn-inner--icon">
                                {" "}
                                <i className="bx bxl-linkedin tx-18 tx-prime"></i>{" "}
                              </span>
                            </Link>
                            <Link
                              href="https://www.instagram.com/"
                              target="_blank"
                              className="btn  btn-icon me-3"
                              type="button"
                            >
                              <span className="btn-inner--icon">
                                {" "}
                                <i className="bx bxl-instagram tx-18 tx-prime"></i>{" "}
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Row>
          </div>
        </div>
      </div>
    </div>
  </div>
);

UnderConstruction.propTypes = {};

UnderConstruction.defaultProps = {};

UnderConstruction.layout = "Authenticationlayout"

export default UnderConstruction;
