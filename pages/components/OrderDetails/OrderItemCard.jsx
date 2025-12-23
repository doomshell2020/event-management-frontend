import { formatPrice } from "@/utils/commonFunction";
import { format } from "date-fns";


const OrderItemCard = ({ item, orderData, handleCancelAppointment }) => {
    const isTicket = item.type === "ticket";
    const isAppointment = item.type === "appointment";
    const isAddon = item.type === "addon";

    const currency =
        orderData?.event?.currencyName?.Currency_symbol || "";

    const title = isTicket
        ? "Ticket"
        : isAppointment
        ? "Appointment"
        : "Addon";

    return (
        <div className="mb-3 p-3 border rounded bg-white">

            {/* HEADER */}
            <div className="d-flex justify-content-between mb-2">
                <strong>{title}</strong>

                {isAppointment && (
                    <button
                        className="btn btn-danger btn-sm"
                        disabled={item.cancel_status === "cancel"}
                        onClick={() => handleCancelAppointment(item.id)}
                    >
                        {item.cancel_status === "cancel"
                            ? "Cancelled"
                            : "Cancel Appointment"}
                    </button>
                )}
            </div>

            <div className="row align-items-center">

                {/* QR */}
                <div className="col-md-3 text-center">
                    {item.qr_image_url && (
                        <img
                            src={item.qr_image_url}
                            alt="QR"
                            className="border rounded p-2"
                            style={{ width: "110px" }}
                        />
                    )}
                </div>

                {/* DETAILS */}
                <div className="col-md-9">

                    {/* DATE & TIME (Appointment only) */}
                    {isAppointment && (
                        <div className="mb-1">
                            <strong>Date & Time :</strong>{" "}
                            {format(new Date(item.appointment?.date), "EEE, dd MMM yyyy")}
                        </div>
                    )}

                    {/* QUANTITY */}
                    {/* <div className="mb-1">
                        <strong>Quantity :</strong> {item.count}
                    </div> */}

                    {/* PRICE */}
                    <div className="fw-bold text-success">
                        Amount : {currency} {formatPrice(item.price)}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderItemCard;
