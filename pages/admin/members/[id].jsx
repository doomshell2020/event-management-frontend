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
// import { optiondefault } from "../../../shared/data/form/form-validation";
// import { useDownloadExcel } from "react-export-table-to-excel";
// import ReactExport from "react-export-table-to-excel";

const MembersTable = () => {

  const router = useRouter();
  const { query } = router;
  const { id, currentPage } = query;


  const [validatedCustom, setValidatedCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lgShow, setLgShow] = useState(false);
  const [DATATABLE, SetDATATABLE] = useState([]);
  const [modalData, setModalData] = useState([]);
  // console.log("modalData", modalData.Userinterests.Interest)
  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [ID, setID] = useState("");
  const [MembershipLevel, setMembershipLevel] = useState("");
  const [recently_approved, setRecently_approved] = useState();
  const [Status, setStatus] = useState("");
  const [Artist, setArtist] = useState("");
  const [CareyesHomeownerFlag, setCareyesHomeownerFlag] = useState("");
  const [attended_festival_before, setAttended_festival_before] = useState("");
  const [UserID, setUserID] = useState([]);
  const [Interests, setInterests] = useState([]);
  const [Country, setCountry] = useState([]);
  // const [pageSize, setManualPageSize] = useState(300); // console.log("Country", Country)
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [eventsList, setEventsList] = useState([]);
  const [checkedButton, setCheckedButton] = useState(false);
  const [searchInviteButton, setSearchInviteButton] = useState(false);
  const [displayPages, setDisplayPages] = useState(3);
  const [pages, setPage] = useState(1);

  const [activeRow, setActiveRow] = useState(null);
  const rowRefs = useRef({}); // To keep references to rows

  // const currentEventId = id ? id : 108;
  const [currentEventId, setCurrentEventId] = useState(id);

  useEffect(() => {
    if (id) {
      setCurrentEventId(id)
    }
  }, [id]);


  console.log(id);


  const handleRowClick = (rowId) => {
    setActiveRow(rowId);
    localStorage.setItem("activeRow", rowId);
  };

  useEffect(() => {
    setPageSize(25);

    setFirstName(query.fname || "");
    setLastName(query.lname || "");
    setEmail(query.member_email || "");
    setID(query.member_id || "");
    setMembershipLevel(query.membership_level || "");
    setStatus(query.membership_status || "");
    setCareyesHomeownerFlag(query.careyes_homeowner || "");
    setAttended_festival_before(query.past_event_attended || "");

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
      if(id){
        query.event_id = id;
      }
      fetchData(query); // Fetch data when 'pages' or 'pageSize' changes.
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [id,
    query.fname,
    query.lname,
    query.member_email,
    query.member_id,
    query.membership_level,
    query.membership_status,
    query.careyes_homeowner,
    query.past_event_attended,
    query.member_interest,
    query.member_location,
    query.search_recently_approved,
  ]);

  const fetchData = async (params) => {
    console.log("🚀 ~ fetchData ~ params:", params)
    try {
      setIsLoading(true); // Set loading state to true
      const queryString = new URLSearchParams(params).toString();
      const memberURL = `/api/v1/members?${queryString}`;
      const response = await axios.get(memberURL);
      SetDATATABLE(response.data.data || []);

      const currentPage = getQueryParam("currentPage");
      const parsedPage = parseInt(currentPage, 10) || 1;

      const timeoutId = setTimeout(() => {
        setPage(parsedPage);
        gotoPage(parsedPage - 1);
        setIsLoading(false);

        const savedActiveRow = localStorage.getItem("activeRow");
        if (savedActiveRow) {
          setActiveRow(savedActiveRow);

          const timeoutId2 = setTimeout(() => {
            rowRefs.current[savedActiveRow]?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 200);
          return () => clearTimeout(timeoutId2);
        }
      }, 1500);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      setIsLoading(false);
      SetDATATABLE([]);
    }
  };

  // Function to parse query parameters from URL
  const getQueryParam = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  const handlePageChange = (pageNumber) => {
    gotoPage(pageNumber);
    setPage(pageNumber + 1);
    router.push({
      pathname: router.pathname,
      query: { ...query, currentPage: pageNumber + 1 },
    });
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
    const allRowIds = page.map((row) => row.original.id);
    if (selectedRows.length === allRowIds.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allRowIds);
    }
  };

  const getEventList = async () => {
    try {
      const response = await axios.get("/api/v1/events?active=1");
      const eventDataRes = response.data.data;
      setEventsList(eventDataRes);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  function generateEventDropdown(eventName) {
    const dropdownOptions = eventName.map((event) => {
      return `<option value="${event.id}">${event.Name}</option>`;
    });

    const dropdownHtml = `
      <select id="eventDropdown" className="swal2-select">
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
      },
    });

    if (confirmationResult.isConfirmed) {
      if (event.id != null && selectedEventId != null) {
        const responseEmail = await axios.get(
          `/api/v1/emailtemplets/?key=invitationtemplate&eventId=${selectedEventId}`
        );

        if (!responseEmail.data.status) {
          Swal.fire({
            icon: "warning",
            title: "No Invitation Email Template Found",
            text: `Unable to send the invitation.`,
            confirmButtonText: "OK",
          });
          return false;
        }

        setIsLoading(true);
        const CmsAddUrl = "/api/v1/invitationevents";
        const userID = String(event.id);
        const userIDArray = [userID];
        const body = {
          UserID: userIDArray,
          key: "Addinvitation",
          EventID: currentEventId,
        };

        await axios
          .post(CmsAddUrl, body)
          .then((res) => {
            const msg = res.data.message;
            Swal.fire({
              title: "Done!",
              text: msg,
              icon: "success",
            }).then((result) => {
              handleRowClick(userID);
              if (result.isConfirmed) {
                window.location.reload();
                setIsLoading(false);
              }
            });
            // submitBtn.click();
          })
          .catch((err) => {
            setIsLoading(false);
            console.log("message", err);
            Swal.fire({
              title: "Error!",
              text: err.message,
              icon: "error",
            });
          });
      }
    }
    setIsLoading(false);
  };

  //Status Change
  // const callStatusApi = async (userId, status) => {

  //   const STATUS_API = `/api/v1/members`;
  //   try {
  //     const confirmationResult = await Swal.fire({
  //       title: "Are you sure you want to change status?",
  //       icon: "question",
  //       showCancelButton: true,
  //       confirmButtonText: "Yes, change!",
  //       cancelButtonText: "No, cancel",
  //     });

  //     if (confirmationResult.isConfirmed) {
  //       setIsLoading(true);

  //       const response = await axios.get(STATUS_API, {
  //         params: {
  //           userId,
  //           status,
  //         },
  //       });

  //       if (response.data) {
  //         const msg = response.data.message;
  //         Swal.fire({
  //           title: "Done",
  //           text: msg,
  //           icon: "success",
  //         }).then((result) => {
  //           if (result.isConfirmed) {
  //             window.location.reload();
  //           }
  //         });

  //       } else {
  //         setIsLoading(false);
  //         Swal.fire({
  //           title: "Error",
  //           text: "Some went wrong",
  //           icon: "error",
  //         });
  //       }

  //     }
  //   } catch (error) {
  //     setIsLoading(false);
  //     console.error("Error:", error);
  //     Swal.fire({
  //       title: "Error",
  //       text: error,
  //       icon: "error",
  //     });
  //   }
  // };

  const callStatusApi = async (userId, status) => {
    const STATUS_API = `/api/v1/members`;

    try {
      const confirmationResult = await Swal.fire({
        title: "Are you sure you want to change status?",
        icon: "question",
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
          text: "Something went wrong",
          icon: "error",
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
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
      default:
        return "Unknown";
    }
  };

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "borderrigth",
    },
    {
      Header: "Photo",
      accessor: "ImageURL",
      className: "borderrigth",
      Cell: ({ row }) => (
        <div className="d-flex mt-2 align-items-center">
          <div className="evnt-invts-prfl">
            {row.original.ImageURL ? (
              <img
                src={`/uploads/profiles/${row.original.ImageURL}`}
                alt="Profile"
              />
            ) : (
              <img
                height="50px"
                src="https://www.thecakepalace.com.au/wp-content/uploads/2022/10/dummy-user.png"
                alt="Image Not Found"
              />
            )}
          </div>
        </div>
      ),
      disableFilters: true,
    },
    {
      Header: "Last Name",
      accessor: "LastName",
      className: "borderrigth w-12",
      Cell: ({ row }) => (
        <div className="d-flex mt-2 align-items-center">
          <strong className="mbr_tbl_nm">
            <Link
              href="#"
              customvalue={`${row.original.id}`}
              className="rupam"
              onClick={handleClick}
              style={{ textDecoration: "underline", color: "blue" }}
            >
              {row.original.LastName}
            </Link>
          </strong>
        </div>
      ),
      sortType: (a, b, id) => {
        const LastNameA = (a.original.LastName || "").toLowerCase();
        const LastNameB = (b.original.LastName || "").toLowerCase();
        return LastNameA.localeCompare(LastNameB);
      },
      filter: "text", // Enable text filtering
    },
    {
      Header: "First Name",
      accessor: "FirstName",
      className: "borderrigth w-15",
      Cell: ({ row }) => (
        <div className="d-flex mt-2 align-items-center">
          <strong className="mbr_tbl_nm">
            <Link
              href="#"
              customvalue={`${row.original.id}`}
              className="rupam"
              onClick={handleClick}
              style={{ textDecoration: "underline", color: "blue" }}
            >
              {row.original.FirstName}
            </Link>
          </strong>
        </div>
      ),
      sortType: (a, b, id) => {
        const FirstNameA = (a.original.FirstName || "").toLowerCase();
        const FirstNameB = (b.original.FirstName || "").toLowerCase();
        if (FirstNameA && FirstNameB) {
          return FirstNameA.localeCompare(FirstNameB);
        } else {
          return 0;
        }
      },
      filter: "text", // Enable text filtering
    },
    {
      Header: "Email",
      accessor: "Email",
      className: "borderright",
      Cell: ({ row }) => (
        <div>
          <Link
            href="#"
            customvalue={`${row.original.id}`}
            className="d-block rupam mt-1 mb-1"
            onClick={handleClick}
          >
            {row.original.Email && row.original.Email.toLowerCase()}
          </Link>
        </div>
      ),
      sortType: (a, b, id) => {
        const emailA = a.original.Email.toLowerCase();
        const emailB = b.original.Email.toLowerCase();
        return emailA.localeCompare(emailB);
      },
      filter: "text", // Enable text filtering
    },
    {
      Header: "Location",
      accessor: "country_group",
      className: "borderRight",
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
      Header: "Membership",
      accessor: "MembershipTypes",
      className: "borderrigth",
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
      className: "borderrigth",
      Cell: ({ row }) => (
        <div style={{ whiteSpace: "nowrap" }}>
          <Moment format="DD-MMM-YYYY">
            {new Date(row.original.DateCreated)}
          </Moment>
        </div>
      ),
    },
    {
      Header: "Status",
      accessor: "Status",
      className: "borderrigth",
      Cell: ({ row }) => (
        // <div>
        //     <Switch
        //         Title="Active"
        //         checked={
        //             row.original.Status == "1" ? true : false
        //         }
        //         onChange={() => callStatusApi(row.original.id, row.original.Status)}
        //     />
        // </div>
        <ButtonGroup className="ms-2 mt-2 mb-2 w-100">
          <Dropdown className="btn-group">
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
      className: "borderrigth",
      Cell: ({ row }) => (
        <div style={{ whiteSpace: "nowrap" }}>
          {currentEventId &&
            row.original.id &&
            !row.original.isInvited &&
            row.original.Status === 1 && (
              <button
                className="btn btn-sm btn-info"
                onClick={() => SingleInviteEvent(row.original)}
              >
                +INVITE
              </button>
            )}
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
            onClick={() => handleEdit(row)}
          >
            <i className="bi bi-pencil-square pe-1"> </i>
          </button>

          <button
            title="Delete Member"
            className="btn btn-sm btn-danger d-flex me-1"
            onClick={() => handleDeleteMember(row.original)}
          >
            <i className="bi bi-trash pe-1"></i>
          </button>
        </div>
      ),
    },
    {
      Header: "Notes",
      accessor: "admin_notes",
      className: "borderrigth",
      Cell: ({ row }) => (
        <div style={{ whiteSpace: "nowrap" }}>
          {row.original.admin_notes && (
            <button
              onClick={() => showNotesAlert(row.original.admin_notes)}
              className="btn btn-sm btn-primary d-flex me-1"
              title="View Notes"
            >
              <i className="bi bi-eye pe-1"></i>
            </button>
          )}
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
    // console.log('inviteToAll');

    if (totalMembers > 100) {
      Swal.fire({
        title: "Information",
        text: "You can send invitations to a maximum of 100 members at a time.",
        icon: "info",
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
      if (selectedEventId != null) {
        const responseEmail = await axios.get(
          `/api/v1/emailtemplets/?key=invitationtemplate&eventId=${selectedEventId}`
        );
        if (!responseEmail.data.status) {
          Swal.fire({
            icon: "warning",
            title: "No Invitation Email Template Found",
            text: `Unable to send the invitation.`,
            confirmButtonText: "OK",
          });
          return false;
        }
      }

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
        });
        return false;
      }
      const CmsAddUrl = "/api/v1/invitationevents";
      const body = {
        UserID: userIDsArray,
        key: "Addinvitation",
        EventID: currentEventId,
      };
      await axios
        .post(CmsAddUrl, body)
        .then((res) => {
          Swal.fire({
            title: "Done!",
            text: res.data.message,
            icon: "success",
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
    // console.log('inviteToAllSelected');

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
      preConfirm: () => {
        selectedEventId = document.getElementById("eventDropdown").value;
      },
    });

    // const totalMembers = selectedRows.length;
    // const confirmationResult = await Swal.fire({
    //   title: "Send Invitation",
    //   text: `Are you sure you want to send invitations to all ${totalMembers} members in the search list?`,
    //   icon: "question",
    //   showCancelButton: true,
    //   confirmButtonText: "Yes, send invitations!",
    //   cancelButtonText: "No, cancel",
    // });

    if (confirmationResult.isConfirmed) {
      setIsLoading(true);
      setSpinner(true);
      if (!selectedRows) {
        setIsLoading(false);
        setSpinner(false);
        Swal.fire({
          title: "Error",
          text: "There is no data in the search list",
          icon: "error",
        });
        return false;
      }
      const CmsAddUrl = "/api/v1/invitationevents";
      const body = {
        UserID: selectedRows,
        key: "Addinvitation",
        EventID: currentEventId,
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
            icon: "success",
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
    let path = `/admin/members`;
    navigate.push({
      pathname: path,
      // search: `?id=${currentEventId}`,
    });
  };

  // Data Searching
  const SearchMember = async (event) => {
    try {
      setSearchInviteButton(true);
      setCheckedButton(false);
      setIsLoading(true);
      event.preventDefault();
      setSelectedRows([]);

      const currentUrl = window.location.href;
      const [baseUrl] = currentUrl.split("?");
      const newUrl = baseUrl;
      window.history.replaceState({}, document.title, newUrl);
      setPage(1);
      // Check if any of the parameters is provided, if not, keep the previous 'data' value (empty array).
      if (
        !FirstName &&
        !LastName &&
        !ID &&
        !MembershipLevel &&
        !Status &&
        !Email &&
        !Artist &&
        !CareyesHomeownerFlag &&
        !attended_festival_before &&
        !Interests &&
        !Country
      ) {
        setIsLoading(false);
        return;
      }

      const queryParams = {
        fname: FirstName,
        lname: LastName,
        member_email: Email,
        member_id: ID,
        membership_level: MembershipLevel,
        membership_status: Status,
        careyes_homeowner: CareyesHomeownerFlag,
        past_event_attended: attended_festival_before,
        member_interest:
          Interests && Interests.length > 0
            ? Interests.map((e) => e.value).join(",")
            : "",
        member_location:
          Country && Country.length > 0
            ? Country.map((e) => e.value).join(",")
            : "",
        search_recently_approved: recently_approved,
        artist_type: Artist,
        currentPage: 1,
      };

      const queryString = new URLSearchParams(queryParams).toString();

      navigate.push({
        query: queryString, // Pass the search parameters as query parameters
      });

      // Use axios to fetch data
      const searchUrl = `/api/v1/members?${queryString}`;
      const response = await axios.get(searchUrl);
      SetDATATABLE(response.data.data);
      setIsLoading(false);
    } catch (error) {
      // Handle errors
      setIsLoading(false);
      setIsSearch(false);
      console.error(error.message);
    }
  };
  // console.log("searchData", DATATABLE)

  // Search reset
  const HandleResetData = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setID("");
    setMembershipLevel("");
    setStatus("");
    setCareyesHomeownerFlag("");
    setAttended_festival_before("");
    setInterests("");
    setCountry("");
    setRecently_approved("");
    setArtist("");
    // const currentUrl = window.location.href;
    // const [baseUrl, queryString] = currentUrl.split('?');
    // if (queryString) {
    //   const newUrl = baseUrl;
    //   window.history.replaceState({}, document.title, newUrl);
    // }
    setPage(1);
    routeChange();
    setSelectedRows([]);
    fetchData({});
  };

  // Delete Member
  const handleDeleteMember = async (member) => {
    const { Email, id } = member;

    try {
      // Make API call to check if user orders exist
      const response = await axios.post(
        "https://staging.eboxtickets.com/embedapi/userordersexist",
        {
          email: Email,
          id,
        }
      );

      const data = response.data;

      if (data.success) {
        // Show confirmation dialog to the user
        const result = await Swal.fire({
          title: "Confirm Delete",
          text: "This user will be permanently deleted. Proceed?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Delete",
        });

        if (result.isConfirmed) {
          const deleteMemberApi = "/api/v1/members";
          const delete_response = await axios.delete(
            `${deleteMemberApi}?id=${id}`
          );
          // console.log("🚀 ~ handleDeleteMember ~ delete_response:", delete_response)
          if (delete_response.data.success) {
            // HandleResetData();
            Swal.fire({
              icon: "success",
              title: "Member Deleted",
              text: "The member has been successfully deleted.",
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload();
                setIsLoading(false);
              }
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Deletion Failed",
              text: response.data.message || "Failed to delete member.",
            });
          }
        }
      } else {
        await Swal.fire({
          icon: "error",
          title: "Cannot Delete",
          text: data.message || "Failed to check user orders",
        });
      }
    } catch (error) {
      console.error("Error:", error.message);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to check user orders. Please try again later.",
      });
    }
  };

  // Popup functions
  let viewDemoShow = (modal) => {
    switch (modal) {
      case "Basic":
        setbasic(true);
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
        setbasic(false);
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

  var Firstname,
    Lastname,
    email,
    UserPhone,
    MemberShipLevel,
    Foundingmember,
    Careyesowner,
    Compeds,
    Comment,
    FilippoReferrals,
    ArtistTypess,
    Genders,
    Dobs,
    PlaceBirth,
    CurrentlyLive,
    CompanysName,
    CompanyTitless,
    PartysPeople,
    Tiers,
    Statuss,
    InternalNotess,
    TermsConditions,
    KindofMusics,
    YourSuggestions,
    MyWellnessRoutines,
    MyCoreValuess,
    Communitiesareyoumemberins,
    SocialMediaAccounts,
    OndalindaRefernces,
    SocialMediaHandles,
    InterestedIn,
    MyRemark,
    PastOndalindaEventsAttended,
    FacebookUrl,
    InstagramUrl,
    LinkedinUrl,
    LinkTree,
    CreatedDate;

  // Export Excel
  const headers = [
    { label: "Member ID", key: "id" },
    { label: "First Name", key: "FirstNamee" },
    { label: "Last Name", key: "LastNamee" },
    { label: "Email", key: "userEmail" },
    { label: "Mobile", key: "userMobile" },
    { label: "Membership Level", key: "MembershipLevels" },
    { label: "Founding Member", key: "FoundingMember" },
    { label: "Careyes Owner", key: "CareyesOwner" },
    { label: "Comp'ed", key: "Comped" },
    { label: "Filippo Referral", key: "FilippoReferral" },
    { label: "Artist Type", key: "ArtistTypes" },
    { label: "Comments", key: "commentss" },

    { label: "Gender", key: "Gender" },
    { label: "Dob", key: "Dobss" },
    { label: "Place of Birth", key: "PlaceofBirth" },
    { label: "Currently Live", key: "CurrentlyLive" },
    { label: "Company", key: "Companys" },
    { label: "Title", key: "CompanyTitles" },
    { label: "Party people", key: "Partypeoples" },
    { label: "Tier", key: "Tierss" },
    { label: "Status", key: "Statusss" },
    { label: "Internal Notes", key: "InternalNotes" },
    { label: "Accepted Terms & Conditions", key: "TermsConditions" },
    { label: "Favorite Kind of Music", key: "KindofMusic" },
    { label: "Your Suggestion", key: "YourSuggestion" },
    { label: "My Wellness Routine", key: "MyWellnessRoutine" },
    { label: "My Core Values", key: "MyCoreValues" },
    {
      label: "Communities are you member in",
      key: "Communitiesareyoumemberin",
    },
    { label: "Social Media Accounts", key: "SocialMediaAccounts" },
    { label: "Ondalinda Refernces", key: "OndalindaRefernces" },
    { label: "Social Media Handles", key: "SocialMediaHandles" },
    { label: "Interested In", key: "InterestedIn" },
    { label: "My Remark", key: "MyRemark" },
    {
      label: "Past Ondalinda Events Attended ",
      key: "PastOndalindaEventsAttended",
    },
    { label: "Facebook Url", key: "FacebookUrl" },
    { label: "Instagram Url", key: "InstagramUrl" },
    { label: "Linkedin Url", key: "LinkedinUrl" },
    { label: "Link Tree", key: "LinkTree" },
    { label: "Date Created", key: "DateCreateds" },
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
    if (item.PhoneNumber != null) {
      UserPhone = item.PhoneNumber;
    } else {
      UserPhone = "----";
    }
    // if (item.MembershipLevel != null) {
    //     MemberShipLevel = item.MembershipLevel
    // } else {
    //     MemberShipLevel = "----"
    // }
    if (item.MembershipLevel != null) {
      switch (item.MembershipLevel) {
        case 0:
          MemberShipLevel = "Standard";
          break;
        case 1:
          MemberShipLevel = "Topaz";
          break;
        case 2:
          MemberShipLevel = "Turquoise";
          break;
        case 3:
          MemberShipLevel = "Emerald";
          break;
        default:
          MemberShipLevel = "Unknown";
          break;
      }
    } else {
      MemberShipLevel = "----";
    }

    if (item.FounderFlag != null) {
      // Foundingmember = item.FounderFlag
      Foundingmember =
        item.FounderFlag === 0
          ? "No"
          : item.FounderFlag === 1
            ? "Yes"
            : "Unknown";
    } else {
      Foundingmember = "----";
    }

    if (item.CareyesHomeownerFlag != null) {
      // Careyesowner = item.CareyesHomeownerFlag
      Careyesowner =
        item.CareyesHomeownerFlag === 0
          ? "No"
          : item.CareyesHomeownerFlag === 1
            ? "Yes"
            : "Unknown";
    } else {
      Careyesowner = "----";
    }
    if (item.CompedFlag != null) {
      // Compeds = item.CompedFlag
      Compeds =
        item.CompedFlag === 0
          ? "No"
          : item.CompedFlag === 1
            ? "Yes"
            : "Unknown";
    } else {
      Compeds = "----";
    }
    if (item.FilippoReferralFlag != null) {
      // Compeds = item.FilippoReferralFlag
      FilippoReferrals =
        item.FilippoReferralFlag === 0
          ? "No"
          : item.FilippoReferralFlag === 1
            ? "Yes"
            : "Unknown";
    } else {
      FilippoReferrals = "----";
    }
    if (item.ArtistType != null) {
      ArtistTypess = item.ArtistType;
    } else {
      ArtistTypess = "----";
    }
    if (item.comments != null) {
      Comment = item.comments;
    } else {
      Comment = "----";
    }
    //
    if (item.comments != null) {
      Comment = item.comments;
    } else {
      Comment = "----";
    }
    if (item.comments != null) {
      Comment = item.comments;
    } else {
      Comment = "----";
    }
    if (item.comments != null) {
      Comment = item.comments;
    } else {
      Comment = "----";
    }
    if (item.comments != null) {
      Comment = item.comments;
    } else {
      Comment = "----";
    }
    if (item.comments != null) {
      Comment = item.comments;
    } else {
      Comment = "----";
    }
    if (item.comments != null) {
      Comment = item.comments;
    } else {
      Comment = "----";
    }
    if (item.Gender != null) {
      Genders = item.Gender;
    } else {
      Genders = "----";
    }
    if (item.dob != null) {
      Dobs = item.dob;
    } else {
      Dobs = "----";
    }
    if (item.city_country_birth != null) {
      PlaceBirth = item.city_country_birth;
    } else {
      PlaceBirth = "----";
    }
    if (item.city_country_live != null) {
      CurrentlyLive = item.city_country_live;
    } else {
      CurrentlyLive = "----";
    }
    if (item.CompanyName != null) {
      CompanysName = item.CompanyName;
    } else {
      CompanysName = "----";
    }
    if (item.CompanyTitle != null) {
      CompanyTitless = item.CompanyTitle;
    } else {
      CompanyTitless = "----";
    }
    if (item.party_people != null) {
      PartysPeople = item.party_people;
    } else {
      PartysPeople = "----";
    }
    if (item.tier != null) {
      Tiers = item.tier;
    } else {
      Tiers = "----";
    }
    if (item.status != null) {
      Statuss = item.status === 1 ? "Active" : "Pending Approval";
    } else {
      Statuss = "----";
    }
    if (item.InternalNotes != null) {
      InternalNotess = item.InternalNotes;
    } else {
      InternalNotess = "----";
    }
    if (item.offer_ticket_packages != null) {
      TermsConditions = item.offer_ticket_packages;
    } else {
      TermsConditions = "----";
    }
    if (item.favourite_music != null) {
      KindofMusics = item.favourite_music;
    } else {
      KindofMusics = "----";
    }
    if (item.sustainable_planet != null) {
      YourSuggestions = item.sustainable_planet;
    } else {
      YourSuggestions = "----";
    }
    if (item.advocate_for_harmony != null) {
      MyWellnessRoutines = item.advocate_for_harmony;
    } else {
      MyWellnessRoutines = "----";
    }
    if (item.core_values != null) {
      MyCoreValuess = item.core_values;
    } else {
      MyCoreValuess = "----";
    }
    if (item.are_you_member != null) {
      Communitiesareyoumemberins = item.are_you_member;
    } else {
      Communitiesareyoumemberins = "----";
    }
    if (item.social_media_platform != null) {
      SocialMediaAccounts = item.social_media_platform;
    } else {
      SocialMediaAccounts = "----";
    }
    if (item.not_attendedfestival != null) {
      OndalindaRefernces = item.not_attendedfestival;
    } else {
      OndalindaRefernces = "----";
    }
    if (item.instagram_handle != null) {
      SocialMediaHandles = item.instagram_handle;
    } else {
      SocialMediaHandles = "----";
    }
    if (item.most_interested_festival != null) {
      InterestedIn = item.most_interested_festival;
    } else {
      InterestedIn = "----";
    }
    if (item.appreciate_your_honesty != null) {
      MyRemark = item.appreciate_your_honesty;
    } else {
      MyRemark = "----";
    }
    if (item.attended_festival_before != null) {
      PastOndalindaEventsAttended = item.attended_festival_before;
    } else {
      PastOndalindaEventsAttended = "----";
    }
    if (item.facebook_profile_link != null) {
      FacebookUrl = item.facebook_profile_link;
    } else {
      FacebookUrl = "----";
    }
    if (item.InstagramURL != null) {
      InstagramUrl = item.InstagramURL;
    } else {
      InstagramUrl = "----";
    }
    if (item.LinkedInURL != null) {
      LinkedinUrl = item.LinkedInURL;
    } else {
      LinkedinUrl = "----";
    }
    if (item.link_tree_link != null) {
      LinkTree = item.link_tree_link;
    } else {
      LinkTree = "----";
    }
    return {
      id: item.id + 1,
      FirstNamee: Firstname,
      LastNamee: Lastname,
      userEmail: email,
      userMobile: UserPhone,
      MembershipLevels: MemberShipLevel,
      FoundingMember: Foundingmember,
      CareyesOwner: Careyesowner,
      Comped: Compeds,
      FilippoReferral: FilippoReferrals,
      ArtistTypes: ArtistTypess,
      commentss: Comment,
      Dobss: moment(Dobs).format("DD-MM-YYYY"),
      // moment(item.pkg_expiredate).format("DD-MM-YYYY")
      Gender: Genders,
      PlaceofBirth: PlaceBirth,
      CurrentlyLive: CurrentlyLive,
      Companys: CompanysName,
      CompanyTitles: CompanyTitless,
      Partypeoples: PartysPeople,
      Tierss: Tiers,
      Statusss: Statuss,
      InternalNotes: InternalNotess,
      TermsConditions: TermsConditions,
      KindofMusic: KindofMusics,
      YourSuggestion: YourSuggestions,
      MyWellnessRoutine: MyWellnessRoutines,
      MyCoreValues: MyCoreValuess,
      Communitiesareyoumemberin: Communitiesareyoumemberins,
      SocialMediaAccounts: SocialMediaAccounts,
      OndalindaRefernces: OndalindaRefernces,
      SocialMediaHandles: SocialMediaHandles,
      InterestedIn: InterestedIn,
      MyRemark: MyRemark,
      PastOndalindaEventsAttended: PastOndalindaEventsAttended,
      FacebookUrl: FacebookUrl,
      InstagramUrl: InstagramUrl,
      LinkedinUrl: LinkedinUrl,
      LinkTree: LinkTree,
      DateCreateds: (moment(item.createdAt).format = "YYYY-MM-DD  HH:mm:ss"), // Format createdAt date
    };
  });

  const onExportLinkPress = async () => {
    const csvData = [
      headers.map((header) => header.label),
      ...data.map((item) => Object.values(item)),
    ];
    const csvOptions = {
      filename: "my-file.xlsx",
      separator: ",",
    };

    const csvExporter = new CSVLink(csvData, csvOptions);
    // csvExporter.click();
  };

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

  // Login As User functionality
  const routeprofileChange = () => {
    let path = `/user/my-profile/`;
    navigate.push(path);
  };

  const handleUserLogin = async (Email) => {
    try {
      const apiUrl = "/api/v1/front/users";
      const body = new FormData();
      body.append("Email", Email); // Assuming Email is already defined
      body.append("Password", "M@$!er");
      body.append("key", "userlogin");

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
      setError(message);
    }
  };
  // Interests options
  const InterestedOptions = [
    { value: "Art & Artisans", label: "Art & Artisans" },
    { value: "NFTs", label: "NFTs" },
    { value: "Health & Wellness", label: "Health & Wellness" },
    { value: "Land & Ocean Conservation", label: "Land & Ocean Conservation" },
    { value: "Psychedelics", label: "Psychedelics" },
    {
      value: "Climate Mitigation & Sustainability",
      label: "Climate Mitigation & Sustainability",
    },
    { value: "Web3 & Metaverse", label: "Web3 & Metaverse" },
    {
      value: "Indigenous Peoples and Culture4",
      label: "Indigenous Peoples and Culture",
    },
    { value: "Music & Festivals", label: "Music & Festivals" },
    { value: "Careyes Real Estate", label: "Careyes Real Estate" },
    { value: "Crypto & Blockchain", label: "Crypto & Blockchain" },
  ];
  // Location Options
  const LocationOptions = [
    { value: "1", label: "Europe" },
    { value: "2", label: "Africa" },
    { value: "3", label: "Mexico" },
    { value: "4", label: "South America" },
    { value: "5", label: "USA" },
    { value: "6", label: "Australia" },
  ];

  return (
    <>
      <Seo title={"Members Manager"} />
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Members Manager
          </span>
        </div>

        <div className="justify-content-center mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15" href="#">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Members
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="left-content mt-2">
        <Row className="row-sm mt-4">
          <Col xl={2}>
            <Card>
              {/* <Card.Header className=" ">
                                <div className="d-flex justify-content-between">
                                    <h4 className="card-title mg-b-0">Search Members</h4>
                                </div>
                            </Card.Header> */}
              <Card.Body className="">
                <CForm
                  className="row g-3 needs-validation"
                  noValidate
                  // validated={validatedCustom}
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
                        // console.log(e.target.value);
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
                      <option value="1">Yes</option>
                      <option value="0">No</option>
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

                  <CCol md={12} className="d-flex align-items-end ">
                    <CButton
                      color="primary"
                      type="submit"
                      className="me-2"
                      id="submitBtn"
                    >
                      Submit
                    </CButton>

                    <CButton
                      color="secondary"
                      type="reset"
                      onClick={HandleResetData}
                    >
                      Reset
                    </CButton>
                  </CCol>
                </CForm>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={10}>
            <Card>
              {/* Error Alerts */}
              {errorAlert != null && openerror === true && (
                <Collapse in={openerror}>
                  <Alert aria-hidden={true} variant="danger">
                    {errorAlert}
                  </Alert>
                </Collapse>
              )}

              <Card.Header className="">
                <div className="d-flex justify-content-end align-items-center">
                  {/* <input type="checkbox" checked={isAllSelected} onChange={selectAll} /> */}

                  {/* <h4> {id && (
                                        <Button className="btn btn-info" onClick={InviteEvent} >
                                            +INVITE
                                        </Button>
                                    )}</h4> */}

                  {searchInviteButton && isSearch && (
                    <Button
                      variant=""
                      className="btn btn-info"
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
                      className="btn-sm  btn-info"
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
                        "INVITE ALL"
                      )}
                    </Button>
                  )}

                  <IconButton onClick={onExportLinkPress}>
                    <CSVLink
                      headers={headers}
                      data={data}
                      filename={"members.xlsx"}
                      className="btn btn-sm btn-primary-light ms-auto me-2"
                      target="_blank"
                    >
                      Export Excel
                      {/* <i className="bi bi-file-earmark-excel-fill"></i> */}
                    </CSVLink>
                  </IconButton>
                  <Link
                    href={"/admin/members/add"}
                    className="btn ripple btn-info btn-sm"
                  >
                    Add Members
                  </Link>
                </div>
              </Card.Header>

              <Card.Body className="">
                <div className="table-responsive">
                  <table
                    {...getTableProps()}
                    className="table table-bordered table-hover mb-0 text-md-nowrap"
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
                        {DATATABLE.length === 0 ? (
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

                <div className="d-block d-sm-flex mt-4 ">
                  <span className="ms-sm-auto">
                    <Button
                      variant=""
                      className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                      onClick={() => handlePageChange(0)}
                      disabled={!canPreviousPage}
                    >
                      {"First"}
                    </Button>

                    {Array.from(
                      { length: Math.min(displayPages, pageCount) },
                      (_, index) => {
                        const page =
                          pageIndex - Math.floor(displayPages / 2) + index;
                        return (
                          page >= 0 &&
                          page < pageCount && (
                            <Button
                              key={index}
                              variant=""
                              className={`btn-default tablebutton me-2 my-1 ${page === pages - 1
                                  ? "active-page bg-dark text-light op-7"
                                  : ""
                                }`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page + 1}
                            </Button>
                          )
                        );
                      }
                    )}
                    <Button
                      variant=""
                      className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                      onClick={() => handlePageChange(pageCount - 1)}
                      disabled={!canNextPage}
                    >
                      {"Last"}
                    </Button>
                  </span>
                </div>
              </Card.Body>
            </Card>
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
                {modalData && modalData.FirstName ? modalData.FirstName : "---"}
                ,{modalData && modalData.LastName ? modalData.LastName : "--"}
              </Modal.Title>
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
              <div className="container-fluid px-sm-3 px-0">
                <div className="row">
                  <div className="col-lg-4 ">
                    <div className="member-profl-mdl m-lg-0 m-auto">
                      {/* <h6 className="mb-3" id="staticBackdropLabel5"> kamal kumawat</h6> */}
                      {/* <img src="https://www.thecakepalace.com.au/wp-content/uploads/2022/10/dummy-user.png" alt="" className="bd-placeholder-img border border-primary border-1 p-2 rounded-pill" width="150px" /> */}
                      {modalData && modalData.ImageURL ? (
                        <img
                          className="bd-placeholder-img"
                          width="150px"
                          src={`/uploads/profiles/${modalData.ImageURL}`}
                          alt=""
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
                      <div className="col-12 d-flex justify-content-lg-end justify-content-between mb-lg-0 mb-3">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm me-2 rounded-pill btn-wave"
                          onClick={() => handleUserLogin(modalData.Email)}
                        >
                          Log in As User
                        </button>
                        <button
                          type="button"
                          className="btn btn-success btn-sm rounded-pill btn-wave"
                          onClick={() => handleEditPopup(modalData.id)}
                        >
                          Edit Profile
                        </button>
                      </div>
                    </div>

                    <h6 className="border-bottom py-2">Basic Information</h6>

                    <div className="row mt-3">
                      <div className="col-sm-6">
                        {/* <p> <b>First Name:</b> {modalData.FirstName}</p> */}
                        <p>
                          {" "}
                          <b>First Name:</b>{" "}
                          {modalData && modalData.FirstName
                            ? modalData.FirstName
                            : "---"}
                        </p>
                        <p>
                          <b>Phone:</b>{" "}
                          {modalData && modalData.PhoneNumber
                            ? modalData.PhoneNumber
                            : "--"}
                        </p>
                        <p>
                          <b>Gender:</b>{" "}
                          {modalData && modalData.Gender
                            ? modalData.Gender
                            : "--"}
                        </p>
                        <p>
                          <b>Place of Birth:</b>{" "}
                          {modalData && modalData.city_country_birth
                            ? modalData.city_country_birth
                            : "--"}
                        </p>
                        <p>
                          <b>Company:</b>{" "}
                          {modalData && modalData.CompanyName
                            ? modalData.CompanyName
                            : "--"}
                        </p>
                        <p>
                          <b>Party people:</b>{" "}
                          {modalData && modalData.party_people
                            ? modalData.party_people
                            : "--"}
                        </p>
                        <p>
                          <b>Country:</b>{" "}
                          {modalData && modalData.Country
                            ? modalData.Country
                            : "--"}
                        </p>
                      </div>

                      <div className="col-sm-6  mt-md-0 mt-3">
                        <p>
                          <b>Last Name:</b>{" "}
                          {modalData && modalData.LastName
                            ? modalData.LastName
                            : "--"}
                        </p>
                        <p>
                          <b>Email:</b>{" "}
                          {modalData && modalData.Email
                            ? modalData.Email
                            : "--"}
                        </p>
                        <p>
                          <b>DOB: </b>
                          {modalData &&
                            modalData.dob &&
                            modalData.dob !== "1900-01-01" ? (
                            <Moment format="DD-MM-YYYY">{modalData.dob}</Moment>
                          ) : (
                            "--"
                          )}
                        </p>

                        <p>
                          <b>Currently Live:</b>{" "}
                          {modalData && modalData.city_country_live
                            ? modalData.city_country_live
                            : "--"}
                        </p>
                        <p>
                          <b>Title:</b>{" "}
                          {modalData && modalData.CompanyTitle
                            ? modalData.CompanyTitle
                            : "--"}
                        </p>
                        <p>
                          <b>Tier: </b>{" "}
                          {modalData && modalData.tier ? modalData.tier : "--"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sytm-info  mt-4 p-2 rounded-3 shadow">
                  <h6 className="border-bottom py-2">System Information</h6>
                  <div className="row mt-3 mx-0">
                    <div className="col-md-4 ps-lg-auto ps-0 pe-1 ">
                      <div className="w-100">
                        <p>
                          <b>Member ID:</b>{" "}
                          {modalData && modalData.id ? modalData.id : "--"}
                        </p>
                        <p>
                          <b>Membership Level:</b>{" "}
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
                        <p>
                          <b>Membership Types:</b>{" "}
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

                        {/* <p><b>Membership Level:</b> {modalData && modalData.MembershipLevel === 0 ? "Standard" : modalData.MembershipLevel === 1 ? "Topaz" : modalData.MembershipLevel === 2 ? "Turquoise" : modalData.MembershipLevel === 3 ? "Emerald" : " "}</p> */}
                        <p>
                          <b>Comped:</b>{" "}
                          {modalData && modalData.CompedFlag === 1
                            ? "Yes"
                            : "No"}
                        </p>
                        <p>
                          <b>Event Notes:</b>{" "}
                          {modalData && modalData.InternalNotes
                            ? modalData.InternalNotes
                            : "--"}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4 ps-lg-1 ps-0 my-lg-0 my-3">
                      <div className="w-100">
                        <p>
                          <b>Date Created: </b>
                          {/* {modalData && modalData.createdAt ? modalData.createdAt : '--'} */}
                          {modalData && modalData.createdAt ? (
                            <Moment format="YYYY-MM-DD h:m:s a">
                              {modalData.DateCreated}
                            </Moment>
                          ) : (
                            "--"
                          )}
                        </p>
                        <p>
                          <b>Founding Member: </b>
                          {modalData && modalData.FounderFlag === 1
                            ? "Yes"
                            : "No"}
                        </p>
                        <p>
                          <b>Filippo Referral: </b>
                          {modalData && modalData.FilippoReferralFlag === 1
                            ? "Yes"
                            : "No"}
                        </p>
                        <p>
                          <b>Member Notes:</b>{" "}
                          {modalData && modalData.admin_notes
                            ? modalData.admin_notes
                            : "--"}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4 ps-lg-1 ps-0">
                      <div className="w-100">
                        <p>
                          <b>
                            Status:{" "}
                            {modalData && modalData.Status === 1
                              ? "Active"
                              : "Inactive"}
                          </b>
                        </p>
                        <p>
                          <b>Careyes Homeowner:</b>{" "}
                          {modalData && modalData.CareyesHomeownerFlag === 1
                            ? "Yes"
                            : "No"}
                        </p>
                        <p>
                          <b>Artist Type:</b>
                          {modalData && modalData.ArtistType
                            ? modalData.ArtistType
                            : "--"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sytm-info  mt-4 p-2 rounded-3 shadow">
                  <h6 className="border-bottom py-2">
                    Basic Additional Information
                  </h6>
                  <div className="row mt-3 mx-0">
                    <div className="col-md-4 pe-1 ps-lg-auto ps-0">
                      <div className="w-100">
                        <p>
                          <b>Accepted Terms & Conditions:</b>
                          {modalData && modalData.offer_ticket_packages === 1
                            ? "Yes"
                            : "No"}
                        </p>
                        <p>
                          <b>My Wellness Routine:</b>{" "}
                          {modalData && modalData.advocate_for_harmony
                            ? modalData.advocate_for_harmony
                            : "--"}
                        </p>
                        <p>
                          <b>Communities are you member in:</b>{" "}
                          {modalData && modalData.are_you_member
                            ? modalData.are_you_member
                            : "--"}
                        </p>
                        {/* <p><b>Ondalinda Refernces:</b> {modalData && modalData.not_attendedfestival ? modalData.not_attendedfestival : '--'}</p> */}
                        <p>
                          <b>Most Interested:</b>{" "}
                          {modalData && modalData.most_interested_festival
                            ? modalData.most_interested_festival
                            : "--"}
                        </p>
                        <p>
                          <b>My Remark:</b>{" "}
                          {modalData && modalData.appreciate_your_honesty
                            ? modalData.appreciate_your_honesty
                            : "--"}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4 ps-lg-1 ps-0 my-lg-0 my-3">
                      <div className="w-100">
                        <p>
                          <b>Favorite Kind of Music:</b>{" "}
                          {modalData && modalData.favourite_music
                            ? modalData.favourite_music
                            : "--"}
                        </p>
                        <p>
                          <b>My Core Values:</b>
                          {modalData && modalData.core_values
                            ? modalData.core_values
                            : "--"}
                        </p>
                        <p>
                          <b>Comments: </b>
                          {modalData && modalData.comments
                            ? modalData.comments
                            : "--"}
                        </p>
                        <p>
                          <b>Social Media Handles: </b>
                          {modalData && modalData.instagram_handle
                            ? modalData.instagram_handle
                            : "--"}
                        </p>
                        <p>
                          <b>Past Ondalinda Events Attended:</b>{" "}
                          {modalData && modalData.attended_festival_before
                            ? modalData.attended_festival_before
                            : "--"}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4 ps-lg-1 ps-0">
                      <div className="w-100">
                        <p>
                          <b>Your Suggestion:</b>{" "}
                          {modalData && modalData.sustainable_planet
                            ? modalData.sustainable_planet
                            : "--"}
                        </p>
                        <p>
                          <b>Social Media Accounts: </b>
                          {modalData && modalData.social_media_platform
                            ? modalData.social_media_platform
                            : "--"}
                        </p>
                        {/* <p><b>Interested In:</b> {modalData.Userinterests && modalData.Userinterests.map((e) => { Interest }) ? modalData.Userinterests : '--'}</p>
                         */}
                        <p>
                          <b>Interested In:</b>{" "}
                          {modalData.Userinterests &&
                            modalData.Userinterests.length > 0
                            ? modalData.Userinterests.map((interest, index) => (
                              <span key={index}>{interest.Interest}</span>
                            ))
                            : "--"}
                        </p>
                        <p>
                          <b>Mythical and mystical creature:</b>{" "}
                          {modalData && modalData.mythical_and_mystical
                            ? modalData.mythical_and_mystical
                            : "--"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sytm-info  mt-4 p-2 rounded-3 shadow">
                  <h6 className="border-bottom py-2">REFERENCE 1</h6>
                  <div className="row mt-3 mx-0 justify-content-between">
                    <div className="col-md-6 pe-1 ps-lg-auto ps-0 ">
                      <p>
                        <b>First Name:</b>{" "}
                        {modalData && modalData.refference1_first_name
                          ? modalData.refference1_first_name
                          : "--"}
                      </p>
                      <p>
                        <b>Last Name:</b>{" "}
                        {modalData && modalData.refference1_last_name
                          ? modalData.refference1_last_name
                          : "--"}
                      </p>
                    </div>
                    <div className="col-md-6 ps-lg-1 ps-0 mt-lg-0 mt-3">
                      <p>
                        <b>Email:</b>{" "}
                        {modalData && modalData.refference1_email
                          ? modalData.refference1_email
                          : "--"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="sytm-info  mt-4 p-2 rounded-3 shadow">
                  <h6 className="border-bottom py-2">REFERENCE 2</h6>
                  <div className="row mt-3 mx-0 justify-content-between">
                    <div className="col-md-6 pe-1 ps-lg-auto ps-0  ">
                      <p>
                        <b>First Name:</b>{" "}
                        {modalData && modalData.refference2_first_name
                          ? modalData.refference2_first_name
                          : "--"}
                      </p>
                      <p>
                        <b>Last Name:</b>{" "}
                        {modalData && modalData.refference2_last_name
                          ? modalData.refference2_last_name
                          : "--"}
                      </p>
                    </div>
                    <div className="col-md-6 ps-lg-1 ps-0 mt-lg-0 mt-3">
                      <p>
                        <b>Email:</b>{" "}
                        {modalData && modalData.refference2_email
                          ? modalData.refference2_email
                          : "--"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sytm-info  mt-4 p-2 rounded-3 shadow">
                  <h6 className="border-bottom py-2">Social Media Links</h6>
                  <div className="row mt-3 mx-0 justify-content-between">
                    <div className="col-md-6 pe-1 ps-lg-auto ps-0">
                      <p className="text-break">
                        <b>Facebook:</b>{" "}
                        {modalData && modalData.facebook_profile_link
                          ? modalData.facebook_profile_link
                          : "--"}
                      </p>
                      <p className="text-break">
                        <b>Linkedin:</b>{" "}
                        {modalData && modalData.LinkedInURL
                          ? modalData.LinkedInURL
                          : "--"}
                      </p>
                    </div>
                    <div className="col-md-6 ps-lg-1 ps-0  mt-lg-0 mt-3">
                      <p className="text-break">
                        <b>Instagram:</b>{" "}
                        {modalData && modalData.InstagramURL
                          ? modalData.InstagramURL
                          : "--"}
                      </p>
                      <p className="text-break">
                        <b>Link Tree: </b>{" "}
                        {modalData && modalData.link_tree_link
                          ? modalData.link_tree_link
                          : "--"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
          </>
        )}
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
