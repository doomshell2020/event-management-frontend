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
import Switch from "@mui/material/Switch";
import Link from "next/link";
import axios from "axios";
import Image from 'next/image';
import { useRouter } from "next/router";
import {
    CForm,
    CCol,
    CFormLabel,
    CFormInput,
    CButton,
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";
import Moment from "react-moment";
import moment from "moment-timezone";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from "date-fns";
import HtmlEditor, { getHtmlEditorContent } from "@/pages/components/HtmlEditor/HtmlEditor";


const EventAdd = () => {
    //DefaultValidation
    const [lgShow, setLgShow] = useState(false);
    const [editShow, setEditShow] = useState(false);
    const [descriptionShow, setDescriptionShow] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const noteRef = useRef();
    const [editorContent, setEditorData] = useState({ content: "" });

    const router = useRouter();
    const { id } = router.query;
    const [event_id, setEvent_id] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);

    // console.log("idd", id)
    const [formData, setFormData] = useState({
        key: "add_ticket",
        // eventId: null,
        ticketType: "",
        name: "",
        sortName: "",
        price: "",
        quantity: null,
        startDate: "",
        endDate: "",
        time: "",
        useDate: "",
        location: "",
        dressCode: "",
        ticketImage: null,
        ticketOrder: null,
    });

    useEffect(() => {
        if (id) {
            // setFormData((prev) => ({
            //   ...prev,
            //   // eventId: id,
            // }));
            setEvent_id(id);
            fetchTicketAddon(id);
        }
    }, [id]); // Update when id changes

    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ticketAddon, setTicketAddon] = useState([]);
    const [validatedCustom, setValidatedCustom] = useState(false);
    const [error, setError] = useState("");

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


    // Route Change
    let navigate = useRouter();

    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    // Function to format date correctly
    const formatRange = (start, end) => {
        if (!start) return "";
        if (!end || start.getTime() === end.getTime()) {
            return format(start, "EEE, MMMM d, yyyy").toUpperCase();
        }
        return `${format(start, "EEE")}-${format(end, "EEE")}, ${format(start, "MMMM d")}-${format(end, "d, yyyy")}`.toUpperCase();
    };

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

    const [editorError, setEditorError] = useState("");
    // Form Submit
    const handleSubmitForm = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        const content = getHtmlEditorContent(noteRef);

        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setValidatedCustom(true);
            setIsLoading(false);

        } else {
            setIsLoading(true);
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key == "ticketImage" && value) {
                    formDataToSend.append(key, value);
                } else {
                    formDataToSend.append(key, value);
                }
            });
            formDataToSend.append('eventId', event_id);
            formDataToSend.append("description", content.trim());

            const addEventTicket = "/api/v1/event-tickets";
            try {
                const response = await axios.post(addEventTicket, formDataToSend, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                const msg = response.data.message;

                if (response.data.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Event Ticket Created!", // Dynamic event name in title
                        text: msg, // Descriptive message
                        confirmButtonText: "Great! Let's go!", // Custom confirmation button text
                        customClass: { popup: "add-tckt-dtlpop" }
                    });
                    fetchTicketAddon(id);
                    setFormData("");
                    // window.location.reload();
                    // navigate.push(`/admin/events/add-2step?id=${id}`);
                    setIsLoading(false);
                    setLgShow(false);

                } else {
                    // console.log("Error: ", response.data.error);
                    setIsLoading(false);
                    Swal.fire({
                        icon: "error",
                        title: "Error!",
                        text: response.data.error,
                        confirmButtonText: "OK",
                        customClass: { popup: "add-tckt-dtlpop" }
                    });
                }
            } catch (error) {
                console.error("Error during submission", error);
                setIsLoading(false);
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: error.message,
                    confirmButtonText: "OK",
                    customClass: { popup: "add-tckt-dtlpop" }
                });
            } finally {
                setIsLoading(false);
            }
        }
        setValidatedCustom(true); // Set form as validated
    };

    // Add Image from add Ticket and addons
    const handleImageUpload = (files) => {
        const fileList = Array.from(files);
        fileList.forEach(async (file) => {
            await uploadImageToServer(file);
        });
    };

    // Add Image From Edit Ticket and addons
    const handleImageUpdate = (files) => {
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

    const fetchTicketAddon = async (id) => {
        // console.log("id", id)
        try {
            const response = await axios.get(`/api/v1/event-tickets?eventId=${id}`);
            const data = response.data.data;
            setTicketAddon(data);
            setLoading(false);
        } catch (err) {
            const message = err.response ? err.response.data.message : "";
            setError(message);
        }
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

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
                customClass: { popup: "add-tckt-dtlpop" }
            });

            if (result.isConfirmed) {
                // Show processing popup
                Swal.fire({
                    title: "Processing...",
                    text: "Please wait while we delete the Ticket.",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: { popup: "add-tckt-dtlpop" },
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
                        customClass: { popup: "add-tckt-dtlpop" }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // window.location.reload();
                            fetchTicketAddon(event_id);
                        }
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Deletion Failed",
                        customClass: { popup: "add-tckt-dtlpop" },
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
                customClass: { popup: "add-tckt-dtlpop" }
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
                    fetchTicketAddon(event_id); // Fetch the updated data

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
                customClass: { popup: "add-tckt-dtlpop" }
            });

            if (result.isConfirmed) {
                // Show processing popup
                Swal.fire({
                    title: "Processing...",
                    text: "Please wait while we update the status.",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: { popup: "add-tckt-dtlpop" },
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
                        customClass: { popup: "add-tckt-dtlpop" },
                        text:
                            updateResponse.data.message ||
                            "The status has been successfully updated.",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            fetchTicketAddon(event_id); // Fetch the updated data
                        }
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Status Update Failed",
                        customClass: { popup: "add-tckt-dtlpop" },
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

    // View Description in popup
    const [name, setName] = useState({});
    const [description, setDescription] = useState({});

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

    return (
        <div>
            <Seo title={"Ticket Types"} />

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
                            Add
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>
            {/* <!-- /breadcrumb --> */}

            {/* <!--Row--> */}
            <div className="row">
                <Col lg={12} md={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between">
                            <h3 className="card-title">Ticket Types</h3>
                            <Button
                                onClick={() => setLgShow(true)}
                                className="btn ripple btn-info d-flex align-items-center btn-sm"
                                variant=""
                            >
                                <i className="si si-plus me-2"></i>Add Ticket
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-sm-3 p-2">
                            <div className="add-event-progress-bar">
                                <ul className="progress-br-head mx-auto">
                                    <li>
                                        {" "}
                                        <Link href={`/admin/events/edit/${id}`}>
                                            {" "}
                                            <span> Create Event</span>
                                        </Link>{" "}
                                        {/* <Link href="/admin/events/add"> Create Event</Link>{" "} */}
                                    </li>
                                    <li className="active">
                                        {" "}
                                        <Link href={`/admin/events/edit/ticket-types/${id}`}>
                                            {" "}
                                            <span> Tickets</span>
                                        </Link>{" "}
                                    </li>
                                    <li>
                                        {" "}
                                        <Link href={`/admin/events/edit/publish-event/${id}`}>
                                            <span>Publish Event</span>
                                        </Link>{" "}
                                    </li>
                                </ul>
                            </div>

                            <div className="add-tct-dtaStp2">

                                <Table className="table table-bordered responsive-table mg-b-0 ">
                                    <thead>
                                        <tr>
                                            <th >Image</th>
                                            <th> Type</th>
                                            <th> Price</th>
                                            <th> Quantity</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Location</th>
                                            <th> Ticket Use Date</th>
                                            <th>Time</th>
                                            {/* <th >Description</th> */}
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
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
                                                                        : "/imagenot/default.jpg"
                                                                }
                                                                alt={list.name || "Default Profile"}
                                                                style={{
                                                                    height: "50px",
                                                                    width: "50px",
                                                                    borderRadius: "10px",
                                                                    objectFit: "cover",
                                                                }}
                                                            />
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
                                                    <td>{list.ticketType}</td>
                                                    {/* <td>€{list.price}</td> */}
                                                    <td>
                                                        {list.currency ? list.currency : "N/A"} {list.price}
                                                    </td>
                                                    <td>{list.count ? list.count : "N/A"}</td>
                                                    {/* <td>10:00</td> */}
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
                                                    <td>{list.location ? list.location : "N/A"}</td>
                                                    <td>{list.useDate ? list.useDate : "N/A"}</td>
                                                    <td>{list.time ? list.time : "N/A"}</td>
                                                    {/* <td style={{ width: "22%", whiteSpace: "normal" }}
                      dangerouslySetInnerHTML={{ __html: list.description }} /> */}
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
                                        href={`/admin/events/edit?id=${id}`}
                                    >
                                        <CButton className="w-100" color="warning me-4">
                                            Previous
                                        </CButton>
                                    </Link>

                                    <Link
                                        className=" w-50 "
                                        href={`/admin/events/add-3step?id=${id}`}
                                    >
                                        <CButton color="primary" className=" w-100 " type="submit">
                                            Next
                                        </CButton>
                                    </Link>
                                </CCol>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </div>

            <Modal
                size="lg"
                className="ad-tckt-mdls"
                show={lgShow}
                aria-labelledby="example-modal-sizes-title-sm"
            >
                <Modal.Header>
                    <Modal.Title>Add Ticket</Modal.Title>
                    <Button
                        variant=""
                        className="btn btn-close ms-auto"
                        onClick={() => setLgShow(false)}
                    >
                        x
                    </Button>
                </Modal.Header>

                <Modal.Body>
                    <CForm
                        className="row g-3 needs-validation"
                        noValidate
                        validated={validatedCustom}
                        onSubmit={handleSubmitForm}
                    >
                        <CCol md={6}>
                            <CFormLabel htmlFor="ticketType">
                                Ticket Type<span style={{ color: "Red" }}>*</span>
                            </CFormLabel>
                            <select
                                name="ticketType"
                                className="form-control"
                                id="ticketType"
                                required
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
                            <CFormLabel htmlFor="ticketType2">
                                Ticket Display Order<span style={{ color: "Red" }}>*</span>
                            </CFormLabel>
                            <select
                                name="ticketType"
                                id="ticketType2"
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
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option>
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
                            <CFormLabel htmlFor="Sortname">Ticket Sort Name</CFormLabel>
                            <CFormInput
                                type="text"
                                id="Sortname"
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
                                min={new Date().toISOString().slice(0, 16)}
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
                                            useDate: update
                                                ? formatRange(update[0], update[1])
                                                : "", // Update formData.useDate
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
                // required
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

                            <HtmlEditor
                                editorRef={noteRef}
                                initialContent={editorContent.content}
                                onChange={(content) => setEditorData({ ...editorContent, content })}
                            />

                        </CCol>

                        <CCol lg={6} className="d-flex justify-content-between">
                            <CButton color="warning  me-2 w-50" onClick={() => setLgShow(false)}>
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
                            <CFormLabel htmlFor="ticketType11">
                                Ticket Type
                                {/* <span style={{ color: "Red" }}>*</span> */}
                            </CFormLabel>
                            <select
                                name="ticketType"
                                id="ticketType11"
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
                            <CFormLabel htmlFor="ticketType2">
                                Ticket Display Order<span style={{ color: "Red" }}>*</span>
                            </CFormLabel>
                            <select
                                name="ticketType"
                                id="ticketType2"
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
                            <CFormLabel htmlFor="sortname">Ticket Sort Name</CFormLabel>
                            <CFormInput
                                type="text"
                                id="sortname"
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
                                // required
                                min="0"
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
                                    width={100}
                                    height={100}
                                />
                            ) : (
                                <Image
                                    src="/imagenot/default.jpg" // Default image if no image is available
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
                            {/* Display editor error message */}
                            <HtmlEditor
                                editorRef={noteRef}
                                initialContent={editorContent.content}
                                onChange={(content) => setEditorData({ ...editorContent, content })}
                            />
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
            {/* <!--/Row--> */}
        </div>
    );
};

EventAdd.propTypes = {};

EventAdd.defaultProps = {};

EventAdd.layout = "Contentlayout";

export default EventAdd;
