const TicketCountTabs = ({ active, onChange, counts }) => {
    const tabBase = {
        cursor: "pointer",
        fontSize: "14px",
        paddingBottom: "6px",
        transition: "all 0.2s ease",
    };

    const activeStyle = {
        ...tabBase,
        fontWeight: "600",
        color: "#dc3545",
        borderBottom: "2px solid #dc3545",
    };

    const normalStyle = {
        ...tabBase,
        color: "#555",
    };

    return (
        <ul
            style={{
                listStyle: "none",
                display: "flex",
                gap: "26px",
                padding: 0,
                margin: 0,
                borderBottom: "1px solid #e5e5e5",
                paddingBottom: "10px",
            }}
        >
            <li
                style={active === "ticket" ? activeStyle : normalStyle}
                onClick={() => onChange("ticket")}
            >
                Ticket Count
            </li>
            <li
                style={active === "pending" ? activeStyle : normalStyle}
                onClick={() => onChange("pending")}
            >
                Pending ({counts.pending})
            </li>
            <li
                style={active === "approved" ? activeStyle : normalStyle}
                onClick={() => onChange("approved")}
            >
                Approved ({counts.approved})
            </li>
            <li
                style={active === "ignored" ? activeStyle : normalStyle}
                onClick={() => onChange("ignored")}
            >
                Ignored ({counts.ignored})
            </li>
            <li
                style={active === "completed" ? activeStyle : normalStyle}
                onClick={() => onChange("completed")}
            >
                Completed ({counts.completed})
            </li>
        </ul>
    );
};
export default TicketCountTabs;