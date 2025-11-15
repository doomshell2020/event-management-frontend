import {useEffect, useState, useRef } from "react";
import {
  Button,
  Form,
  Modal,
  Card,
  Row,
  Col,
  Breadcrumb,
  Alert,
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
import { useRouter } from "next/router";
import Moment from "react-moment";
import ClipLoader from "react-spinners/ClipLoader";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import {
  CForm,
  CCol,
  CFormLabel,
  CFormInput,
  CButton,
  CFormCheck,
} from "@coreui/react";

const OrderDetailsPage = () => {
  const router = useRouter();
  const { orderId, type, transfer } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [DATATABLE, setDATATABLE] = useState([]);
  const firstEventId = DATATABLE.length > 0 ? DATATABLE[0].event_id : null;
  const firstUserId = DATATABLE.length > 0 ? DATATABLE[0].user_id : null;
  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [transferModalData, setTransferModalData] = useState("");
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [ticketInfo, setTicketInfo] = useState({});
  const [searchFormData, setSearchFormData] = useState({
    orderId: orderId || null,
    transfer: transfer || null, // Default transfer value (Yes)
    type: type || "all", // Default type value (Ticket)
  });

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
                      row.original.ticket_type == "accommodation"
                        ? `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/accommodation/` + row.original.qrcode
                        : `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/` + row.original.qrcode
                    }
                    alt="QR"
                  />
                </div>
                {row.original.transfer_ticket_to_email}
              </div>
            ) : (
              // Default QR code display
              <div style={{ position: "relative", width: "100px" }}>
                <img
                  src={
                    row.original.ticket_type == "accommodation"
                      ? `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/accommodation/` + row.original.qrcode
                      : `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/` + row.original.qrcode
                  }
                  alt="QR"

                />
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
                      ? `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/accommodation/` + row.original.qrcode
                      : `${process.env.NEXT_PUBLIC_S3_URL}/qrCodes/` + row.original.qrcode
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
      Header: "Event",
      accessor: "Event",
      className: " borderrigth",
      Cell: ({ row }) => <div>{row.original.eventname}</div>,
    },
    {
      Header: "Ticket",
      accessor: "Ticket",
      className: " borderrigth",
      Cell: ({ row }) => <div>
        {row.original.eventticketname}
      </div>,
    },
    {
      Header: "User Info",
      className: " wd-25p borderrigth",
      Cell: ({ row }) => (
        <div>
          <strong>Name:</strong> {row.original.name ? row.original.name : "--"}{" "}
          {row.original.lname ? row.original.lname : "--"}
          <br />
          <strong>Email:</strong> {row.original.email}
          <br />
          <strong>Mobile:</strong> {row.original.mobile}
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
    {
      Header: "Amount",
      accessor: "Amount",
      className: "wd-5p borderrigth",
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
          <div style={{ textAlign: "right" }}>
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
      Header: "Order Date",
      accessor: "StartDates",
      className: " borderrigth",
      Cell: ({ row }) => (
        <div>
          {/* {row.original.StartDate} */}
          <Moment format="DD-MMM-YYYY" utc>{row.original.orderDate}</Moment>
        </div>
      ),
    },
    {
      Header: "Action",
      accessor: "Transfer Ticket",
      className: "borderright w-25",
      Cell: ({ row }) => (
        <>
          {row.original.ticket_type !== 'accommodation' ? (
            <>
              <div className="d-flex flex-column">
                {(row.original.ticket_status === "" ||
                  row.original.ticket_status === "Not Assigned") &&
                  (row.original.transferticket ? (
                    <strong style={{ width: "100px" }}>
                      <button
                        className="transferticket btn btn-sm text-light btn-success mb-2 w-100 d-inline-block"
                        onClick={() => {
                        }}
                      >
                        Transferred
                      </button>
                    </strong>
                  ) : row.original.ticket_type === "ticket" &&
                    row.original.transfer_ticket_to_email === "" ? (
                    <strong style={{ width: "100px" }}>
                      <button
                        className="transferticket btn btn-sm text-light btn-danger mb-2 w-100 d-inline-block"
                        onClick={() => {
                          handleClickOpenModal(row.original);
                        }}
                      >
                        Transfer Ticket
                      </button>
                    </strong>
                  ) : row.original.ticket_type === "addon" &&
                    row.original.transfer_ticket_to_email === "" ? (
                    <strong style={{ width: "100px" }}>
                      <button
                        className="transferticket btn btn-sm text-light btn-danger mb-2 w-100 d-inline-block"
                        onClick={() => {
                          handleTransferAddon(row.original);
                        }}
                      >
                        Transfer Addon
                      </button>
                    </strong>
                  ) : null)}

              </div> </>
          ) : (
            <></>
          )}
        </>
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

        </div>
      </div>

      <div className="left-content mt-2">
        <Row className="row-sm mt-4">
          <Col xl={12}>
            <div className="Mmbr-card">
              <Card>
                <Card.Header style={{ padding: "10px" }}>
                </Card.Header>
                <Card.Body className="p-2">
                  <div className="stf-ord-ordID">
                    <table
                      {...getTableProps()}
                      className="table mb-0 responsive-table orderDtlTbl"
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
        show={showTransferModal} onHide={handleCloseTransferModal}
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
              Please enter the details of the Ondalinda member to whom you wish to transfer your ticket(s). They will be able to access their ticket(s) through their Ondalinda member profile.
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
                    <CFormLabel htmlFor="validationDefault01">Last Name</CFormLabel>
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
                                    handleCheckboxChange(item.id, e.target.checked)
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
                </>)}
            </CForm>
          </div>
        </Modal.Body>
      </Modal>

      {/* Transfer ticket modal end here  */}

      {/* Transfer addon modal start here  */}
      <Modal
        show={addonShow} onHide={addonClose}
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
              Please enter the details of the Ondalinda member to whom you wish to transfer your addon(s). They will be able to access their addon(s) through their Ondalinda member profile.
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
                    <CFormLabel htmlFor="validationDefault01">Last Name</CFormLabel>
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
                </>)}
            </CForm>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};


OrderDetailsPage.layout = "Contentlayout";
export default OrderDetailsPage;
