import React from "react";
import Link from "next/link";
import styles from "@/styles/FrontendFooter.module.css";

const FrontendFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container text-center">
        <Link href="/">
          <img
            className="footer-logo"
            src="/assets/front-images/logo.png"
            alt="EboxTickets Logo"
          />
        </Link>

        <p className="footer-content">
          eboxtickets is a hyper-efficient, massively scalable and defensibly secure online event and ticket management solution.
        </p>

        <div>
          <ul className="f-social-list d-flex justify-content-center">
            <li>
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
            </li>
            <li>
              <a href="https://twitter.com/" target="_blank" rel="noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
            </li>
            <li>
              <a href="https://accounts.google.com/" target="_blank" rel="noreferrer">
                <i className="fab fa-google-plus-g"></i>
              </a>
            </li>
            <li>
              <a href="https://in.linkedin.com/" target="_blank" rel="noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </li>
          </ul>
        </div>

        <div className="copyright-cbox">
          <p className="text-white copyright-dv">
            &copy; {currentYear} <Link href="/">eboxtickets.com</Link> - All Rights Reserved
          </p>
          <hr/>
          <div className="col-md-12 col-sm-12 text-policy">
          <ul className="footer-policybox text-white d-flex justify-content-center">
            <li><Link href="/terms-and-conditions">Terms of Use Policy</Link></li>
            <li><Link href="/refund">Refund Policy</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/delivery-policy">Delivery Policy</Link></li>
            <li><Link href="/branding">Branding</Link></li>
            <li><Link href="/cookie-policy">Cookie Policy</Link></li>
            <li><Link href="/request-demo">Request Demo</Link></li>
          </ul>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default FrontendFooter;
