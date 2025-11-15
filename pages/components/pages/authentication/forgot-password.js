import React from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Link from "next/link";
// import * as Switcherdatacustam from "../../../../shared/data/switcher/Switcherdatacustam";
import Seo from "@/shared/layout-components/seo/seo";
const ForgotPassword = () => (
  <div >
      <Seo title={"Forgot Password"}/>

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
              <Col
                xl={5}
                lg={6}
                md={8}
                sm={8}
                xs={10}
                className=" card-sigin-main py-4 justify-content-center mx-auto"
              >
                <div className="card-sigin">
                  {/* <!-- Demo content--> */}
                  <div className="main-card-signin d-md-flex">
                    <div className="wd-100p">
                      {/* <div className="mb-3 d-flex">
                        {" "}
                        <Link href={`/components/dashboards/dashboard1/`}>
                          <img
                            src={"../../../../assets/img/brand/favicon.png"}
                            className="sign-favicon ht-40"
                            alt="logo"
                          />
                        </Link>
                      </div> */}
                      <div className="main-card-signin d-md-flex bg-white">
                        <div className="wd-100p">
                          <div className="main-signin-header">
                            <h2>Forgot Password!</h2>
                            <h4>Please Enter Your Email</h4>
                            <Form action="#">
                              <div className="form-group">
                                <Form.Label>Email</Form.Label>{" "}
                                <Form.Control
                                  className="form-control"
                                  placeholder="Enter your email"
                                  type="text"
                                />
                              </div>
                              <Link href={"/components/dashboards/dashboard1/"}
                                variant=""
                                className="btn btn-primary btn-block"
                              >
                                Send
                              </Link>
                            </Form>
                          </div>
                          <div className="main-signup-footer mg-t-20 text-center">
                            <p>
                              Forget it, <Link href="#!"> Send me back</Link> to the
                              sign in screen.
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
  </div>
);

ForgotPassword.propTypes = {};

ForgotPassword.defaultProps = {};

ForgotPassword.layout = "Authenticationlayout"

export default ForgotPassword;
