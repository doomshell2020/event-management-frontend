import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { handleLogout } from "@/utils/logout";
import Cookies from "js-cookie";
import { isTokenValid } from "@/utils/checkAuth";
import { useCart } from "@/shared/layout-components/layout/CartContext";
import { useAuth } from "../layout/AuthContext";
import CartModal from "@/pages/components/cart_new/CartModal";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
const FrontendHeader = ({ backgroundImage, isStripeShowing = false }) => {

  const [headerBackgroundImg, setHeaderBackgroundImg] = useState(
    backgroundImage ?? "/assets/front-images/slider_bg9.jpg"
  );

  const { cartCount, eventId } = useCart();
  const { loadingAuth, user } = useAuth();

  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState("");
  const [showCart, setShowCart] = useState(false);

  const handleOpenCart = () => {
    if (cartCount == 0) return;  // stop if cart is empty
    setShowCart(true);
  };

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = Cookies.get("userAuthToken");
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser && token) {
        try {
          const userObj = JSON.parse(storedUser);
          setUsername(userObj.firstName || "User");
          setIsLoggedIn(true);
        } catch (err) {
          console.error("Invalid user format:", err);
          setIsLoggedIn(false);
        }
      }
    };
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);

  }, [router]);

  //  Sticky Header
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".headernav");
      if (window.scrollY > 0) header?.classList.add("scrolled");
      else header?.classList.remove("scrolled");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>

      <header className="headernav">
        <Navbar expand="lg" className="p-0">
          <Container>
            <div className="navflexbox w-100">
              <Link href="/" className="logodiv">
                <img
                  src="/assets/front-images/logo.png"
                  alt="Logo"
                  className="headerlogo"
                />
              </Link>
              <Navbar.Toggle className="p-0" aria-controls="basic-navbar-nav"/>
              <Navbar.Collapse id="basic-navbar-nav">
                <div className="menuflexbox ms-auto">
                  <nav className="menulistbox">
                    <Link href="/" className="navLink">
                      Home
                    </Link>
                    <Link href="/calender" className="navLink">
                      Event Calendar
                    </Link>

                    {isLoggedIn && (
                      <>
                        <Link href="/orders" className="navLink">
                          My Tickets
                        </Link>


                        <a
                          href="#"
                          className="navLink position-relative"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenCart();
                          }}
                        >
                          Cart

                          {cartCount > 0 && (
                            <span className="position-absolute top-0 left-100 translate-middle badge rounded-pill bg-danger">
                              {cartCount}
                            </span>
                          )}
                        </a>

                        {user?.committeeAssigned && (
                          <Link href="/committee/ticket" className="navLink position-relative">
                            Committee

                            {user?.committeePendingCount > 0 && (
                              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {user.committeePendingCount}
                              </span>
                            )}
                          </Link>
                        )}

                      </>
                    )}

                    <Link href="/contact-us" className="navLink">
                      Contact Us
                    </Link>
                  </nav>

                  <div className="userMenu">
                    {isLoggedIn ? (
                      <>
                        <button
                          className="userwelcome-button primery-button"
                          onClick={() => setShowDropdown(!showDropdown)}
                        >
                          Welcome {username} ▾
                        </button>

                        {showDropdown && (
                          <ul className="header-dropdown">
                            <li>
                              <Link
                                href="/event/myevent"
                                className="dropdownLink active-des-link"
                              >
                                <i className="fas fa-tachometer-alt" /> Dashboard
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/users/view-profile"
                                className="dropdownLink"
                              >
                                <i className="fas fa-user" /> My Profile
                              </Link>
                            </li>

                            <li>
                              <Link href="/event/my-event" className="dropdownLink">
                                <i className="fas fa-calendar-alt" /> My Events
                              </Link>
                            </li>
                            <li>
                              <Link href="/orders" className="dropdownLink">
                                <i className="fas fa-shopping-cart" /> My Orders
                              </Link>
                            </li>
                            <li>
                              <Link href="/users/employee" className="dropdownLink">
                                <i className="fas fa-users" /> My Staff
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/event/post-event"
                                className="dropdownLink"
                              >
                                <i className="fas fa-plus-circle" /> Post Event
                              </Link>
                            </li>
                            <li>
                              <button
                                onClick={() => {
                                  setShowDropdown(false);
                                  handleLogout(router);
                                }}
                                className="dropdownLink"
                              >
                                <i className="fas fa-sign-out-alt" /> Logout
                              </button>
                            </li>
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link href="/login">
                        <button className="userloginbtn primery-button">
                          Login / Register
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </Navbar.Collapse>
            </div>
          </Container>
        </Navbar>
      </header>
      {/* <header className="headernav">
        <div className="container">

          <div className="navflexbox">
            <Link href="/" className="logodiv">
              <img
                src="/assets/front-images/logo.png"
                alt="Logo"
                className="headerlogo"
              />
            </Link>

            <div className="menuflexbox">
              <nav className="menulistbox">
                <Link href="/" className="navLink">
                  Home
                </Link>
                <Link href="/calender" className="navLink">
                  Event Calendar
                </Link>

                {isLoggedIn && (
                  <>
                    <Link href="/orders" className="navLink">
                      My Tickets
                    </Link>

                  
                    <a
                      href="#"
                      className="navLink position-relative"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenCart();
                      }}
                    >
                      Cart

                      {cartCount > 0 && (
                        <span className="position-absolute top-0 left-100 translate-middle badge rounded-pill bg-danger">
                          {cartCount}
                        </span>
                      )}
                    </a>

                    {user?.committeeAssigned && (
                      <Link href="/committee/ticket" className="navLink position-relative">
                        Committee

                        {user?.committeePendingCount > 0 && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {user.committeePendingCount}
                          </span>
                        )}
                      </Link>
                    )}

                  </>
                )}

                <Link href="/contact-us" className="navLink">
                  Contact Us
                </Link>
              </nav>

              <div className="userMenu">
                {isLoggedIn ? (
                  <>
                    <button
                      className="userwelcome-button primery-button"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      Welcome {username} ▾
                    </button>

                    {showDropdown && (
                      <ul className="header-dropdown">
                        <li>
                          <Link
                            href="/event/myevent"
                            className="dropdownLink active-des-link"
                          >
                            <i className="fas fa-tachometer-alt" /> Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/users/view-profile"
                            className="dropdownLink"
                          >
                            <i className="fas fa-user" /> My Profile
                          </Link>
                        </li>
                   
                        <li>
                          <Link href="/event/my-event" className="dropdownLink">
                            <i className="fas fa-calendar-alt" /> My Events
                          </Link>
                        </li>
                        <li>
                          <Link href="/orders" className="dropdownLink">
                            <i className="fas fa-shopping-cart" /> My Orders
                          </Link>
                        </li>
                        <li>
                          <Link href="/users/employee" className="dropdownLink">
                            <i className="fas fa-users" /> My Staff
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/event/post-event"
                            className="dropdownLink"
                          >
                            <i className="fas fa-plus-circle" /> Post Event
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              handleLogout(router);
                            }}
                            className="dropdownLink"
                          >
                            <i className="fas fa-sign-out-alt" /> Logout
                          </button>
                        </li>
                      </ul>
                    )}
                  </>
                ) : (
                  <Link href="/login">
                    <button className="userloginbtn primery-button">
                      Login / Register
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header> */}

      {/* all page whatsapp button */}
      <div className="whatsapp-icon">
        <a
          href="https://api.whatsapp.com/send?phone=+18687786837"
          className="pin_trest d-flex align-items-center justify-content-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-whatsapp" />
        </a>
      </div>

      <div id="inner_slider">
        <img src={headerBackgroundImg} alt="slider" />
        <div className="inner_slider_contant">
          <div className="slider_Cheaper">
            {isStripeShowing && (
              <div className="cheaper_con">
                <p>Tickets are Cheaper Here (8%)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Cart Modal */}
      {
        showCart && (

          <CartModal
            show={showCart}
            handleClose={() => setShowCart(false)}
            eventId={eventId}
          />
        )
      }

    </>
  );
};

export default FrontendHeader;
