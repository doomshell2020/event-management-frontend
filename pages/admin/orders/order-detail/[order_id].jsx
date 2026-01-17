import React, { useState, useEffect } from "react";
import {
    Card,
    Col,
    Row,
    Button,
    Spinner,
    Form
} from "react-bootstrap";
import { useRouter } from "next/router";
import {
    useTable,
    useSortBy,
    useGlobalFilter,
    usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import api from "@/utils/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import AsyncSelect from "react-select/async";

export const OrdersById = () => {
    const router = useRouter();
    const { order_id } = router.query;
    console.log("order_id", order_id)
    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
        },
        {
            Header: "Order Details",
            accessor: "OrderDetails",
            className: "borderrigth",
            Cell: ({ row }) => {
                const { paymenttype, RRN, order_uid } = row.original.order;

                // 👇 FREE order case
                if (paymenttype === "free") {
                    return (
                        <span
                            className="badge ms-2"
                            style={{
                                backgroundColor: "#28a745",
                                color: "#fff",
                                fontSize: "12px",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontWeight: 600,
                            }}
                        >
                            Free Ticket
                        </span>
                    );
                }

                // 👇 Paid / other cases
                return (
                    <div><strong>Order Id: </strong>
                        {order_uid || "-"}<br/>
                        <strong>Order Identifier: </strong>
                        {RRN || "-"}
                    </div>
                );
            },
        },
        {
            Header: "Customer",
            accessor: "customer",
            className: "borderrigth",
            Cell: ({ row }) => {
                const user = row.original.order.user;

                if (!user) return <span>-</span>;

                const fullName =
                    [user.first_name, user.last_name].filter(Boolean).join(" ");

                return (
                    <div>
                        <div>{fullName || "-"}</div>
                      <div>{user.email || "-"}</div>
                        {user.mobile || "-"}
                    </div>
                );
            },
        },

        {
            Header: "Ticket",
            accessor: "ticket_name",
            className: "borderrigth",
            Cell: ({ row }) => {
                const item = row.original;
                const { type } = item;

                let name = "-";
                let label = "";

                switch (type) {
                    case "ticket":
                        name = item.ticketType?.title;
                        label = "Ticket";
                        break;

                    case "comps":
                        name = item.ticketType?.title;
                        label = "Comps";
                        break;

                    case "committesale":
                        name = item.ticketType?.title;
                        label = "Committee";
                        break;

                    case "addon":
                        name = item.addonType?.name;
                        label = "Addon";
                        break;

                    case "appointment":
                        name = item.appointment?.wellnessList?.name;
                        label = "Appointment";
                        break;

                    case "package":
                        name = item.package?.name;
                        label = "Package";
                        break;

                    case "ticket_price":
                        if (item.ticketPricing?.ticket?.title) {
                            const slotName = item.ticketPricing?.slot?.slot_name;
                            name = slotName
                                ? `${item.ticketPricing.ticket.title} (${slotName})`
                                : item.ticketPricing.ticket.title;
                            label = "Ticket Price";
                        }
                        break;

                    default:
                        name = "-";
                        label = "";
                }

                return (
                    <div className="d-flex flex-column">
                        <span className="fw-semibold">{name || "-"}</span>

                        {label && (
                            <span
                                className="badge mt-1"
                                style={{
                                    backgroundColor: "#28a745",
                                    color: "#fff",
                                    fontSize: "12px",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontWeight: 600,
                                    width: "fit-content",
                                }}
                            >
                                {label}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            Header: "Order Date",
            accessor: "OrderDate",
            className: "borderrigth",
            Cell: ({ row }) => {
                const createdDate = row.original.order.created;
                return (
                    <div className="d-flex align-items-center gap-2">
                        <span>
                            {createdDate
                                ? moment(createdDate).format("DD MMM YYYY")
                                : "---"}
                        </span>
                    </div>
                );
            },
        },


    ]);
    const [orderList, setOrdersList] = useState([]);
    console.log("orderList", orderList)
    const [isLoading, setIsLoading] = useState(true);
    const getOrdersList = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get(`/api/v1/admin/orders/order-details/${order_id}`);
            setOrdersList(data?.data?.orders || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!order_id) return;
        getOrdersList();
    }, [order_id]);
    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: orderList,
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const {
        getTableProps, // table props from react-table
        headerGroups, // headerGroups, if your table has groupings
        getTableBodyProps, // table body props from react-table
        prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
        state,
        setGlobalFilter,
        page, // use, page or rows
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
        pageOptions,
        gotoPage,
        pageCount,
        setPageSize,
    } = tableInstance;

    const { globalFilter, pageIndex, pageSize } = state;
    useEffect(() => { setPageSize(50) }, []);

    return (
        <div>
            <Seo title={"Order Details Manager"} />
            <Row className="row-sm mt-4">

                <Col xl={12}>
                    <Card>
                        <Card.Header className="">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Order Details</h4>
                            </div>
                        </Card.Header>
                        <div className="table-responsive mt-4">
                            {isLoading ? (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: "33vh",
                                    }}
                                >
                                    <Spinner
                                        animation="border"
                                        role="status"
                                        variant="primary"
                                        style={{ width: "30px", height: "30px" }}
                                    >
                                        <span className="sr-only">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : (
                                <table
                                    {...getTableProps()}
                                    className="table table-bordered table-hover mb-0 text-md-nowrap"
                                >
                                    <thead>
                                        <tr>

                                            {headerGroups.map((headerGroup) => (
                                                <React.Fragment key={Math.random()}>
                                                    {headerGroup.headers.map((column) => (
                                                        <th
                                                            key={Math.random()}
                                                            {...column.getHeaderProps(
                                                                column.getSortByToggleProps()
                                                            )}
                                                            className={column.className}
                                                        >
                                                            <span className="tabletitle">
                                                                {column.render("Header")}
                                                            </span>
                                                            <span>
                                                                {column.isSorted ? (
                                                                    column.isSortedDesc ? (
                                                                        <i className="fa fa-angle-down"></i>
                                                                    ) : (
                                                                        <i className="fa fa-angle-up"></i>
                                                                    )
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </span>
                                                        </th>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                        {page.map((row) => {
                                            prepareRow(row);
                                            return (
                                                <tr key={Math.random()} {...row.getRowProps()}>

                                                    {row.cells.map((cell) => {
                                                        return (
                                                            <td
                                                                key={Math.random()}
                                                                className="borderrigth"
                                                                {...cell.getCellProps()}
                                                            >
                                                                {cell.render("Cell")}
                                                            </td>
                                                        );
                                                    })}

                                                </tr>
                                            );
                                        })}
                                        {/* TOTAL ROW */}
                                        {/* <tr style={{ fontWeight: "bold", background: "#f8f9fa" }}>
                                            <td colSpan={6} className="text-end">
                                                Total Amount :
                                            </td>
                                            <td>
                                                {formatCurrency(pageTotals.subTotal)}
                                            </td>
                                            <td>
                                                {formatCurrency(pageTotals.taxTotal)}
                                            </td>
                                        </tr> */}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="d-block d-sm-flex mt-4 ">
                            <span className="">
                                Page{" "}
                                <strong>
                                    {pageIndex + 1} of {pageOptions.length}
                                </strong>{" "}
                            </span>

                            <span className="ms-sm-auto ">
                                <Button
                                    variant=""
                                    className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                                    onClick={() => gotoPage(0)}
                                    disabled={!canPreviousPage}
                                >
                                    {" Previous "}
                                </Button>
                                <Button
                                    variant=""
                                    className="btn-default tablebutton me-2 my-1"
                                    onClick={() => {
                                        previousPage();
                                    }}
                                    disabled={!canPreviousPage}
                                >
                                    {" << "}
                                </Button>
                                <Button
                                    variant=""
                                    className="btn-default tablebutton me-2 my-1"
                                    onClick={() => {
                                        previousPage();
                                    }}
                                    disabled={!canPreviousPage}
                                >
                                    {" < "}
                                </Button>
                                <Button
                                    variant=""
                                    className="btn-default tablebutton me-2 my-1"
                                    onClick={() => {
                                        nextPage();
                                    }}
                                    disabled={!canNextPage}
                                >
                                    {" > "}
                                </Button>
                                <Button
                                    variant=""
                                    className="btn-default tablebutton me-2 my-1"
                                    onClick={() => {
                                        nextPage();
                                    }}
                                    disabled={!canNextPage}
                                >
                                    {" >> "}
                                </Button>
                                <Button
                                    variant=""
                                    className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                                    onClick={() => gotoPage(pageCount - 1)}
                                    disabled={!canNextPage}
                                >
                                    {" Next "}
                                </Button>
                            </span>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

OrdersById.layout = "Contentlayout";

export default OrdersById;
