import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Form,
  Modal,
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
import Moment from "react-moment";
import { useRouter } from "next/router";
import moment from "moment";
import { MultiSelect } from "react-multi-select-component";
import ClipLoader from "react-spinners/ClipLoader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import Image from "next/image";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  CForm,
  CCol,
  CFormLabel,
  CFormFeedback,
  CFormInput,
} from "@coreui/react";
// import { Checkbox, ListItemIcon, ListItemText, MenuItem } from "@mui/material";

const InvitationsTable = ({initialInvitations,totalRecordsCount,currentPage,queryParams}) => {
  const navigate = useRouter();
  const router = useRouter();
  const { attendees } = router.query;
  const { EventID } = router.query;
  const submitButtonRef = useRef();
  const [lgShow, setLgShow] = useState(false);
  const [DataTable, SetDataTable] = useState(initialInvitations || []);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(false)
    SetDataTable(initialInvitations);
    setTotalRecords(totalRecordsCount);
    setCurrentPageIndex(currentPage - 1);
  }, [initialInvitations, totalRecordsCount, currentPage]);
  // sync SSR data on first load
  const [totalRecords, setTotalRecords] = useState(totalRecordsCount || 0);
  const [modalData, setModalData] = useState([]);
  const [FirstName, setFirstName] = useState(queryParams.FirstName || "");
  const [LastName, setLastName] = useState(queryParams.LastName || "");
  const [Email, setEmail] = useState(queryParams.Email || "");
  // const [Status, setStatus] = useState([queryParams.Status]||[]);
  const [Status, setStatus] = useState([]);
  const [HousingOption, setHousingOption] = useState([]);
  const [ArtistType, setArtistType] = useState("");
  const [attended_festival_before, setAttended_festival_before] = useState("");
  const [CareyesHomeownerFlag, setCareyesHomeownerFlag] = useState("");
  const [Interests, setInterests] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [staticAdded, setStaticAdded] = useState("");
  const [basic, setBasic] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [checkedButton, setCheckedButton] = useState(false);
  const [searchInviteButton, setSearchInviteButton] = useState(false);
  const [accommodation_status, setAccommodation_status] = useState("");

  const [activeRow, setActiveRow] = useState(null);
  const [keyword, setKeyword] = useState(queryParams.keyword || "");
  const rowRefs = useRef({}); // To keep references to rows
const hasFetched = useRef(false); // 🧠 Tracks if fetchData has been triggered
  // Helper functions to determine badge color and text based on status
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


  // Status Color for Accommodations
  const getStatusBadgeColor2 = (status) => {
    switch (status) {
      case "Preference Submitted":
        return "danger";       // Red
      case "Property Offered":
        return "warning";      // Yellow
      case "Booked":
        return "success";      // Green
      default:
        return "secondary";    // Gray (for anything else or missing)
    }
  };


  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Interested";
      case 1:
        return "Invited";
      case 2:
        return "Completed";
      case 3:
        return "Partially Paid";
      case 4:
        return "Over Paid";
      case 5:
        return "Preference Submitted";
      default:
        return "Unknown Status";
    }
  };

  const toggleAllRowsSelected = () => {
    setCheckedButton(true);
    setSearchInviteButton(false);

    // Get all row IDs where status is not 2
    const allRowIds = page
      .filter((row) => row.original.Status !== 2) // Filter out rows with status 2
      .map((row) => row.original.id);

    // Check if all eligible rows are selected
    if (allRowIds.length > 0 && selectedRows.length === allRowIds.length) {
      setSelectedRows([]); // Deselect all if all are currently selected
    } else {
      setSelectedRows(allRowIds); // Select all eligible rows
    }
  };

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


  const countryGroupMap = {
    0: "N/A",
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
  };

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      // accessor: (row, index) => index + 1,
      accessor: (row) => row.serialNo,
      className: "borderrigth wd-3p",
    },
    {
      Header: "User Details",
      accessor: "Name",
      className: "wd-28p borderrigth",
      Cell: ({ row }) => (
        <div className="d-flex align-items-center name-user">
          <div className="evnt-invts-prfl membr-invts-prfl">
            {row.original.User && row.original.User.ImageURL ? (
              <Image
                src={
                  row.original.User?.ImageURL
                    ? `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${row.original.User.ImageURL}`
                    : "/imagenot/dummy-user.png"
                }
                alt="Profile"
                width={50} // Specify width
                height={50} // Specify height
                className=""
              />
            ) : (
              <Image
                src="/imagenot/dummy-user.png"
                alt="Profile"
                width={50} // Specify width
                height={50} // Specify height
              />
            )}
          </div>

          <div className="ms-2 w-75">
            <div className="user-Edit">
              <Link
                href="#"
                customvalue={row.original.UserID}
                className="rupam"
                onClick={(e) => handleClick(e, row.original.UserID)}
                style={{ textDecoration: "underline", color: "blue" }}
              >
                <strong>
                  {row.original && row.original.User
                    ? `${row.original.User.LastName || ""}, ${row.original.User.FirstName || ""
                    }`
                    : "User Information Not Available"}
                </strong>
              </Link>
              <div style={{ whiteSpace: "nowrap", display: "inline", marginLeft: "20px" }}>
                {row.original.User && row.original.User.InternalNotes && (
                  <i className="bi bi-eye px-2" onClick={() => showNotesAlert(row.original.User.InternalNotes)} title="View Notes" style={{ cursor: "pointer" }}></i>
                  // {/* </button> */}
                )}
                <Link
                  href={`/admin/events/registration-view?event-id=${row.original.EventID}&user-id=${row.original.UserID}&invitation-id=${row.original.id}`}
                  target="_blank"
                >
                  <i
                    className="fa fa-link px-1"
                    title="Edit Registration"
                    style={{}}
                  ></i>
                </Link>
              </div>
            </div>

            {row.original.User && row.original.User.Email ? (
              <>{row.original.User.Email}</>
            ) : (
              "Email Not Available"
            )}
          </div>
        </div>
      ),

      sortType: (a, b, id) => {
        const LastNameA = (a.original.User.LastName || "").toLowerCase();
        const LastNameB = (b.original.User.LastName || "").toLowerCase();
        const FirstNameA = (a.original.User.FirstName || "").toLowerCase();
        const FirstNameB = (b.original.User.FirstName || "").toLowerCase();
        const EmailA = (a.original.User.Email || "").toLowerCase();
        const EmailB = (b.original.User.Email || "").toLowerCase();

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
      accessor: "Location",
      className: "borderrigth wd-10p",
      Cell: ({ row }) => {
        const group = row.original.User?.country_group;
        return (
          <div>
            {countryGroupMap.hasOwnProperty(group) ? countryGroupMap[group] : "N/A"}
          </div>
        );
      },
      filter: "text",
      sortType: (a, b, id) => {
        const groupA = a.original.User?.country_group;
        const groupB = b.original.User?.country_group;

        const labelA = (countryGroupMap[groupA] || "").toLowerCase();
        const labelB = (countryGroupMap[groupB] || "").toLowerCase();

        return labelA.localeCompare(labelB);
      },
    },
    {
      Header: "Status",
      accessor: "Status",
      className: "borderrigth wd-7p",
      Cell: ({ row }) => (
        <span className="ms-auto invit-mbl tx-14">
          {row.original.Status !== 2 && (
            <span
              className={`w-100 badge bg-${getStatusBadgeColor(row.original.Status)}`}
            >
              <span className="font-weight-semibold">
                {getStatusText(row.original.Status)}
              </span>
            </span>
          )}
          {row.original.Status == 2 && row.original.User && row.original.Orders && (
            (() => {
              const orders = row.original.Orders;
              // Calculate total tickets
              const totalTickets = orders.reduce((sum, order) => {
                return sum + (order.TicketBooks ? order.TicketBooks.length : 0);
              }, 0);
              // Calculate total addons
              const totalAddons = orders.reduce((sum, order) => {
                return sum + (order.AddonBooks ? order.AddonBooks.length : 0);
              }, 0);

              return (
                <span style={{ fontSize: "12px" }}>
                  <strong>Tickets:</strong> {totalTickets}
                  <br />
                  <strong>Addons:</strong> {totalAddons}
                </span>
              );
            })()
          )}
          {row.original.Status === 0 && (
            <Link
              href={"javascript:void(0);"}
              className="badge  badge-info mt-1 w-100"
              onClick={() => SingleInviteEvent(row.original)}
            >
              +INVITE
            </Link>
          )}
        </span>
      ),
    },
    {
      Header: "Accommodation Status",
      accessor: "AccommodationStatus",
      className: "borderrigth wd-7p",
      Cell: ({ row }) => (
        <>
          {["Las Rosadas", "Cuixmala", "Las Alamandas"].includes(row.original.accommodation_status) ? (
            <span className="ms-auto invit-mbl tx-14">
              <Link
                title="View property Details"
                target="_blank"
                href={`/housing/${row.original.accommodation_status.trim().replace(/ /g, "+")}`}
              >
                <span
                  style={{ display: "block", color: "rgb(4, 122, 103)", fontSize: "12px", fontWeight: 600, textAlign: "center" }}
                >
                  {row.original.accommodation_status || "N/A"}
                </span>
              </Link>
            </span>
          ) : (
            // Only show badge if not booked
            row.original.accommodation_status !== "Booked" && (
              <span className="ms-auto invit-mbl tx-14">
                <span
                  className={`w-100 badge bg-${getStatusBadgeColor2(
                    row.original.accommodation_status
                  )} mb-1`}
                >
                  <span className="font-weight-semibold">
                    {row.original.accommodation_status || "N/A"}
                  </span>
                </span>
              </span>
            )
          )}
          {row.original.accommodation_status == 'Booked' && (() => {
            const order = row.original.Orders?.find(o => o.BookAccommodationInfo);
            if (!order) return null;
            const { Housing, check_in_date, check_out_date } = order.BookAccommodationInfo;
            const format = d =>
              new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const dateRange = `${format(check_in_date)} - ${new Date(check_out_date).getDate()}, ${new Date(check_in_date).getFullYear()}`;
            // ✅ Safely encode housing name
            const housingName = Housing?.Name ? encodeURIComponent(Housing.Name) : "";
            const housingNameUrl = Housing?.Name ? Housing.Name.trim().replace(/ /g, "+") : "";
            return (
              <span style={{ fontSize: "12px" }}>
                <Link
                  title="View property Details"
                  target="_blank"
                  href={`/housing/${housingNameUrl}`}
                  style={{
                    textDecoration: "none",
                    color: "rgb(4, 122, 103)",
                    fontWeight: 600

                  }}
                >
                  <strong>
                    {Housing?.Name || "N/A"}
                    {Housing?.HousingNeighborhood?.name
                      ? `, ${Housing.HousingNeighborhood.name}`
                      : ""}
                  </strong>
                </Link>
                <br />
                {dateRange}
              </span>
            );
          })()}
          {["cuixmala", "las alamandas", "las rosadas"].includes(
            row.original.accommodation_status?.toLowerCase()
          ) ? (
            row.original.is_booking_status === "Y" ? (
              <span className="ms-auto invit-mbl tx-14" style={{ cursor: "pointer" }}
              >
                <span className="w-100 badge bg-success">
                  <span className="font-weight-semibold">
                    Verified
                  </span>
                </span>
              </span>
            ) : (
              <span className="ms-auto invit-mbl tx-14" style={{ cursor: "pointer" }}
                onClick={() =>
                  handleRequestApproved(row.original.UserID, row.original.EventID)
                }
              >
                <span className="w-100 badge bg-danger mb-1 btn-Verify">
                  <span className="font-weight-semibold">
                    Verify
                  </span>
                </span>
              </span>
            )
          ) : null}
        </>
      ),
    },

    {
      Header: "Invitation Date",
      accessor: "Date",
      className: "borderrigth wd-12p",
      Cell: ({ row }) => (
        <div style={{ whiteSpace: "nowrap" }}>
          {row.original.createdAt ? (
            <Moment format="DD-MMM-YYYY" utc>
              {row.original.createdAt}
            </Moment>
          ) : (
            "--"
          )}
        </div>
      ),
      filter: "text",
      sortType: (a, b, id) => {
        const dateA = new Date(a.original.createdAt || 0);
        const dateB = new Date(b.original.createdAt || 0);
        return dateA - dateB;
      },
    },

    {
      Header: "Membership",
      accessor: "Membership",
      className: "borderrigth wd-10p",
      Cell: ({ row }) => (
        <div>
          {row.original.User &&
            row.original.User.MembershipTypes === 0 &&
            "N/A"}
          {row.original.User &&
            row.original.User.MembershipTypes === 1 &&
            "Founding"}
          {row.original.User &&
            row.original.User.MembershipTypes === 2 &&
            "Paying"}
          {row.original.User &&
            row.original.User.MembershipTypes === 3 &&
            "Free"}
          {row.original.User &&
            row.original.User.MembershipTypes === 4 &&
            "Comp"}
          {row.original.User &&
            row.original.User.MembershipTypes === 5 &&
            "Staff"}
        </div>
      ),
    },
    {
      Header: "Registered",
      accessor: "Registered",
      className: "borderrigth wd-10p",
      Cell: ({ row }) => (
        <div style={{ whiteSpace: "nowrap" }}>
          {row.original.User ? (
            <Moment format="DD-MMM-YYYY" utc>
              {row.original.User.DateCreated}
            </Moment>
          ) : (
            "--"
          )}
        </div>
      ),
      filter: "text",
      sortType: (a, b, id) => {
        const dateA = new Date(a.original.User.DateCreated || 0);
        const dateB = new Date(b.original.User.DateCreated || 0);
        return dateA - dateB;
      },
    },
  ]);

  // Define a function to show notes in a SweetAlert modal
  const showNotesAlert = (notes) => {
    Swal.fire({
      icon: "info",
      title: "Event Notes",
      text: notes,
      customClass: { popup: "add-tckt-dtlpop" },
      confirmButtonText: "OK",
    });
  };

  // selected invitation send 
  const inviteToAll = async (event) => {
    const totalMembers = selectedRows.length;

    const confirmationResult = await Swal.fire({
      title: "Send Invitation",
      text: `Are you sure you want to send invitations to all ${totalMembers} members in the search list?`,
      icon: "question",
      showCancelButton: true,
      customClass: { popup: "add-tckt-dtlpop" },
      confirmButtonText: "Yes, send invitations!",
      cancelButtonText: "No, cancel",
    });

    const userIDsArray = [
      ...new Set(
        DataTable.filter(
          (item) => item.Status !== 2 && selectedRows.includes(item.id)
        ).map((item) => item.UserID)
      ),
    ];

    if (confirmationResult.isConfirmed) {
      if (!userIDsArray || userIDsArray.length === 0) {
        setIsLoading(false);
        Swal.fire({
          title: "Error",
          customClass: { popup: "add-tckt-dtlpop" },
          text: "There is no data in the search list",
          icon: "error",
        });
        return false;
      }

      // 👇 Show "Sending..." popup immediately
      Swal.fire({
        title: "Sending...",
        text: "Please wait while we send the invitations.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: { popup: "add-tckt-dtlpop" },
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const event_id = DataTable[0].EventID;
      const CmsAddUrl = "/api/v1/invitationevents";
      setSpinner(true);

      const body = {
        UserID: userIDsArray,
        key: "Addinvitation",
        EventID: event_id,
      };

      try {
        const res = await axios.post(CmsAddUrl, body);
        setSpinner(false);

        // 👇 Replace loading popup with success message
        Swal.fire({
          title: "Done!",
          text: res.data.message,
          customClass: { popup: "add-tckt-dtlpop" },
          icon: "success",
        }).then((result) => {
          if (result.isConfirmed) {
            submitButtonRef.current.click();
            setIsLoading(false);
          }
        });
      } catch (err) {
        setSpinner(false);
        setIsLoading(false);

        Swal.fire({
          title: "Error!",
          text: err.message,
          customClass: { popup: "add-tckt-dtlpop" },
          icon: "error",
        });
      }
    }
  };


  // invited filters user based on search and all 
  const inviteFiltersUsers = async () => {
    const confirmationResult = await Swal.fire({
      title: "Send Invitation",
      text: `Are you sure you want to send invitations to all members in the search list?`,
      icon: "question",
      showCancelButton: true,
      customClass: { popup: "add-tckt-dtlpop" },
      confirmButtonText: "Yes, send invitations!",
      cancelButtonText: "No, cancel",
    });

    if (!confirmationResult.isConfirmed) return;

    // 👇 Show second popup immediately after confirmation
    Swal.fire({
      title: "Sending...",
      text: "Please wait while we send the invitations.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: { popup: "add-tckt-dtlpop" },
      didOpen: () => {
        Swal.showLoading();
      },
    });
    const event_id = DataTable[0].EventID;
    const urlParams = new URLSearchParams(window.location.search);
    const body = {
      key: "Invitations-Event",
      EventID: event_id,
    };
    urlParams.forEach((value, key) => {
      if (value !== "") {
        body[key] = value;
      }
    });

    setSpinner(true);
    const ApiUrl = "/api/v2/events/invitations";
    try {
      const res = await axios.post(ApiUrl, body);
      setSpinner(false);
      Swal.fire({
        title: "Done!",
        text: res.data.message,
        icon: "success",
        customClass: { popup: "add-tckt-dtlpop" },
      }).then((result) => {
        if (result.isConfirmed) {
          submitButtonRef.current.click();
          setIsLoading(false);
        }
      });
    } catch (err) {
      setSpinner(false);
      setIsLoading(false);
      Swal.fire({
        title: "Error!",
        text: err.message,
        icon: "error",
        customClass: { popup: "add-tckt-dtlpop" },
      });
    }
  };

  const SingleInviteEvent = async (event) => {
    // console.log("🚀 ~ SingleInviteEvent ~ event:", event);

    const confirmationResult = await Swal.fire({
      title: "Are you sure you want to invite?",
      icon: "question",
      showCancelButton: true,
      customClass: { popup: "add-tckt-dtlpop" },
      confirmButtonText: "Yes, Invite!",
      cancelButtonText: "No, Cancel",
    });

    if (!confirmationResult.isConfirmed || event.id == null) return;

    const CmsAddUrl = "/api/v1/invitationevents";
    const userID = String(event.User?.id || "");
    if (!userID) return;
    setIsLoading(true);
    const body = {
      key: "Addinvitation",
      UserID: [userID],
      EventID: event.EventID,
    };

    try {
      const res = await axios.post(CmsAddUrl, body);
      const msg = res.data.message;
      Swal.fire({
        title: "Done!",
        text: msg,
        icon: "success",
        customClass: { popup: "add-tckt-dtlpop" },
      }).then((result) => {
        if (result.isConfirmed) {
          submitButtonRef.current.click();
          setIsLoading(false);
        }
      });
      submitButtonRef.current.click();
    } catch (err) {
      const message = err.response?.data?.message || "An error occurred";

      await Swal.fire({
        title: "Error!",
        text: message,
        customClass: { popup: "add-tckt-dtlpop" },
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data: DataTable,
      manualPagination: true, // ✅ backend pagination
      pageCount: Math.ceil(totalRecords / 50), // backend se totalRecords
      initialState: { pageIndex: 0, pageSize: 50 }, // ✅ default pageSize yaha set karo
    },
    useSortBy,
    usePagination
  );


  // const tableInstance = useTable(
  //   {
  //     columns: COLUMNS,
  //     data: DataTable,
  //   },
  //   useSortBy,
  //   usePagination
  // );

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
    // fetchTotalTickets();
  }, [StaticMessage]);

  // Modal popup open
  const handleClick = (e, userID) => {
    e.preventDefault();
    const DetailURL = `/api/v1/members?id=${userID}`;
    axios
      .get(DetailURL)
      .then((response) => {
        if (response.data.data) {
          setModalData(response.data.data);
          viewDemoShow("lgShow");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const {
    getTableProps,
    headerGroups,
    getTableBodyProps,
    prepareRow,
    page,
    pageCount,
  } = tableInstance;
  const [currentPageIndex, setCurrentPageIndex] = useState( currentPage|| 0);
  const [pageSize, setPageSizeState] = useState(50);
  const totalPages = Math.ceil(totalRecords / pageSize);

const updatePageInUrl = (pageIndex) => {
  const query = { ...router.query, page: pageIndex + 1 };
  const eventId = router.query.EventID;

  router.push({
    pathname: `/admin/events/invitations/${eventId}`,
    query,
  });
};


  const gotoPage = (pageNumber) => {
    setCurrentPageIndex(pageNumber);
    updatePageInUrl(pageNumber);
  };

  const nextPage = () => {
    if (currentPageIndex + 1 < totalPages) {
      const newPage = currentPageIndex + 1;
      setCurrentPageIndex(newPage);
      updatePageInUrl(newPage);
    }
  };

  const previousPage = () => {
    if (currentPageIndex > 0) {
      const newPage = currentPageIndex - 1;
      setCurrentPageIndex(newPage);
      updatePageInUrl(newPage);
    }
  };

 useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const pageFromUrl = parseInt(urlParams.get("page"), 10);
  if (!isNaN(pageFromUrl) && pageFromUrl > 0) {
    setCurrentPageIndex(pageFromUrl - 1);
  }
}, []);
  // View Data
  // useEffect(() => {
  //   if (attendees && attendees.length > 0) {
  //     getStatusBasedData();
  //     return;
  //   }
  //   if (EventID !== undefined) {
  //     fetchData(currentPageIndex, pageSize);
  //   }
  // }, [attendees,EventID, currentPageIndex, pageSize]);

  const fetchData = async (pageIndex) => {
    setIsLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("page", pageIndex + 1);
      const params = Object.fromEntries(urlParams.entries());
      params.EventID = EventID;
      const res = await axios.get("/api/v2/events/invitations", { params });
      if (res.data?.success) {
        // SetDataTable(res.data.data);
        setTotalRecords(res.data.pagination.totalRecords);
      } else {
        SetDataTable([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error(err);
      SetDataTable([]);
    } finally {
      setIsLoading(false);
    }
  };
  const getStatusBasedData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/v2/events/invitations", {
        params: {
          EventID: EventID,
          Status: "2",
          limit: 400,
          page: currentPageIndex + 1,
        },
      });

      if (res.data?.success) {
        SetDataTable(res.data.data);
        setTotalRecords(
          res.data.pagination?.totalRecords || res.data.data.length
        );
      } else {
        SetDataTable([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error(error);
      SetDataTable([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    // Map of query keys → state setters
    const paramToSetter = {
      keyword: setKeyword,
      accommodation_status: setAccommodation_status,
      ArtistType: setArtistType,
      CareyesHomeownerFlag: setCareyesHomeownerFlag,
      attended_festival_before: setAttended_festival_before,
      Interest: setInterests,          // 🔥 handle carefully if multiselect
      HousingOption: setHousingOption, // 🔥 handle carefully if multiselect
      Status: setStatus,               // if needed
    };
    // Loop through mapping
    Object.entries(paramToSetter).forEach(([key, setter]) => {
      const value = urlParams.get(key);
      if (value !== null && value !== "") {
        // ✅ For multi-select values, split into array of objects
        if (["Interest", "HousingOption", "Status"].includes(key)) {
          const valuesArray = value.split(",").map(v => ({ value: v, label: v }));
          setter(valuesArray);
        } else {
          setter(value);
        }
      }
    });
  }, []);

  // Route Change
  const routeChange = () => {
    router.push({
      pathname: `/admin/events/invitations/${EventID}`, // or your current path
      query: {}, // clear all query params
    });
  };
  // Data Searching
  const handleFormReset = async () => {
    setSelectedRows([]);
    window.history.replaceState({}, "", window.location.pathname);
    setStatus("");
    setAccommodation_status("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setCareyesHomeownerFlag("");
    setHousingOption("");
    setInterests("");
    setAttended_festival_before("");
    setArtistType("");
    setKeyword(null)
    setBasic(false);
    // fetchData(0);
    routeChange();
  };

const SearchMember = async (event) => {
  event.preventDefault();
  const statusValues = (Status || []).map(s => s.value).join(',');
  const interestsValues = (Interests || []).map(i => i.value).join(',');
  const housingValues = (HousingOption || []).map(h => h.value).join(',');
  const rawParams = {
    keyword,
    FirstName,
    LastName,
    Email,
    EventID,
    Status: statusValues,
    Interest: interestsValues,
    HousingOption: housingValues,
    ArtistType,
    CareyesHomeownerFlag,
    attended_festival_before,
    accommodation_status,
    page: 1, // Reset to first page on new search
  };

  const params = Object.entries(rawParams).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});

  // Redirect with query params
  router.push({
    pathname: router.pathname,
    query: params,
  });
};


  // Popup functions
  let viewDemoShow = (modal) => {
    switch (modal) {
      case "Basic":
        setBasic(true);
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
      case "lgShow":
        setLgShow(false);
        break;
    }
  };
  // Housing Options
  const HousingOptions = [
    { value: "1", label: "Renter" },
    { value: "2", label: "House Guest" },
    { value: "4", label: "Home Owner" },
    { value: "3", label: "No Housing Required" },
  ];
  // Statuses options
  const StatusOptions = [
    { value: "0", label: "Interested" },
    { value: "1", label: "Invited" },
    { value: "2", label: "Completed" },
    // { value: "3", label: "Partially Paid" },
    // { value: "4", label: "Over Paid" },
    // { value: "5", label: "Preference Submitted" },
  ];
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
    // console.log("Email", Email)
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
      console.log("message", message);
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
            customClass: { popup: "add-tckt-dtlpop" },
            icon: "success",
          });
        })
        .catch((err) => {
          setIsLoading(false);
          Swal.fire({
            title: "Oops!",
            customClass: { popup: "add-tckt-dtlpop" },
            text: err.message,
            icon: "error",
          });
        });
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };







  const filename = `${"ONDALINDA_x_CAREYES"}_${getCurrentDate()}.xlsx`;
  const csvFilename = `${"ONDALINDA_x_CAREYES"}_${getCurrentDate()}.csv`;
  const pdfFilename = `${"ONDALINDA_x_CAREYES"}_${getCurrentDate()}.pdf`;



  // Export Excel
  const handleExport = async () => {
    if (!Array.isArray(DataTable)) {
      console.error("Invalid DATATABLE: Expected an array.");
      return;
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Members");

    // Define headers with auto width
    worksheet.columns = [
      { header: "S.No", key: "serialNumber", width: 10 },
      { header: "First Name", key: "FirstName", width: 20 },
      { header: "Last Name", key: "LastName", width: 20 },
      { header: "Email", key: "userEmail", width: 25 },
      { header: "Location", key: "location", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Registered", key: "registered", width: 15 },
      { header: "Invitation Date", key: "invitations", width: 15 },
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
    DataTable.forEach((item, index) => {
      worksheet.addRow({
        serialNumber: index + 1, // Add serial number
        FirstName: `${item.User.FirstName || "N/A"}`,
        LastName: `${item.User.LastName || "N/A"}`,
        userEmail: item.User.Email || "N/A",
        location: (() => {
          switch (item.User.country_group) {
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
              return "N/A";
          }
        })(),
        status: item.Status ? "Completed" : "Invitation",
        registered: item.User.DateCreated
          ? moment(item.User.DateCreated).format("DD-MMM-YYYY")
          : "N/A",
        invitations: item.updatedAt
          ? moment(item.updatedAt).format("DD-MMM-YYYY")
          : "N/A",
      });
    });

    // Generate the Excel file as a Blob and use file-saver to save it
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, filename);
    } catch (err) {
      console.error;
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      const columns = [
        "S.No",
        "First Name",
        "Last Name",
        "Email",
        "Location",
        "Status",
        "Registered",
        "Invitation Date",
      ]; // Adjust columns as needed
      const rows = []; // Populate rows with your data, similar to how you did for Excel
      // Example data population
      DataTable.forEach((item, index) => {
        rows.push([
          index + 1, // S.No
          item.User.FirstName || "----", // First Name
          item.User.LastName || "----", // Last Name
          item.User.Email || "----", // Email
          (() => {
            // Location
            switch (item.User.country_group) {
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
                return "N/A";
            }
          })(),
          item.Status ? "Completed" : "Invitation", // Status
          item.User.DateCreated
            ? moment(item.User.DateCreated).format("DD-MMM-YYYY")
            : "N/A", // Registered
          item.updatedAt ? moment(item.updatedAt).format("DD-MMM-YYYY") : "N/A", // Invitation Date
        ]);
      });

      pdf.text(235, 40, "Attendees List");
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
      pdf.save(pdfFilename);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  // Export CSV

  const handleCsv = async () => {
    const headers = [
      { label: "S.No", key: "serialNumber" },
      { label: "First Name", key: "FirstName" },
      { label: "Last Name", key: "LastName" },
      { label: "Email", key: "userEmail" },
      { label: "Location", key: "userLocation" },
      { label: "Status", key: "userStatus" },
      { label: "Registered", key: "userRegistered" },
      { label: "Invitation Date", key: "invitationDate" },
    ];

    const data = DataTable.map((item, index) => ({
      serialNumber: index + 1,
      FirstName: item.User.FirstName || "----",
      LastName: item.User.LastName || "----",
      userEmail: item.User.Email || "----",
      userLocation: (() => {
        switch (item.User.country_group) {
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
            return "N/A";
        }
      })(),
      userStatus: item.Status ? "Completed" : "Invitation",
      userRegistered: item.User.DateCreated
        ? moment(item.User.DateCreated).format("DD-MMM-YYYY")
        : "N/A",
      invitationDate: item.updatedAt
        ? moment(item.updatedAt).format("DD-MMM-YYYY")
        : "N/A",
    }));

    // 1. Generate CSV content
    const csvContent = generateCsv(headers, data);

    // 2. Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const currentDate = moment().format("DD-MM-YYYY");
    link.download = `ONDALINDA_x_CAREYES_${currentDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to generate CSV string
  const generateCsv = (headers, data) => {
    const headerRow = headers.map((h) => h.label).join(","); // Join headers with comma
    const dataRows = data.map(
      (row) => headers.map((h) => `"${row[h.key] || ""}"`).join(",") // Join each row with commas and handle missing values
    );
    return [headerRow, ...dataRows].join("\n"); // Combine header and data rows
  };


  // status update for requested cuixmala and las alamandas
  const handleRequestApproved = async (userId, eventId) => {
    try {
      const confirmationResult = await Swal.fire({
        title: "Are you sure you want to approve this housing request?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Approve!",
        cancelButtonText: "No, Cancel",
      });
      if (!confirmationResult.isConfirmed) return;
      // Show loader
      Swal.fire({
        title: "Approving housing request...",
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: { popup: "add-tckt-dtlpop" },
        didOpen: () => {
          Swal.showLoading();
        },
      });
      // Prepare form data
      const formData = new FormData();
      formData.append("eventId", eventId);
      formData.append("userId", userId);
      formData.append("key", "approved_housing_request");
      // Send approval request
      const response = await axios.post("/api/v1/housings", formData);
      submitButtonRef.current?.click();
      // Show success alert
      Swal.fire({
        title: "Success!",
        text: response.data.message || "Housing request approved.",
        icon: "success",
        customClass: { popup: "add-tckt-dtlpop" },
      });
    } catch (err) {
      setIsLoading(false);
      Swal.fire({
        title: "Error",
        text: err.message || "Something went wrong while processing your request.",
        icon: "error",
        customClass: { popup: "add-tckt-dtlpop" },
      });
    }
  };










  return (
    <>
      <Seo title={"Invitations Manager"} />
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          {/* <span className="main-content-title mg-b-0 mg-b-lg-1">Manage Invitations</span> */}

          {attendees ? (
            <span className="main-content-title mg-b-0 mg-b-lg-1">
              {" "}
              Attendees List
            </span>
          ) : (
            <span className="main-content-title mg-b-0 mg-b-lg-1">
              Manage Invitations
            </span>
          )}
        </div>

        <div className="justify-content-between d-flex mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15">Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Invitations
            </Breadcrumb.Item>
          </Breadcrumb>
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

      <div className="left-content mt-2">
        <Row className="row-sm mt-4">
          <Col xl={2}>
            <Card className="member-fltr-hid">
              <Card.Header className="">
                <div className="d-flex justify-content-between">
                  <h4 className="card-title mg-b-0">Filters</h4>
                </div>
              </Card.Header>
              <Card.Body className="p-2">

                <CForm
                  className="row g-3 needs-validation"
                  noValidate
                  id="searchFuntion"
                  onReset={handleFormReset}
                  onSubmit={SearchMember}
                >

                  {/* 🔎 Universal Search Bar */}
                  <CCol md={12}>
                    <CFormLabel htmlFor="keywordSearch">Search</CFormLabel>
                    <CFormInput
                      type="text"
                      id="keywordSearch"
                      placeholder="Search by name, email or mobile"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                    <CFormFeedback invalid>
                      Please enter a valid keyword.
                    </CFormFeedback>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">Status</CFormLabel>
                    <MultiSelect
                      options={StatusOptions}
                      value={Status}
                      onChange={setStatus}
                      labelledBy="Select"
                    />
                    <CFormFeedback invalid>
                      Please provide a valid Name.
                    </CFormFeedback>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Accommodation Status
                    </CFormLabel>
                    <Form.Select
                      aria-label="Default select example"
                      className="admn-slct"
                      value={accommodation_status}
                      onChange={(e) => {
                        setAccommodation_status(e.target.value);
                      }}
                    >
                      <option value="">Select</option>
                      <option value="preference submitted">Preference Submitted</option>
                      <option value="property offered">Property Offered</option>
                      <option value="booked">Booked</option>
                      <option value="cuixmala">Cuixmala</option>
                      <option value="las alamandas">Las Alamandas</option>
                      <option value="las rosadas">Las Rosadas</option>
                    </Form.Select>
                    <CFormFeedback invalid>
                      Please provide a valid Country.
                    </CFormFeedback>
                  </CCol>
                  {/* <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">
                      First Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationCustom03"
                      placeholder="First Name"
                      required
                      value={FirstName}
                      onChange={(e) => {
                        // console.log(e.target.value);
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
                      id="validationCustom03"
                      required
                      placeholder="Last Name"
                      value={LastName}
                      onChange={(e) => {
                        // console.log(e.target.value);
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
                        setEmail(trimmedValue);
                      }}
                    />
                    <CFormFeedback invalid>
                      Please provide a valid Email.
                    </CFormFeedback>
                  </CCol> */}

                  {/* <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Membership Level
                    </CFormLabel>
                    <Form.Select
                      aria-label="Default select example"
                      className="admn-slct"
                      value={MembershipLevel}
                      onChange={(e) => {
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
                  </CCol> */}

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Careyes Homeowner
                    </CFormLabel>
                    <Form.Select
                      aria-label="Default select example"
                      className="admn-slct"
                      value={CareyesHomeownerFlag}
                      onChange={(e) => {
                        // console.log(e.target.value);
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
                      aria-label="Default select example"
                      className="admn-slct"
                      value={ArtistType}
                      onChange={(e) => {
                        // console.log(e.target.value);
                        setArtistType(e.target.value);
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
                      aria-label="Default select example"
                      className="admn-slct"
                      value={attended_festival_before}
                      onChange={(e) => {
                        setAttended_festival_before(e.target.value);
                      }}
                    >
                      <option value="">Select</option>
                      <option value="I HAVE NEVER ATTENDED AN ONDALINDA EVENT">
                        Not attended any event
                      </option>
                      <option value="ANY">Attended other past events</option>
                      <option value="ONDALINDA x MONTENEGRO 2024">
                        Attended Montenegro
                      </option>
                    </Form.Select>
                    <CFormFeedback invalid>Please choose any.</CFormFeedback>
                  </CCol>

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
                      Housing Option
                    </CFormLabel>
                    <MultiSelect
                      options={HousingOptions}
                      value={HousingOption}
                      onChange={setHousingOption}
                      labelledBy="Select"
                    />
                    <CFormFeedback invalid>
                      Please provide a valid Name.
                    </CFormFeedback>
                  </CCol>
                  {/* <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">
                      Housing Area{" "}
                    </CFormLabel>

                    <MultiSelect
                      options={HousingAreaoptions}
                      value={selected}
                      onChange={setSelected}
                      labelledBy="Select"
                    />
                    <CFormFeedback invalid>
                      Please provide a valid Name.
                    </CFormFeedback>
                  </CCol> */}

                  <CCol md={12} className="d-flex align-items-end justify-content-between">
                    <Button
                      variant="primary"
                      className="me-2 w-50"
                      type="submit"
                      ref={submitButtonRef}
                    >
                      Submit
                    </Button>



                    <Button variant="secondary" className="w-50" type="reset">
                      Reset
                    </Button>
                  </CCol>
                </CForm>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={10}>
            <div className="Mmbr-card">
              <Card>
                {staticAdded != null && openAlert === true && (
                  <Collapse in={openAlert}>
                    <Alert aria-hidden={true} severity="success">
                      {staticAdded}
                    </Alert>
                  </Collapse>
                )}
                <Card.Header className="">
                  <div className="d-flex justify-content-end align-items-center">
                    <span className="btn btn-sm invisible">
                      for-height-in-mobile
                    </span>
                    {attendees ? (
                      <span
                        className="btn btn-sm "
                        style={{
                          background: "#845adf",
                          color: "white",
                          pointerEvents: "none", // Disable click events
                        }}
                      >
                        Total Attendees: {totalRecords}
                      </span>
                    ) : (
                      <></>
                    )}

                    {selectedRows.length > 0 && checkedButton && (
                      <Button
                        variant="success" // Green for positive action
                        className="btn-sm me-2 d-flex align-items-center gap-1"
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
                          <>
                            <i className="bi bi-person-check-fill"></i> {/* Bootstrap Icon */}
                            Invite Selected
                          </>
                        )}
                      </Button>
                    )}

                    {(!attendees || attendees.length === 0) && (
                      <Button
                        variant="primary" // Blue for general actions
                        className="btn-sm d-flex align-items-center gap-1"
                        type="submit"
                        disabled={spinner}
                        onClick={inviteFiltersUsers}
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
                          <>
                            <i className="bi bi-people-fill"></i> {/* Bootstrap Icon */}
                            Invite All
                          </>
                        )}
                      </Button>
                    )}



                    {attendees ? (
                      <ButtonGroup className="ms-2">
                        <Dropdown>
                          <Dropdown.Toggle
                            variant=""
                            aria-expanded="false"
                            aria-haspopup="true"
                            className="btn ripple btn-primary btn-sm"
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

                            <Dropdown.Item
                              className="dropdown-item"
                              href="#!"
                              onClick={handleCsv}
                            >
                              Export as CSV
                            </Dropdown.Item>

                            {/* <CSVLink data={data} headers={headers} filename={csvFilename} className="dropdown-item">Export as CSV</CSVLink> */}

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
                    ) : (
                      <></>
                    )}
                  </div>
                </Card.Header>

                <Card.Body className="p-2">
                  <ToastContainer />

                  <div className="evnt-invt-tbl-new-Mobile">
                    <table
                      {...getTableProps()}
                      className="table table-hover responsive-table mb-0"
                    >
                      <thead>
                        <tr>
                          <th className="wd-3p borderrigth">
                            <input
                              type="checkbox"
                              onChange={toggleAllRowsSelected}
                              // checked={
                              //     selectedRows.length === page.length &&
                              //     page.length > 0
                              // }
                              checked={page
                                .filter((row) => row.original.Status !== 2)
                                .every((row) =>
                                  selectedRows.includes(row.original.id)
                                )}
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
                            <td colSpan={9}>
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
                          {DataTable.length === 0 ? (
                            <tr>
                              <td colSpan={9} style={{ textAlign: "center" }}>
                                No results found
                              </td>
                            </tr>
                          ) : (
                            page.map((row) => {
                              prepareRow(row);
                              return (
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
                                  <td className="borderrigth">
                                    <input
                                      type="checkbox"
                                      checked={isSelected(row.original.id)}
                                      onChange={() =>
                                        toggleRowSelected(row.original.id)
                                      }
                                      disabled={row.original.Status === 2} // Disable checkbox if status is 2
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
                            {currentPageIndex + 1} of {Math.ceil(totalRecords / pageSize)}
                          </strong>
                        </span>
                        <span>
                          Total Records:{" "}
                          <strong>{totalRecords}</strong>
                        </span>
                      </div>
                    </Col>
                    <Col xs={12} sm={6} className="d-flex pgintn justify-content-end">
                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => gotoPage(0)}
                        disabled={currentPageIndex === 0}
                      >
                        {"First"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => previousPage()}
                        disabled={currentPageIndex === 0}
                      >
                        {"<"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => nextPage()}
                        disabled={currentPageIndex + 1 >= totalPages}
                      >
                        {">"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton"
                        onClick={() => gotoPage(pageCount - 1)}
                        disabled={currentPageIndex + 1 >= totalPages}
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
                <i class="bi bi-x"></i>
              </Button>
            </Modal.Header>

            <Modal.Body>
              <div className="admn-membr-dtlMdl">
                <div className="container-fluid px-sm-3 px-0">
                  <div className="row">
                    <div className="col-lg-4 ">
                      <div className="member-profl-mdl m-lg-0 m-auto">

                        {modalData && modalData.ImageURL && (
                          <Image
                            src={
                              modalData?.ImageURL
                                ? `${process.env.NEXT_PUBLIC_S3_URL}/profiles/${modalData.ImageURL}`
                                : "https://www.thecakepalace.com.au/wp-content/uploads/2022/10/dummy-user.png"
                            }
                            alt="Profile"
                            width={100}
                            height={100}
                            className="bd-placeholder-img"
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
                                <Moment format="DD-MMM-YYYY" utc>
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
                          {/* {modalData && modalData.createdAt ? modalData.createdAt : '--'} */}
                          {modalData && modalData.createdAt ? (
                            <Moment format="YYYY-MM-DD h:m:s a" utc>
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
            <i class="bi bi-x"></i>
          </Button>
        </Modal.Header>
        <Modal.Body>
          <CForm
            className="row g-3 needs-validation"
            noValidate
            id="searchFuntion"
            onReset={handleFormReset}
            onSubmit={SearchMember}
          >
            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">Status</CFormLabel>
              <MultiSelect
                options={StatusOptions}
                value={Status}
                onChange={setStatus}
                labelledBy="Select"
              />
              <CFormFeedback invalid>
                Please provide a valid Name.
              </CFormFeedback>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">
                Accommodation Status
              </CFormLabel>
              <Form.Select
                aria-label="Default select example"
                className="admn-slct"
                value={accommodation_status}
                onChange={(e) => {
                  setAccommodation_status(e.target.value);
                }}
              >
                <option value="">Select</option>
                <option value="preference submitted">Preference Submitted</option>
                <option value="property offered">Property Offered</option>
                <option value="booked">Booked</option>
                <option value="cuixmala">Cuixmala</option>
                <option value="las alamandas">Las Alamandas</option>
                <option value="las rosadas">Las Rosadas</option>
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
                aria-label="Default select example"
                className="admn-slct"
                value={CareyesHomeownerFlag}
                onChange={(e) => {
                  // console.log(e.target.value);
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
                aria-label="Default select example"
                className="admn-slct"
                value={ArtistType}
                onChange={(e) => {
                  // console.log(e.target.value);
                  setArtistType(e.target.value);
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
                aria-label="Default select example"
                className="admn-slct"
                value={attended_festival_before}
                onChange={(e) => {
                  setAttended_festival_before(e.target.value);
                }}
              >
                <option value="">Select</option>
                <option value="I HAVE NEVER ATTENDED AN ONDALINDA EVENT">
                  Not attended any event
                </option>
                <option value="ANY">Attended other past events</option>
                <option value="ONDALINDA x MONTENEGRO 2024">
                  Attended Montenegro
                </option>
              </Form.Select>
              <CFormFeedback invalid>Please choose any.</CFormFeedback>
            </CCol>

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
            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">
                Housing Option
              </CFormLabel>
              <MultiSelect
                options={HousingOptions}
                value={HousingOption}
                onChange={setHousingOption}
                labelledBy="Select"
              />
              <CFormFeedback invalid>
                Please provide a valid Name.
              </CFormFeedback>
            </CCol>
            <CCol
              md={12}
              className="d-flex justify-content-between align-items-end "
            >
              <Button variant="primary" type="submit" ref={submitButtonRef}>
                Submit
              </Button>

              <Button variant="secondary" type="reset">
                Reset
              </Button>
            </CCol>
          </CForm>
        </Modal.Body>
      </Modal>
    </>
  );
};

InvitationsTable.layout = "Contentlayout";
export default InvitationsTable;


// ==========================
// 📦 Server Side Rendering
// ==========================
export async function getServerSideProps(context) {
  const { query } = context;
  const page = parseInt(query.page) || 1;
  const rawParams = {
    keyword: query.keyword || '',
    FirstName: query.FirstName || '',
    LastName: query.LastName || '',
    Email: query.Email || '',
    EventID: query.EventID || '',
    Status: query.Status || query.attendees || '',
    Interest: query.Interest || '',
    HousingOption: query.HousingOption || '',
    ArtistType: query.ArtistType || '',
    CareyesHomeownerFlag: query.CareyesHomeownerFlag || '',
    attended_festival_before: query.attended_festival_before || '',
    accommodation_status: query.accommodation_status || '',
    // attendees: query.attendees || '',
    page,
  };

  const params = Object.entries(rawParams).reduce((acc, [key, value]) => {
    if (value !== '') acc.append(key, value);
    return acc;
  }, new URLSearchParams());

  const baseUrl = process.env.SITE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/v2/events/invitations?${params.toString()}`);
    const data = await res.json();
    return {
      props: {
        initialInvitations: data?.data || [],
        totalRecordsCount: data?.pagination?.totalRecords || 0,
        currentPage: page,
        queryParams: query, // Use this to pre-fill search fields
      },
    };
  } catch (error) {
    console.error("SSR Error (invitations):", error);
    return {
      props: {
        initialInvitations: [],
        totalRecords: 0,
        currentPage: 1,
        queryParams: {},
      },
    };
  }
}

