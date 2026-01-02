import { formatPrice } from "@/utils/commonFunction";
import { format } from "date-fns";

const OrderItemCard = ({ currencyInfo, item, orderData, handleCancelAppointment }) => {
    const isTicket = item.type == "ticket";
    const isAppointment = item.type == "appointment";
    const isAddon = item.type == "addon";
    const isPackage = item.type == "package";
    const isCommitteeSale = item.type == "committesale";


    const currency = orderData?.event?.currencyName?.Currency_symbol || "";
    const currencySymbol = isAppointment
        ? currency
        : currencyInfo?.Currency_symbol || "";

    // 🔹 Title
    const title =
        isTicket || isCommitteeSale
            ? "Ticket"
            : isAppointment
                ? "Appointment"
                : isAddon
                    ? "Addon"
                    : "Package";



    // 🔹 Name mapping (CORRECT)
    const itemName =
        isTicket || isCommitteeSale
            ? item.ticketType?.title
            : isAddon
                ? item.addonType?.name
                : isPackage
                    ? item.package?.name
                    : isAppointment
                        ? item.appointment?.wellnessList?.name
                        : "";


    return (
        <div className="mb-3 p-3 border rounded bg-white">

            {/* HEADER */}
            <div className="d-flex justify-content-between mb-2">
                <div>
                    <strong>{title}</strong>
                    {itemName && (
                        <div className="text-muted text-14">
                            {itemName}
                        </div>
                    )}
                </div>

                {isAppointment && (
                    <button
                        className="btn btn-danger btn-sm"
                        disabled={item.cancel_status == "cancel"}
                        onClick={() => handleCancelAppointment(item.id)}
                    >
                        {item.cancel_status == "cancel"
                            ? "Cancelled"
                            : "Cancel Appointment"}
                    </button>
                )}
            </div>

            <div className="row align-items-center">

                {/* QR */}
                <div className="col-md-3 text-center">
                    {item.qr_image && (
                        <img
                            src={item.qr_image}
                            alt="QR"
                            className="border rounded p-2"
                            style={{ width: "110px" }}
                        />
                    )}
                </div>

                {/* DETAILS */}
                <div className="col-md-9">

                    {/* DATE (Appointment only) */}
                    {isAppointment && item.slot?.slot_date && (
                        <div className="mb-1">
                            <strong>Date & Time :</strong>{" "}
                            {format(new Date(item.slot.slot_date), "EEE, dd MMM yyyy")}
                        </div>
                    )}

                    {/* PRICE */}
                    <div className="fw-bold text-success">
                        Amount : {currencySymbol}{formatPrice(item.price)}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderItemCard;
