import { React, useEffect, useState, useRef } from "react";
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
} from "react-bootstrap";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import axios from "axios";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import { useRouter } from "next/router";
import Moment from "react-moment";
import ClipLoader from "react-spinners/ClipLoader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import ExcelJS from "exceljs";
import tinycolor from "tinycolor2";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import Image from "next/image";


const ScanTickets = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [DATATABLE, setDATATABLE] = useState([]);
  // console.log("DATATABLE", DATATABLE)
  const [color, setColor] = useState([]);
  const [userId, setUserId] = useState([]);
  const [memberIds, setMemberIds] = useState([]);
  const [filterUserIds, setFilterUserIds] = useState([]);
  // console.log("filterUserIds", filterUserIds)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bandColorAllMember, setBandColorAllMember] = useState([]);
  const [fromDateModified, setFromDateModified] = useState(false);
  const [ticketSaleInfo, setTicketSaleInfo] = useState({});
  const [lgShow, setLgShow] = useState(false);
  const [basic, setBasic] = useState(false);
  const [qrImg, setQrImg] = useState("");
  const router = useRouter();
  const [eventId, setEventId] = useState(null);
  const [searchFormData, setSearchFormData] = useState({
    name: null,
    lname: null,
    email: null,
    orderId: null,
    mobile: null,
    eventName: null,
    startDate: null,
    endDate: null,
    scanned: "all",
    key: "ticketExport",
    event_id: eventId,
    ticket_type: null,
  });

  const { ticket_type } = router.query;
  useEffect(() => {
    if (ticket_type) {
      setSearchFormData((prevFormData) => ({
        ...prevFormData,
        ticket_type: ticket_type,
      }));
    }
  }, [ticket_type]);

  // Update eventId once router is ready and event_id is available
  useEffect(() => {
    if (router.isReady) {
      const { event_id } = router.query;
      setEventId(event_id);
    }
  }, [router.isReady, router.query]);

  // Update searchFormData when eventId is updated
  useEffect(() => {
    if (eventId) {
      setSearchFormData((prevFormData) => ({
        ...prevFormData,
        event_id: eventId,
      }));
    }
  }, [eventId]);

  let loginUserId;
  if (typeof window !== "undefined") {
    loginUserId = localStorage.getItem("UserID_");
  }


  const submitBtnRef = useRef(null);

  const handleFromDateChange = (date) => {
    const originalDate = new Date(date);
    const day = String(originalDate.getDate()).padStart(2, "0");
    const month = String(originalDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = originalDate.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    setSearchFormData((prevFormData) => ({
      ...prevFormData,
      startDate: formattedDate,
    }));
    setStartDate(date);
    setEndDate(null);
    setFromDateModified(true);
  };

  const handleToDateChange = (date) => {
    const originalDate = new Date(date);
    const day = String(originalDate.getDate()).padStart(2, "0");
    const month = String(originalDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = originalDate.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    setSearchFormData((prevFormData) => ({
      ...prevFormData,
      endDate: formattedDate,
    }));
    setEndDate(date);
  };

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

  // const handleToDateChange = (date) => {
  //     const formattedDate = date.toISOString().split('T')[0];
  //     setSearchFormData(prevFormData => ({
  //         ...prevFormData,
  //         endDate: formattedDate
  //     }));
  //     setEndDate(date);
  // };

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "borderrigth wd-5p",
    },
    {
      Header: "User Info",
      className: "borderrigth wd-25p",
      Cell: ({ row }) => (
        <div>
          <strong>Name:</strong>{" "}
          {row.original.memberFirstName ? row.original.memberFirstName : "--"}{" "}
          {row.original.memberLastName ? row.original.memberLastName : "--"}
          <br />
          <strong>Email:</strong> {row.original.memberEmail}
          <br />
          <strong>Mobile:</strong>
          {row.original.memberMobile ? row.original.memberMobile : "N/A"}
          <br />
        </div>
      ),
    },
    {
      Header: "Order Info",
      accessor: "OrderInfo",
      className: "borderrigth wd-20p",
      Cell: ({ row }) => (
        <div>
          <strong>Order Id:</strong> # {row.original.orderId} <br />
          <strong>Order Date:</strong>{" "}
          <Moment format="DD-MMM-YYYY" utc>{row.original.orderDate}</Moment> <br />
          <strong>Order Amount:</strong>{" "}
          {row.original.totalOrderAmount.toLocaleString()}
        </div>
      ),
    },

    {
      Header: "Ticket Detail",
      className: "borderrigth wd-20p",
      Cell: ({ row }) => {
        // Title case function for formatting names
        const toTitleCase = (str) =>
          str
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Format ticket name and type
        const ticketName = row.original.ticketName
          ? toTitleCase(row.original.ticketName)
          : "--";

        const ticketType = row.original.ticketType
          ? row.original.ticketType.charAt(0).toUpperCase() + row.original.ticketType.slice(1)
          : "--";

        // Define color style
        const colorStyle = {
          width: "20px",
          height: "20px",
          display: "inline-block",
          marginRight: "5px",
          borderRadius: "50%",
        };

        // Set display color based on ticket type
        let displayColor = "";
        if (row.original.ticketType === "addon") {
          displayColor = "#000000";
          colorStyle.backgroundColor = "#000000";
          // displayColor = row.original.claspColor || "No color";
          // colorStyle.backgroundColor = row.original.claspColor || "transparent";
        } else if (row.original.ticketType === "ticket") {
          displayColor = "#FF6F61";
          colorStyle.backgroundColor = "#FF6F61";
        }

        return (
          <div>
            {/* Ticket Name and Type */}
            {ticketName} ({ticketType})
            <br />

            {/* Color Indicator */}
            <div className="d-flex align-items-center tickets-color">
              <div style={colorStyle}></div>
              {displayColor}
            </div>
          </div>
        );
      },
    },

    {
      Header: "QR Code",
      accessor: "TicketQR",
      className: "borderrigth wd-15p",
      Cell: ({ row }) => (
        // <div>
        //   {row.original.ticketQR ? (
        //     <img src={row.original.ticketQR} alt="" className="" />
        //   ) : (
        //     <p>N/A</p>
        //   )}
        // </div>

        <div
          onClick={() => {
            handleClick(row.original);
          }}
        >
          {row.original.ticketQR ? (
            <div className="position-relative text-center ticketQR">
              <Link
                className="text-light stretched-link rounded-pill text-center d-block bg-success"
                style={{
                  width: "70%",
                  zIndex: "2",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                href="#"
              >
                Click Here
              </Link>
              <img
                style={{ filter: "blur(3px)" }}
                src={`${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/` + row.original.ticketQR}
                alt="QR Code"
                className=" pe-auto img-fluid"
              />
            </div>
          ) : (
            "N/A"
          )}
        </div>
      ),
    },
    // {
    //     Header: "Addon",
    //     accessor: "Addon",
    //     className: "wd-25p borderrigth",
    //     Cell: ({ row }) => (
    //         <div>
    //             {row.original.addonQr ? (
    //                 <img
    //                     src={row.original.addonQr}
    //                     alt=""
    //                     className=""
    //                 />
    //             ) : (
    //                 <p>N/A</p>
    //             )}

    //         </div>
    //     )
    // },
    // {
    //   Header: "Band Color",
    //   accessor: "BandColor",
    //   className: "borderrigth wd-10p",
    //   Cell: ({ row }) => {
    //     const colorStyle = {
    //       width: "20px", // Adjust as needed
    //       height: "20px", // Adjust as needed
    //       display: "inline-block",
    //       marginRight: "5px", // Optional spacing between color and text
    //       borderRadius: "50%",
    //     };

    //     let displayColor = "";
    //     if (row.original.ticketType === "addon") {
    //       displayColor = row.original.claspColor;
    //       colorStyle.backgroundColor = row.original.claspColor;
    //     } else if (row.original.ticketType === "ticket") {
    //       // displayColor = row.original.bandColor;
    //       displayColor = `#FF6F61`;
    //       // colorStyle.backgroundColor = row.original.bandColor;
    //       colorStyle.backgroundColor = `#FF6F61`;
    //     }
    //     return (
    //       <div className="d-flex align-items-center">
    //         <div style={colorStyle}></div>
    //         {displayColor ? displayColor : "No color"}
    //         <br />
    //         {/* {row.original.ticketType === 'addon' && (
    //                         <div>
    //                             <strong>MembershipType:</strong> {row.original.membershipType === 1 ? 'Paying' :
    //                                 row.original.membershipType === 2 ? 'Non Paying' :
    //                                     row.original.membershipType === 3 ? 'All Access' :
    //                                         row.original.membershipType === 4 ? 'Staff' :
    //                                             'N/A'}
    //                         </div>
    //                     )} */}
    //       </div>
    //     );
    //   },
    // },
    {
      Header: "Status",
      accessor: "usedBy",
      className: "borderrigth wd-15p",
      Cell: ({ row }) => (
        <div className="invit-mbl">
          <span
            className={`badge w-100 me-md-0 me-2 bg-${getStatusBadgeColor(
              row.original.usedBy ? 2 : 0
            )}`}
          >
            <span className={`font-weight-semibold`}>
              {row.original.usedBy ? "Scanned" : "Not Yet Scanned"}
            </span>
          </span>

          {row.original.usedDate && (
            <div className="mb-1">
              <strong>Scanned Date: </strong>
              <Moment format="DD-MMM-YYYY" utc>{row.original.usedDate}</Moment>
            </div>
          )}

          {row.original.scannedBy && (
            <div className="mb-1">
              <strong>Scanned By: </strong>
              {row.original.scannedBy}
            </div>
          )}




          {/* {row.original.ticketType === "ticket" ? (
            !row.original.isCanceled ? (
              <strong style={{ width: "100px" }}>
                <Link
                  href={"javascript:void(0);"}
                  style={{ backgroundColor: "#007bff" }}
                  className="badge text-light mt-md-2 mt-0 d-block w-100"
                  onClick={() => handleCancelTicket(row.original)}
                >
                  Cancel Ticket
                </Link>
              </strong>
            ) : (
              <strong style={{ width: "100px" }}>
                <Link
                  href={"javascript:void(0);"}
                  style={{ backgroundColor: "#FF0000" }}
                  className="badge text-light d-block mt-md-2 mt-0 w-100"
                  disabled
                >
                  Cancelled
                </Link>
              </strong>
            )
          ) : row.original.ticketType === "addon" ? (
            !row.original.isCanceled ? (
              <strong style={{ width: "100px" }}>
                <Link
                  href={"javascript:void(0);"}
                  style={{ backgroundColor: "#007bff" }}
                  className="badge text-light d-block w-100 mt-md-2 mt-0"
                  onClick={() => handleCancelTicket(row.original)}
                >
                  Cancel Addon
                </Link>
              </strong>
            ) : (
              <strong style={{ width: "100px" }}>
                <Link
                  href={"javascript:void(0);"}
                  style={{ backgroundColor: "#FF0000" }}
                  className="badge text-light mt-md-2 mt-0 d-block w-100"
                  disabled
                >
                  Cancelled
                </Link>
              </strong>
            )
          ) : null} */}




        </div>
      ),
    },

    // {
    //     Header: "Band Color",
    //     accessor: "BandColor",
    //     className: "wd-20p borderrigth",
    //     Cell: ({ row }) => {
    //         const colorStyle = {
    //             backgroundColor: row.original.bandColor,
    //             width: '20px',  // Adjust as needed
    //             height: '20px', // Adjust as needed
    //             display: 'inline-block',
    //             marginRight: '5px' // Optional spacing between color and text
    //         };

    //         return (
    //             <div>
    //                 <div style={colorStyle}></div>
    //                 {row.original.bandColor ? row.original.bandColor : 'No band'}
    //             </div>
    //         );
    //     },
    // },

    // {
    //     Header: "Clasp Color",
    //     accessor: "ClaspColor",
    //     className: "wd-20p borderrigth",
    //     Cell: ({ row }) => {
    //         const colorStyle = {
    //             backgroundColor: row.original.claspColor,
    //             width: '20px',  // Adjust as needed
    //             height: '20px', // Adjust as needed
    //             display: 'inline-block',
    //             marginRight: '5px' // Optional spacing between color and text
    //         };

    //         return (
    //             <div>
    //                 <div style={colorStyle}></div>
    //                 {row.original.claspColor ? row.original.claspColor : 'No Clasp'}
    //             </div>
    //         );
    //     },
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

  // New api fetch All buy tickets users for our database
  const handleViewOrders = async () => {
    const API_URL = `/api/v1/orders`;
    try {
      const body = {
        key: "ticketExport",
        event_id: eventId,
        ticket_type: ticket_type,
      };
      const response = await axios.post(API_URL, body);
      if (response.data.success) {
        setTicketSaleInfo(response.data.ticketSaleInfo);
        setIsLoading(false);
        if (response.data.data) {
          setDATATABLE(response.data.data);
          setMemberIds(response.data.membersIds);
          setIsLoading(false);
        }
        setIsLoading(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("There was a problem with your Axios request:", error);
    }
  };

  useEffect(() => {
    if (eventId) {
      handleViewOrders();
      fetchedColors();
      setPageSize(50);
    }
    // fetchedUsersById();
  }, [eventId]);

  // view wristband color
  const fetchedColors = async () => {
    // const SEARCH_API = `/api/v1/wristband?event_id=${109}`;
    const SEARCH_API = `/api/v1/wristband?event_id=${eventId}`;
    setIsLoading(true);
    try {
      const response = await axios.get(SEARCH_API);
      if (response.data.data) {
        setColor(response.data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // find by ids for users
  const fetchedUsersById = async () => {
    const SEARCH_API = `/api/v1/front/users?key=viewUsers`;
    setIsLoading(true);
    try {
      const response = await axios.get(SEARCH_API);
      if (response.data.data) {
        setUserId(response.data.data);
      } else {
        console.log("error");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    // Filter userId based on memberIds
    const filteredUserIds = userId.filter((user) =>
      memberIds.includes(user.id)
    );
    const updatedUserIds = filteredUserIds.map((user) => ({
      ...user,
      MembershipTypes: user.MembershipTypes === null ? 1 : user.MembershipTypes,
    }));
    setFilterUserIds(updatedUserIds);
  }, [userId, memberIds]);

  useEffect(() => {
    // console.log("filterUserIds", filterUserIds)
    const newArr = filterUserIds.map((item) => {
      const membership = color.membership_type_color.find(
        (m) => m.type == item.MembershipTypes
      );
      if (membership) {
        return { ...item, bandColor: membership.color };
      } else {
        return {
          ...item,
          bandColor: "N/A",
        };
      }
    });
    console.log(newArr)
    setBandColorAllMember(newArr);

    const newTableData = DATATABLE.map((member) => {
      const obj = member.memberId;
      const clasp_colors = newArr.find((o) => o.id == member.memberId);
      let claspColor = "N/A";
      if (member.ticketType == "addon") {
        if (color.clasp_colors && Array.isArray(color.clasp_colors)) {
          const matchedClaspColor = color.clasp_colors.find(
            (colorItem) => colorItem.color
          );
          if (matchedClaspColor) {
            claspColor = matchedClaspColor.color; // Set to the first available color
          }
        }
      }
      if (obj) {
        return {
          ...member,
          bandColor: "#FF6F61",
          claspColor,
          membershipType: obj ? obj.MembershipTypes : "N/A",
          PhoneNumber: obj ? obj.PhoneNumber : "N/A",
        };
      } else {
        return {
          ...member,
          bandColor: "N/A",
          claspColor,
          membershipType: obj ? obj.MembershipTypes : "N/A",
          PhoneNumber: obj ? obj.PhoneNumber : "N/A",
        };
      }
      return member;
    });
    // console.log('newTableData', newTableData);
    setDATATABLE(newTableData);
  }, [filterUserIds]);

  const handleFormReset = async () => {
    // setSearchFormData({});
    handleViewOrders();
    setSearchFormData("");
    setStartDate(null);
    setEndDate(null);
    // await callSearchApi({});
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    // return
    await callSearchApi(searchFormData);
  };

  const callSearchApi = async (formData) => {
    const SEARCH_API = `/api/v1/orders`;
    setIsLoading(true);
    try {
      const response = await axios.post(SEARCH_API, formData);
      if (response.data.success === true) {
        // setDATATABLE(response.data.data);

        // Use filterUserIds to map bandColor
        const newArr = filterUserIds.map((item) => {
          const membership = color.membership_type_color.find(
            (m) => m.type == item.MembershipTypes
          );
          if (membership) {
            return { ...item, bandColor: membership.color };
          } else {
            return {
              ...item,
              bandColor: "N/A",
            };
          }
        });
        setBandColorAllMember(newArr);

        // Process response data to include bandColor and claspColor
        const newTableData = response.data.data.map((member) => {
          const obj = member.memberId;
          // console.log(obj, "tttt");
          let claspColor = "N/A";
          if (member.ticketType == "addon") {
            if (color.clasp_colors && Array.isArray(color.clasp_colors)) {
              const matchedClaspColor = color.clasp_colors.find(
                (colorItem) => colorItem.color
              );
              if (matchedClaspColor) {
                claspColor = matchedClaspColor.color; // Set to the first available color
              }
            }
          }

          if (obj) {
            return {
              ...member,
              bandColor: "#FF6F61",
              claspColor,
              membershipType: obj.MembershipTypes,
            };
          } else {
            return {
              ...member,
              bandColor: "N/A",
              claspColor,
              membershipType: "N/A",
            };
          }
        });

        setDATATABLE(newTableData);
      } else {
        console.log("Error:  ");
        setDATATABLE([]);
        handleViewOrders();
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
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
  // Generate Excel
  const handleExport = async () => {
    if (!Array.isArray(DATATABLE)) {
      console.error("Invalid orderData: Expected an array.");
      return;
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    // Define headers with auto width
    worksheet.columns = [
      { header: "S.No", key: "serialNumber", width: 10 },
      { header: "Order ID", key: "orderId", width: 15 },
      { header: "Order Date", key: "orderDate", width: 15 },
      { header: "Type", key: "ticketName", width: 10 },
      { header: "Rename First Name", key: "renameFirstName", width: 20 },
      { header: "Rename Last Name", key: "renameLastName", width: 20 },
      { header: "First Name", key: "FirstName", width: 20 },
      { header: "Last Name", key: "LastName", width: 20 },
      { header: "Transfer First Name", key: "TransferFirstName", width: 20 },
      { header: "Transfer Last Name", key: "TransferLastName", width: 20 },
      { header: "Email", key: "userEmail", width: 25 },
      { header: "Mobile", key: "userMobile", width: 15 },
      { header: "Band Color", key: "bandColor", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Scanned Date", key: "scannedDate", width: 20 },
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
    worksheet.autoFilter = "A1:O1"; // Enable filters
    worksheet.views = [{ state: "frozen", ySplit: 1 }]; // Freeze the first row

    // Add data rows
    DATATABLE.forEach((item, index) => {
      let bandColor = null; // Initialize bandColor

      // Check ticketType to set bandColor
      if (item.ticketType === "ticket") {
        bandColor = item.bandColor; // Set bandColor from item.bandColor
      } else if (item.ticketType === "addon") {
        bandColor = item.claspColor; // Set bandColor from item.claspColor for addons
      }

      const displayType =
        item.ticketType === "ticket"
          ? "ticket"
          : item.ticketType === "addon"
            ? "addon"
            : "N/A";

      worksheet.addRow({
        serialNumber: index + 1, // Add serial number
        orderId: item.orderId || "N/A",
        orderDate: item.orderDate
          ? moment(item.orderDate).format("DD-MMM-YYYY")
          : "N/A",
        renameFirstName: `${item.ticketRenameFname || "N/A"}`,
        renameLastName: `${item.ticketRenameLname || "N/A"}`,
        FirstName: `${item.memberFirstName || "N/A"}`,
        LastName: `${item.memberLastName || "N/A"}`,

        TransferFirstName: `${item.transferToFname || "N/A"}`,
        TransferLastName: `${item.transferToLname || "N/A"}`,

        userEmail: item.memberEmail || "N/A",
        userMobile: item.PhoneNumber || "N/A",
        ticketName: displayType.charAt(0).toUpperCase() + displayType.slice(1),
        bandColor: bandColor !== null ? tinycolor(bandColor).toHex() : null, // Convert to hexadecimal if bandColor is not null
        status: item.scannedBy ? "Scanned" : "Not Yet Scanned",
        scannedDate: item.usedDate
          ? moment(item.usedDate).format("DD-MMM-YYYY hh:mm A")
          : "N/A",
      });
    });

    // Set cell fills for bandColor and claspColor
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      if (rowNumber === 1) return;
      const bandColorCell = row.getCell("bandColor");
      if (bandColorCell.value) {
        bandColorCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bandColorCell.value.replace("#", "FF") },
        };
        bandColorCell.value = ""; // Clear actual color code
      }
    });

    // Generate the Excel file as a Blob and use file-saver to save it
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, filename);
    } catch (err) {
      console.error("Error creating Excel file:", err);
    }
  };

  // Show QR code on popup
  // Modal popup open
  const handleClick = (qrCodeData) => {
    // console.log(qrCodeData);

    setQrImg(qrCodeData);
    setLgShow(true);
  };

  let viewDemoClose = (modal) => {
    switch (modal) {
      case "basic":
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


  let viewDemoShow = (modal) => {
    switch (modal) {
      case "basic":
        setBasic(true);
        break;

    }
  };

  return (
    <>
      <Seo title={"Scan Tickets"} />

      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Scan Tickets
          </span>
        </div>
        <div className="justify-content-between d-flex mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15" href="#!">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Order
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Scan Tickets
            </Breadcrumb.Item>
          </Breadcrumb>
          <Link
            href={"#"}
            className="filtr-icon"
            variant=""
            onClick={() => viewDemoShow("basic")}
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
              <Card.Header>
                <div className="d-flex justify-content-between">
                  <h4 className="card-title mg-b-0">Filters</h4>
                </div>
              </Card.Header>
              <Card.Body className="p-2">
                <Form
                  onSubmit={handleFormSubmit}
                  onReset={handleFormReset}
                  id="searchForm"
                >
                  <Form.Group className="mb-3" controlId="formScannedStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      className=" bg-transparent rounded"
                      value={searchFormData.scanned || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          scanned: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Status</option>
                      <option value="all">All</option>
                      <option value="scanned">Scanned</option>
                      <option value="notscanned">Not Scanned</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formScannedStatus">
                    <Form.Label>Ticket Type</Form.Label>
                    <Form.Select
                      className=" bg-transparent rounded"
                      value={searchFormData.ticket_type || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          ticket_type: e.target.value,
                        })
                      }
                    >
                      {/* <option value="">Select Ticket Type</option> */}
                      <option value=" ">All</option>
                      <option value="ticket">Ticket</option>
                      <option value="addon">Addon</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formOrderId">
                    <Form.Label>Order ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Order ID"
                      value={searchFormData.orderId || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          orderId: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Email"
                      value={searchFormData.email || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          email: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="First Name"
                      value={searchFormData.name || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          name: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Last Name"
                      value={searchFormData.lname || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          lname: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formMobile">
                    <Form.Label>Mobile</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Mobile"
                      value={searchFormData.mobile || ""}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          mobile: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group
                    className="mb-3 dt-pkr-wdt"
                    controlId="formDateFrom"
                  >
                    <Form.Label>Date From</Form.Label>
                    <DatePicker
                      selected={startDate}
                      onChange={handleFromDateChange}
                      dateFormat="dd-MM-yyyy"
                      className="form-control"
                      placeholderText="DD-MM-YY"
                      maxDate={new Date()}
                    />
                  </Form.Group>

                  <Form.Group
                    className="mb-3 dt-pkr-wdt"
                    controlId="formDateTo"
                  >
                    <Form.Label>Date To</Form.Label>
                    <DatePicker
                      selected={endDate}
                      onChange={handleToDateChange}
                      dateFormat="dd-MM-yyyy"
                      className="form-control"
                      placeholderText="DD-MM-YY"
                      minDate={startDate}
                      maxDate={new Date()}
                      startDate={startDate}
                      disabled={!fromDateModified}
                    />
                  </Form.Group>

                  <div className="d-flex align-items-end justify-content-between">
                    <Button
                      variant="primary me-3"
                      ref={submitBtnRef}
                      id="submitBtn"
                      type="submit"
                      className="me-2 w-50"
                    >
                      Submit
                    </Button>

                    <Button variant="secondary" type="reset" className="w-50">
                      Reset
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={10}>
            <div className="Mmbr-card">
              <Card>
                <Card.Header style={{ padding: "10px" }}>
                  <div className="d-flex flex-wrap justify-content-between">
                    <div className="scn-tct-hdr">
                      <button
                        variant=""
                        className="btn btn-sm my-1 btn-primary me-2"
                        style={{
                          background: "#845adf",
                          color: "white",
                          border: "none",
                        }}
                        type="button"
                      >
                        Total Scanned Tickets :{" "}
                        {ticketSaleInfo && ticketSaleInfo.totalScannedTickets} /{" "}
                        {ticketSaleInfo && ticketSaleInfo.totalTickets}
                      </button>

                      <button
                        variant=""
                        className="btn btn-sm my-1 btn-primary me-2"
                        style={{
                          background: "rgb(82 195 106)",
                          color: "white",
                          border: "none",
                        }}
                        type="button"
                      >
                        Total Scanned Addons :{" "}
                        {ticketSaleInfo && ticketSaleInfo.totalScannedAddons} /{" "}
                        {ticketSaleInfo && ticketSaleInfo.totalAddons}
                      </button>

                      <button
                        variant=""
                        className="btn btn-sm my-2 btn-primary"
                        style={{
                          background: "rgb(255 88 78)",
                          color: "white",
                          border: "none",
                        }}
                        type="button"
                      >
                        Total Cancel Ticket :{" "}
                        {ticketSaleInfo && ticketSaleInfo.totalCancelTicket} ||
                        Total Cancel Addons :{" "}
                        {ticketSaleInfo && ticketSaleInfo.totalCancelAddon}
                      </button>
                    </div>
                    <button
                      variant=""
                      className="btn exel-btn-scn-tct btn-sm my-1 btn-success"
                      style={{
                        color: "white",
                        border: "none",
                      }}
                      type="button"
                      onClick={handleExport}
                    >
                      <i className="bi bi-file-earmark-excel-fill me-1"></i>
                      Generate Excel
                    </button>
                  </div>

                  {/* <div className="d-flex justify-content-end">
               
                </div> */}
                </Card.Header>

                <Card.Body className="p-2">
                  <div className="scn-tct-mbl-rspo">
                    <table
                      {...getTableProps()}
                      className="table  responsive-table mb-0 "
                    >
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
                          </tr>
                        ))}
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
                      ) : page.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            style={{ textAlign: "center", padding: "20px" }}
                          >
                            No results found.
                          </td>
                        </tr>
                      ) : (
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
                              </tr>
                            );
                          })}
                        </tbody>
                      )}
                    </table>
                  </div>

                  <div className="d-block d-sm-flex mt-4 mt-sm-2  mx-0  mx-sm-2 ">
                    <span className="">
                      Page{" "}
                      <strong>
                        {pageIndex + 1} of {pageOptions.length}
                      </strong>{" "}
                    </span>
                    <span className="ms-sm-auto pgintn ">
                      <Button
                        variant=""
                        className="btn-default tablebutton me-2  my-1"
                        onClick={() => gotoPage(0)}
                        disabled={!canPreviousPage}
                      >
                        {" First "}
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
                        {" Last "}
                      </Button>
                    </span>
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
          <Modal.Title>
            <strong> Email:</strong> {qrImg.memberEmail} <strong> Name:</strong>{" "}
            {qrImg.memberFirstName}
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
          <div className="container-fluid text-center px-sm-3 px-0">
            <img
              className="bd-placeholder-img"
              width="200px"
              src={`${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/` + qrImg.ticketQR}
              alt="QR"
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
              viewDemoClose("basic");
            }}
          >
            <i class="bi bi-x"></i>
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={handleFormSubmit}
            onReset={handleFormReset}
            id="searchForm"
          >
            <Form.Group className="mb-3" controlId="formScannedStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                className=" bg-transparent rounded"
                value={searchFormData.scanned || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    scanned: e.target.value,
                  })
                }
              >
                <option value="">Select Status</option>
                <option value="all">All</option>
                <option value="scanned">Scanned</option>
                <option value="notscanned">Not Scanned</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formScannedStatus">
              <Form.Label>Ticket Type</Form.Label>
              <Form.Select
                className=" bg-transparent rounded"
                value={searchFormData.ticket_type || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    ticket_type: e.target.value,
                  })
                }
              >
                {/* <option value="">Select Ticket Type</option> */}
                <option value=" ">All</option>
                <option value="ticket">Ticket</option>
                <option value="addon">Addon</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formOrderId">
              <Form.Label>Order ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Order ID"
                value={searchFormData.orderId || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    orderId: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email"
                value={searchFormData.email || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    email: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="First Name"
                value={searchFormData.name || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    name: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Last Name"
                value={searchFormData.lname || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    lname: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMobile">
              <Form.Label>Mobile</Form.Label>
              <Form.Control
                type="text"
                placeholder="Mobile"
                value={searchFormData.mobile || ""}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    mobile: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3 dt-pkr-wdt" controlId="formDateFrom">
              <Form.Label>Date From</Form.Label>
              <DatePicker
                selected={startDate}
                onChange={handleFromDateChange}
                dateFormat="dd-MM-yyyy"
                className="form-control"
                placeholderText="DD-MM-YY"
                maxDate={new Date()}
              />
            </Form.Group>

            <Form.Group className="mb-3 dt-pkr-wdt" controlId="formDateTo">
              <Form.Label>Date To</Form.Label>
              <DatePicker
                selected={endDate}
                onChange={handleToDateChange}
                dateFormat="dd-MM-yyyy"
                className="form-control"
                placeholderText="DD-MM-YY"
                minDate={startDate}
                maxDate={new Date()}
                startDate={startDate}
                disabled={!fromDateModified}
              />
            </Form.Group>

            <div className="d-flex mt-2">
              <Button
                variant="primary me-3"
                ref={submitBtnRef}
                id="submitBtn"
                type="submit"
              >
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

ScanTickets.layout = "Contentlayout";
export default ScanTickets;
