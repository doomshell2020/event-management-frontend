import React, { useState } from "react";
import { useRouter } from "next/router";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import TicketCountTabs from "@/pages/components/Event/TicketCountTabs";

const TicketDetails = () => {
  const router = useRouter();
  const [backgroundImage] = useState("/assets/front-images/about-slider_bg.jpg");

  // 🔥 SAME TAB STATE & LOGIC
  const [activeTab, setMyActiveTab] = useState("ticket");

  const setActiveTab = (tab) => {
    setMyActiveTab(tab);
    router.push(`/committee/${tab}`);
  };

  // 🔥 SAME COUNTS (API से बाद में replace कर सकते हो)
  const counts = {
    pending: 0,
    approved: 0,
    ignored: 0,
  };

  return (
    <>
      <FrontendHeader backgroundImage={backgroundImage} />

      <section id="profile" className="mt-5 mb-5">
        <div className="container">
          <div className="section-heading">
            <h1>Committee</h1>
            <h2 className="mt-4">Committee</h2>
            <p className="mb-4 body-text text-center">
              If you belong to any committees for events on eboxtickets, you can manage ticket requests here.
            </p>
          </div>

          <div className="profil_deaile mx-auto">
            
            {/* 🔥 SAME TABS AS FIRST FILE */}
            <TicketCountTabs
              active={activeTab}
              onChange={setActiveTab}
              counts={counts}
            />

            {/* 🔥 TAB CONTENT AREA */}
            <div className="committee-event-detailpg">
      <div className="my-3">
        <div className="card custom-card p-3">
           <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 py-2">Count</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2 text-end">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3">
                    <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                      2
                    </span>
                  </td>
                  <td className="px-3 fw-medium">Comps</td>
                  <td className="px-3 text-end fw-semibold">
                    €0.00 <small className="text-muted">EUR</small>
                  </td>
                </tr>

                <tr>
                  <td className="px-3">
                    <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                      2
                    </span>
                  </td>
                  <td className="px-3 fw-medium">Test Ticket</td>
                  <td className="px-3 text-end fw-semibold">
                    €120.00 <small className="text-muted">EUR</small>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-12">

            {/* Share Link Card */}
            <div className="card custom-card mb-4">
              <div className="card-body">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div className="icon-badge orange">
  <i className="bi bi-link-45deg"></i>
</div>

                  <div>
                    <h5 className="mb-0">Share Link</h5>
                    <span className="text-muted d-block">
  Quick access for your friends
</span>
                  </div>
                </div>

                <p className="text-muted mb-3">
                  This link will have you as the committee member pre-selected so
                  your friends can request tickets faster!
                </p>

                <div className="d-flex gap-2 ">
                  <input
                    type="text"
                    className="form-control custom-input"
                    value="https://staging.eboxtickets.com/event/Minim-impe"
                    readOnly
                  />
                  <button type="button" className="btn btn-copy px-4">
                    Copy Link
                  </button>
                </div>
              </div>
            </div>

            {/* Ticket Push Card */}
            <div className="card custom-card">
              <div className="card-body">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div className="icon-badge purple">
                    <i className="bi bi-link-45deg"></i>
                  </div>
                  <div>
                    <h5 className="mb-0">Ticket Push</h5>
                               <span className="text-muted d-block">
Send tickets directly to patrons
</span>
                  </div>
                </div>

                <div className="custom-note rounded-xl p-3 mb-6 border border-border/50">
                  <strong>Note:</strong> This tool allows you to push approvals
                  to a patron's cart using their eboxtickets email address. If
                  the ticket is free, it will go straight to “My Tickets”. This
                  action cannot be undone.
                </div>

                <div className="mb-3">
                  <label className="form-label text-dark">Email Address</label>
                  <input
                    type="email"
                    className="form-control custom-input"
                    placeholder="patron@example.com"
                  />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label text-dark">
                      Comps{" "}
                      <small className="text-dark">
                        €0.00 EUR (2 available)
                      </small>
                    </label>
                    <select className="form-select custom-input">
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-dark">
                      Test Ticket{" "}
                      <small className="text-dark">
                        €120.00 EUR (2 available)
                      </small>
                    </label>
                    <select className="form-select custom-input">
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                    </select>
                  </div>
                </div>

                <button type="button" className="btn btn-submit w-100">
                  Submit
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

          </div>
        </div>
      </section>

      <FrontendFooter />
    </>
  );
};

export default TicketDetails;
