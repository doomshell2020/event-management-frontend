// Changes According to Figma design 
import React, { useEffect, useState, forwardRef, useMemo } from "react";
import { useRouter } from "next/router";
import { Button, Form, Modal, Row, Col, Spinner } from "react-bootstrap";
import { CFormLabel, } from "@coreui/react";
import axios from "axios";
import Link from "next/link";
import Moment from "react-moment";
import moment from "moment-timezone";

import Swal from "sweetalert2";
import NoHousingDetails from './housingcomponents/nohousingdetails';
import RentHouseDetails from './housingcomponents/RentHouseDetails';
import StayAtOwnHomeDetails from './housingcomponents/StayAtOwnHomeDetails';
import "react-datepicker/dist/react-datepicker.css";

const RegistrationView = () => {
  const router = useRouter();
  // Accessing query parameters with bracket notation
  const userId = router.query["user-id"];
  const eventId = router.query["event-id"];
  const invitationId = router.query["invitation-id"];
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});
  console.log("-----------------", data)
  const [eventData, setEventData] = useState({});
  const [loading, setLoading] = useState(true);
  const [housingIds, setHousingIds] = useState("");
  const [offerHousing, setOfferHousing] = useState([])
  const [startDate, setStartDate] = useState("2025-11-06");
  const [endDate, setEndDate] = useState("2025-11-09");
  const [ticketRequired, setTicketRequired] = useState(1);
  const [arrivalMinDate, setArrivalMinDate] = useState(null);
  const [arrivalMaxDate, setArrivalMaxDate] = useState(null);
  const [departureMinDate, setDepartureMinDate] = useState(null);
  const [departureMaxDate, setDepartureMaxDate] = useState(null);


  useEffect(() => {
    if (eventData?.StartDate && eventData?.EndDate) {
      const timezone = eventData?.EventTimeZone || moment.tz.guess();

      const eventStart = moment.tz(eventData.StartDate, timezone);
      const eventEnd = moment.tz(eventData.EndDate, timezone);

      // Dynamically calculate based on event start and end
      setArrivalMinDate(eventStart.clone().subtract(2, "days").format("YYYY-MM-DD"));
      setArrivalMaxDate(eventStart.clone().format("YYYY-MM-DD"));
      setDepartureMinDate(eventEnd.clone().format("YYYY-MM-DD"));
      setDepartureMaxDate(eventEnd.clone().add(2, "days").format("YYYY-MM-DD"));
    }
  }, [eventData]);


  const [formData, setFormData] = useState({
    // NumDiscounts: '',
    DiscountPercentage: 0,
    // NumTicketsRequired: '',
    // expirationDate: '',
    Status: 2,
    internalNotes: '',
    selectedHousingIds: [],
  });

  const handleDeleteHousing = (propertyId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to release this housing?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, release it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Show loading Swal
        Swal.fire({
          title: 'Releasing housing...',
          text: 'Please wait while we process your request.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        try {
          const API_URL = `/api/v1/housings?action=release_housing&propertyId=${propertyId}&invitationId=${invitationId}`;
          const response = await axios.get(API_URL);
          const data = response.data;

          if (data.success) {
            Swal.fire({
              title: 'Released!',
              text: data.message || 'Housing has been released successfully.',
              icon: 'success',
            });

            // Optionally refresh housing list
            await getInvitationDetails(invitationId);
          } else {
            Swal.fire({
              title: 'Error!',
              text: data.message || 'Failed to release the housing.',
              icon: 'error',
            });
          }
        } catch (error) {
          console.error('Release Error:', error);
          Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Something went wrong while releasing the housing.',
            icon: 'error',
          });
        }
      }
    });
  };

  const handleSelectionChange = (selectedHousingIds) => {
    setHousingIds((prevData) => ({
      ...prevData,
      selectedHousingIds,
    }));
  };

  const assignedHousing = async (housingIds) => {
    try {
      const formData = new FormData();
      formData.append('key', 'getAssignedHousing');
      formData.append('housingIds', JSON.stringify(housingIds));

      const response = await fetch('/api/v1/housings', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setOfferHousing(data.data);
      }
    } catch (error) {
      console.error('Error in assignedHousing:', error);
    }
  };

  const getInvitationDetails = async (invitationId) => {
    try {
      const response = await axios.get(
        `/api/v1/invitationevents?invitationId=${invitationId}`
      );
      if (response.data.success) {
        const eligibleHousingIdsString = response.data.data.invitationData.EligibleHousingIDs;
        if (eligibleHousingIdsString && eligibleHousingIdsString.trim() !== '') {
          const eligibleHousingIdsArray = eligibleHousingIdsString.split(',').map(id => parseInt(id.trim(), 10));
          assignedHousing(eligibleHousingIdsArray);
        } else {
          setOfferHousing([]);
        }

        setData(response.data.data);
        setFormData((prevData) => ({
          ...prevData,
          // NumDiscounts: response.data.data.NumDiscounts,
          // DiscountPercentage: response.data.data.DiscountPercentage,
          // NumTicketsRequired: response.data.data.NumTicketsRequired,
          // expirationDate: response.data.data.DateExpired,
          // Status: response.data.data.HousingOption,
          Status: 2,
          internalNotes: response.data.data.invitationData.InternalNotes,
          selectedHousingIds: response.data.data.invitationData.EligibleHousingIDs
            ? response.data.data.invitationData.EligibleHousingIDs.split(',').map(id => id.trim())
            : [],
        }));

      } else {
        setData(response.data.data);
      }

      setEventData(response.data.data.invitationData.Event);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching housing data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && userId && eventId && invitationId) {
      getInvitationDetails(invitationId);
    }


  }, [userId, eventId, invitationId]);


  useEffect(() => {
    if (data?.invitationData?.AccommodationType) {
      setStartDate(data.invitationData?.ArrivalDate);
      setEndDate(data.invitationData?.DepartureDate);
    }
  }, [data?.invitationData?.AccommodationType]);

  const [housingDetailsContent, setHousingDetailsContent] = useState(null);
  const [modalLoading, setModalLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState(false);

  // When any dependency changes, load housing details
  useEffect(() => {
    if (!isOpenModal) return;

    setModalLoading(true);

    const timer = setTimeout(() => {
      let content = null;
      // console.log(' formData.Status', formData.Status);

      if (formData.Status === 2) {
        content = (
          <RentHouseDetails
            eventId={eventId}
            status={formData.Status}
            userId={userId}
            onSelectionChange={handleSelectionChange}
            comesData={formData}
            arrivalDate={startDate}
            departureDate={endDate}
          />
        );
      } else if (formData.Status === 1) {
        content = (
          <StayAtOwnHomeDetails
            eventId={eventId}
            status={formData.Status}
            onSelectionChange={handleSelectionChange}
            comesData={formData}
            userId={userId}
          />
        );
      } else if (formData.Status === 3) {
        content = <NoHousingDetails />;
      }

      setHousingDetailsContent(content);
      setModalLoading(false);
    }, 300); // simulate slight delay

    return () => clearTimeout(timer);
  }, [formData.Status, eventId, userId, startDate, endDate, isOpenModal]);



  // const renderHousingDetails = async () => {

  //   if (formData.Status == 2) {
  //     return <RentHouseDetails eventId={eventId && eventId} status={formData.Status} userId={userId && userId} onSelectionChange={handleSelectionChange} comesData={formData} arrivalDate={startDate} departureDate={endDate} />;
  //   } else if (formData.Status == 1) {
  //     return <StayAtOwnHomeDetails eventId={eventId && eventId} status={formData.Status} onSelectionChange={handleSelectionChange} comesData={formData} userId={userId} />;
  //   } else if (formData.Status == 3) {
  //     return <NoHousingDetails />;
  //   } else {
  //     return null;
  //   }

  // };


  const handleOpenClosedModal = () => {
    setIsOpenModal((prevState) => !prevState);
  };

  const [validated, setValidated] = useState(false);
  const [formError, setFormError] = useState('');


  const handleInputChange = async (event) => {
    const { name, value } = event.target;

    if (name === 'NumTicketsRequired' || name === 'Status') {
      setFormError(''); // Clear the form error if those fields are changed
    }

    // Update the form data only for the changed key
    setFormData((prevData) => ({
      ...prevData,  // Spread the previous form data
      [name]: value, // Update only the changed key (name)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;

    if (!formData.Status) {
      setFormError('Please choose any housing option.');
      return;
    }

    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    // Create FormData from form and convert to plain object
    const formDataObj = new FormData(form);
    const formCreate = Object.fromEntries(formDataObj.entries());

    const selectedBedroom = housingIds.selectedHousingIds?.bedroom;

    if (!selectedBedroom) {
      setFormError('Please choose any housing option.');
      return;
    }

    setIsLoading(true);

    try {
      // Append required fields
      formDataObj.append('selectedHousingIds', selectedBedroom);
      formDataObj.append('key', 'eligibleHousing');
      formDataObj.append('eventId', eventId);
      formDataObj.append('userId', userId);
      formDataObj.append('ArrivalDate', startDate);
      formDataObj.append('DepartureDate', endDate);
      // new tickets required key
      formDataObj.append('required_tickets', ticketRequired)



      const res = await axios.post('/api/v1/housings/', formDataObj);

      const msg = res?.data?.message || 'Something happened';

      if (res.data.success) {
        Swal.fire({
          title: "Success",
          text: msg,
          icon: "success",
          customClass: {
            popup: "add-tckt-dtlpop",
          },
        });
        setFormError("");
        handleOpenClosedModal();
        getInvitationDetails(invitationId);
      } else {
        Swal.fire({
          title: "Oops!",
          text: msg,
          icon: "error",
          customClass: {
            popup: "add-tckt-dtlpop",
          },
        });
      }
    } catch (err) {
      console.error("Submission error:", err);
      Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again.",
        icon: "error",
        customClass: {
          popup: "add-tckt-dtlpop",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };


  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   event.stopPropagation();

  //   if (!formData.Status) {
  //     setFormError('Please choose any housing option.');
  //     return;
  //   }

  //   if (event.currentTarget.checkValidity() === false) {
  //     setValidated(true);
  //     console.log("formData.Status")
  //     return;
  //   }

  //   // if (!formData.NumTicketsRequired && formData.Status == 2) {
  //   //   setFormError('Please select tickets required.');
  //   //   return;
  //   // }

  //   const form = event.currentTarget;
  //   const formDataObj = new FormData(form);
  //   // Convert FormData to an object
  //   const formCreate = Object.fromEntries(formDataObj.entries());
  //   console.log(formCreate);
  //   if (formCreate) {
  //     if (formCreate) {
  //       setIsLoading(true)
  //       const selectedBedroom = housingIds.selectedHousingIds?.bedroom;
  //       if (!selectedBedroom) {
  //         setFormError('Please choose any housing option.');
  //         setIsLoading(false);
  //         return;
  //       }
  //       // console.log('selectedBedroom',housingIds.selectedHousingIds);return
  //       // console.log("selectedBedroom", selectedBedroom)
  //       if (!selectedBedroom || (formData.selectedHousingIds && formData.selectedHousingIds.length === 0)) {
  //         // setIsValidSelection(false);
  //         // return false;
  //       }
  //       formDataObj.append('selectedHousingIds', selectedBedroom || "");
  //       // formDataObj.append('numberOfTicketRequired', formData.NumTicketsRequired || "");
  //     }

  //     formDataObj.append('key', 'eligibleHousing');
  //     formDataObj.append('eventId', eventId);
  //     formDataObj.append('userId', userId);
  //     formDataObj.append('ArrivalDate', startDate);
  //     formDataObj.append('DepartureDate', endDate);

  //     await axios.post('/api/v1/housings/', formDataObj)
  //       .then((res) => {
  //         const msg = res.data.message;
  //         if (res.data.success) {
  //           Swal.fire({
  //             title: "Success",
  //             text: msg,
  //             icon: "success"
  //           });
  //           setIsLoading(false)
  //           setFormError("");
  //           handleOpenClosedModal();
  //           getInvitationDetails(invitationId);
  //         } else {
  //           Swal.fire({
  //             title: "Oops!",
  //             text: msg,
  //             icon: "error"
  //           });
  //           setIsLoading(false)
  //         }
  //       }).catch((err) => {
  //         console.log("message", err)
  //         setIsLoading(false)
  //       });
  //   } else {
  //     setIsValidSelection(false);
  //     console.log("object")
  //     return false;
  //   }
  // }

  const housingOptions = [
    { index: 2, description: "Member will rent a house through Ondalinda" },
    { index: 1, description: "Member is a guest in a house that's already rented" },
    // { index: 2, description: "Member will stay in a house that's already rented." },
    // { index: 3, description: "Member requires no housing." },
    { index: 3, description: "Member will stay as guest." },
    { index: 4, description: "Member already has housing" },

  ];

  if (loading) {
    return (
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
    );
  }

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




  return (
    <div
      className="container"
      style={{ paddingTop: "10px", paddingBottom: "40px" }}
    >
      <table border="0" cellSpacing="0">
        <tbody>
          <tr>
            <td>
              <h1>Event Invitation</h1>
            </td>
            {/* <td>
              <a
                href="/administrator/events/invitations.htm?event=106&amp;rtn=%2Fadministrator%2Fevents%2F"
                className="backbutton"
              ></a>
            </td> */}
          </tr>
        </tbody>
      </table>

      <div className="row" style={{ margin: "0px -10px 0px -10px" }}>
        <div
          className="col-12 col-sm-4 col-md-3 col-xl-2"
          style={{ padding: "10px 10px 20px 10px" }}
        >
          <div
            style={{
              height: "100%",
              backgroundImage:
                "linear-gradient(to bottom, #e0e0e0, #e0e0e0, #ffffff)",
              backgroundSize: "cover",
              padding: "10px",
            }}
          >
            <div className="row">
              <div className="col-6 col-sm-12">
                <div
                  style={{
                    backgroundImage: `url(${process.env.NEXT_PUBLIC_S3_URL}/profiles/${data && data.invitationData.User.ImageURL
                      })`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    paddingTop: "100%",
                  }}
                ></div>
              </div>
              <div className="col-6 col-sm-12">
                <div style={{ marginTop: "8px" }}>
                  <a href="#" onClick={() => handleShowLightbox(data)}>
                    {data && data.invitationData.User.FirstName},{" "}
                    {data && data.invitationData.User.LastName}
                  </a>
                </div>
                {/* <div className="subinfo1">{data && data.EventInvitation.User.FirstName}, {data && data.EventInvitation.User.LastName}</div> */}
                <div className="subinfo2">
                  Level:{" "}
                  {data && data.invitationData.User.MembershipTypes
                    ? data.invitationData.User.MembershipTypes
                    : "Standard"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="col-12 col-sm-8 col-md-9 col-xl-10"
          style={{ padding: "10px 10px 20px 10px" }}
        >
          <div className="row">
            <div className="col-12 col-md-6">
              <div
                className="font-sp2"
                style={{
                  borderBottom: "1px solid #9f9f9f",
                  paddingBottom: "6px",
                }}
              >
                Invitation Information
              </div>
              <div style={{ marginTop: "8px" }}>
                Invitation ID: {data && data.invitationData.id}
              </div>
              <div style={{ marginTop: "6px" }}>
                Event: {data && data.invitationData.Event.Name}
              </div>
              <div style={{ marginTop: "6px" }}>
                Registration Enabled:{" "}
                <Moment format="DD-MMM-YYYY" utc>
                  {data && data.invitationData.User.updatedAt}
                </Moment>
              </div>
              <div style={{ marginTop: "6px" }}>
                Registered:{" "}
                <Moment format="DD-MMM-YYYY" utc>
                  {data && data.invitationData.User.createdAt}
                </Moment>{" "}
              </div>
              <div style={{ marginTop: "6px" }}>
                Status:{" "}
                <span>
                  {data?.invitationData?.accommodation_status || "N/A"}
                </span>
              </div>
            </div>
            <div className="col-12 col-md-6 pt-4 pt-md-0">
              <div
                className="font-sp2"
                style={{
                  borderBottom: "1px solid #9f9f9f",
                  paddingBottom: "6px",
                }}
              >
                Housing
              </div>
              {(data?.invitationData?.accommodation_status === "Booked" || data?.invitationData?.Status == 2) && (

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {data.getPropertyInfo.map((value, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "16px",
                        // boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        // backgroundColor: "#fff",
                        marginTop: "8px"
                      }}
                    >
                      <div style={{ marginBottom: "8px", }}>
                        <strong>🏠 Booked Housing:</strong>{" "}
                        {value.Housing?.Name || "N/A"}
                      </div>

                      <div style={{ marginBottom: "4px" }}>
                        <strong>👥 Minimum Occupancy:</strong>{" "}
                        {value.Housing?.NumBedrooms || "N/A"}
                      </div>

                      <div style={{ marginBottom: "4px" }}>
                        <strong>👤 Maximum Occupancy:</strong>{" "}
                        {value.Housing?.MaxOccupancy || "N/A"}
                      </div>

                      <div style={{ marginBottom: "4px" }}>
                        <strong>📅 Booking Date:</strong>{" "}
                        {value.MyOrder?.createdAt
                          ? moment.utc(value.MyOrder.createdAt).format("DD-MMM-YYYY")
                          : "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {offerHousing && offerHousing.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <h5 style={{ fontWeight: "600", marginBottom: "12px" }}>Housing Offered</h5>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    {offerHousing.map((housing) => (
                      <div
                        key={housing.ID}
                        style={{
                          width: "100%",
                          maxWidth: "500px", // Adjust width as needed
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "12px 16px",
                          backgroundColor: "#fafafa",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div>
                          <div style={{  fontWeight: "500" }}>
                            {housing.Name}, {housing.HousingNeighborhood.name}
                          </div>
                          <div style={{ color: "#555", marginTop: "4px" }}>
                            Bedrooms: {housing.NumBedrooms}, Max Occupancy: {housing.MaxOccupancy}
                          </div>
                        </div>
                        <i
                          className="fa fa-trash"
                          title="Remove Housing"
                          style={{
                            color: "#dc3545",
                            cursor: "pointer",
                            fontSize: "18px"
                          }}
                          onClick={() => handleDeleteHousing(housing.ID)}
                        ></i>
                      </div>
                    ))}
                  </div>
                </div>
              )}




            </div>
          </div>

        </div>
      </div>

      {/* {!(data && data.invitationData.Status == 2 && data.invitationData.accommodation_status == "Booked") && ( */}
      {/*  {!(data && data.invitationData.accommodation_status == "Booked") && (*/}
      <div className="row" style={{ marginTop: "10px", display: "flex" }}>
        <div
          className="col-6 col-md-2 d-none d-md-block"
          style={{ paddingTop: "10px" }}
        ></div>
        <div className="col-6 col-md-4" style={{ paddingTop: "10px" }}>
          <button
            type="button"
            className="btn btn-primary submit"
            onClick={() => handleOpenClosedModal()}
          >
            Edit Registration
          </button>
        </div>
        <div
          className="col-6 col-md-2 d-none d-md-block"
          style={{ paddingTop: "10px" }}
        ></div>
      </div>
      {/*  )} */}


      {/* Modal  */}
      <Modal
        className="evt-rgst-vw "
        size="lg"
        show={isOpenModal}
        onHide={handleOpenClosedModal}
        aria-labelledby="example-modal-sizes-title-sm"
      >
        <Modal.Header>
          <Modal.Title className="fw-bold">Edit Event Housing Availability</Modal.Title>

          <Button
            variant=""
            className="btn btn-close ms-auto"
            onClick={handleOpenClosedModal}
          >
            x
          </Button>
        </Modal.Header>

        <Modal.Body>
          {modalLoading ? (
            <div
              style={{
                minHeight: "200px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="modl-innr">
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="gy-3">

                  {/* {(!data.invitationData?.ArrivalDate && !data.invitationData?.DepartureDate ) && ( */}

                  {/* {(!data.invitationData?.AccommodationType) && (
                  <> */}

                  <Col md={12}>
                    <Row>
                      <Col md={6} className="mt-2">
                        <label>From </label>{" "}
                        <div className="dt-pikr-inpt">
                          <input
                            type="date"
                            value={startDate || data.invitationData?.ArrivalDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            // min={arrivalMinDate}
                            max={arrivalMaxDate}
                          />
                        </div>
                      </Col>
                      <Col md={6} className="mt-2">
                        <label>To </label>{" "}
                        <div className="dt-pikr-inpt">
                          <input
                            type="date"
                            value={endDate || data.invitationData?.DepartureDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            // min={startDate || arrivalMinDate}
                            min={departureMinDate}
                          // max={departureMaxDate}
                          />
                        </div>
                      </Col>

                      {/* {data?.invitationData?.AccommodationType ? */}
                      <Col md={6} className="mt-2" >
                        <label>Minimum Ticket Required</label>{" "}
                        <div className="dt-pikr-inpt">
                          <input
                            type="number"
                            style={{
                              height: 40,
                              fontSize: 16,
                              lineHeight: '40px',
                              width: '100%',
                              background: '#efe8de',
                              border: '1px solid #6f7271',
                              padding: '10px'
                            }}
                            value={ticketRequired}
                            onChange={(e) => {
                              const input = e.target.value;

                              // If input is empty (Backspace case), allow it
                              if (input === "") {
                                setTicketRequired("");
                                return;
                              }

                              const value = Number(input);

                              // Only allow numbers between 1 and 10
                              if (value >= 0 && value <= 10) {
                                setTicketRequired(value);
                              } else if (value > 10) {
                                setTicketRequired(10);
                              } else if (value < 0) {
                                setTicketRequired(0);
                              }
                            }}
                          />
                        </div>




                        {/*  <label>Minimum Ticket Required</label>{" "}
                          <div className="dt-pikr-inpt">
                            <input
                              type="number"
                              style={{
                                height: 40,
                                fontSize: 16,
                                lineHeight: '40px',
                                width: '50%',
                                background: '#efe8de',
                                border: '1px solid #6f7271',
                                padding: '10px'
                              }}
                              value={ticketRequired}
                              onChange={(e) => {
                                // Ensure value stays between 1 and 10
                                let value = Number(e.target.value);
                                if (value < 0)
                                if (value > 10) value = 10;
                                setTicketRequired(value);
                              }}
                            />

                          </div> */}
                      </Col>



                    </Row>
                  </Col>
                  {/* </>
                )} */}


                  {/* Member will rent a house. content start */}
                  <Col md={12}>
                    <CFormLabel>
                      Eligible Housing:<span className="text-danger">*</span>
                    </CFormLabel>

                    <div className="elig-hsing-dtls">
                      {modalLoading ? (
                        <div
                          style={{
                            minHeight: "150px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Spinner animation="border" variant="primary" />
                        </div>
                      ) : (
                        housingDetailsContent
                      )}
                    </div>
                  </Col>



                  <Col md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Internal Notes:
                    </CFormLabel>
                    <textarea
                      className="form-control"
                      placeholder="Textarea"
                      rows="3"
                      name="internalNotes"
                      value={formData?.internalNotes || ""}
                      onChange={handleInputChange}
                    >
                    </textarea>
                  </Col>

                  {/* {!isValidSelection && (
                  <div className="col-12">
                    <p className="text-danger">Please select at least one housing option.</p>
                  </div>
                )} */}
                  <Col md={12}>
                    {formError && (
                      <div className="text-danger mt-2 center">
                        {formError}
                      </div>
                    )}
                  </Col>
                  <Col md={6}>
                    <Button
                      className="btn btn-primary rounded-pill w-100"
                      variant=""
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                    {/* <Button
                    variant=""
                    type="submit"
                    className="btn btn-primary rounded-pill w-100"
                  >
                    Submit
                  </Button> */}
                  </Col>

                  <Col md={6}>
                    <Button
                      variant=""
                      onClick={handleOpenClosedModal}
                      className="btn btn-outline-dark rounded-pill w-100"
                    >
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div >
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

RegistrationView.layout = "Contentlayout";
export default RegistrationView;
