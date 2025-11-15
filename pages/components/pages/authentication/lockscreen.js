import React from 'react';
import { Button, Col, Form, FormGroup, Row } from 'react-bootstrap';
import Link from "next/link";
// import * as Switcherdatacustam from "../../../../shared/data/switcher/Switcherdatacustam";
import Seo from '@/shared/layout-components/seo/seo';
const Lockscreen = () => (
  <div>
      <Seo title={"Lock screen"}/>

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
                sm={8}
                xs={10}
                lg={6}
                md={8}
                className="card-sigin-main py-4 justify-content-center mx-auto"
              >
                <div className="card-sigin">
                  {/* <!-- Demo content--> */}
                  <div className="main-card-signin d-md-flex">
                    <div className="wd-100p">
                      <div className="d-flex mx-auto">
                        {" "}
                        <Link href={`/components/dashboards/dashboard1/`} className="mx-auto d-flex">
                          <img
                            src={"../../../../assets/img/brand/favicon.png"}
                            className="sign-favicon ht-40 mx-auto"
                            alt="logo"
                          />
                          <h1 className="main-logo1 ms-1 me-0 my-auto tx-28 text-dark ms-2">
                            no<span>w</span>a
                          </h1>
                        </Link>
                      </div>
                      <div className="main-card-signin d-md-flex bg-white">
                        <div className="p-4 wd-100p">
                          <div className="main-signin-header">
                            <div className="avatar avatar-xxl avatar-xxl mx-auto text-center mb-2">
                              <img
                                alt=""
                                className="avatar avatar-xxl rounded-circle  mt-2 mb-2 "
                                src={"../../../../assets/img/faces/6.jpg"}
                              />
                            </div>
                            <div className="mx-auto text-center mt-4 mg-b-20">
                              <h5 className="mg-b-10 tx-16">Teri Dactyl</h5>
                              <p className="tx-13 text-muted">
                                Enter Your Password to View your Screen
                              </p>
                            </div>
                            <Form action="#">
                              <FormGroup className="form-group">
                                <Form.Control
                                  className="form-control"
                                  placeholder="Enter your password"
                                  type="password"
                                  defaultValue=""
                                />
                              </FormGroup>
                              <Button className="btn btn-primary btn-block">
                                Unlock
                              </Button>
                            </Form>
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

Lockscreen.propTypes = {};

Lockscreen.defaultProps = {};

Lockscreen.layout = "Authenticationlayout"

export default Lockscreen;
