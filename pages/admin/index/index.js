import React, { useEffect, useState } from "react";
import Seo from "@/shared/layout-components/seo/seo";
import Moment from "react-moment";
import moment from "moment";
import Image from "next/image";
// import profilePic from '@/public/uploads/profiles/ImageURL_1721112510304.jpg'
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import {
  Breadcrumb,
  Col,
  Row,
  Card,
  ButtonGroup,
  Spinner,
  Button,
  ProgressBar,
  Dropdown,
  Form,
} from "react-bootstrap";
import axios from "axios";
import ContentLoader from "react-content-loader"
import Link from "next/link";


export const COLUMNS = [
  {
    Header: "S.No",
    accessor: (row, index) => index + 1,
    className: "borderrigth",
  },
  {
    Header: "Name",
    accessor: "Name",
    className: "borderrigth",
  },
  {
    Header: "URL",
    accessor: "VanityURL",
    className: "borderrigth",
  },
  {
    Header: "Created",
    accessor: "updatedAt",
    className: "borderrigth",
    Cell: ({ row }) => <div></div>,
  },
];

const Dashboard = () => {
  const [member, setMember] = useState([]);
  const [event, setEvent] = useState([]);
  const [TicketSoldData, setTicketSoldData] = useState("");
  const [addonSales, setAddonSale] = useState({});
  const [ticketPerDay, setTicketPerDay] = useState([]);
  // const [selectedEvent, setSelectedEvent] = useState('ONDALINDA x MONTENEGRO 2024');
  // const [selectedEvent, setSelectedEvent] = useState("O xCAREYES");
  // const [selectedEvent, setSelectedEvent] = useState("ONDALINDA x MONTENEGRO 2025");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [DATATABLE, setDataTable] = useState([]);
  // const [eventId, setEventID] = useState(109);
  const [eventId, setEventID] = useState('');
  const [LastHousesBooked, setLastHousesBooked] = useState([]);
  const [RecentlyBookedTickets, setRecentlyBookedTickets] = useState([]);

  const [addonsSoldTierWise, setAddonsSoldTierWise] = useState([]);
  const [ticketsSoldTierWise, setTicketsSoldTierWise] = useState([]);
  // console.log(ticketsSoldTierWise)
  const [ticketsAddonsSoldPerDays, setTicketsAddonsSoldPerDays] = useState([]);
  const [last10MembersRegisters, setLast10MembersRegisters] = useState([]);
  const [totalDonation, setTotalDonation] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [totalAddons, setTotalAddons] = useState(null);
  const [totalSoldAddons, setTotalSoldAddons] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  // Step 2: Handle the selection change
  const handleSelect = (eventName, eventID) => {
    setEventID(eventID);
    setSelectedEvent(eventName);
    // callEventSoldApi(eventID);
    callEventSoldApiV1(eventID);
    callLastHouseBooked(eventID)
    callRecentlyBookedTickets(eventID)
  };

  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data: DATATABLE,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    getTableProps, // table props from react-table
    headerGroups, // headerGroups, if your table has groupings
    getTableBodyProps, // table body props from react-table
    prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
    state,
    setGlobalFilter,
    page, // use, page or rows
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state;

  // Last 10 user registration
  const handleViewmembers = async () => {
    try {
      const API_URL = `/api/v1/dashboard?key=submitApplication`;
      const response = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setMember(response.data.data);
    } catch (error) {
      // Handle errors
      console.error("There was a problem with your Axios request:", error);
    }
  };


  // All events name show
  const handleViewEvents = async () => {
    try {
      const API_URL = `/api/v1/dashboard?key=allEvents`;
      const response = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setEvent(response.data.data);
      // console.log("--event--", response.data.data[0].Name)
      // setEventID(response.data.data[0].id)
      // Extract first id
      if (response.data.data && response.data.data.length > 0) {
        const firstId = response.data.data[0].id;
        const firstEventName = response.data.data[0].Name;

        setEventID(firstId); // Update state
        callEventSoldApiV1(firstId);
        callLastHouseBooked(firstId);
        callRecentlyBookedTickets(firstId);
        setSelectedEvent(firstEventName);

        // Call API directly with firstId
      } else {
        console.log("No data available");
      }
    } catch (error) {
      // Handle errors
      console.error("There was a problem with your Axios request:", error);
    }
  };

  // New api intigrate ondalinda setup tables data search
  const callEventSoldApiV1 = async (eventId) => {
    setIsLoading(true);
    const API_URL = `/api/v1/dashboard`;
    try {
      const body = {
        key: "dashboardData",
        eventId: eventId,
      };

      const { data } = await axios.post(API_URL, body);
      setLast10MembersRegisters(data.data.last10UsersRegisters);
      setTicketsAddonsSoldPerDays(data.data.ticketSalesData);
      setTicketsSoldTierWise(data.data.tierWiseTicketSalesArray);
      setAddonsSoldTierWise(data.data.tierWiseAddonSalesArray);
      setTotalRevenue(data.data.total_revenue);
      setTotalDonation(data.data.total_donation);
      setCurrency(data.data.currencySymbol);
      setTotalAddons(data.data.total_addon_count);
      setTotalSoldAddons(data.data.totaladdonSold);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("There was a problem with your Axios request:", error);
    }
  };

  // last houses booked
  const callLastHouseBooked = async (eventId) => {
    setIsLoading(true);
    const API_URL = `/api/v1/dashboard`;
    try {
      const body = {
        key: "getLastHousesBooked",
        event_id: eventId,
      };
      const { data } = await axios.post(API_URL, body);
      setLastHousesBooked(data?.data || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("There was a problem with your Axios request:", error);
    }
  };
  // Recently booked tickets
  const callRecentlyBookedTickets = async (eventId) => {
    setIsLoading(true);
    const API_URL = `/api/v1/dashboard`;
    try {
      const body = {
        key: "RecentlyBookedTicketsUser",
        event_id: eventId,
      };
      const { data } = await axios.post(API_URL, body);
      setRecentlyBookedTickets(data?.data || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("There was a problem with your Axios request:", error);
    }
  };


  useEffect(() => {
    handleViewmembers();
    handleViewEvents();
    // callEventSoldApi(eventId);
    callEventSoldApiV1(eventId);
    callLastHouseBooked(eventId);
    callRecentlyBookedTickets(eventId);
  }, []);



  const MyLoader = () => (
    <ContentLoader
      speed={1.5} // Slows down the animation
      viewBox="0 0 400 100" // Adjusted size for larger content
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      {/* Adjusted size for larger boxes */}
      <rect x="0" y="0" rx="5" ry="5" width="100" height="20" />
      <rect x="110" y="0" rx="5" ry="5" width="180" height="20" />
      <rect x="150" y="60" rx="5" ry="5" width="80" height="20" />
      <rect x="240" y="60" rx="5" ry="5" width="100" height="20" />
      <rect x="30" y="60" rx="5" ry="5" width="120" height="20" />
      <rect x="0" y="90" rx="5" ry="5" width="50" height="20" />
      <rect x="30" y="30" rx="5" ry="5" width="180" height="20" />
      <rect x="220" y="30" rx="5" ry="5" width="200" height="20" />
    </ContentLoader>
  );



  return (
    <>
      <Seo title={"Ondalinda Admin Dashboard"} />
      <React.Fragment>
        <div className="breadcrumb-header justify-content-between">
          <div className="left-content">
            <span className="main-content-title mg-b-0 mg-b-lg-1">
              DASHBOARD
            </span>
          </div>

          {/* <Card className="card custom-card">
            <div className="card-body  px-3 py-4 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-center">
                <div className="flex-fill">
         
                        
                  <div className="dash-brd-drp">
                    <ButtonGroup className="w-100">
                      <Dropdown className="w-100">
                        <Dropdown.Toggle
                          variant=""
                          aria-expanded="false"
                          aria-haspopup="true"
                          className="btn  ripple btn-primary w-100"
                          data-bs-toggle="dropdown"
                          id="dropdownMenuButton"
                          type="button"
                        >
                          {selectedEvent}
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          className="dropdown-menu tx-13 w-100"
                          style={{ margin: "0px" }}
                        >
                          {event.map((value, index) => {
                            return (
                              <Dropdown.Item
                                key={index}
                                href="#"
                                onClick={() => handleSelect(value && value.Name, value.id)}
                              >
                                {value && value.Name ? value.Name : '---'}
                              </Dropdown.Item>
                            )
                          })}
                        </Dropdown.Menu>
                      </Dropdown>
                    </ButtonGroup>
                  </div>

                </div>
              </div>
            </div>
          </Card> */}

          <div className="justify-content-center mt-2">
            <div className="d-flex align-items-center">
              <div>
                {/* <p className="text-danger mb-0 me-5"><strong className="text-danger">Note:-</strong><span>The data on the dashboard is currently static.</span></p> */}
              </div>
              <Breadcrumb>
                <Breadcrumb.Item className=" tx-15" href="#!">
                  Dashboard
                </Breadcrumb.Item>
                <Breadcrumb.Item active aria-current="page">
                  Sales
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
        </div>
        {/* <!-- /breadcrumb --> */}

        {/* <!-- row --> */}
        <Row>
          <Col xl={12} lg={12} md={12} sm={12}>
            <Row>
              <Col sm={12} md={6} xl={3}>
                <Card className="card custom-card admn-hm-crd" style={{ height: 140 }}>
                  <div className="card-body  px-3 py-4 d-flex flex-column justify-content-center">
                    <div className="d-flex justify-content-center">
                      <div className="flex-fill">
                        {/* <div className="d-flex mb-1 align-items-top justify-content-between">
                          <h5 className="fw-semibold mb-0 lh-1  ">
                            Open Events
                          </h5>
                        </div> */}
                        <div className="dash-brd-drp">
                          <ButtonGroup className="w-100">
                            <Dropdown className="w-100">
                              <Dropdown.Toggle
                                variant=""
                                aria-expanded="false"
                                aria-haspopup="true"
                                className="btn  ripple btn-primary w-100"
                                data-bs-toggle="dropdown"
                                id="dropdownMenuButton"
                                type="button"
                              >
                                {/* ONDALINDA x MONTENEGRO 2024 */}
                                {selectedEvent}
                              </Dropdown.Toggle>
                              <Dropdown.Menu
                                className="dropdown-menu tx-13 w-100"
                                style={{ margin: "0px" }}
                              >
                                {event.map((value, index) => {
                                  return (
                                    <Dropdown.Item
                                      key={index}
                                      href="#"
                                      onClick={() =>
                                        handleSelect(
                                          value && value.Name,
                                          value.id
                                        )
                                      }
                                    >
                                      {value && value.Name ? value.Name : "---"}
                                    </Dropdown.Item>
                                  );
                                })}
                              </Dropdown.Menu>
                            </Dropdown>
                          </ButtonGroup>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col sm={12} md={6} xl={3}>
                <Row>

                  <Col sm={12}>
                    <Card className="card custom-card admn-hm-crd" style={{ height: 140 }}>
                      <div className="card-body p-3 d-flex flex-column justify-content-center">
                        <div className="d-flex h-100">
                          <div className="flex-fill flex-fill d-flex flex-column justify-content-between">
                            {isLoading ? (
                              <MyLoader />
                            ) : (
                              <div className="d-flex mb-1 align-items-top justify-content-between">
                                <h6 className="fw-bold mb-0 lh-1  ">
                                  Total Revenue
                                </h6>
                                <h6 className="fw-bold mb-0 lh-1">
                                  <Link
                                    href={`/admin/orders/?event=${encodeURIComponent(selectedEvent)}`}
                                    target="_blank"
                                    style={{ color: "blue", cursor: "pointer", textAlign: "right" }}
                                  >
                                    {/* {totalRevenue ? totalRevenue : 0} */}
                                    {/* {totalRevenue ? new Intl.NumberFormat('en-IN').format(totalRevenue) : "0"} */}
                                    {/* {totalRevenue
                                      ? `${totalRevenue.replace(/(\d+)/, (match) =>
                                        new Intl.NumberFormat('en-IN').format(Number(match))
                                      )}`: "0"} */}
                                    {currency && totalRevenue
                                      ? `${currency} ${(totalRevenue).toLocaleString()}`
                                      : "N/A"}
                                  </Link>
                                </h6>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  {/* <Col sm={12}>
                    <Card className="card custom-card admn-hm-crd" style={{ height: 58 }}>
                      <div className="card-body p-3 d-flex flex-column justify-content-center">
                        <div className="d-flex h-100">
                          <div className="flex-fill flex-fill d-flex flex-column justify-content-between">
                            {isLoading ? (
                              <MyLoader />
                            ) : (
                              <div className="d-flex mb-1 align-items-top justify-content-between">
                                <h6 className="fw-bold mb-0 lh-1  ">
                                  Total Donation Amount
                                </h6>
                                <h6 className="fw-bold mb-0 lh-1  ">
                                  <Link
                                    href={`/admin/orders/donation?event=${encodeURIComponent(selectedEvent)}`}
                                    target="_blank"
                                    style={{ color: "blue", cursor: "pointer", textAlign: "right" }}
                                  >
                                    {currency && totalDonation
                                      ? `${currency} ${(totalDonation).toLocaleString()}`
                                      : "N/A"}
                                  </Link>
                                </h6>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col> */}
                </Row>
              </Col>

              {/* Addons  */}
              <Col sm={12} md={6} xl={3}>
                <Card className="card custom-card admn-hm-crd" style={{ height: 140 }}>
                  <div className="card-body p-3 d-flex flex-column justify-content-center">
                    <div className="d-flex h-100">
                      <div className=" flex-fill d-flex flex-column ">
                        <div className="d-flex mb-1 align-items-top justify-content-between">
                          <h6 className="fw-bold mb-2 lh-1  ">
                            Total Number of Addons Sold
                          </h6>
                          <h6 className="fw-bold mb-2 lh-1">
                            {isLoading ? (
                              <MyLoader />
                            ) : (
                              <>
                                <Link
                                  href={`/admin/orders/scantickets?event_id=${eventId}&ticket_type=addon`}
                                  target="_blank"
                                  style={{ color: "blue", cursor: "pointer" }}
                                >
                                  {totalSoldAddons ? totalSoldAddons : 0}
                                </Link>
                                {" / "}
                                {totalAddons ? totalAddons : 0}
                              </>
                            )}
                          </h6>

                        </div>
                        {isLoading ? (
                          <MyLoader />
                        ) : (
                          <>
                            <div className="mb-0 d-flex justify-content-between fw-bold">
                              <div
                                className="d-flex flex-column"
                                style={{ rowGap: "5px" }}
                              >
                                {addonsSoldTierWise.map((addon) => (
                                  <p key={addon.tier} className="fw-bold mb-0" style={{ fontSize: "11px" }}>
                                    {/* {addon.ticket_name} */}
                                    {addon.ticket_name
                                      .toLowerCase() // Pehle poore string ko lowercase karein
                                      .split(" ") // Words me tod dein (space ke basis par)
                                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Har word ka first letter capital karein
                                      .join(" ")}
                                  </p>
                                ))}
                              </div>
                              <div
                                className="d-flex flex-column"
                                style={{ rowGap: "5px" }}
                              >
                                {addonsSoldTierWise.map((addon) => (
                                  <p key={addon.tier} className="mb-0 fw-bold" style={{ fontSize: "11px" }}>
                                    {addon.currencysymbol}{addon.per_ticket_price} {addon.currencyname}
                                  </p>
                                ))}
                              </div>
                              <div
                                className="d-flex flex-column"
                                style={{ rowGap: "5px" }}
                              >
                                {addonsSoldTierWise.map((addon) => (
                                  <p key={addon.tier} className="mb-0 fw-bold" style={{ fontSize: "11px" }}>
                                    <Link
                                      href={`/admin/orders/order-details/${encodeURIComponent(selectedEvent || "")}?type=addon&ticketId=${addon.addonId}`}
                                      target="_blank"
                                      style={{ color: "blue", cursor: "pointer" }}
                                    >
                                      {addon.addons_sold > 0
                                        ? addon.addons_sold
                                        : 0}
                                    </Link>

                                  </p>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Ticket  */}
              <Col sm={12} md={6} xl={3}>
                <Card className="card custom-card admn-hm-crd" style={{ height: 140 }}>
                  <div className="card-body p-3 d-flex flex-column justify-content-center">
                    <div className="d-flex h-100">
                      <div className="flex-fill d-flex flex-column ">
                        <div className="d-flex mb-1 align-items-top justify-content-between">
                          <h6 className="fw-bold mb-2 lh-1  ">
                            Ticket Sales Tier Wise
                          </h6>
                          <h6 className="fw-bold mb-2 lh-1  ">
                            {isLoading ? (
                              <MyLoader />
                            ) : (
                              (() => {
                                const totalSoldTickets = ticketsSoldTierWise.reduce(
                                  (total, ticket) => total + ticket.tickets_sold,
                                  0
                                );
                                const totalTickets = ticketsSoldTierWise.length > 0
                                  ? ticketsSoldTierWise[0].total_ticket_count
                                  : 0;

                                return (

                                  <p className="mb-0 fw-bold">
                                    <Link
                                      href={`/admin/orders/scantickets?event_id=${eventId}&ticket_type=ticket`}
                                      target="_blank"
                                      style={{ color: "blue", cursor: "pointer" }}
                                    >
                                      {totalSoldTickets > 0
                                        ? totalSoldTickets
                                        : "---"}{" "}
                                    </Link>
                                    / {totalTickets > 0 ? totalTickets : "---"}
                                  </p>
                                );
                              })()
                            )}
                          </h6>
                        </div>

                        {isLoading ? (
                          // <Spinner
                          //   animation="border"
                          //   role="status"
                          //   variant="primary"
                          // >
                          //   <span className="sr-only">Loading...</span>
                          // </Spinner>

                          <MyLoader />
                        ) : (
                          <div className="over">
                            <div
                              className="d-flex flex-column"
                              style={{ columnGap: 20 }}
                            >
                              {ticketsSoldTierWise.map((ticket, index) => (
                                <div
                                  key={index}
                                  className="d-flex justify-content-between"
                                  style={{ rowGap: 5 }}
                                >
                                  <div>
                                    <p className="fw-bold mb-0" style={{ fontSize: "11px" }}>
                                      {ticket.tier}
                                    </p>
                                  </div>

                                  <div className="w-50 d-flex justify-content-between">
                                    <p className="mb-0 fw-bold" style={{ fontSize: "11px" }}>
                                      {ticket.currencysymbol}
                                      {ticket.per_ticket_price.toLocaleString()}{" "}
                                      {ticket.currencyname}
                                    </p>
                                    <p className="mb-0 fw-bold" style={{ fontSize: "11px" }}>
                                      <Link
                                        href={`/admin/orders/order-details/${encodeURIComponent(selectedEvent || "")}?type=ticket&ticketId=${ticket.ticketId}`}
                                        target="_blank"
                                        style={{ color: "blue", cursor: "pointer" }}
                                      >
                                        {ticket.tickets_sold}
                                      </Link>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col xl={12} lg={12} md={12} sm={12}>
            <Row>
              <Col sm={12} md={6}>
                <Card className="card admn-hm-crd overflow-hidden">
                  <Card.Header className=" pb-1">
                    <h3 className="card-title mb-2">
                      Last 5 Submitted Application
                    </h3>
                  </Card.Header>
                  <Card.Body className="p-0 customers mt-1">
                    <div className="list-group list-lg-group list-group-flush">
                      {isLoading ? (
                        <MyLoader />
                      ) : (
                        <div className="list-group-item list-group-item-action border-0">
                          {last10MembersRegisters.map((value, index) => {
                            return (
                              <div className="media mt-0 mb-3" key={index}>
                                {value.ImageURL ? (
                                  <Image
                                    src={
                                      value?.ImageURL
                                        ? `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${value.ImageURL}`
                                        : "/imagenot/dummy-user.png"
                                    }
                                    alt="Description of the image"
                                    width={100} // Specify width
                                    height={100} // Specify height
                                    className="avatar-lg rounded-circle me-3 my-auto shadow"
                                  />
                                ) : (
                                  <Image
                                    src="/uploads/profiles/default.png"
                                    alt="No Image"
                                    width={100} // Specify width
                                    height={100} // Specify height
                                    className="avatar-lg rounded-circle me-3 my-auto shadow"
                                  />
                                )}
                                <div className="media-body">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div className="mt-0">
                                      <h5 className="mb-1 tx-14 font-weight-sembold text-dark">
                                        {value && value.LastName
                                          ? value.LastName
                                          : "---"}{" "}
                                        {value && value.FirstName
                                          ? value.FirstName
                                          : "---"}
                                      </h5>
                                      <p className="mb-0 tx-12 text-muted">
                                        Email:{" "}
                                        {value && value.Email
                                          ? value.Email
                                          : "---"}
                                      </p>
                                    </div>

                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        <div style={{ whiteSpace: "nowrap" }}>
                                          <Moment format="DD-MMM-YYYY" utc>
                                            {new Date(value.DateCreated)}
                                          </Moment>
                                        </div>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Ticket  */}
              <Col sm={12} md={3}>
                <Card className="card overflow-hidden admn-hm-crd">
                  <Card.Header className=" pb-1">
                    <h3 className="card-title mb-2">Ticket Sold Per Day</h3>
                  </Card.Header>
                  <Card.Body className="p-0 customers mt-1">
                    <div className="list-group list-lg-group list-group-flush">
                      {isLoading ? (
                        <MyLoader />
                      ) : (
                        <div className="list-group-item list-group-item-action border-0">
                          {ticketsAddonsSoldPerDays.map((value, index) => {
                            if (value.ticket_sold === 0) {
                              return null;
                            }
                            return (
                              <div className="media mt-0" key={index}>
                                <div className="media-body">
                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        <div style={{ whiteSpace: "nowrap" }}>
                                          <Moment format="DD-MMM-YYYY" utc>
                                            {value.date}
                                          </Moment>

                                        </div>
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">
                                        {value.ticket_sold}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Addons  */}
              <Col sm={12} md={3}>
                <Card className="card overflow-hidden admn-hm-crd">
                  <Card.Header className=" pb-1">
                    <h3 className="card-title mb-2">Addons Sold Per Day</h3>
                  </Card.Header>
                  <Card.Body className="p-0 customers mt-1">
                    <div className="list-group list-lg-group list-group-flush">
                      {isLoading ? (
                        <MyLoader />
                      ) : (
                        <div className="list-group-item list-group-item-action border-0">
                          {ticketsAddonsSoldPerDays.map((item, index) => {
                            if (item.ticket_sold === 0 || item.addon_sold === 0) {
                              return null;
                            }
                            return (
                              <div className="media mt-0" key={index}>
                                <div className="media-body">
                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        <div style={{ whiteSpace: "nowrap" }}>
                                          <Moment format="DD-MMM-YYYY" utc>
                                            {new Date(item.date)}
                                          </Moment>
                                        </div>
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">
                                        {item.addon_sold}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>



          {/* comment  last houses booked and people who booked tickets */}
          <Col xl={12} lg={12} md={12} sm={12}>
            <Row>
              <Col md={12} lg={6}>
                <Card className="card admn-hm-crd overflow-hidden">
                  <Card.Header className=" pb-1">
                    <h3 className="card-title mb-2">
                      Last 5 Booked Accommodations
                    </h3>
                  </Card.Header>
                  <Card.Body className="p-0 customers mt-1">
                    <div className="list-group list-lg-group list-group-flush">
                      {isLoading ? (
                        <MyLoader />
                      ) : (
                        <div className="list-group-item list-group-item-action border-0">
                          {
                            LastHousesBooked.map((valueOrder, index) => {
                              // Prefer BookAccommodationInfo, else use first item in AccommodationExtensions
                              const housingSource = valueOrder?.BookAccommodationInfo || valueOrder?.AccommodationExtensions?.[0] || null;
                              const isExtended = !!valueOrder.AccommodationExtensions?.[0];

                              const housingInfo = housingSource?.Housing || null;
                              const checkInDate = housingSource?.check_in_date;
                              const checkOutDate = housingSource?.check_out_date;
                              const user = valueOrder?.User || {};

                              return (
                                <div key={index} className="media mt-0 mb-3" style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "10px" }}>
                                  <div className="media-body m-view" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>

                                    <div className="tickets_box" style={{ minWidth: "110px" }}>
                                      {isExtended ? (
                                        <span style={{ margin: 0, fontSize: "14px", color: "#999", cursor: "not-allowed" }}>
                                          # {valueOrder?.OriginalTrxnIdentifier || "--"}
                                        </span>
                                      ) : (
                                        <Link
                                          title="View Order Details"
                                          target="_blank"
                                          href={`/admin/orders/${valueOrder?.OriginalTrxnIdentifier}`}
                                        >
                                          <h5 style={{ margin: 0, fontSize: "14px", color: "#0000ff" }}>
                                            # {valueOrder?.OriginalTrxnIdentifier || "--"}
                                          </h5>
                                        </Link>
                                      )}

                                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6c757d", whiteSpace: "nowrap" }}>
                                        <Moment format="DD-MMM-YYYY" utc>
                                          {new Date(valueOrder?.created)}
                                        </Moment>
                                      </p>
                                    </div>

                                    <div style={{ flex: 1, minWidth: "200px" }}>
                                      {housingInfo ? (
                                        <Link
                                          title="View Property Details"
                                          target="_blank"
                                          href={`/housing/${housingInfo?.Name?.replace(/ /g, "+") || ""}`}
                                        >
                                          <h5 style={{ margin: 0, fontSize: "14px", color: "#0000ff" }}>
                                            {housingInfo?.Name || "--"}, {housingInfo?.HousingNeighborhood?.name || "--"}
                                            {isExtended && (
                                              <span style={{ color: "green" }}> (Extended)</span>
                                            )}
                                          </h5>

                                        </Link>
                                      ) : (
                                        <h5 style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>-- No Housing Info --</h5>
                                      )}

                                      {checkInDate && checkOutDate && (
                                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6c757d" }}>
                                          {(() => {
                                            const checkIn = new Date(checkInDate);
                                            const checkOut = new Date(checkOutDate);
                                            const sameMonth = checkIn.getUTCMonth() === checkOut.getUTCMonth() && checkIn.getUTCFullYear() == checkOut.getUTCFullYear();
                                            const monthIn = checkIn.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
                                            const monthOut = checkOut.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
                                            const dayIn = checkIn.getUTCDate();
                                            const dayOut = checkOut.getUTCDate();
                                            const year = checkOut.getUTCFullYear();

                                            return sameMonth
                                              ? `${monthIn} ${dayIn} - ${dayOut}, ${year}`
                                              : `${monthIn} ${dayIn} - ${monthOut} ${dayOut}, ${year}`;
                                          })()}
                                        </p>
                                      )}

                                    </div>

                                    <div className="tickets_box" style={{ minWidth: "150px", textAlign: "right" }}>
                                      <h5 style={{ margin: 0, fontSize: "14px", whiteSpace: "nowrap" }}>
                                        {user?.FirstName || "--"} {user?.LastName || ""}
                                      </h5>
                                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6c757d", whiteSpace: "nowrap" }}>
                                        {user?.Email || "--"}
                                      </p>
                                    </div>

                                  </div>
                                </div>
                              );
                            })

                          }
                        </div>


                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={12} lg={6}>
                <Card className="card admn-hm-crd overflow-hidden">
                  <Card.Header className="pb-1">
                    <h3 className="card-title mb-2">
                      Last 5 Booked Tickets / Addons
                    </h3>
                  </Card.Header>
                  <Card.Body className="p-0 customers mt-1">
                    <div className="list-group list-lg-group list-group-flush">
                      {isLoading ? (
                        <MyLoader />
                      ) : (
                        <div className="list-group-item list-group-item-action border-0">
                          {RecentlyBookedTickets.map((value, index) => {
                            const user = value.User || {};
                            const ticketCount = value.TicketBooks?.length || 0;
                            const addonCount = value.AddonBooks?.length || 0;

                            return (
                              <div className="m-view"
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 0",
                                  borderBottom: "1px solid #eee",
                                  gap: "10px",
                                }}
                              >
                                {/* ✅ Left: Order ID & Date */}
                                <div className="tickets_box" style={{ minWidth: "140px" }}>
                                  <Link
                                    title="View Order Details"
                                    target="_blank"
                                    href={`/admin/orders/${value.OriginalTrxnIdentifier}`}>
                                    <div
                                      style={{
                                        fontSize: "14px",
                                        color: "#0000ff",
                                        marginBottom: "3px",
                                        fontWeight: 400, // normal
                                      }}
                                    >
                                      # {value.OriginalTrxnIdentifier || "---"}
                                    </div>
                                  </Link>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#6c757d",
                                      whiteSpace: "nowrap",
                                      fontWeight: 400, // normal
                                    }}
                                  >
                                    <Moment format="DD-MMM-YYYY" utc>
                                      {new Date(value.created)}
                                    </Moment>
                                  </div>
                                </div>

                                {/* ✅ Middle: Ticket & Addon Count */}
                                <div className="tickets_box"
                                  style={{
                                    minWidth: "120px",
                                    textAlign: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "13px",
                                      color: "#444",
                                      marginBottom: "2px",
                                      fontWeight: 400, // normal
                                    }}
                                  >
                                    Tickets: <span style={{ fontWeight: 400 }}>{ticketCount}</span>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "13px",
                                      color: "#444",
                                      fontWeight: 400, // normal
                                    }}
                                  >
                                    Addons: <span style={{ fontWeight: 400 }}>{addonCount}</span>
                                  </div>
                                </div>

                                {/* ✅ Right: User Info */}
                                <div className="tickets_box"
                                  style={{
                                    minWidth: "150px",
                                    textAlign: "right",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "14px",
                                      color: "#343a40",
                                      marginBottom: "3px",
                                      fontWeight: 400, // normal
                                    }}
                                  >
                                    {user.FirstName || "---"} {user.LastName || ""}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#6c757d",
                                      whiteSpace: "nowrap",
                                      fontWeight: 400, // normal
                                    }}
                                  >
                                    {user.Email || "---"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                        </div>

                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>



            </Row>
          </Col>
          {/* <!-- </div> --> */}
        </Row>
      </React.Fragment>
    </>
  );
};

Dashboard.layout = "Contentlayout";

export default Dashboard;
