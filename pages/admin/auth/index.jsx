import Head from 'next/head'
import React from 'react'
import { Inter } from 'next/font/google'
import { Alert, Button, Col, Form, Row, Tab, Tabs, FormGroup, InputGroup, Toast, Tooltip, Modal, Container, Spinner } from 'react-bootstrap';
import Link from "next/link";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Seo from '@/shared/layout-components/seo/seo'
// import { auth } from "../shared/firebase/firebase"
import axios from "axios";
import { toast, Slide, Flip } from "react-toastify";
import { ToastContainer } from "react-toastify";
import Image from "next/image";
import Cookies from "js-cookie";


export default function Login() {

    // Firebase
    const [err, setError] = useState("");
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [data, setData] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [validatedCustom, setValidatedCustom] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");


    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    let navigate = useRouter();
    const routeChange = () => {
        let path = `/admin/index/`;
        navigate.push(path);
    }

    const routeFinance = () => {
        let path = `/admin/finance/`;
        navigate.push(path);
    }

    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const savedEmail = Cookies.get("rememberEmail");
        const savedPassword = Cookies.get("rememberPassword");

        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(atob(savedPassword)); // decode Base64
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        if (document.body) {
            document.querySelector("body").classList.add("ltr", "error-page1", "bg-primary")
        }
        return () => {
            document.body.classList.remove("ltr", "error-page1", "bg-primary")
        }
    }, [])


    const ReactLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const apiUrl = '/api/v1/users/';
        const body = new FormData();
        body.append("Email", Email);
        body.append("Password", Password);
        body.append("key", "login");
        try {
            const { data: resData } = await axios.post(apiUrl, body);
            const { message, data, statusCode } = resData;

            if (statusCode !== '200') {
                // Successful login: store token + navigate
                localStorage.setItem('accessToken_', data.token);
                localStorage.setItem('UserID_', data.user.id);

                // ✅ Set admin token cookie for middleware
                // Cookies.set('adminAuthToken', data.token, { expires: 7 });
                // Remember email & password if checked
                if (rememberMe) {
                    Cookies.set("rememberEmail", Email, { expires: 30 });
                    Cookies.set("rememberPassword", btoa(Password), { expires: 30 }); // Base64 encode
                } else {
                    Cookies.remove("rememberEmail");
                    Cookies.remove("rememberPassword");
                }


                if (data?.user.id == 12492) {
                    routeFinance();
                } else {
                    routeChange();
                }

            } else {
                // Handle error case clearly
                setError(message || 'Login failed');
            }

        } catch (err) {
            const errorMsg = err?.response?.data?.message || 'Something went wrong';
            setError(errorMsg);
            console.error("Login error:", errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (e) => {
        e.preventDefault(); // Prevent default copy behavior
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const Center = () =>
        toast.error(
            <p className="text-white tx-16 mb-0">Default Center Notification</p>,
            {
                position: toast.POSITION.TOP_CENTER,
                hideProgressBar: true,
                autoClose: 5000,
                theme: "colored",
            }
        );


    const ForgotPassword = async (event) => {
        setIsLoading(true);
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            setIsLoading(false);
            event.preventDefault();
            event.stopPropagation();
        } else {
            const apiUrl = '/api/v1/front/users';
            const body = new FormData();
            body.append("Email", Email);
            body.append("key", "forgetpassword");
            await axios.put(apiUrl, body)
                .then((res) => {
                    setIsLoading(false);
                    const msg = res.data.message;

                    if (res.data.success) {
                        setResponseMessage(msg);
                        setTimeout(() => {
                            handleClose();
                        }, 2000);
                    } else {
                        setResponseMessage(msg);
                        setTimeout(() => {
                            setResponseMessage('');
                        }, 2000);
                    }

                    // localStorage.setItem("staticAdded", msg);
                }).catch((err) => {
                    setIsLoading(false);
                    const message = err.response.data.message
                    console.log("message", message)
                    // setError(message);
                });

        }
        setValidatedCustom(true);
    }


    return (
        <>
            <Head>
                <title>eboxtickets admin</title>
                <meta name="description" content="Spruha" />
            </Head>
            <Seo title={"Login"} />
            <div className="square-box"></div>
            <div className="page">
                <ToastContainer />
                <div
                    className="page-single">
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

                                <div className="d-flex mb-3 justify-content-center">
                                    <img
                                        src='/black-logo.png'
                                        className="sign-favicon ht-60"
                                        alt="logo"
                                    />
                                </div>


                                <div className="card-sigin">
                                    <p className="h5 fw-semibold mb-2 text-center">Sign In</p>
                                    <div className="main-card-signin d-md-flex">
                                        <div className="wd-100p">
                                            <div className="">
                                                <div className="main-signup-header">
                                                    <div className="panel panel-primary">
                                                        <div className="tab-menu-heading mb-2 border-bottom-0">
                                                            <div className="tabs-menu1">
                                                                {err && <Alert variant="danger">{err}</Alert>}
                                                                <Form action="#" onSubmit={ReactLogin} >
                                                                    <Form.Group className="form-group">
                                                                        <Form.Label>User Name</Form.Label>{" "}
                                                                        <Form.Control
                                                                            className="form-control"
                                                                            placeholder="Enter your user name"
                                                                            type="email"
                                                                            name='email'
                                                                            value={Email}
                                                                            required
                                                                            // onChange={changeHandler}
                                                                            onChange={(e) => {
                                                                                // console.log(e.target.value);
                                                                                setEmail(e.target.value);
                                                                            }}

                                                                        />
                                                                    </Form.Group>
                                                                    <Form.Group className="form-group mb-0">
                                                                        <Form.Label>
                                                                            Password{" "}
                                                                            <a style={{ cursor: "pointer" }} className="float-end text-danger" onClick={handleShow}>
                                                                                Forget password ?
                                                                            </a>
                                                                        </Form.Label>{" "}
                                                                    </Form.Group>

                                                                    <Form.Group className="input-group">
                                                                        <Form.Control
                                                                            className="form-control"
                                                                            placeholder="Enter your password"
                                                                            type={showPassword ? 'text' : 'password'} // Toggle between text and password type
                                                                            name='password'
                                                                            value={Password}
                                                                            // onChange={changeHandler}
                                                                            onCopy={handleCopy}
                                                                            onChange={(e) => {
                                                                                // console.log(e.target.value);
                                                                                setPassword(e.target.value);
                                                                            }}
                                                                            required
                                                                        />
                                                                        <Button
                                                                            variant=""
                                                                            className="btn btn-primary br-ts-0 br-bs-0"
                                                                            type="button"
                                                                        >
                                                                            <div className="eye-icon" onClick={togglePasswordVisibility}>
                                                                                {showPassword ? <i className="bi bi-eye-fill"></i> : <i className="bi bi-eye-slash-fill"></i>}
                                                                            </div>
                                                                        </Button>
                                                                    </Form.Group>


                                                                    <FormGroup className="form-group mt-3 justify-content-end">
                                                                        <div className="checkbox">
                                                                            <div className="custom-checkbox custom-control">
                                                                                <Form.Control
                                                                                    type="checkbox"
                                                                                    data-checkboxes="mygroup"
                                                                                    className="custom-control-input"
                                                                                    id="checkbox-2"
                                                                                    checked={rememberMe} // link state
                                                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                                                />
                                                                                <Form.Label
                                                                                    htmlFor="checkbox-2"
                                                                                    className="custom-control-label mt-1"
                                                                                >
                                                                                    Remember password ?
                                                                                </Form.Label>
                                                                            </div>
                                                                        </div>
                                                                    </FormGroup>



                                                                    <Button
                                                                        variant=""
                                                                        type="submit"
                                                                        className="btn btn-primary btn-block mt-10px"
                                                                        disabled={isLoading}
                                                                    >
                                                                        {isLoading ? (
                                                                            <Spinner
                                                                                as="span"
                                                                                animation="border"
                                                                                size="sm"
                                                                                role="status"
                                                                                aria-hidden="true"
                                                                            />
                                                                        ) : (
                                                                            "Sign In"
                                                                        )}
                                                                    </Button>

                                                                </Form>
                                                            </div>
                                                        </div>

                                                        {/* <div className="panel-body tabs-menu-body border-0 p-3">
                                                            <div className="tab-content"></div>
                                                        </div> */}
                                                    </div>



                                                    <Modal show={show} onHide={handleClose}>
                                                        <Modal.Header>
                                                            <Modal.Title>Forgot Password</Modal.Title>
                                                            <p style={{ fontSize: '16px', color: 'blue', marginTop: '10px' }}>{responseMessage}</p>
                                                            <Button variant="" onClick={handleClose}>X</Button>
                                                        </Modal.Header>
                                                        <Modal.Body>
                                                            <Form
                                                                className="needs-validation"
                                                                noValidate
                                                                validated={validatedCustom}
                                                                onSubmit={ForgotPassword}

                                                            >
                                                                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                                                    <Form.Label>Email:</Form.Label>
                                                                    <Form.Control type="email"
                                                                        required
                                                                        value={Email}
                                                                        onChange={(e) => {
                                                                            setEmail(e.target.value);
                                                                        }}
                                                                    />
                                                                </Form.Group>

                                                                <Modal.Footer>
                                                                    <Button variant="secondary" onClick={handleClose}>
                                                                        Close
                                                                    </Button>
                                                                    {/* <Button variant="primary">Send message</Button> */}
                                                                    <Button variant="primary" className="primary" type="submit" disabled={isLoading}>
                                                                        {isLoading ? (
                                                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                                        ) : (
                                                                            'RESET PASSWORD'
                                                                        )}
                                                                    </Button>
                                                                </Modal.Footer>

                                                            </Form>
                                                        </Modal.Body>

                                                    </Modal>

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
        </>
    )
}
