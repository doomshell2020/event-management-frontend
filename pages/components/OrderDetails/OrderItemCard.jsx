import { formatPrice } from "@/utils/commonFunction";
import { format } from "date-fns";
const OrderItemCard = ({
    currencyInfo,
    item,
    orderData,
    handleCancelAppointment,
    handleSendCancelRequest,
    handleShowRejectReason,
    baseUrls
}) => {
    // console.log("item",orderData?.event?.cancellation_policy)
    const type = item?.type;
    const isTicket = type == "ticket";
    const isAppointment = type == "appointment";
    const isAddon = type == "addon";
    const isPackage = type == "package";
    const isCommitteeSale = type == "committesale";
    const isComps = type == "comps";
    const isTicketPrice = type == "ticket_price"; // ✅ NEW
    const isScanned = item?.is_scanned === 'Y';
    const isCancelled = item?.cancel_status === "cancel"
    // Complimentary
    const isFreeTicket = isComps;

    // Currency
    const currency =
        orderData?.event?.currencyName?.Currency_symbol || "";

    const currencySymbol =
        isAppointment || isPackage || isTicketPrice
            ? currency
            : currencyInfo?.Currency_symbol || "";

    // Title
    const title =
        isTicket || isCommitteeSale || isComps || isTicketPrice
            ? "Ticket"
            : isAppointment
                ? "Appointment"
                : isAddon
                    ? "Addon"
                    : isPackage
                        ? "Package"
                        : "Unknown Item";

    /* ============ ITEM NAME LOGIC ============ */

    const ticketPricing = item?.ticketPricing;
    const slot = ticketPricing?.slot;
    const pricingTicket = ticketPricing?.ticket;

    const itemName =
        isTicket || isCommitteeSale || isComps
            ? item?.ticketType?.title
            : isTicketPrice
                ? slot
                    ? `${pricingTicket?.title} (${slot.slot_name})`
                    : pricingTicket?.title
                : isAddon
                    ? item?.addonType?.name
                    : isPackage
                        ? item?.package?.name
                        : isAppointment
                            ? item?.appointment?.wellnessList?.name
                            : "";

    const gateName =
        (isTicket || isCommitteeSale || isComps)
            ? item?.ticketType?.gates?.title
            : ticketPricing?.ticket?.gates?.title ?? null;
    // console.log("gateName", gateName)
    return (
        <div
            className="border-5 p-4 bg-white rounded-3 mb-3 ticktes-detail-box"
            style={{ borderTop: '5px solid #3d6db5' }}
        >
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Order Details</h5>

                {item?.cancel_request_status === "rejected" && (
                    <>
                        <i
                            className="bi bi-question-circle-fill text-primary"
                            style={{ fontSize: "18px", cursor: "pointer", paddingLeft: "321px" }}
                            title="View Rejected Reason"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleShowRejectReason(item?.cancel_request_reject_reason);
                            }}
                        ></i>
                    </>
                )}
                <button
                    onClick={() => handleSendCancelRequest(item?.id, orderData?.event)}
                    disabled={
                        item?.cancel_request_status === "pending" ||
                        item?.cancel_request_status === "approved" ||
                        item?.cancel_request_status === "rejected"
                    }
                    style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "500",
                        border: "1px solid",
                        backgroundColor: "#fff",
                        borderColor:
                            item?.cancel_request_status === "pending"
                                ? "#facc15"   // yellow
                                : item?.cancel_request_status === "approved"
                                    ? "#16a34a"   // green
                                    : item?.cancel_request_status === "rejected"
                                        ? "#dc2626"   // red
                                        : "#dc2626",  // default red
                        color:
                            item?.cancel_request_status === "pending"
                                ? "#92400e"
                                : item?.cancel_request_status === "approved"
                                    ? "#16a34a"
                                    : item?.cancel_request_status === "rejected"
                                        ? "#dc2626"
                                        : "#dc2626",
                        cursor: "allowed",
                        opacity:
                            item?.cancel_status === "cancel" ||
                                item?.cancel_request_status
                                ? 0.6
                                : 1,
                        transition: "all 0.2s ease"
                    }}
                >
                    {item?.cancel_request_status === "pending"
                        ? "Request Sent"
                        : item?.cancel_request_status === "approved"
                            ? "Approved"
                            : item?.cancel_request_status === "rejected"
                                ? "Rejected"
                                : "Send Cancel Request"
                    }
                </button>

            </div>

            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <div className="fw-semibold fs-6">{title}</div>

                    {itemName && (
                        <div className="text-muted">{itemName}{" "}({gateName})</div>
                    )}

                    {isAppointment && (
                        <div className="appointment-info">
                            <div>
                                <strong>Date: </strong>{format(new Date(item?.appointment?.date), "EEE, dd MMM yyyy")}
                            </div>

                            <div>
                                <strong>Time: </strong> {format(new Date(`1970-01-01T${item?.appointment?.slot_start_time}`), "hh:mm a")}
                                {" - "}
                                {format(new Date(`1970-01-01T${item?.appointment?.slot_end_time}`), "hh:mm a")}
                            </div>
                        </div>
                    )}




                    {/* SLOT DETAILS (Ticket Price only) */}
                    {isTicketPrice && slot && (
                        <div className="text-muted mt-1">
                            {format(new Date(slot.slot_date), "EEE, dd MMM yyyy")} <br />
                            {slot.start_time} - {slot.end_time}
                        </div>
                    )}
                </div>

                <div>
                    {/* PRICE / FREE */}
                    {isFreeTicket ? (
                        <div
                            className="px-3 py-2 rounded fw-semibold d-inline-block"
                            style={{ backgroundColor: '#3d6db5', color: '#fff' }}
                        >
                            Complimentary
                        </div>
                    ) : (
                        <div className="px-3 py-2 rounded bg-success bg-opacity-10 text-white fw-bold d-inline-block">
                            {currencySymbol}{formatPrice(item?.price)}
                        </div>
                    )}
                </div>
            </div>

            {/* QR SECTION */}
            <div className="row align-items-center">
                <div className="col-md-12 d-flex justify-content-md-end justify-content-start mt-3 mt-md-0">
                    {item?.qr_image && (
                        <div className="border rounded-3 p-2 bg-light" style={{ position: "relative" }}>
                            <img
                                src={`${baseUrls?.qr_image_url}${item.qr_image}`}
                                alt="QR Code"
                                style={{
                                    width: "110px",
                                    // filter: isScanned ? "blur(1px)" : "none",
                                    // opacity: isScanned ? 0.7 : 13
                                    filter: (isScanned || isCancelled) ? "blur(1px)" : "none",
                                    opacity: (isScanned || isCancelled) ? 0.7 : 1
                                }} />
                            {/* CANCELLED Overlay */}
                            {isCancelled && (
                                <div style={{
                                    position: "absolute",
                                    top: "62px",
                                    left: "61px",
                                    transform: "translate(-50%, -50%) rotate(322deg)",
                                    color: "#ff0000",
                                    fontSize: "13px",
                                    fontWeight: "bold",
                                    border: "2px solid red",
                                    padding: "3px 23px",
                                    borderRadius: "4px",
                                    background: "rgba(255,255,255,0.7)"
                                }}>
                                    CANCELLED
                                </div>
                            )}
                            {/* SCANNED Overlay (only if not cancelled) */}
                            {!isCancelled && isScanned && (
                                <div style={{
                                    position: "absolute",
                                    top: "62px",
                                    left: "61px",
                                    transform: "translate(-50%, -50%) rotate(322deg)",
                                    color: "#ff0000",
                                    fontSize: "13px",
                                    fontWeight: "bold",
                                    border: "2px solid red",
                                    padding: "3px 23px",
                                    borderRadius: "4px",
                                    background: "rgba(255,255,255,0.7)"
                                }}>
                                    SCANNED
                                </div>
                            )}
                            {/* {isScanned && (
                                <div style={{
                                    position: "absolute",
                                    top: "62px",
                                    left: "61px",
                                    transform: "translate(-50%, -50%) rotate(322deg)",
                                    color: "#ff0000",
                                    fontSize: "13px",
                                    fontWeight: "bold",
                                    border: "2px solid red",
                                    padding: "3px 23px",
                                    borderRadius: "4px",
                                    background: "rgba(255,255,255,0.7)"
                                }}>
                                    SCANNED
                                </div>
                            )} */}
                            <h6 className="text-center mb-2 mt-2 fw-bold">
                                Scan to verify
                            </h6>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderItemCard;
