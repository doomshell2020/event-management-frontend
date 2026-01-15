import React, { useState, useEffect } from "react";
import {
    Modal,
    Card,
    Col,
    Row,
    Button,
    Spinner,
    Alert,
    Collapse,
    Form
} from "react-bootstrap";
import {
    useTable,
    useSortBy,
    useGlobalFilter,
    usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import axios from "axios";
import Link from "next/link";
import api from "@/utils/api";
import Moment from "react-moment";
import Swal from "sweetalert2";
import AsyncSelect from "react-select/async";
import { useRouter } from "next/router";

export const EventOrganizersList = () => {
    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
            style: { width: "5%" },
        },
        {
            Header: "Name",
            accessor: "title",
            className: "borderrigth",
            style: { width: "15%" },
            Cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <span>{row.original.first_name}{" "}{row.original.last_name}</span></div>
            ),
        },

        {
            Header: "Email",
            accessor: "eventName",
            className: "borderrigth",
            style: { width: "15%" },
            Cell: ({ row }) => (
                <div>
                    {row.original.email ? row.original.email : "---"}
                </div>
            ),
        },
        {
            Header: "Mobile",
            accessor: "mobile",
            className: "borderrigth",
            style: { width: "15%" },
            Cell: ({ row }) => (
                <div>
                    {row.original.mobile ? row.original.mobile : "---"}
                </div>
            ),
        },


        {
            Header: "Events & Revenue",
            accessor: "events",
            className: "borderrigth",
            style: { width: "25%" },
            Cell: ({ row }) => {
                const events = row.original.events || [];

                if (!events.length) {
                    return (
                        <span style={{ fontSize: "12px", color: "#010101ff" }}>
                            No events organized
                        </span>
                    );
                }
                return (
                    <div className="d-flex flex-column gap-2">
                        {events.map((event, index) => {
                            const currency = event.currencyName?.Currency_symbol || "₹";
                            return (
                                <div
                                    key={event.id}
                                    style={{
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "6px",
                                        padding: "8px",
                                        backgroundColor: "#F9FAFB",
                                        fontSize: "12px"
                                    }}
                                >
                                    {/* Event Name */}
                                    <div style={{ fontWeight: "600", color: "#111827" }}>
                                        {index + 1}. {event.name}
                                    </div>

                                    {/* Totals */}
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "12px",
                                            marginTop: "4px",
                                            color: "#374151"
                                        }}
                                    >
                                        <span>
                                            <strong>Total Sales:</strong>{" "}
                                            {formatCurrency(event.total_sales, currency)}
                                            {/* {event.total_sales !== null
                                                ? `${currency}${event.total_sales}`
                                                : "0"} */}
                                        </span>

                                        <span>
                                            <strong>Comm:</strong>{" "}
                                            {formatCurrency(event.total_tax, currency)}
                                            {/* {event.total_tax !== null
                                                ? `${currency}${event.total_tax}`
                                                : "0"} */}
                                        </span>

                                        <span>
                                            <strong>Total:</strong>{" "}
                                            {formatCurrency(event.grand_total, currency)}
                                            {/* {event.grand_total !== null
                                                ? `${currency}${event.grand_total}`
                                                : "0"} */}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            }
        },

        {
            Header: "Created",
            accessor: "created",
            className: "borderrigth",
            style: { width: "10%" },
            Cell: ({ row }) => (
                <div>
                    {row.original.createdAt ? (
                        <Moment format="DD MMM YYYY">
                            {row.original.createdAt}
                        </Moment>
                    ) : (
                        "---"
                    )}
                </div>
            ),
        },


        // {
        //     Header: "Events",
        //     accessor: "events",
        //     className: "borderrigth",
        //     Cell: ({ row }) => {
        //         const events = row.original.events || [];
        //         if (!events.length) return <span style={{ fontSize: "12px" }}>
        //             No events organized
        //         </span>;
        //         return (
        //             <div style={{ fontSize: "13px", color: "#374151" }}>
        //                 {events.map((e, i) => (
        //                     <div key={e.id}>
        //                         {i + 1}. {e.name}
        //                     </div>
        //                 ))}
        //             </div>
        //         );

        //     },
        // },




        {
            Header: "Action",
            accessor: "action",
            className: "borderrigth",
            Cell: ({ row }) => {
                const { id, status } = row.original;

                return (
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {/* Status Toggle */}
                        <div className="form-check form-switch d-flex justify-content-center">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                style={{ cursor: "pointer" }}
                                checked={status === "Y"}
                                onChange={() => handleStatusToggle(id, status)}
                            />
                        </div>

                        {/* Edit Button */}
                        <button
                            className="btn btn-sm"
                            style={{ backgroundColor: "#20c997", color: "white" }}
                            type="button"
                            onClick={() => handleEdit(id)}
                        >
                            <i className="bi bi-pencil-square"></i>
                        </button>
                    </div>
                );
            },
        }

    ]);
    let navigate = useRouter();
    const [OrganizerList, setOrganizerList] = useState([]);
    // console.log("----", OrganizerList);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [mobile, setMobile] = useState("");


    const formatCurrency = (value, symbol = "₹") => {
        const num = Number(value || 0);
        return `${symbol}${num.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };



    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === "Y" ? "N" : "Y";
        const statusText = newStatus === "Y" ? "Activate" : "Deactivate";

        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${statusText} this Event Organizer?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Yes, ${statusText}`,
            cancelButtonText: "Cancel",
            confirmButtonColor: "#20c997",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;



        try {
            Swal.fire({
                title: "Updating status...",
                text: "Please wait",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            await api.put(`/api/v1/admin/event-organizer/update-status/${id}`, {
                status: newStatus,
            });
            getEventOrganizers();
            Swal.fire({
                icon: "success",
                title: "Success",
                text: `Status updated successfully`,
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Status update failed", error);

            // rollback
            setOrganizerList(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, status: currentStatus } : item
                )
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Unable to update status. Please try again.",
            });
        }
    };

    const getEventOrganizers = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/v1/admin/event-organizer");
            setOrganizerList(data?.data?.eventOrganizers || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getEventOrganizers();
    }, []);
    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: OrganizerList,
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
    const handleEdit = (id) => {
        navigate.push(`/admin/event-organizers/${id}`);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await api.get("/api/v1/admin/event-organizer/search", {
                params: {
                    first_name: firstName,
                    email: email,
                    mobile: mobile
                },
            });
            setOrganizerList(response?.data?.data?.eventOrganizers); // Save API results in state
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrganizerList([]);
        }
    };

    const handleReset = () => {
        setFirstName("");
        setEmail("");
        setMobile("");
        setSelectedCustomer(null);   // 👈 THIS WAS MISSING
        setSelectedEmail(null);   // 👈 THIS WAS MISSING
        setOrganizerList([]);
        getEventOrganizers();
    };


    const loadUserOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];
        try {
            const response = await api.get(
                "/api/v1/admin/customers/first-name/search",
                {
                    params: {
                        search: inputValue, // 👈 backend expects this
                    },
                }
            );
            const data = response.data;
            if (data?.success) {
                return data.data.customers.map((user) => ({
                    value: user.id,
                    label: user.first_name, // 👈 correct key
                    user,
                }));
            }

            return [];
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    };

    const handleUserSelect = (selectedOption) => {
        setSelectedCustomer(selectedOption); // 👈 dropdown control

        if (selectedOption) {
            setFirstName(selectedOption.user.first_name);
        } else {
            setFirstName("");
        }
    };

    const loadUserEmailOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];
        try {
            const response = await api.get(
                "/api/v1/admin/customers/email/search",
                {
                    params: {
                        search: inputValue, // 👈 backend expects this
                    },
                }
            );
            const data = response.data;
            if (data?.success) {
                return data.data.customers.map((user) => ({
                    value: user.id,
                    label: user.email, // 👈 correct key
                    user,
                }));
            }

            return [];
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    };

    const handleUserEmailSelect = (selectedOption) => {
        setSelectedEmail(selectedOption); // 👈 dropdown control

        if (selectedOption) {
            setEmail(selectedOption.user.email);
        } else {
            setEmail("");
        }
    };











    return (
        <div>
            <Seo title={"Event Organizer Manager"} />
            <Row className="row-sm mt-4">

                <Col xl={2}>
                    <Card className="member-fltr-hid">
                        <Card.Header>
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Filters</h4>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-2">
                            <Form onSubmit={handleSearch}>
                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>First Name</Form.Label>
                                    <AsyncSelect
                                        className="search-dropdown"
                                        cacheOptions
                                        loadOptions={loadUserOptions}
                                        value={selectedCustomer}
                                        onChange={handleUserSelect}
                                        placeholder="Search by name"
                                        isClearable
                                        getOptionLabel={(option) => option.user.first_name}
                                        getOptionValue={(option) => option.value}
                                        formatOptionLabel={(option, { context }) => {
                                            if (context === "menu") {
                                                return (
                                                    <div>
                                                        <strong>{option.user.first_name}</strong>
                                                    </div>
                                                );
                                            }
                                            return option.user.first_name;
                                        }}
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 1050,
                                            }),
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <AsyncSelect
                                        className="search-dropdown"
                                        cacheOptions
                                        loadOptions={loadUserEmailOptions}
                                        value={selectedEmail}
                                        onChange={handleUserEmailSelect}
                                        placeholder="Search by email"
                                        isClearable
                                        getOptionLabel={(option) => option.user.email}
                                        getOptionValue={(option) => option.value}
                                        formatOptionLabel={(option, { context }) => {
                                            if (context === "menu") {
                                                return (
                                                    <div>
                                                        <strong>{option.user.email}</strong>
                                                    </div>
                                                );
                                            }
                                            return option.user.email;
                                        }}
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 1050,
                                            }),
                                        }}
                                    />
                                </Form.Group>







                                {/* <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value.trim())}
                                    />
                                </Form.Group> */}

                                <Form.Group className="mb-3" controlId="phone">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Phone"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                    />
                                </Form.Group>




                                <div className="d-flex align-items-end justify-content-between">
                                    <Button
                                        variant="primary "
                                        className="me-2 w-50"
                                        type="submit"
                                    >
                                        Submit
                                    </Button>
                                    <Button variant="secondary" className="w-50" type="reset" onClick={handleReset}>
                                        Reset
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>


                <Col xl={10}>
                    <Card>
                        <Card.Header className="">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Event Organizer Manager</h4>
                                <div>
                                    <Link
                                        className="btn ripple btn-info btn-sm"
                                        href="/admin/event-organizers/create"
                                    >
                                        + ADD
                                    </Link>
                                </div>
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
                                                            style={column.style}
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
                                                    {/* <th>Actions</th> */}
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                        {page.map((row) => {
                                            prepareRow(row);
                                            const rowId = row.original.id; // Assuming `id` is present in row.original
                                            const rowData = row.original; // Assuming `id` is present in row.original
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

EventOrganizersList.layout = "Contentlayout";

export default EventOrganizersList;
