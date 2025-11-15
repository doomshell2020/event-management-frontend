import React from "react";
import { Button, Col, Form, FormGroup, Row } from "react-bootstrap";
import Link from "next/link";
// import * as Switcherdatacustam from "../../../../shared/data/switcher/Switcherdatacustam";
import Seo from "@/shared/layout-components/seo/seo";
const ResetPassword = () => (
  <div >
      <Seo title={"Reset Password"}/>

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
                className="card-sigin-main py-4 justify-content-center mx-auto"
              >
                <div className="card-sigin">
                  {/* <!-- Demo content--> */}
                  <div className="main-card-signin d-md-flex">
                    <div className="wd-100p">
                      <div className="d-flex mb-3">
                        <Link href={`/components/dashboards/dashboard1/`}>
                          <img
                            src={"../../../../assets/img/brand/favicon.png"}
                            className="sign-favicon ht-40"
                            alt="logo"
                          />
                        </Link>
                      </div>
                      <div className="  mb-1">
                        <div className="main-signin-header">
                          <div className="">
                            <h2>Welcome back!</h2>
                            <h4 className="text-start">Reset Your Password</h4>
                            <Form>
                              <FormGroup className="text-start form-group">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                  className="form-control"
                                  placeholder="Enter your email"
                                  type="text"
                                />
                              </FormGroup>
                              <FormGroup className="text-start form-group">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                  className="form-control"
                                  placeholder="Enter your password"
                                  type="password"
                                />
                              </FormGroup>
                              <FormGroup className="text-start form-group">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                  className="form-control"
                                  placeholder="Enter your password"
                                  type="password"
                                />
                              </FormGroup>
                              <Link href={"/components/dashboards/dashboard1/"} className="btn ripple btn-primary btn-block">
                                Reset Password
                              </Link>
                            </Form>
                            <div className="mt-2 d-flex text-center justify-content-center">
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
                        <div className="main-signup-footer mg-t-20 text-center">
                          <p>
                            Already have an account?{" "}
                            <Link href={`/components/dashboards/dashboard1/`}>Sign In</Link>
                          </p>
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

ResetPassword.propTypes = {};

ResetPassword.defaultProps = {};

ResetPassword.layout = "Authenticationlayout"

export default ResetPassword;
