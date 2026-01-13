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

export const StaffList = () => {
    const router = useRouter();
    const { event_id } = router.query;
    const [orderList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [event, setEvent] = useState("");
    const [customer, setCustomer] = useState("");
    const [email, setEmail] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const COLUMNS = React.useMemo(() => [
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
        },
        {
            Header: "First Name",
            accessor: "first_name",
            className: "borderrigth",
            Cell: ({ row }) => row.original.first_name || "-",
        },
        {
            Header: "Last Name",
            accessor: "last_name",
            className: "borderrigth",
            Cell: ({ row }) => row.original.last_name || "-",
        },
        {
            Header: "Email",
            accessor: "email",
            className: "borderrigth",
            Cell: ({ row }) => row.original.email || "-",
        },
        {
            Header: "Event",
            accessor: "event",
            className: "borderrigth",
            Cell: () => event || "-", // ✅ NOW WORKS
        },
    ], [event]); // 🔥 VERY IMPORTANT





    const getStaffList = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get(`/api/v1/admin/events/${event_id}/staff`);
            setStaffList(data?.data?.staff || []);
        } catch (err) {
            console.error("Error fetching event organizers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!event_id) return;
        getStaffList();
    }, [event_id]);

    useEffect(() => {
        if (!event_id) return;

        const fetchEventById = async () => {
            try {
                const response = await api.get(`/api/v1/admin/events/event-details/${event_id}`);
                const data = response.data;
                if (data?.success) {
                    const eventObj = data.data.event;
                    const option = {
                        value: eventObj.id,
                        label: eventObj.name,
                        event: eventObj,
                    };
                    setSelectedEvent(option); // 👈 AsyncSelect default fill
                    setEvent(eventObj.name);  // 👈 your normal state
                }
            } catch (error) {
                console.error("Error fetching event by id:", error);
            }
        };

        fetchEventById();
    }, [event_id]);



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
    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await api.get("/api/v1/admin/events/staff-search", {
                params: {
                    first_name:customer,
                    event_id: event_id,
                    email: email, 
                },
            });
            // console.log("0-response.data", response?.data?.data?.events)
            setStaffList(response?.data?.data?.staff); // Save API results in state
        } catch (error) {
            console.error("Error fetching staff:", error);
            setStaffList([]);
        }
    };

    const handleReset = () => {
        setCustomer("");
        setEmail("");
        setSelectedCustomer(null);   // 👈 THIS WAS MISSING
        setStaffList([]);
        getStaffList();
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
            setCustomer(selectedOption.user.first_name);
        } else {
            setCustomer("");
        }
    };

    const loadEventOptions = async (inputValue) => {
        if (inputValue.length < 2) return [];

        try {
            const response = await api.get(
                "/api/v1/admin/events/search/search",
                {
                    params: {
                        search: inputValue, // backend expects this
                    },
                }
            );

            const data = response.data;

            if (data?.success) {
                return data.data.events.map((event) => ({
                    value: event.id,
                    label: event.name,
                    event, // full event object if needed later
                }));
            }

            return [];
        } catch (error) {
            console.error("Error fetching events:", error);
            return [];
        }
    };

    const handleEventSelect = (selectedOption) => {
        setSelectedEvent(selectedOption); // 👈 dropdown control

        if (selectedOption) {
            setEvent(selectedOption.event?.name);
        } else {
            setEvent("");
        }
    };

    return (
        <div>
            <Seo title={"Staff Manager"} />
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
                                    <Form.Label>Name</Form.Label>

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


                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value.trim())}

                                    />
                                </Form.Group>



                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Event</Form.Label>
                                    <AsyncSelect
                                        className="search-dropdown"
                                        isDisabled
                                        cacheOptions
                                        loadOptions={loadEventOptions}
                                        value={selectedEvent}
                                        onChange={handleEventSelect}
                                        placeholder="Search by event"
                                        isClearable
                                        getOptionLabel={(option) => option.event?.name}
                                        getOptionValue={(option) => option.value}
                                        formatOptionLabel={(option, { context }) => {
                                            if (context === "menu") {
                                                return (
                                                    <div>
                                                        <strong>{option.event?.name}</strong>
                                                    </div>
                                                );
                                            }
                                            return option.event?.name;
                                        }}
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 1050,
                                            }),
                                        }}
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
                                <h4 className="card-title mg-b-0">Staff Manager</h4>

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

StaffList.layout = "Contentlayout";

export default StaffList;
