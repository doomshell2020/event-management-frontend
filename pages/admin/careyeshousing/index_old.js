import { React, useEffect, useState } from "react";
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
import axios from "axios";
import Seo from "@/shared/layout-components/seo/seo";
import MultiSelect from "react-multiple-select-dropdown-lite";
import { optiondefault } from "../../../shared/data/form/form-validation";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import Link from "next/link";
import ClipLoader from "react-spinners/ClipLoader";
import Image from "next/image";
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
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import copy from "copy-to-clipboard";
import { usePathname } from "next/navigation";

const Careyeshousing = () => {
  const pathUrl = usePathname();
  const [basic, setBasic] = useState(false);
  const navigate = useRouter();
  const router = useRouter();
  const [DATATABLE, setDATATABLE] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [errorAlert, setErrorAlert] = useState("");
  const [openerror, setOpenError] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [staticAdded, setStaticAdded] = useState("");
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // console.log("hostname", DATATABLE)

  var StaticMessage = "";
  useEffect(() => {
    if (typeof window !== "undefined") {
      var StaticMessage = localStorage.getItem("staticAdded");
      if (StaticMessage != null && StaticMessage !== "") {
        setOpenAlert(true);
        setStaticAdded(StaticMessage);
        setTimeout(() => {
          localStorage.setItem("staticAdded", "");
          setOpenAlert(false);
        }, 3000);
      } else {
        setOpenAlert(false);
        setStaticAdded("");
      }
    }
  }, [staticAdded]);

  // staff navigate
  const handleStaffEdit = (row) => {
    navigate.push({
      pathname: "/admin/careyeshousing/edit",
      query: {
        housingId: row.original.id,
      },
    });
  };

  // staff navigate
  const handleHousingDetail = (row) => {
    navigate.push({
      pathname: "/admin/careyeshousing/viewdetail",
      query: {
        housingId: row.original.id,
      },
    });
  };
  // staff Add image for careyes housing
  const handleAddedImage = (row) => {
    navigate.push({
      pathname: "/admin/careyeshousing/addimage",
      query: {
        housingId: row.original.id,
      },
    });
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = (houseName) => {
    // const encodedText = encodeURIComponent(houseName);
    const encodedText = houseName.replace(/ /g, "+");
    const textToCopy = `${siteUrl}housing/${encodedText}`;
    copy(textToCopy);
    setCopied(true);
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: "Link copied to clipboard.",
      timer: 2000,
      showConfirmButton: false,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      <span>Copy the link</span>
      <span className="afterCopy">{copied && <span>Copied!</span>}</span>
    </Tooltip>
  );

  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "borderrigth",
    },
    {
      Header: "Property Details",
      accessor: "neighborhood",
      className: "borderrigth",
      Cell: ({ row }) => (
        <div>
          <strong>Neighborhood: </strong>{" "}
          {row.original.Neighborhood ? row.original.Neighborhood : "N/A"}
          <br></br>
          {/* <strong>Property Name: </strong> {row.original.Name}<br /> */}
          <strong>Property Name: </strong>
          {row.original.Name ? row.original.Name : "N/A"}
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
          >
            <svg
              style={{ cursor: "pointer" }}
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="ms-2 bi bi-copy"
              viewBox="0 0 16 16"
              onClick={() => handleCopy(row.original.Name)}
            >
              <path
                fillRule="evenodd"
                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
              />
            </svg>
          </OverlayTrigger>
          <br />
          <strong>Distance: </strong>{" "}
          {row.original.Distance ? row.original.Distance : "N/A"}
          <br />
          <strong>Type: </strong>{" "}
          {row.original.Type ? row.original.Type : "N/A"}
          <br />
          <strong>Bedrooms: </strong>{" "}
          {row.original.NumBedrooms ? row.original.NumBedrooms : "N/A"}
          <br />
        </div>
      ),
    },
    {
      Header: "Beds",
      accessor: "beding",
      className: "borderrigth",
      Cell: ({ row }) => (
        <div>
          <span>
            {" "}
            {row.original.NumKingBeds !== undefined &&
              `${row.original.NumKingBeds} King,`}
          </span>{" "}
          <br></br>
          {row.original.NumQueenBeds !== undefined &&
            `${row.original.NumQueenBeds} Queen`}
          <br></br>
          {/* ,{row.original.NumQueenBeds ? row.original.NumQueenBeds : '--'} */}
        </div>
      ),
    },

    {
      Header: "Owner Details",
      accessor: "OwnerDetails",
      className: "borderrigth",
      Cell: ({ row }) => (
        <div>
          <strong>Name: </strong> {row.original?.OwnerName || "N/A"}{" "}
          <br />
          <strong>Email: </strong> {row.original?.OwnerEmail || "N/A"}{" "}
          <br />
          <strong>Mobile: </strong> {row.original?.OwnerMobile || "N/A"}{" "}
          <br />
        </div>
      ),
    },

    {
      Header: "Manager Details",
      accessor: "Manager Details",
      className: "borderrigth",
      Cell: ({ row }) => (
        <div>
          <strong>Name: </strong>{" "}
          {row.original.ManagerName ? row.original.ManagerName : "N/A"}
          <br />
          <strong>Email: </strong>{" "}
          {row.original.ManagerEmail ? row.original.ManagerEmail : "N/A"}
          <br />
          <strong>Mobile: </strong>{" "}
          {row.original.ManagerMobile ? row.original.ManagerMobile : "N/A"}
          <br />
        </div>
      ),
    },


    {
      Header: "Max Occupancy",
      accessor: "occupancy",
      className: "borderrigth",
      Cell: ({ row }) => (
        <div className="">
          {/* Max Occupancy {row.original.MaxOccupancy} */}
          <strong>Max Occupancy: </strong>{" "}
          {row.original.MaxOccupancy ? row.original.MaxOccupancy : "N/A"}
          <br />
          <strong>Pool: </strong>{" "}
          {row.original.Pool ? row.original.Pool : "N/A"}
          <br />
        </div>
      ),
    },
    {
      Header: "Image",
      accessor: "Image",
      className: "borderrigth",
      Cell: ({ row }) => (
        <div className="d-flex align-items-center">
          {/* {row.original?.User?.FirstName || " "} {row.original?.User?.LastName || " "} */}
          <div style={{ borderRadius: "0px" }} className=" housing-prf-admn ">
            {row.original.ImageURL ? (
              <Image
                src={`/uploads/housing/${row.original.ImageURL}`}
                alt="House Image"
                width={100} // Specify width
                height={100} // Specify height
              />
            ) : (
              <Image
                src={"/housingdumy.png"}
                alt="Image Not Found"
                width={100} // Specify width
                height={100} // Specify height
                className=""
              />
            )}
          </div>
        </div>
      ),
    },
    {
      Header: "Actions",
      accessor: "Action",
      className: "border-right",
      style: { width: "50%" }, // Increase header width
      Cell: ({ row }) => (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            width: "80px",
          }}
        >
          {" "}
          {/* Flexbox container with wrapping and gap */}
          <button
            title="View Housing Details"
            className="btn btn-warning btn-sm"
            style={{ flex: "1 1 calc(50% - 0.25rem)", margin: "0 0" }}
            onClick={() => handleHousingDetail(row)}
          >
            <i className="bi bi-eye align-bottom pe-1"></i>
          </button>
          <button
            title="View Housing Gallery"
            className="btn btn-info btn-sm"
            style={{ flex: "1 1 calc(50% - 0.25rem)", margin: "0 0" }}
            onClick={() => handleAddedImage(row)}
          >
            <i className="bi bi-file-earmark-plus align-bottom pe-1"></i>
          </button>
          <button
            title="Edit Housing"
            className="btn btn-success btn-sm"
            style={{ flex: "1 1 calc(50% - 0.25rem)", margin: "0 0" }}
            onClick={() => handleStaffEdit(row)}
          >
            <i className="bi bi-pencil-square pe-1"></i>
          </button>
          <button
            title="Delete Housing"
            className="btn btn-danger btn-sm"
            style={{ flex: "1 1 calc(50% - 0.25rem)", margin: "0 0" }}
            onClick={() => handleDeleteMember(row.original.id)}
          >
            <i className="bi bi-trash pe-1"></i>
          </button>
        </div>
      ),
    },
  ]);

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

  // View housing data
  //

  const fetchData = async () => {
    setIsLoading(true); // Set loading state to true
    try {
      const HousingUrl = `/api/v1/housings`;
      const response = await fetch(HousingUrl);
      const data = await response.json();
      // Update state with fetched data and pagination info
      setDATATABLE(data.data || []); // Use data.data or default to empty array
      setIsLoading(false); // Set loading state to false
    } catch (error) {
      console.error("Error fetching member data:", error);
      setIsLoading(false); // Set loading state to false
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // deleted housing
  // const handleDeleteMember = (id) => {
  //     Swal.fire({
  //         title: "Warning",
  //         text: "Are you sure you want to permanently delete this housing?",
  //         icon: "warning",
  //         showCancelButton: true,
  //         confirmButtonColor: "#3085d6",
  //         cancelButtonColor: "#d33",
  //         confirmButtonText: "Yes, delete it!",

  //     }).then(async (result) => {
  //         if (result.isConfirmed) {
  //             const apiUrl = `/api/v1/housings?id=${id}`
  //             // await axios.delete(apiurl);
  //             const response = await axios.delete(apiUrl);
  //             const message = response.data.message || "The Housing has been successfully deleted.";
  //             fetchData()
  //             // Swal.fire("Deleted!", "Your file has been deleted.", "success");
  //             Swal.fire({
  //                 icon: 'success',
  //                 title: 'Deleted!',
  //                 text: "The Housing has been successfully deleted."
  //             });
  //         }

  //     });
  // }

  const handleDeleteMember = async (id) => {
    Swal.fire({
      title: "Warning",
      text: "Are you sure you want to permanently delete this housing?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = `/api/v1/housings?id=${id}`;
          const response = await axios.delete(apiUrl);
          const message =
            response.data.message ||
            "The Housing has been successfully deleted.";
          fetchData();
          if (response.data.success === true) {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: message,
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops!",
              text: message,
            });
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            "An error occurred while deleting the housing.";
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: errorMessage,
          });
        }
      }
    });
  };

  const [name, setName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [type, setType] = useState("");
  const [numBedrooms, setNumBedrooms] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");

  const handleSearch = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      const housingSearchUrl = "/api/v1/housings/";
      event.preventDefault();
      const body = new FormData();
      body.append("key", "searchHousing");
      body.append("Name", name);
      body.append("Neighborhood", neighborhood);
      body.append("Type", type);
      body.append("NumBedrooms", numBedrooms),
        body.append("ManagerName", managerName),
        body.append("ManagerEmail", managerEmail),
        await axios
          .post(housingSearchUrl, body)
          .then((res) => {
            if (res.data.success === true) {
              setDATATABLE(res.data.searchResults);
            } else {
              console.log("Search data not found");
            }
          })
          .catch((err) => {
            console.log("message", err);
            // const message = err.response.data.message
            // setError(message);
          });
    }
  };

  // Reset all data after the search
  const HandleResetData = async () => {
    fetchData();
    setType("");
    setName("");
    setNeighborhood("");
    setNumBedrooms("");
    setManagerName("");
    setManagerEmail("");
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
      <Seo title={"Careyes Housing"} />

      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Careyes Housing Manager
          </span>
        </div>
        <div className="justify-content-between d-flex mt-2">
          <Breadcrumb>
            <Breadcrumb.Item className=" tx-15" href="#!">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active aria-current="page">
              Careyes Housing
            </Breadcrumb.Item>
          </Breadcrumb>

          <div className="d-flex align-items-center">
            <Link
              href={"/admin/careyeshousing/add"}
              className=" btn-info  Member-top-mblbtn2 "
            >
              <i className="bi bi-plus-lg"></i>
            </Link>

            <Link
              href={"#"}
              className="filtr-icon"
              variant=""
              onClick={() => viewDemoShow("Basic")}
            >
              {" "}
              <i className="bi bi-search "></i>
            </Link>
          </div>
        </div>
      </div>

      <div className="left-content mt-2">
        <Row className="row-sm mt-4">
          <Col xl={2}>
            <Card className="member-fltr-hid">
              <Card.Body className="p-2">
                <CForm
                  className="row g-3 needs-validation"
                  onSubmit={handleSearch}
                >
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">Type</CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="Type"
                      value={type}
                      onChange={(e) => {
                        const trimmedType = e.target.value.trim();
                        setType(trimmedType);
                      }}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Bedroom
                    </CFormLabel>
                    <Form.Select
                      name="id"
                      className="form-control admn-slct"
                      value={numBedrooms}
                      onChange={(e) => {
                        setNumBedrooms(e.target.value);
                      }}
                    >
                      <option value="">-Select-</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                      <option value="13">13</option>
                      <option value="14">14</option>
                      <option value="15">15</option>
                      <option value="16">16</option>
                      <option value="17">17</option>
                      <option value="18">18</option>
                      <option value="19">19</option>
                      <option value="20">20</option>
                    </Form.Select>
                  </CCol>

                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">
                      Manager Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="Manager Name"
                      value={managerName}
                      onChange={(e) => {
                        const trimmedManagerName = e.target.value.trim();
                        setManagerName(trimmedManagerName);
                      }}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">
                      Manager Email
                    </CFormLabel>
                    <CFormInput
                      type="email"
                      placeholder="Manager Email"
                      value={managerEmail}
                      onChange={(e) => {
                        const trimmedEmail = e.target.value.trim();
                        setManagerEmail(trimmedEmail);
                      }}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationCustom03">
                      Property Name
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      placeholder="Property Name"
                      value={name}
                      onChange={(e) => {
                        const trimmedName = e.target.value.trim();
                        setName(trimmedName);
                      }}
                    />
                  </CCol>

                  {/* <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">Neighborhoods</CFormLabel>
                                        <CFormInput
                                            type="text"
                                            placeholder="Neighborhoods"
                                            value={neighborhood}
                                            onChange={(e) => {
                                                const trimmedValue = e.target.value.trim();
                                                setNeighborhood(trimmedValue);
                                            }}
                                        />
                                    </CCol> */}
                  <CCol md={12}>
                    <CFormLabel htmlFor="validationDefault04">
                      Neighborhoods<span style={{ color: "Red" }}>*</span>
                    </CFormLabel>
                    <select
                      name="id"
                      className="form-control"
                      value={neighborhood}
                      onChange={(e) => {
                        setNeighborhood(e.target.value);
                      }}
                    >
                      <option value="">-Select-</option>
                      <option value="Chamela">Chamela</option>
                      <option value="Cuixmala">Cuixmala</option>
                      <option value="Las Alamandas">Las Alamandas</option>
                      <option value="Casitas de las Flores">
                        Casitas de las Flores
                      </option>
                      <option value="Constellation">Constellation</option>
                      <option value="El Careyes Hotel">El Careyes Hotel</option>
                      <option value="Paraiso">Paraiso</option>
                      <option value="Peninsula de las Estrellas">
                        Peninsula de las Estrellas
                      </option>
                      <option value="Zyanya">Zyanya</option>
                      <option value="Polo">Polo</option>
                      <option value="Pueblo Careyes">Pueblo Careyes</option>
                      <option value="Rincon de Careyes">
                        Rincon de Careyes
                      </option>
                      <option value="Tamarindo">Tamarindo</option>
                    </select>
                  </CCol>

                  <CCol md={12} className="d-flex  ">
                    <CButton
                      color="primary"
                      type="submit"
                      className="me-2 w-50"
                      id="submitBtn"
                    >
                      Submit
                    </CButton>

                    <CButton
                      color="secondary"
                      type="reset"
                      onClick={HandleResetData}
                      className="w-50"
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
                {staticAdded != null && openAlert === true && (
                  <Collapse in={openAlert}>
                    <Alert aria-hidden={true} severity="success">
                      {staticAdded}
                    </Alert>
                  </Collapse>
                )}
                <Card.Header className="husin-tbl-hdr ">
                  <div className="d-flex justify-content-end align-items-center">
                    <h4></h4>
                    <Link
                      className="btn ripple btn-info btn-sm Member-top-mblbtn22"
                      href="/admin/careyeshousing/add"
                    >
                      Add Housing
                    </Link>
                  </div>
                </Card.Header>
                <Card.Body className="p-2">
                  <div className="hosing-mngr-tbl-Resp">
                    <table
                      {...getTableProps()}
                      className="table responsive-table  mb-0"
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

                  {/* Pagination start */}
                  <Row className="mt-4 mx-0 ">
                    <Col xs={12} sm={6} className="d-flex align-items-center">
                      <div className="d-flex align-items-center">
                        <span className="me-2">
                          Showing page{" "}
                          <strong>
                            {pageIndex + 1} of {pageOptions.length}
                          </strong>
                        </span>
                        <span>
                          Total Records:{" "}
                          <strong>{DATATABLE && DATATABLE.length}</strong>
                        </span>
                      </div>
                    </Col>
                    <Col xs={12} sm={6} className="d-flex pgintn justify-content-end">
                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => gotoPage(0)}
                        disabled={!canPreviousPage}
                      >
                        {"First"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => previousPage()}
                        disabled={!canPreviousPage}
                      >
                        {"<"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton me-2"
                        onClick={() => nextPage()}
                        disabled={!canNextPage}
                      >
                        {">"}
                      </Button>

                      <Button
                        variant=""
                        className="btn-default tablebutton"
                        onClick={() => gotoPage(pageCount - 1)}
                        disabled={!canNextPage}
                      >
                        {"Last"}
                      </Button>
                    </Col>
                  </Row>
                  {/* Pagination end */}
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

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
          <CForm className="row g-3 needs-validation" onSubmit={handleSearch}>
            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">Type</CFormLabel>
              <CFormInput
                type="text"
                placeholder="Type"
                value={type}
                onChange={(e) => {
                  const trimmedType = e.target.value.trim();
                  setType(trimmedType);
                }}
              />
            </CCol>
            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">Bedroom</CFormLabel>
              <Form.Select
                name="id"
                className="form-control admn-slct"
                value={numBedrooms}
                onChange={(e) => {
                  setNumBedrooms(e.target.value);
                }}
              >
                <option value="">-Select-</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
              </Form.Select>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">Manager Name</CFormLabel>
              <CFormInput
                type="text"
                placeholder="Manager Name"
                value={managerName}
                onChange={(e) => {
                  const trimmedManagerName = e.target.value.trim();
                  setManagerName(trimmedManagerName);
                }}
              />
            </CCol>
            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">
                Manager Email
              </CFormLabel>
              <CFormInput
                type="email"
                placeholder="Manager Email"
                value={managerEmail}
                onChange={(e) => {
                  const trimmedEmail = e.target.value.trim();
                  setManagerEmail(trimmedEmail);
                }}
              />
            </CCol>
            <CCol md={12}>
              <CFormLabel htmlFor="validationCustom03">
                Property Name
              </CFormLabel>
              <CFormInput
                type="text"
                placeholder="Property Name"
                value={name}
                onChange={(e) => {
                  const trimmedName = e.target.value.trim();
                  setName(trimmedName);
                }}
              />
            </CCol>

            {/* <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">Neighborhoods</CFormLabel>
                                        <CFormInput
                                            type="text"
                                            placeholder="Neighborhoods"
                                            value={neighborhood}
                                            onChange={(e) => {
                                                const trimmedValue = e.target.value.trim();
                                                setNeighborhood(trimmedValue);
                                            }}
                                        />
                                    </CCol> */}
            <CCol md={12}>
              <CFormLabel htmlFor="validationDefault04">
                Neighborhoods<span style={{ color: "Red" }}>*</span>
              </CFormLabel>
              <select
                name="id"
                className="form-control"
                value={neighborhood}
                onChange={(e) => {
                  setNeighborhood(e.target.value);
                }}
              >
                <option value="">-Select-</option>
                <option value="Chamela">Chamela</option>
                <option value="Cuixmala">Cuixmala</option>
                <option value="Las Alamandas">Las Alamandas</option>
                <option value="Casitas de las Flores">
                  Casitas de las Flores
                </option>
                <option value="Constellation">Constellation</option>
                <option value="El Careyes Hotel">El Careyes Hotel</option>
                <option value="Paraiso">Paraiso</option>
                <option value="Peninsula de las Estrellas">
                  Peninsula de las Estrellas
                </option>
                <option value="Zyanya">Zyanya</option>
                <option value="Polo">Polo</option>
                <option value="Pueblo Careyes">Pueblo Careyes</option>
                <option value="Rincon de Careyes">Rincon de Careyes</option>
                <option value="Tamarindo">Tamarindo</option>
              </select>
            </CCol>

            <CCol md={12} className="d-flex align-items-end ">
              <CButton
                color="primary"
                type="submit"
                className="me-2"
                id="submitBtn"
              >
                Submit
              </CButton>

              <CButton color="secondary" type="reset" onClick={HandleResetData}>
                Reset
              </CButton>
            </CCol>
          </CForm>
        </Modal.Body>
      </Modal>
    </>
  );
};
Careyeshousing.layout = "Contentlayout";
export default Careyeshousing;
