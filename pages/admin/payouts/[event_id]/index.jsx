import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    Col,
    Row,
    Button,
    Spinner,
    Form,
    Modal
} from "react-bootstrap";
import { useTable, usePagination } from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import api from "@/utils/api";
import { formatEventDateTime } from "@/utils/formatDate";
import { useRouter } from "next/router";

const PayoutsList = () => {
    /* ================= ROUTER ================= */
    const router = useRouter();
    const { event_id: routeEventId } = router.query;

    /* ================= STATE ================= */
    const [payouts, setPayouts] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    /* Filters */
    const [eventId, setEventId] = useState("all"); // default "all"
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    /* Modal */
    const [show, setShow] = useState(false);
    const [modalEvent, setModalEvent] = useState("");
    const [amount, setAmount] = useState("");
    const [txnRef, setTxnRef] = useState("");
    const [remarks, setRemarks] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    /* ================= FETCH ================= */
    const fetchPayouts = async (params = {}) => {
        try {
            console.log('params :', params);
            setLoading(true);
            const { data } = await api.get("/api/v1/admin/payouts/list", { params });
            setPayouts(data?.data?.payouts || []);
            setEvents(data?.data?.events || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* ================= ROUTE BASED LOAD ================= */
    useEffect(() => {
        if (!router.isReady) return;

        if (routeEventId) {
            setEventId(routeEventId);
            setModalEvent(routeEventId);
            fetchPayouts({ event_id: routeEventId });
        } else {
            fetchPayouts();
        }
    }, [router.isReady, routeEventId]);

    /* ================= FILTER ================= */
    const applyFilter = (e) => {
        e.preventDefault();
        const params = {};

        if (eventId && eventId !== "all") {
            params.event_id = eventId; // only send real event id
        }

        if (fromDate) {
            params.from = moment(fromDate).format("YYYY-MM-DD");
        }

        if (toDate) {
            params.to = moment(toDate).format("YYYY-MM-DD");
        }

        fetchPayouts(params);
    };


    const resetFilter = () => {
        setFromDate(null);
        setToDate(null);
        setEventId("all"); // reset to All

        // On reset, fetch all payouts regardless of routeEventId
        fetchPayouts();
    };


    /* ================= SUMMARY ================= */
    const summary = useMemo(() => {
        return payouts.reduce(
            (acc, p) => {
                acc.payable += Number(p.payable_amount || 0);
                acc.paid += Number(p.paid_amount || 0);
                return acc;
            },
            { payable: 0, paid: 0 }
        );
    }, [payouts]);

    const balance = summary.payable - summary.paid;

    /* ================= EVENT FILTER OPTIONS ================= */
    // Use events directly so filter works even when payouts are empty
    const filterEvents = useMemo(() => events, [events]);

    /* ================= TABLE ================= */
    const columns = useMemo(
        () => [
            { Header: "Sr No", Cell: ({ row }) => row.index + 1 },
            { Header: "Event", accessor: row => row.event?.name || "-" },
            {
                Header: "Organizer",
                accessor: row => {
                    const org = row.event?.Organizer;
                    return org ? `${org.first_name} ${org.last_name}` : "-";
                }
            },
            {
                Header: "Paid Amount",
                accessor: row => {
                    const currency = row.event?.currencyName?.Currency_symbol || "₹";
                    return `${currency}${row.paid_amount}`;
                }
            },
            { Header: "Txn Ref", accessor: "txn_ref" },
            { Header: "Remarks", accessor: "remarks" },
            { Header: "Created At", accessor: row => formatEventDateTime(row.createdAt) }
        ],
        []
    );

    const table = useTable({ columns, data: payouts }, usePagination);
    const { getTableProps, getTableBodyProps, headerGroups, prepareRow, page } = table;

    /* ================= CREATE PAYOUT ================= */
    const submitPayout = async () => {
        setSubmitted(true);
        if (!modalEvent || !amount || !txnRef) return;

        try {
            setSubmitting(true);
            const { data } = await api.post("/api/v1/admin/payouts/create-pay", {
                event_id: modalEvent,
                paid_amount: amount,
                txn_ref: txnRef,
                remarks
            });
            setPayouts(data?.data?.payouts || []);
            setEvents(data?.data?.events || []);
            setShow(false);
            setAmount("");
            setTxnRef("");
            setRemarks("");
            setSubmitted(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    /* ================= UI ================= */
    return (
        <div>
            <Seo title="Payout Manager" />

            <Row className="mt-3">
                {/* FILTER */}
                <Col xl={2}>
                    <Card className="shadow-sm">
                        <Card.Header>
                            <h5 className="mb-0">Filters</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={applyFilter}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Event</Form.Label>
                                    <Form.Select
                                        value={eventId}
                                        onChange={e => setEventId(e.target.value)}
                                    >
                                        <option value="all">All Events</option>
                                        {filterEvents.map(ev => (
                                            <option key={ev.id} value={ev.id}>
                                                {ev.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>From</Form.Label>
                                    <DatePicker
                                        selected={fromDate}
                                        onChange={setFromDate}
                                        className="form-control"
                                        placeholderText="DD/MM/YYYY"
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>To</Form.Label>
                                    <DatePicker
                                        selected={toDate}
                                        onChange={setToDate}
                                        className="form-control"
                                        minDate={fromDate}
                                        placeholderText="DD/MM/YYYY"
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </Form.Group>

                                <Button type="submit" className="w-100 mb-2">
                                    Apply
                                </Button>
                                <Button variant="secondary" className="w-100" onClick={resetFilter}>
                                    Reset
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* TABLE */}
                <Col xl={10}>
                    <Card className="shadow-sm">
                        <Card.Header className="d-flex justify-content-between">
                            <h5 className="mb-0">Payouts</h5>
                            <Button onClick={() => setShow(true)}>New Payout</Button>
                        </Card.Header>

                        <div className="table-responsive">
                            {loading ? (
                                <div className="text-center p-5">
                                    <Spinner />
                                </div>
                            ) : (
                                <table {...getTableProps()} className="table table-hover mb-0">
                                    <thead className="table-light">
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

            {/* MODAL */}
            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create Payout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Event</Form.Label>
                            <Form.Select
                                value={modalEvent}
                                onChange={e => setModalEvent(e.target.value)}
                                isInvalid={submitted && !modalEvent}
                            >
                                <option value="">Select Event</option>
                                {events.map(ev => (
                                    <option key={ev.id} value={ev.id}>
                                        {ev.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Paid Amount</Form.Label>
                            <Form.Control
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                isInvalid={submitted && !amount}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Transaction Ref</Form.Label>
                            <Form.Control
                                value={txnRef}
                                onChange={e => setTxnRef(e.target.value)}
                                isInvalid={submitted && !txnRef}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Remarks</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={submitPayout} disabled={submitting}>
                        {submitting ? "Saving..." : "Confirm"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

PayoutsList.layout = "Contentlayout";
export default PayoutsList;
