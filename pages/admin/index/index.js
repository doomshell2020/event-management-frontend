import React, { useState, useEffect } from "react";
import { Breadcrumb, Card, Col, Row, Modal, Button } from 'react-bootstrap';
import Seo from '@/shared/layout-components/seo/seo';
import ReactEcharts from "echarts-for-react";
import dynamic from "next/dynamic";
import api from "@/utils/api";
import moment from "moment";
import Link from "next/link";
import Swal from "sweetalert2";
import ContentLoader from "react-content-loader";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});


const BarChartLoader = () => (
  <ContentLoader
    speed={2}
    width="100%"
    height={300}
    viewBox="0 0 400 300"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <rect x="20" y="20" rx="4" ry="4" width="40" height="260" />
    <rect x="80" y="80" rx="4" ry="4" width="40" height="200" />
    <rect x="140" y="60" rx="4" ry="4" width="40" height="220" />
    <rect x="200" y="100" rx="4" ry="4" width="40" height="180" />
    <rect x="260" y="40" rx="4" ry="4" width="40" height="240" />
    <rect x="320" y="90" rx="4" ry="4" width="40" height="190" />
  </ContentLoader>
);

const PieChartLoader = () => (
  <ContentLoader
    speed={2}
    width="100%"
    height={300}
    viewBox="0 0 400 300"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <circle cx="200" cy="150" r="110" />
  </ContentLoader>
);


const Dashboard = () => {
  const [chartLoading, setChartLoading] = useState(true);
  const [pieLoading, setPieLoading] = useState(true);
  const [pieChart, setPieChart] = useState({
    labels: [],
    series: []
  });
  const pieOptions = {
    labels: pieChart.labels,
    legend: {
      position: "bottom"
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`
    }
  };

  const [chartData, setChartData] = useState(null);
  const echarts = {
    option: {
      tooltip: { trigger: "axis" },
      grid: { x: 40, y: 20, x2: 40, y2: 20 },

      xAxis: [{
        type: "category",
        data: chartData?.months || [],
        axisLabel: { fontSize: 10, color: "#5f6d7a" }
      }],

      yAxis: [{
        type: "value",
        axisLabel: { fontSize: 10, color: "#5f6d7a" }
      }],

      color: ["#f74f75"],

      series: [
        // {
        //   name: "View Price",
        //   type: "bar",
        //   data: chartData?.view_price || []
        // },
        {
          name: "Purchased Price(Including Tax)",
          type: "bar",
          data: chartData?.purchased_price || []
        }
      ]
    }
  };




  const [counts, setCounts] = useState(null);
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // get dashboard counts
  const getDashboardCounts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/api/v1/admin/dashboard/dashboard-counts");
      setCounts(res?.data?.data);
    } catch (err) {
      console.error("Error fetching dashboard counts:", err);
    } finally {
      setIsLoading(false);
    }
  };


  // latest tickets....
  const getLatestTickets = async () => {
    try {
      setIsLoading(true);
      // const res = await api.get("/api/v1/admin/dashboard/latest-tickets");
      const res = await api.get("/api/v1/admin/dashboard/latest-orders");
      // console.log("res?.data?.data",res?.data?.data?.tickets)
      setOrders(res?.data?.data?.orders);
    } catch (err) {
      console.error("Error fetching dashboard counts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // latest events....
  const getLatestEvents = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/api/v1/admin/dashboard/latest-events");
      setEvents(res?.data?.data?.events);
    } catch (err) {
      console.error("Error fetching dashboard counts:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const getPaymentChart = async () => {
    try {
      setChartLoading(true);
      const res = await api.get('/api/v1/admin/dashboard/payment-chart');
      setChartData(res?.data?.data);
    } catch (err) {
      console.error("Chart API Error:", err);
    } finally {
      setChartLoading(false);
    }
  };

  const getPaymentPieChart = async () => {
    try {
      setPieLoading(true);
      const res = await api.get('/api/v1/admin/dashboard/payment-pie-chart');
      setPieChart(res?.data?.data);
    } catch (err) {
      console.error("Pie chart API error:", err);
    } finally {
      setPieLoading(false);
    }
  };


  useEffect(() => {
    getDashboardCounts();
    getLatestTickets();
    getLatestEvents();
    getPaymentChart();
    getPaymentPieChart();
  }, []);
  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-IN').format(value || 0);
  };

  const formatCurrencyAmount = (row, key) => {
    const symbol = row?.event?.currencyName?.Currency_symbol || "";
    const amount = row?.[key];

    if (amount === null || amount === undefined) return "-";

    return `${symbol} ${Math.round(Number(amount)).toLocaleString("en-IN")}`;
  };



  // const formatCurrencyAmount = (row, key) => {
  //   const symbol =
  //     row?.event?.currencyName?.Currency_symbol || "";
  //   const amount = row?.[key];
  //   if (!amount) return "-";
  //   return `${symbol} ${Number(amount).toLocaleString("en-IN")}`;
  // };

  const formatAmount = (row, key) => {
    const symbol = row?.currencyName?.Currency_symbol || "";
    const value = Number(row?.[key] || 0);
    if (value <= 0) return "0";
    return `${symbol} ${Math.round(value).toLocaleString("en-IN")}`;
  };
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "Y" ? "N" : "Y";
    const statusText = newStatus === "Y" ? "Activate" : "Deactivate";

    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${statusText} this Event Organizer?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${statusText}`,
      cancelButtonText: "Cancel",
      confirmButtonColor: "#20c997",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;
    try {
      Swal.fire({
        title: "Updating status...",
        text: "Please wait",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await api.put(`/api/v1/admin/events/update-status/${id}`, {
        status: newStatus,
      });
      getLatestEvents();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Status updated successfully`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Status update failed", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to update status. Please try again.",
      });
    }
  };

  // featured status
  const handleFeaturedStatusChange = async (eventId, currentStatus) => {
    const isCurrentlyFeatured = currentStatus === "Y";
    const updatedStatus = isCurrentlyFeatured ? "N" : "Y";

    const result = await Swal.fire({
      title: "Confirm Action",
      text: isCurrentlyFeatured
        ? "Are you sure you want to remove this event from Featured?"
        : "Are you sure you want to mark this event as Featured?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isCurrentlyFeatured
        ? "Yes, Remove Featured"
        : "Yes, Mark as Featured",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#20c997",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Updating Featured Status",
        text: "Please wait...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      await api.put(`/api/v1/admin/events/${eventId}/featured`, {
        featured: updatedStatus,
      });
      // 🔁 IMPORTANT: Reload events from API
      getLatestEvents();
      Swal.fire({
        icon: "success",
        title: "Update Successful",
        text: isCurrentlyFeatured
          ? "The event has been removed from Featured."
          : "The event has been marked as Featured.",
        timer: 1500,
        showConfirmButton: false,
      });



    } catch (error) {
      console.error("Featured status update failed", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Unable to update featured status. Please try again.",
      });
    }
  };


  const handleView = (eventId) => {
    setSelectedEventId(eventId);
    setShowStaffModal(true);
    fetchStaffList(eventId);
  };
  const fetchStaffList = async (eventId) => {
    try {
      setLoadingStaff(true);

      const response = await api.get(
        `/api/v1/admin/events/${eventId}/staff`
      );
      setStaffList(response?.data?.data?.staff || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaffList([]);
    } finally {
      setLoadingStaff(false);
    }
  };









  return (
    <div>
      <Seo title={"Dashboard"} />

      {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">Dashboard</span>
        </div>
        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              Dashboard
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>


      <Row className="row-sm">
        <Col >
          <Card className=" bg-primary-gradient text-white ">
            <Card.Body>
              <Row className='g-0'>
                <div style={{ width: "max-content", maxWidth: '30px' }}>
                  <div className="icon1">
                    <i style={{ fontSize: "35px" }} className="fe fe-users"></i>
                  </div>
                </div>
                <Col style={{ flex: "1" }}>
                  <div className="mt-0">
                    <span className="text-white">Total Customers</span>
                    <h2 className="text-white mb-0" style={{ fontSize: "20px" }}><span title="Active Customers">
                      {counts?.customers?.active || 0}</span>{" / "}<span title="Inactive Customers">{counts?.customers?.inactive || 0}</span></h2>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col >
          <Card className="bg-danger-gradient text-white ">
            <Card.Body>
              <Row className='g-0'>
                <div style={{ width: "max-content", maxWidth: '30px' }}>
                  <div className="icon1">
                    <i style={{ fontSize: "35px" }} className="fe fe-shopping-cart"></i>
                  </div>
                </div>
                <Col style={{ flex: "1" }}>
                  <div className="mt-0">
                    <span className="text-white">Event Organizers</span>
                    <h2 className="text-white mb-0" style={{ fontSize: "20px" }}><span title="Active Event Organizers">{counts?.organizers?.active || 0}</span> {" / "} <span title="Inactive Event Organizers">{counts?.organizers?.inactive || 0}</span></h2>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col >
          <Card className="bg-secondary-gradient text-white ">
            <Card.Body>
              <Row className='g-0'>
                <div style={{ width: "max-content", maxWidth: '30px' }}>
                  <div className="icon1">
                    <i style={{ fontSize: "35px" }} className="fe fe-bar-chart-2"></i>
                  </div>
                </div>
                <Col style={{ flex: "1" }}>
                  <div className="mt-0">
                    <span className="text-white">Total Events</span>
                    <h2 className="text-white mb-0" style={{ fontSize: "20px" }}>
                      <span title="Active Events">
                        {counts?.events?.active || 0}</span> {" / "} <span title="Inactive Events">{counts?.events?.inactive || 0}</span>
                    </h2>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col >
          <Card className="bg-warning-gradient text-white ">
            <Card.Body>
              <Row className='g-0'>
                <div style={{ width: "max-content", maxWidth: '30px' }}>
                  <div className="icon1">
                    <i style={{ fontSize: "35px" }} className="fe fe-pie-chart"></i>
                  </div>
                </div>
                <Col style={{ flex: "1" }}>
                  <div className="mt-0">
                    <span className="text-white">Total Sales</span>
                    <h2 className="text-white mb-0" style={{ fontSize: "20px" }} title="Total Sales Amount (Including Tax)">
                      {formatNumber(counts?.total_sales)}
                    </h2>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col >
          <Card className="bg-info-gradient text-white ">
            <Card.Body>
              <Row className='g-0'>
                <div style={{ width: "max-content", maxWidth: '30px' }}>
                  <div className="icon1">
                    <i style={{ fontSize: "35px" }} className="fe fe-pie-chart"></i>
                  </div>
                </div>
                <Col style={{ flex: "1" }}>
                  <div className="mt-0">
                    <span className="text-white">Total Earning</span>
                    <h2 className="text-white mb-0" style={{ fontSize: "20px" }} title="Total Earning Admin">
                      {formatNumber(counts?.total_earning)}
                    </h2>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="row-sm">
        <Col lg={8} md={12}>
          <Card>
            <Card.Body>
              <div className="main-content-label mg-b-5">Payment Chart</div>
              <div id="">
                {chartLoading ? (
                  <BarChartLoader />
                ) : (
                  <ReactEcharts
                    option={echarts.option}
                    style={{ height: "300px", width: "100%" }}
                  />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>


        <Col lg={4} md={12}>
          <Card>
            <Card.Header>
              <h3 className="card-title">Payment Method</h3>
            </Card.Header>
            <Card.Body className="apexchart apexchart1">
              {pieLoading ? (
                <PieChartLoader />
              ) : (
                <ReactApexChart
                  options={pieOptions}
                  series={pieChart.series}
                  type="pie"
                  height={300}
                />
              )}
              {/* <ReactApexChart
                options={pieOptions}
                series={pieSeries}
                type="pie"
                width="100%"
              /> */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* latest events */}
      <Row className="row-sm">
        <Col lg={12} md={12}>
          <Card>
            <Card.Header>
              <h3 className="card-title">Latest Events</h3>
            </Card.Header>
            <Card.Body >
              <div className="table-responsive">
                <table className="table table-bordered table-hover mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th>S No</th>
                      <th>Organiser</th>
                      <th>Event Name</th>
                      <th>Date & Time</th>
                      <th>Venue</th>
                      <th>Ticket Types</th>
                      <th>Total Sales</th>
                      <th>Commission</th>
                      <th>Featured</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {events.map((value, index) => {
                      const organizer = value?.Organizer;
                      const eventName = value?.name || "---";
                      const eventUrl = `/event/${value?.id}/${value?.slug}`;
                      const fromDate = value?.date_from;
                      const toDate = value?.date_to;
                      const tickets = value?.tickets;
                      const amount = formatAmount(value, "total_sales");
                      const { id, featured } = value;
                      const isFeatured = featured === "Y";

                      return (
                        <tr key={value.id}>
                          <td>{index + 1}</td>
                          <td>{organizer
                            ? `${organizer.first_name || ""} ${organizer.last_name || ""}`.trim()
                            : "-"}</td>
                          <td>
                            <Link href={eventUrl} target="_blank" rel="noopener noreferrer"
                              style={{
                                color: "#0d6efd",        // blue
                                textDecoration: "underline",
                                cursor: "pointer"
                              }}
                            >
                              {eventName}
                            </Link>
                          </td>
                          <td>
                            <strong>From</strong> {fromDate
                              ? moment(fromDate).format("DD MMM, YYYY hh:mm A")
                              : "---"}<br />
                            <strong>To</strong> {toDate
                              ? moment(toDate).format("DD MMM, YYYY hh:mm A")
                              : "---"}<br />
                          </td>
                          <td>{value.location ? value.location : "---"}</td>
                          <td> {Array.isArray(tickets) && tickets.length > 0
                            ? tickets.map((ticket, index) => (
                              <div key={ticket.id || index}>
                                {ticket.title || "---"}
                              </div>
                            ))
                            : "---"}</td>
                          <td>{amount}</td>
                          <td>{formatAmount(value, "total_tax")}</td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <i
                                className={`${isFeatured ? "fas" : "far"} fa-star`}
                                style={{
                                  cursor: "pointer",
                                  color: isFeatured ? "#f5c518" : "#333",
                                  fontSize: "16px",
                                }}
                                title={isFeatured ? "Remove from Featured" : "Mark as Featured"}
                                onClick={() => handleFeaturedStatusChange(id, featured)}
                              />
                              <i
                                className="fas fa-eye"
                                style={{
                                  cursor: "pointer",
                                  color: "#333",
                                  fontSize: "16px",
                                }}
                                title="View Staff"
                                onClick={() => handleView(id)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-column align-items-center gap-1">
                              <div className="form-check form-switch m-0">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  style={{ cursor: "pointer" }}
                                  checked={value.status === "Y"}
                                  onChange={() => handleStatusToggle(id, value.status)}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}

                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col> </Row>

      <Row className="row-sm">
        <Col lg={12} md={12}>
          <Card>
            <Card.Header>
              <h3 className="card-title">Latest Sold Orders</h3>
            </Card.Header>
            <Card.Body >
              <div className="table-responsive">
                <table className="table table-bordered table-hover mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th>S.No</th>
                      <th>Order Date</th>
                      <th>Order Details</th>
                      <th>Event</th>
                      <th>Customer</th>
                      <th>Qty.</th>
                      <th>Customer Pay</th>
                      <th>Platform Fee</th>
                      <th>Payment Gateway Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((value, index) => {
                      const items = value.orderItems || [];

                      const totalQty = items.reduce(
                        (sum, item) => sum + (item.count || 0),
                        0
                      );
                      const eventName = value?.event?.name;
                      const user = value?.user;
                      if (!user) return <span>-</span>;
                      const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
                      return (
                        <tr key={value.id}>
                          <td>{index + 1}</td>
                          <td> {value?.created
                            ? moment(value?.created).format("DD MMM, YYYY ")
                            : "---"}</td>
                          <td><strong>Order Id: </strong>{value.order_uid}<br />
                            <strong>Order Identifier: </strong>{value.RRN}
                          </td>
                          <td>{eventName}</td>
                          <td><b>Name:</b> {fullName || "-"}<br /><b>Email: </b>{user.email || "-"}<br /><b>Mobile: </b>{user.mobile || "-"}</td>

                          <td>{totalQty}</td>
                          <td>{formatCurrencyAmount(value, "grand_total")}
                            {/* {value?.discount_amount ? (
                              <>
                                <br />
                                  Discount: {formatCurrencyAmount(value, "discount_amount")}
                              </>
                            ) : null} */}
                          </td>

                          <td>{formatCurrencyAmount(value, "platform_fee_tax")}</td>
                          <td>{formatCurrencyAmount(value, "payment_gateway_tax")}</td>
                        </tr>
                      )
                    })}



                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>


      {/* old tickets show */}
      {/* <Row className="row-sm">
        <Col lg={12} md={12}>
          <Card>
            <Card.Header>
              <h3 className="card-title">Latest Sold Tickets</h3>
            </Card.Header>
            <Card.Body >
              <div className="table-responsive">
                <table className="table table-bordered table-hover mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th>S.No</th>
                      <th>Purchase Date</th>
                      <th>Ticket</th>
                      <th>Event</th>
                      <th>Event Date & Time</th>
                      <th>Customer</th>
                      <th>Qty.</th>
                      <th>Amount</th>
                      <th>Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((value, index) => {
                      const {
                        ticket_id,
                        addon_id,
                        appointment_id
                      } = value;

                      const ticketNo =
                        ticket_id ||
                        addon_id ||
                        appointment_id ||
                        "-";

                      const { type } = value;

                      let name = "-";
                      let label = "";

                      switch (type) {
                        case "ticket":
                          name = value.ticketType?.title;
                          label = "Ticket";
                          break;

                        case "comps":
                          name = value.ticketType?.title;
                          label = "Comps";
                          break;

                        case "committesale":
                          name = value.ticketType?.title;
                          label = "Committee";
                          break;

                        case "addon":
                          name = value.addonType?.name;
                          label = "Addon";
                          break;

                        case "appointment":
                          name = value.appointment?.wellnessList?.name;
                          label = "Appointment";
                          break;

                        case "package":
                          name = value.package?.name;
                          label = "Package";
                          break;

                        case "ticket_price":
                          if (value.ticketPricing?.ticket?.title) {
                            const slotName = value.ticketPricing?.slot?.slot_name;
                            name = slotName
                              ? `${value.ticketPricing.ticket.title} (${slotName})`
                              : value.ticketPricing.ticket.title;
                            label = "Ticket Price";
                          }
                          break;

                        default:
                          name = "-";
                          label = "";
                      }

                      const eventName = value?.order?.event?.name;

                      const event = value?.order?.event;

                      if (!event?.date_from || !event?.date_to) return "-";

                      const user = value?.order?.user;

                      if (!user) return <span>-</span>;

                      const fullName =
                        [user.first_name, user.last_name].filter(Boolean).join(" ");
                      return (
                        <tr key={value.id}>
                          <td>{index + 1}</td>
                          <td> {value?.order
                            ? moment(value?.order?.created).format("DD MMM, YYYY hh:mm A")
                            : "---"}</td>
                         
                          <td>  <div className="d-flex flex-column">
                            <span className="fw-semibold">{name || "-"}</span>
                            {label && (
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: "#28a745",
                                  color: "#fff",
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontWeight: 600,
                                }}
                              >
                                {label}
                              </span>
                            )}
                          </div></td>
                          <td>{eventName}</td>
                          <td>
                            <strong>From</strong> {moment(event.date_from).format("DD MMM, YYYY hh:mm A")}<br />
                            <strong>To</strong>  {moment(event.date_to).format("DD MMM, YYYY hh:mm A")}
                          </td>
                          <td><b>Name:</b> {fullName || "-"}<br /><b>Email: </b>{user.email || "-"}<br /><b>Mobile: </b>{user.mobile || "-"}</td>
                      
                          <td>{value.count}</td>
                          <td>{formatCurrencyAmount(value, "sub_total")}</td>
                          <td>{formatCurrencyAmount(value, "tax_total")}</td>
                        </tr>
                      )
                    })}



                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>



      </Row> */}






      <Modal
        show={showStaffModal}
        onHide={() => setShowStaffModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Staff List
            {staffList.length > 0 && ` (${staffList.length})`}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loadingStaff ? (
            <div className="text-center py-4">Loading...</div>
          ) : Array.isArray(staffList) && staffList.length > 0 ? (
            <table className="table table-bordered mb-0">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff, index) => (
                  <tr key={staff.id || index}>
                    <td>{index + 1}</td>
                    <td>{staff.first_name}</td>
                    <td>{staff.email}</td>
                    <td>{staff.mobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 text-muted">
              Staff not Available
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowStaffModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  )
};

Dashboard.layout = "Contentlayout";

export default Dashboard;
