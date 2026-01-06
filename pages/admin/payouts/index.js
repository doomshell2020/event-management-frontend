import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    Col,
    Row,
    Button,
    Spinner,
    Form,
    Modal,
    Badge
} from "react-bootstrap";
import {
    useTable,
    useSortBy,
    usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

/* ---------------- MOCK DATA ---------------- */
const EVENTS = [
    { id: 1, name: "January Event" },
    { id: 2, name: "Music Night" },
];

const PAYOUTS = [
    {
        id: 1,
        event_id: 1,
        event: { name: "January Event", currency: "$" },
        total_sales: 15000,
        admin_commission: 1500,
        payable_amount: 13500,
        paid_amount: 5000,
        status: "partial",
        created_at: "2026-01-15T10:00:00Z",
    },
    {
        id: 2,
        event_id: 2,
        event: { name: "Music Night", currency: "$" },
        total_sales: 8000,
        admin_commission: 800,
        payable_amount: 7200,
        paid_amount: 7200,
        status: "paid",
        created_at: "2026-01-12T11:30:00Z",
    },
];

const PayoutsList = () => {
    const [payouts, setPayouts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);

    /* Filters */
    const [eventId, setEventId] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    /* Modal */
    const [show, setShow] = useState(false);
    const [active, setActive] = useState(null); // selected payout or new
    const [amount, setAmount] = useState("");
    const [txnRef, setTxnRef] = useState("");
    const [remarks, setRemarks] = useState("");

    /* New Payout Mode */
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setPayouts(PAYOUTS);
            setFiltered(PAYOUTS);
            setLoading(false);
        }, 500);
    }, []);

    /* ---------------- FILTER ---------------- */
    const handleSearch = (e) => {
        e.preventDefault();
        let data = [...payouts];

        if (eventId) data = data.filter(p => p.event_id === Number(eventId));
        if (fromDate) data = data.filter(p => moment(p.created_at).isSameOrAfter(fromDate, "day"));
        if (toDate) data = data.filter(p => moment(p.created_at).isSameOrBefore(toDate, "day"));

        setFiltered(data);
    };

    const resetFilter = () => {
        setEventId("");
        setFromDate(null);
        setToDate(null);
        setFiltered(payouts);
    };

    /* ---------------- SUMMARY ---------------- */
    const summary = useMemo(() => {
        return filtered.reduce(
            (acc, p) => {
                acc.sales += p.total_sales;
                acc.paid += p.paid_amount;
                acc.payable += p.payable_amount;
                return acc;
            },
            { sales: 0, paid: 0, payable: 0 }
        );
    }, [filtered]);

    /* ---------------- TABLE ---------------- */
    const columns = useMemo(() => [
        { Header: "Event", accessor: row => row.event.name },
        {
            Header: "Total Sale",
            Cell: ({ row }) => `${row.original.event.currency} ${row.original.total_sales}`
        },
        {
            Header: "Paid",
            Cell: ({ row }) => `${row.original.event.currency} ${row.original.paid_amount}`
        },
        {
            Header: "Balance",
            Cell: ({ row }) => {
                const bal = row.original.payable_amount - row.original.paid_amount;
                return `${row.original.event.currency} ${bal}`;
            }
        },
        {
            Header: "Status",
            Cell: ({ row }) => (
                <Badge bg={row.original.status === "paid" ? "success" : "warning"}>
                    {row.original.status.toUpperCase()}
                </Badge>
            )
        },
        {
            Header: "Created At",
            Cell: ({ row }) => moment(row.original.created_at).format("DD MMM YYYY hh:mm A")
        },
        {
            Header: "Action",
            Cell: ({ row }) =>
                row.original.status !== "paid" && (
                    <Button size="sm" onClick={() => {
                        setActive(row.original);
                        setAmount("");
                        setTxnRef("");
                        setRemarks("");
                        setIsNew(false);
                        setShow(true);
                    }}>
                        Pay Now
                    </Button>
                )
        }
    ], []);

    const tableInstance = useTable(
        { columns, data: filtered },
        useSortBy,
        usePagination
    );

    const { getTableProps, headerGroups, getTableBodyProps, prepareRow, page } = tableInstance;

    /* ---------------- VALIDATION ---------------- */
    const validate = () => {
        if (!active) return false;
        const balance = isNew ? active.payable_amount : active.payable_amount - active.paid_amount;

        if (!amount || amount <= 0) return false;
        if (amount > balance) return false;
        if (!txnRef) return false;
        return true;
    };

    const submitPayout = () => {
        if (!validate()) return;

        if (isNew) {
            // Create new payout mock
            const newPayout = {
                id: payouts.length + 1,
                event_id: active.id,
                event: { name: active.name, currency: "$" },
                total_sales: active.total_sales || 0,
                admin_commission: active.admin_commission || 0,
                payable_amount: active.total_sales || 0,
                paid_amount: amount,
                status: amount >= (active.total_sales || 0) ? "paid" : "partial",
                created_at: new Date().toISOString(),
            };
            setPayouts(prev => [newPayout, ...prev]);
            setFiltered(prev => [newPayout, ...prev]);
        } else {
            // Update existing payout mock
            setPayouts(prev => prev.map(p => p.id === active.id
                ? { ...p, paid_amount: p.paid_amount + Number(amount), status: p.paid_amount + Number(amount) >= p.payable_amount ? "paid" : "partial" }
                : p
            ));
            setFiltered(prev => prev.map(p => p.id === active.id
                ? { ...p, paid_amount: p.paid_amount + Number(amount), status: p.paid_amount + Number(amount) >= p.payable_amount ? "paid" : "partial" }
                : p
            ));
        }

        setShow(false);
    };

    return (
        <div>
            <Seo title="Payout Manager" />

            <Row className="mt-4">
                {/* FILTER PANEL */}
                <Col xl={2}>
                    <Card>
                        <Card.Header><h5>Filters</h5></Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSearch}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Event</Form.Label>
                                    <Form.Select value={eventId} onChange={e => setEventId(e.target.value)}>
                                        <option value="">All</option>
                                        {EVENTS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>From</Form.Label>
                                    <DatePicker selected={fromDate} onChange={setFromDate} className="form-control" />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>To</Form.Label>
                                    <DatePicker selected={toDate} onChange={setToDate} className="form-control" minDate={fromDate} />
                                </Form.Group>

                                <Button type="submit" className="w-100 mb-2">Apply</Button>
                                <Button variant="secondary" className="w-100" onClick={resetFilter}>Reset</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* TABLE PANEL */}
                <Col xl={10}>
                    <Row className="mb-3">
                        <Col md={3}><Card className="p-3"><h6>Total Sales</h6><h4>${summary.sales}</h4></Card></Col>
                        <Col md={3}><Card className="p-3"><h6>Payable</h6><h4>${summary.payable}</h4></Card></Col>
                        <Col md={3}><Card className="p-3"><h6>Paid</h6><h4 className="text-success">${summary.paid}</h4></Card></Col>
                        <Col md={3}><Card className="p-3"><h6>Balance</h6><h4 className="text-danger">${summary.payable - summary.paid}</h4></Card></Col>
                    </Row>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h4>Payouts</h4>
                        <Button variant="primary" onClick={() => {
                            setActive({});
                            setIsNew(true);
                            setAmount("");
                            setTxnRef("");
                            setRemarks("");
                            setShow(true);
                        }}>New Payout</Button>
                    </div>

                    <Card>
                        <div className="table-responsive">
                            {loading ? (
                                <div className="text-center p-5"><Spinner /></div>
                            ) : (
                                <table {...getTableProps()} className="table table-bordered">
                                    <thead>
                                        {headerGroups.map(hg => (
                                            <tr {...hg.getHeaderGroupProps()}>
                                                {hg.headers.map(col => (
                                                    <th {...col.getHeaderProps()}>{col.render("Header")}</th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                        {page.map(row => {
                                            prepareRow(row);
                                            return (
                                                <tr {...row.getRowProps()}>
                                                    {row.cells.map(cell => (
                                                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* PAYOUT MODAL */}
            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{isNew ? "Create New Payout" : "Payout to Organizer"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Event Selection */}
                        <Form.Group className="mb-3">
                            <Form.Label>Select Event</Form.Label>
                            <Form.Select
                                value={active?.id || ""}
                                onChange={(e) => {
                                    const selectedEvent = EVENTS.find(ev => ev.id == parseInt(e.target.value));
                                    setActive(selectedEvent);
                                    setAmount("");
                                    setTxnRef("");
                                    setRemarks("");
                                }}
                                isInvalid={!active?.id}
                            >
                                <option value="">-- Select Event --</option>
                                {EVENTS.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {active?.id && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Amount</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        isInvalid={amount <= 0 || (!isNew && amount > active.payable_amount - active.paid_amount)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Transaction Ref</Form.Label>
                                    <Form.Control
                                        value={txnRef}
                                        onChange={(e) => setTxnRef(e.target.value)}
                                        isInvalid={!txnRef}
                                    />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Remarks</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </Form.Group>
                            </>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                    <Button
                        variant="success"
                        onClick={submitPayout}
                        disabled={!validate()}
                    >
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

PayoutsList.layout = "Contentlayout";
export default PayoutsList;
