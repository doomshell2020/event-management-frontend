// Rupam Changes
import { React, useMemo, useEffect, useState } from "react";
import {
  Button,
  Form,
  Modal,
  Table,
  Card,
  Row,
  Col,
  Breadcrumb,
  Alert,
  Collapse,
  Spinner,
} from "react-bootstrap";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import { useRouter } from "next/router";
import Moment from "react-moment";
import "moment-timezone";
import Swal from "sweetalert2";
import axios from "axios";
import "jspdf-autotable";
import Image from "next/image";
import Switch from "@mui/material/Switch";

const EventView = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [DATATABLE, setDATATABLE] = useState([]);

  // Navigate to click total sold ticket
  const handleScanTicket = (row) => {
    navigate.push({
      pathname: "/admin/orders/scantickets",
      query: {
        event_id: row.original.id,
        ticket_type: "ticket",
      },
    });
  };
  // Navigate to click total sold addons
  const handleScanAddon = (row) => {
    navigate.push({
      pathname: "/admin/orders/scantickets",
      query: {
        event_id: row.original.id,
        ticket_type: "addon",
      },
    });
  };

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "Name",
      accessor: "Name",
      className: "wd-40p borderrigth",
      Cell: ({ row }) => (
        <div className="d-flex align-items-center">
          <div className="position-relative">
            <Link
              title="Edit"
              href={`/admin/events/edit/${row.original.id}`}
              className="position-absolute"
              style={{
                backgroundColor: "#38cab3",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "50%",
                width: "25px",
                height: "25px",
                top: "-4px",
                right: "25px",
                color: "white",
              }}
            >
              <i class="bi bi-pencil-fill"></i>
            </Link>
            <div className="evnt-invts-prfl me-4">
              {row.original.ImageURL ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_S3_URL}/profiles/${row.original.ImageURL}`}
                  width={50}
                  height={50}
                  className="rounded-circle"
                  alt="Profile Image"
                />
              ) : (
                <Image
                  src={`${process.env.NEXT_PUBLIC_S3_URL}/no-image-1.png`} // or keep this local if it's not on S3
                  width={50}
                  height={50}
                  className="rounded-circle"
                  alt="Image Not Found"
                />
              )}
            </div>
          </div>
          <div>
            {row.original.Name}
            {/* <br /><b style={{ display: "contents" }}>Event Address:</b> {row.original.City} {row.original.Country} */}
            <br /> <b style={{ display: "contents" }}>Event Address:</b>{" "}
            {row.original.City || "NA"} {row.original.Country || "NA"}
            {/* <br /><b style={{ display: "contents" }}>Venue:</b> {row.original.Venue} */}
            <br /> <b style={{ display: "contents" }}>Venue:</b>{" "}
            {row.original.Venue || "NA"}
            <br />
            {/* organiser name  */}
            <b style={{ display: "contents" }}>Organiser:</b>{" "}
            {row.original.organiser?.contact_person || "NA"}

          </div>
        </div>
      ),
    },
    {
      Header: "Event Date",
      accessor: "StartDates",
      className: "wd-10p borderrigth",
      Cell: ({ row }) => (
        <div style={{ whiteSpace: "nowrap" }}>
          {/* {row.original.StartDate} */}
          {/* <Moment format="DD-MMM-YYYY">{row.original.StartDate}</Moment> */}
          <Moment format="DD-MMM-YYYY HH:mm A" tz={row.original.EventTimeZone}>
            {row.original.StartDate}
          </Moment>
        </div>
      ),
    },
    {
      Header: "Addons Sold",
      accessor: "AddonsSold",
      className: "wd-10p borderrigth",
      Cell: ({ row }) => (
        <div onClick={() => handleScanAddon(row)} style={{ cursor: "pointer" }}>
          {row.original.totalAddonSold !== undefined &&
            row.original.totalAddonSold !== null
            ? row.original.totalAddonSold
            : "N/A"}
        </div>
      ),
    },
    {
      Header: "Ticket Sold",
      accessor: "TicketSold",
      className: "wd-10p borderrigth",
      Cell: ({ row }) => (
        <div
          onClick={() => handleScanTicket(row)}
          style={{ cursor: "pointer" }}
        >
          {row.original.totalTicketSold !== undefined &&
            row.original.totalTicketSold !== null
            ? row.original.totalTicketSold
            : "N/A"}
        </div>
      ),
    },
    // ,
    // {
    //     Header: "Revenue",
    //     accessor: "Revenue",
    //     className: " borderrigth",
    //     Cell: ({ row }) => (
    //         <div>
    //             {row.original.totalrevenue !== undefined && row.original.totalrevenue !== null
    //                 ? row.original.totalrevenue
    //                 : 'N/A'}
    //         </div>
    //     )
    // },
  ]);

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
  // Vire Events
  const EventsView = "/api/v1/events?key=specificType";
  useEffect(() => {
    fetch(EventsView)
      .then((response) => response.json())
      .then((value) => {
        const { data } = value;
        setDATATABLE(data);
        setIsLoading(false);
      });
  }, []);

  const navigate = useRouter();

  // cancel orders navigate
  const handleCancelOrders = (row) => {
    const encodedName = encodeURIComponent(row.original.Name);
    navigate.push({
      pathname: "/admin/orders/cancelorders",
      query: {
        event: encodedName,
      },
    });
  };
  const handleInvitation = (row) => {
    // Assuming navigate.push is a navigation function, e.g., history.push in React Router
    navigate.push({
      pathname: "/admin/events/invitations",
      query: {
        id: row.original.id,
      },
    });

    // Setting currentEventId in localStorage
    localStorage.setItem("currentEventId", row.original.id);
  };
  // staff navigate
  const handleStaff = (row) => {
    navigate.push({
      pathname: "/admin/events/staff",
      query: {
        id: row.original.id,
      },
    });
  };
  // Scan Tickets
  const handleScanTickets = (row) => {
    navigate.push({
      pathname: "/admin/orders/scantickets",
      query: {
        event_id: row.original.id,
      },
    });
  };

  const handleAttendees = (row) => {
    const completedStatus = "2";
    navigate.push({
      // pathname: '/admin/events/attendeeslist/',
      pathname: "/admin/events/invitations",
      query: {
        id: row.original.id,
        attendees: completedStatus,
      },
    });
  };

  // Orders
  const handleOrders = (row) => {
    const encodedName = encodeURIComponent(row.original.Name);
    navigate.push({
      pathname: "/admin/orders",
      query: {
        event: encodedName,
      },
    });
  };
  // scannedtickets
  const handlescannedtickets = (row) => {
    const encodedName = encodeURIComponent(row.original.Name);
    navigate.push({
      pathname: "/admin/scannedtickets",
      query: {
        event: encodedName,
      },
    });
  };

  // promotioncodes
  const handlePromotioncodes = (row) => {
    const encodedName = encodeURIComponent(row.original.Name);
    navigate.push({
      pathname: "/admin/promotioncodes",
      query: {
        event: encodedName,
      },
    });
  };

  // Careyes Housing
  const handleCareyesHousing = (row) => {
    navigate.push({
      pathname: "/admin/careyeshousing",
    });
  };
  // Legacy Transactions
  const handleLegacyTransactions = (row) => {
    navigate.push({
      pathname: "/admin/transactions",
    });
  };

  // Alert messages
  const [openAlert, setOpenAlert] = useState(false);
  const [staticAdded, setStaticAdded] = useState("");

  var StaticMessage = "";
  useEffect(() => {
    if (typeof window !== "undefined") {
      var StaticMessage = localStorage.getItem("staticAdded");

      if (StaticMessage != null && StaticMessage !== "") {
        setOpenAlert(true);
        setStaticAdded(StaticMessage);
        setTimeout(() => {
          localStorage.setItem("staticAdded", "");
          setOpenAlert(false);
        }, 5000);
      } else {
        setOpenAlert(false);
        setStaticAdded("");
      }
    }
  }, [StaticMessage]);


  // temporary  call api
  const fetchEventsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(EventsView);
      const value = await response.json();
      const { data } = value;
      setDATATABLE(data);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  };
  // status change for event
  const handleStatusToggle = async (event_id) => {
    console.log("event_id", event_id)

    try {
      // Show confirmation dialog to the user
      const result = await Swal.fire({
        title: "Confirm Status Change",
        text: `Are you sure you want to change the status of this event`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Change Status",
      });

      if (result.isConfirmed) {
        // Show processing popup
        Swal.fire({
          title: "Processing...",
          text: "Please wait while we update the status.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const updateStatusApiUrl = "/api/v1/events";
        const body = new FormData();
        body.append("key", "update_event_status");
        body.append("id", event_id);

        const updateResponse = await axios.post(updateStatusApiUrl, body);
        Swal.close(); // Close the processing popup after response

        if (updateResponse.data.success) {
          Swal.fire({
            icon: "success",
            title: "Status Updated",
            text:
              updateResponse.data.message ||
              "The status has been successfully updated.",
          }).then((result) => {
            if (result.isConfirmed) {
              fetchEventsData(); // Call the fetch function directly
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Status Update Failed",
            text: updateResponse.data.message || "Failed to update the status.",
          });
        }
      }
    } catch (error) {
      Swal.close(); // Close the processing popup in case of error
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "An error occurred. Please try again later.",
      });
    }
  };





  return (
    <>
      <Seo title={"Events Manager"} />

      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Events Manager
          </span>
        </div>
        <div className="justify-content-center mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15" href="#!">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Events
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="left-content mt-2">
        <Row className="row-sm mt-4">
          <Col xl={12}>
            <div className="Mmbr-card">
              <Card>
                {staticAdded != null && openAlert === true && (
                  <Collapse in={openAlert}>
                    <Alert aria-hidden={true} severity="success">
                      {staticAdded}
                    </Alert>
                  </Collapse>
                )}
                {/* <Card.Header className="">
                  <div className="d-flex justify-content-between">
                    <h4 className="card-title mg-b-0">Events Pages</h4>
                    <h4></h4>
                    <Link
                      className="btn ripple btn-info btn-sm"
                      href="/admin/events/add"
                    >
                      Add Event
                    </Link>
                  </div>
                </Card.Header> */}
                <Card.Body className="">
                  {isLoading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "33vh",
                      }}
                    >
                      <Spinner
                        animation="border"
                        role="status"
                        variant="primary"
                        style={{ width: "30px", height: "30px" }}
                      >
                        <span className="sr-only">Loading...</span>
                      </Spinner>
                    </div>
                  ) : (
                    <div className="event-idx-tbl-new-Mobile">
                      <table {...getTableProps()} className="table responsive-table  mb-0">
                        <thead>
                          {headerGroups.map((headerGroup) => (
                            <tr
                              key={Math.random()}
                              {...headerGroup.getHeaderGroupProps()}
                            >
                              {headerGroup.headers.map((column) => (
                                <th
                                  key={Math.random()}
                                  {...column.getHeaderProps(
                                    column.getSortByToggleProps()
                                  )}
                                  className={column.className}
                                >
                                  <span className="tabletitle">
                                    {column.render("Header")}
                                  </span>
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
                              <th className="wd-30p borderrigth">Actions</th>
                            </tr>
                          ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                          {page.map((row) => {
                            prepareRow(row);
                            return (
                              <tr key={Math.random()} {...row.getRowProps()}>
                                {row.cells.map((cell) => {
                                  return (
                                    <td
                                      key={Math.random()}
                                      className="borderrigth"
                                      {...cell.getCellProps()}
                                    >
                                      {cell.render("Cell")}
                                    </td>
                                  );
                                })}
                                <td className="w-100">
                                  <div className="event-admin-actn"
                                  // style={{
                                  //   display: "flex",
                                  //   flexWrap: "wrap",
                                  //   gap: "5px",
                                  //   width: "100%",
                                  // }}
                                  >
                                    <button
                                      variant=""
                                      className="btn btn-warning btn-sm "
                                      type="button"
                                      style={{
                                        // flex: "1 1 calc(50% - 0.25rem)",
                                        // maxWidth: "23%",
                                        // minWidth: "23%",
                                        // width: "max-content ",
                                        margin: "0 0",
                                      }}
                                      onClick={() => handleInvitation(row)}
                                    // onClick={(event) => handleEditClick(event, contact)}
                                    >
                                      <i className="bi bi-envelope pe-1"></i>{" "}
                                      Invitations
                                    </button>
                                    {new Date(
                                      row.original.StartDate
                                    ).getFullYear() >= 2024 && (
                                        <>
                                          <button
                                            variant=""
                                            className="btn btn-sm  "
                                            style={{
                                              background: "#23b7e5",
                                              color: "white",
                                              // flex: "1 1 calc(50% - 0.25rem)",
                                              // maxWidth: "23%",
                                              // minWidth: "23%",
                                              // width: "max-content ",
                                              margin: "0 0",
                                            }}
                                            type="button"
                                            onClick={() => handleOrders(row)}
                                          >
                                            <i
                                              className="bi bi-people-fill pe-1"
                                              href="#!"
                                            ></i>
                                            Orders
                                          </button>

                                          <button
                                            variant=""
                                            className="btn btn-sm "
                                            style={{
                                              background: "#f77e53",
                                              color: "white",
                                              // flex: "1 1 calc(50% - 0.25rem)",
                                              // maxWidth: "23%",
                                              // minWidth: "23%",
                                              // width: "max-content ",
                                              margin: "0 0",
                                            }}
                                            type="button"
                                            onClick={() => handleAttendees(row)}
                                          >
                                            <i className="bi bi-card-text pe-1"></i>
                                            Attendees
                                          </button>

                                          <button
                                            variant=""
                                            className="btn btn-sm "
                                            style={{
                                              background: "#008000",
                                              color: "white",
                                              // flex: "1 1 calc(50% - 0.25rem)",
                                              // maxWidth: "23%",
                                              // minWidth: "23%",
                                              // width: "max-content",
                                              margin: "0 0",
                                            }}
                                            type="button"
                                            // onClick={handleScanTickets}
                                            onClick={() => handleScanTickets(row)}
                                          >
                                            <i className="bi bi-card-text pe-1"></i>{" "}
                                            Tickets
                                          </button>

                                          <button
                                            variant=""
                                            className="btn btn-sm btn-danger"
                                            type="button"
                                            onClick={() => handleCancelOrders(row)}
                                            style={{
                                              // flex: "1 1 calc(50% - 0.25rem)",
                                              // maxWidth: "23%",
                                              // minWidth: "23%",
                                              // width: "max-content",
                                              margin: "0 0",
                                            }}
                                          >
                                            <i
                                              className="bi bi-x-circle pe-1"
                                              href="#!"
                                            ></i>
                                            Cancel Orders
                                          </button>

                                          <button
                                            variant=""
                                            className="btn btn-sm "
                                            style={{
                                              background: "#607D8B",
                                              color: "white",
                                              // flex: "1 1 calc(50% - 0.25rem)",
                                              // maxWidth: "23%",
                                              // minWidth: "23%",
                                              // width: "max-content",
                                              margin: "0 0",
                                            }}
                                            type="button"
                                            onClick={() => handleStaff(row)}
                                          >
                                            <i className="bi bi-people-fill pe-1"></i>{" "}
                                            Staff
                                          </button>

                                          <button
                                            variant=""
                                            className="btn btn-sm"
                                            style={{
                                              background: "#845adf",
                                              color: "white",
                                              // flex: "1 1 calc(50% - 0.25rem)",
                                              // maxWidth: "31.8%",
                                              // minWidth: "31.8%",
                                              // width: "max-content",
                                              margin: "0 0",
                                            }}
                                            type="button"
                                            onClick={() =>
                                              handlePromotioncodes(row)
                                            }
                                          >
                                            <i
                                              className="bi bi-gift-fill pe-2"
                                              href="#!"
                                            ></i>
                                            Promotion Codes
                                          </button>

                                          {/* {row.original.id == 111 && (
                                            <Link
                                              href={`/admin/reports/${row.original.id}?name=${encodeURIComponent(row.original.Name)}`}
                                              className="btn btn-sm d-flex align-items-center"
                                              style={{
                                                backgroundColor: "#dc3545",
                                                color: "#fff",
                                                fontWeight: "bold",
                                                gap: "5px",
                                                padding: "4px 10px",
                                                borderRadius: "4px",
                                                textDecoration: "none"
                                              }}
                                            >
                                              <i className="bi bi-flag-fill pe-1"></i> Report
                                            </Link>
                                          )} */}




                                          {row.original.EventType === 2 ?
                                            <Link
                                              href={`/admin/events/housing-availability/${row.original.id}`}
                                              className="btn btn-sm"
                                              style={{
                                                background: "rgb(235 143 75)",
                                                color: "white",
                                                // flex: "1 1 calc(50% - 0.25rem)",
                                                // maxWidth: "31.8%",
                                                // minWidth: "31.8%",
                                                // width: "max-content",
                                                margin: "0 0",
                                              }}
                                            >
                                              <span className="d-flex justify-content-center align-items-center">
                                                <i className="bi bi-people-fill pe-1"></i>
                                                Manage Properties
                                              </span>
                                            </Link>
                                            : null}
                                        </>
                                      )}

                                    {new Date(
                                      row.original.StartDate
                                    ).getFullYear() < 2024 && (
                                        <>
                                          <button
                                            variant=""
                                            className="btn btn-sm "
                                            style={{
                                              // flex: "1 1 calc(50% - 0.25rem)",
                                              // maxWidth: "31.8%",
                                              // minWidth: "31.8%",
                                              // width: "max-content",
                                              margin: "0 0",
                                              background: "#23b7e5",
                                              color: "white",
                                            }}
                                            type="button"
                                            // onClick={() => handleOrders(row)}
                                            onClick={handleCareyesHousing}
                                          >
                                            <i
                                              className="bi bi-people-fill pe-1"
                                              href="#!"
                                            ></i>
                                            Housing
                                          </button>

                                          <button
                                            variant=""
                                            className="btn btn-sm btn-secondary "
                                            type="button"
                                            onClick={handleLegacyTransactions}
                                            style={{
                                              // flex: "1 1 calc(50% - 0.25rem)",
                                              // maxWidth: "31.8%",
                                              // minWidth: "31.8%",
                                              // width: "max-content",
                                              margin: "0 0",
                                            }}
                                          >
                                            <i
                                              className="bi bi-house-door pe-1"
                                              href="#!"
                                            ></i>
                                            Legacy Transactions
                                          </button>
                                        </>
                                      )}

                                    <button
                                      className={`btn btn-sm ${row.original.status === "Y" ? "btn-success" : "btn-danger22"}`}
                                      type="button"
                                      onClick={() => handleStatusToggle(row.original.id)}
                                    >
                                      {row.original.status === "Y" ? "Active" : "Inactive"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination start */}
                  <Row className="mt-4 mt-sm-2  mx-0">
                    <Col xs={12} sm={6} className="d-flex align-items-center">
                      <div className="d-flex align-items-center">
                        <span className="me-2">
                          Showing page{" "}
                          <strong>
                            {pageIndex + 1} of {pageOptions.length}
                          </strong>
                        </span>
                        <span>
                          Total Records:{" "}
                          <strong>{DATATABLE && DATATABLE.length}</strong>
                        </span>
                      </div>
                    </Col>
                    <Col xs={12} sm={6} className="d-flex pgintn justify-content-end">
                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => gotoPage(0)}
                        disabled={!canPreviousPage}
                      >
                        {"First"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => previousPage()}
                        disabled={!canPreviousPage}
                      >
                        {"<"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => nextPage()}
                        disabled={!canNextPage}
                      >
                        {">"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton"
                        onClick={() => gotoPage(pageCount - 1)}
                        disabled={!canNextPage}
                      >
                        {"Last"}
                      </Button>
                    </Col>
                  </Row>
                  {/* Pagination end */}
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </div >
    </>
  );
};

const GlobalFilter = ({ filter, setFilter }) => {
  return (
    <span className="d-flex ms-auto">
      <Form.Control
        value={filter || ""}
        onChange={(e) => setFilter(e.target.value)}
        className="form-control mb-4"
        placeholder="Search..."
      />
    </span>
  );
};

EventView.layout = "Contentlayout";
export default EventView;
