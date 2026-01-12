import { formatPrice } from "@/utils/commonFunction";
import { format } from "date-fns";

const OrderItemCard = ({
    currencyInfo,
    item,
    orderData,
    handleCancelAppointment,
    baseUrls
}) => {
    const type = item?.type;

    const isTicket = type == "ticket";
    const isAppointment = type == "appointment";
    const isAddon = type == "addon";
    const isPackage = type == "package";
    const isCommitteeSale = type == "committesale";
    const isComps = type == "comps";
    const isTicketPrice = type == "ticket_price"; // ✅ NEW

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

    return (
        <div
            className="border-5 p-4 bg-white rounded-3 mb-3 ticktes-detail-box"
            style={{ borderTop: '5px solid #3d6db5' }}
        >
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Order Details</h5>

                {isAppointment && (
                    <button
                        className="btn btn-sm d-inline-flex align-items-center rounded-pill border-0 cancel-btn"
                        disabled={item?.cancel_status == "cancel"}
                        onClick={() => handleCancelAppointment(item?.id)}
                    >
                        {item?.cancel_status !== "cancel" && (
                            <span className="me-2 fw-bold">✕</span>
                        )}
                        {item?.cancel_status == "cancel" ? "Cancelled" : "Cancel"}
                    </button>
                )}
            </div>

            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <div className="fw-semibold fs-6">{title}</div>

                    {itemName && (
                        <div className="text-muted">{itemName}</div>
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
                        <div className="border rounded-3 p-2 bg-light">
                            <img
                                src={`${baseUrls?.qr_image_url}${item.qr_image}`}
                                alt="QR Code"
                                style={{ width: "110px" }}
                            />
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
