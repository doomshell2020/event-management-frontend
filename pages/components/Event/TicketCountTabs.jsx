const TicketCountTabs = ({ active, onChange, counts }) => {

    const tabBase = {
        fontSize: "14px",
        paddingBottom: "6px",
        transition: "all 0.2s ease",
    };

    const activeStyle = {
        ...tabBase,
        fontWeight: "600",
        color: "#dc3545",
        borderBottom: "2px solid #dc3545",
        cursor: "default",
    };

    const normalStyle = {
        ...tabBase,
        color: "#555",
        cursor: "pointer",
    };

    const disabledStyle = {
        ...tabBase,
        color: "#bbb",
        cursor: "not-allowed",
    };

    // helper
    const getStyle = (tab, count) => {
        if (active == tab) return activeStyle;
        if (count == 0) return disabledStyle;
        return normalStyle;
    };

    const handleClick = (tab, count) => {
        if (count == 0 || active == tab) return;
        onChange(tab);
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
  width: "100%",
  overflow: "auto",
  whiteSpace: "nowrap",
}}
        >
            {/* Ticket Count (always clickable) */}
            <li
                style={getStyle("ticket", 1)}
                onClick={() => handleClick("ticket", 1)}
            >
                Tickets
            </li>

            <li
                style={getStyle("pending", counts.pending)}
                onClick={() => handleClick("pending", counts.pending)}
            >
                Pending ({counts.pending})
            </li>

            <li
                style={getStyle("approved", counts.approved)}
                onClick={() => handleClick("approved", counts.approved)}
            >
                Approved ({counts.approved})
            </li>

            <li
                style={getStyle("ignored", counts.ignored)}
                onClick={() => handleClick("ignored", counts.ignored)}
            >
                Ignored ({counts.ignored})
            </li>

            <li
                style={getStyle("completed", counts.completed)}
                onClick={() => handleClick("completed", counts.completed)}
            >
                Completed ({counts.completed})
            </li>
        </ul>
    );
};

export default TicketCountTabs;
