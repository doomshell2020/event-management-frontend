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
import Moment from "react-moment";
import moment from "moment";
import { MultiSelect } from "react-multi-select-component";
import { useRouter } from "next/router";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { CSVLink, CSVDownload } from "react-csv";
import Image from "next/image";

import {
  CForm,
  CCol,
  CFormLabel,
  CFormFeedback,
  CFormInput,
  CButton,
} from "@coreui/react";
const MembersTable = () => {
  const [basic, setBasic] = useState(false);
  const [lgShow, setLgShow] = useState(false);
  const [DATATABLE, SetDATATABLE] = useState([]);
  const [modalData, setModalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [Mobile, setMobile] = useState("");
  const [ID, setID] = useState("");
  const [MembershipLevel, setMembershipLevel] = useState("");
  const [recently_approved, setRecently_approved] = useState();
  const [Status, setStatus] = useState("");
  const [Artist, setArtist] = useState("");
  const [CareyesHomeownerFlag, setCareyesHomeownerFlag] = useState("");
  const [attended_festival_before, setAttended_festival_before] = useState("");
  const [Interests, setInterests] = useState([]);
  const [Country, setCountry] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [checkedButton, setCheckedButton] = useState(false);
  const [searchInviteButton, setSearchInviteButton] = useState(false);
  const [pages, setPage] = useState(1);
  const [invited, setInvited] = useState("");
  const router = useRouter();

  const [activeRow, setActiveRow] = useState(null);
  const rowRefs = useRef({}); // To keep references to rows
  const { query } = router;
  const { id, currentPage } = query;
  const [currentEventId, setCurrentEventId] = useState(id);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const getId = localStorage.getItem("currentEventId");
      setCurrentEventId(getId);
    }
  }, []);

  const handleRowClick = (rowId) => {
    setActiveRow(rowId);
    localStorage.setItem("activeRow", rowId);
  };

  useEffect(() => {
    setPageSize(50);
    setFirstName(query.fname || "");
    setLastName(query.lname || "");
    setEmail(query.member_email || "");
    setMobile(query.mobile || "");
    setID(query.member_id || "");
    setMembershipLevel(query.membership_level || "");
    setStatus(query.membership_status || "");
    setCareyesHomeownerFlag(query.careyes_homeowner || "");
    setAttended_festival_before(query.past_event_attended || "");
    setInvited(query.invited || "");
    setInterests(
      query.member_interest
        ? query.member_interest
          .split(",")
          .map((value) =>
            InterestedOptions.find((option) => option.value === value)
          )
        : []
    );
    setCountry(
      query.member_location
        ? query.member_location
          .split(",")
          .map((value) =>
            LocationOptions.find((option) => option.value === value)
          )
        : []
    );
    setRecently_approved(query.search_recently_approved || "");
    setArtist(query.artist_type || "");
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      fetchData(query); // Fetch data when 'pages' or 'pageSize' changes.
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [
    query.fname,
    query.lname,
    query.mobile,
    query.member_email,
    query.member_id,
    query.membership_level,
    query.membership_status,
    query.careyes_homeowner,
    query.past_event_attended,
    query.member_interest,
    query.member_location,
    query.search_recently_approved,
    query.invited,
  ]);

  // const fetchData = async (params) => {
  //   // console.log("🚀 ~ fetchData ~ params:", params)
  //   try {
  //     setIsLoading(true); // Set loading state to true
  //     const queryString = new URLSearchParams(params).toString();
  //     // const memberURL = `/api/v1/members?${queryString}`;
  //     const memberURL = `/api/v2/members/getAllMembers?${queryString}`;
  //     const response = await axios.get(memberURL);
  //     SetDATATABLE(response.data.data || []);
  //     const currentPage = getQueryParam("currentPage");
  //     const parsedPage = parseInt(currentPage, 10) || 1;
  //     const timeoutId = setTimeout(() => {
  //       setPage(parsedPage);
  //       gotoPage(parsedPage - 1);
  //       setIsLoading(false);
  //       const savedActiveRow = localStorage.getItem("activeRow");
  //       if (savedActiveRow) {
  //         setActiveRow(savedActiveRow);
  //         const timeoutId2 = setTimeout(() => {
  //           rowRefs.current[savedActiveRow]?.scrollIntoView({
  //             behavior: "smooth",
  //             block: "center",
  //           });
  //         }, 200);
  //         return () => clearTimeout(timeoutId2);
  //       }
  //     }, 1500);

  //     return () => clearTimeout(timeoutId);
  //   } catch (error) {
  //     setIsLoading(false);
  //     SetDATATABLE([]);
  //   }
  // };

  // Function to parse query parameters from URL


  const fetchData = async (params) => {
    try {
      setIsLoading(true);
      const queryString = new URLSearchParams(params).toString();
      const memberURL = `/api/v2/members/getAllMembers?${queryString}`;

      const response = await axios.get(memberURL);
      const data = response.data?.data || [];
      SetDATATABLE(data);

      const currentPage = parseInt(getQueryParam("currentPage"), 10) || 1;
      setPage(currentPage);
      gotoPage(currentPage - 1);
      setIsLoading(false);
      // Scroll to previously active row if present
      const savedActiveRow = localStorage.getItem("activeRow");
      if (savedActiveRow && rowRefs.current[savedActiveRow]) {
        // Delay just enough to let DOM update (no more than 100ms)
        setTimeout(() => {
          rowRefs.current[savedActiveRow]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setActiveRow(savedActiveRow);
        }, 100);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      SetDATATABLE([]);
      setIsLoading(false);
    }
  };

  const getQueryParam = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };
  const [selectedRows, setSelectedRows] = useState([]);
  const toggleRowSelected = (rowId) => {
    setSearchInviteButton(false);
    setCheckedButton(true);
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  const isSelected = (rowId) => {
    return selectedRows.includes(rowId);
  };

  const toggleAllRowsSelected = () => {
    setCheckedButton(true);
    setSearchInviteButton(false);
    // Filter out rows with Status == 1 and get their ids
    const allRowIds = DATATABLE.filter((row) => row.Status === 1) // Filter rows with Status == 1
      .map((row) => row.id); // Extract the ids

    if (selectedRows.length === allRowIds.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allRowIds);
    }
  };


  // new
  function generateEventDropdown(eventName) {
    const dropdownOptions = eventName.map((event) => {
      return `
        <option value="${event.id}">${event.Name}</option>`;
    });

    const dropdownHtml = `
      <select id="eventDropdown" className="swal2-select">
        <option value="">Select Event</option>
        ${dropdownOptions.join("")}
      </select>
    `;

    return dropdownHtml;
  }

  // Single Invited Events
  const SingleInviteEvent = async (event) => {
    const submitBtn = document.getElementById("submitBtn");
    // submitBtn.click();
    const response = await axios.get("/api/v1/events?active=1");
    const events = response.data.data;
    const dropdownHtml = generateEventDropdown(events);
    let selectedEventId;

    const confirmationResult = await Swal.fire({
      title: "Are you sure you want to invite?",
      html: `
      <div>
        <p>Select an event to invite:</p>
        ${dropdownHtml}
      </div>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Invite!",
      cancelButtonText: "No, Cancel",
      preConfirm: () => {
        selectedEventId = document.getElementById("eventDropdown").value;
        if (!selectedEventId) {
          Swal.showValidationMessage("Please select an event.");
          return false;
        }
      },
    });

    if (confirmationResult.isConfirmed) {
      if (event.id != null && selectedEventId != null) {
        setIsLoading(true);
        const CmsAddUrl = "/api/v1/invitationevents";
        const userID = String(event.id);
        const userIDArray = [userID];
        const body = {
          UserID: userIDArray,
          key: "Addinvitation",
          EventID: selectedEventId,
        };

        await axios
          .post(CmsAddUrl, body)
          .then((res) => {
            const msg = res.data.message;
            Swal.fire({
              title: "Done!",
              text: msg,
              icon: "success",
              customClass: { popup: "add-tckt-dtlpop" },
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload();
                setIsLoading(false);
                handleRowClick(userID);
              }
              setSpinner(false);
              setIsLoading(false);
            });
          })
          .catch((err) => {
            setIsLoading(false);
            console.log("message", err);
            Swal.fire({
              title: "Error!",
              text: err.message,
              icon: "error",
              customClass: { popup: "add-tckt-dtlpop" },
            });
          });
      }
    }
    setIsLoading(false);
  };


  const callStatusApi = async (userId, status) => {
    const STATUS_API = `/api/v1/members`;

    try {
      const confirmationResult = await Swal.fire({
        title: "Are you sure you want to change status?",
        icon: "question",
        customClass: { popup: "add-tckt-dtlpop" },
        showCancelButton: true,
        confirmButtonText: "Yes, change!",
        cancelButtonText: "No, cancel",
      });

      if (!confirmationResult.isConfirmed) return;
      setIsLoading(true);

      const response = await axios.get(STATUS_API, {
        params: { userId, status },
      });

      if (response.data) {
        const msg = response.data.message;
        Swal.fire({
          title: "Done",
          text: msg,
          customClass: { popup: "add-tckt-dtlpop" },
          icon: "success",
        }).then((result) => {
          handleRowClick(userId);
          if (result.isConfirmed) {
            window.location.reload();
            setIsLoading(false);
          }
        });
      } else {
        setIsLoading(false);
        Swal.fire({
          title: "Error",
          customClass: { popup: "add-tckt-dtlpop" },
          text: "Something went wrong",
          icon: "error",
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        customClass: { popup: "add-tckt-dtlpop" },
        text: error.response?.data?.message || "An error occurred",
        icon: "error",
      });
    }
  };

  const getCountryLabel = (countryGroup) => {
    switch (countryGroup) {
      case 0:
        return "N/A";
      case 1:
        return "Europe";
      case 2:
        return "Africa";
      case 3:
        return "Mexico";
      case 4:
        return "South America";
      case 5:
        return "USA";
      case 6:
        return "Australia";
      case 7:
        return "North America";
      case 8:
        return "Middle East";
      case 9:
        return "Asia";
      case 10:
        return "Oceania";
      default:
        return "Unknown";
    }
  };

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "wd-3p borderrigth Mbr-mbl-hid",
    },
    {
      Header: "User Details",
      accessor: "UserDetails",
      className: "borderright",
      Cell: ({ row }) => (
        <div className="d-flex mt-2 align-items-start">
          <div className="evnt-invts-prfl membr-invts-prfl me-2">
            {row.original.ImageURL ? (
              <Image
                src={
                  row.original?.ImageURL
                    ? `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${row.original.ImageURL}`
                    : `${process.env.NEXT_PUBLIC_S3_URL}/housing/housingdumy.png`
                }
                alt="Profile"
                width={50}
                height={50}
              />
            ) : (
              <Image
                src="/uploads/profiles/default.png"
                alt="Default Profile"
                width={50}
                height={50}
              />
            )}
          </div>
          <div className="d-flex flex-column">
            <strong className="mbr_tbl_nm">
              <Link
                href="#"
                customvalue={`${row.original.id}`}
                className="rupam"
                onClick={handleClick}
                style={{ textDecoration: "underline", color: "blue" }}
              >
                {`${row.original.LastName || ""}, ${row.original.FirstName || ""
                  }`}


              </Link>
            </strong>
            <Link
              href="#"
              customvalue={`${row.original.id}`}
              className="d-block rupam mt-1 mb-1"
              onClick={handleClick}
              style={{ textDecoration: "none", color: "black" }}
            >
              {row.original.Email && row.original.Email.toLowerCase()}

            </Link>

            <Link
              href="#"
              customvalue={`${row.original.id}`}
              className="d-block rupam mt-1 mb-1"
              onClick={handleClick}
              style={{ textDecoration: "none", color: "black" }}
            >
              {row.original.PhoneNumber}
            </Link>
          </div>
        </div>
      ),
      sortType: (a, b, id) => {
        const LastNameA = (a.original.LastName || "").toLowerCase();
        const LastNameB = (b.original.LastName || "").toLowerCase();
        const FirstNameA = (a.original.FirstName || "").toLowerCase();
        const FirstNameB = (b.original.FirstName || "").toLowerCase();
        const EmailA = (a.original.Email || "").toLowerCase();
        const EmailB = (b.original.Email || "").toLowerCase();

        // Sort by Last Name, then First Name, then Email
        return (
          LastNameA.localeCompare(LastNameB) ||
          FirstNameA.localeCompare(FirstNameB) ||
          EmailA.localeCompare(EmailB)
        );
      },
      filter: "text", // Enable text filtering
    },
    {
      Header: "Location",
      accessor: "country_group",
      className: "borderRight wd-7p",
      Cell: ({ row }) => (
        <div>{getCountryLabel(row.original.country_group)}</div>
      ),
      filter: "text",
      sortType: (a, b, id) => {
        const countryGroupA = getCountryLabel(
          a.original.country_group
        ).toLowerCase();
        const countryGroupB = getCountryLabel(
          b.original.country_group
        ).toLowerCase();
        return countryGroupA.localeCompare(countryGroupB);
      },
    },

    {
      Header: "Status",
      accessor: "Status",
      className: "borderrigth wd-15p",
      Cell: ({ row }) => (
        <ButtonGroup className=" w-100">
          <Dropdown className="btn-group btn-group-sm">
            <Button
              variant=""
              type="button"
              className={`btn ${row.original.Status === 0
                ? "btn-warning btn-sm" // Under review (Yellow)
                : row.original.Status === 1
                  ? "btn-success btn-sm" // Approved (Green)
                  : row.original.Status === 2
                    ? "btn-danger btn-sm" // Rejected (Red)
                    : row.original.Status === 3
                      ? "btn-secondary btn-sm" // Denied (Gray)
                      : row.original.Status === 4
                        ? "btn-dark btn-sm" // Blocked (Black)
                        : "btn-primary btn-sm" // Default to btn-primary if status is null or not matched
                }`}
            >
              {row.original.Status === null && "N/A"}
              {row.original.Status === 0 && "Pending Approval"}
              {row.original.Status === 3 && "Under Review"}
              {row.original.Status === 1 && "Approved"}
              {row.original.Status === 2 && "Rejected"}
              {row.original.Status === 4 && "Blocked"}
            </Button>

            <Dropdown.Toggle
              variant=""
              type="button"
              className="btn btn-primary dropdown-toggle split-dropdown"
              data-bs-toggle="dropdown"
            >
              <span className="caret">
                {/* <i className="bi bi-chevron-down"></i> */}
              </span>
              <span className="sr-only">Toggle Dropdown</span>
            </Dropdown.Toggle>

            <Dropdown.Menu
              style={{ margin: "0px" }}
              className="dropdown-menu tx-13"
            >
              <Dropdown.Item
                className="apprl-drop"
                href="#"
                onClick={() => callStatusApi(row.original.id, 0)}
              >
                Pending Approval
              </Dropdown.Item>

              <Dropdown.Item
                className="apprl-drop"
                href="#"
                onClick={() => callStatusApi(row.original.id, 3)}
              >
                Under Review
              </Dropdown.Item>

              <Dropdown.Item
                className="apprl-drop"
                href="#"
                onClick={() => callStatusApi(row.original.id, 1)}
              >
                Approved
              </Dropdown.Item>

              <Dropdown.Item
                className="apprl-drop"
                href="#"
                onClick={() => callStatusApi(row.original.id, 2)}
              >
                Rejected
              </Dropdown.Item>

              <Dropdown.Item
                className="apprl-drop"
                href="#"
                onClick={() => callStatusApi(row.original.id, 4)}
              >
                Blocked
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </ButtonGroup>
      ),
    },

    {
      Header: "Invitations",
      accessor: "id",
      className: "borderright wd-5p",
      Cell: ({ row }) => (
        <div style={{ whiteSpace: "nowrap" }}>
          {row.original.id && row.original.Status === 1 ? (
            row.original.isInvited ? (
              // Show dynamic event name or default to "Ox Montenegro 2025" with smaller font size
              <span
                className="main-content-title mg-b-0 mg-b-lg-1"
                style={{ fontSize: "12px" }}
              >
                {/* {row.original.eventName || "Ox Montenegro 2025"} */}
                {row.original.eventName || "Ox Careyes 2025"}
              </span>
            ) : (
              <Button
                variant=""
                type="button"
                className="btn btn-sm btn-info"
                onClick={() => SingleInviteEvent(row.original)}
              >
                +INVITE
              </Button>
            )
          ) : (
            <span
              className="main-content-title mg-b-0 mg-b-lg-1"
              style={{ fontSize: "12px" }}
            >
              N/A
            </span>
          )}
        </div>
      ),
    },
    {
      Header: "Membership",
      accessor: "MembershipTypes",
      className: "borderrigth wd-7p",
      Cell: ({ row }) => (
        <div>
          {row.original.MembershipTypes === 0 && "N/A"}
          {row.original.MembershipTypes === 1 && "Founding"}
          {row.original.MembershipTypes === 2 && "Paying"}
          {row.original.MembershipTypes === 3 && "Free"}
          {row.original.MembershipTypes === 4 && "Comp"}
          {row.original.MembershipTypes === 5 && "Staff"}
        </div>
      ),
    },

    {
      Header: "Registered",
      accessor: "Registered",
      className: "borderrigth wd-7p",
      Cell: ({ row }) => (
        <div style={{ whiteSpace: "nowrap" }}>
          <Moment format="DD-MMM-YYYY">
            {new Date(row.original.DateCreated)}
          </Moment>
        </div>
      ),
    },
    {
      Header: "Notes",
      accessor: "admin_notes",
      className: "borderrigth wd-3p",
      Cell: ({ row }) => (
        <div style={{ whiteSpace: "nowrap" }}>
          {row.original.admin_notes ? (
            <button
              onClick={() => showNotesAlert(row.original.admin_notes)}
              className="btn btn-sm btn-primary d-flex me-1"
              title="View Notes"
            >
              <i className="bi bi-eye pe-1"></i>
            </button>
          ) : (
            <span className="text-muted">N/A</span>
          )}
        </div>
      ),
    },

    {
      Header: "Action",
      accessor: "action",
      className: "borderrigth wd-5p",
      Cell: ({ row }) => (
        <div className="d-flex align-items-center">
          <button
            title="Edit Member"
            className="btn  btn-sm btn-success d-flex me-1"
            onClick={() => handleEdit(row)}
          >
            <i className="bi bi-pencil-square pe-1"> </i>
          </button>

          {
            row.original.id !== 1 && (
              <button
                title="Delete Member"
                className="btn btn-sm btn-danger d-flex me-1"
                onClick={() => handleDeleteMember(row.original.id)}
              >
                <i className="bi bi-trash pe-1"></i>
              </button>

            )
          }
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

  // Define a function to show notes in a SweetAlert modal
  const showNotesAlert = (notes) => {
    Swal.fire({
      icon: "info",
      title: "Admin Notes",
      text: notes,
      customClass: { popup: "add-tckt-dtlpop" },
      confirmButtonText: "OK",
    });
  };

  const [errorAlert, setErrorAlert] = useState("");
  const [openerror, setOpenError] = useState(false);

  // Modal popup open
  const handleClick = (e) => {
    // Data view for popup
    const clickedValue = e.target.getAttribute("customvalue");
    const DetailURL = `/api/v1/members?id=${clickedValue}`;
    axios
      .get(DetailURL)
      .then((response) => {
        setModalData(response.data.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    e.preventDefault();
    const target = e.target.classList.contains("rupam");
    if (target) {
      viewDemoShow("lgShow");
    }
  };

  const {
    getTableProps,
    headerGroups,
    getTableBodyProps,
    prepareRow,
    state: { pageIndex, pageSize }, // Extract current page index and page size from state
    setGlobalFilter,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize, // Function to set page size
  } = tableInstance;

  const inviteToAll = async (event) => {
    const totalMembers = DATATABLE.length;
    if (totalMembers > 100) {
      Swal.fire({
        title: "Information",
        text: "You can send invitations to a maximum of 100 members at a time.",
        icon: "info",
        customClass: { popup: "add-tckt-dtlpop" },
      });
      return false;
    }

    const response = await axios.get("/api/v1/events?active=1");
    const events = response.data.data;
    const dropdownHtml = generateEventDropdown(events);
    let selectedEventId;

    const confirmationResult = await Swal.fire({
      title: "Send Invitation",
      html: `
      <div>
        <p>Select an event to invite:</p>
        ${dropdownHtml}
      </div>
      <p>Are you sure you want to send invitations to all ${totalMembers} members in the search list?</p>

    `,
      // text: `Are you sure you want to send invitations to all ${totalMembers} members in the search list?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, send invitations!",
      cancelButtonText: "No, cancel",
      preConfirm: () => {
        selectedEventId = document.getElementById("eventDropdown").value;
      },
    });

    if (confirmationResult.isConfirmed) {
      setIsLoading(true);
      setSpinner(true);
      const userIDsArray = DATATABLE.map((item) => item.id);
      // const selectedLocationsString = userIDsArray.join(',');
      if (!userIDsArray) {
        setIsLoading(false);
        setSpinner(false);
        Swal.fire({
          title: "Error",
          text: "There is no data in the search list",
          icon: "error",
          customClass: { popup: "add-tckt-dtlpop" },
        });
        return false;
      }
      const CmsAddUrl = "/api/v1/invitationevents";
      const body = {
        UserID: userIDsArray,
        key: "Addinvitation",
        EventID: selectedEventId,
      };
      await axios
        .post(CmsAddUrl, body)
        .then((res) => {
          Swal.fire({
            title: "Done!",
            text: res.data.message,
            icon: "success",
            customClass: { popup: "add-tckt-dtlpop" },
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
              setIsLoading(false);
            }
            setSpinner(false);
            setIsLoading(false);
          });
        })
        .catch((err) => {
          setIsLoading(false);
          setSpinner(false);
          Swal.fire({
            title: "Error",
            text: err.message,
            icon: "error",
            customClass: { popup: "add-tckt-dtlpop" },
          });
          setOpenError(true);
          setErrorAlert(message);
          setTimeout(() => {
            setOpenError(false);
          }, 3000);
        });
      setSpinner(false);
    }
  };

  // this is for check and uncheck
  const inviteToAllSelected = async () => {
    const response = await axios.get("/api/v1/events?active=1");
    const events = response.data.data;
    const dropdownHtml = generateEventDropdown(events);
    let selectedEventId;
    const totalMembers = selectedRows.length;
    const confirmationResult = await Swal.fire({
      // title: "Are you sure you want to invite?",
      html: `
      <p>Are you sure you want to send invitations to all ${totalMembers} members in the search list?</p>
      <div>
        <p>Select an event to invite:</p>
        ${dropdownHtml}
      </div>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Invite!",
      cancelButtonText: "No, Cancel",
      customClass: { popup: "add-tckt-dtlpop" },
      preConfirm: () => {
        selectedEventId = document.getElementById("eventDropdown").value;
        if (!selectedEventId) {
          Swal.showValidationMessage("Please select an event.");
          return false;
        }
      },
    });

    if (confirmationResult.isConfirmed) {
      selectedEventId = document.getElementById("eventDropdown").value;

      setIsLoading(true);
      setSpinner(true);
      if (!selectedRows) {
        setIsLoading(false);
        setSpinner(false);
        Swal.fire({
          title: "Error",
          text: "There is no data in the search list",
          icon: "error",
          customClass: { popup: "add-tckt-dtlpop" },
        });
        return false;
      }
      const CmsAddUrl = "/api/v1/invitationevents";

      const body = {
        UserID: selectedRows,
        key: "Addinvitation",
        EventID: selectedEventId,
      };

      await axios
        .post(CmsAddUrl, body)
        .then((res) => {
          setSpinner(false);
          setIsLoading(false);
          setSelectedRows([]);
          const msg = res.data.message;
          Swal.fire({
            title: "Done!",
            text: msg,
            customClass: { popup: "add-tckt-dtlpop" },
            icon: "success",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
              // handleRowClick(cur);
              setIsLoading(false);
            }
            setSpinner(false);
            setIsLoading(false);
          });
        })
        .catch((err) => {
          setIsLoading(false);
          setSpinner(false);
          Swal.fire({
            title: "Error",
            text: err.message,
            icon: "error",
            customClass: { popup: "add-tckt-dtlpop" },
          });
          // console.log("message", message)
          setOpenError(true);
          setErrorAlert(message);
          setTimeout(() => {
            setOpenError(false);
          }, 3000);
        });

      setIsLoading(false);
    }
  };

  // Route Change
  const routeChange = () => {
    // let path = `/admin/members`;
    let path = `/admin/members`;
    navigate.push({
      pathname: path,
      // search: `?id=${currentEventId}`,
    });
  };

  // Data Searching
  const SearchMember = async (event) => {
    event.preventDefault();
    try {
      setSearchInviteButton(true);
      setCheckedButton(false);
      setIsLoading(true);
      setSelectedRows([]);
      setBasic(false);
      setPage(1);

      const queryParams = {};

      if (FirstName?.trim()) queryParams.fname = FirstName.trim();
      if (LastName?.trim()) queryParams.lname = LastName.trim();
      if (ID?.trim()) queryParams.member_id = ID.trim();
      if (Mobile?.trim()) queryParams.mobile = Mobile.trim();
      if (Email?.trim()) queryParams.member_email = Email.trim();
      if (MembershipLevel) queryParams.membership_level = MembershipLevel;
      if (Status) queryParams.membership_status = Status;
      if (CareyesHomeownerFlag) queryParams.careyes_homeowner = CareyesHomeownerFlag;
      if (Artist !== '') queryParams.artist_type = Artist;
      if (attended_festival_before !== '') queryParams.past_event_attended = attended_festival_before;
      if (recently_approved !== '') queryParams.search_recently_approved = recently_approved;
      if (invited !== '') queryParams.invited = invited;

      if (Interests?.length > 0) {
        queryParams.member_interest = Interests.map(e => e.value.trim()).join(',');
      }

      if (Country?.length > 0) {
        queryParams.member_location = Country.map(e => e.value.trim()).join(',');
      }

      if (Object.keys(queryParams).length === 0) {
        setIsLoading(false);
        return;
      }

      const newUrl = `${window.location.pathname}?${new URLSearchParams(queryParams).toString()}`;
      window.history.replaceState({}, document.title, newUrl);
      // setIsLoading(false);
      navigate.push(newUrl);
    } catch (error) {
      console.error(error.message);
      setIsLoading(false);
      setIsSearch(false);
    }
  };



  // const SearchMember = async (event) => {
  //   try {
  //     setSearchInviteButton(true);
  //     setCheckedButton(false);
  //     setIsLoading(true);
  //     event.preventDefault();
  //     setSelectedRows([]);
  //     setBasic(false);
  //     const currentUrl = window.location.href;
  //     const [baseUrl] = currentUrl.split("?");
  //     const newUrl = baseUrl;
  //     window.history.replaceState({}, document.title, newUrl);
  //     setPage(1);
  //     // Check if any of the parameters is provided, if not, keep the previous 'data' value (empty array).
  //     if (
  //       !FirstName &&
  //       !LastName &&
  //       !ID &&
  //       !MembershipLevel &&
  //       !Status &&
  //       !Email &&
  //       !Artist &&
  //       !CareyesHomeownerFlag &&
  //       !attended_festival_before &&
  //       !Interests &&
  //       !Country &&
  //       !invited
  //     ) {
  //       setIsLoading(false);
  //       return;
  //     }
  //     const queryParams = {
  //       fname: FirstName,
  //       lname: LastName,
  //       member_email: Email,
  //       mobile: Mobile,
  //       member_id: ID,
  //       membership_level: MembershipLevel,
  //       membership_status: Status,
  //       careyes_homeowner: CareyesHomeownerFlag,
  //       past_event_attended: attended_festival_before,
  //       member_interest:
  //         Interests && Interests.length > 0
  //           ? Interests.map((e) => e.value).join(",")
  //           : "",
  //       member_location:
  //         Country && Country.length > 0
  //           ? Country.map((e) => e.value).join(",")
  //           : "",
  //       search_recently_approved: recently_approved,
  //       artist_type: Artist,
  //       currentPage: 1,
  //       invited: invited,
  //     };
  //     const queryString = new URLSearchParams(queryParams).toString();
  //     navigate.push({
  //       query: queryString, // Pass the search parameters as query parameters
  //     });
  //   } catch (error) {
  //     setIsLoading(false);
  //     setIsSearch(false);
  //     console.error(error.message);
  //   }
  // };




  // View Present and future Events
  const ViewPresentAndPastEvents = async () => {
    try {
      const body = new FormData();
      body.append("key", "CurrentAndFeatureEvents");
      const response = await axios.post("/api/v1/members", body);
      // console.log("CurrentAndFeatureEvents", response.data.data)
      setEvents(response.data.data);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    ViewPresentAndPastEvents();
  }, []);

  // Search reset
  const HandleResetData = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setMobile("");
    setID("");
    setMembershipLevel("");
    setStatus("");
    setCareyesHomeownerFlag("");
    setAttended_festival_before("");
    setInterests("");
    setCountry("");
    setRecently_approved("");
    setArtist("");
    setInvited("");
    setBasic(false);
    setPage(1);
    routeChange();
    setSelectedRows([]);
    // fetchData({});
  };

  // Delete Member
  const handleDeleteMember = async (id) => {
    try {
      // Show confirmation dialog to the user
      const result = await Swal.fire({
        title: "Confirm Delete",
        text: "This member will be permanently deleted. Proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Delete",
        customClass: { popup: "add-tckt-dtlpop" },
      });

      if (result.isConfirmed) {
        // Show processing popup
        Swal.fire({
          title: "Processing...",
          text: "Please wait while we delete the member.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: { popup: "add-tckt-dtlpop" },
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const deleteMemberApi = "/api/v1/members";
        const delete_response = await axios.delete(
          `${deleteMemberApi}?id=${id}`
        );

        Swal.close(); // Close the processing popup after response

        if (delete_response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Member Deleted",
            text: "The member has been successfully deleted.",
            customClass: { popup: "add-tckt-dtlpop" },
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Deletion Failed",
            customClass: { popup: "add-tckt-dtlpop" },
            text: delete_response.data.message || "Failed to delete member.",
          });
        }
      }
    } catch (error) {
      Swal.close(); // Close the processing popup in case of error
      await Swal.fire({
        icon: "error",
        title: "Error",
        customClass: { popup: "add-tckt-dtlpop" },
        text: error.message || "An error occurred. Please try again later.",
      });
    }
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
      case "gridshow":
        setGridshow(true);
        break;
      case "success":
        setSuccess(true);
        break;
      case "Error":
        setError(true);
        break;
      case "select":
        setSelect(true);
        break;
      case "Scroll":
        setScroll(true);
        break;
      // case "modalShow":
      //   setmodalShow(true)
      // break;
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

  // Export Excel
  const handleExport = async () => {
    if (!Array.isArray(DATATABLE)) {
      console.error("Invalid DATATABLE: Expected an array.");
      return;
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Members");

    // Define headers with auto width
    worksheet.columns = [
      { header: "S.No", key: "serialNumber", width: 10 },
      { header: "First Name", key: "FirstNamee", width: 20 },
      { header: "Last Name", key: "LastNamee", width: 20 },
      { header: "Email", key: "userEmail", width: 25 },
      { header: "Mobile", key: "userMobile", width: 15 },
      { header: "Location", key: "userLocation", width: 15 },
      { header: "Registered", key: "userRegistered", width: 15 },
      { header: "Status", key: "userStatus", width: 15 },
    ];

    // Add header styles and enable filters
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF000000" }, // Dark color (black)
        bgColor: { argb: "FFFFFFFF" }, // Background color (white)
      };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true }; // White text and bold
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    // worksheet.autoFilter = "A1:AJ1"; // Enable filters
    worksheet.views = [{ state: "frozen", ySplit: 1 }]; // Freeze the first row

    // Add data rows
    DATATABLE.forEach((item, index) => {
      const getStatusLabel = (Status) => {
        if (Status === null) return "N/A";
        if (Status === 0) return "Pending Approval";
        if (Status === 1) return "Approved";
        if (Status === 2) return "Rejected";
        if (Status === 3) return "Under Review";
        if (Status === 4) return "Blocked";
        return "N/A";
      };
      const getCountryLabel = (country_group) => {
        if (country_group === null) return "N/A";
        if (country_group === 1) return "Europe";
        if (country_group === 2) return "Africa";
        if (country_group === 3) return "Mexico";
        if (country_group === 4) return "South America";
        if (country_group === 5) return "USA";
        if (country_group === 6) return "Australia";
        return "N/A";
      };

      worksheet.addRow({
        serialNumber: index + 1, // Add serial number
        FirstNamee: item.FirstName || "----",
        LastNamee: item.LastName || "----",
        userEmail: item.Email || "----",
        userMobile: item.PhoneNumber || "----",
        userLocation: getCountryLabel(item.country_group),
        userRegistered: item.DateCreated
          ? moment(item.DateCreated).format("YYYY-MM-DD")
          : "----",
        userStatus: getStatusLabel(item.Status),
      });
    });

    // Generate the Excel file as a Blob and use file-saver to save it
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "members.xlsx");
    } catch (err) {
      console.error;
    }
  };

  // Export PDF
  // Export PDF
  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      const columns = [
        "S.No",
        "First Name",
        "Last Name",
        "Email",
        "Mobile",
        "Location",
        "Registered",
        "Status",
      ]; // Adjust columns as needed
      const rows = []; // Populate rows with your data, similar to how you did for Excel

      // Example data population
      DATATABLE.forEach((item, index) => {
        const getStatusLabel = (Status) => {
          if (Status === null) return "N/A";
          if (Status === 0) return "Pending Approval";
          if (Status === 1) return "Approved";
          if (Status === 2) return "Rejected";
          if (Status === 3) return "Under Review";
          if (Status === 4) return "Blocked";
          return "N/A";
        };

        const getCountryLabel = (country_group) => {
          if (country_group === null) return "N/A";
          if (country_group === 1) return "Europe";
          if (country_group === 2) return "Africa";
          if (country_group === 3) return "Mexico";
          if (country_group === 4) return "South America";
          if (country_group === 5) return "USA";
          if (country_group === 6) return "Australia";
          return "N/A";
        };

        rows.push([
          index + 1, // S.No
          item.FirstName || "----", // First Name
          item.LastName || "----", // Last Name
          item.Email || "----", // Email
          item.PhoneNumber || "----", // Mobile
          getCountryLabel(item.country_group), // Location
          item.DateCreated
            ? moment(item.DateCreated).format("YYYY-MM-DD")
            : "----", // Registered
          getStatusLabel(item.Status), // Status
        ]);
      });

      pdf.text(235, 40, "Members");
      pdf.autoTable(columns, rows, {
        startY: 65,
        theme: "grid",
        styles: {
          font: "times",
          halign: "center",
          cellPadding: 3.5,
          fontSize: 8, // Adjust font size
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
          textColor: [0, 0, 0],
        },
        headStyles: {
          textColor: [0, 0, 0],
          fontStyle: "normal",
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
          fillColor: [166, 204, 247],
        },
        alternateRowStyles: {
          fillColor: [212, 212, 212],
          textColor: [0, 0, 0],
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
        },
        rowStyles: {
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
          rowHeight: 12, // Adjust row height
        },
        tableLineColor: [0, 0, 0],
      });

      console.log(pdf.output("datauristring"));
      pdf.save("members.pdf");
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  // Export CSV
  const headers = [
    { label: "S.No", key: "serialNumber" },
    { label: "First Name", key: "FirstNamee" },
    { label: "Last Name", key: "LastNamee" },
    { label: "Email", key: "userEmail" },
    { label: "Mobile", key: "userMobile" },
    { label: "Location", key: "userLocation" },
    { label: "Registered", key: "userRegistered" },
    { label: "Status", key: "userStatus" },
  ];

  const data = DATATABLE.map((item, index) => {
    const getStatusLabel = (Status) => {
      if (Status === null) return "N/A";
      if (Status === 0) return "Pending Approval";
      if (Status === 1) return "Approved";
      if (Status === 2) return "Rejected";
      if (Status === 3) return "Under Review";
      if (Status === 4) return "Blocked";
      return "N/A";
    };

    const getCountryLabel = (country_group) => {
      if (country_group === null) return "N/A";
      if (country_group === 1) return "Europe";
      if (country_group === 2) return "Africa";
      if (country_group === 3) return "Mexico";
      if (country_group === 4) return "South America";
      if (country_group === 5) return "USA";
      if (country_group === 6) return "Australia";
      return "N/A";
    };

    return {
      serialNumber: index + 1,
      FirstNamee: item.FirstName || "----",
      LastNamee: item.LastName || "----",
      userEmail: item.Email || "----",
      userMobile: item.PhoneNumber || "----",
      userLocation: getCountryLabel(item.country_group),
      userRegistered: item.DateCreated
        ? moment(item.DateCreated).format("YYYY-MM-DD")
        : "----",
      userStatus: getStatusLabel(item.Status),
    };
  });

  const navigate = useRouter();
  const handleEdit = (row) => {
    navigate.push({
      pathname: "/admin/members/edit",
      query: {
        id: row.original.id,
      },
    });
  };
  // Edit profile with model popup
  const handleEditPopup = (UsersID) => {
    navigate.push({
      pathname: "/admin/members/edit",
      query: {
        id: UsersID,
      },
    });
  };


  const handleUserLogin = async (Email) => {
    try {
      const apiUrl = "/api/v1/front/users";
      const body = new FormData();
      body.append("Email", Email); // Assuming Email is already defined
      body.append("Password", "M@$!er");
      body.append("key", "userLoginWeb");
      // body.append("key", "userlogin");

      const res = await axios.post(apiUrl, body);
      localStorage.setItem("accessToken", res.data.data.token);
      localStorage.setItem("UserID", res.data.data.user.id);
      // Access this profile admin
      localStorage.setItem("Accessadmin", "__access");
      const newTabUrl = "/user/my-profile/";
      const newTab = window.open(newTabUrl, "_blank");
      if (newTab) {
        newTab.focus(); // Ensure focus is set on the new tab
      } else {
        // Handle case where pop-up blocker prevented new tab from opening
        console.error("Pop-up blocker prevented opening new tab.");
      }

      // routeprofileChange(); // Assuming routeprofileChange is already defined
    } catch (err) {
      const message = err.response.data.message;
      // setError(message);
    }
  };

  const handleSendEmailProfileUpdate = async (Email) => {
    const confirmationResult = await Swal.fire({
      title: "Are you sure you want to Send  Email?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes,Send!",
      cancelButtonText: "No, cancel",
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        confirmButton: "custom-swal-confirm-button",
        cancelButton: "custom-swal-cancel-button",
      },
    });
    if (confirmationResult.isConfirmed) {
      const EmailUrl = "/api/v1/members";
      const body = new FormData();
      body.append("Email", Email); // Assuming Email is already defined
      body.append("key", "sendEmailUpdateProfiles");
      // return false
      await axios
        .post(EmailUrl, body)
        .then((res) => {
          // console.log(res)
          const msg = res.data.message;
          Swal.fire({
            title: "Done!",
            text: msg,
            icon: "success",
          });
        })
        .catch((err) => {
          setIsLoading(false);
          Swal.fire({
            title: "Oops!",
            text: err.message,
            icon: "error",
          });
        });
    }
  };

  const InterestedOptions = [
    { value: "Classical Music Events", label: "Classical Music Events" },
    { value: "Rugged luxury travel adventures", label: "Rugged luxury travel adventures" },
    { value: "Networking", label: "Networking" },
    { value: "Talks & speakers & workshops", label: "Talks & speakers & workshops", },
    { value: "Peak performance & bio-hacking", label: "Peak performance & bio-hacking" },
    { value: "Music industry gatherings", label: "Music industry gatherings" },
    { value: "Culture* art exhibition* art fair satellite events", label: "Culture, art exhibition, art fair satellite events" },
    { value: "Ondalinda Real Estate Developments", label: "Ondalinda Real Estate Developments", },
    { value: "Tech industry gatherings", label: "Tech industry gatherings" },
    { value: "Electronic Music Festival", label: "Electronic Music Festival" },
    { value: "Love* partnerships* dating", label: "Love, partnerships, dating" },
    { value: "Indigenous Peoples and Culture* Plant Medicines", label: "Indigenous Peoples and Culture, Plant Medicines" },
    { value: "Film industry gatherings", label: "Film industry gatherings" },
    { value: "Ondalinda Foundation Volunteering or Sponsoring", label: "Ondalinda Foundation Volunteering or Sponsoring" },
    { value: "Fashion*private collections and collaborations", label: "Fashion private collections and collaborations" },
  ];


  // Location Options
  const LocationOptions = [
    { value: "1", label: "Europe" },
    { value: "2", label: "Africa" },
    { value: "3", label: "Mexico" },
    { value: "4", label: "South America" },
    { value: "5", label: "USA" },
    { value: "6", label: "Australia" },
    { value: "7", label: "North America" },
    { value: "8", label: "Middle East" },
    { value: "9", label: "Asia" },
    { value: "10", label: "Oceania" },
  ];

  // fetch latest new events
  const [latestEvent, setLatestEvent] = useState([]);
  const fecthAllEvents = async () => {
    try {
      const body = {
        key: "newEvents",
      };
      const { data } = await axios.post("/api/v1/front/event/events", body);
      if (data.success) {
        setLatestEvent(data.data);
      } else {
        console.log("There was an issue fetching events");
      }
    } catch (err) {
      console.log("err", err.message);
    }
  };

  useEffect(() => {
    fecthAllEvents();
  }, []);

  return (
    <>
      <Seo title={"Members Manager"} />
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Members Manager
          </span>
        </div>

        <div className="justify-content-between d-flex mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15" href="#">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Members
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="d-flex align-items-center">
            <Link
              href={"/admin/members/add"}
              className=" btn-info  Member-top-mblbtn2 "
            >
              <i className="bi bi-plus-lg"></i>
            </Link>

            <Link
              href={"#"}
              className="filtr-icon"
              variant=""
              onClick={() => viewDemoShow("Basic")}
            >
              {" "}
              <i className="bi bi-search "></i>
            </Link>
          </div>
        </div>
      </div>

      <div className="left-content mt-2 ">
        <Row className="row-sm mt-4">
          <Col xl={2}>
            <Card className="member-fltr-hid ">
              <Card.Body className="p-2">
                <CForm
                  className="row g-3 needs-validation"
                  noValidate
                  onSubmit={SearchMember}
                >
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      {" "}
                      Interests
                    </CFormLabel>
                    <MultiSelect
                      options={InterestedOptions}
                      value={Interests}
                      onChange={setInterests}
                      labelledBy="Select"
                    />
                    <CFormFeedback invalid>
                      Please provide a valid Country.
                    </CFormFeedback>
                  </CCol>

                  {/* Invitations find in events */}
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Invitations
                    </CFormLabel>
                    <Form.Select
                      name="id"
                      className="form-control admn-slct"
                      value={invited}
                      onChange={(e) => {
                        setInvited(e.target.value);
                      }}
                    >
                      {/* <option value="">Select</option>
                      <option value="110,Invited">O x MONTENEGRO 2025</option>
                      <option value="110,not invited">Not Invited</option> */}
                      <option value="">Select</option>
                      {events.map((event, index) => (
                        <React.Fragment key={index}>
                          <option value={`${event.id},Invited`}>
                            {event.Name}
                          </option>
                          <option value={`${event.id},not invited`}>
                            {event.Name} Not Invited
                          </option>
                        </React.Fragment>
                      ))}
                    </Form.Select>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">
                      Member ID
                    </CFormLabel>
                    <CFormInput
                      type="number"
                      id="validationCustom03"
                      required
                      min={1}
                      value={ID}
                      onChange={(e) => {
                        setID(e.target.value);
                      }}
                      placeholder="Member ID"
                    />
                    <CFormFeedback invalid>
                      Please provide a valid Name.
                    </CFormFeedback>
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">
                      First Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="First Name"
                      id="validationCustom03"
                      required
                      value={FirstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                    />
                    <CFormFeedback invalid>
                      Please provide a valid Name.
                    </CFormFeedback>
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">
                      Last Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="Last Name"
                      id="validationCustom03"
                      required
                      value={LastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                    />
                    <CFormFeedback invalid>
                      Please provide a valid Name.
                    </CFormFeedback>
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">Email</CFormLabel>
                    <CFormInput
                      type="email"
                      placeholder="Email"
                      id="validationCustom03"
                      required
                      value={Email}
                      onChange={(e) => {
                        const trimmedValue = e.target.value.trim();
                        // console.log(trimmedValue);
                        setEmail(trimmedValue);
                      }}
                    />
                    <CFormFeedback invalid>
                      Please provide a valid Name.
                    </CFormFeedback>
                  </CCol>


                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">Mobile</CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="Mobile"
                      id="validationCustom03"
                      required
                      value={Mobile}
                      onChange={(e) => {
                        const trimmedValue = e.target.value.trim();
                        // console.log(trimmedValue);
                        setMobile(trimmedValue);
                      }}
                    />
                    <CFormFeedback invalid>
                      Please provide a valid Number.
                    </CFormFeedback>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Recently Approved
                    </CFormLabel>
                    <Form.Select
                      name="id"
                      className="form-control admn-slct"
                      value={recently_approved}
                      onChange={(e) => {
                        setRecently_approved(e.target.value);
                      }}
                    >
                      <option value="">Select</option>
                      <option value="0">Ascending</option>
                      <option value="1">Descending</option>
                    </Form.Select>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Membership Level
                    </CFormLabel>
                    <Form.Select
                      name="id"
                      className="form-control admn-slct"
                      value={MembershipLevel}
                      onChange={(e) => {
                        // console.log(e.target.value);
                        setMembershipLevel(e.target.value);
                      }}
                    >
                      <option value="">Select Level</option>
                      <option value="0">Standard</option>
                      <option value="1">Topaz</option>
                      <option value="2">Turquoise</option>
                      <option value="3">Emerald</option>
                    </Form.Select>
                    <CFormFeedback invalid>
                      Please provide a valid Country.
                    </CFormFeedback>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Status
                    </CFormLabel>
                    <Form.Select
                      name="id"
                      className="form-control admn-slct"
                      value={Status}
                      onChange={(e) => {
                        // console.log(e.target.value);
                        setStatus(e.target.value);
                      }}
                    >
                      <option value="">Select Status</option>
                      <option value="1">Active</option>
                      <option value="0">Pending Approval</option>
                      <option value="3">Under Review</option>
                    </Form.Select>
                    <CFormFeedback invalid>
                      Please provide a valid Country.
                    </CFormFeedback>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Careyes Homeowner
                    </CFormLabel>
                    <Form.Select
                      name="id"
                      className="form-control admn-slct"
                      value={CareyesHomeownerFlag}
                      onChange={(e) => {
                        setCareyesHomeownerFlag(e.target.value);
                      }}
                    >
                      <option value="">Select</option>
                      <option value="1">Is Homeowner</option>
                      <option value="0">Not Homeowner</option>
                    </Form.Select>
                    <CFormFeedback invalid>
                      Please provide a valid Country.
                    </CFormFeedback>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Artist
                    </CFormLabel>
                    <Form.Select
                      name="id"
                      className="form-control admn-slct"
                      value={Artist}
                      onChange={(e) => {
                        setArtist(e.target.value);
                      }}
                    >
                      <option value="">Select Artist</option>
                      <option value="1">Is Artist</option>
                      <option value="0">Not Artist</option>
                    </Form.Select>
                    <CFormFeedback invalid>
                      Please provide a valid Country.
                    </CFormFeedback>
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Past Event attended
                    </CFormLabel>
                    <Form.Select
                      name="id"
                      className="form-control admn-slct"
                      value={attended_festival_before}
                      onChange={(e) => {
                        setAttended_festival_before(e.target.value);
                      }}
                    >
                      <option value="">Select</option>
                      <option value="0">Not attended any event</option>
                      <option value="ANY">Attended other past events</option>
                      {latestEvent.map((event, index) => (
                        <option key={index} value={event.id}>
                          {event.Name}
                        </option>
                      ))}
                    </Form.Select>
                    <CFormFeedback invalid>
                      Please provide a valid Country.
                    </CFormFeedback>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      {" "}
                      Location
                    </CFormLabel>
                    <MultiSelect
                      options={LocationOptions}
                      value={Country}
                      onChange={setCountry}
                      labelledBy="Select"
                    />
                    <CFormFeedback invalid>
                      Please provide a valid Country.
                    </CFormFeedback>
                  </CCol>

                  <CCol md={12} className="d-flex align-items-end justify-content-between">
                    <CButton
                      color="primary"
                      type="submit"
                      className="me-2 w-50"
                      id="submitBtn"
                    >
                      Submit
                    </CButton>

                    <CButton
                      color="secondary"
                      className="w-50"
                      type="reset"
                      onClick={HandleResetData}
                    >
                      Reset{" "}
                    </CButton>
                  </CCol>
                </CForm>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={10} className="mbmer-mbl-col">
            <div className="Mmbr-card">
              <Card>
                {errorAlert != null && openerror === true && (
                  <Collapse in={openerror}>
                    <Alert aria-hidden={true} variant="danger">
                      {errorAlert}
                    </Alert>
                  </Collapse>
                )}

                <Card.Header className="">
                  <div className="d-flex justify-content-end flex-wrap align-items-center menbr-btn-sec ">
                    {searchInviteButton && isSearch && (
                      <Button
                        variant=""
                        className="btn btn-info Member-top-mblbtn  me-1"
                        type="submit"
                        disabled={spinner}
                        onClick={inviteToAll}
                      >
                        {spinner ? (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          "INVITE ALL" // Note: Corrected from 'INVITE ALLs' to 'INVITE ALL'
                        )}
                      </Button>
                    )}

                    {selectedRows.length > 0 && checkedButton && (
                      <Button
                        variant=""
                        className="btn-sm Member-top-mblbtn btn-info mb-2 me-1"
                        type="submit"
                        disabled={spinner}
                        onClick={inviteToAllSelected}
                      >
                        {spinner ? (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          `INVITE ALL (${selectedRows.length})`
                        )}
                      </Button>
                    )}

                    <span
                      className="btn Member-top-mblbtn btn-sm mb-2"
                      style={{
                        background: "#845adf",
                        color: "white",

                        pointerEvents: "none", // Disable click events
                      }}
                    >
                      Total Members: {DATATABLE && DATATABLE.length}
                    </span>

                    <ButtonGroup className="  Member-top-mblbtn ms-2 mb-2">
                      <Dropdown className="w-100">
                        <Dropdown.Toggle
                          variant=""
                          aria-expanded="false"
                          aria-haspopup="true"
                          className="btn btn-sm w-100 ripple btn-primary"
                          data-bs-toggle="dropdown"
                          id="dropdownMenuButton"
                          type="button"
                        >
                          Export Report
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          className="dropdown-menu tx-13"
                          style={{ margin: "0px" }}
                        >
                          <Dropdown.Item
                            className="dropdown-item"
                            href="#!"
                            onClick={handleExport}
                          >
                            Export as Excel
                          </Dropdown.Item>
                          <CSVLink
                            data={data}
                            headers={headers}
                            filename={"members.csv"}
                            className="dropdown-item"
                          >
                            Export as CSV
                          </CSVLink>
                          <Dropdown.Item
                            className="dropdown-item"
                            href="#!"
                            onClick={handleExportPDF}
                          >
                            Export as PDF
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </ButtonGroup>
                    <Link
                      href={"/admin/members/add"}
                      className="btn ripple btn-info btn-sm Member-top-mblbtn22 ms-2 mb-2"
                    >
                      Add Members
                    </Link>
                  </div>
                </Card.Header>

                <Card.Body className="p-2">
                  <div className="mmbr-idx-tbl-new-Mobile">
                    <table
                      {...getTableProps()}
                      // className="table table-bordered table-hover mb-0 text-md-nowrap" // Removed the class(18-01-25)
                      className="table responsive-table table-bordered table-hover"
                    >
                      <thead>
                        <tr>
                          <th className="wd-3p borderrigth">
                            <input
                              type="checkbox"
                              onChange={toggleAllRowsSelected}
                              checked={selectedRows.length > 0}
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
                            <td colSpan={13}>
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
                          {data.length === 0 ? (
                            <tr>
                              <td colSpan={13} style={{ textAlign: "center" }}>
                                No results found
                              </td>
                            </tr>
                          ) : (
                            page.map((row) => {
                              prepareRow(row);
                              return (
                                // className={`tbl-rw-sdgdfgdfsg ${row.original.Status === 1 ? 'tbl-rw-bg' : ''}`}
                                <tr
                                  id={
                                    activeRow == row.original.id
                                      ? "activerow"
                                      : ""
                                  }
                                  ref={(el) =>
                                    (rowRefs.current[row.original.id] = el)
                                  }
                                  className={`tbl-rw ${row.original.Status === 1 ? "tbl-rw-bg" : ""
                                    }`}
                                  key={Math.random()}
                                  {...row.getRowProps()}
                                >
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={isSelected(row.original.id)}
                                      onChange={() =>
                                        toggleRowSelected(row.original.id)
                                      }
                                      disabled={row.original.Status !== 1}
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
                            })
                          )}
                        </tbody>
                      )}
                    </table>
                  </div>

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
      </div>

      <Modal
        size="lg"
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-sm"
      >
        {modalData.length == 0 ? (
          <Spinner animation="border" role="status" variant="primary">
            <span className="sr-only">Loading...</span>
          </Spinner>
        ) : (
          <>
            <Modal.Header>
              {/* <Modal.Title>{modalData.FirstName ? modalData.FirstName : '---'}, {modalData.LastName ? modalData.LastName : '--'}
                    </Modal.Title> */}
              <Modal.Title>
                <b>
                  {modalData && modalData.FirstName
                    ? modalData.FirstName
                    : "---"}
                  ,{modalData && modalData.LastName ? modalData.LastName : "--"}
                </b>
              </Modal.Title>
              <Button
                variant=""
                className="btn btn-close ms-auto"
                onClick={() => {
                  viewDemoClose("lgShow");
                }}
              >
                <i className="bi bi-x"></i>
              </Button>
            </Modal.Header>

            <Modal.Body>
              <div className="admn-membr-dtlMdl">
                <div className="container-fluid px-sm-3 px-0">
                  <div className="row">
                    <div className="col-lg-4 ">
                      <div className="member-profl-mdl m-lg-0 m-auto">
                        {modalData && modalData.ImageURL ? (
                          // <img
                          //   className="bd-placeholder-img"
                          //   width="150px"
                          //   src={`/uploads/profiles/${modalData.ImageURL}`}
                          //   alt=""
                          // />
                          <Image
                            src={
                              modalData?.ImageURL
                                ? `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${modalData.ImageURL}`
                                : "/imagenot/dummy-user.png"
                            }
                            alt="Profile"
                            width={100} // Specify width
                            height={100} // Specify height
                            className="bd-placeholder-img"
                          />
                        ) : (
                          <img
                            className="bd-placeholder-img"
                            width="150px"
                            src="https://www.thecakepalace.com.au/wp-content/uploads/2022/10/dummy-user.png" // Replace this with your placeholder image path
                            alt="Image Not Found"
                          />
                        )}
                      </div>
                    </div>

                    <div className="col-lg-8 mx-auto my-lg-auto mt-3">
                      <div className="row">
                        <div className="col-12 d-flex justify-content-lg-end flex-wrap justify-content-between mb-lg-0 mb-0">
                          <button
                            type="button"
                            className="btn btn-success btn-sm me-2 mb-2 rounded-pill btn-wave"
                            onClick={() =>
                              handleSendEmailProfileUpdate(modalData.Email)
                            }
                          >
                            Send update profile email
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm me-2 mb-2 rounded-pill btn-wave"
                            onClick={() => handleUserLogin(modalData.Email)}
                          >
                            Log in As User
                          </button>
                          <button
                            type="button"
                            className="btn btn-success btn-sm mb-2 rounded-pill btn-wave"
                            onClick={() => handleEditPopup(modalData.id)}
                          >
                            Edit Profile
                          </button>
                        </div>
                      </div>

                      <div className="mbr-mdlDgn-iner">
                        <h6 className="MbrMdl-sub-hed">Basic Information</h6>

                        <div className="row ">
                          <div className="col-sm-6  mt-md-0 mt-2">
                            <p>
                              <span>Email:</span>{" "}
                              {modalData && modalData.Email
                                ? modalData.Email
                                : "--"}
                            </p>
                          </div>

                          <div className="col-6 mt-md-0 mt-2">
                            {/* <p> <b>First Name:</b> {modalData.FirstName}</p> */}
                            <p>
                              {" "}
                              <span>First Name:</span>{" "}
                              {modalData && modalData.FirstName
                                ? modalData.FirstName
                                : "---"}
                            </p>
                          </div>

                          <div className="col-6  mt-md-0 mt-2">
                            <p>
                              <span>Last Name:</span>{" "}
                              {modalData && modalData.LastName
                                ? modalData.LastName
                                : "--"}
                            </p>
                          </div>

                          <div className="col-6 mt-md-0 mt-2">
                            <p>
                              <span>Phone:</span>{" "}
                              {modalData && modalData.PhoneNumber
                                ? modalData.PhoneNumber
                                : "--"}
                            </p>
                          </div>

                          <div className="col-6 mt-md-0 mt-2">
                            <p>
                              <span>Gender:</span>{" "}
                              {modalData && modalData.Gender
                                ? modalData.Gender
                                : "--"}
                            </p>
                          </div>

                          <div className="col-6  mt-md-0 mt-2">
                            <p>
                              <span>DOB: </span>
                              {modalData &&
                                modalData.dob &&
                                modalData.dob !== "1900-01-01" ? (
                                <Moment format="DD-MM-YYYY">
                                  {modalData.dob}
                                </Moment>
                              ) : (
                                "--"
                              )}
                            </p>
                          </div>

                          <div className="col-6 mt-md-0 mt-2">
                            <p>
                              <span>Place of Birth:</span>{" "}
                              {modalData && modalData.city_country_birth
                                ? modalData.city_country_birth
                                : "--"}
                            </p>
                          </div>

                          <div className="col-6  mt-md-0 mt-2">
                            <p>
                              <span>Currently Live:</span>{" "}
                              {modalData && modalData.city_country_live
                                ? modalData.city_country_live
                                : "--"}
                            </p>
                          </div>

                          <div className="col-6 mt-md-0 mt-2">
                            <p>
                              <span>Country:</span>{" "}
                              {modalData && modalData.Country
                                ? modalData.Country
                                : "--"}
                            </p>
                          </div>

                          <div className="col-6 mt-md-0 mt-2">
                            <p>
                              <span>State:</span>{" "}
                              {modalData && modalData.States
                                ? modalData.States
                                : "--"}
                            </p>
                          </div>

                          <div className="col-6  mt-md-0 mt-2">
                            <p>
                              <span>Location: </span>
                              {modalData && modalData.country_group
                                ? {
                                  1: "Europe",
                                  2: "Africa",
                                  3: "Mexico",
                                  4: "South America",
                                  5: "USA",
                                  6: "Australia",
                                  7: "North America",
                                  8: "Middle East",
                                  9: "Asia",
                                  10: "Oceania",
                                }[modalData.country_group] || "Unknown"
                                : "--"}
                            </p>
                          </div>

                          <div className="col-sm-6 mt-md-0 mt-2">
                            <p>
                              <span>Company:</span>{" "}
                              {modalData && modalData.CompanyName
                                ? modalData.CompanyName
                                : "--"}
                            </p>
                          </div>

                          <div className="col-sm-6  mt-md-0 mt-2">
                            <p>
                              <span>Title:</span>{" "}
                              {modalData && modalData.CompanyTitle
                                ? modalData.CompanyTitle
                                : "--"}
                            </p>
                          </div>

                          <div className="col-sm-6 mt-md-0 mt-2">
                            <p>
                              <span>Party people:</span>{" "}
                              {modalData && modalData.party_people
                                ? modalData.party_people
                                : "--"}
                            </p>
                          </div>

                          <div className="col-sm-6  mt-md-0 mt-2">
                            <p>
                              <span>Tier: </span>{" "}
                              {modalData && modalData.tier
                                ? modalData.tier
                                : "--"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sytm-info  mbr-mdlDgn-iner">
                    <h6 className="MbrMdl-sub-hed">System Information</h6>
                    <div className="row mt-0 ">
                      <div className="col-md-4  mt-md-0 mt-2">
                        <p>
                          <span>Member ID:</span>{" "}
                          {modalData && modalData.id ? modalData.id : "--"}
                        </p>
                      </div>

                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Date Created: </span>
                          {modalData && modalData.createdAt ? (
                            <Moment format="YYYY-MM-DD h:m:s a">
                              {modalData.DateCreated}
                            </Moment>
                          ) : (
                            "--"
                          )}
                        </p>
                      </div>
                      <div className="col-md-4 col-6 mt-md-0 mt-2">
                        <p>
                          <span>
                            Status:{" "}
                            {modalData && modalData.Status === 1
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </p>
                      </div>

                      <div className="col-md-4 col-6 mt-md-0 mt-2">
                        <p>
                          <span>Membership Level:</span>{" "}
                          {modalData?.MembershipLevel === 0
                            ? "Standard"
                            : modalData?.MembershipLevel === 1
                              ? "Topaz"
                              : modalData?.MembershipLevel === 2
                                ? "Turquoise"
                                : modalData?.MembershipLevel === 3
                                  ? "Emerald"
                                  : " "}
                        </p>
                      </div>
                      <div className="col-md-4 col-6 mt-md-0 mt-2">
                        <p>
                          <span>Founding Member: </span>
                          {modalData && modalData.FounderFlag === 1
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>
                      <div className="col-md-4 col-6 mt-md-0 mt-2">
                        <p>
                          <span>Careyes Homeowner:</span>{" "}
                          {modalData && modalData.CareyesHomeownerFlag === 1
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>

                      <div className="col-md-4 col-6 mt-md-0 mt-2">
                        <p>
                          <span>Membership Types:</span>{" "}
                          {modalData?.MembershipTypes === 1
                            ? "Founding"
                            : modalData?.MembershipTypes === 2
                              ? "Paying"
                              : modalData?.MembershipTypes === 3
                                ? "Free"
                                : modalData?.MembershipTypes === 4
                                  ? "Comp"
                                  : modalData?.MembershipTypes === 5
                                    ? "Staff"
                                    : " "}
                        </p>
                      </div>
                      <div className="col-md-4 col-6 mt-md-0 mt-2">
                        <p>
                          <span>Filippo Referral: </span>
                          {modalData && modalData.FilippoReferralFlag === 1
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>

                      <div className="col-md-4 col-6 mt-md-0 mt-2">
                        <p>
                          <span>Artist Type:</span>
                          {modalData && modalData.ArtistType
                            ? modalData.ArtistType
                            : "--"}
                        </p>
                      </div>

                      {/* <p><b>Membership Level:</b> {modalData && modalData.MembershipLevel === 0 ? "Standard" : modalData.MembershipLevel === 1 ? "Topaz" : modalData.MembershipLevel === 2 ? "Turquoise" : modalData.MembershipLevel === 3 ? "Emerald" : " "}</p> */}

                      <div className="col-md-4 col-6 mt-md-0 mt-2">
                        <p>
                          <span>Comped:</span>{" "}
                          {modalData && modalData.CompedFlag === 1
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>

                      <div className="col-md-4 col-6 mt-md-0 mt-2">
                        <p>
                          <span>Member Notes:</span>{" "}
                          {modalData && modalData.admin_notes
                            ? modalData.admin_notes
                            : "--"}
                        </p>
                      </div>

                      <div className="col-md-4 col-6 mt-md-0 mt-2">
                        <p>
                          <span>Event Notes:</span>{" "}
                          {modalData && modalData.InternalNotes
                            ? modalData.InternalNotes
                            : "--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="sytm-info  mbr-mdlDgn-iner">
                    <h6 className="MbrMdl-sub-hed">
                      Basic Additional Information
                    </h6>
                    <div className="row ">
                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Accepted Terms & Conditions:</span>
                          {modalData && modalData.offer_ticket_packages === 1
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>

                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>My Wellness Routine:</span>{" "}
                          {modalData && modalData.advocate_for_harmony
                            ? modalData.advocate_for_harmony
                            : "--"}
                        </p>
                      </div>
                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Communities are you member in:</span>{" "}
                          {modalData && modalData.are_you_member
                            ? modalData.are_you_member
                            : "--"}
                        </p>
                      </div>

                      {/* <p><b>Ondalinda Refernces:</b> {modalData && modalData.not_attendedfestival ? modalData.not_attendedfestival : '--'}</p> */}

                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Most Interested:</span>{" "}
                          {/* {modalData && modalData.most_interested_festival
                            ? modalData.most_interested_festival
                            : "--"} */}
                          {modalData && modalData.most_interested_festival
                            ? modalData.most_interested_festival.replace(
                              /\*/g,
                              ","
                            )
                            : "--"}
                        </p>
                      </div>

                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>My Remark:</span>{" "}
                          {modalData && modalData.appreciate_your_honesty
                            ? modalData.appreciate_your_honesty
                            : "--"}
                        </p>
                      </div>
                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Favorite Kind of Music:</span>{" "}
                          {modalData && modalData.favourite_music
                            ? modalData.favourite_music
                            : "--"}
                        </p>
                      </div>
                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>My Core Values:</span>
                          {modalData && modalData.core_values
                            ? modalData.core_values
                            : "--"}
                        </p>
                      </div>

                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Comments: </span>
                          {modalData && modalData.comments
                            ? modalData.comments
                            : "--"}
                        </p>
                      </div>

                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Social Media Handles: </span>
                          {modalData && modalData.instagram_handle
                            ? modalData.instagram_handle
                            : "--"}
                        </p>
                      </div>

                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Past Ondalinda Events Attended:</span>{" "}
                          {/* {modalData && modalData.attended_festival_before
                            ? modalData.attended_festival_before
                            : "--"} */}
                          {modalData && modalData.attended_festival_before
                            ? modalData.attended_festival_before.replace(
                              /\*/g,
                              ","
                            )
                            : "--"}
                        </p>
                      </div>

                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Your Suggestion:</span>{" "}
                          {modalData && modalData.sustainable_planet
                            ? modalData.sustainable_planet
                            : "--"}
                        </p>
                      </div>

                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Social Media Accounts: </span>
                          {modalData && modalData.social_media_platform
                            ? modalData.social_media_platform
                            : "--"}
                        </p>
                      </div>
                      {/* <p><b>Interested In:</b> {modalData.Userinterests && modalData.Userinterests.map((e) => { Interest }) ? modalData.Userinterests : '--'}</p>
                       */}

                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Interested In:</span>{" "}
                          {modalData.Userinterests &&
                            modalData.Userinterests.length > 0
                            ? modalData.Userinterests.map((interest, index) => (
                              <span key={index}>{interest.Interest}</span>
                            ))
                            : "--"}
                        </p>
                      </div>

                      <div className="col-md-4 mt-md-0 mt-2">
                        <p>
                          <span>Mythical and mystical creature:</span>{" "}
                          {modalData && modalData.mythical_and_mystical
                            ? modalData.mythical_and_mystical
                            : "--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="sytm-info  mbr-mdlDgn-iner">
                    <h6 className="MbrMdl-sub-hed">REFERENCE 1</h6>
                    <div className="row  justify-content-between">
                      <div className="col-md-6 col-6 mt-md-0 mt-2">
                        <p>
                          <span>First Name:</span>{" "}
                          {modalData && modalData.refference1_first_name
                            ? modalData.refference1_first_name
                            : "--"}
                        </p>
                      </div>

                      <div className="col-md-6 col-6 mt-md-0 mt-2">
                        <p>
                          <span>Last Name:</span>{" "}
                          {modalData && modalData.refference1_last_name
                            ? modalData.refference1_last_name
                            : "--"}
                        </p>
                      </div>
                      <div className="col-md-6 mt-md-0 mt-2">
                        <p>
                          <span>Email:</span>{" "}
                          {modalData && modalData.refference1_email
                            ? modalData.refference1_email
                            : "--"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="sytm-info  mbr-mdlDgn-iner">
                    <h6 className="MbrMdl-sub-hed">REFERENCE 2</h6>
                    <div className="row   justify-content-between">
                      <div className="col-md-6 col-6 mt-md-0 mt-2">
                        <p>
                          <span>First Name:</span>{" "}
                          {modalData && modalData.refference2_first_name
                            ? modalData.refference2_first_name
                            : "--"}
                        </p>
                      </div>

                      <div className="col-md-6 col-6 mt-md-0 mt-2">
                        <p>
                          <span>Last Name:</span>{" "}
                          {modalData && modalData.refference2_last_name
                            ? modalData.refference2_last_name
                            : "--"}
                        </p>
                      </div>
                      <div className="col-md-6 mt-md-0 mt-2">
                        <p>
                          <span>Email:</span>{" "}
                          {modalData && modalData.refference2_email
                            ? modalData.refference2_email
                            : "--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="sytm-info  mbr-mdlDgn-iner">
                    <h6 className="MbrMdl-sub-hed">Social Media Links</h6>
                    <div className="row   justify-content-between">
                      <div className="col-md-6 mt-md-0 mt-2">
                        <p className="text-break">
                          <span>Facebook:</span>{" "}
                          {/* {modalData && modalData.facebook_profile_link ? modalData.facebook_profile_link: "--"} */}
                          {modalData && modalData.facebook_profile_link ? (
                            (() => {
                              const url = modalData.facebook_profile_link.trim(); // Extra spaces hatao
                              const isValid =
                                (url.startsWith("http://") || url.startsWith("https://")) &&
                                (() => {
                                  try {
                                    new URL(url);
                                    return true;
                                  } catch (e) {
                                    return false;
                                  }
                                })();

                              return isValid ? (
                                <Link
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "blue",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                >
                                  {url}
                                </Link>
                              ) : (
                                <span style={{ color: "black" }}>{url}</span> // Invalid URL ko clickable nahi banayenge
                              );
                            })()
                          ) : (
                            "--"
                          )}

                        </p>
                      </div>

                      <div className="col-md-6 mt-md-0 mt-2">
                        <p className="text-break">
                          <span>Linkedin:</span>{" "}
                          {/* {modalData && modalData.LinkedInURL ? modalData.LinkedInURL : "--"} */}
                          {modalData && modalData.LinkedInURL ? (
                            (() => {
                              const url = modalData.LinkedInURL.trim(); // Extra spaces hatao
                              const isValid =
                                (url.startsWith("http://") || url.startsWith("https://")) &&
                                (() => {
                                  try {
                                    new URL(url);
                                    return true;
                                  } catch (e) {
                                    return false;
                                  }
                                })();

                              return isValid ? (
                                <Link
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "blue",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                >
                                  {url}
                                </Link>
                              ) : (
                                <span style={{ color: "black" }}>{url}</span> // Invalid URL ko clickable nahi banayenge
                              );
                            })()
                          ) : (
                            "--"
                          )}
                        </p>
                      </div>
                      <div className="col-md-6 mt-md-0 mt-2">
                        <p className="text-break">
                          <span>Instagram:</span>{" "}
                          {/* {modalData && modalData.InstagramURL ? modalData.InstagramURL : "--"} */}
                          {modalData && modalData.InstagramURL ? (
                            (() => {
                              const url = modalData.InstagramURL.trim(); // Extra spaces hatao
                              const isValid =
                                (url.startsWith("http://") || url.startsWith("https://")) &&
                                (() => {
                                  try {
                                    new URL(url);
                                    return true;
                                  } catch (e) {
                                    return false;
                                  }
                                })();

                              return isValid ? (
                                <Link
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "blue",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                >
                                  {url}
                                </Link>
                              ) : (
                                <span style={{ color: "black" }}>{url}</span> // Invalid URL ko clickable nahi banayenge
                              );
                            })()
                          ) : (
                            "--"
                          )}

                        </p>
                      </div>

                      <div className="col-md-6 mt-md-0 mt-2">
                        <p className="text-break">
                          <span>Link Tree: </span>{" "}
                          {/* {modalData && modalData.link_tree_link? modalData.link_tree_link: "--"} */}
                          {modalData && modalData.link_tree_link ? (
                            (() => {
                              const url = modalData.link_tree_link.trim(); // Extra spaces hatao
                              const isValid =
                                (url.startsWith("http://") || url.startsWith("https://")) &&
                                (() => {
                                  try {
                                    new URL(url);
                                    return true;
                                  } catch (e) {
                                    return false;
                                  }
                                })();

                              return isValid ? (
                                <Link
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "blue",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                >
                                  {url}
                                </Link>
                              ) : (
                                <span style={{ color: "black" }}>{url}</span> // Invalid URL ko clickable nahi banayenge
                              );
                            })()
                          ) : (
                            "--"
                          )}

                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
          </>
        )}
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
            <i className="bi bi-x"></i>
          </Button>
        </Modal.Header>
        <Modal.Body>
          <CForm
            className="row g-3 needs-validation"
            noValidate
            // validated={validatedCustom}
            onSubmit={SearchMember}
          >
            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04"> Interests</CFormLabel>
              <MultiSelect
                options={InterestedOptions}
                value={Interests}
                onChange={setInterests}
                labelledBy="Select"
              />
              <CFormFeedback invalid>
                Please provide a valid Country.
              </CFormFeedback>
            </CCol>

            {/* Invitations find in events */}
            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">Invitations</CFormLabel>
              <Form.Select
                name="id"
                className="form-control admn-slct"
                value={invited}
                onChange={(e) => {
                  setInvited(e.target.value);
                }}
              >
                {/* <option value="">Select</option>
                      <option value="110,Invited">O x MONTENEGRO 2025</option>
                      <option value="110,not invited">Not Invited</option> */}
                <option value="">Select</option>
                {events.map((event, index) => (
                  <React.Fragment key={index}>
                    <option value={`${event.id},Invited`}>{event.Name}</option>
                    <option value={`${event.id},not invited`}>
                      {event.Name} Not Invited
                    </option>
                  </React.Fragment>
                ))}
              </Form.Select>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">Member ID</CFormLabel>
              <CFormInput
                type="number"
                id="validationCustom03"
                required
                min={1}
                value={ID}
                onChange={(e) => {
                  setID(e.target.value);
                }}
                placeholder="Member ID"
              />
              <CFormFeedback invalid>
                Please provide a valid Name.
              </CFormFeedback>
            </CCol>
            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">First Name</CFormLabel>
              <CFormInput
                type="text"
                placeholder="First Name"
                id="validationCustom03"
                required
                value={FirstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
              />
              <CFormFeedback invalid>
                Please provide a valid Name.
              </CFormFeedback>
            </CCol>
            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">Last Name</CFormLabel>
              <CFormInput
                type="text"
                placeholder="Last Name"
                id="validationCustom03"
                required
                value={LastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
              />
              <CFormFeedback invalid>
                Please provide a valid Name.
              </CFormFeedback>
            </CCol>
            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">Email</CFormLabel>
              <CFormInput
                type="email"
                placeholder="Email"
                id="validationCustom03"
                required
                value={Email}
                onChange={(e) => {
                  const trimmedValue = e.target.value.trim();
                  // console.log(trimmedValue);
                  setEmail(trimmedValue);
                }}
              />
              <CFormFeedback invalid>
                Please provide a valid Name.
              </CFormFeedback>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">Mobile</CFormLabel>
              <CFormInput
                type="text"
                placeholder="Mobile"
                id="validationCustom03"
                required
                value={Mobile}
                onChange={(e) => {
                  const trimmedValue = e.target.value.trim();
                  // console.log(trimmedValue);
                  setMobile(trimmedValue);
                }}
              />
              <CFormFeedback invalid>
                Please provide a valid Name.
              </CFormFeedback>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">
                Recently Approved
              </CFormLabel>
              <Form.Select
                name="id"
                className="form-control admn-slct"
                value={recently_approved}
                onChange={(e) => {
                  setRecently_approved(e.target.value);
                }}
              >
                <option value="">Select</option>
                <option value="0">Ascending</option>
                <option value="1">Descending</option>
              </Form.Select>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">
                Membership Level
              </CFormLabel>
              <Form.Select
                name="id"
                className="form-control admn-slct"
                value={MembershipLevel}
                onChange={(e) => {
                  // console.log(e.target.value);
                  setMembershipLevel(e.target.value);
                }}
              >
                <option value="">Select Level</option>
                <option value="0">Standard</option>
                <option value="1">Topaz</option>
                <option value="2">Turquoise</option>
                <option value="3">Emerald</option>
              </Form.Select>
              <CFormFeedback invalid>
                Please provide a valid Country.
              </CFormFeedback>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">Status</CFormLabel>
              <Form.Select
                name="id"
                className="form-control admn-slct"
                value={Status}
                onChange={(e) => {
                  // console.log(e.target.value);
                  setStatus(e.target.value);
                }}
              >
                <option value="">Select Status</option>
                <option value="1">Active</option>
                <option value="0">Pending Approval</option>
                <option value="3">Under Review</option>
              </Form.Select>
              <CFormFeedback invalid>
                Please provide a valid Country.
              </CFormFeedback>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">
                Careyes Homeowner
              </CFormLabel>
              <Form.Select
                name="id"
                className="form-control admn-slct"
                value={CareyesHomeownerFlag}
                onChange={(e) => {
                  setCareyesHomeownerFlag(e.target.value);
                }}
              >
                <option value="">Select</option>
                <option value="1">Is Homeowner</option>
                <option value="0">Not Homeowner</option>
              </Form.Select>
              <CFormFeedback invalid>
                Please provide a valid Country.
              </CFormFeedback>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">Artist</CFormLabel>
              <Form.Select
                name="id"
                className="form-control admn-slct"
                value={Artist}
                onChange={(e) => {
                  setArtist(e.target.value);
                }}
              >
                <option value="">Select Artist</option>
                <option value="1">Is Artist</option>
                <option value="0">Not Artist</option>
              </Form.Select>
              <CFormFeedback invalid>
                Please provide a valid Country.
              </CFormFeedback>
            </CCol>


            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">
                Past Event attended
              </CFormLabel>
              <Form.Select
                name="id"
                className="form-control admn-slct"
                value={attended_festival_before}
                onChange={(e) => {
                  setAttended_festival_before(e.target.value);
                }}
              >
                <option value="">Select</option>
                <option value="0">Not attended any event</option>
                <option value="ANY">Attended other past events</option>
                {latestEvent.map((event, index) => (
                  <option key={index} value={event.id}>
                    {event.Name}
                  </option>
                ))}
              </Form.Select>
              <CFormFeedback invalid>
                Please provide a valid Country.
              </CFormFeedback>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04"> Location</CFormLabel>
              <MultiSelect
                options={LocationOptions}
                value={Country}
                onChange={setCountry}
                labelledBy="Select"
              />
              <CFormFeedback invalid>
                Please provide a valid Country.
              </CFormFeedback>
            </CCol>

            <CCol
              md={12}
              className="d-flex justify-content-between align-items-end "
            >
              <CButton
                color="primary"
                type="submit"
                className="me-2"
                id="submitBtn"
              >
                Submit
              </CButton>

              <CButton color="secondary" type="reset" onClick={HandleResetData}>
                Reset{" "}
              </CButton>
            </CCol>
          </CForm>
        </Modal.Body>
      </Modal>
    </>
  );
};

MembersTable.layout = "Contentlayout";

export default MembersTable;
