import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Form, Modal, Table, Card, Row, Col, Breadcrumb, Alert, Collapse } from "react-bootstrap";
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table";
import { CCol, CFormLabel, CFormInput } from "@coreui/react";
import Seo from '@/shared/layout-components/seo/seo';
import Swal from "sweetalert2";
import Link from "next/link";
import Moment from "react-moment";
import ClipLoader from "react-spinners/ClipLoader";
import { useRouter } from "next/router";
import axios from "axios";


export const COLUMNS = [
    {
        Header: "S.No",
        accessor: (row, index) => index + 1,
        className: "borderrigth",
    },
    {
        Header: "Page Name",
        accessor: "Name",
        className: "borderrigth",
    },
    {
        Header: "Preview",
        accessor: "VanityURL",
        className: "borderrigth",
        Cell: ({ row }) => (
            <div>
                <a
                    href={row.original.VanityURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline', color: '#007bff' }} // optional blue
                >
                    {row.original.VanityURL}
                </a>
            </div>
        )
    },
    {
        Header: "Last Updated",
        accessor: "updatedAt",
        className: "borderrigth",
        Cell: ({ row }) => (
            <div>
                <Moment format="DD-MMM-YYYY" utc>
                    {row.original.updatedAt}
                </Moment>
            </div>
        )
    }
];

const Cms = ({ initialData, initialEvents }) => {
    const router = useRouter();
    const { event_id, Name, is_published } = router.query;
    const [DATATABLE, setDataTable] = useState(initialData || []);
    const [isLoading, setIsLoading] = useState(false);
    const [event, setEvent] = useState(initialEvents || []); // ✅ SSR loaded events here
    const [name, setName] = useState(Name || '');
    const [selectedEvent, setSelectedEvent] = useState(event_id || "");
    const [isPublished, setIsPublished] = useState(is_published == "1");
    const [cms, setCms] = useState([]);
    const [openAlert, setOpenAlert] = useState(false);
    const [staticAdded, setStaticAdded] = useState("");
    var StaticMessage = '';

    // Table configuration
    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: DATATABLE,
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const {
        getTableProps,
        headerGroups,
        getTableBodyProps,
        prepareRow,
        state,
        setGlobalFilter,
        page,
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

    // Set default page size
    useMemo(() => {
        setPageSize(50);
    }, []);

    const searchCMSTemplate = async (e) => {
        e.preventDefault();
        try {
            const fullQuery = {
                event_id: selectedEvent,
                Name: name,
                is_published: isPublished ? "1" : "",
            };

            const filteredQuery = Object.fromEntries(
                Object.entries(fullQuery).filter(([_, v]) => v !== "")
            );

            router.push(
                {
                    pathname: "/admin/cms",
                    query: filteredQuery,
                },
                undefined,
                { shallow: true }
            );

            // const response = await axios.get("/api/v1/cms", { params: filteredQuery });

            // if (response.data.success) {
            //     setDataTable(response.data.viewCms);
            // } else {
            //     console.log("Search failed.");
            // }
        } catch (err) {
            console.error("Error:", err.message);
        }
    };

    const HandleResetData = () => {
        setSelectedEvent("");
        setName("");
        setIsPublished(false);
        router.push("/admin/cms", undefined, { shallow: true }); // trigger useEffect
    };

    useEffect(() => {
        if (!router.isReady) return;
        setSelectedEvent(router.query.event_id || "");
        setName(router.query.Name || "");
        setIsPublished(router.query.is_published == "1");
        if (Object.keys(router.query).length > 0) {
            fetchCmsData();
        } else {
            setDataTable(initialData);
        }
    }, [router.query]);

    // const handleSearch = () => {
    //     const query = {};

    //     if (selectedEvent) query.event_id = selectedEvent;
    //     if (name) query.Name = name;
    //     if (isPublished) query.is_published = "1";

    //     router.push(
    //         {
    //             pathname: "/admin/cms",
    //             query,
    //         },
    //         undefined,
    //         { shallow: true }
    //     );
    // };

    const fetchCmsData = async () => {
        setIsLoading(true);

        try {
            const response = await axios.get("/api/v1/cms", {
                params: {
                    ...(selectedEvent && { event_id: selectedEvent }),
                    ...(name && { Name: name }),
                    ...(isPublished && { is_published: "1" }),
                },
            });

            if (response.data.success) {
                const uniqueVanity = new Set();
                const filteredCms = (response.data.viewCms || []).filter((item) => {
                    if (!uniqueVanity.has(item.VanityURL)) {
                        uniqueVanity.add(item.VanityURL);
                        return true;
                    }
                    return false;
                });

                setDataTable(filteredCms);
            }
        } catch (err) {
            console.error("Error fetching CMS data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            var StaticMessage = localStorage.getItem("staticAdded");
            if (StaticMessage != null && StaticMessage !== "") {
                setOpenAlert(true);
                setStaticAdded(StaticMessage);
                setTimeout(() => {
                    localStorage.setItem("staticAdded", "");
                    setOpenAlert(false);
                }, 5000);
            } else {
                setOpenAlert(false);
                setStaticAdded("");
            }
        }
    }, [StaticMessage]);

    const getStatusStyle = (status) => {
        if (status == 'Y') {
            return { label: 'Published', className: 'btn-success' };
        }
        return { label: 'Unpublished', className: 'btn-danger' };
    };

    const handleEdit = (id) => {
        router.push({
            pathname: '/admin/cms/edit/',
            query: {
                id,
            },
        })
    }

    const CmsDeleted = async (id) => {
        const CmsDeletedUrl = `/api/v1/cms?id=${id}`;
        await axios.delete(CmsDeletedUrl)
            .then((res) => {
                // console.log(res)
                const msg = res.data.message;
                localStorage.setItem("staticAdded", msg);
            }).catch((err) => {
                console.log("message", err)
            });
    }

    // status change for event
    const handleStatusToggle = async (page_id, status) => {
        const isCurrentlyPublished = status == 'Y';
        const action = isCurrentlyPublished ? 'unpublish' : 'publish';

        try {
            // Show confirmation dialog
            const result = await Swal.fire({
                title: "Confirm Status Change",
                text: `Are you sure you want to ${action} this page?`,
                icon: "question",
                showCancelButton: true,
                customClass: {
                    popup: "add-tckt-dtlpop",
                },
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Change Status",
            });

            if (!result.isConfirmed) return;

            // Show processing loader
            Swal.fire({
                title: "Processing...",
                text: `Please wait while we ${action} this page.`,
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: {
                    popup: "add-tckt-dtlpop",
                },
                didOpen: () => Swal.showLoading(),
            });

            // Prepare and send request
            const body = new FormData();
            body.append("key", "update_page_status");
            body.append("id", page_id);

            const response = await axios.post("/api/v1/cms", body);
            Swal.close(); // Close loading

            // Handle success or failure
            if (response.data.success) {
                await fetchCmsData(); // Refresh the data
                Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text: response.data.message || "The status has been successfully updated.",
                    customClass: {
                        popup: "add-tckt-dtlpop",
                    },
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Status Update Failed",
                    text: response.data.message || "Failed to update the status.",
                    customClass: {
                        popup: "add-tckt-dtlpop",
                    },
                });
            }

        } catch (error) {
            Swal.close(); // Close loading if error occurs
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "An error occurred. Please try again later.",
                customClass: {
                    popup: "add-tckt-dtlpop",
                },
            });
        }
    };

    return (
        <>
            <Seo title={"Cms Manager"} />
            <Row className="row-sm mt-4">
                <Col xl={2}>
                    <Card>
                        <Card.Header>
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Filters</h4>
                            </div>
                        </Card.Header>
                        <Card.Body className="">
                            <Form onSubmit={searchCMSTemplate} onReset={HandleResetData}>
                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault04">Event</CFormLabel>
                                    <Form.Select
                                        aria-label="Default select example"
                                        className="admn-slct"
                                        value={selectedEvent}
                                        onChange={(e) => setSelectedEvent(e.target.value)}
                                    >
                                        <option value="">--Select-Event--</option>
                                        {event &&
                                            event.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.event_menu_name}
                                                </option>
                                            ))}
                                    </Form.Select>
                                    {/* Checkbox for Published */}
                                    <div className="mt-3">
                                        <Form.Check
                                            type="checkbox"
                                            label="Show Published Page"
                                            checked={isPublished}
                                            onChange={(e) => setIsPublished(e.target.checked)}
                                        />
                                    </div>
                                </CCol>

                                <div className="d-flex mt-3">
                                    <Button variant="primary me-3" type="submit">
                                        Submit
                                    </Button>
                                    <Button variant="secondary" type="reset">
                                        Reset
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={10}>
                    <Card>
                        {staticAdded != null && openAlert === true && (
                            <Collapse in={openAlert}>
                                <Alert aria-hidden={true} severity="success">
                                    {staticAdded}
                                </Alert>
                            </Collapse>
                        )}

                        <Card.Header className=" ">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-5">Dynamic Pages
                                </h4>
                                <Link className="btn ripple btn-info btn-sm" href={"/admin/cms/add"}>Add Page</Link>
                            </div>
                        </Card.Header>

                        <Card.Body className="">
                            <table {...getTableProps()} className="table table-hover mb-0">
                                <thead>
                                    {headerGroups.map((headerGroup) => (
                                        <tr key={Math.random()} {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map((column) => (
                                                <th key={Math.random()}
                                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                                    className={column.className}
                                                >
                                                    <span className="tabletitle">{column.render("Header")}</span>
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
                                            <th
                                                style={{
                                                    width: "200px",
                                                    minWidth: "200px",
                                                    maxWidth: "200px",
                                                    textAlign: "center",
                                                    verticalAlign: "middle",
                                                }}
                                            >
                                                Actions
                                            </th>

                                        </tr>
                                    ))}
                                </thead>

                                {isLoading ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan={9}>
                                                <div className="loader inner-loader" style={{ display: "flex", justifyContent: "center" }}>
                                                    <ClipLoader
                                                        // color={color}
                                                        loading={isLoading}
                                                        color="#36d7b7"
                                                        aria-label="Loading Spinner"
                                                        data-testid="loader"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (

                                    <tbody {...getTableBodyProps()}>
                                        {page.map((row) => {
                                            prepareRow(row);
                                            const { label, className } = getStatusStyle(row.original.status);

                                            return (
                                                <tr key={row.id || row.original.id} {...row.getRowProps()}>
                                                    {row.cells.map((cell) => (
                                                        <td key={cell.column.id} className="borderrigth" {...cell.getCellProps()}>
                                                            {cell.render("Cell")}
                                                        </td>
                                                    ))}

                                                    <td
                                                        style={{
                                                            width: "200px",
                                                            minWidth: "200px",
                                                            maxWidth: "200px",
                                                            textAlign: "center",
                                                            verticalAlign: "middle",
                                                        }}
                                                    >
                                                        <div className="d-flex gap-2 justify-content-center" style={{ justifyContent: "center" }}>
                                                            {/* Edit Button (Visible only if Published) */}
                                                            {/* {row.original.status == 'Y' && ( */}
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    type="button"
                                                                    onClick={() => handleEdit(row.original.id)}
                                                                    title="Edit this page"
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                            {/* )} */}

                                                            {/* Show In Draft Button if Not Published */}
                                                            {row.original.status == 'N' && (
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    type="button"
                                                                    onClick={() => handleStatusToggle(row.original.id, row.original.status)}
                                                                    title="This page is in draft — click to publish"
                                                                >
                                                                    <i className="bi bi-file-earmark-text me-1"></i>
                                                                    In Draft
                                                                </button>
                                                            )}

                                                            {/* Status Toggle Button (Visible only if Published) */}
                                                            {row.original.status == 'Y' && (
                                                                <button
                                                                    className={`btn btn-sm ${className}`}
                                                                    type="button"
                                                                    onClick={() => handleStatusToggle(row.original.id, row.original.status)}
                                                                    title="Click to unpublish this page"
                                                                >
                                                                    {label}
                                                                </button>
                                                            )}
                                                        </div>


                                                    </td>


                                                </tr>
                                            );
                                        })}
                                    </tbody>


                                )}
                            </table>

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
                        </Card.Body>

                    </Card>
                </Col>
            </Row >
        </>
    );
};

const GlobalFilter = ({ filter, setFilter }) => {
    return (
        <span className="d-flex ms-auto">
            <Form.Control
                value={filter || ""}
                onChange={(e) => setFilter(e.target.value)}
                className="form-control mb-4"
                placeholder="Search..."
            />
        </span>
    );
};

Cms.layout = "Contentlayout"
export default Cms

// ==========================
// 📦 Server Side Rendering
// ==========================
export async function getServerSideProps(context) {
    const { event_id, Name, is_published } = context.query;

    const queryParams = new URLSearchParams();
    if (event_id) queryParams.append("event_id", event_id);
    if (Name) queryParams.append("Name", Name);
    if (is_published == "1") queryParams.append("is_published", "1");

    const baseUrl = process.env.SITE_URL || "http://localhost:3000";

    try {
        const [cmsRes, eventRes] = await Promise.all([
            fetch(`${baseUrl}/api/v1/cms?${queryParams.toString()}`),
            fetch(`${baseUrl}/api/v1/emailtemplets/?key=findEvents`)
        ]);

        const [cmsData, eventData] = await Promise.all([
            cmsRes.json(),
            eventRes.json()
        ]);

        const uniqueVanity = new Set();
        const filteredCms = (cmsData.viewCms || []).filter((item) => {
            if (!uniqueVanity.has(item.VanityURL)) {
                uniqueVanity.add(item.VanityURL);
                return true;
            }
            return false;
        });

        return {
            props: {
                initialData: filteredCms || [],
                initialEvents: eventData.data || [],
            },
        };
    } catch (error) {
        console.error("Error in getServerSideProps:", error);
        return {
            props: {
                initialData: [],
                initialEvents: [],
            },
        };
    }
}



