import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Seo from "@/shared/layout-components/seo/seo";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
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
  Button,
  ProgressBar,
  Dropdown,
  Form,
} from "react-bootstrap";
import Link from "next/link";
import Select from "react-select";
import axios from "axios";
import * as Dashboarddata from "../../../shared/data/dashboards/dashboards1";
import ClipLoader from "react-spinners/ClipLoader";

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
  const [event, setEvent] = useState([]);
  const [Invitation, setInvitation] = useState([]);
  const [Careyes, setCareyes] = useState([]);
  const [Member, setMember] = useState([]);
  const [Invitations, setInvitations] = useState([]);
  const [Pastevent, setPastevent] = useState([]);
  const [earning, setEarning] = useState([]);
  // console.log("earning", earning.totalrevenue);
  const [DATATABLE, setDataTable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // count All Events
  const handleViewmembers = async () => {
    try {
      const API_URL = "/api/v1/events";
      const response = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setEvent(response.data.viewCms); // Access response data, assuming it's JSON
      // Further processing of response data can be done here
    } catch (error) {
      // Handle errors
      console.error("There was a problem with your Axios request:", error);
    }
  };

  // console.log("event", event.map(item => [].concat(item)));

  // count All Invitations
  const handleViewinvitations = async () => {
    try {
      const API_URL = "/api/v1/invitationevents";
      const response = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setInvitation(response.data.data); // Access response data, assuming it's JSON
      // Further processing of response data can be done here
    } catch (error) {
      // Handle errors
      console.error("There was a problem with your Axios request:", error);
    }
  };
  // count All Careyes
  const handleViewCareyes = async () => {
    try {
      const API_URL = "/api/v1/housings";
      const response = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setCareyes(response.data.data); // Access response data, assuming it's JSON
      // Further processing of response data can be done here
    } catch (error) {
      // Handle errors
      console.error("There was a problem with your Axios request:", error);
    }
  };
  // Count All members
  const handleViewMember = async () => {
    try {
      const API_URL = "/api/v1/members/?page=1&pageSize=1";
      const response = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setMember(response.data.pagination.totalRecords); // Access response data, assuming it's JSON
      // Further processing of response data can be done here
    } catch (error) {
      // Handle errors
      console.error("There was a problem with your Axios request:", error);
    }
  };
  // LAST 10 INVITATIONS
  const handleViewINVITATIONS = async () => {
    try {
      const API_URL = "/api/v1/dashboard";
      const response = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setInvitations(response.data.data); // Access response data, assuming it's JSON
      // Further processing of response data can be done here
    } catch (error) {
      // Handle errors
      console.error("There was a problem with your Axios request:", error);
    }
  };
  // Past events
  const handleViewpastevent = async () => {
    try {
      const API_URL = "/api/v1/dashboard?pastevent=pastevent";

      const response = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setDataTable(response.data.data); // Access response data, assuming it's JSON
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      // Further processing of response data can be done here
    } catch (error) {
      // Handle errors
      console.error("There was a problem with your Axios request:", error);
    }
  };

  // // eventTicket sale revenue
  const callRevenueApi = async () => {
    const SEARCH_API =
      "https://staging.eboxtickets.com/embedapi/eventsolddetails";
    const staticEventID = "108"; // Static event ID
    try {
      const response = await axios.post(SEARCH_API, {
        eventID: staticEventID,
      });
      // console.log("response", response.data)
      if (response.data) {
        setEarning(response.data);
        // return response.data;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    handleViewmembers();
    handleViewinvitations();
    // handleViewCareyes();
    handleViewMember();
    handleViewINVITATIONS();
    // handleViewpastevent();
    callRevenueApi();
  }, []);
  // console.log("event", Invitations);
  const revenue = earning.totalrevenue ? earning.totalrevenue : "---";

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
          <div className="justify-content-center mt-2">
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
        {/* <!-- /breadcrumb --> */}

        {/* <!-- row --> */}
        <Row>
          <Col xl={12} lg={12} md={12} sm={12}>
            <Row>
              <Col sm={12} md={6} xl={3}>
                <Card className="card custom-card">
                  <div className="card-body  px-3 py-4">
                    <div className="d-flex">
                      <div className="flex-fill">
                        {/* <div className="d-flex mb-1 align-items-top justify-content-between">
                          <h5 className="fw-semibold mb-0 lh-1  ">
                            Open Events
                          </h5>
                        </div> */}
                        <div className="dash-brd-drp">
                          <ButtonGroup className="">
                            <Dropdown>
                              <Dropdown.Toggle
                                variant=""
                                aria-expanded="false"
                                aria-haspopup="true"
                                className="btn  ripple btn-primary"
                                data-bs-toggle="dropdown"
                                id="dropdownMenuButton"
                                type="button"
                              >
                                ONDALINDA x MONTENEGRO 2024
                              </Dropdown.Toggle>
                              <Dropdown.Menu
                                className="dropdown-menu tx-13"
                                style={{ margin: "0px" }}
                              >
                                <Dropdown.Item href="#">
                                  ONDALINDA x LA HAVANA, CUBA 2015
                                </Dropdown.Item>
                                <Dropdown.Item href="#">
                                  ONDALINDA x CAREYES 2016
                                </Dropdown.Item>
                                <Dropdown.Item href="#">
                                  ONDALINDA x CAREYES 2017
                                </Dropdown.Item>
                                <Dropdown.Item href="#">
                                  ONDALINDA x CAREYES 2018
                                </Dropdown.Item>
                                <Dropdown.Item href="#">
                                  ONDALINDA x CAREYES 2019
                                </Dropdown.Item>
                                <Dropdown.Item href="#">
                                  ONDALINDA x CAREYES 2020
                                </Dropdown.Item>
                                <Dropdown.Item href="#">
                                  ONDALINDA x CAREYES 2021
                                </Dropdown.Item>
                                <Dropdown.Item href="#">
                                  ONDALINDA x CAREYES 2022
                                </Dropdown.Item>
                                <Dropdown.Item href="#">
                                  ONDALINDA x MONTENEGRO 2024
                                </Dropdown.Item>
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
                <Card className="card custom-card">
                  <div className="card-body p-3">
                    <div className="d-flex">
                      <div className="flex-fill">
                        <div className="d-flex mb-1 align-items-top justify-content-between">
                          <h5 className="fw-semibold mb-0 lh-1  ">Net Sales</h5>
                        </div>

                        <h2 className="mb-0  fw-bold">$898,799.74</h2>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col sm={12} md={6} xl={3}>
                <Card className="card custom-card">
                  <div className="card-body p-3">
                    <div className="d-flex">
                      <div className="flex-fill">
                        <div className="d-flex mb-1 align-items-top justify-content-between">
                          <h5 className="fw-semibold mb-0 lh-1  ">
                            Total Number of Tickets Sold
                          </h5>
                        </div>
                        <h2 className="mb-0  fw-bold">2/250</h2>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col sm={12} md={6} xl={3}>
                <Card className="card custom-card">
                  <div className="card-body p-3">
                    <div className="d-flex">
                      <div className="flex-fill">
                        <div className="d-flex mb-1 align-items-top justify-content-between">
                          <h5 className="fw-semibold mb-0 lh-1  ">
                            Total Number of Addons Sold
                          </h5>
                        </div>

                        <h2 className="mb-0  fw-bold">3/65</h2>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>

              {/* <Col>
                                <Card className="card custom-card">
                                    <div className="card-body p-3">
                                        <div className="d-flex">
                                            <div className="me-2">
                                                <span className="rounded p-2 d-flex text-center align-self-center bg-warning-transparent">
                                                    <i className="fe fe-home tx-16 text-warning"></i>
                                                </span>
                                            </div>


                                            <div className="flex-fill">
                                                <div className="d-flex mb-1 align-items-top justify-content-between">
                                                    <h5 className="fw-semibold mb-0 lh-1  ">{Careyes.length}</h5>
                                                </div>


                                                <p className="mb-0  op-7 text-muted fw-semibold">
                                                    TOTAL CAREYES
                                                </p>



                                            </div>

                                        </div>
                                    </div>
                                </Card>
                            </Col> */}
            </Row>
          </Col>
          <Col xl={12} lg={12} md={12} sm={12}>
            <Row>
              <Col sm={12} md={6}>
                <Card className="card overflow-hidden">
                  <Card.Header className=" pb-1">
                    <h3 className="card-title mb-2">
                      Last 10 Submitted Application
                    </h3>
                  </Card.Header>
                  <Card.Body className="p-0 customers mt-1">
                    <div className="list-group list-lg-group list-group-flush">
                      {/* {Invitations.map((value) => {
                        // console.log(value.User.ImageURL)
                        return ( */}
                      <Link href="#!" className="border-0">
                        <div className="list-group-item list-group-item-action border-0">
                          <div className="media mt-0 mb-3">
                            <img
                              src={"/imagenot/dummy-user.png"} // Replace this with your placeholder image path
                              alt="Image Not Found"
                              className="avatar-lg rounded-circle me-3 my-auto shadow"
                            />
                            <div className="media-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="mt-0">
                                  <h5 className="mb-1 tx-14 font-weight-sembold text-dark">
                                    Tech Team 1
                                  </h5>
                                  <p className="mb-0 tx-12 text-muted">
                                    Email: tech@ondalinda1.com
                                  </p>
                                </div>

                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    07-05-2024
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="media mt-0 mb-3">
                            <img
                              src={"/imagenot/dummy-user.png"} // Replace this with your placeholder image path
                              alt="Image Not Found"
                              className="avatar-lg rounded-circle me-3 my-auto shadow"
                            />
                            <div className="media-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="mt-0">
                                  <h5 className="mb-1 tx-14 font-weight-sembold text-dark">
                                    Tech Team 2
                                  </h5>
                                  <p className="mb-0 tx-12 text-muted">
                                    Email: tech@ondalinda2.com
                                  </p>
                                </div>

                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    08-05-2024
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="media mt-0 mb-3">
                            <img
                              src={"/imagenot/dummy-user.png"} // Replace this with your placeholder image path
                              alt="Image Not Found"
                              className="avatar-lg rounded-circle me-3 my-auto shadow"
                            />
                            <div className="media-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="mt-0">
                                  <h5 className="mb-1 tx-14 font-weight-sembold text-dark">
                                    Tech Team 3
                                  </h5>
                                  <p className="mb-0 tx-12 text-muted">
                                    Email: tech@ondalinda3.com
                                  </p>
                                </div>

                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    09-05-2024
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="media mt-0 mb-3">
                            <img
                              src={"/imagenot/dummy-user.png"} // Replace this with your placeholder image path
                              alt="Image Not Found"
                              className="avatar-lg rounded-circle me-3 my-auto shadow"
                            />
                            <div className="media-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="mt-0">
                                  <h5 className="mb-1 tx-14 font-weight-sembold text-dark">
                                    Tech Team 4
                                  </h5>
                                  <p className="mb-0 tx-12 text-muted">
                                    Email: tech@ondalinda4.com
                                  </p>
                                </div>

                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    10-05-2024
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="media mt-0 mb-3">
                            <img
                              src={"/imagenot/dummy-user.png"} // Replace this with your placeholder image path
                              alt="Image Not Found"
                              className="avatar-lg rounded-circle me-3 my-auto shadow"
                            />
                            <div className="media-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="mt-0">
                                  <h5 className="mb-1 tx-14 font-weight-sembold text-dark">
                                    Tech Team 5
                                  </h5>
                                  <p className="mb-0 tx-12 text-muted">
                                    Email: tech@ondalinda5.com
                                  </p>
                                </div>

                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    11-05-2024
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="media mt-0 mb-3">
                            <img
                              src={"/imagenot/dummy-user.png"} // Replace this with your placeholder image path
                              alt="Image Not Found"
                              className="avatar-lg rounded-circle me-3 my-auto shadow"
                            />
                            <div className="media-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="mt-0">
                                  <h5 className="mb-1 tx-14 font-weight-sembold text-dark">
                                    Tech Team 6
                                  </h5>
                                  <p className="mb-0 tx-12 text-muted">
                                    Email: tech@ondalinda6.com
                                  </p>
                                </div>

                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    12-05-2024
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="media mt-0 mb-3">
                            <img
                              src={"/imagenot/dummy-user.png"} // Replace this with your placeholder image path
                              alt="Image Not Found"
                              className="avatar-lg rounded-circle me-3 my-auto shadow"
                            />
                            <div className="media-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="mt-0">
                                  <h5 className="mb-1 tx-14 font-weight-sembold text-dark">
                                    Tech Team 7
                                  </h5>
                                  <p className="mb-0 tx-12 text-muted">
                                    Email: tech@ondalinda7.com
                                  </p>
                                </div>

                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    12-05-2024
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="media mt-0 mb-3">
                            <img
                              src={"/imagenot/dummy-user.png"} // Replace this with your placeholder image path
                              alt="Image Not Found"
                              className="avatar-lg rounded-circle me-3 my-auto shadow"
                            />
                            <div className="media-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="mt-0">
                                  <h5 className="mb-1 tx-14 font-weight-sembold text-dark">
                                    Tech Team 8
                                  </h5>
                                  <p className="mb-0 tx-12 text-muted">
                                    Email: tech@ondalinda8.com
                                  </p>
                                </div>

                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    12-05-2024
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="media mt-0 mb-3">
                            <img
                              src={"/imagenot/dummy-user.png"} // Replace this with your placeholder image path
                              alt="Image Not Found"
                              className="avatar-lg rounded-circle me-3 my-auto shadow"
                            />
                            <div className="media-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="mt-0">
                                  <h5 className="mb-1 tx-14 font-weight-sembold text-dark">
                                    Tech Team 9
                                  </h5>
                                  <p className="mb-0 tx-12 text-muted">
                                    Email: tech@ondalinda9.com
                                  </p>
                                </div>

                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    13-05-2024
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="media mt-0 mb-3">
                            <img
                              src={"/imagenot/dummy-user.png"} // Replace this with your placeholder image path
                              alt="Image Not Found"
                              className="avatar-lg rounded-circle me-3 my-auto shadow"
                            />
                            <div className="media-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="mt-0">
                                  <h5 className="mb-1 tx-14 font-weight-sembold text-dark">
                                    Tech Team 10
                                  </h5>
                                  <p className="mb-0 tx-12 text-muted">
                                    Email: tech@ondalinda10.com
                                  </p>
                                </div>

                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    14-05-2024
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                      {/* );
                      })} */}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col sm={12} md={3}>
                <Card className="card overflow-hidden">
                  <Card.Header className=" pb-1">
                    <h3 className="card-title mb-2">Ticket Sold Per Day</h3>
                  </Card.Header>
                  <Card.Body className="p-0 customers mt-1">
                    <div className="list-group list-lg-group list-group-flush">
                      <Link href="#!" className="border-0">
                        <div className="list-group-item list-group-item-action border-0">
                          <div className="media mt-0">
                            <div className="media-body">
                              <div className="d-flex align-items-center mb-3 justify-content-between">
                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    06-05-2024
                                  </p>
                                </div>
                                <span className="tx-14">
                                  <span className="float-end ">15</span>
                                </span>
                              </div>

                              <div className="d-flex align-items-center mb-3 justify-content-between">
                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    07-05-2024
                                  </p>
                                </div>
                                <span className="tx-14">
                                  <span className="float-end ">18</span>
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-3 justify-content-between">
                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    09-05-2024
                                  </p>
                                </div>
                                <span className="tx-14">
                                  <span className="float-end ">19</span>
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-3 justify-content-between">
                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    10-05-2024
                                  </p>
                                </div>
                                <span className="tx-14">
                                  <span className="float-end ">22</span>
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-3 justify-content-between">
                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    11-05-2024
                                  </p>
                                </div>
                                <span className="tx-14">
                                  <span className="float-end ">25</span>
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-3 justify-content-between">
                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    12-05-2024
                                  </p>
                                </div>
                                <span className="tx-14">
                                  <span className="float-end ">10</span>
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-3 justify-content-between">
                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    13-05-2024
                                  </p>
                                </div>
                                <span className="tx-14">
                                  <span className="float-end ">14</span>
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-3 justify-content-between">
                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    14-05-2024
                                  </p>
                                </div>
                                <span className="tx-14">
                                  <span className="float-end ">15</span>
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-3 justify-content-between">
                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    16-05-2024
                                  </p>
                                </div>
                                <span className="tx-14">
                                  <span className="float-end ">30</span>
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-3 justify-content-between">
                                <div className="mt-0">
                                  <p className="mb-0 tx-12 text-muted">
                                    17-05-2024
                                  </p>
                                </div>
                                <span className="tx-14">
                                  <span className="float-end ">15</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col sm={12} md={3}>
                <Card className="card overflow-hidden">
                  <Card.Header className=" pb-1">
                    <h3 className="card-title mb-2">Addons Sold Per Day</h3>
                  </Card.Header>
                  <Card.Body className="p-0 customers mt-1">
                    <div className="list-group list-lg-group list-group-flush">
                     
                          <Link href="#!" className="border-0" >
                            <div className="list-group-item list-group-item-action border-0">
                              <div className="media mt-0">
                                <div className="media-body">
                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        06-05-2024
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">11</span>
                                    </span>
                                  </div>

                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        07-05-2024
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">10</span>
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        09-05-2024
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">16</span>
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        10-05-2024
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">21</span>
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        11-05-2024
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">5</span>
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        12-05-2024
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">10</span>
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        13-05-2024
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">11</span>
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        14-05-2024
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">12</span>
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        16-05-2024
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">10</span>
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center mb-3 justify-content-between">
                                    <div className="mt-0">
                                      <p className="mb-0 tx-12 text-muted">
                                        17-05-2024
                                      </p>
                                    </div>
                                    <span className="tx-14">
                                      <span className="float-end ">22</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                     
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
          {/* <!-- </div> --> */}
        </Row>

        {/* <Row>
                    <Col sm={12} className="col-12">
                      
                        <Card>

                            <Card.Header className=" ">
                                <div className="d-flex justify-content-between">
                                    <h4 className="card-title mg-b-5">PAST EVENTS
                                    </h4>
                                </div>
                            </Card.Header>
                            <Card.Body className="">
                                <table {...getTableProps()} className="table table-hover mb-0">
                                    <thead>
                                        {headerGroups.map((headerGroup) => (
                                            <tr key={Math.random()} {...headerGroup.getHeaderGroupProps()}>
                                                {headerGroup.headers.map((column) => (
                                                    <th key={Math.random()}
                                                        {...column.getHeaderProps(column.getSortByToggleProps())}
                                                        className={column.className}
                                                    >
                                                        <span className="tabletitle">{column.render("Header")}</span>
                                                        <span>
                                                            {column.isSorted ? (
                                                                column.isSortedDesc ? (
                                                                    <i className="fa fa-angle-down"></i>
                                                                ) : (
                                                                    <i className="fa fa-angle-up"></i>
                                                                )
                                                            ) : (
                                                                ""
                                                            )}
                                                        </span>
                                                    </th>
                                                ))}

                                            </tr>
                                        ))}
                                    </thead>

                                    {isLoading ? (
                                        <tbody>
                                            <tr>
                                                <td colSpan={9}>
                                                    <div className="loader inner-loader" style={{ display: "flex", justifyContent: "center" }}>
                                                        <ClipLoader
                                                            // color={color}
                                                            loading={isLoading}
                                                            color="#36d7b7"
                                                            aria-label="Loading Spinner"
                                                            data-testid="loader"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    ) : (

                                        <tbody {...getTableBodyProps()}>
                                            {page.map((row) => {
                                                prepareRow(row);
                                                return (
                                                    <tr key={Math.random()} {...row.getRowProps()}>
                                                        {row.cells.map((cell) => {
                                                            return (
                                                                <td key={Math.random()} className="borderrigth" {...cell.getCellProps()}>
                                                                    {cell.render("Cell")}
                                                                </td>
                                                            );
                                                        })}

                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    )}
                                </table>

                                <div className="d-block d-sm-flex mt-4 ">
                                    <span className="">
                                        Page{" "}
                                        <strong>
                                            {pageIndex + 1} of {pageOptions.length}
                                        </strong>{" "}
                                    </span>
                                    <span className="ms-sm-auto ">
                                        <Button
                                            variant=""
                                            className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                                            onClick={() => gotoPage(0)}
                                            disabled={!canPreviousPage}
                                        >
                                            {" Previous "}
                                        </Button>
                                        <Button
                                            variant=""
                                            className="btn-default tablebutton me-2 my-1"
                                            onClick={() => {
                                                previousPage();
                                            }}
                                            disabled={!canPreviousPage}
                                        >
                                            {" << "}
                                        </Button>
                                        <Button
                                            variant=""
                                            className="btn-default tablebutton me-2 my-1"
                                            onClick={() => {
                                                previousPage();
                                            }}
                                            disabled={!canPreviousPage}
                                        >
                                            {" < "}
                                        </Button>
                                        <Button
                                            variant=""
                                            className="btn-default tablebutton me-2 my-1"
                                            onClick={() => {
                                                nextPage();
                                            }}
                                            disabled={!canNextPage}
                                        >
                                            {" > "}
                                        </Button>
                                        <Button
                                            variant=""
                                            className="btn-default tablebutton me-2 my-1"
                                            onClick={() => {
                                                nextPage();
                                            }}
                                            disabled={!canNextPage}
                                        >
                                            {" >> "}
                                        </Button>
                                        <Button
                                            variant=""
                                            className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                                            onClick={() => gotoPage(pageCount - 1)}
                                            disabled={!canNextPage}
                                        >
                                            {" Next "}
                                        </Button>
                                    </span>
                                </div>
                            </Card.Body>





                        </Card>
                    </Col>
                </Row> */}

        {/* <Row>
                    <Col sm={12} className="col-12">
                        <Card>
                            <Card.Header className="d-flex justify-content-between">
                                <h4 className="card-title">Top Customers</h4>

                                <a className="ms-2 mt-2 mb-2 p-0 d-inline-block">
                                    <Dropdown>
                                        <Dropdown.Toggle className="p-0"
                                            variant="text"
                                            aria-expanded="false"
                                            aria-haspopup="true"

                                            data-bs-toggle="dropdown"


                                        >
                                            View All
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu
                                            style={{ margin: "0px" }}
                                            className="dropdown-menu tx-13"
                                        >
                                            <Dropdown.Item href="#">
                                                Download
                                            </Dropdown.Item>
                                            <Dropdown.Item href="#">
                                                Import
                                            </Dropdown.Item>
                                            <Dropdown.Item href="#">
                                                Export
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </a>

                            </Card.Header>
                            <Card.Body className="">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="align-items-center d-flex">
                                        <img className="avatar-md rounded-circle d me-3 my-auto shadow" src="../../../assets/img/faces/2.jpg" alt="" />
                                        <div className="mt-0 d-inline-block"><h5 className="mb-1 tx-13 d-inline-block font-weight-sembold text-dark">Samantha Melon</h5><p className="mb-0 tx-12 text-muted">User ID: #1234 <i className="bi bi-patch-check-fill fs-14 text-primary ms-2"></i></p></div>
                                    </div>
                                    <span className="d-inline-block">$1,835</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="align-items-center d-flex">
                                        <img className="avatar-md rounded-circle d me-3 my-auto shadow" src="../../../assets/img/faces/2.jpg" alt="" />
                                        <div className="mt-0 d-inline-block"><h5 className="mb-1 tx-13 d-inline-block font-weight-sembold text-dark">Samantha Melon</h5><p className="mb-0 tx-12 text-muted">User ID: #1234 <i className="bi bi-patch-check-fill fs-14 text-primary ms-2"></i></p></div>
                                    </div>
                                    <span className="d-inline-block">$1,835</span>
                                </div>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row> */}
      </React.Fragment>
    </>
  );
};

Dashboard.layout = "Contentlayout";

export default Dashboard;
