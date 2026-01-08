import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";

const PrintCompsTickets = () => {
    const router = useRouter();
    const { id, ticketId } = router.query;

    const [data, setData] = useState(null);

    useEffect(() => {
        if (!ticketId || !id) return;

        api.get(`/api/v1/tickets/print/${ticketId}`, {
            params: { event_id: id }
        }).then(res => {
            if (res.data.success) {
                setData(res.data.data);
            }
        });
    }, [ticketId, id]);

    if (!data) return null;

    const {
        event,
        tickets,
        qr_base_path,
        event_image_base_path,
        ticket_title
    } = data;

    return (
        <div className="print-wrapper">
            <button className="print-btn" onClick={() => window.print()}>
                🖨️ Print Tickets
            </button>

            <div className="ticket-grid">
                {tickets.map(ticket => (
                    <div key={ticket.id} className="ticket-card">

                        {/* ✅ REAL IMAGE (PRINT SAFE) */}
                        <img
                            src={`${event_image_base_path}${event.image}`}
                            className="bg-img"
                            alt="Event"
                        />

                        {/* DARK OVERLAY */}
                        <div className="overlay" />

                        {/* CONTENT */}
                        <div className="content">
                            <h2 className="event-name">{event.name}</h2>

                            <p className="event-date">
                                {new Date(event.date_from).toDateString()} –{" "}
                                {new Date(event.date_to).toDateString()}
                            </p>

                            <div className="ticket-body">
                                <div className="left">
                                    <h3>{ticket_title}</h3>
                                    <p className="user-name">
                                        {ticket.user.first_name} {ticket.user.last_name}
                                    </p>
                                    <p className="user-email">
                                        {ticket.user.email}
                                    </p>
                                    <p className="ticket-id">
                                        Ticket #{ticket.id}
                                    </p>
                                </div>

                                <div className="right">
                                    <img
                                        src={`${qr_base_path}${ticket.qr_image}`}
                                        className="qr"
                                        alt="QR"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .print-wrapper {
                    padding: 30px;
                    font-family: Arial, sans-serif;
                }

                .print-btn {
                    margin-bottom: 20px;
                    padding: 10px 18px;
                    cursor: pointer;
                }

                .ticket-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .ticket-card {
                    position: relative;
                    height: 260px;
                    border-radius: 8px;
                    overflow: hidden;
                    page-break-inside: avoid;
                }

                .bg-img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.55);
                }

                .content {
                    position: relative;
                    z-index: 2;
                    color: #fff;
                    padding: 15px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .event-name {
                    margin: 0;
                    font-size: 20px;
                }

                .event-date {
                    font-size: 12px;
                }

                .ticket-body {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .user-name {
                    font-weight: bold;
                    font-size: 14px;
                }

                .user-email {
                    font-size: 12px;
                }

                .ticket-id {
                    font-size: 11px;
                    margin-top: 6px;
                }

                .qr {
                    width: 110px;
                    background: #fff;
                    padding: 6px;
                    border-radius: 4px;
                }

                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .print-btn {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintCompsTickets;
