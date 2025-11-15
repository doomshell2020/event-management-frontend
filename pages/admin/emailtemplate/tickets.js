import React, { useState, useEffect } from "react";
import { Breadcrumb, Dropdown, Modal, Card, Form, Col, Row, Table, Button, Spinner, Alert, Collapse } from "react-bootstrap";
import {
    useTable,
    useSortBy,
    useGlobalFilter,
    usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import Swal from "sweetalert2";
import axios from "axios";
import Moment from "react-moment";
import index from "@/pages";
import { useRouter } from "next/router";
import { usePathname } from 'next/navigation'




export const EmailTicketTemplate = () => {
    const pathname = usePathname()


    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
        },
        {
            Header: "Title",
            accessor: "title",
            className: "borderrigth",
        },
        {
            Header: "Subject",
            accessor: "subject",
            className: "borderrigth",
        },
        {
            Header: "Description/Format",
            accessor: "Description",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    <Link className=" " title="View Html Content" href="#!" onClick={() => viewDemoShow("lgShow", row.original)} style={{ textDecoration: 'underline', color: 'blue' }}
                    >	View Html Content</Link>
                </div>
            )
        },
        {
            Header: "Created",
            accessor: "Created",
            className: "wd-20p borderrigth",
            Cell: ({ row }) => (
                <div>
                    {" "}
                    <Moment format="DD-MMM-YYYY">
                        {row.original.createdAt}
                    </Moment>
                </div>
            )
        },
    ]);

    let navigate = useRouter();
    const [templateList, setTemplateList] = useState([]);
    const [lgShow, setLgShow] = useState(false);
    const [modaldata, setmodaldata] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        axios.get(`/api/v1/emailtemplets/?key=ticketTemplateView`)
            .then((res) => {
                setTemplateList(res.data.data);
                setIsLoading(false)
            })
        setTimeout(() => {
        }, 5000);
    }, [])


    let viewDemoClose = (modal) => {
        switch (modal) {
            case "lgShow":
                setLgShow(false)
                setmodaldata('')
                break;

        }
    }

    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: templateList,
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
    const Warningalert = (id) => {

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",

        }).then(async (result) => {
            if (result.isConfirmed) {
                const apiurl = `/api/v1/emailtemplets?id=${id}`
                await axios.delete(apiurl);
                const viewapi = `/api/v1/emailtemplets`
                const response = await axios.get(viewapi);
                setTemplateList(response.data.data)
                Swal.fire("Deleted!", "Your file has been deleted.", "success");
            }

        });
    }
    const viewDemoShow = (modal, rowa) => {
        switch (modal) {
            case "lgShow":
                setmodaldata(rowa)
                setLgShow(true)
                break;
        }
    }

    const handleEdit = (row) => {
        navigate.push({
            pathname: '/admin/emailtemplate/ticketedit',
            query: {
                id: row.original.id,
            },
        })
    }

    return (
        <div>
            <>
                <Modal
                    size="lg"
                    show={lgShow}
                    aria-labelledby="example-modal-sizes-title-sm"
                >
                    <Modal.Header>
                        <Button
                            variant=""
                            className="btn btn-close ms-auto"
                            onClick={() => { viewDemoClose("lgShow") }}
                        >
                            x
                        </Button>
                    </Modal.Header>
                    <Modal.Body>
                        <div dangerouslySetInnerHTML={{ __html: modaldata.description }} />

                    </Modal.Body>

                </Modal>
            </>
            <Seo title={"Email Ticket Template Manager"} />
            <Row className="row-sm mt-4">
                <Col xl={12}>
                    <Card>
                        <Card.Header className="">
                            <div className="d-flex justify-content-between">
                                <h4 className="card-title mg-b-0">Ticket Templates</h4>
                                <div>
                                    <Link
                                        className="btn ripple btn-info btn-sm me-2"
                                        href="/admin/emailtemplate"
                                    >
                                        Email
                                    </Link>

                                    <Link
                                        className="btn ripple btn-info btn-sm me-2"
                                        href="/admin/emailtemplate/tickets"
                                    >
                                        Tickets
                                    </Link>
                                    {pathname === "/admin/emailtemplate/" ?
                                        <Link
                                            className="btn ripple btn-info btn-sm"
                                            href="/admin/emailtemplate/add"
                                        >
                                            Add Email Template
                                        </Link> :

                                        <Link
                                            className="btn ripple btn-info btn-sm"
                                            href="/admin/emailtemplate/ticketsadd"
                                        >
                                            Add Ticket Template
                                        </Link>
                                    }

                                </div>
                            </div>
                        </Card.Header>



                        <div className="table-responsive mt-4">
                            {isLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '33vh' }}>
                                    <Spinner animation="border" role="status" variant="primary" style={{ width: '30px', height: '30px' }}>
                                        <span className="sr-only">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : (
                                <table {...getTableProps()} className="table table-bordered table-hover mb-0 text-md-nowrap">
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
                                                <th>Actions</th>
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                        {page.map((row) => {
                                            prepareRow(row);
                                            return (
                                                <tr key={Math.random()} {...row.getRowProps()}>
                                                    {row.cells.map((cell) => {
                                                        return (
                                                            <td key={Math.random()} className="borderrigth" {...cell.getCellProps()}>
                                                                {cell.render("Cell")}
                                                            </td>
                                                        );
                                                    }
                                                    )
                                                    }
                                                    <td>

                                                        <button
                                                            variant=""
                                                            className="btn btn-sm btn-primary ms-1 w-30"
                                                            type="button"
                                                            onClick={() => handleEdit(row)}
                                                        >
                                                            <i className="bi bi-pencil-square pe-1" href="#!" ></i>
                                                            Edit
                                                        </button>

                                                        <button
                                                            variant=""
                                                            className="btn btn-sm btn-danger w-30  ms-1"
                                                            type="button"
                                                            onClick={() => Warningalert(row.original.id)}

                                                        >
                                                            <i className="fas fa-trash-alt pe-1"></i>  Delete </button>
                                                    </td>

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
                    </Card></Col></Row>
        </div>
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

EmailTicketTemplate.propTypes = {};

EmailTicketTemplate.defaultProps = {};

EmailTicketTemplate.layout = "Contentlayout"

export default EmailTicketTemplate;
