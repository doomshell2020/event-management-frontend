import React from 'react';
import { Button, Col, Form,  Row, Tab, Tabs } from 'react-bootstrap';
import Link from "next/link";
// import * as Switcherdatacustam from "../../../../shared/data/switcher/Switcherdatacustam";
import Seo from '@/shared/layout-components/seo/seo';

const SignIn = () => {

  return (
    <div>
      <Seo title={"Sign-in"}/>

      <div className="square-box"> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> </div>
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
              <Col
                xl={5}
                lg={6}
                md={8}
                sm={8}
                xs={10}
                className="card-sigin-main mx-auto my-auto py-4 justify-content-center"
              >
                <div className="card-sigin">
                  {/* <!-- Demo content--> */}
                  <div className="main-card-signin d-md-flex">
                    <div className="wd-100p">
                      <div className="d-flex mb-4">
                        <Link href={`/components/dashboards/dashboard1/`}>
                          <img
                            src={"../../../../assets/img/brand/favicon.png"}
                            className="sign-favicon ht-40"
                            alt="logo"
                          />
                        </Link>
                      </div>
                      <div className="">
                        <div className="main-signup-header">
                          <h2>Welcome back!</h2>
                          <h6 className="font-weight-semibold mb-4">
                            Please sign in to continue.
                          </h6>
                          <div className="panel panel-primary">
                            <div className="tab-menu-heading mb-2 border-bottom-0">
                              <div className="tabs-menu1">
                                <Tabs
                                  defaultActiveKey="Email"
                                  id="uncontrolled-tab-example"
                                >
                                  <Tab eventKey="Email" title="Email">
                                    <div
                                      className="panel-body tabs-menu-body border-0 p-3"
                                      id="tab5"
                                    >
                                      <Form action="#" >
                                        <Form.Group className="form-group">
                                          <Form.Label>Email</Form.Label>{" "}
                                          <Form.Control
                                            className="form-control"
                                            placeholder="Enter your email"
                                            type="text"
                                            required
                                          />
                                        </Form.Group>
                                        <Form.Group className="form-group">
                                          <Form.Label>Password</Form.Label>{" "}
                                          <Form.Control
                                            className="form-control"
                                            placeholder="Enter your password"
                                            type="password"
                                            required
                                          />
                                        </Form.Group>
                                        <Link href={"/components/dashboards/dashboard1/"}
                                          variant=""
                                          className="btn btn-primary btn-block" 
                                        >
                                          Sign In
                                        </Link>
                                        <div className="mt-4 d-flex text-center justify-content-center mb-2">
                                          <Link
                                            href="https://www.facebook.com/"
                                            target="_blank"
                                            className="btn btn-icon btn-facebook me-2"
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
                                            className="btn btn-icon me-2"
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
                                            className="btn btn-icon me-2"
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
                                            className="btn  btn-icon me-2"
                                            type="button"
                                          >
                                            <span className="btn-inner--icon">
                                              {" "}
                                              <i className="bx bxl-instagram tx-18 tx-prime"></i>{" "}
                                            </span>
                                          </Link>
                                        </div>
                                      </Form>
                                    </div>
                                  </Tab>
                                  <Tab eventKey="Mobile" title="Mobile no">
                                    <div
                                      className="panel-body tabs-menu-body border-0 p-3"
                                      id="tab6"
                                    >
                                      <div
                                        id="mobile-num"
                                        className="wrap-input100 validate-input input-group mb-2"
                                      >
                                        <Link
                                          href="#!"
                                          className="input-group-text bg-white text-muted"
                                        >
                                          <span>+91</span>
                                        </Link>
                                        <Form.Control
                                          className="input100 form-control"
                                          type="mobile"
                                          placeholder="Mobile"
                                        />
                                      </div>
                                      <div
                                        id="login-otp"
                                        className="justify-content-around mb-4"
                                      >
                                        <Form.Control
                                          className="form-control  text-center me-2"
                                          id="txt1"
                                          maxLength="1"
                                        />
                                        <Form.Control
                                          className="form-control  text-center me-2"
                                          id="txt2"
                                          maxLength="1"
                                        />
                                        <Form.Control
                                          className="form-control  text-center me-2"
                                          id="txt3"
                                          maxLength="1"
                                        />
                                        <Form.Control
                                          className="form-control  text-center"
                                          id="txt4"
                                          maxLength="1"
                                        />
                                      </div>
                                      <span>
                                        Note : Login with registered mobile
                                        number to generate OTP.
                                      </span>
                                      <div className="container-login100-form-btn mt-3">
                                        <Link
                                          href="#!"
                                          className="btn login100-form-btn btn-primary"
                                          id="generate-otp"
                                        >
                                          Proceed
                                        </Link>
                                      </div>
                                    </div>
                                  </Tab>
                                </Tabs>
                              </div>
                            </div>

                            <div className="panel-body tabs-menu-body border-0 p-3">
                              <div className="tab-content"></div>
                            </div>
                          </div>

                          <div className="main-signin-footer text-center mt-3">
                            <p>
                              <Link href="/components/pages/authentication/forgot-password/" className="mb-3">
                                Forgot password ?
                              </Link>
                            </p>
                            <p>
                              {`Don't`} have an account?{" "}
                              <Link href={`/components/pages/authentication/sign-up/`}>Create an Account</Link>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );}

SignIn.propTypes = {};

SignIn.defaultProps = {};

SignIn.layout = "Authenticationlayout"

export default SignIn;
