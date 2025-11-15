// new page design
import React, { useState, useEffect, useRef } from "react";
import axios from "axios"
import { Breadcrumb, Card, Spinner, Col, Row } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from 'next/router';
import SummernoteLite from "react-summernote-lite";
// import 'react-summernote-lite/dist/esm/dist/summernote-lite.min.css';
import "react-summernote-lite/dist/summernote-lite.min.css";
import Image from 'next/image';
import {
    CForm,
    CCol,
    CFormLabel,
    CFormInput,
    CButton,
    CFormSelect,
    CFormFeedback
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";

const CareyeshousingAdd = () => {
    //DefaultValidation
    const [isClient, setIsClient] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [ImageURL, setImageURL] = useState(null);
    const [neighborhood, setNeighborhood] = useState("");
    const [type, setType] = useState("");
    const [numBedrooms, setNumBedrooms] = useState(0);
    const [pool, setPool] = useState("");
    const [maxOccupancy, setMaxOccupancy] = useState(0);
    const [location, setLocation] = useState("");
    const [googleMap, setGoogleMap] = useState("");
    const [managerName, setManagerName] = useState("");
    const [managerEmail, setManagerEmail] = useState("");
    const [managerMobile, setManagerMobile] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [ownerEmail, setOwnerEmail] = useState("");
    const [ownerMobile, setOwnerMobile] = useState("");
    const [bedrooms, setBedrooms] = useState([]); // Array of bedrooms
    const [bedroomTypes, setBedroomTypes] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [housingTypes, setHousingTypes] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [emailError, setEmailError] = useState("");
    const [error, setError] = useState("");
    const [bookingStatus, setBookingStatus] = useState("N");
    const [bookNowError, setBookNowError] = useState('');

    // Route Change
    let navigate = useRouter();
    // const routeChange = () => {
    //     let path = `/admin/careyeshousing`;
    //     navigate.push(path);
    // }

    const [emailTouched, setEmailTouched] = useState(false);
    const [ownerEmailTouched, setOwnerEmailTouched] = useState(false);

    // Manager Email Validation
    const validateEmail = (email) => {
        if (!email) {
            setEmailError(emailTouched ? "" : "");
            setManagerEmail("")
            return false;
        }
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            setEmailError("Invalid email format!");
            return false;
        }
        setEmailError("");
        return true;
    };
    // Owner Email Validation
    const validateOwnerEmail = (email) => {
        if (!email) {
            setError(emailTouched ? "" : "");
            setOwnerEmail("")
            return false;
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            setError("Invalid email format!");
            return false;
        }

        setError("");
        return true;
    };

    const [errorMessage, setErrorMessage] = useState(""); // State for error message
    // Function to calculate max occupancy
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        const maxSize = 20 * 1024 * 1024; // 20 MB in bytes
        if (file) {
            if (!allowedTypes.includes(file.type)) {
                setErrorMessage("Only PNG, JPG, and JPEG files are allowed.");
                e.target.value = ""; // Reset file input
                return;
            }
            if (file.size > maxSize) {
                // alert("The selected image exceeds the maximum size of 20 MB.");
                Swal.fire({
                    icon: "error",
                    title: "Oops!",
                    text: 'The selected image exceeds the maximum size of 20 MB.',
                });
                e.target.value = ""; // Reset file input
                setErrorMessage("Image size exceeds 20 MB.");
                return;
            }

            setErrorMessage(""); // Clear any error
            setImageURL(file);
        }
    };

    const getMaxOccupancy = (bedroomCount) => {
        return bedroomCount * 2; // 1 bedroom = 2 occupancy, 2 = 4, etc.
    };

    // Function to handle changes in the number of bedrooms
    const handleNumBedroomsChange = (e) => {
        const num = parseInt(e.target.value, 10);
        setNumBedrooms(num);
        // Initialize bedrooms array based on the selected number of bedrooms
        const newBedrooms = [];
        for (let i = 1; i <= num; i++) {
            newBedrooms.push({
                bedroom_number: i,
                beds: [{ bed_number: 1, bed_type: "2" }], // Default: 1 bed per bedroom
            });
        }
        setBedrooms(newBedrooms);
        //  Max Occupancy  Select base on num of bedrooms
        if (num) {
            const autoOccupancy = getMaxOccupancy(Number(num));
            setMaxOccupancy(autoOccupancy.toString());
        } else {
            setMaxOccupancy("");
        }
    };

    // Function to handle changes in the number of beds for a specific bedroom
    const handleNumBedsChange = (bedroomIndex, numBeds) => {
        const updatedBedrooms = [...bedrooms];
        const beds = updatedBedrooms[bedroomIndex].beds;
        // Add or remove beds based on the selected number
        if (numBeds > beds.length) {
            for (let i = beds.length; i < numBeds; i++) {
                beds.push({ bed_number: i + 1, bed_type: "" });
            }
        } else {
            updatedBedrooms[bedroomIndex].beds = beds.slice(0, numBeds);
        }

        setBedrooms(updatedBedrooms);
    };

    // Function to handle changes in bed type for a specific bed
    const handleBedTypeChange = (bedroomIndex, bedIndex, bedType) => {
        const updatedBedrooms = [...bedrooms];
        updatedBedrooms[bedroomIndex].beds[bedIndex].bed_type = bedType;
        setBedrooms(updatedBedrooms);
    };

    // get bedroom types
    const getBedroomTypes = async () => {
        try {
            const ApiUrl = '/api/v1/housings-new/';
            const body = new FormData();
            body.append("key", "getHousingBedTypes")
            const response = await axios.post(ApiUrl, body)
            const data = response.data;
            if (data.success) {
                setBedroomTypes(data.data)
            } else {
                console.log("errr")
            }

        } catch (error) {
            console.log(error)
        }
    }
    // get Neighborhood housing
    const getNeighborhood = async () => {
        try {
            const ApiUrl = '/api/v1/housings-new/';
            const body = new FormData();
            body.append("key", "getHousingNeighborhood")
            const response = await axios.post(ApiUrl, body)
            const data = response.data;
            if (data.success) {
                setNeighborhoods(data.data)
            } else {
                console.log("errr")
            }

        } catch (error) {
            console.log(error)
        }
    }
    // get Housing Types
    const getHousingTypes = async () => {
        try {
            const ApiUrl = '/api/v1/housings-new/';
            const body = new FormData();
            body.append("key", "get_housingTypes")
            const response = await axios.post(ApiUrl, body)
            const data = response.data;
            if (data.success) {
                setHousingTypes(data.data)
            } else {
                console.log("errr")
            }

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (neighborhood) {
            // Use a different variable name (e.g., `item`) to avoid conflict with the state variable `neighborhood`
            const selectedNeighborhoodData = neighborhoods.find(item => item.id == parseInt(neighborhood));
            if (selectedNeighborhoodData) {
                setLocation(selectedNeighborhoodData.location);
            }
        } else {
            setLocation('');
        }
    }, [neighborhood, neighborhoods]);

    // View Amenities
    const ViewAmenities = async () => {
        try {
            const ApiUrl = '/api/v1/housings-new/';
            const body = new FormData();
            body.append("key", "amenities")
            const response = await axios.post(ApiUrl, body)
            const data = response.data;
            if (data.success) {
                setAmenities(data.data)
            } else {
                console.log("errr")
            }

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getBedroomTypes();
        getNeighborhood();
        getHousingTypes();
        ViewAmenities();
        setIsClient(true)
    }, [])

    const [selectedAmenities, setSelectedAmenities] = useState([]);

    // Checkbox click handler
    const handleCheckboxChange = (id) => {
        setSelectedAmenities((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };
    const noteRef = useRef();
    const amenitiesRef = useRef();
    const adminNotesRef = useRef();
    const bookNowRef = useRef();
    const termsAndConditionsRef = useRef();
    const [validateDefault, setValidateDefault] = useState(false);

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        setIsLoading(true);
        const textContent = noteRef.current.summernote('code');
        const adminNotesContent = adminNotesRef.current.summernote('code');
        const termsContent = termsAndConditionsRef.current.summernote('code');
        if (form.checkValidity() == false || error == "Invalid email format!" || emailError == "Invalid email format!") {
            event.preventDefault();
            event.stopPropagation();
            setIsLoading(false);
        } else {
            event.preventDefault();
            // const bookNowContent = bookNowRef.current.summernote('code');
            // setIsLoading(false);
            // const housingAddUrl = '/api/v1/housings-new/';
            const housingAddUrl = '/api/v2/housings-neww/';
            const body = new FormData();
            // body.append("key", "addHousing");
            body.append("Name", name.trim());
            body.append("Neighborhood", neighborhood)
            body.append("Type", type)
            body.append("MaxOccupancy", maxOccupancy),
            body.append("NumBedrooms", numBedrooms),
            body.append("Pool", pool)
            body.append("ImageURL", ImageURL),
            body.append("ManagerName", managerName),
            body.append("ManagerEmail", managerEmail),
            body.append("ManagerMobile", managerMobile),
            body.append("OwnerName", ownerName),
            body.append("OwnerEmail", ownerEmail),
            body.append("OwnerMobile", ownerMobile),
            body.append('google_map', googleMap),
            body.append("Description", textContent.trim());
            // body.append("booking_notes", bookNowContent.trim());
            if (bookingStatus == "Y") {
                const bookNowContent = bookNowRef.current.summernote('code');
                if (bookNowContent == "<p><br></p>") {
                    setBookNowError("Book Now Description cannot be empty!");
                    setIsLoading(false);
                    return; // prevent form submission
                } else {
                    setBookNowError(""); // clear previous error
                    body.append("booking_notes", bookNowContent);
                }
            }
            body.append("amenities", selectedAmenities);
            body.append("admin_notes", adminNotesContent.trim());
            body.append("terms_and_conditions", termsContent.trim());
            body.append('location', location),
            body.append('bookingStatus', bookingStatus);
            body.append('bedrooms', JSON.stringify(bedrooms));
            await axios.post(housingAddUrl, body)
                .then((res) => {
                    if (res.data.success) {
                        setIsLoading(false);
                        const msg = res.data.message;
                        // localStorage.setItem("staticAdded", msg);
                        // navigate.push('/admin/careyeshousingsss/');
                        // routeChange();
                    } else {
                        console.log("error")
                        setIsLoading(false);
                    }
                }).catch((err) => {
                    console.log(err)
                    setIsLoading(false);
                    // const message = err.response.data.message
                    // setError(message);
                });
        }
        setValidateDefault(true);
    };

    return (
        <div>
            <Seo title={"Careyes Housing Add"} />

            {/* <!-- breadcrumb --> */}
            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">
                        Careyes Housing Manager
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
                            Careyes Housing
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
                        <Card.Header>
                            <h3 className="card-title">Add House</h3>
                        </Card.Header>
                        <Card.Body>
                            <CForm
                                className="row g-3 needs-validation housing-addflow"
                                noValidate
                                validated={validateDefault}
                                onSubmit={handleSubmit}
                            >
                                <CCol md={12}>
                                    <h6><strong>Property Details:</strong></h6>
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">Name of the property<span style={{ color: "Red" }}>*</span></CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        placeholder="Name"
                                        required
                                        value={name}
                                        // onChange={(e) => {
                                        //     setName(e.target.value);
                                        // }}
                                        onChange={(e) => {
                                            let inputValue = e.target.value;
                                            // Remove special characters except spaces
                                            inputValue = inputValue.replace(/[~!@$%^&*()_+=\\|/?`{}[\];:'",.<>\s]/g, ' ');
                                            setName(inputValue);
                                        }}
                                    />
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">
                                        Type<span style={{ color: "Red" }}>*</span>
                                    </CFormLabel>
                                    <div className="AddHsingBd1Inr">
                                        <select name="id" className="form-control"
                                            id="validationDefault01"
                                            required
                                            value={type}
                                            onChange={(e) => {
                                                setType(e.target.value)
                                            }}
                                        >
                                            <option value="">-Select-Type-</option>
                                            {/* <option value="Castle">Castle</option>
                                            <option value="Mega Villa">Mega Villa</option>
                                            <option value="Villa">Villa</option>
                                            <option value="Casitas">Casitas</option>
                                            <option value="Condo Units">Condo Units</option> */}
                                            {housingTypes.map((value, index) => (
                                                <option key={index} value={value.id}>
                                                    {value.name}
                                                </option>
                                            ))}
                                        </select>
                                        <i className="bi bi-chevron-down"></i>
                                    </div>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault04">Neighborhood<span style={{ color: "Red" }}>*</span></CFormLabel>
                                    <div className="AddHsingBd1Inr">
                                        <select name="id" className="form-control"
                                            required
                                            value={neighborhood}
                                            onChange={(e) => {
                                                setNeighborhood(e.target.value);
                                            }}
                                        >
                                            <option value="">-Select-</option>
                                            {neighborhoods.map((value, index) => (
                                                <option key={index} value={value.id}>
                                                    {value.name}
                                                </option>
                                            ))}
                                        </select>
                                        <i className="bi bi-chevron-down"></i>
                                    </div>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">Property type selection</CFormLabel>
                                    <div className="AddHsingBd1Inr">
                                        <select name="id" className="form-control"
                                            id="validationDefault01"
                                            required
                                            value={bookingStatus}
                                            onChange={(e) => {
                                                setBookingStatus(e.target.value)
                                            }}
                                        >
                                            <option value="N">Select the property</option>
                                            <option value="Y">Book Now property</option>
                                        </select>
                                        <i className="bi bi-chevron-down"></i>
                                    </div>
                                </CCol>



                                <CCol md={12}></CCol>

                                {/* Locations */}
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault04">Location</CFormLabel>
                                    <div className="AddHsingBd1Inr">
                                        <select name="id" className="form-control"
                                            id="validationDefault04"
                                            disabled
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        >
                                            <option value="">-Select-Location-</option>
                                            <option value="On-site">On-site</option>
                                            <option value="Off-site">Off-site</option>
                                        </select>
                                        <i className="bi bi-chevron-down"></i>
                                    </div>
                                </CCol>


                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">Google maps</CFormLabel>
                                    <CFormInput
                                        type="url"
                                        id="validationDefault01"
                                        placeholder="Google maps"
                                        value={googleMap}
                                        onChange={(e) => {
                                            setGoogleMap(e.target.value)
                                        }}
                                    />
                                    <CFormFeedback invalid>
                                        Please provide a valid Google map url.
                                    </CFormFeedback>
                                </CCol>


                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">Pool</CFormLabel>
                                    <div className="AddHsingBd1Inr">
                                        <select name="id" className="form-control"
                                            id="validationDefault01"
                                            value={pool}
                                            onChange={(e) => {
                                                setPool(e.target.value)
                                            }}
                                        >
                                            <option value="">-Select-Pool-</option>
                                            <option value="Large Pool">Large Pool</option>
                                            <option value="Small Pool">Small Pool</option>
                                            <option value="Splash Pool">Splash Pool</option>
                                            <option value="Club Pool">Club Pool</option>
                                            <option value="No Pool">No Pool</option>
                                        </select>
                                        <i className="bi bi-chevron-down"></i>
                                    </div>
                                </CCol>



                                {/* hide section start */}
                                {bookingStatus === "N" ? (
                                    <>
                                        <CCol md={12}>
                                            <h6><strong>Bedroom Configuration:</strong></h6>
                                        </CCol>

                                        <CCol md={3}>
                                            <CFormLabel htmlFor="validationDefault04">Number of bedrooms<span style={{ color: "Red" }}>*</span></CFormLabel>
                                            <div className="AddHsingBd1Inr">
                                                <select name="id" className="form-control"
                                                    required
                                                    value={numBedrooms}
                                                    onChange={handleNumBedroomsChange}
                                                >
                                                    <option value="">-Select-</option>
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
                                                    <option value="11">11</option>
                                                    <option value="12">12</option>
                                                    <option value="13">13</option>
                                                    <option value="14">14</option>
                                                    <option value="15">15</option>
                                                    <option value="16">16</option>
                                                    <option value="17">17</option>
                                                    <option value="18">18</option>
                                                    <option value="19">19</option>
                                                    <option value="20">20</option>
                                                </select>
                                                <i className="bi bi-chevron-down"></i>
                                            </div>
                                        </CCol>

                                        <CCol md={9}>
                                            <Row>
                                                {bedrooms.map((bedroom, bedroomIndex) => (

                                                    <Col md={4} key={bedroomIndex}>
                                                        <CFormLabel htmlFor="validationDefault04">
                                                            Bedroom {bedroom.bedroom_number}
                                                        </CFormLabel>

                                                        {/* Number of Beds Dropdown */}
                                                        <div className="AddHsingBd1Inr">
                                                            <select className="form-control"
                                                                value={bedroom.beds.length}
                                                                onChange={(e) =>
                                                                    handleNumBedsChange(bedroomIndex, parseInt(e.target.value, 10))
                                                                }
                                                            >
                                                                <option value="1">1</option>
                                                                <option value="2">2</option>
                                                                <option value="3">3</option>
                                                            </select>
                                                            <i className="bi bi-chevron-down"></i>
                                                        </div>

                                                        {/* Render Bed Fields */}
                                                        {bedroom.beds.map((bed, bedIndex) => (
                                                            <div key={bedIndex} className="AddHsingBd2">
                                                                {/* <label>Bed {bed.bed_number}</label> */}
                                                                <input type="text"
                                                                    value="1"
                                                                />
                                                                <div className="AddHsingBd2Inr">
                                                                    <select
                                                                        required
                                                                        value={bed.bed_type || ""} // Agar bed.bed_type nahi hai to "-Select-" option selected hoga
                                                                        onChange={(e) =>
                                                                            handleBedTypeChange(bedroomIndex, bedIndex, e.target.value)
                                                                        }
                                                                    >
                                                                        <option value="">-Select-</option>
                                                                        {bedroomTypes.map((type, index) => (
                                                                            <option key={index} value={type.id}>
                                                                                {type.name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <i className="bi bi-chevron-down"></i>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </Col>

                                                ))}
                                            </Row>
                                        </CCol>


                                        <CCol md={12}>
                                            <Row>
                                                <Col md={3}>
                                                    <CFormLabel htmlFor="validationDefault04">Max Occupancy<span style={{ color: "Red" }}>*</span></CFormLabel>
                                                    <div className="AddHsingBd1Inr">
                                                        <select name="id" className="form-control"
                                                            required
                                                            disabled
                                                            value={maxOccupancy}
                                                        >
                                                            <option value="">-Select-</option>
                                                            {[...Array(40)].map((_, i) => (
                                                                <option key={i + 1} value={i + 1}>
                                                                    {i + 1}
                                                                </option>
                                                            ))}

                                                        </select>
                                                        <i className="bi bi-chevron-down"></i>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </CCol>

                                    </>
                                ) : (
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationDefault01">Book Now Description</CFormLabel>

                                        {/* Show alert if bookNowError exists */}
                                        {bookNowError && (
                                            <div className="alert alert-danger py-1" role="alert">
                                                {bookNowError}
                                            </div>
                                        )}

                                        {
                                            isClient ?
                                                <div >
                                                    <SummernoteLite
                                                        ref={bookNowRef}
                                                        placeholder={"Write something here..."}
                                                        tabsize={2}
                                                        lang="zh-CN" // only if you want to change the default language
                                                        height={100 || "50vh"}
                                                        dialogsInBody={true}
                                                        blockquoteBreakingLevel={0}
                                                        toolbar={[
                                                            ['style', ['style']],
                                                            ['font', ['bold', 'underline', 'clear', 'strikethrough', 'superscript', 'subscript']],
                                                            ['fontsize', ['fontsize']],
                                                            ['fontname', ['fontname']],
                                                            ['color', ['color']],
                                                            ['para', ['ul', 'ol', 'paragraph']],
                                                            ['table', ['table']],
                                                            // ['insert', ['link', 'video', 'hr']],
                                                            ['view', ['fullscreen', 'codeview', 'help']]
                                                        ]}
                                                        fontNames={[
                                                            'Arial',
                                                            'Georgia',
                                                            'Verdana',
                                                            'Didot-Ragular', // Include Didot-Regular font
                                                            'Didot-Italic',
                                                            'Satoshi',
                                                            'Satoshi-Bold',
                                                            'Satoshi-Italic',
                                                            'Satoshi-Light'
                                                            // Add other similar font names if necessary
                                                        ]}
                                                        fontNamesIgnoreCheck={[
                                                            'Arial',
                                                            'Georgia',
                                                            'Verdana',
                                                            'Didot-Ragular', // Include Didot-Regular font
                                                            'Didot-Italic',
                                                            'Satoshi',
                                                            'Satoshi-Bold',
                                                            'Satoshi-Italic',
                                                            'Satoshi-Light'
                                                            // Add other similar font names if necessary
                                                        ]}
                                                        fontSizes={['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '40', '44', '48', '54', '60', '66', '72']}
                                                        onChange={(content) => setData({ ...data, content })}
                                                    />
                                                </div> : ""}
                                    </CCol>
                                )}

                                <CCol md={12}>
                                    <h6><strong>Contact Details</strong></h6>
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">Owner Name</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        placeholder="Owner Name"
                                        value={ownerName}
                                        onChange={(e) => {
                                            setOwnerName(e.target.value)
                                        }}
                                    />

                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault10">Owner Email</CFormLabel>
                                    <CFormInput
                                        type="email"
                                        id="validationDefault10"
                                        placeholder="Owner Email"
                                        value={ownerEmail}
                                        onChange={(e) => {
                                            setOwnerEmail(e.target.value);
                                            setOwnerEmailTouched(true); // Input touched flag set karein
                                            validateOwnerEmail(e.target.value); // Validate email on change
                                        }}
                                        onBlur={() => {
                                            setOwnerEmailTouched(true);
                                            validateOwnerEmail(ownerEmail);
                                        }}
                                        className={ownerEmailTouched && error ? "is-invalid" : ""}
                                        feedbackInvalid={error}
                                    />
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">Owner Mobile</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        placeholder="Owner Mobile"
                                        value={ownerMobile}
                                        onChange={(e) => setOwnerMobile(e.target.value)}
                                    />

                                </CCol>

                                <CCol md={12}>
                                    {/* {/*   <h5><strong>Manager:</strong></h5> */}
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">Manager Name</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        placeholder="Manager Name"
                                        value={managerName}
                                        onChange={(e) => {
                                            setManagerName(e.target.value)
                                        }}
                                    />

                                </CCol>
                                {/* <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">Manager Email</CFormLabel>
                                    <CFormInput
                                        type="email"
                                        id="validationDefault01"
                                        placeholder="Manager Email"
                                        value={managerEmail}
                                        onChange={(e) => setManagerEmail(e.target.value)}
                                    />
                                </CCol>  */}
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault13">Manager Email</CFormLabel>
                                    <CFormInput
                                        type="email"
                                        placeholder="Manager Email"
                                        htmlFor="validationDefault13"
                                        value={managerEmail}
                                        onChange={(e) => {
                                            setManagerEmail(e.target.value);
                                            setEmailTouched(true); // Input touched flag set karein
                                            validateEmail(e.target.value); // Validate email on change
                                        }}
                                        onBlur={() => {
                                            setEmailTouched(true);
                                            validateEmail(managerEmail);
                                        }}
                                        className={emailTouched && emailError ? "is-invalid" : ""}
                                        feedbackInvalid={emailError}
                                    />
                                </CCol>


                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">Manager Mobile</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        placeholder="Manager Mobile"
                                        value={managerMobile}
                                        onChange={(e) => setManagerMobile(e.target.value)}
                                    />

                                </CCol>
                                <CCol md={12}></CCol>
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault01">Photos</CFormLabel>
                                    {/* <CFormInput
                                        type="file"
                                        id="validationDefault01"
                                        accept=".png, .jpg, .jpeg" // Limit file types
                                        onChange={(e) => {
                                            setImageURL(e.target.files[0]);
                                        }}
                                    /> */}
                                    <CFormInput
                                        type="file"
                                        id="validationDefault01"
                                        accept=".png, .jpg, .jpeg"
                                        onChange={handleFileChange}
                                    />
                                    {errorMessage && <p style={{ color: "red", marginTop: "5px" }}>{errorMessage}</p>}

                                    {ImageURL ? (
                                        <Image
                                            src={URL.createObjectURL(ImageURL)} // Show the current image
                                            alt="Event Image"
                                            style={{ marginTop: "10px", borderRadius: "10px", }}
                                            width={100}
                                            height={100}
                                        />
                                    ) : (
                                        <Image
                                            src="/housingdumy.png" // Default dummy image if no image exists
                                            alt="Image Not Found"
                                            style={{ marginTop: "10px", borderRadius: "10px", }}
                                            width={100}
                                            height={100}
                                        />
                                    )}




                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault01">Description</CFormLabel>
                                    {
                                        isClient ?
                                            <div >
                                                <SummernoteLite
                                                    ref={noteRef}
                                                    placeholder={"Write something here..."}
                                                    tabsize={2}
                                                    lang="zh-CN" // only if you want to change the default language
                                                    height={100 || "50vh"}
                                                    dialogsInBody={true}
                                                    blockquoteBreakingLevel={0}
                                                    toolbar={[
                                                        ['style', ['style']],
                                                        ['font', ['bold', 'underline', 'clear', 'strikethrough', 'superscript', 'subscript']],
                                                        ['fontsize', ['fontsize']],
                                                        ['fontname', ['fontname']],
                                                        ['color', ['color']],
                                                        ['para', ['ul', 'ol', 'paragraph']],
                                                        ['table', ['table']],
                                                        // ['insert', ['link', 'video', 'hr']],
                                                        ['view', ['fullscreen', 'codeview', 'help']]
                                                    ]}
                                                    fontNames={[
                                                        'Arial',
                                                        'Georgia',
                                                        'Verdana',
                                                        'Didot-Ragular', // Include Didot-Regular font
                                                        'Didot-Italic',
                                                        'Satoshi',
                                                        'Satoshi-Bold',
                                                        'Satoshi-Italic',
                                                        'Satoshi-Light'
                                                        // Add other similar font names if necessary
                                                    ]}
                                                    fontNamesIgnoreCheck={[
                                                        'Arial',
                                                        'Georgia',
                                                        'Verdana',
                                                        'Didot-Ragular', // Include Didot-Regular font
                                                        'Didot-Italic',
                                                        'Satoshi',
                                                        'Satoshi-Bold',
                                                        'Satoshi-Italic',
                                                        'Satoshi-Light'
                                                        // Add other similar font names if necessary
                                                    ]}
                                                    fontSizes={['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '40', '44', '48', '54', '60', '66', '72']}
                                                    onChange={(content) => setData({ ...data, content })}
                                                // callbacks={{
                                                //     onImageUpload: handleImageUpload
                                                // }}
                                                />
                                            </div> : ""}

                                </CCol>

                                {/* housing t&c section */}
                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault01">Terms & Conditions</CFormLabel>
                                    {
                                        isClient ?
                                            <div >
                                                <SummernoteLite
                                                    ref={termsAndConditionsRef}
                                                    placeholder={"Write something here..."}
                                                    tabsize={2}
                                                    lang="zh-CN" // only if you want to change the default language
                                                    height={100 || "50vh"}
                                                    dialogsInBody={true}
                                                    blockquoteBreakingLevel={0}
                                                    toolbar={[
                                                        ['style', ['style']],
                                                        ['font', ['bold', 'underline', 'clear', 'strikethrough', 'superscript', 'subscript']],
                                                        ['fontsize', ['fontsize']],
                                                        ['fontname', ['fontname']],
                                                        ['color', ['color']],
                                                        ['para', ['ul', 'ol', 'paragraph']],
                                                        ['table', ['table']],
                                                        // ['insert', ['link', 'video', 'hr']],
                                                        ['view', ['fullscreen', 'codeview', 'help']]
                                                    ]}
                                                    fontNames={[
                                                        'Arial',
                                                        'Georgia',
                                                        'Verdana',
                                                        'Didot-Ragular', // Include Didot-Regular font
                                                        'Didot-Italic',
                                                        'Satoshi',
                                                        'Satoshi-Bold',
                                                        'Satoshi-Italic',
                                                        'Satoshi-Light'
                                                        // Add other similar font names if necessary
                                                    ]}
                                                    fontNamesIgnoreCheck={[
                                                        'Arial',
                                                        'Georgia',
                                                        'Verdana',
                                                        'Didot-Ragular', // Include Didot-Regular font
                                                        'Didot-Italic',
                                                        'Satoshi',
                                                        'Satoshi-Bold',
                                                        'Satoshi-Italic',
                                                        'Satoshi-Light'
                                                        // Add other similar font names if necessary
                                                    ]}
                                                    fontSizes={['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '40', '44', '48', '54', '60', '66', '72']}
                                                    onChange={(content) => setData({ ...data, content })}
                                                />
                                            </div> : ""}
                                </CCol>

                                <CFormLabel className="mt-5" htmlFor="validationDefault01">Amenities</CFormLabel>
                                <Row className="w-100 mt-2">
                                    {Object.entries(amenities).map(([category, items]) => (

                                        <Col md={4} key={category}>
                                            <div style={{ marginLeft: "30px", }}>
                                                <h6 className="fw-bold ">{category}</h6>
                                                {items.map((amenity) => (
                                                    <label key={amenity.id} className="d-flex " style={{ position: "relative", cursor: "pointer" }}>
                                                        <input style={{ position: "absolute", top: "50%", cursor: "pointer", transform: "translateY(-50%)", left: "-18px", }}
                                                            type="checkbox"
                                                            checked={selectedAmenities.includes(amenity.id)}
                                                            onChange={() => handleCheckboxChange(amenity.id)}
                                                            className="me-2"
                                                        />
                                                        {amenity.name}
                                                    </label>
                                                ))}

                                            </div>
                                        </Col>

                                    ))}

                                </Row>

                                <CCol md={12}>
                                    <CFormLabel>Admin Notes</CFormLabel>
                                    {
                                        isClient ?
                                            <div >
                                                <SummernoteLite
                                                    ref={adminNotesRef}
                                                    placeholder={"Write something here..."}
                                                    tabsize={2}
                                                    lang="zh-CN" // only if you want to change the default language
                                                    height={100 || "50vh"}
                                                    dialogsInBody={true}
                                                    blockquoteBreakingLevel={0}
                                                    toolbar={[
                                                        ['style', ['style']],
                                                        ['font', ['bold', 'underline', 'clear', 'strikethrough', 'superscript', 'subscript']],
                                                        ['fontsize', ['fontsize']],
                                                        ['fontname', ['fontname']],
                                                        ['color', ['color']],
                                                        ['para', ['ul', 'ol', 'paragraph']],
                                                        ['table', ['table']],
                                                        // ['insert', ['link', 'video', 'hr']],
                                                        ['view', ['fullscreen', 'codeview', 'help']]
                                                    ]}
                                                    fontNames={[
                                                        'Arial',
                                                        'Georgia',
                                                        'Verdana',
                                                        'Didot-Ragular', // Include Didot-Regular font
                                                        'Didot-Italic',
                                                        'Satoshi',
                                                        'Satoshi-Bold',
                                                        'Satoshi-Italic',
                                                        'Satoshi-Light'
                                                        // Add other similar font names if necessary
                                                    ]}
                                                    fontNamesIgnoreCheck={[
                                                        'Arial',
                                                        'Georgia',
                                                        'Verdana',
                                                        'Didot-Ragular', // Include Didot-Regular font
                                                        'Didot-Italic',
                                                        'Satoshi',
                                                        'Satoshi-Bold',
                                                        'Satoshi-Italic',
                                                        'Satoshi-Light'
                                                        // Add other similar font names if necessary
                                                    ]}
                                                    fontSizes={['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '40', '44', '48', '54', '60', '66', '72']}
                                                    onChange={(content) => setData({ ...data, content })}
                                                />
                                            </div> : ""}
                                </CCol>

                                <CCol md={2} xs={6}>
                                    <Link href="/admin/careyeshousing">
                                        <CButton color="dark op-5 btn-block " >
                                            Back
                                        </CButton>
                                    </Link>
                                </CCol>

                                <CCol md={2} xs={6}>
                                    <CButton variant="primary" className="btn btn-primary btn-block" type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        ) : (
                                            'Submit'
                                        )}
                                    </CButton>
                                </CCol>
                            </CForm>

                        </Card.Body>
                    </Card>
                </Col>
            </div>
            {/* <!--/Row--> */}
        </div >
    );
}

CareyeshousingAdd.propTypes = {};

CareyeshousingAdd.defaultProps = {};

CareyeshousingAdd.layout = "Contentlayout"

export default CareyeshousingAdd;
