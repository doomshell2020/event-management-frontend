import React from "react";
import { useState, useRef, useEffect } from "react";
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
  Pagination,
  Spinner,
  ButtonGroup,
  Dropdown,
} from "react-bootstrap";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import axios from "axios";
import { CSVLink } from "react-csv";
import { Tooltip, IconButton, Switch } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Moment from "react-moment";
import moment from "moment";
import { MultiSelect } from "react-multi-select-component";
import { useRouter } from "next/router";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";
import {
  CForm,
  CCol,
  CFormLabel,
  CFormFeedback,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CFormCheck,
} from "@coreui/react";
import { platform } from "os";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// console.log('platform',platform);
// import { optiondefault } from "../../../shared/data/form/form-validation";
// import { useDownloadExcel } from "react-export-table-to-excel";
// import ReactExport from "react-export-table-to-excel";

const MembersTable = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [DATATABLE, SetDATATABLE] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState("");
  const [waiverFlag, setWaiverFlag] = useState("");
  const [pages, setPage] = useState(1);
  const [pageSize, setManualPageSize] = useState(25); // console.log("Country", Country)
  const [eventName, setEventName] = useState(null);
  const [eventDepartment, setEventDepartment] = useState([]);
  const [status, setStatus] = useState({
    0: "Incomplete, Email Not Send",
    1: "Signed",
    2: "Incomplete, Email Send",
  });
  const [lgShow, setLgShow] = useState(false);
  const [basic, setBasic] = useState(false);
  const [qrImg, setQrImg] = useState("");
  const [staffTickets, setStaffTickets] = useState([]);
  const [ticketSaleInfo, setTicketSaleInfo] = useState({});
  const [ticketScannedDepartmentWise, setTicketScannedDepartmentWise] =
    useState({});

  const navigate = useRouter();
  const router = useRouter();
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const { id, currentPage, result } = router.query;
  const finalId = id;

  useEffect(() => {
    if (id) {
      const fetchAllData = async () => {
        await handleViewEvent(id);
        // await fetchData();
        handleViewDepartment(id);
      };
      fetchAllData();
    }
  }, [id]);

  useEffect(() => {
    if (currentPage) {
      const parsedPage = parseInt(currentPage, 10) || 1;
      setPage(parsedPage);
    }
  }, [currentPage]);

  const fetchData = async (id) => {
    try {
      const memberURL = `/api/v1/eventstaff?eventId=${id}`;
      const response = await fetch(memberURL);
      const data = await response.json();
      if (data.status) {
        const mergedData = data.data.map((member) => {
          return {
            ...member,
            QRCode: member.TicketDetails?.[0]?.qrcode ?? "",
            usedDate: member.TicketDetails?.[0]?.usedate ?? "",
            // scannedBy: member.TicketDetails?.[0]?.scanner_id ?? "",
            scannedBy: `${member.TicketDetails?.[0]?.user?.FirstName || ""} ${member.TicketDetails?.[0]?.user?.LastName || ""
              }`.trim(), // Concatenate FirstName and LastName
          };
        });
        SetDATATABLE(mergedData || []);
        setTicketSaleInfo(data.staffInfo);
      } else {
        SetDATATABLE([]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("There was a problem with your Axios request:", error);
    }
  };

  const handleViewEvent = async (id) => {
    try {
      const response = await axios.get(`/api/v1/eventstaff?EventID=${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setEventName(response.data.data);
      await fetchData(id);
      setIsLoading(false);
    } catch (error) {
      console.error("There was a problem with your Axios request:", error);
    }
  };

  // get all staff ticket new functionality
  // const handleGetStaffTicket = async () => {
  //   const eventName = getEventNameFromURL();
  //   const API_URL = `/api/v1/eventstaff`
  //   try {

  //     const body = {
  //       eventName: eventName && eventName.Name,
  //       "key": "getAllStaffTicket",
  //     };

  //     if (params.eventName) {
  //       body.eventName = params.eventName;
  //     }

  //     if (params.FirstName) {
  //       body.name = params.FirstName;
  //     }

  //     if (params.LastName) {
  //       body.lname = params.LastName;
  //     }
  //     if (params.Email) {
  //       body.email = params.Email;
  //     }
  //     const response = await axios.post(API_URL, body);
  //     // console.log("response", response.data)
  //     setStaffTickets(response.data.data);
  //     setIsLoading(false)
  //   } catch (error) {
  //     console.error('There was a problem with your Axios request:', error);
  //   }
  // };

  // get all staff ticket old functionality
  // const handleGetStaffTicket = async (params) => {
  //   // console.log("🚀 ~ handleGetStaffTicket ~ params:", params)

  //   const body = {
  //     eventName: eventName && eventName.Name,
  //   };

  //   if (params.eventName) {
  //     body.eventName = params.eventName;
  //   }

  //   if (params.FirstName) {
  //     body.name = params.FirstName;
  //   }

  //   if (params.LastName) {
  //     body.lname = params.LastName;
  //   }
  //   if (params.Email) {
  //     body.email = params.Email;
  //   }

  //   const API_URL = `https://staging.eboxtickets.com/embedapi/getallstaffticket`;

  //   try {
  //     const response = await axios.post(API_URL, body);
  //     setStaffTickets(response.data.data);
  //     return response.data.data; // Return the data if needed
  //   } catch (error) {
  //     console.error("There was a problem with your Axios request:", error);
  //   }
  // };

  const handleViewDepartment = async (id) => {
    const API_URL = `/api/v1/eventstaff?EventIDS=${id}`;
    try {
      const response = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setEventDepartment(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("There was a problem with your Axios request:", error);
    }
  };

  const [selectedRows, setSelectedRows] = useState([]);
  const toggleRowSelected = (rowId) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  const isSelected = (rowId) => {
    return selectedRows.includes(rowId);
    // selectedIds.includes(staffID);
  };

  const toggleAllRowsSelected = () => {
    const allRowIds = page.map((row) => row.original.Email);
    if (selectedRows.length === allRowIds.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allRowIds);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 0:
        return "danger"; // Interested
      case 1:
        return "warning"; // Invited
      case 2:
        return "success"; // Change to "success" for Completed
      case 3:
        return "info"; // Partially Paid
      case 4:
        return "primary"; // Over Paid
      default:
        return "secondary"; // Default color
    }
  };

  //Sent Invitation Email New
  const callStatusApi = async (Email, EventID) => {
    const STATUS_API = `/api/v1/eventstaff`;
    const emailCount = Email.length;

    if (emailCount === 0) return;

    const getConfirmation = async () => {
      return await Swal.fire({
        title: "Warning",
        text: `Are you sure you want to send invitations to ${emailCount} ${emailCount > 1 ? "people" : "person"
          }?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes!",
        cancelButtonText: "No, cancel",
      });
    };

    try {
      const confirmationResult = await getConfirmation();
      if (confirmationResult.isConfirmed) {
        setIsLoading(true);
        const response = await axios.post(STATUS_API, {
          // key: "sendInvitation",
          // Email,
          key: "sendInvitation",
          Email: Email,
          EventID: EventID,
        });

        const msg = response.data.message;
        if (response.data.statusCode === 200) {
          await fetchData(EventID);
          Swal.fire({
            title: "Done",
            text: msg,
            icon: "success",
          });
        } else {
          setIsLoading(false);
          Swal.fire({
            title: "Oops!",
            text: msg,
            icon: "error",
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      Swal.fire({
        title: "Error",
        text: error.message || "An error occurred. Please try again.",
        icon: "error",
      });
      console.error("Error:", error);
    }
  };

  //Sent Invitation Email
  // const callStatusApi = async (Email, Status) => {
  //     const STATUS_API = `/api/v1/eventstaff`;
  //     console.log(Email);
  //     // Find the email in the DATATABLE
  //     if (Email.length == 1) {
  //         try {
  //             const confirmationResult = await Swal.fire({
  //                 title: 'Warning',
  //                 text: 'Are you sure you want to send invitation?',
  //                 icon: "question",
  //                 showCancelButton: true,
  //                 confirmButtonText: "Yes!",
  //                 cancelButtonText: "No, cancel",
  //             });

  //             if (confirmationResult.isConfirmed) {
  //                 setIsLoading(true);
  //                 const response = await axios.post(STATUS_API, {
  //                     key: "sendInvitation",
  //                     Email,
  //                     Status,
  //                 });
  //                 if (response.data.statusCode == 200) {
  //                     const msg = response.data.message;
  //                     const MemberURL = `/api/v1/eventstaff?eventId=${finalId}`;
  //                     fetch(MemberURL)
  //                         .then((response) => response.json())
  //                         .then((value) => {
  //                             SetDATATABLE(value.data);
  //                             setTimeout(() => {
  //                                 setIsLoading(false);
  //                             }, 3000);
  //                             fetchData();
  //                             Swal.fire({
  //                                 title: "Done",
  //                                 text: msg,
  //                                 icon: "success",
  //                             });
  //                         });
  //                 } else {
  //                     setIsLoading(false);
  //                     const msg = response.data.message;
  //                     Swal.fire({
  //                         title: "Oops!",
  //                         text: msg,
  //                         icon: "error",
  //                     });
  //                 }
  //             }
  //         } catch (error) {
  //             Swal.fire({
  //                 title: "Error",
  //                 text: error,
  //                 icon: "error",
  //             });
  //             console.error("Error:", error);
  //         }
  //     } else if (Email.length > 1) {
  //         try {
  //             const confirmationResult = await Swal.fire({
  //                 title: 'Warning',
  //                 text: 'Are you sure you want to send invitation?',
  //                 icon: "question",
  //                 showCancelButton: true,
  //                 confirmButtonText: "Yes!",
  //                 cancelButtonText: "No, cancel",
  //             });

  //             if (confirmationResult.isConfirmed) {
  //                 setIsLoading(true);
  //                 const response = await axios.post(STATUS_API, {
  //                     key: "sendInvitation",
  //                     Email,
  //                     Status,
  //                 });

  //                 if (response.data.statusCode == 200) {
  //                     const msg = response.data.message;
  //                     // localStorage.setItem("staticAdded", msg);
  //                     const MemberURL = `/api/v1/eventstaff?eventId=${finalId}`;
  //                     fetch(MemberURL)
  //                         .then((response) => response.json())
  //                         .then((value) => {
  //                             SetDATATABLE(value.data);
  //                             setTimeout(() => {
  //                                 setIsLoading(false);
  //                             }, 3000);
  //                             fetchData();
  //                             Swal.fire({
  //                                 title: "Done",
  //                                 text: msg,
  //                                 icon: "success",
  //                             });
  //                         });
  //                 } else {
  //                     setIsLoading(false);
  //                     const msg = response.data.message;
  //                     Swal.fire({
  //                         title: "Oops!",
  //                         text: msg,
  //                         icon: "error",
  //                     });
  //                 }
  //             }
  //         } catch (error) {
  //             Swal.fire({
  //                 title: "Error",
  //                 text: error,
  //                 icon: "error",
  //             });
  //             console.error("Error:", error);
  //         }

  //     }
  // };

  // delete from the third party platform
  const deleteStaff = async (email) => {
    const url = "https://staging.eboxtickets.com/embedcart/deletestaff";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log('Success:', data);
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  // Deleted functionality the staff member
  const handleDeleteMember = (id, WaiverFlags, email) => {
    // console.log("WaiverFlagsWaiverFlags", id, WaiverFlags)
    if (WaiverFlags === 0) {
      Swal.fire({
        title: "Warning",
        text: "Are you sure you want to delete this user?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        setIsLoading(true);

        if (result.isConfirmed) {
          const apiurl = `/api/v1/eventstaff?id=${id}`;
          // await axios.delete(apiurl);
          const deleteResponse = await axios.delete(apiurl);
          if (deleteResponse.data.success) {
            await deleteStaff(email);
            setIsLoading(false);
            const viewapi = `/api/v1/eventstaff?eventId=${finalId}`;
            const response = await axios.get(viewapi);
            SetDATATABLE(response.data.data);
            const msg = deleteResponse.data.message;
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: msg,
            });
          } else {
            setIsLoading(false);
            const msg = deleteResponse.data.message;
            Swal.fire({
              icon: "error",
              title: "Oops!",
              text: msg,
            });
          }
        }
        setIsLoading(false);
      });
    } else if (WaiverFlags === 1) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "The staff member cannot be deleted because they have accepted the terms and conditions.",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "This staff cannot be deleted because they have been sent an email.",
      });
    }
    setIsLoading(false);
  };

  // staff navigate
  const handleStaffEdit = (row) => {
    navigate.push({
      pathname: "/admin/events/editStaff/",
      query: {
        staffid: row.original.id,
        id: finalId,
      },
    });
  };

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "borderrigth",
    },
    {
      Header: "Last Name",
      accessor: "LastName",
      className: "borderrigth",
      Cell: ({ row }) => <div>{row.original.LastName}</div>,
    },
    {
      Header: "First Name",
      accessor: "FirstName",
      className: "borderrigth",
      Cell: ({ row }) => <div>{row.original.FirstName}</div>,
    },
    {
      Header: "Email",
      accessor: "email",
      className: "borderrigth",
      Cell: ({ row }) => <div>{row.original.Email}</div>,
    },
    {
      Header: "Department",
      accessor: "Department",
      className: "borderrigth",
      Cell: ({ row }) => <div>{row.original.Department}</div>,
    },
    // {
    //     Header: "Wristbands",
    //     accessor: "Wristbands",
    //     className: "borderrigth",
    //     Cell: ({ row }) => (
    //         <div>
    //             {row.original.Wristband}
    //         </div>
    //     ),
    // },
    {
      Header: "Status ",
      accessor: "Waiver",
      className: "borderrigth",
      Cell: ({ row }) => (
        <div>
          {/* {row.original.WaiverFlag} */}
          {/* Incomplete */}
          {row.original &&
            row.original.WaiverFlag === 0 &&
            `Incomplete, Email Not Send`}
          {row.original &&
            row.original.WaiverFlag === 2 &&
            `Incomplete, Email Send`}
          {row.original && row.original.WaiverFlag === 1 && "Signed"}
        </div>
      ),
    },
    {
      Header: "Action",
      accessor: "action",
      className: "borderrigth",
      Cell: ({ row }) => (
        <div className="d-flex align-items-center">
          <button
            title="Edit Member"
            className="btn  btn-sm btn-success d-flex me-1"
            onClick={() => handleStaffEdit(row)}
          >
            <i className="bi bi-pencil-square pe-1"> </i>
          </button>

          {row.original && row.original.WaiverFlag === 0 && (
            <button
              title="Delete Member"
              className="btn btn-sm btn-danger d-flex me-1"
              onClick={() =>
                handleDeleteMember(
                  row.original.id,
                  row.original.WaiverFlag,
                  row.original.Email
                )
              }
            >
              <i className="bi bi-trash pe-1"></i>
            </button>
          )}
          {row.original && row.original.WaiverFlag !== 1 && (
            <button
              title="Resend Invitation"
              className="btn btn-sm btn-warning d-flex me-1"
              onClick={() =>
                callStatusApi([row.original.Email], row.original.EventID)
              }
            >
              <i className="bi bi-envelope pe-1"></i>
            </button>
          )}
        </div>
      ),
    },
    {
      Header: "QR Code",
      accessor: "QRCode",
      className: "borderrigth w-8",
      Cell: ({ row }) => (
        <div>
          {/* <img src={row.original.QRCode && row.original.QRCode} alt="QR Code" className="img-fluid"
                    /> */}

          {row.original.QRCode ? (
            <div className="position-relative d-flex justify-content-center align-items-center">
              <Link
                className="text-light stretched-link rounded-pill text-center d-block bg-success"
                style={{
                  width: "90%",
                  zIndex: "2",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                href="#"
                onClick={() => {
                  handleClick(row.original.QRCode);
                }}
              >
                Click Here
              </Link>
              <img
                style={{ filter: "blur(3px)", width: "50%" }}
                src={`/qrCodes/${row.original.QRCode}`}
                alt="QR Code"
                className="pe-auto img-fluid"
              />
            </div>
          ) : (
            "N/A"
          )}
        </div>
      ),
    },

    {
      Header: "Scanned",
      accessor: "usedBy",
      className: "borderrigth w-10",
      Cell: ({ row }) => (
        <div className="stf-tbl-lstTd">
          <span
            className={`badge bg-${getStatusBadgeColor(
              row.original.usedDate ? 2 : 0
            )}`}
          >
            <span className={`font-weight-semibold`}>
              {row.original.usedDate ? "Scanned" : "Not Yet Scanned"}
            </span>
          </span>

          <div >
            {row.original.usedDate && (
              <div className="mb-1">
                <strong>Scanned Date: </strong>
                <Moment format="DD-MMM-YYYY">{row.original.usedDate}</Moment>
              </div>
            )}
            {row.original.scannedBy && (
              <div className="mb-1">
                <strong>Scanned By: </strong>
                {row.original.scannedBy}
              </div>
            )}
          </div>
        </div>
      ),
    },
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

  const [errorAlert, setErrorAlert] = useState("");
  const [openerror, setOpenError] = useState(false);
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
        }, 3000);
      } else {
        setOpenAlert(false);
        setStaticAdded("");
      }
    }
  }, [staticAdded]);

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

  const { globalFilter, pageIndex } = state;

  // Data Searching
  const SearchUrl = "/api/v1/eventstaff";
  const searchStaff = async (event) => {
    setBasic(false)
    event.preventDefault();
    const body = {
      Department: departments,
      key: "SearchStaffDepartment",
      WaiverFlag: waiverFlag,
      EventID: finalId,
      FirstName: firstName,
      LastName: lastName,
      Email: formEmail,
    };
    setIsLoading(true);
    try {
      // const staffTicketData = await handleGetStaffTicket(body);
      // setStaffTickets(staffTicketData);
      // delay(1000);
      const response = await axios.post(SearchUrl, body);
      const mergedData = response.data.result.map((member) => {
        return {
          ...member,
          QRCode: member.TicketDetails?.[0]?.qrcode ?? "",
          usedDate: member.TicketDetails?.[0]?.usedate ?? "",
          scannedBy: `${member.TicketDetails?.[0]?.user?.FirstName || ""} ${member.TicketDetails?.[0]?.user?.LastName || ""
            }`.trim(), // Concatenate FirstName and LastName
        };
      });
      SetDATATABLE(mergedData || []);
      setIsLoading(false);
      // Merge data based on matching memberId and id
      // const mergedData =
      //   response.data &&
      //   response.data.searchResults.map((member) => {
      //     const matchingTicket = staffTicketData.find((ticket) => ticket.memberId == member.id);
      //     if (matchingTicket) {
      //       return { ...member, QRCode: matchingTicket.ticketQR };
      //     }
      //     return member;
      //   });

      // SetDATATABLE(response.data.data || []);
      // setIsLoading(false);
      // SetDATATABLE(response.data.searchResults);
    } catch (err) {
      console.log(err.message);
    }
  };

  // Search reset
  const HandleResetData = () => {
    // setIsLoading(true);
    setBasic(false);
    setDepartments("");
    setWaiverFlag("");
    setFirstName("");
    setLastName("");
    setFormEmail("");
    // handleGetStaffTicket({});
    fetchData(id);
  };

  var Firstname, Lastname, email, department, waiver;
  // Export Excel
  const headers = [
    { label: "StaffID", key: "id" },
    { label: "Last Name", key: "LastNamee" },
    { label: "First Name", key: "FirstNamee" },
    { label: "Email", key: "userEmail" },
    { label: "Department", key: "Department" },
    // { label: "Waiver", key: "Waiver" },
    { label: "Completed", key: "Waiver" },
  ];

  const data = DATATABLE.map((item) => {
    if (item.FirstName != null) {
      Firstname = item.FirstName;
    } else {
      Firstname = "----";
    }
    if (item.LastName != null) {
      Lastname = item.LastName;
    } else {
      Lastname = "----";
    }
    if (item.Email != null) {
      email = item.Email;
    } else {
      email = "----";
    }
    if (item.Department != null) {
      department = item.Department;
    } else {
      department = "----";
    }
    if (item.WaiverFlag != null) {
      // waiver = item.WaiverFlag;
      waiver =
        item.WaiverFlag === 0
          ? "Incomplete, Mail Not Send"
          : item.WaiverFlag === 1
            ? "Signed"
            : item.WaiverFlag === 2
              ? "Incomplete, Mail Send"
              : "Unknown";
    } else {
      waiver = "----";
    }
    return {
      id: item.id + 1,
      FirstNamee: Firstname,
      LastNamee: Lastname,
      userEmail: email,
      Department: department,
      Waiver: waiver,
    };
  });

  const onExportLinkPress = async () => {
    const csvData = [
      headers.map((header) => header.label),
      ...data.map((item) => Object.values(item)),
    ];
    const csvOptions = {
      filename: "my-file.csv",
      separator: ",",
    };
    const csvExporter = new CSVLink(csvData, csvOptions);
    // csvExporter.click();
  };

  // Modal popup open
  const handleClick = (qrCodeData) => {
    setQrImg(qrCodeData);
    setLgShow(true);
  };

  // Popup functions
  let viewDemoShow = (modal) => {
    switch (modal) {
      case "Basic":
        setBasic(true);
        break;
      case "smShow":
        setSmShow(true);
        break;
      case "lgShow":
        setLgShow(true);
        break;
    }
  };

  let viewDemoClose = (modal) => {
    switch (modal) {
      case "Basic":
        setBasic(false);
        break;
      case "smShow":
        setSmShow(false);
        break;
      case "lgShow":
        setLgShow(false);
        break;
      case "gridshow":
        setGridshow(false);
        break;
      case "success":
        setSuccess(false);
        break;
      case "Error":
        setError(false);
        break;
      case "select":
        setSelect(false);
        break;
      case "Scroll":
        setScroll(false);
        break;
      // case "modalShow":
      //   setmodalShow(false)
      // break;
    }
  };

  return (
    <>
      <Seo title={"Events Staff Manager"} />
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Events Staff Manager
          </span>
        </div>

        <div className="justify-content-between d-flex mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15" href="#">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Event
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Staff
            </Breadcrumb.Item>
          </Breadcrumb>

          <Link
            href={"#"}
            className="filtr-icon"
            variant=""
            onClick={() => viewDemoShow("Basic")}
          >
            <i className="bi bi-search "></i>
          </Link>
        </div>
      </div>

      <div className="left-content mt-2">
        <Row className="row-sm mt-4">
          <Col xl={2}>
            <Card className="member-fltr-hid">
              <Card.Body className="px-0 py-2">
                <Form onSubmit={searchStaff} onReset={HandleResetData}>
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault01">
                      First Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault01"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault02">
                      Last Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault02"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault03">Email</CFormLabel>
                    <CFormInput
                      type="email"
                      id="validationDefault03"
                      placeholder="Email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Department
                    </CFormLabel>
                    <Form.Select
                      aria-label="Default select example"
                      className="admn-slct"
                      value={departments}
                      onChange={(e) => setDepartments(e.target.value)}
                    >
                      <option value="">Select</option>
                      {eventDepartment.map((value, index) => (
                        <option key={index} value={value.id}>
                          {value.Department}
                        </option>
                      ))}
                    </Form.Select>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Status
                    </CFormLabel>
                    <Form.Select
                      aria-label="Default select example"
                      className="admn-slct"
                      value={waiverFlag}
                      onChange={(e) => setWaiverFlag(e.target.value)}
                    >
                      <option value="">Select</option>
                      {Object.entries(status).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </Form.Select>
                  </CCol>

                  <CCol md={12} className="d-flex align-items-end justify-content-between mt-3">
                    <Button variant="primary " className="me-2 w-50" type="submit">
                      Submit
                    </Button>
                    <Button variant="secondary" className="w-50" type="reset">
                      Reset
                    </Button>
                  </CCol>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={10}>
            <div className="Mmbr-card">
              <Card>
                {/* Local Storage */}
                {staticAdded != null && openAlert === true && (
                  <Collapse in={openAlert}>
                    <Alert aria-hidden={true} severity="success">
                      {staticAdded}
                    </Alert>
                  </Collapse>
                )}

                {/* Error Alerts */}
                {errorAlert != null && openerror === true && (
                  <Collapse in={openerror}>
                    <Alert aria-hidden={true} variant="danger">
                      {errorAlert}
                    </Alert>
                  </Collapse>
                )}

                <Card.Header className=" ">
                  <div className="d-flex justify-content-between evt-stf-cdHdr flex-wrap align-items-center">
                    <h4 className="card-title card-t  evnt-mbr mg-b-0">
                      {eventName ? eventName.Name : "--"}
                    </h4>

                    <div>
                      <button
                        variant=""
                        className="btn-sm btn-primary  my-1"
                        style={{
                          background: "#845adf",
                          color: "white",
                          border: "none",
                          whiteSpace: "nowrap",
                        }}
                        type="button"
                      >
                        {/* Total Scanned Tickets 123:{" "} */}
                        Total Scanned Tickets:{" "}
                        {ticketSaleInfo && ticketSaleInfo.totalscannedtickets} /{" "}
                        {ticketSaleInfo && ticketSaleInfo.totalstafftickets}{" "}
                      </button>
                    </div>

                    <div>
                      <button
                        variant=""
                        className="btn-sm btn-primary  my-1"
                        style={{
                          background: "#845adf",
                          color: "white",
                          border: "none",
                          whiteSpace: "nowrap",
                        }}
                        type="button"
                      >
                        {ticketSaleInfo && (
                          <span>
                            COMP: {ticketSaleInfo.Comp} | CORE:{" "}
                            {ticketSaleInfo.CORE} | STAFF:{" "}
                            {ticketSaleInfo.STAFF} | PRESS/DJS:{" "}
                            {ticketSaleInfo.PressDJs}
                          </span>
                        )}
                      </button>
                    </div>

                    <div>
                      {selectedRows.length > 0 && (
                        <Button
                          variant="contained"
                          color="primary"
                          type="button"
                          className="btn-sm btn-primary hide-btn mx-2 my-1"
                          style={{ backgroundColor: "#007bff", color: "white" }}
                          onClick={() => callStatusApi(selectedRows, id)}
                        >
                          Send Invitation
                        </Button>
                      )}

                      <IconButton className="p-0 exprt-btnCSV" onClick={onExportLinkPress}>
                        <CSVLink
                          headers={headers}
                          data={data}
                          filename={"staff.csv"}
                          className="btn btn-sm btn-primary-light my-1 "
                          target="_blank"
                        >
                          Export CSV
                          {/* <i className="bi bi-file-earmark-excel-fill"></i> */}
                        </CSVLink>
                      </IconButton>

                      <Link
                        className="btn ripple btn-info mx-2 btn-sm my-1"
                        style={{
                          backgroundColor: "#007bff",
                          color: "#fff",
                        }}
                        href={`/admin/events/addstaffcsv/?id=${finalId}`}
                      >
                        Import CSV
                      </Link>

                      <Link
                        className="btn ripple btn-info btn-sm my-1"
                        href={`/admin/events/addStaff/?id=${finalId}`}
                      >
                        Add Staff
                      </Link>
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="p-2">
                  <div className="evt-staff-tblRes">
                    <table
                      {...getTableProps()}
                      className="table table-bordered responsive-table table-hover mb-0 text-md-nowrap"
                    >
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              onChange={toggleAllRowsSelected}
                              checked={
                                selectedRows.length === page.length &&
                                page.length > 0
                              }
                            />
                          </th>
                          {headerGroups.map((headerGroup) => (
                            <React.Fragment key={Math.random()}>
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
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>

                      {isLoading ? (
                        <tbody>
                          <tr>
                            <td colSpan={10}>
                              <div
                                className="loader inner-loader"
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
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
                            const rowStyle =
                              row.original.WaiverFlag === 2
                                ? {
                                  backgroundColor: "rgba(215, 178, 38, 0.53)",
                                }
                                : row.original.WaiverFlag === 1
                                  ? {
                                    backgroundColor: "rgba(56, 202, 179, 0.31)",
                                  }
                                  : {};

                            prepareRow(row);
                            return (
                              <tr
                                className={`tbl-rw`}
                                key={Math.random()}
                                {...row.getRowProps()}
                                style={rowStyle}
                              >
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={isSelected(row.original.Email)}
                                    onChange={() =>
                                      toggleRowSelected(
                                        row.original.Email,
                                        row.original.id
                                      )
                                    }
                                  />
                                </td>
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
                              </tr>
                            );
                          })}
                        </tbody>
                      )}
                    </table>

                    <div className="d-block mt-4 mt-sm-2 d-sm-flex mx-0 mx-sm-2">
                      <span className="">
                        Page{" "}
                        <strong>
                          {pageIndex + 1} of {pageOptions.length}
                        </strong>{" "}
                      </span>
                      <span className="ms-sm-auto ">
                        <Button
                          variant=""
                          className="btn-default tablebutton me-2  my-1"
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
                          className="btn-default tablebutton me-2  my-1"
                          onClick={() => gotoPage(pageCount - 1)}
                          disabled={!canNextPage}
                        >
                          {" Next "}
                        </Button>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      <Modal
        centered
        size="md"
        show={lgShow}
        aria-labelledby="example-modal-sizes-title-sm"
      >
        <Modal.Header>
          <Modal.Title>QR Code</Modal.Title>
          <Button
            variant=""
            className="btn btn-close ms-auto"
            onClick={() => {
              viewDemoClose("lgShow");
            }}
          >
            x
          </Button>
        </Modal.Header>

        <Modal.Body>
          <div className="container-fluid text-center px-sm-3 px-0">
            <img
              className="bd-placeholder-img"
              width="200px"
              src={`/qrCodes/${qrImg}`}
              alt="qrCodes"
            />
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={basic} className="Member-filtr-mdlDgn">
        <Modal.Header>
          <Modal.Title>Search here</Modal.Title>
          <Button
            variant=""
            className="btn btn-close"
            onClick={() => {
              viewDemoClose("Basic");
            }}
          >
            <i class="bi bi-x"></i>
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={searchStaff} onReset={HandleResetData}>
            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault01">First Name</CFormLabel>
              <CFormInput
                type="text"
                id="validationDefault01"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </CCol>
            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault02">Last Name</CFormLabel>
              <CFormInput
                type="text"
                id="validationDefault02"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault03">Email</CFormLabel>
              <CFormInput
                type="email"
                id="validationDefault03"
                placeholder="Email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">Department</CFormLabel>
              <Form.Select
                aria-label="Default select example"
                className="admn-slct"
                value={departments}
                onChange={(e) => setDepartments(e.target.value)}
              >
                <option value="">Select</option>
                {eventDepartment.map((value, index) => (
                  <option key={index} value={value.id}>
                    {value.Department}
                  </option>
                ))}
              </Form.Select>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">Status</CFormLabel>
              <Form.Select
                aria-label="Default select example"
                className="admn-slct"
                value={waiverFlag}
                onChange={(e) => setWaiverFlag(e.target.value)}
              >
                <option value="">Select</option>
                {Object.entries(status).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </Form.Select>
            </CCol>

            <div className="d-flex  mt-2">
              <Button variant="primary me-3" type="submit">
                Submit
              </Button>
              <Button variant="secondary" type="reset">
                Reset
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
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

MembersTable.layout = "Contentlayout";

export default MembersTable;
