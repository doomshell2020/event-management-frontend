import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { Container, Navbar } from "react-bootstrap";

import { handleLogout } from "@/utils/logout";
import { useCart } from "@/shared/layout-components/layout/CartContext";
import { useAuth } from "../layout/AuthContext";
import CartModal from "@/pages/components/cart_new/CartModal";

const DEFAULT_BG = "/assets/front-images/slider_bg9.jpg";

const FrontendHeader = ({ backgroundImage, isStripeShowing = false }) => {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const { cartCount, eventId, committeeAssigned, committeePendingCount } = useCart();
  const { user } = useAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("User");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCart, setShowCart] = useState(false);

  /* -------------------- AUTH CHECK -------------------- */
  const checkLoginStatus = useCallback(() => {
    const token = Cookies.get("userAuthToken");
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!token || !storedUser) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const userObj = JSON.parse(storedUser);
      setUsername(userObj?.firstName || "User");
      setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, [checkLoginStatus]);

  /* -------------------- STICKY HEADER -------------------- */
  useEffect(() => {
    const handleScroll = () => {
      document
        .querySelector(".headernav")
        ?.classList.toggle("scrolled", window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* -------------------- CLOSE DROPDOWN -------------------- */
  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  /* -------------------- MENU DATA -------------------- */
  const menuLinks = [
    { href: "/event/myevent", icon: "fa-tachometer-alt", label: "Dashboard" },
    { href: "/users/view-profile", icon: "fa-user", label: "My Profile" },
    { href: "/event/my-event", icon: "fa-calendar-alt", label: "My Events" },
    { href: "/orders", icon: "fa-shopping-cart", label: "My Orders" },
    { href: "/users/my-staff", icon: "fa-users", label: "My Staff" },
    { href: "/event/post-event", icon: "fa-plus-circle", label: "Post Event" },
    { href: "/users/payouts", icon: "fa-coins", label: "Payouts" },
  ];

  const handleCartClick = () => {
    if (cartCount > 0) setShowCart(true);
  };

  /* -------------------- JSX -------------------- */
  return (
    <>
      <header className="headernav">
        <Navbar expand="lg" className="p-0 pt-lg-0 pt-2">
          <Container>
            <div className="navflexbox w-100">
              {/* LOGO */}
              <Link href="/" className="logodiv">
                <img
                  src="/assets/front-images/logo.png"
                  alt="Logo"
                  className="headerlogo"
                />
              </Link>

              <Navbar.Toggle aria-controls="basic-navbar-nav" />

              <Navbar.Collapse id="basic-navbar-nav">
                <div className="menuflexbox ms-auto">
                  {/* MAIN MENU */}
                  <nav className="menulistbox">
                    <Link href="/" className="navLink">Home</Link>
                    <Link href="/calender" className="navLink">Event Calendar</Link>

                    {isLoggedIn && (
                      <>
                        <Link href="/orders" className="navLink">My Orders</Link>

                        <button
                          className="navLink position-relative btn btn-link p-0"
                          onClick={handleCartClick}
                        >
                          Cart
                          {cartCount > 0 && (
                            <span className="badge bg-danger ms-1">
                              {cartCount}
                            </span>
                          )}
                        </button>

                        {committeeAssigned && (
                          <Link
                            href="/committee/ticket"
                            className="navLink position-relative"
                          >
                            Committee
                            {committeePendingCount > 0 && (
                              <span className="badge bg-danger ms-1">
                                {committeePendingCount}
                              </span>
                            )}
                          </Link>
                        )}
                      </>
                    )}

                    <Link href="/contact-us" className="navLink">Contact Us</Link>
                  </nav>

                  {/* USER MENU */}
                  <div className="userMenu" ref={dropdownRef}>
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
                            {menuLinks.map((item) => (
                              <li key={item.href}>
                                <Link href={item.href} className="dropdownLink">
                                  <i className={`fas ${item.icon}`} /> {item.label}
                                </Link>
                              </li>
                            ))}

                            <li>
                              <button
                                className="dropdownLink"
                                onClick={() => handleLogout(router)}
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

      {/* WHATSAPP */}
      <div className="whatsapp-icon">
        <Link
          href="https://api.whatsapp.com/send?phone=+18687786837"
          target="_blank"
          className="pin_trest d-flex align-items-center justify-content-center"
        >
          <i className="fab fa-whatsapp" />
        </Link>
      </div>

      {/* INNER SLIDER */}
      {/* <div id="inner_slider">
        <img src={backgroundImage || DEFAULT_BG} alt="slider" />
        {isStripeShowing && (
          <div className="cheaper_con">
            <p>Tickets are Cheaper Here (8%)</p>
          </div>
        )}
      </div> */}

      <div id="inner_slider">
        <img src={backgroundImage || DEFAULT_BG} alt="slider" />
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

      {/* CART MODAL */}
      {showCart && (
        <CartModal
          show={showCart}
          handleClose={() => setShowCart(false)}
          eventId={eventId}
        />
      )}
    </>
  );
};

export default FrontendHeader;
