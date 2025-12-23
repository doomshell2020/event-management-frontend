const CommitteeRequestTable = ({ data }) => {
    return (
        <div style={{ marginTop: "20px" }}>
            {/* TABLE HEADER */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 200px 200px",
                    background: "#2f2f2f",
                    color: "#fff",
                    padding: "12px",
                    fontWeight: "600",
                    fontSize: "14px",
                }}
            >
                <div>Image</div>
                <div>Name</div>
                <div>Ticket</div>
                <div>Action</div>
            </div>

            {/* TABLE ROWS */}
            {data.length === 0 ? (
                <div
                    style={{
                        padding: "20px",
                        textAlign: "center",
                        border: "1px solid #ddd",
                    }}
                >
                    No data found
                </div>
            ) : (
                data.map((row, index) => (
                    <div
                        key={index}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "120px 1fr 200px 200px",
                            alignItems: "center",
                            padding: "16px 12px",
                            borderBottom: "1px solid #ddd",
                            background: "#fff",
                        }}
                    >
                        {/* IMAGE */}
                        <div>
                            <img
                                src={row.image}
                                alt="User"
                                style={{
                                    width: "70px",
                                    height: "70px",
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                    border: "1px solid #ddd",
                                }}
                            />
                        </div>

                        {/* NAME */}
                        <div>
                            <div style={{ fontWeight: "600" }}>{row.userName}</div>
                            <div style={{ fontSize: "13px", color: "#666" }}>
                                {row.eventName}
                            </div>
                        </div>

                        {/* TICKET */}
                        <div>
                            <div>{row.price}</div>
                            <button
                                style={{
                                    marginTop: "6px",
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    background: "#198754",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                ✉
                            </button>
                        </div>

                        {/* ACTION */}
                        <div>
                            <button
                                style={{
                                    padding: "6px 12px",
                                    background: "#0d6efd",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    marginRight: "8px",
                                    cursor: "pointer",
                                }}
                            >
                                Approve
                            </button>
                            <button
                                style={{
                                    padding: "6px 12px",
                                    background: "#dc3545",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                Ignore
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
