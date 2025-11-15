import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import CartModal from "@/pages/components/cart/index";
import { handleLogout } from "@/utils/logout";
import Cookies from "js-cookie";

const FrontendHeader = ({ backgroundImage, isStripeShowing = false }) => {
  const [headerBackgroundImg, setHeaderBackgroundImg] = useState(
    backgroundImage ?? "/assets/front-images/slider_bg9.jpg"
  );

  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState("");
  const [isActiveNow, setIsActiveNow] = useState(false);

  // ✅ Open cart modal
  const handleOpenCart = () => setIsActiveNow(true);
  // ✅ Close cart modal
  const handleCloseCart = () => setIsActiveNow(false);

  // ✅ Check login status using cookie + storage
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = Cookies.get("userAuthToken");
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (token && storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          setIsLoggedIn(true);
          setUsername(userObj.firstName || "User");
        } catch (err) {
          console.error("Invalid user data in storage:", err);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    // Initial check
    checkLoginStatus();

    // ✅ Sync login across browser tabs
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  // ✅ Scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".headernav");
      if (window.scrollY > 0) {
        header?.classList.add("scrolled");
      } else {
        header?.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="headernav">
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
                    <Link href="/tickets/my-tickets" className="navLink">
                      My Tickets
                    </Link>

                    {/* ✅ Cart button (not link) but keeps your class */}
                    <a
                      href="#"
                      className="navLink position-relative"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenCart();
                      }}
                    >
                      Cart
                      <span className="position-absolute top-0 left-100 translate-middle badge rounded-pill bg-danger">
                        2
                        <span className="visually-hidden">unread messages</span>
                      </span>
                    </a>
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
                          <Link
                            href="/tickets/my-tickets"
                            className="dropdownLink"
                          >
                            <i className="fas fa-ticket-alt" /> My Tickets
                          </Link>
                        </li>
                        <li>
                          <Link href="/event/my-event" className="dropdownLink">
                            <i className="fas fa-calendar-alt" /> My Events
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
      </header>

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
      {isActiveNow && (
        <CartModal isActiveNow={isActiveNow} makeModalOff={handleCloseCart} />
      )}
    </>
  );
};

export default FrontendHeader;
