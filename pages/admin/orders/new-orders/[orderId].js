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
  Spinner,
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
// import { CForm, CCol, CFormLabel, CFormInput, CButton, } from "@coreui/react";
import Swal from "sweetalert2";
import { CSVLink } from "react-csv";
import { Tooltip, IconButton, Switch } from "@mui/material";
import moment from "moment";

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
  CFormTextarea,
} from "@coreui/react";

const OrderDetailsPage2 = () => {
  const router = useRouter();
  const { orderId, type, transfer } = router.query;
  const submitBtnRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [DATATABLE, setDATATABLE] = useState([]);
  const firstEventId = DATATABLE.length > 0 ? DATATABLE[0].event_id : null;
  const firstUserId = DATATABLE.length > 0 ? DATATABLE[0].user_id : null;
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [color, setColor] = useState("");
  const [ticket_id, setTicket_id] = useState("");
  const [basic, setBasic] = useState(false);
  const [transferModalData, setTransferModalData] = useState("");
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [ticketInfo, setTicketInfo] = useState({});
  const [fromDateModified, setFromDateModified] = useState(false);
  const [searchFormData, setSearchFormData] = useState({
    name: null,
    lname: null,
    email: null,
    orderId: orderId || null,
    mobile: null,
    eventName: null,
    startDate: null,
    endDate: null,
    transfer: transfer || null, // Default transfer value (Yes)
    type: type || "all", // Default type value (Ticket)
  });

  // console.log('>>>>>>>>',searchFormData);


  const [errorAlert, setErrorAlert] = useState("");
  const [getUserInfoExist, setGetUserInfoExist] = useState({});

  // Error message remove
  useEffect(() => {
    if (errorAlert) {
      const timeoutId = setTimeout(() => {
        setErrorAlert("");
      }, 7000);
      return () => clearTimeout(timeoutId);
    }
  }, [errorAlert]);

  // Transfer ticket  Start here >>>>>>>>>
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [addonShow, setAddonShow] = useState(false);
  const handleCloseTransferModal = () => {
    setShowTransferModal(false);
    setIsTransferButton(false); // assuming this is the correct setter name
    setEmail("");
    setFirstName("");
    setLastName("");
  };

  const [isTransferButton, setIsTransferButton] = useState(true);

  // Transfer addon popup function
  // const addonClose = () => setAddonShow(false);
  const addonClose = () => {
    setAddonShow(false);
    setIsTransferButton(false); // assuming this is the correct setter name
    setEmail("");
    setFirstName("");
    setLastName("");
  };
  const addonOpen = () => setAddonShow(true);
  const [addon_id, setAddon_id] = useState("");
  const [addonData, setAddonData] = useState("");

  // Modal popup open
  const handleClickOpenModal = (data) => {
    setTransferModalData(data);
    setTicketInfo(data);
    setTicket_id(data.ticket_id);
    setShowTransferModal(true);
  };


  // transfer only addon
  const transferAddon = async (event) => {
    setIsLoading(true);
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false || isTransferButton) {
      setIsLoading(false);
      event.preventDefault();
      event.stopPropagation();
    } else {
      if (Email == ticketInfo.email) {
        setIsTransferButton(true);
        setIsLoading(false);
        setErrorAlert("You cannot transfer this addon to the same recipient.");
        return false;
      }
      // const shouldRemove = confirm("Are you sure you want to transfer?");
      // if (shouldRemove) {
      // Confirmation popup
      const result = await Swal.fire({
        title: "Confirm Addon Transfer",
        text: "Do you want to proceed with transferring this addon?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#fff",
        cancelButtonColor: "#000",
        confirmButtonText: "Yes, transfer it!",
        customClass: {
          popup: "add-tckt-dtlpop",
        },
      });

      if (!result.isConfirmed) {
        setIsLoading(false);
        return;
      }
      // Show loading popup
      Swal.fire({
        title: "Transferring Addon...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: "add-tckt-dtlpop",
        },
      });
      // Receiver email
      const encodedEmail = encodeURIComponent(Email);
      const viewProfileApi = await fetch(
        `/api/v1/front/sendmailnewuser/?Email=${encodedEmail}`
      );
      const toUserInfo = await viewProfileApi.json();

      // Sender profile details
      const encodedEmail2 = encodeURIComponent(ticketInfo.email);
      const fromViewProfileApi = await fetch(
        `/api/v1/front/sendmailnewuser/?Email=${encodedEmail2}`
      );
      const fromUserProfile = await fromViewProfileApi.json();
      if (toUserInfo.success) {
        setGetUserInfoExist(toUserInfo.data);
      } else {
        setErrorAlert(toUserInfo.message);
        setIsLoading(false);
        setFirstName("");
        setLastName("");
        setIsTransferButton(true);
        return false;
      }

      const apiUrl = `/api/v1/orders`;
      const body = {
        key: "transferAddon",
        fromName:
          (fromUserProfile?.data?.FirstName || "") +
          (fromUserProfile?.data?.LastName
            ? " " + fromUserProfile.data.LastName
            : ""),
        toName:
          (toUserInfo?.data?.FirstName || "") +
          (toUserInfo?.data?.LastName ? " " + toUserInfo.data.LastName : ""),
        email: Email,
        addon_id: addon_id,
        status: toUserInfo?.data?.Status || "",
        toUserId: toUserInfo?.data?.id || "",
        ticket_type: "addon",
      };
      await axios
        .post(apiUrl, body)
        .then(async (res) => {
          if (res.data.success) {
            const message = res.data.message;
            setAddonShow(false);
            Swal.fire({
              title: "Success",
              icon: "success",
              allowOutsideClick: false,
              confirmButtonText: "ok",
              cancelButtonColor: "#38cab3",
              text: message,
              customClass: {
                popup: "add-tckt-dtlpop",
              },
            });
            setEmail("");
            setLastName("");
            setFirstName("");
            setErrorAlert("");
            setIsTransferButton(false)
            setGetUserInfoExist("");
            await callSearchApi({
              orderId: orderId,
              key: "searchOrderDetails",
              type: "all",
            });
          } else {
            setIsLoading(false);
            const message = res.data.message;
            setFirstName("");
            setLastName("");
            setEmail("");
            setIsTransferButton(true);
            setErrorAlert(message);
          }
        })
        .catch((err) => {
          setErrorAlert(err);
          setAddonShow(true);
          setFirstName("");
          setLastName("");
          setEmail("");
          setIsTransferButton(true);
        });
    }
    setValidatedCustom(true);
  };

  const handleTransferAddon = (data) => {
    console.log("data", data);
    setTransferModalData(data);
    setTicketInfo(data);
    setAddonData(data);
    setAddon_id(data.id);
    addonOpen("lgShow");
  };

  // Automatic fatch for email
  // Ticket Transfer for email
  const [findLoading, setFindLoading] = useState(false);

  const handleEmail = async (email) => {
    setEmail(email);
    setIsTransferButton(true);
    setFindLoading(true);
    try {
      if (email && email.includes("@")) {
        const encodedEmail = encodeURIComponent(email);
        const decodedEmail = decodeURIComponent(encodedEmail);

        if (decodedEmail == ticketInfo.email) {
          setFindLoading(false);
          setErrorAlert(
            "You cannot transfer this ticket to the same recipient."
          );
          return false;
        }

        const memberResponse = await fetch(
          `/api/v1/members?email=${encodedEmail}`
        );
        setFindLoading(false);
        const memberData = await memberResponse.json();

        if (memberData.success) {
          setIsTransferButton(false);
          const fetchedFirstName = memberData?.data?.FirstName || "";
          const fetchedLastName = memberData?.data?.LastName || "";
          setFirstName(fetchedFirstName);
          setLastName(fetchedLastName);
          findAllAddons();
        } else {
          setErrorAlert("");
          Swal.fire({
            html: ` <p className="accomswt-para">We could't find that email in our system. Please make sure you have the correct email and/ or that your guest is a valid member of Ondalinda. If you have more questions please contact us at hello@ondalinda.com</p>`,
            customClass: {
              popup: "add-tckt-dtlpop",
              // cry-acom-pln-swtpup
            },
          });
          setFindLoading(false);
          // if (isConfirm) {
          //   const newMemberEmailSend = "/api/v1/front/sendmailnewuser";
          //   const body = new FormData();
          //   body.append("existUserEmail", ticketInfo.email);
          //   body.append("newEmail", email);
          //   await axios
          //     .post(newMemberEmailSend, body)
          //     .then((res) => {
          //       setIsLoading(false);
          //       setFindLoading(false);
          //       const resMessage = res.data.sendMailNewUser.message;
          //       if (res.data.sendMailNewUser.success) {
          //         setShowTransferModal(false);
          //         Swal.fire({
          //           icon: "success",
          //           title: "Invitation Sent!",
          //           text: resMessage,
          //         });
          //         setEmail("");
          //       } else {
          //         setShowTransferModal(false);
          //         Swal.fire({
          //           icon: "error",
          //           title: "Oops...",
          //           text:
          //             "Something went wrong. Please try again later. Error:" +
          //             err,
          //         });
          //         setFindLoading(false);
          //       }
          //     })
          //     .catch((err) => {
          //       setIsLoading(false);
          //       setFindLoading(false);
          //       Swal.fire({
          //         icon: "error",
          //         title: "Oops...",
          //         text:
          //           "Something went wrong. Please try again later. Error:" +
          //           err,
          //       });
          //     });
          // } else {
          //   setFirstName("");
          //   setLastName("");
          //   setFindLoading(false);
          // }
        }
      }
    } catch (error) {
      setIsTransferButton(false); // Re-enable the button after API response is processed
      console.error("Error fetching member data:", error);
    }
  };

  const [selectedAddons, setSelectedAddons] = useState([]);

  const transferTicket = async (event) => {
    setIsLoading(true);
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false || isTransferButton) {
      setIsLoading(false);
      event.preventDefault();
      event.stopPropagation();
    } else {
      if (Email == ticketInfo.email) {
        setIsTransferButton(true);
        setIsLoading(false);
        setErrorAlert("You cannot transfer this ticket to the same recipient.");
        return false;
      }
      // const shouldRemove = confirm("Are you sure you want to transfer?");
      // if (shouldRemove) {

      const result = await Swal.fire({
        title: "Confirm Ticket Transfer",
        text: "Do you want to proceed with transferring this ticket?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#fff",
        cancelButtonColor: "#000",
        confirmButtonText: "Yes, transfer it!",
        customClass: {
          popup: "add-tckt-dtlpop",
        },
      });

      if (!result.isConfirmed) {
        setIsLoading(false);
        return;
      }

      // Show loader
      Swal.fire({
        title: "Transferring Ticket...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: "add-tckt-dtlpop",
        },
      });
      // Receiver email
      const encodedEmail = encodeURIComponent(Email);
      const viewProfileApi = await fetch(
        `/api/v1/front/sendmailnewuser/?Email=${encodedEmail}`
      );
      const toUserInfo = await viewProfileApi.json();
      // Sender profile details
      const encodedEmail2 = encodeURIComponent(ticketInfo.email);
      const fromViewProfileApi = await fetch(
        `/api/v1/front/sendmailnewuser/?Email=${encodedEmail2}`
      );
      const fromUserProfile = await fromViewProfileApi.json();

      // return false;
      if (toUserInfo.success) {
        setGetUserInfoExist(toUserInfo.data);
      } else {
        setErrorAlert(toUserInfo.message);
        setIsLoading(false);
        setFirstName("");
        setLastName("");
        setIsTransferButton(true);
        return false;
      }
      // Without term and condition
      const apiUrl = `/api/v1/orders`;
      const body = {
        key: "transferTicket",
        fromName:
          (fromUserProfile?.data?.FirstName || "") +
          (fromUserProfile?.data?.LastName
            ? " " + fromUserProfile.data.LastName
            : ""),
        toName:
          (toUserInfo?.data?.FirstName || "") +
          (toUserInfo?.data?.LastName ? " " + toUserInfo.data.LastName : ""),
        email: Email,
        ticket_id: ticketInfo?.ticket_id || "",
        status: toUserInfo?.data?.Status || "",
        // toUserId: toUserInfo?.data?.id || "",
        ticket_type: "ticket",
        addons: selectedAddons,
      };
      await axios
        .post(apiUrl, body)
        .then(async (res) => {
          if (res.data.success) {
            const message = res.data.message;
            setShowTransferModal(false);
            Swal.fire({
              title: "Success",
              icon: "success",
              allowOutsideClick: false,
              confirmButtonText: "ok",
              cancelButtonColor: "#38cab3",
              text: message,
              customClass: {
                popup: "add-tckt-dtlpop",
              },
            });

            setEmail("");
            setLastName("");
            setFirstName("");
            setIsTransferButton(false)
            setErrorAlert("");
            setGetUserInfoExist("");
            setSelectedAddons("")
            await callSearchApi({
              orderId: orderId,
              key: "searchOrderDetails",
              type: "all",
            });
          } else {
            setIsLoading(false);
            const message = res.data.message;
            setFirstName("");
            setLastName("");
            setEmail("");
            setIsTransferButton(true);
            setErrorAlert(message);
          }
        })
        .catch((err) => {
          // console.log(err, 'err');
          setErrorAlert(err);
          setShowTransferModal(true);
          setFirstName("");
          setLastName("");
          setEmail("");
          setIsTransferButton(true);
        });
    }
    setValidatedCustom(true);
  };
  // Transfer ticket  Start End >>>>>>>>>

  let cancelId;
  if (typeof window !== "undefined") {
    cancelId = localStorage.getItem("UserID_");
  }

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "wd-5p borderrigth",
      
      
    },
    
    {
      Header: "QR Code",
      accessor: "Name",
      className: "wd-25p borderrigth",
      
      Cell: ({ row }) => (
        <div>
          {row.original.ticket_status === "" ||
            row.original.ticket_status === "Not Assigned" ? (
            // Other cases
            row.original.transfer_ticket_to_email ? (
              // Display Transferred state
              <div>
                <div style={{ position: "relative", width: "116px" }}>
                  <h6
                    style={{
                      position: "absolute",
                      color: "white",
                      zIndex: "99999",
                      transform: "translate(-50%, -50%)",
                      top: "50%",
                      left: "50%",
                      fontSize: "14px",
                    }}
                  >
                    Transferred
                  </h6>
                  <div
                    style={{
                      position: "absolute",
                      backgroundColor: "black",
                      width: "100%",
                      height: "100%",
                      opacity: "0.8",
                    }}
                  ></div>
                  <img
                    src={
                      row.original.ticket_type === "accommodation"
                        ? "/qrCodes/accommodation/" + row.original.qrcode
                        : "/qrCodes/" + row.original.qrcode
                    }
                    alt="QR"
                  />
                </div>
                {row.original.transfer_ticket_to_email}
              </div>
            ) : (
              // Default QR code display
              
              <div className="d-flex justify-content-between align-items-start" >

                <div>
                 <div style={{ position: "relative", width: "100px" }}>
                <img
                  src={
                    row.original.ticket_type === "accommodation"
                      ? "/qrCodes/accommodation/" + row.original.qrcode
                      : "/qrCodes/" + row.original.qrcode
                  }
                  alt="QR" />
                 
                 
               
                    </div>
                  <span className="ticket-no">
                  <strong> Order No:</strong>   #958787262258
                 </span>

                </div>
                

                   <div className="d-flex align-items-center gap-2 margin-top-2 order-info table-btn-view flex-wrap">
                    <a
                        className="d-flex justify-content-center"
                        onClick={() => {
                        }}
                      >
                        <img src="https://staging.ondalinda.com/assets/img/icons/tickets-icon1.png"></img>
                      </a>
                     
                </div>
              </div>
              
              
              
              
            )
          ) : (
            // Display Cancelled state
            <div>
              <div style={{ position: "relative", width: "116px" }}>
                <h6
                  style={{
                    position: "absolute",
                    color: "white",
                    zIndex: "99999",
                    transform: "translate(-50%, -50%)",
                    top: "50%",
                    left: "50%",
                    fontSize: "14px",
                  }}
                >
                  Cancelled
                </h6>
                <div
                  style={{
                    position: "absolute",
                    backgroundColor: "black",
                    width: "100%",
                    height: "100%",
                    opacity: "0.8",
                  }}
                ></div>

                <img
                  src={
                    row.original.ticket_type === "accommodation"
                      ? "/qrCodes/accommodation/" + row.original.qrcode
                      : "/qrCodes/" + row.original.qrcode
                  }
                  alt="QR"
                />

                {/* <img src={"/qrCodes/" + row.original.qrcode} alt="QR" /> */}
              </div>
            </div>
            
          )}
        </div>
        
       

             
        
      ),
    },

    {
      Header: "Ticket",
      accessor: "Ticket",
      className: " borderrigth",
    

 Cell: ({ row }) => {
        const {
          ticket_type,
          ticketPrice,
          currencysign,
          is_free_ticket,
          check_in_date,
          check_out_date,
          date_differace,
          perNightPrice = 0,
          accommodationOndalindaPerDaysFeeAmount = 0,
          accommodationPerDaysPropertyOwnerAmount = 0,
        } = row.original;
        // console.log('>>>>>>>>>>',row.original);


        return (
          <div >
            {row.original.eventticketname}
            {ticket_type === 'accommodation' ? (
              <>
                <div><strong>Check In:</strong> {<Moment format="DD-MMM-YYYY" utc>{check_in_date}</Moment>}</div>
                <div><strong>Check Out:</strong> {<Moment format="DD-MMM-YYYY" utc>{check_out_date}</Moment>}</div>
                <div><strong>Per Night:</strong> {currencysign}{new Intl.NumberFormat("en-IN").format(perNightPrice)}</div>
                <div><strong>Total Nights:</strong> {date_differace}</div>
                <div><strong>Ondalinda Fee:</strong>{currencysign}{new Intl.NumberFormat("en-IN").format(accommodationOndalindaPerDaysFeeAmount * date_differace)}</div>
                <div><strong>Homeowner Payout:</strong>{currencysign}{new Intl.NumberFormat("en-IN").format(accommodationPerDaysPropertyOwnerAmount * date_differace)}</div>

              </>
            ) : (
              <>
                {currencysign}{new Intl.NumberFormat("en-IN").format(ticketPrice)}
              </>
            )}

            <br />
            {is_free_ticket && (
              <span className="badge badge-primary">Free Ticket</span>
            )}
          </div>
        );
      }
    },
    {
      Header: "User Info",
      className: " wd-25p borderrigth",
      Cell: ({ row }) => (
        <div>
          {row.original.name ? row.original.name : "--"}{" "}
          {row.original.lname ? row.original.lname : "--"}
          <br />
          {row.original.email}
          <br />
          {row.original.mobile}
          {row.original.is_transfer && (
            <div className="transferred-label" style={{ marginTop: "5px" }}>
              <span
                className="badge badge-info"
                style={{
                  backgroundColor: "#17a2b8",
                  color: "white",
                  padding: "3px 8px",
                  borderRadius: "4px",
                }}
              >
                Transferred
              </span>
            </div>
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

  useEffect(() => {
    if (orderId) {
      //   handleViewOrders();
      setSearchFormData({
        ...searchFormData,
        orderId: orderId,
        key: "searchOrderDetails",
      });
      callSearchApi({
        ...searchFormData,
        orderId: orderId,
        key: "searchOrderDetails",
      });
    }
    setPageSize(50);
    // fetchedColors();
  }, [orderId]);

  const handleFromDateChange = (date) => {
    setStartDate(date);
    setEndDate(null);
    setFromDateModified(true);
  };

  const handleToDateChange = (date) => {
    setEndDate(date);
  };

  const handleFormReset = async () => {
    setSearchFormData({
      orderId: orderId,
      type: "all",
      key: "searchOrderDetails",
    });
    setStartDate(null);
    setEndDate(null);
    setBasic(false)
    await callSearchApi({
      orderId: orderId,
      type: "all",
      key: "searchOrderDetails",
    });
  };

  const handleFormSubmit = async (event) => {
    setBasic(false)
    event.preventDefault();

    // console.log('>>>>>>>>>>>>>>>>>>>');

    // Filter out null or empty keys, except for 'key' and 'type'
    const filteredData = Object.entries(searchFormData)
      .filter(([field, value]) => {
        if (field == "key" || field == "type") {
          return true;
        }
        return value !== null && value !== "";
      })
      .reduce((acc, [field, value]) => {
        acc[field] = value;
        return acc;
      }, {});

    // Check if there is at least one key other than 'key' and 'type'
    const otherKeys = Object.keys(filteredData).filter(
      (field) => field !== "key" && field !== "type" && field !== "transfer"
    );

    // console.log('>>>>>>>>',filteredData);


    // If there are no other keys, show an error and return
    if (otherKeys.length == 0) {
      alert(
        "At least one search criteria (other than 'key' and 'type') is required."
      );
      return;
    }

    // Call the API with filtered data
    callSearchApi(filteredData);
  };

  const callSearchApi = async (formData) => {
    const SEARCH_API = "/api/v1/orders";
    setIsLoading(true);
    try {
      const response = await axios.post(SEARCH_API, formData);
      if (response.data.data) {
        setDATATABLE(response.data.data);
      } else {
        setDATATABLE([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // view Addons
  const [addons, setAddons] = useState([]);
  const findAllAddons = async (userId) => {
    try {
      if (!firstUserId || !firstEventId) {
        console.error("Missing user_id or event_id for addons fetch.");
        return;
      }
      const url = "/api/v1/orders";
      const user_data = {
        key: "find_addon",
        user_id: firstUserId,
        event_id: firstEventId,
      };
      const response = await axios.post(url, user_data);
      if (response?.data?.success) {
        setAddons(response.data.data);
      } else {
        console.error("Failed to fetch addons:", response?.data?.message);
      }
    } catch (err) {
      console.log("error", err.message);
    }
  };

  const handleCheckboxChange = (id, isChecked) => {
    if (isChecked) {
      // Add the id to the selectedAddons array
      setSelectedAddons((prev) => [...prev, id]);
    } else {
      // Remove the id from the selectedAddons array
      setSelectedAddons((prev) => prev.filter((addonId) => addonId !== id));
    }
  };

  // view wristband color
  const fetchedColors = async () => {
    const SEARCH_API = `/api/v1/wristband?event_id=${108}`;
    setIsLoading(true);
    try {
      const response = await axios.get(SEARCH_API);
      if (response.data.data) {
        // console.log("Response Data:", response.data.data);
        setColor(response.data.data);
      } else {
        console.log("error");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Generate Excel
  const headers = [
    { label: "S.No", key: "serialNumber" },
    { label: "Order ID", key: "orderId" },
    { label: "Order Date", key: "orderDate" },
    { label: "Event", key: "eventName" },
    // { label: "Ticket", key: "ticketName" },
    { label: "Ticket", key: "ticketName" },
    { label: "Addon", key: "addontName" },
    { label: "User Name", key: "userName" },
    { label: "User Email", key: "userEmail" },
    { label: "Amount", key: "amount" },
    { label: "Band Color", key: "bandColor" },
    { label: "Clasp Color", key: "claspColor" },
  ];
  // Process data
  const data = DATATABLE.map((item, index) => {
    const ticketNameCondition =
      item.eventticketname === "VIP EXPERIENCE PACKAGE" ? "Y" : "N";
    const addontNameCondition =
      item.eventticketname === "Illyrian Voyage | Karaka Boat" ? "Y" : "N";
    return {
      serialNumber: index + 1, // Add serial number
      orderId: item.OriginalTrxnIdentifier || "----",
      orderDate: item.orderCreated
        ? moment(item.orderCreated).format("DD-MMM-YYYY")
        : "----",
      eventName: item.eventname || "----",
      ticketName: ticketNameCondition,
      addontName: addontNameCondition,
      userName: `${item.name || "---"} ${item.lname || "---"}`,
      userEmail: item.email || "---",
      amount: item.amount ? `€ ${item.amount}` : "---",
      bandColor: item.bandcolor || "---",
      claspColor: item.claspcolor || "---",
    };
  });
  // Export CSV function
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
    // Trigger the download (uncomment the next line if needed)
    // csvExporter.click();
  };


  // Popup functions
  let viewDemoShow = (modal) => {
    switch (modal) {
      case "Basic":
        setBasic(true);
        break;
    }
  };

  let viewDemoClose = (modal) => {
    switch (modal) {
      case "Basic":
        setBasic(false);
        break;
    }
  };

  return (
    <>
      <Seo title={"Order Details"} />

      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Order Details
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
              Order Details
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
            <Card className="member-fltr-hid ">
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

                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Event Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Event Name"
                      value={searchFormData.eventName || null}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          eventName: e.target.value,
                        })
                      }
                    />
                  </Form.Group>

                  {/* Transfer Dropdown */}
                  <Form.Group className="mb-3" controlId="formTransfer">
                    <Form.Label>Transfer</Form.Label>
                    <Form.Control
                      as="select"
                      value={searchFormData.transfer}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          transfer: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      <option value="1">Yes</option>
                    </Form.Control>
                  </Form.Group>

                  {/* Type Dropdown */}
                  <Form.Group className="mb-3" controlId="formType">
                    <Form.Label>Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={searchFormData.type}
                      onChange={(e) =>
                        setSearchFormData({
                          ...searchFormData,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="all">All</option>
                      <option value="free">Free</option>
                      <option value="ticket">Ticket</option>
                      <option value="addon">Addon</option>
                    </Form.Control>
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
                      startDate={startDate}
                      disabled={!fromDateModified}
                    />
                  </Form.Group>

                  <div className="d-flex mt-2 justify-content-between align-items-end">
                    <Button
                      variant="primary me-2 w-50"
                      ref={submitBtnRef}
                      id="submitBtn"
                      type="submit"
                    >
                      Submit
                    </Button>

                    <Button variant="secondary w-50" type="reset">
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
                <Card.Header style={{ padding: "0px" }}>
                  {/* <div className="d-flex justify-content-end">
                                    <IconButton className="p-0">
                                        <CSVLink
                                            headers={headers}
                                            data={data}
                                            filename={"orders.xlsx"}
                                            className="btn btn-sm btn-primary-light ms-auto me-2"
                                            target="_blank"
                                        >
                                            Generate Excel
                                        </CSVLink>
                                    </IconButton>
                                </div> */}
                </Card.Header>
                <Card.Body className="p-2">
                    <table className="table mb-0 eventbasic-tnfo">
                      <tbody>
                        <tr className="d-flex  flex-wrap">
                          <td className="me-4 border-0" >
                            <strong>Order No</strong>: #958787262258
                          </td>

                          <td className="me-4 border-0" >
                            <strong>Date:</strong>  07-08-25  
                          </td>
                          
                          <td className="me-4 border-0" >
                            <strong>Order Amount:</strong> $9,750
                          </td>
                          
                          <td className="me-4 border-0" >
                            <strong>Event Nmae:</strong> ONDALINDA x CAREYES 2025
                          </td>
                          
                        </tr>
                      </tbody>
                    </table>
                    <br></br>
                  <div className="stf-ord-ordID">
                

                    <table
                      {...getTableProps()}
                      className="table mb-0 responsive-table order-detalis-info"
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
                  <div className="d-flex align-items-center justify-content-between mt-4 mt-sm-2 mx-0 mx-sm-2">
                    <span className="">
                      Page{" "}
                      <strong>
                        {pageIndex + 1} of {pageOptions.length}
                      </strong>{" "}
                      Total Records:{" "}
                      <strong>{DATATABLE && DATATABLE.length}</strong>
                    </span>
                    <span className="d-flex pgintn justify-content-end ">
                      <Button
                        variant=""
                        className="btn-default tablebutton me-2 d-sm-inline d-none my-1"
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
                        className="btn-default tablebutton  d-sm-inline d-none my-1"
                        onClick={() => gotoPage(pageCount - 1)}
                        disabled={!canNextPage}
                      >
                        {" Next "}
                      </Button>
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      {/* Transfer ticket modal start here  */}
      <Modal
        show={showTransferModal}
        onHide={handleCloseTransferModal}
        className="event-tckts-mdl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Transfer Ticket</Modal.Title>
          <Button
            className="btn-close ms-auto"
            variant=""
            //  onClick={() => {setShowTransferModal(false);}}
            onClick={handleCloseTransferModal}
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </Modal.Header>
        <Modal.Body>
          <div className="inner-body-mdl">
            <p>
              Please enter the details of the Ondalinda member to whom you wish
              to transfer your ticket(s). They will be able to access their
              ticket(s) through their Ondalinda member profile.
            </p>

            <h3>
              #{" "}
              {transferModalData && transferModalData.OriginalTrxnIdentifier
                ? transferModalData.OriginalTrxnIdentifier
                : "--"}
            </h3>

            {errorAlert && (
              <CCol md={12} className="mt-3">
                <Alert variant="danger">{errorAlert}</Alert>
              </CCol>
            )}

            <CForm
              className="row g-3 needs-validation"
              noValidate
              validated={validatedCustom}
              onSubmit={transferTicket}
            >
              <CCol sm={8}>
                <CFormLabel htmlFor="validationDefault01">Email</CFormLabel>
                <CFormInput
                  type="email"
                  id="validationDefault01"
                  placeholder="Email"
                  required
                  value={Email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </CCol>

              <CCol sm={4} className="mt-auto modal-find-btn">
                <CButton
                  color="primary"
                  className="accomo-gobck"
                  type="button"
                  disabled={findLoading} // Disable the button while loading
                  onClick={(e) => {
                    if (!Email) {
                      setErrorAlert(
                        "Please enter an email before trying to find the user."
                      );
                      return;
                    }
                    handleEmail(Email);
                  }}
                >
                  {findLoading ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    "Find"
                  )}
                </CButton>
              </CCol>

              {!isTransferButton && (
                <>
                  <CCol sm={6}>
                    <CFormLabel htmlFor="validationDefault01">
                      First Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      required
                      readOnly={true}
                      value={FirstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                    />
                  </CCol>

                  <CCol sm={6}>
                    <CFormLabel htmlFor="validationDefault01">
                      Last Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      required
                      value={LastName}
                      readOnly={true}
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                    />
                  </CCol>

                  {/* Add-ons Checkbox Section */}
                  {addons.length > 0 && (
                    <CCol md={12} className="mt-5">
                      <CFormLabel>
                        {/* Please select which add-ons you wish to transfer */}
                        Would you like to transfer the following add-on as well?
                      </CFormLabel>
                      <div>
                        <Row className="mt-4">
                          {addons.map((item, index) => {
                            const isChecked = selectedAddons.includes(item.id); // Check if the id is in the selectedAddons array
                            return (
                              <Col md={12} key={index}>
                                <CFormCheck
                                  className="trnsr-adn-check"
                                  type="checkbox"
                                  id={`addon-${index}`} // Unique ID for each checkbox
                                  label={`${item.Addon.name}`} // Display the name and sortName
                                  checked={isChecked} // Bind checkbox state
                                  onChange={(e) =>
                                    handleCheckboxChange(
                                      item.id,
                                      e.target.checked
                                    )
                                  }
                                />
                              </Col>
                            );
                          })}
                        </Row>
                      </div>
                    </CCol>
                  )}
                  <CCol md={12} className="text-center">
                    <CButton
                      color="primary"
                      className="accomo-gobck w-auto mt-5"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "TRANSFER TICKET"}
                    </CButton>
                  </CCol>
                </>
              )}
            </CForm>
          </div>
        </Modal.Body>
      </Modal>

      {/* Transfer ticket modal end here  */}

      {/* Transfer addon modal start here  */}
      <Modal
        show={addonShow}
        onHide={addonClose}
        className="event-tckts-mdl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Transfer Add-On</Modal.Title>
          <Button
            className="btn-close ms-auto"
            variant=""
            onClick={() => {
              addonClose("lgShow");
            }}
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </Modal.Header>
        <Modal.Body>
          <div className="inner-body-mdl">
            <p>
              Please enter the details of the Ondalinda member to whom you wish
              to transfer your addon(s). They will be able to access their
              addon(s) through their Ondalinda member profile.
            </p>

            <h3>
              #{" "}
              {addonData && addonData.OriginalTrxnIdentifier
                ? addonData.OriginalTrxnIdentifier
                : "--"}
            </h3>

            {errorAlert && (
              <CCol md={12} className="mt-3">
                <Alert variant="danger">{errorAlert}</Alert>
              </CCol>
            )}

            <CForm
              className="row g-3 needs-validation"
              noValidate
              validated={validatedCustom}
              onSubmit={transferAddon}
            >
              <CCol sm={8}>
                <CFormLabel htmlFor="validationDefault01">Email</CFormLabel>
                <CFormInput
                  type="email"
                  id="validationDefault01"
                  placeholder="Email"
                  required
                  value={Email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </CCol>
              <CCol sm={4} className="mt-auto modal-find-btn">
                <CButton
                  className="accomo-gobck"
                  type="button"
                  disabled={findLoading} // Disable the button while loading
                  onClick={(e) => {
                    if (!Email) {
                      setErrorAlert(
                        "Please enter an email before trying to find the user."
                      );
                      return;
                    }
                    handleEmail(Email);
                  }}
                  // onClick={(e) => {
                  //     handleEmail(Email);
                  // }}
                >
                  {findLoading ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    "FIND"
                  )}
                </CButton>
              </CCol>

              {!isTransferButton && (
                <>
                  <CCol sm={6}>
                    <CFormLabel htmlFor="validationDefault01">
                      First Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault01"
                      placeholder="First Name"
                      required
                      readOnly={true}
                      value={FirstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                    />
                  </CCol>

                  <CCol sm={6}>
                    <CFormLabel htmlFor="validationDefault01">
                      Last Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="validationDefault01"
                      placeholder="Last Name"
                      required
                      value={LastName}
                      readOnly={true}
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                    />
                  </CCol>

                  <CCol md={12} className="text-center">
                    <CButton
                      color="primary"
                      className="accomo-gobck w-auto mt-5 ps-3"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "TRANSFER ADDON"}
                    </CButton>
                  </CCol>
                </>
              )}
            </CForm>
          </div>
        </Modal.Body>
      </Modal>

      {/* Transfer addon modal end here  */}

      <Modal show={basic} className="Member-filtr-mdlDgn">
        <Modal.Header>
          <Modal.Title>Filters</Modal.Title>
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
          <Form
            onSubmit={handleFormSubmit}
            onReset={handleFormReset}
            id="searchForm"
          >
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

            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Event Name"
                value={searchFormData.eventName || null}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    eventName: e.target.value,
                  })
                }
              />
            </Form.Group>

            {/* Transfer Dropdown */}
            <Form.Group className="mb-3" controlId="formTransfer">
              <Form.Label>Transfer</Form.Label>
              <Form.Control
                as="select"
                value={searchFormData.transfer}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    transfer: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="1">Yes</option>
              </Form.Control>
            </Form.Group>

            {/* Type Dropdown */}
            <Form.Group className="mb-3" controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                value={searchFormData.type}
                onChange={(e) =>
                  setSearchFormData({
                    ...searchFormData,
                    type: e.target.value,
                  })
                }
              >
                <option value="all">All</option>
                <option value="free">Free</option>
                <option value="ticket">Ticket</option>
                <option value="addon">Addon</option>
              </Form.Control>
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
      {/* Transfer addon modal end here  */}
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

OrderDetailsPage2.layout = "Contentlayout";
export default OrderDetailsPage2;
