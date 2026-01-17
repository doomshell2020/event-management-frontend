import React, { useState, useEffect } from "react";
import {
    Card,
    Col,
    Row,
    Button,
    Spinner,
    Form
} from "react-bootstrap";
import {
    useTable,
    useSortBy,
    useGlobalFilter,
    usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import api from "@/utils/api";
import Moment from "react-moment";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AsyncSelect from "react-select/async";
export const CustomerList = () => {
    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
        },
        {
            Header: "Name",
            accessor: "title",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <span>{row.original.first_name}</span></div>
            ),
        },

        {
            Header: "Email",
            accessor: "eventName",
            className: "borderrigth",
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
            Cell: ({ row }) => (
                <div>
                    {row.original.mobile ? row.original.mobile : "---"}
                </div>
            ),
        }, {
            Header: "Total Spends",
            accessor: "totalSpends",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {Number(row.original.total_spent || 0).toLocaleString('en-IN')}
                </div>
            ),
        },
        {
            Header: "Created",
            accessor: "created",
            className: "borderrigth",
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
        {
            Header: "Status",
            accessor: "status",
            className: "borderrigth",
            Cell: ({ row }) => {
                const { id, status } = row.original;

                return (
                    <div className="d-flex align-items-center justify-content-center gap-3">

                        {/* Status Switch */}
                        <div className="form-check form-switch m-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                style={{ cursor: "pointer" }}
                                checked={status === "Y"}
                                onChange={() => handleStatusToggle(id, status)}
                            />
                        </div>

                        {/* Resend Button */}
                        {status === "Y" ? (
                            // ✅ Already Verified
                            <button
                                className="btn btn-success btn-sm d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px", cursor: "not-allowed" }}
                                title="Email already verified"
                                disabled
                            >
                                <i className="fe fe-check" />
                            </button>
                        ) : (
                            // ❌ Not Verified → Resend Email
                            <button
                                className="btn btn-primary btn-sm d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px" }}
                                title="Resend Verification Email"
                                onClick={() => handleSendEmail(id)}
                            >
                                <i className="fe fe-mail" />
                            </button>
                        )}


                    </div>
                );
            },
        }

        // {
        //     Header: "Action",
        //     accessor: "action",
        //     className: "borderrigth",
        //     Cell: ({ row }) => (
        //         <div
        //             style={{
        //                 display: "flex",
        //                 gap: "8px",
        //                 justifyContent: "center",
        //                 alignItems: "center",
        //             }}
        //         >
        //             {/* Edit Button */}
        //             <button
        //                 className="btn btn-sm"
        //                 style={{ backgroundColor: "#20c997", color: "white" }}
        //                 type="button"
        //                 onClick={() => handleEdit(row.original.id)}
        //             >
        //                 <i className="bi bi-pencil-square"></i>
        //             </button></div>
        //     ),
        // },
    ]);
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [status, setStatus] = useState("");
    const handleSendEmail = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to resend the verification email to this customer?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Send Email",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#20c997",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: "Sending email...",
                text: "Please wait",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading(),
            });

            await api.post(`/api/v1/admin/customers/resend-verification-email`, {
                userId: id,
            });

            Swal.fire({
                icon: "success",
                title: "Email Sent",
                text: "Verification email has been sent successfully.",
                timer: 1500,
                showConfirmButton: false,
            });

        } catch (error) {
            console.error("Email sending failed", error);

            // ✅ Extract API message safely
            const apiMessage =
                error?.response?.data?.message ||
                "Unable to send verification email. Please try again.";

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: apiMessage,
            });
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === "Y" ? "N" : "Y";
        const statusText = newStatus === "Y" ? "Activate" : "Deactivate";
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${statusText} this Customer?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Yes, ${statusText}`,
            cancelButtonText: "Cancel",
            confirmButtonColor: "#20c997",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        // Optimistic UI update
        setCustomers(prev =>
            prev.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            )
        );

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

            await api.put(`/api/v1/admin/customers/update-status/${id}`, {
                status: newStatus,
            });

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
            setCustomers(prev =>
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

    const getCustomers = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get("/api/v1/admin/customers");
            setCustomers(data?.data?.customers || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getCustomers();
    }, []);

    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: customers,
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
    const formatDate = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const formattedFromDate = formatDate(fromDate);
            const formattedToDate = formatDate(toDate);
            const response = await api.get("/api/v1/admin/customers/search", {
                params: {
                    first_name: firstName,
                    email,
                    status:status,
                    fromDate: formattedFromDate,
                    toDate: formattedToDate,
                },
            });
            setCustomers(response?.data?.data?.customers); // Save API results in state
        } catch (error) {
            console.error("Error fetching events:", error);
            setCustomers([]);
        }
    };

    const handleReset = () => {
        setFirstName("");
        setEmail("");
        setFromDate(null);
        setToDate(null);
        setCustomers([]);
        getCustomers();
        setSelectedEmail(null);
        setSelectedCustomer(null);
        setStatus("");
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
            <Seo title={"Customer Manager"} />
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
                                {/* <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value.trim())}

                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value.trim())}
                                    />
                                </Form.Group> */}

                                <Form.Group className="mb-3">
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

                                <Form.Group className="mb-3" controlId="formStatus">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Y">Active</option>
                                        <option value="N">Inactive</option>
                                    </Form.Select>
                                </Form.Group>






                                <Form.Group className="mb-3" controlId="formDateFrom">
                                    <Form.Label>From Date</Form.Label>
                                    <div style={{ width: "127%" }}>
                                        <DatePicker
                                            selected={fromDate}
                                            onChange={(date) => {
                                                setFromDate(date);

                                                // Reset To Date if it is smaller than From Date
                                                if (toDate && date && toDate < date) {
                                                    setToDate(null);
                                                }
                                            }}
                                            dateFormat="dd-MM-yyyy"
                                            placeholderText="DD-MM-YY"
                                            className="form-control"
                                            wrapperClassName="w-100"
                                            maxDate={toDate || null}   // optional (UX improvement)
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formDateTo">
                                    <Form.Label>To Date</Form.Label>
                                    <div style={{ width: "127%" }}>
                                        <DatePicker
                                            selected={toDate}
                                            onChange={(date) => setToDate(date)}
                                            dateFormat="dd-MM-yyyy"
                                            placeholderText="DD-MM-YY"
                                            className="form-control"
                                            wrapperClassName="w-100"
                                            disabled={!fromDate}      // ✅ Disable until From Date selected
                                            minDate={fromDate}        // ✅ Cannot select smaller date
                                        />
                                    </div>
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
                                <h4 className="card-title mg-b-0">Customer Manager</h4>
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

CustomerList.layout = "Contentlayout";

export default CustomerList;
