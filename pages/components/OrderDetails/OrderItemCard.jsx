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

    // Complimentary / Free logic
    const isFreeTicket =
        isComps ||
        isCommitteeSale ||
        ((isTicket || isComps) && Number(item?.price) == 0);

    // Currency
    const currency =
        orderData?.event?.currencyName?.Currency_symbol || "";
    const currencySymbol = isAppointment
        ? currency
        : currencyInfo?.Currency_symbol || "";

    // Title
    const title =
        isTicket || isCommitteeSale || isComps
            ? "Ticket"
            : isAppointment
                ? "Appointment"
                : isAddon
                    ? "Addon"
                    : "Unknown Item";

    // Item Name
    const itemName =
        isTicket || isCommitteeSale || isComps
            ? item?.ticketType?.title
            : isAddon
                ? item?.addonType?.name
                : isPackage
                    ? item?.package?.name
                    : isAppointment
                        ? item?.appointment?.wellnessList?.name
                        : "";

    return (
        <div className="mb-3 p-3 border rounded-3 bg-white shadow-sm">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <div className="fw-semibold fs-6">
                        {title}
                    </div>

                    {itemName && (
                        <div className="text-muted small">
                            {itemName}
                        </div>
                    )}
                </div>

                {isAppointment && (
                    <button
                        className="btn btn-outline-danger btn-sm"
                        disabled={item?.cancel_status == "cancel"}
                        onClick={() => handleCancelAppointment(item?.id)}
                    >
                        {item?.cancel_status == "cancel"
                            ? "Cancelled"
                            : "Cancel"}
                    </button>
                )}
            </div>

            <div className="row align-items-center">

                {/* LEFT CONTENT */}
                <div className="col-md-8">

                    {isAppointment && item?.slot?.slot_date && (
                        <div className="mb-2 text-muted small">
                            <strong>Date:</strong>{" "}
                            {format(
                                new Date(item.slot.slot_date),
                                "EEE, dd MMM yyyy"
                            )}
                        </div>
                    )}

                    {/* PRICE / FREE */}
                    {isFreeTicket ? (
                        <div className="px-3 py-2 rounded bg-light text-secondary fw-semibold d-inline-block">
                            Complimentary
                        </div>
                    ) : (
                        <div className="px-3 py-2 rounded bg-success bg-opacity-10 text-success fw-bold d-inline-block">
                            {currencySymbol}{formatPrice(item?.price)}
                        </div>
                    )}
                </div>

                {/* QR SECTION */}
                <div className="col-md-4 d-flex justify-content-md-end justify-content-start mt-3 mt-md-0">
                    {item?.qr_image && (
                        <div className="border rounded-3 p-2 bg-light">
                            <img
                                src={`${baseUrls?.qr_image_url}${item.qr_image}`}
                                alt="QR Code"
                                style={{ width: "110px" }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderItemCard;
