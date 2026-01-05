import { useEffect, useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { CFormLabel } from "@coreui/react";
import { Modal, Button, InputGroup, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";

function ExtendBookingModal({ showExtendBookingModal, setShowExtendBookingModal, extendBookingRow }) {
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [extendError, setExtendError] = useState("");
    const [isExtensionPossible, setIsExtensionPossible] = useState(true);
    const [loading, setLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalNight, setTotalNight] = useState(0);
    const [previousCheckIn, setPreviousCheckIn] = useState('');
    const [previousCheckOut, setPreviousCheckOut] = useState('');
    // console.log('>>>>>', previousCheckIn); //06 Nov 2025
    // console.log('>>>>>', previousCheckOut); //10 Nov 2025
    const eventHousing = extendBookingRow?.Housing?.EventHousings?.[0];
    const evenHousingId = eventHousing?.id || null;

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";

        const [year, month, day] = dateStr.split("-");
        const localDate = new Date(
            parseInt(year, 10),
            parseInt(month, 10) - 1, // month is 0-based
            parseInt(day, 10)
        );

        return localDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Helper to format a Date object into YYYY-MM-DD local string
    const parseLocalDate = (dateStr) => {
        const [year, month, day] = dateStr.split("-");
        return new Date(year, month - 1, day); // month is 0-based
    };

    const subtractOneDay = (date) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() - 1);
        return newDate;
    };

    function addOneDay(date) {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1);
        return newDate;
    }

    useEffect(() => {
        if (eventHousing && extendBookingRow?.check_in_date && extendBookingRow?.check_out_date) {
            const availabilityStart = new Date(eventHousing.AvailabilityStartDate);
            const availabilityEnd = new Date(eventHousing.AvailabilityEndDate);
            const bookedStart = new Date(extendBookingRow.check_in_date);
            const bookedEnd = new Date(extendBookingRow.check_out_date);

            setPreviousCheckIn(formatDate(extendBookingRow.check_in_date))
            setPreviousCheckOut(formatDate(extendBookingRow.check_out_date))

            if (bookedStart <= availabilityStart && bookedEnd >= availabilityEnd) {
                setIsExtensionPossible(false);
                setExtendError("This property is fully booked and cannot be extended.");
            } else {
                setIsExtensionPossible(true);
                setExtendError("");
            }
        }
    }, [extendBookingRow]);

    useEffect(() => {

        // console.log('>>>>>>>>>>>>>>>>>', checkInDate, checkOutDate);

        if (checkInDate && checkOutDate && eventHousing?.NightlyPrice) {
            const start = new Date(`${checkInDate}T00:00:00Z`);
            const end = new Date(`${checkOutDate}T00:00:00Z`);
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            setTotalNight(diffDays);
            if (diffDays > 0) {
                const price = parseFloat(eventHousing.NightlyPrice) || 0;
                setTotalAmount(diffDays * price);
            } else {
                setTotalAmount(0);
            }
        } else {
            setTotalAmount(0);
        }
    }, [checkInDate, checkOutDate, eventHousing?.NightlyPrice]);

    const handleSubmitExtendBooking = async () => {
        setExtendError("");

        if (!checkInDate || !checkOutDate) {
            setExtendError("Please select both check-in and check-out dates.");
            return;
        }

        const selectedStart = new Date(`${checkInDate}T00:00:00Z`);
        const selectedEnd = new Date(`${checkOutDate}T00:00:00Z`);

        if (selectedStart >= selectedEnd) {
            setExtendError("Check-out date must be after check-in date.");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("key", "date-extend");
            formData.append("check_in_date", checkInDate);
            formData.append("check_out_date", checkOutDate);
            formData.append("event_id", eventHousing.EventID);
            formData.append("housing_id", extendBookingRow?.accommodation_id || "");
            formData.append("user_id", extendBookingRow?.user_id || "");
            formData.append("evenHousingId", evenHousingId);
            formData.append("totalAmount", totalAmount);
            formData.append("totalNight", totalNight);
            formData.append("previousCheckIn", previousCheckIn);
            formData.append("previousCheckOut", previousCheckOut);
            formData.append("toEmail", extendBookingRow.email);
            formData.append("fullPropertyName", extendBookingRow.fullPropertyName);
            formData.append("firstName", extendBookingRow.firstName);

            const response = await axios.post("/api/v1/housings/", formData);
            // console.log('>>>>>>response', response.data.data.ExtensionURL);

            Swal.fire({
                icon: "success",
                title: "The extended stay dates has been submitted successfully",
                // title: "Extension Request Sent!",
                // text: "Your date extension request has been submitted successfully. URL : " + response.data.data.ExtensionURL,
                confirmButtonColor: "#28a745",
                customClass: { popup: "add-tckt-dtlpop" },
            });

            setCheckInDate("");
            setCheckOutDate("");
            setShowExtendBookingModal(false);
        } catch (error) {
            console.error("API error:", error);
            setExtendError("❌ Something went wrong while submitting the request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={showExtendBookingModal}
            size="lg"
            centered
            className="housing-availbty-edit"
        // onHide={() => setShowExtendBookingModal(false)}
        >
            <Modal.Header>
                <Modal.Title>
                    Extend Your Stay - {extendBookingRow?.Housing?.Name || "Housing"}
                </Modal.Title>

                <Button
                    variant=""
                    className="btn btn-close"
                    onClick={() => setShowExtendBookingModal(false)}
                >
                    <i className="bi bi-x"></i>
                </Button>
            </Modal.Header>

            <Modal.Body>
                {eventHousing ? (
                    <>
                        <div className="mb-3">
                            <h6><strong>Housing Details</strong></h6>
                            <div className="row">
                                <div className="col-md-4">
                                    <strong>Neighborhood:</strong><br />
                                    {extendBookingRow.Housing?.HousingNeighborhood?.name || "-"}
                                </div>
                                <div className="col-md-4">
                                    <strong>Bedrooms:</strong><br />
                                    {extendBookingRow.Housing?.NumBedrooms}
                                </div>
                                <div className="col-md-4">
                                    <strong>Max Occupancy:</strong><br />
                                    {extendBookingRow.Housing?.MaxOccupancy}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <h6><strong>Availability Info</strong></h6>
                            <div className="row">
                                <div className="col-md-4">
                                    <strong>Available:</strong><br />
                                    {formatDate(eventHousing.AvailabilityStartDate)} to {formatDate(eventHousing.AvailabilityEndDate)}
                                </div>
                                <div className="col-md-4">
                                    <strong>Current Booked Date:</strong><br />
                                    {formatDate(extendBookingRow.check_in_date)} to {formatDate(extendBookingRow.check_out_date)}
                                </div>
                                <div className="col-md-4">
                                    <strong>Nightly Price:</strong><br />
                                    ${Math.round(eventHousing.NightlyPrice) || "-"}
                                </div>
                            </div>
                        </div>

                        <hr />

                        <h5 className="mb-3">Extend Stay</h5>

                        <div className="row mb-3">
                            {/* ----------- CHECK-IN DATE ------------ */}
                            <div className="col-md-6">
                                <CFormLabel htmlFor="NewCheckInDate">
                                    Start Date of Extension <span style={{ color: "red" }}>*</span>
                                </CFormLabel>
                                <InputGroup className="position-relative">
                                    <InputGroup.Text className="input-group-text">
                                        <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                                    </InputGroup.Text>
                                    <DatePicker
                                        id="NewCheckInDate"
                                        selected={checkInDate ? parseLocalDate(checkInDate) : null}
                                        onChange={(date) => {
                                            const bookedStart = parseLocalDate(extendBookingRow.check_in_date);
                                            const bookedEnd = parseLocalDate(extendBookingRow.check_out_date);
                                            const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                                            if (selectedDate >= bookedStart && selectedDate < bookedEnd) {
                                                setExtendError("Selected check-in date overlaps with existing booking.");
                                                setCheckInDate("");
                                                return;
                                            }

                                            const yyyy = selectedDate.getFullYear();
                                            const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                                            const dd = String(selectedDate.getDate()).padStart(2, '0');
                                            setCheckInDate(`${yyyy}-${mm}-${dd}`);
                                            setExtendError("");
                                        }}
                                        includeDateIntervals={[
                                            ...(parseLocalDate(eventHousing.AvailabilityStartDate) < parseLocalDate(extendBookingRow.check_in_date)
                                                ? [{
                                                    start: parseLocalDate(eventHousing.AvailabilityStartDate),
                                                    end: subtractOneDay(parseLocalDate(extendBookingRow.check_in_date)),
                                                }]
                                                : []),
                                            {
                                                start: parseLocalDate(extendBookingRow.check_out_date),
                                                end: parseLocalDate(eventHousing.AvailabilityEndDate),
                                            },
                                        ]}
                                        dateFormat="dd-MM-yyyy"
                                        className="form-control"
                                        placeholderText="Select From"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        autoComplete="off"
                                        openToDate={parseLocalDate(eventHousing.AvailabilityStartDate)}
                                    />
                                </InputGroup>
                            </div>

                            {/* ----------- CHECK-OUT DATE ------------ */}
                            <div className="col-md-6">
                                <CFormLabel htmlFor="NewCheckOutDate">
                                    End Date of Extension <span style={{ color: "red" }}>*</span>
                                </CFormLabel>
                                <InputGroup className="position-relative">
                                    <InputGroup.Text className="input-group-text">
                                        <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                                    </InputGroup.Text>
                                    <DatePicker
                                        id="NewCheckOutDate"
                                        autoComplete="off"
                                        selected={checkOutDate ? parseLocalDate(checkOutDate) : null}
                                        onChange={(date) => {
                                            if (!checkInDate) {
                                                setExtendError("Please select check-in date first.");
                                                setCheckOutDate("");
                                                return;
                                            }

                                            const start = parseLocalDate(checkInDate);
                                            const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                            const bookingStart = parseLocalDate(extendBookingRow.check_in_date);
                                            const bookingEnd = parseLocalDate(extendBookingRow.check_out_date);

                                            if (end <= start) {
                                                setExtendError("Check-out date must be after check-in date.");
                                                setCheckOutDate("");
                                                return;
                                            }

                                            // Check if any date in range overlaps
                                            let overlap = false;
                                            let temp = new Date(start);
                                            while (temp < end) {
                                                if (temp >= bookingStart && temp < bookingEnd) {
                                                    overlap = true;
                                                    break;
                                                }
                                                temp.setDate(temp.getDate() + 1);
                                            }

                                            if (overlap) {
                                                setExtendError("Selected date range overlaps with existing booking.");
                                                setCheckOutDate("");
                                                return;
                                            }

                                            const yyyy = end.getFullYear();
                                            const mm = String(end.getMonth() + 1).padStart(2, '0');
                                            const dd = String(end.getDate()).padStart(2, '0');
                                            setCheckOutDate(`${yyyy}-${mm}-${dd}`);
                                            setExtendError("");
                                        }}
                                        includeDateIntervals={[
                                            {
                                                start: parseLocalDate(extendBookingRow.check_out_date),
                                                end: parseLocalDate(eventHousing.AvailabilityEndDate),
                                            },
                                        ]}
                                        minDate={checkInDate ? addOneDay(parseLocalDate(checkInDate)) : parseLocalDate(extendBookingRow.check_out_date)}
                                        maxDate={parseLocalDate(eventHousing.AvailabilityEndDate)}
                                        dateFormat="dd-MM-yyyy"
                                        className="form-control"
                                        placeholderText="Select To"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        openToDate={checkInDate ? addOneDay(parseLocalDate(checkInDate)) : parseLocalDate(eventHousing.AvailabilityEndDate)}
                                        disabled={!checkInDate} // prevent picking unless check-in is selected
                                    />
                                </InputGroup>
                            </div>
                        </div>



                        {totalAmount > 0 && (
                            <div className="alert alert-success">
                                Total for <strong>{totalNight}</strong> night{totalNight > 1 ? 's' : ''}: <strong>${Math.round(totalAmount)}</strong>
                            </div>
                        )}

                        {extendError && (
                            <div className="alert alert-danger">{extendError}</div>
                        )}

                        <div className="text-end">
                            <Button
                                variant="success"
                                onClick={handleSubmitExtendBooking}
                                disabled={!isExtensionPossible || loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Date Extension"
                                )}
                            </Button>
                        </div>
                    </>
                ) : (
                    <p>No event housing details available.</p>
                )}
            </Modal.Body>
        </Modal>
    );
}

export default ExtendBookingModal;