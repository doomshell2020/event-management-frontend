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
        <div className="col-md-7">
            <div className="event-ticket-box mt-0">
                <div className="section-heading">
                    <h2 className="text-start">{event?.name}</h2>
                    <h6 className="mb-3">
                        Hosted By{" "}
                        <a href="#">
                            #{event?.companyInfo?.name || "Company"}
                        </a>
                    </h6>

                </div>

                {/* EVENT INFO BAR */}
                <div className="info mb-3">
                    <ul className="d-flex ps-0 mb-0">
                        <li className="flex-fill">
                             <div>
                                <h6>Event Start Date</h6>
                                <span>{event?.date_from
                                    ? format(new Date(event.date_from), "EEE, dd MMM yyyy | hh:mm a")
                                    : "N/A"}</span>
                            </div>
                        </li>
                        <li className="flex-fill">
                            <div>
                            <h6>Event End Date</h6>
                                <span>{event?.date_to
                                    ? format(new Date(event.date_to), "EEE, dd MMM yyyy | hh:mm a")
                                    : "N/A"}</span>
                            </div>
                        </li>

                        <li className="flex-fill">
                            <div>
                            <h6>Event Location</h6>
                            <span>{event?.location || "--"}</span>

                            </div>
                        </li>
                    </ul>
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
                {/* ORDER ITEMS */}
                
                    {orderItems.map(item => (
                        <OrderItemCard
                            key={item.id}
                            item={item}
                            orderData={orderData}
                            handleCancelAppointment={handleCancelAppointment}
                            baseUrls={baseUrls}

                        />
                    ))}
               

                {/* PAYMENT SUMMARY */}
                <PaymentSummary orderData={orderData} />
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
        </div>
        </div>
    );
};

export default OrderDetails;
