import { React, useState, useEffect } from "react";
import {
  Button,
  Form,
  Modal,
  Table,
  Card,
  Row,
  Col,
  Breadcrumb,
  Alert,
  Collapse,
} from "react-bootstrap";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import Seo from "@/shared/layout-components/seo/seo";
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
    Header: "Name",
    accessor: "Name",
    className: "borderrigth",
  },
  {
    Header: "URL",
    accessor: "VanityURL",
    className: "borderrigth",
    Cell: ({ row }) => (
      <div>
        <a
          href={row.original.VanityURL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.original.VanityURL}
        </a>
      </div>
    ),
  },
  {
    Header: "Last Updated",
    accessor: "updatedAt",
    className: "borderrigth",
    Cell: ({ row }) => (
      <div>
        <Moment format="DD-MMM-YYYY">{row.original.updatedAt}</Moment>
      </div>
    ),
  },
];

const Slider = () => {
  const [DATA_TABLE, setDataTable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data: DATA_TABLE,
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

  const fetchPages = async () => {
    try {
      const { data: pageList } = await axios.get(
        `/api/v1/sliders?key=get_page_is_sliders`
      );
      if (pageList.success) {
        setDataTable(pageList.data);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching pages:", error);
    }
  };

  useEffect(() => {
    // Fetch pages for the dropdown
    setPageSize(10);
    fetchPages();
  }, []);

  const navigate = useRouter();
  const handleEdit = (row) => {
    navigate.push({
      pathname: `/admin/slider/edit/${row.original.ID}`,      
    });
  };

  return (
    <>
      <Seo title={"Slider Manager"} />
      <Row className="row-sm mt-4">
        <Col xl={12}>
          <Card>
            <Card.Header className=" ">
              <div className="d-flex justify-content-between">
                <h4 className="card-title mg-b-5">Slider Manager</h4>
                <Link
                  className="btn ripple btn-info btn-sm"
                  href={"/admin/slider/add"}
                >
                  Add New Slider
                </Link>
              </div>
            </Card.Header>

            <Card.Body className="">
              <table {...getTableProps()} className="table table-hover mb-0">
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr
                      key={Math.random()}
                      {...headerGroup.getHeaderGroupProps()}
                    >
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
                      <th>Actions</th>
                    </tr>
                  ))}
                </thead>

                {isLoading ? (
                  <tbody>
                    <tr>
                      <td colSpan={9}>
                        <div
                          className="loader inner-loader"
                          style={{ display: "flex", justifyContent: "center" }}
                        >
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
                          <td>
                            <button
                              variant=""
                              className="btn btn-sm btn-primary ms-1 w-30"
                              type="button"
                              onClick={() => handleEdit(row)}
                            >
                              <i
                                className="bi bi-pencil-square pe-1"
                                href="javascript:void(0)"
                              ></i>
                              Edit
                            </button>
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
      </Row>
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

Slider.layout = "Contentlayout";
export default Slider;
