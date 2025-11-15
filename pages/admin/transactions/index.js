import { React, useState, useRef, useEffect } from "react";
import {
  Button,
  Form,
  Modal,
  Table,
  Card,
  Row,
  Col,
  Breadcrumb,
} from "react-bootstrap";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import moment from "moment";

import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";
import { useDownloadExcel } from "react-export-table-to-excel";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Link from "next/link";
import Moment from "react-moment";
import "moment-timezone";

import { CSVLink } from "react-csv";
import { Tooltip, IconButton } from "@mui/material";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";

import {
  CForm,
  CCol,
  CFormLabel,
  CFormFeedback,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CFormCheck,
} from "@coreui/react";
import DataTable from "react-data-table-component";
export const COLUMNS = [
  {
    Header: "S.No",
    accessor: (row, index) => index + 1,
    className: "wd-10p borderrigth",
  },
  // {
  //     Header: "ID",
  //     accessor: "id",
  //     className: "wd-5 borderrigth",
  // },
  {
    Header: "User",
    accessor: "Name",
    className: "wd-15p borderrigth",
    Cell: ({ row }) => (
      <div>
        {row.original && row.original.User
          ? `${row.original.User.LastName || ""}, ${
              row.original.User.FirstName || ""
            }`
          : "User Information Not Available"}
        <br />
        <b style={{ display: "contents" }}>Member ID:</b> {row.original.UserID}
      </div>
    ),
  },
  {
    Header: "Desctiption",
    accessor: "Desctiption",
    className: "wd-35p borderrigth",
    Cell: ({ row }) => (
      <div>
        {row.original.Description}
        <br />
        <b style={{ display: "contents" }}>Stripe payment :</b>{" "}
        {row.original.StripePaymentID}
      </div>
    ),
  },
  {
    Header: "Amount",
    accessor: "PaymentAmounts",
    className: "wd-10p borderrigth",
    Cell: ({ row }) => <div>${row.original.PaymentAmount} USD</div>,
  },
  {
    Header: "Date",
    accessor: "DateCreated",
    className: "wd-10p borderrigth",
    Cell: ({ row }) => (
      <div>
        {/* {row.original.StartDate} */}
        <Moment format="YYYY-MM-DD HH:mm:ss" tz="UTC">
          {row.original.DateCreated}
        </Moment>
      </div>
    ),
  },
  {
    Header: "Status",
    accessor: "Status",
    className: "wd-10p borderrigth",
    Cell: ({ row }) => (
      // <div>
      //     {row.original.Pending}  {row.original.Approval}{row.original.Settled}
      // </div>
      <div>
        {row.original.status === 0 && (
          // <a href="#" className="badge rounded-pill bg-danger" id="swal-warning"></a>
          <p className="mb-0" style={{ color: "red" }}> Pending CC Approval </p>
        )}
        {row.original.status === 1 && (
          // <a href="#" className="badge rounded-pill bg-yellow border-0"> </a>
          <p className="mb-0">Settled</p>
        )}
        {row.original.status === 2 && (
          // <a href="#" className="badge rounded-pill bg-danger  border-0"></a>
          <p style={{ color: "red" }}> Cancelled</p>
        )}
      </div>
    ),
  },
];

const Transaction = () => {
  const [validatedCustom, setValidatedCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [DATATABLE, setDATATABLE] = useState([]);
  const [basic, setBasic] = useState(false);

  const [ID, setID] = useState("");
  const [UserID, setUserID] = useState("");
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
  // default page size 50
  useEffect(() => {
    setPageSize(50);
  }, []);

  // view Transactions
  const ViewTransaction = "/api/v1/transactions";
  useEffect(() => {
    fetch(ViewTransaction)
      .then((response) => response.json())
      .then((value) => {
        setTimeout(() => {
          setDATATABLE(value.viewtransactions);
          setIsLoading(false);
        }, 1000);
      });
  }, []);

  const SearchUrl = "/api/v1/transactions";
  const SearchMember = async (event) => {
    event.preventDefault();
    const Searchbody = {
      ID: ID,
      UserID: UserID,
    };
    // console.log("Searchbody", Searchbody)
    await axios
      .post(SearchUrl, Searchbody)
      .then((res) => {
        setDATATABLE(res.data.searchResults);
      })
      .catch((err) => console.log(err));
  };

  // Reset searching
  const handleReset = () => {
    setUserID("");
    setID("");

    fetch(ViewTransaction)
      .then((response) => response.json())
      .then((value) => {
        setTimeout(() => {
          setDATATABLE(value.viewtransactions);
          setIsLoading(false);
        }, 1000);
      });
  };

  var Firstname, Lastname, email, UserPhone, Statuss, dateOnly;

  // Export Excel
  const headers = [
    { label: "Member ID", key: "id" },
    { label: "Member First Name", key: "FirstNamee" },
    { label: "Member Last Name", key: "LastNamee" },
    { label: "Description", key: "description" },
    { label: "Amount", key: "ammount" },
    { label: "Status", key: "MemberStatus" },
    { label: "Date", key: "DateCreateds" },
  ];
  const data = DATATABLE.map((item) => {
    if (item.User != null) {
      Firstname = item.User.FirstName;
    } else {
      Firstname = "----";
    }
    if (item.User != null) {
      Lastname = item.User.LastName;
    } else {
      Lastname = "----";
    }
    if (item.Description != null) {
      email = item.Description;
    } else {
      email = "----";
    }
    if (item.PaymentAmount != null) {
      UserPhone = item.PaymentAmount;
    } else {
      UserPhone = "----";
    }
    if (item.createdAt instanceof Date) {
      // If item.createdAt is already a Date object
      dateOnly = item.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } else {
      // If item.createdAt is not a Date object, parse it to a Date object first
      var createdAtDate = new Date(item.createdAt);
      dateOnly = createdAtDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }

    if (item.status != null) {
      switch (item.status) {
        case 0:
          Statuss = "Pending CC Approval";
          break;
        case 1:
          Statuss = "Sattled";
          break;
        case 2:
          Statuss = "Cancelled";
          break;
        default:
          Statuss = "Unknown";
          break;
      }
    } else {
      Statuss = "----";
    }

    return {
      id: item.UserID,
      FirstNamee: Firstname,
      LastNamee: Lastname,
      description: email,
      ammount: UserPhone,
      MemberStatus: Statuss,
      // DateCreateds: moment(item.createdAt).format = ("YYYY-MM-DD  HH:mm:ss"), // Format createdAt date
      DateCreateds: dateOnly,
    };
  });

  const onExportLinkPress = async () => {
    const csvData = [
      headers.map((header) => header.label),
      ...data.map((item) => Object.values(item)),
    ];
    const csvOptions = {
      filename: "my-file.xlsx",
      separator: ",",
    };

    const csvExporter = new CSVLink(csvData, csvOptions);
    // csvExporter.click();
  };

  // Export PDF
  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      const columns = [
        "Id",
        "Name",
        "Member Id",
        "Event Payment",
        "Stripe Payment",
        "Amount",
      ];
      var rows = [];
      // for (let i = 0; i < customer.length; i++) {
      //     var temp = [
      //         customer[i].id + 1,
      //         customer[i].name,
      //         customer[i].mobile,
      //         customer[i].username,
      //     ]
      //     rows.push(temp);
      // }
      pdf.text(235, 40, "Transactions");
      pdf.autoTable(columns, rows, {
        startY: 65,
        theme: "grid",
        styles: {
          font: "times",
          halign: "center",
          cellPadding: 3.5,
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
          textColor: [0, 0, 0],
        },
        headStyles: {
          textColor: [0, 0, 0],
          fontStyle: "normal",
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
          fillColor: [166, 204, 247],
        },
        alternateRowStyles: {
          fillColor: [212, 212, 212],
          textColor: [0, 0, 0],
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
        },
        rowStyles: {
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
        },
        tableLineColor: [0, 0, 0],
      });
      console.log(pdf.output("datauristring"));
      pdf.save("Transaction");
    } catch (error) {
      console.log("error from data", error);
    }
  };







  // Popup functions
  let viewDemoShow = (modal) => {
    switch (modal) {
      case "Basic":
        setBasic(true);
        break;
    }
  };

  let viewDemoClose = (modal) => {
    switch (modal) {
      case "Basic":
        setBasic(false);
        break;
    }
  };

  return (
    <>
      <Seo title={"Transaction Manager"} />
      {/* <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">Transaction Manager</span>
                </div>
                <div className="justify-content-center mt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item className=" tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Transaction
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div> */}

      <Row className="row-sm mt-4">
        <Col xl={2}>
          <Card className="member-fltr-hid ">
            <Card.Header className=" ">
              <div className="d-flex justify-content-between">
                <h4 className="card-title mg-b-0">Filters</h4>
              </div>
            </Card.Header>
            <Card.Body className="p-2">
              <CForm
                className="row g-3 needs-validation"
                noValidate
                // validated={validatedCustom}
                onSubmit={SearchMember}
              >
                <CCol md={12}>
                  <CFormLabel htmlFor="validationCustom03">
                    Transaction ID
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationCustom03"
                    required
                    value={ID}
                    onChange={(e) => {
                      setID(e.target.value);
                    }}
                  />
                </CCol>
                <CCol md={12}>
                  <CFormLabel htmlFor="validationCustom03">
                    Member ID
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationCustom03"
                    value={UserID}
                    onChange={(e) => {
                      setUserID(e.target.value);
                    }}
                  />
                </CCol>
                <CCol
                  md={12}
                  className="d-flex align-items-end justify-content-between "
                >
                  <CButton color="primary" type="submit" className="me-2 w-50">
                    Submit
                  </CButton>
                  <CButton
                    color="secondary"
                    type="reset"
                    className="w-50"
                    onClick={handleReset}
                  >
                    Reset
                  </CButton>
                </CCol>
              </CForm>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={10}>
          <div className="Mmbr-card">
            <Card>
              <Card.Header className=" " style={{ paddingBottom: "5px" }}>
                <div className="d-flex justify-content-between align-items-center">
                  {/* <h6> */}
                  <strong>Total Legacy Transactions {DATATABLE.length}</strong>
                  {/* </h6> */}
                  <div className="d-flex " >
                    <IconButton onClick={onExportLinkPress}>
                      <CSVLink
                        headers={headers}
                        data={data}
                        filename={"transactions.csv"}
                        className="btn btn-sm btn-primary-light ms-auto "
                        target="_blank"
                      >
                        CSV Export
                      </CSVLink>
                    </IconButton>
                    <Link
              href={"#"}
              className="filtr-icon ms-2"
              variant=""
              onClick={() => viewDemoShow("Basic")}
            >
              {" "}
              <i className="bi bi-search "></i>
            </Link>
                  </div>
                  
                </div>
              </Card.Header>

              <Card.Body className="p-2">
                <div className="Tranjection-Res">
                  <table
                    {...getTableProps()}
                    className="table table-hover responsive-table mb-0"
                  >
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
                          {/* <th>Status</th> */}
                        </tr>
                      ))}
                    </thead>
                    {isLoading ? (
                      <tbody>
                        <tr>
                          <td colSpan={9}>
                            <div
                              className="loader inner-loader"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
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
                            </tr>
                          );
                        })}
                      </tbody>
                    )}
                  </table>
                </div>
                <div className="d-block d-sm-flex mt-4 mt-sm-2  mx-0 mx-sm-2">
                  <span className="">
                    Page{" "}
                    <strong>
                      {pageIndex + 1} of {pageOptions.length}
                    </strong>{" "}
                  </span>
                  <span className="ms-sm-auto d-flex ">
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
          </div>
        </Col>
      </Row>



      <Modal show={basic} className="Member-filtr-mdlDgn">
        <Modal.Header>
          <Modal.Title>Search here</Modal.Title>
          <Button
            variant=""
            className="btn btn-close"
            onClick={() => {
              viewDemoClose("Basic");
            }}
          >
            <i className="bi bi-x"></i>
          </Button>
        </Modal.Header>
        <Modal.Body>
        <CForm
                className="row g-3 needs-validation"
                noValidate
                // validated={validatedCustom}
                onSubmit={SearchMember}
              >
                <CCol md={12}>
                  <CFormLabel htmlFor="validationCustom03">
                    Transaction ID
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationCustom03"
                    required
                    value={ID}
                    onChange={(e) => {
                      setID(e.target.value);
                    }}
                  />
                </CCol>
                <CCol md={12}>
                  <CFormLabel htmlFor="validationCustom03">
                    Member ID
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationCustom03"
                    value={UserID}
                    onChange={(e) => {
                      setUserID(e.target.value);
                    }}
                  />
                </CCol>
                <CCol
                  md={12}
                  className="d-flex align-items-end justify-content-between "
                >
                  <CButton color="primary" type="submit" className="me-2 w-50">
                    Submit
                  </CButton>
                  <CButton
                    color="secondary"
                    type="reset"
                    className="w-50"
                    onClick={handleReset}
                  >
                    Reset
                  </CButton>
                </CCol>
              </CForm>
        </Modal.Body>
      </Modal>




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

Transaction.layout = "Contentlayout";
export default Transaction;
