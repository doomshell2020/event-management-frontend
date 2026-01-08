import { formatEventDateTime } from "@/utils/formatDate";
import OrderItemCard from "./OrderItemCard";
import PaymentSummary from "./PaymentSummary";


const OrderDetails = ({ orderData, handleCancelAppointment, baseUrls }) => {
    if (!orderData) return null;

    const { event, orderItems } = orderData;
    const { currencyName } = event;
    const eventTimezone = event?.event_timezone || "";
    // console.log('eventTimezone :', eventTimezone);

    return (
        <div className="col-lg-8 col-md-7">

            {/* EVENT HEADER */}
            <h2 className="fw-bold m-0">{event?.name}</h2>
            <div className="text-muted mb-3">
                Hosted By{" "}
                <a href="#">
                    #{event?.companyInfo?.name || "Company"}
                </a>
            </div>

            {/* EVENT INFO BAR */}
            <div
                className="row text-white p-3 rounded mb-4"
                style={{ background: "#3d6db5" }}
            >
                <div className="col-md-4 border-end">
                    <strong>Event Start Date</strong>
                    <div>
                        {formatEventDateTime(
                            event?.date_from,
                            eventTimezone
                        )}
                    </div>
                </div>

                <div className="col-md-4 border-end">
                    <strong>Event End Date</strong>
                    <div>
                        {formatEventDateTime(
                            event?.date_to,
                            eventTimezone
                        )}
                    </div>
                </div>

                <div className="col-md-4">
                    <strong>Event Location</strong>
                    <div>{event?.location || "--"}</div>
                </div>
            </div>

            {/* ORDER ITEMS */}
            <div className="border rounded p-4 bg-light mb-4">
                <h5 className="fw-bold mb-3">Order Details</h5>

                {orderItems.map(item => (
                    <OrderItemCard
                        key={item.id}
                        currencyInfo={currencyName}
                        item={item}
                        orderData={orderData}
                        handleCancelAppointment={handleCancelAppointment}
                        baseUrls={baseUrls}
                    />
                ))}
            </div>

            {/* PAYMENT SUMMARY */}
            <PaymentSummary orderData={orderData} />
        </div>
    );
};

export default OrderDetails;
