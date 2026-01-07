import OrderItemCard from "./OrderItemCard";
import PaymentSummary from "./PaymentSummary";
import { format } from "date-fns";

const OrderDetails = ({ orderData, handleCancelAppointment, baseUrls }) => {
    if (!orderData) return null;

    const { event, orderItems } = orderData;

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
        </div>
    );
};

export default OrderDetails;
