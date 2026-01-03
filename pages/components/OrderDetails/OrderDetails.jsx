import OrderItemCard from "./OrderItemCard";
import PaymentSummary from "./PaymentSummary";
import { format } from "date-fns";

const OrderDetails = ({ orderData, handleCancelAppointment }) => {
    if (!orderData) return null;

    const { event, orderItems } = orderData;

    return (
        <div className="col-md-7">
            <div className="event-ticket-box">
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
                            <strong>Event Start Date</strong>
                            <div>
                                {event?.date_from
                                    ? format(new Date(event.date_from), "EEE, dd MMM yyyy | hh:mm a")
                                    : "N/A"}
                            </div>
                        </li>
                        <li className="flex-fill">
                            <strong>Event End Date</strong>
                            <div>
                                {event?.date_to
                                    ? format(new Date(event.date_to), "EEE, dd MMM yyyy | hh:mm a")
                                    : "N/A"}
                            </div>
                        </li>

                        <li className="flex-fill">
                            <strong>Event Location</strong>
                            <div>{event?.location || "--"}</div>
                        </li>
                    </ul>
                </div>
                {/* ORDER ITEMS */}
                <div className="border rounded p-4 bg-white mb-4">
                    <h5 className="fw-bold mb-3">Order Details</h5>

                    {orderItems.map(item => (
                        <OrderItemCard
                            key={item.id}
                            item={item}
                            orderData={orderData}
                            handleCancelAppointment={handleCancelAppointment}
                        />
                    ))}
                </div>

                {/* PAYMENT SUMMARY */}
                <PaymentSummary orderData={orderData} />
            </div>
        </div>
    );
};

export default OrderDetails;
