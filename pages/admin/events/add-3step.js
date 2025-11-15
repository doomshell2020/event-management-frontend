import React, { useState, useEffect, useRef } from "react";
import {
  Breadcrumb,
  Button,
  Modal,
  Card,
  Table,
  Col,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { CCol, CButton, CForm, CFormLabel, CFormInput } from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import Cart from "./cart";
import Swal from "sweetalert2";
import Switch from "@mui/material/Switch";
import SummernoteLite from "react-summernote-lite";
import "react-summernote-lite/dist/summernote-lite.min.css";
import Image from 'next/image';
import Moment from "react-moment";
import moment from "moment-timezone";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from "date-fns";
const PublishEvent = () => {
  const noteRef = useRef();
  const [lgShow, setLgShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ticketAddon, setTicketAddon] = useState([]);
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [formData, setFormData] = useState({
    key: "add_ticket",
    eventId: null,
    // eventId: 148,
    ticketType: "",
    name: "",
    sortName: "",
    price: "",
    quantity: "",
    startDate: "",
    endDate: "",
    time: "",
    useDate: "",
    location: "",
    dressCode: "",
    ticketImage: null,
    ticketOrder: null,
  });
  const router = useRouter();
  const { id } = router.query;
  const [bookShow, setBookShow] = useState(false);
  const handleBookShow = async () => {
    setBookShow(true);
  };
  useEffect(() => {
    if (id) {
      fetchTicketAddon();
      fetchEventDetails();
    }
  }, [id]);
  const fetchTicketAddon = async () => {
    // console.log("id", id)
    try {
      const response = await axios.get(`/api/v1/event-tickets?eventId=${id}`);
      const data = response.data.data;
      setTicketAddon(data);
      setIsLoading(false);
    } catch (err) {
      const message = err.response ? err.response.data.message : "";
      setError(message);
    }
  };

  // View Event details
  const EventsURL = `/api/v1/events?key=event_details&id=${id}`;
  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(EventsURL);
      const { data } = response;
      if (data && data.data) {
        // setEventDetails(data.data.eventDetails);
        // setAddonsDetailsArray(data.data.addonCountResults);
        // console.log('data.data.eventDetails',data.data.eventDetails);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);

      console.error("Failed to fetch event details:", error);
    }
  };

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  // Function to format the date correctly for display
  const formatRangeUpdate = (start, end) => {
    if (!start) return "";
    if (!end || start.getTime() === end.getTime()) {
      return format(start, "EEE, MMMM d, yyyy").toUpperCase();
    }
    return `${format(start, "EEE")}-${format(end, "EEE")}, ${format(
      start,
      "MMMM d"
    )}-${format(end, "d, yyyy")}`.toUpperCase();
  };

  // Function to parse the existing `useDate` value from fetched data
  const parseCustomDateRange = (dateStr) => {
    if (!dateStr) return [null, null];

    // Format: "FRI, JULY 25, 2025" (Single date case)
    const singleDateMatch = dateStr.match(/(\w+), (\w+) (\d+), (\d+)/);
    if (singleDateMatch) {
      const [, , month, day, year] = singleDateMatch;
      const date = new Date(`${month} ${day}, ${year}`);
      return [date, date]; // Single date ke liye start & end same
    }

    // Format: "MON-FRI, MARCH 3-7, 2025" (Range case)
    const match = dateStr.match(/(\w+)-(\w+), (\w+) (\d+)-(\d+), (\d+)/);
    if (match) {
      const [, , , month, startDate, endDate, year] = match;
      const start = new Date(`${month} ${startDate}, ${year}`);
      const end = new Date(`${month} ${endDate}, ${year}`);
      return [start, end];
    }

    return [null, null]; // Default case
  };

  let viewDemoShow = (modal) => {
    switch (modal) {
      case "lgShow":
        setLgShow(true);
        break;
    }
  };
  let viewDemoClose = (modal) => {
    switch (modal) {
      case "lgShow":
        setLgShow(false);
        break;
    }
  };

  // Permanently deleted
  const DeleteEvent = async () => {
    try {
      // Show confirmation dialog to the user
      const result = await Swal.fire({
        title: "Confirm Delete",
        text: "This Event will be permanently deleted. Proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Delete",
      });
      if (result.isConfirmed) {
        // Show processing popup
        Swal.fire({
          title: "Processing...",
          text: "Please wait while we delete the Ticket.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const deleteApiUrl = "/api/v1/event-tickets";
        const body = new FormData();
        body.append("key", "Event_Deleted");
        body.append("eventId", id);
        const delete_response = await axios.post(deleteApiUrl, body);
        Swal.close(); // Close the processing popup after response
        if (delete_response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Ticket Deleted",
            text: delete_response.data.message,
          }).then((result) => {
            if (result.isConfirmed) {
              // window.location.reload();
              fetchTicketAddon();
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Deletion Failed",
            text: delete_response.data.message || "Failed to delete ticket.",
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

  // Publish Event
  const PublishEvent = async () => {
    try {
      // Show confirmation dialog to the user
      const result = await Swal.fire({
        title: "Confirm Publish",
        text: "Are you sure you want to publish this event? Once published, it will be visible to everyone.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Publish",
      });
      if (result.isConfirmed) {
        // Show processing popup
        Swal.fire({
          title: "Processing...",
          text: "Please wait while we publish the event.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const publishApiUrl = "/api/v1/event-tickets";
        const body = new FormData();
        body.append("key", "publish_event");
        body.append("eventId", id);
        const publish_response = await axios.post(publishApiUrl, body);
        Swal.close(); // Close the processing popup after response
        if (publish_response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Event Published",
            text:
              publish_response.data.message ||
              "The event has been successfully published.",
          }).then((result) => {
            if (result.isConfirmed) {
              // window.location.reload();
              fetchTicketAddon();
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Publishing Failed",
            text:
              publish_response.data.message || "Failed to publish the event.",
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

  const [descriptionShow, setDescriptionShow] = useState(false);

  // View Description in popup
  const [name, setName] = useState({});
  const [description, setDescription] = useState({});
  const [isClient, setIsClient] = useState(false);

  const descriptionView = async (id, ticketType) => {
    try {
      setDescriptionShow(true);
      const body = new FormData();
      body.append("key", "View_ticket_details");
      body.append("ticket_id", id);
      body.append("ticketType", ticketType);
      const response = await axios.post(`/api/v1/event-tickets`, body);
      if (response.data.success) {
        const fetchedData = response.data.data;
        // console.log("------", fetchedData.name);
        setName(fetchedData.name);
        setDescription(fetchedData.description);
      } else {
        console.log("error", response.data.message);
      }
      // const data = response.data.data;
    } catch {
      console.log("error");
    }
  };
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [editorError, setEditorError] = useState("");
  useEffect(() => {
    setIsClient(true);
  }, []);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only PNG, JPG, and JPEG files are allowed.");
        setSelectedImage(null); // Clear selected image preview
        setFormData({ ...formData, ticketImage: null }); // Clear the ticketImage field
        return;
      }
      setError("");
      setSelectedImage(file);
      setFormData({ ...formData, ticketImage: file });
    }
  };
  // Deleted Addons And Tickets
  const DeleteTicketAddon = async (id, ticketType) => {
    try {
      // Show confirmation dialog to the user
      const result = await Swal.fire({
        title: "Confirm Delete",
        text: "This ticket will be permanently deleted. Proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Delete",
      });

      if (result.isConfirmed) {
        // Show processing popup
        Swal.fire({
          title: "Processing...",
          text: "Please wait while we delete the Ticket.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const deleteApiUrl = "/api/v1/event-tickets";
        const body = new FormData();
        body.append("key", "ticketAddonDeleted");
        body.append("id", id);
        body.append("ticketType", ticketType);
        // const body = {
        //   id: id,
        //   ticketType: ticketType
        // }
        const delete_response = await axios.post(deleteApiUrl, body);

        Swal.close(); // Close the processing popup after response
        if (delete_response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Ticket Deleted",
            text: delete_response.data.message,
          }).then((result) => {
            if (result.isConfirmed) {
              // window.location.reload();
              fetchTicketAddon();
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Deletion Failed",
            text: delete_response.data.message || "Failed to delete ticket.",
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
  const [ticketName, setTicketName] = useState({});
  const [ticketTypes, setTicketTypes] = useState({});
  const [ticketId, setTicketId] = useState({});

  // Data  View in  modal popup for edit
  const TicketAddonData = async (id, ticketType) => {
    try {
      setEditShow(true);
      const body = new FormData();
      body.append("key", "View_ticket_details");
      body.append("ticket_id", id);
      body.append("ticketType", ticketType);
      const response = await axios.post(`/api/v1/event-tickets`, body);
      if (response.data.success) {
        const fetchedData = response.data.data;
        // console.log("fetchedData", fetchedData);
        setTicketName(response.data.data.name);
        setTicketId(response.data.data.id);
        setTicketTypes(response.data.data.ticketType);

        setFormData((prevState) => ({
          ...prevState,
          // eventId: fetchedData.id || null,
          ticketType: fetchedData.ticketType || "",
          name: fetchedData.name || "",
          sortName: fetchedData.sortName || "",
          price: fetchedData.price || "",
          quantity: fetchedData.count || "",
          // startDate: fetchedData.startDate || "",
          startDate: fetchedData.startDate
            ? moment(fetchedData.startDate)
              .tz(fetchedData.startDate)
              .format("YYYY-MM-DDTHH:mm")
            : "",
          // endDate: fetchedData.endDate || "",
          endDate: fetchedData.endDate
            ? moment(fetchedData.endDate)
              .tz(fetchedData.endDate)
              .format("YYYY-MM-DDTHH:mm")
            : "",
          time: fetchedData.time || "",
          useDate: fetchedData.useDate || "",
          location: fetchedData.location || "",
          dressCode: fetchedData.dressCode || "",
          time: fetchedData.time || "",
          ticketOrder: fetchedData.ticketOrder || "",
          ticketImage: fetchedData.image || ""
        }));

        const parsedDates = parseCustomDateRange(fetchedData.useDate);
        setDateRange(parsedDates);
        // Set the description in SummernoteLite editor
        if (noteRef.current) {
          noteRef.current.summernote("code", fetchedData.description || "");
        }
      } else {
        console.log("error", response.data.message);
      }
      // const data = response.data.data;
    } catch {
      console.log("error");
    }
  };

  // update ticket and addon data
  const handleUpdateTicketAddon = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();

    const editorContent = noteRef.current.summernote("code").trim();
    const isEditorContentEmpty =
      !editorContent || editorContent === "<p><br></p>" || editorContent === "";

    // if (form.checkValidity() === false || isEditorContentEmpty) {
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidatedCustom(true);
      setIsLoading(false);

      // Set error message for editor
      // if (isEditorContentEmpty) {
      //   setEditorError("Ticket Description is required.");
      // } else {
      //   setEditorError(""); // Clear the error if the editor content is valid
      // }
      // return;
    } else {
      setIsLoading(true);

      // Dynamically update the 'key' in the formData and ticketType
      const updatedFormData = { ...formData };
      // updatedFormData.key = "update_TicketAddon";
      updatedFormData.ticketType = ticketTypes;

      // Create a new FormData object for submission
      const formDataToSend = new FormData();

      Object.entries(updatedFormData).forEach(([key, value]) => {
        if (key === "ticketImage" && value) {
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, value);
        }
      });

      // Add the description from the summernote editor
      const textContent = noteRef.current.summernote("code");
      formDataToSend.append("description", textContent.trim());
      // Add the ticketId to formData
      formDataToSend.append("id", ticketId);
      // Define the API endpoint
      const addEventTicket = "/api/v1/event-tickets";
      try {
        const response = await axios.put(addEventTicket, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const msg = response.data.update_data.message;
        if (response.data.update_data.success) {
          Swal.fire({
            icon: "success",
            title: "Event Ticket Updated!", // Update title based on dynamic context
            text: msg, // Descriptive message
            confirmButtonText: "Okay", // Custom confirmation button text
          });

          setEditShow(false);
          fetchTicketAddon(); // Fetch the updated data

          // Reset form and hide modal
          setFormData("");
          setIsLoading(false);
          setLgShow(false);
        } else {
          console.log("Error: ", response.data.error);
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: response.data.error,
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Error during submission", error);
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.message, // Use error.message for dynamic error details
          confirmButtonText: "OK",
        });
      } finally {
        setIsLoading(false);
      }
    }
    setValidatedCustom(true); // Set form as validated
  };

  const handleImageUpload = (files) => {
    const fileList = Array.from(files);
    fileList.forEach(async (file) => {
      await uploadImageToServer(file);
    });
  };

  const uploadImageToServer = async (file) => {
    try {
      setIsLoading(true);
      const body = new FormData();
      const apiurl = `/api/v1/cms/`;
      body.append("image", file);
      const response = await axios.post(apiurl, body);
      const imageUrl = `/uploads/profiles/${response.data}`;
      noteRef.current.summernote("insertImage", imageUrl);
    } catch (err) {
      const message = err.response ? err.response.data.message : "";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // change status for ticket and addons
  const handleStatusToggle = async (ticket_id, ticketType) => {
    try {
      // Show confirmation dialog to the user
      const result = await Swal.fire({
        title: "Confirm Status Change",
        text: `Are you sure you want to change the status of this ${ticketType}`,
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

        const updateStatusApiUrl = "/api/v1/event-tickets";
        const body = new FormData();
        body.append("key", "update_status");
        body.append("id", ticket_id);
        body.append("ticketType", ticketType);

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
              fetchTicketAddon();
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
    <div>
      <Seo title={"Publish Events"} />

      {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Event Manager
          </span>
        </div>
        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              Events
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              add
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {/* <!-- /breadcrumb --> */}

      {/* <!--Row--> */}
      <div className="row">
        <Col lg={12} md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between flex-wrap">
              <h3 className="card-title">Add Event</h3>
              <div className="evt-tct-3rdstp">
                <Button
                  className="btn ripple btn-info me-2 btn-sm mb-2"
                  variant=""
                  onClick={handleBookShow}
                >
                  <i className="bi bi-eye pe-2"></i>Preview Event
                </Button>

                <Button
                  className="btn ripple btn-warning me-2 btn-sm mb-2"
                  variant=""
                  onClick={() => PublishEvent()}
                >
                  <i className="far fa-arrow-alt-circle-up pe-2"></i>Publish Event
                </Button>

                <Button
                  className="btn ripple btn-danger btn-sm mb-2"
                  variant=""
                  onClick={() => DeleteEvent()}
                >
                  <i className="bi bi-trash pe-2"></i>Delete Event
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-sm-3 p-2">
              <div className="add-event-progress-bar">
                <ul className="progress-br-head mx-auto">
                  <li>
                    <Link href={`/admin/events/edit?id=${id}`}>
                      {" "}
                      <span> Create Event</span>
                    </Link>
                    {/* <Link href="/admin/events/add"> Create Event</Link> */}
                  </li>
                  <li>
                    <Link href={`/admin/events/add-2step?id=${id}`}>
                      {" "}
                      <span>Tickets</span>
                    </Link>
                  </li>
                  <li className="active">
                    <Link href={`/admin/events/add-3step?id=${id}`}>
                      <span>Publish Event</span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="add-tct-dtaStp3">
                <Table className="table table-bordered responsive-table mg-b-0">
                  <thead>
                    <tr>
                      <th style={{ width: "20%" }}>Image</th>
                      {/* <th>Name</th> */}
                      <th style={{ width: "5%" }}>type</th>
                      <th style={{ width: "5%" }}>Price</th>
                      <th style={{ width: "5%" }}>Quantity</th>
                      <th style={{ width: "12%" }}>Start Date</th>
                      <th style={{ width: "12%" }}>End Date</th>
                      <th style={{ width: "16%" }}>Location</th>
                      <th style={{ width: "10%" }}> Ticket Use Date</th>
                      <th style={{ width: "5%" }}>Time</th>
                      {/* <th style={{ width: "22%" }}>Description</th> */}
                      <th style={{ width: "10%" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="9">
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
                        </td>
                      </tr>
                    ) : (
                      ticketAddon.map((list, index) => (
                        <tr key={index}>
                          <td>
                            {/* <div className="tct-1st-td">
                              <img
                                // src={`/uploads/profiles/${list.image}`}
                                src={list.image ? `/uploads/profiles/${list.image}` : '/imagenot/default.jpg'}
                              />
                            </div> */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <img
                                src={
                                  list.image
                                    ? `/uploads/profiles/${list.image}`
                                    : "/imagenot/no-image-icon-1.png"
                                }
                                alt={list.name || "Default Profile"}
                                style={{
                                  height: "50px",
                                  width: "50px",
                                  borderRadius: "10px",
                                  objectFit: "cover",
                                }}
                              />
                              {/* <span>{list.name ? list.name : "N/A"}</span> */}
                              <span
                                onClick={() =>
                                  descriptionView(list.id, list.ticketType)
                                }
                                style={{ cursor: "pointer" }}
                              >
                                {list.name ? list.name : "N/A"}
                              </span>
                            </div>
                          </td>
                          {/* <td>{list.name}</td> */}
                          <td>{list.ticketType}</td>
                          <td>
                            {list.currency ? list.currency : "N/A"} {list.price}
                          </td>
                          <td>{list.count ? list.count : "N/A"}</td>
                          {/* <td>{list.startDate}</td> */}
                          <td>
                            {" "}
                            <Moment format="DD-MMM-YYYY">
                              {list.startDate}
                            </Moment>
                          </td>
                          <td>
                            {" "}
                            <Moment format="DD-MMM-YYYY">{list.endDate}</Moment>
                          </td>
                          {/* <td>{list.endDate}</td> */}
                          <td>{list.location ? list.location : "N/A"}</td>
                          <td>{list.useDate ? list.useDate : "N/A"}</td>
                          <td>{list.time ? list.time : "N/A"}</td>
                          {/* <td style={{ width: "22%", whiteSpace: "normal" }}
                            dangerouslySetInnerHTML={{ __html: list.description }}
                          /> */}

                          <td style={{ width: "10%" }}>
                            <div className="ad-tct-btns align-items-center">
                              <Switch
                                Title="Active"
                                checked={list.status === "Y"} // Set initial state based on status
                                onChange={() => {
                                  handleStatusToggle(list.id, list.ticketType); // Handle additional functionality
                                }}
                              />
                              <button
                                variant=""
                                className="btn w-100 btn-sm mx-2"
                                style={{
                                  background: "#068f78",
                                  color: "white",
                                  flex: "1 1 calc(50% - 0.25rem)",
                                  margin: "0 0",
                                }}
                                type="button"
                                // onClick={() => setEditShow(true)}
                                onClick={() =>
                                  TicketAddonData(list.id, list.ticketType)
                                }
                              >
                                <i className="bi bi-pencil-square "></i>
                              </button>
                              <button
                                variant=""
                                className="btn btn-danger btn-sm "
                                type="button"
                                style={{
                                  flex: "1 1 calc(50% - 0.25rem)",
                                  margin: "0 0",
                                }}
                                onClick={() =>
                                  DeleteTicketAddon(list.id, list.ticketType)
                                }
                              >
                                <i className="bi bi-trash "></i>
                              </button>
                            </div>
                          </td>

                          {/* <td style={{ width: "10%" }}>
                            <div className="ad-tct-btns">
                              <button
                                variant=""
                                className="btn w-100 btn-sm me-2 mb-2"
                                style={{
                                  background: "#845adf",
                                  color: "white",
                                  flex: "1 1 calc(50% - 0.25rem)",
                                  margin: "0 0",
                                }}
                                type="button"
                              >
                                <i className="bi bi-pencil-square "></i>
                              </button>

                              <button
                                variant=""
                                className="btn btn-danger btn-sm mb-2 "
                                type="button"
                                style={{
                                  flex: "1 1 calc(50% - 0.25rem)",
                                  margin: "0 0",
                                }}

                              // onClick={(event) => handleEditClick(event, contact)}
                              >
                                <i className="bi bi-trash "></i>
                              </button>
                            </div>
                            <div className="ad-tct-btns">
                              <button
                                variant=""
                                className="btn btn-sm btn-primary me-2"
                                type="button"
                                style={{
                                  flex: "1 1 calc(50% - 0.25rem)",
                                  margin: "0 0",
                                }}
                              >
                                <i className="bi bi-eye "></i>
                              </button>

                              <button
                                variant=""
                                onClick={() => viewDemoShow("lgShow")}
                                className="btn   btn-info btn-sm "
                                type="button"
                                style={{
                                  flex: "1 1 calc(50% - 0.25rem)",
                                  margin: "0 0",
                                }}

                              // onClick={(event) => handleEditClick(event, contact)}
                              >
                                <i className="fa fa-cog "></i>
                              </button>
                            </div>
                          </td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
              <Row className="mt-4 mb-2">
                <CCol md={4} className="d-flex justify-content-between">
                  <Link
                    className="w-50 me-2"
                    href={`/admin/events/add-2step?id=${id}`}
                  >
                    <CButton className="w-100" color="warning me-4">
                      Previous
                    </CButton>
                  </Link>

                  <Link className="w-50" href={`/admin/events`}>
                    <CButton className="w-100" color="primary" type="submit">
                      Submit
                    </CButton>
                  </Link>
                </CCol>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </div>

      {bookShow && (
        <Cart isActiveNow={bookShow} makeModalOff={setBookShow} event_id={id} />
      )}

      {/* second popup */}
      <div className="add-tickt-mdl">
        <Modal
          size="lg"
          className="ad-tckt-mdls"
          show={lgShow}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          <Modal.Header>
            <Modal.Title>Ticket Details</Modal.Title>
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
          <Modal.Body>Design here.....</Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                viewDemoClose("lgShow");
              }}
            >
              Submit
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                viewDemoClose("lgShow");
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* Description Modal popup */}
      <Modal
        size="lg"
        className="ad-tckt-mdls"
        show={descriptionShow}
        aria-labelledby="example-modal-sizes-title-sm"
      >
        <Modal.Header>
          {/* <Modal.Title>Edit Ticket({ticketName ? ticketName : "N/A"})</Modal.Title> */}
          <Modal.Title>
            Description :- ({name && typeof name === "string" ? name : "N/A"})
          </Modal.Title>
          <Button
            variant=""
            className="btn btn-close ms-auto"
            // onClick={() => setEditShow(false)}
            onClick={() => setDescriptionShow(false)}
          >
            x
          </Button>
        </Modal.Header>
        <Modal.Body>
          <p dangerouslySetInnerHTML={{ __html: description }}></p>
          {/* {description} */}
        </Modal.Body>
      </Modal>

      {/* Edit Modal popup */}
      <Modal
        size="lg"
        className="ad-tckt-mdls"
        show={editShow}
        aria-labelledby="example-modal-sizes-title-sm"
      >
        <Modal.Header>
          {/* <Modal.Title>Edit Ticket({ticketName ? ticketName : "N/A"})</Modal.Title> */}
          <Modal.Title>
            Edit Ticket(
            {ticketName && typeof ticketName === "string" ? ticketName : "N/A"})
          </Modal.Title>

          <Button
            variant=""
            className="btn btn-close ms-auto"
            // onClick={() => setEditShow(false)}
            onClick={() => {
              setEditShow(false);
              setFormData("");
            }}
          >
            x
          </Button>
        </Modal.Header>
        <Modal.Body>
          <CForm
            className="row g-3 needs-validation"
            noValidate
            validated={validatedCustom}
            onSubmit={handleUpdateTicketAddon}
          >
            <CCol md={6}>
              <CFormLabel htmlFor="ticketType">
                Ticket Type
                {/* <span style={{ color: "Red" }}>*</span> */}
              </CFormLabel>
              <select
                name="ticketType"
                className="form-control"
                required
                disabled
                value={formData.ticketType}
                onChange={(e) =>
                  setFormData({ ...formData, ticketType: e.target.value })
                }
              >
                <option value="">--Select--</option>
                <option value="ticket">Ticket</option>
                <option value="addon">Addon</option>
                <option value="special">Addon-Other</option>
              </select>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="ticketType">
                Ticket Display Order<span style={{ color: "Red" }}>*</span>
              </CFormLabel>
              <select
                name="ticketType"
                className="form-control"
                required
                value={formData.ticketOrder}
                onChange={(e) =>
                  setFormData({ ...formData, ticketOrder: e.target.value })
                }
              >
                <option value="">--Select--</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="name">
                Ticket Name<span style={{ color: "Red" }}>*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                id="name"
                placeholder="Ticket Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="name">Ticket Sort Name</CFormLabel>
              <CFormInput
                type="text"
                id="name"
                placeholder="Ticket Name"
                // required
                value={formData.sortName}
                onChange={(e) =>
                  setFormData({ ...formData, sortName: e.target.value })
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="price">
                Ticket Price <span style={{ color: "Red" }}>*</span>
              </CFormLabel>
              <CFormInput
                type="number"
                id="price"
                placeholder="Ticket Price"
                required
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="quantity">Quantity</CFormLabel>
              <CFormInput
                type="number"
                id="quantity"
                placeholder="Quantity"
                min="0"
                // required
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="startDate">
                Ticket Sale Start Date <span style={{ color: "Red" }}>*</span>
              </CFormLabel>
              <CFormInput
                type="datetime-local"
                id="startDate"
                required
                value={formData.startDate}
                // min={new Date().toISOString().slice(0, 16)}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="endDate">
                Ticket Sale End Date <span style={{ color: "Red" }}>*</span>
              </CFormLabel>
              <CFormInput
                type="datetime-local"
                id="endDate"
                required
                value={formData.endDate}
                min={
                  formData.startDate || new Date().toISOString().slice(0, 16)
                }
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="time">Time</CFormLabel>
              <CFormInput
                type="text"
                id="time"
                placeholder="Time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </CCol>


            <CCol md={6}>
              <CFormLabel htmlFor="useDate">Ticket Use Date</CFormLabel>
              <div style={{ width: '129%' }}>
                <DatePicker
                  id="useDate"
                  selected={startDate}
                  // onChange={(update) => setDateRange(update)}
                  onChange={(update) => {
                    setDateRange(update);
                    setFormData((prev) => ({
                      ...prev,
                      useDate: update ? formatRangeUpdate(update[0], update[1]) : "",
                    }));
                  }}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  placeholderText="mm/dd/yyyy - mm/dd/yyyy"
                  className="form-control"
                  style={{ width: '100%', paddingRight: '30px' }}
                  showIcon
                  icon={
                    <div style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6c757d'
                    }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                  }
                />
              </div>
              {formData.useDate && (
                <p style={{ marginTop: "5px" }}>
                  <strong>Selected Range: {formData.useDate}</strong>
                </p>
              )}
            </CCol>




            {/* <CCol md={6}>
              <CFormLabel htmlFor="useDate">Ticket Use Date</CFormLabel>
              <CFormInput
                type="text"
                id="useDate"
                value={formData.useDate}
                onChange={(e) =>
                  setFormData({ ...formData, useDate: e.target.value })
                }
              />
            </CCol> */}









            <CCol md={6}>
              <CFormLabel htmlFor="location">Location </CFormLabel>
              <CFormInput
                type="text"
                id="location"
                placeholder="Location"
                // required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="dressCode">Dress Code</CFormLabel>
              <CFormInput
                type="text"
                id="dressCode"
                placeholder="Dress Code"
                value={formData.dressCode}
                onChange={(e) =>
                  setFormData({ ...formData, dressCode: e.target.value })
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="ticketImage">Ticket Image </CFormLabel>
              <CFormInput
                type="file"
                id="ticketImage"
                // required
                accept=".png, .jpg, .jpeg"
                onChange={handleFileChange} // Use the validation function
              />
              {selectedImage ? (
                <Image
                  src={URL.createObjectURL(selectedImage)} // Preview selected image
                  alt="Selected Image"
                  style={{ marginTop: "10px", objectFit: "cover", borderRadius: "10px" }}
                  width={80}
                  height={80}
                />
              ) : formData.ticketImage ? (
                <Image
                  src={`/uploads/profiles/${formData.ticketImage}`} // Show image if already exists
                  alt="Ticket Image"
                  style={{ marginTop: "10px", objectFit: "cover", borderRadius: "10px" }}
                  width={80}
                  height={80}
                />
              ) : (
                <Image
                  src="/imagenot/no-image-icon-1.png" // Default image if no image is available
                  alt="Image Not Found"
                  style={{ marginTop: "10px", objectFit: "cover", borderRadius: "10px" }}
                  width={80}
                  height={80}
                />
              )}
              {error && (
                <p
                  className="text-danger mt-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  {error}
                </p>
              )}
            </CCol>

            <CCol md={12}>
              <b>Ticket Description</b>
              <span style={{ color: "Red" }}>*</span>
              <br />
              {/* Display editor error message */}
              {editorError && (
                <p
                  style={{
                    color: "red",
                    marginTop: "5px",
                    marginBottom: "5px",
                  }}
                >
                  {editorError}
                </p>
              )}
              {isClient ? (
                <div className="mt-2">
                  <SummernoteLite
                    ref={noteRef}
                    placeholder={"Write something here..."}
                    tabsize={2}
                    lang="zh-CN" // only if you want to change the default language
                    height={20 || "20vh"}
                    dialogsInBody={true}
                    blockquoteBreakingLevel={0}
                    toolbar={[
                      ["style", ["style"]],
                      [
                        "font",
                        [
                          "bold",
                          "underline",
                          "clear",
                          "strikethrough",
                          "superscript",
                          "subscript",
                        ],
                      ],
                      ["fontsize", ["fontsize"]],
                      ["fontname", ["fontname"]],
                      ["color", ["color"]],
                      ["para", ["ul", "ol", "paragraph"]],
                      ["table", ["table"]],
                      ["insert", ["link", "picture", "video", "hr"]],
                      ["view", ["fullscreen", "codeview", "help"]],
                    ]}
                    fontNames={[
                      "Arial",
                      "Georgia",
                      "Verdana",
                      "Didot-Ragular", // Include Didot-Regular font
                      "Didot-Italic",
                      "Satoshi",
                      "Satoshi-Bold",
                      "Satoshi-Italic",
                      "Satoshi-Light",
                      // Add other similar font names if necessary
                    ]}
                    fontNamesIgnoreCheck={[
                      "Arial",
                      "Georgia",
                      "Verdana",
                      "Didot-Ragular", // Include Didot-Regular font
                      "Didot-Italic",
                      "Satoshi",
                      "Satoshi-Bold",
                      "Satoshi-Italic",
                      "Satoshi-Light",
                      // Add other similar font names if necessary
                    ]}
                    fontSizes={[
                      "8",
                      "9",
                      "10",
                      "11",
                      "12",
                      "14",
                      "16",
                      "18",
                      "20",
                      "22",
                      "24",
                      "28",
                      "32",
                      "36",
                      "40",
                      "44",
                      "48",
                      "54",
                      "60",
                      "66",
                      "72",
                      "78",
                      "80",
                      "82",
                      "84",
                      "86",
                      "92",
                      "98",
                      "100",
                      "102",
                      "106",
                      "108",
                      "110",
                      "116",
                      "120",
                    ]}
                    onChange={(content) => setData({ ...data, content })}
                    callbacks={{
                      onImageUpload: handleImageUpload,
                    }}
                  />
                </div>
              ) : (
                ""
              )}
            </CCol>

            <CCol lg={6} className="d-flex justify-content-between">
              <CButton color="warning me-2 w-50" onClick={() => setEditShow(false)}>
                Close
              </CButton>
              <CButton color="primary" className="w-50" type="submit" disabled={isLoading}>
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
              </CButton>
            </CCol>
          </CForm>
        </Modal.Body>
      </Modal>

      {/* <!--/Row--> */}
    </div>
  );
};

PublishEvent.propTypes = {};

PublishEvent.defaultProps = {};

PublishEvent.layout = "Contentlayout";

export default PublishEvent;
