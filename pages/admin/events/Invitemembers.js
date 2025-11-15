import { React, useState, useRef, useEffect } from "react";
import { Button, Form, Modal, Table, Card, Row, Col, Breadcrumb, Alert, Collapse } from "react-bootstrap";
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table";
import Seo from '@/shared/layout-components/seo/seo';
import Link from "next/link";
import axios from "axios"
import Moment from "react-moment";




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
        Cell: ({ row }) => (
            <div className="d-flex mt-2">
                {/* <div>
                    <img width="50px" height="50px" src={`/uploads/${row.original.ImageURL}`} alt="" className="pe-2 align-center"></img>
                </div> */}

                <div>
                    {row.original.ImageURL ? (
                        <img
                            width="50px"
                            height="50px"
                            src={`/uploads/${row.original.ImageURL}`}
                            alt=""
                            className="pe-2 align-center"
                        />
                    ) : (
                        <img
                            width="50px"
                            height="50px"
                            src="https://www.thecakepalace.com.au/wp-content/uploads/2022/10/dummy-user.png" // Replace this with your placeholder image path
                            alt="Image Not Found"
                            className="pe-2 align-center"
                        />
                    )}
                </div>

                <div className="ms-1">
                    <strong> <Link href={"#"} customValue={`${row.original.id}`} className="rupam">
                        {row.original.FirstName},{row.original.LastName}</Link></strong><br />
                    Member ID : {row.original.id}
                    <br />
                </div>
            </div>
        ),
    },

    {
        Header: "Email",
        accessor: "Email",
        className: "borderrigth",
        Cell: ({ row }) => (
            <b>
                {row.original.Email}</b>
        )
    },


    {
        Header: "Membership Level",
        accessor: "Membership",
        className: "borderrigth",
        Cell: ({ row }) => (
            <div>
                {row.original.MembershipLevel === 0 && "Standard"}
                {row.original.MembershipLevel === 1 && "Topaz"}
                {row.original.MembershipLevel === 2 && "Turquoise"}
                {row.original.MembershipLevel === 3 && "Emerald"}
            </div>
        )
    },

    {
        Header: "Careyes Owner",
        accessor: "CareyesHomeownerFlag",
        className: "borderrigth",
        Cell: ({ row }) => (
            <div>
                {row.original.CareyesHomeownerFlag === 0 && "No"}
                {row.original.CareyesHomeownerFlag === 1 && "Yes"}
            </div>
        )
    },
    {
        Header: "Invite",
        accessor: "Invite",
        className: "borderrigth",
        Cell: ({ row }) => (
            <div>
                <Link href={"#"} className="badge rounded-pill bg-info">+ INVITE</Link>
            </div>
        )
    },



];

const InviteMembersTable = () => {
    const [validatedCustom, setValidatedCustom] = useState(false);
    const [lgShow, setLgShow] = useState(false);
    const [DATATABLE, SetDATATABLE] = useState([]);
    const [modalData, setModalData] = useState([]);
    const [FirstName, setFirstName] = useState("");
    const [LastName, setLastName] = useState("");
    const [Email, setEmail] = useState("");
    const [ID, setID] = useState("");
    const [MembershipLevel, setMembershipLevel] = useState("");
    const [Status, setStatus] = useState("");



    // console.log("modalData", modalData.FirstName)
    const handleSubmitCustom = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        setValidatedCustom(true);
    };
    // const [searchData, setSearchData] = useState([]);


    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: DATATABLE,
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    // Alertb messages
    const [openAlert, setOpenAlert] = useState(false);
    const [staticAdded, setStaticAdded] = useState("");

    var StaticMessage = '';
    useEffect(() => {
        if (typeof window !== 'undefined') {
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
    }, [StaticMessage]);



    // Modal popup open 
    const handleClick = (e) => {
        // Data view for popup
        const clickedValue = e.target.getAttribute('customValue');
        const DetailURL = `/api/v1/members?id=${clickedValue}`;
        axios.get(DetailURL)
            .then(response => {
                console.log("response", response.data.data)
                setModalData(response.data.data)
                // Handle the fetched data here
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle errors here
            });

        e.preventDefault();
        const target = e.target.classList.contains('rupam');
        if (target) {
            //     console.log('iff');
            viewDemoShow('lgShow');
        }
    };


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
    // View Data for memeber
    const MemberURL = "/api/v1/members"
    useEffect(() => {
        fetch(MemberURL)
            .then((response) => response.json())
            .then((value) => {
                // console.log("FirstName", value.data)
                SetDATATABLE(value.data)
            })
    }, [])




    // Data Searching

    const SearchUrl = "/api/v1/members";
    const SearchMember = async (event) => {
        event.preventDefault();
        // Check if any of the parameters is provided, if not, keep the previous 'data' value (empty array).
        if (!FirstName && !LastName && !ID && !MembershipLevel && !Status && !Email) {
            return;
        }
        const queryParams = {
            FirstName: FirstName,
            key: "search",
            LastName: LastName,
            Email: Email,
            ID: ID,
            MembershipLevel: MembershipLevel,
            Status: Status
        };
        const queryString = new URLSearchParams(queryParams).toString();
        const apiurlWithParams = `${SearchUrl}?${queryString}`;

        await axios.get(apiurlWithParams)
            .then((res) => {
                console.log("data", res.data.searchResults)
                SetDATATABLE(res.data.searchResults);
            }).catch((err) => {
                console.log(err)
            });
    };
    // console.log("searchData", DATATABLE)

    // Search reset
    const HandleResetData = () => {
        setFirstName('')
        setLastName('');
        setEmail('');
        setID('');
        setMembershipLevel('');
        fetch(MemberURL)
            .then((response) => response.json())
            .then((value) => {
                SetDATATABLE(value.data)
            })
    }

    // Popup functions
    let viewDemoShow = (modal) => {
        switch (modal) {
            case "Basic":
                setbasic(true)
                break;
            case "smShow":
                setSmShow(true)
                break;
            case "lgShow":
                setLgShow(true)
                break;
            case "gridshow":
                setGridshow(true)
                break;
            case "success":
                setSuccess(true)
                break;
            case "Error":
                setError(true)
                break;
            case "select":
                setSelect(true)
                break;
            case "Scroll":
                setScroll(true)
                break;
            // case "modalShow":
            //   setmodalShow(true)
            // break;
        }
    }
    let viewDemoClose = (modal) => {
        switch (modal) {
            case "Basic":
                setbasic(false)
                break;
            case "smShow":
                setSmShow(false)
                break;
            case "lgShow":
                setLgShow(false)
                break;
            case "gridshow":
                setGridshow(false)
                break;
            case "success":
                setSuccess(false)
                break;
            case "Error":
                setError(false)
                break;
            case "select":
                setSelect(false)
                break;
            case "Scroll":
                setScroll(false)
                break;
            // case "modalShow":
            //   setmodalShow(false)
            // break;
        }
    }
    const displayPages = 3; // Number of page numbers to display



    return (
        <>

            <Seo title={"Invite Members"} />
            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">Invite Members to Event</span>
                </div>
                {staticAdded != null && openAlert === true && (
                    <Collapse in={openAlert}>
                        <Alert aria-hidden={true} severity="success">
                            {staticAdded}
                        </Alert>
                    </Collapse>
                )}
                <div className="justify-content-center mt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item className=" tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Event
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            invitation
                        </Breadcrumb.Item>
                    </Breadcrumb>

                </div>
            </div>




            <div className="left-content mt-2">


                <Row className="row-sm mt-4">
                    <Col xl={12}>
                        <Card>

                            {/* <Card.Header className=" ">
                                <div className="d-flex justify-content-between">
                                    <h4 className="card-title mg-b-0">Search Members</h4>
                                </div>
                            </Card.Header> */}
                            <Card.Body className="">

                                <CForm
                                    className="row g-3 needs-validation"
                                    noValidate
                                    // validated={validatedCustom}
                                    onSubmit={SearchMember}
                                >
                                    <CCol md={2}>
                                        <CFormLabel htmlFor="validationCustom03">Last Name</CFormLabel>
                                        <CFormInput type="text" id="validationCustom03" required
                                            value={LastName}
                                            onChange={(e) => {
                                                console.log(e.target.value);
                                                setLastName(e.target.value);
                                            }}

                                        />
                                        <CFormFeedback invalid>Please provide a valid Name.</CFormFeedback>
                                    </CCol>
                                    <CCol md={2}>
                                        <CFormLabel htmlFor="validationCustom03">First Name</CFormLabel>
                                        <CFormInput type="text"
                                            id="validationCustom03"
                                            required
                                            value={FirstName}
                                            onChange={(e) => {
                                                console.log(e.target.value);
                                                setFirstName(e.target.value);
                                            }}

                                        />
                                        <CFormFeedback invalid>Please provide a valid Name.</CFormFeedback>
                                    </CCol>

                                    <CCol md={2}>
                                        <CFormLabel htmlFor="validationDefault04">Membership Level</CFormLabel>
                                        <Form.Select aria-label="Default select example"
                                            value={MembershipLevel}
                                            onChange={(e) => {
                                                console.log(e.target.value);
                                                setMembershipLevel(e.target.value);
                                            }}
                                        >
                                            <option value="">Select</option>
                                            <option value="0">Standard</option>
                                            <option value="1">Topaz</option>
                                            <option value="2">Turquoise</option>
                                            <option value="3">Emerald</option>

                                        </Form.Select>
                                        <CFormFeedback invalid>Please provide a valid Country.</CFormFeedback>
                                    </CCol>

                                    <CCol md={2}>
                                        <CFormLabel htmlFor="validationDefault04">Careyes Homeowner</CFormLabel>
                                        <Form.Select aria-label="Default select example"
                                            value={MembershipLevel}
                                            onChange={(e) => {
                                                console.log(e.target.value);
                                                setMembershipLevel(e.target.value);
                                            }}
                                        >
                                            <option value="">Careyes Homeowner</option>
                                            <option value="1">Is Homeowner</option>
                                            <option value="0">Not Homeowner</option>

                                        </Form.Select>
                                        <CFormFeedback invalid>Please provide a valid Country.</CFormFeedback>
                                    </CCol>




                                    <CCol md={2}>
                                        <CFormLabel htmlFor="validationDefault04">Artist</CFormLabel>
                                        <Form.Select aria-label="Default select example"
                                            value={MembershipLevel}
                                            onChange={(e) => {
                                                console.log(e.target.value);
                                                setMembershipLevel(e.target.value);
                                            }}
                                        >
                                            <option value="">Artist</option>
                                            <option value="1">Is Artist</option>
                                            <option value="0">Not Artist</option>

                                        </Form.Select>
                                        <CFormFeedback invalid>Please provide a valid Country.</CFormFeedback>
                                    </CCol>


                                    <CCol md={2}>
                                        <CFormLabel htmlFor="validationDefault04">Profile Status</CFormLabel>
                                        <Form.Select aria-label="Default select example"
                                            value={MembershipLevel}
                                            onChange={(e) => {
                                                console.log(e.target.value);
                                                setMembershipLevel(e.target.value);
                                            }}
                                        >
                                            <option value="">Profile Status</option>
                                            <option value="1">Profile Complete</option>
                                            <option value="0">Profile Incomplete</option>

                                        </Form.Select>
                                        <CFormFeedback invalid>Please provide a valid Country.</CFormFeedback>
                                    </CCol>

                                    <CCol md={2}>
                                        <CFormLabel htmlFor="validationDefault04">Past Event attended</CFormLabel>
                                        <Form.Select aria-label="Default select example"
                                            value={MembershipLevel}
                                            onChange={(e) => {
                                                console.log(e.target.value);
                                                setMembershipLevel(e.target.value);
                                            }}
                                        >
                                            <option value="">Past Event attended</option>
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </Form.Select>
                                        <CFormFeedback invalid>Please provide a valid Country.</CFormFeedback>
                                    </CCol>
                                    <CCol md={2}>
                                        <CFormLabel htmlFor="validationDefault04">Select options</CFormLabel>
                                        <Form.Select aria-label="Default select example"
                                            value={MembershipLevel}
                                            onChange={(e) => {
                                                console.log(e.target.value);
                                                setMembershipLevel(e.target.value);
                                            }}
                                        >
                                            <option value="">Select options</option>
                                            <option value="Art & Artisans">Art & Artisans</option>
                                            <option value="NFTs">NFTs</option>
                                            <option value="Land & Ocean Conservation">Land & Ocean Conservation</option>
                                            <option value="Health & Wellness">Health & Wellness</option>
                                            <option value="Psychedelics">Psychedelics</option>
                                            <option value="Climate Mitigation & Sustainability">Climate Mitigation & Sustainability</option>
                                            <option value="1Web3 & Metaverse">Web3 & Metaverse</option>
                                            <option value="Indigenous Peoples and Culture">Indigenous Peoples and Culture</option>
                                            <option value="Music & Festivals">Music & Festivals</option>
                                            <option value="Careyes Real Estate">Careyes Real Estate</option>
                                            <option value="Crypto & Blockchain">Crypto & Blockchain</option>

                                        </Form.Select>
                                        <CFormFeedback invalid>Please provide a valid Country.</CFormFeedback>
                                    </CCol>
















                                    <CCol md={3} className="d-flex align-items-end ">
                                        <CButton color="primary" type="submit" className="me-2">
                                            Submit
                                        </CButton>

                                        <CButton color="secondary" type="reset"
                                            onClick={HandleResetData}
                                        >
                                            Reset
                                        </CButton>
                                    </CCol>
                                </CForm>
                            </Card.Body>

                        </Card>
                    </Col>






                    <Col xl={12}>
                        <Card>

                            <Card.Header className=" ">
                                <div className="d-flex justify-content-between">
                                    <h4></h4>
                                </div>
                            </Card.Header>
                            <Card.Body className="">


                                {/* <div className="d-flex">
                                    <select
                                        className=" mb-4 selectpage border me-1"
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                    >
                                        {[10, 25, 50, 100].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                Show {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                    <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                                </div> */}



                                <table {...getTableProps()} className="table table-hover mb-0" onClick={handleClick}>
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
                                                    })}
                                                </tr>
                                            );
                                        })}

                                    </tbody>
                                </table>

                                <div className="d-block d-sm-flex mt-4 ">
                                    <span className="">
                                        Page{" "}
                                        <strong>
                                            {pageIndex + 1} of {pageOptions.length}
                                        </strong>{" "}
                                    </span>
                                    {/* <span className="ms-sm-auto ">
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
                                    </span> */}

                                    {/* <style>{yourCustomStyles}</style> */}
                                    <span className="ms-sm-auto">
                                        <Button
                                            variant=""
                                            className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                                            onClick={() => gotoPage(0)}
                                            disabled={!canPreviousPage}
                                        >
                                            {"Previous"}
                                        </Button>

                                        {Array.from({ length: Math.min(displayPages, pageCount) }, (_, index) => {
                                            const page = pageIndex - Math.floor(displayPages / 2) + index;
                                            return (
                                                page >= 0 && page < pageCount && (
                                                    <Button
                                                        key={index}
                                                        variant=""
                                                        // className="btn-default tablebutton me-2 my-1"
                                                        className={`btn-default tablebutton me-2 my-1 ${page === pageIndex ? 'active-page' : ''}`}
                                                        onClick={() => gotoPage(page)}
                                                    >
                                                        {page + 1}
                                                    </Button>
                                                )
                                            );
                                        })}
                                        <Button
                                            variant=""
                                            className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                                            onClick={() => gotoPage(pageCount - 1)}
                                            disabled={!canNextPage}
                                        >
                                            {"Next"}
                                        </Button>
                                    </span>
                                </div>

                            </Card.Body>

                        </Card>
                    </Col>
                </Row>
            </div>
            <Modal
                size="lg"
                show={lgShow}
                aria-labelledby="example-modal-sizes-title-sm"
            >
                <Modal.Header>
                    {/* <Modal.Title>{modalData.FirstName ? modalData.FirstName : '---'}, {modalData.LastName ? modalData.LastName : '--'}
                    </Modal.Title> */}
                    <Modal.Title>
                        {modalData && modalData.FirstName ? modalData.FirstName : '---'},
                        {modalData && modalData.LastName ? modalData.LastName : '--'}
                    </Modal.Title>
                    <Button
                        variant=""
                        className="btn btn-close ms-auto"
                        onClick={() => { viewDemoClose("lgShow") }}
                    >
                        x
                    </Button>
                </Modal.Header>
                <Modal.Body>

                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-4">
                                {/* <h6 className="mb-3" id="staticBackdropLabel5"> kamal kumawat</h6> */}
                                {/* <img src="https://www.thecakepalace.com.au/wp-content/uploads/2022/10/dummy-user.png" alt="" className="bd-placeholder-img border border-primary border-1 p-2 rounded-pill" width="150px" /> */}
                                {modalData && modalData.ImageURL ? (
                                    <img
                                        className="bd-placeholder-img border border-primary border-1 p-2 rounded-pill"
                                        width="150px"
                                        src={`/uploads/${modalData.ImageURL}`}
                                        alt=""
                                    />
                                ) : (
                                    <img
                                        className="bd-placeholder-img border border-primary border-1 p-2 rounded-pill"
                                        width="150px"
                                        src="https://www.thecakepalace.com.au/wp-content/uploads/2022/10/dummy-user.png" // Replace this with your placeholder image path
                                        alt="Image Not Found"
                                    />
                                )}
                            </div>

                            <div className="col-md-8 mx-auto my-auto">
                                <div className="row">
                                    <div className="col-12 d-flex justify-content-end">
                                        <button type="button" className="btn btn-secondary btn-sm me-2 rounded-pill btn-wave">Log in As User</button>
                                        <button type="button" className="btn btn-success btn-sm rounded-pill btn-wave">See Full Profile</button>
                                    </div>
                                </div>

                                <h6 className="border-bottom py-2">Basic Information</h6>

                                <div className="row mt-3">
                                    <div className="col-sm-6">
                                        {/* <p> <b>First Name:</b> {modalData.FirstName}</p> */}
                                        <p> <b>First Name:</b> {modalData && modalData.FirstName ? modalData.FirstName : '---'}</p>
                                        <p><b>Phone:</b>  {modalData && modalData.PhoneNumber ? modalData.PhoneNumber : '--'}</p>
                                        <p><b>Gender:</b> {modalData && modalData.Gender ? modalData.Gender : '--'}</p>
                                        <p><b>Place of Birth:</b> {modalData && modalData.city_country_birth ? modalData.city_country_birth : '--'}</p>
                                        <p><b>Company:</b> {modalData && modalData.CompanyName ? modalData.CompanyName : '--'}</p>
                                        <p><b>Party people:</b> {modalData && modalData.party_people ? modalData.party_people : '--'}</p>


                                    </div>

                                    <div className="col-sm-6">
                                        <p><b>Last Name:</b> {modalData && modalData.LastName ? modalData.LastName : '--'}</p>
                                        <p><b>Email:</b> {modalData && modalData.Email ? modalData.Email : '--'}</p>
                                        <p><b>Dob: </b>
                                            {/* {modalData && modalData.dob ? modalData.dob : '--'} */}
                                            {modalData && modalData.dob ? (
                                                <Moment format="YYYY-MM-DD">
                                                    {modalData.dob}
                                                </Moment>
                                            ) : (
                                                '--'
                                            )}
                                            {/* {modalData && modalData.dob && moment(modalData.dob, 'YYYY-MM-DD', true).isValid() ? (
                                                <Moment format="YYYY-MM-DD">
                                                    {modalData.dob}
                                                </Moment>
                                            ) : (
                                                '--'
                                            )} */}
                                        </p>
                                        <p><b>Currently Live:</b> {modalData && modalData.city_country_live ? modalData.city_country_live : '--'}</p>
                                        <p><b>Title:</b> {modalData && modalData.CompanyTitle ? modalData.CompanyTitle : '--'}</p>
                                        <p><b>Tier: </b> {modalData && modalData.tier ? modalData.tier : '--'}</p>




                                    </div>
                                </div>


                            </div>
                        </div>

                        <div className="sytm-info  mt-4 p-2 rounded-3 shadow">
                            <h6 className="border-bottom py-2">System Information</h6>
                            <div className="row mt-3 mx-0">
                                <div className="col-md-4 pe-1 ">
                                    <p><b>Member ID:</b>  {modalData && modalData.id ? modalData.id : '--'}</p>
                                    <p><b>Membership Level:</b> {modalData?.MembershipLevel === 0 ? "Standard" : modalData?.MembershipLevel === 1 ? "Topaz" : modalData?.MembershipLevel === 2 ? "Turquoise" : modalData?.MembershipLevel === 3 ? "Emerald" : " "}</p>
                                    {/* <p><b>Membership Level:</b> {modalData && modalData.MembershipLevel === 0 ? "Standard" : modalData.MembershipLevel === 1 ? "Topaz" : modalData.MembershipLevel === 2 ? "Turquoise" : modalData.MembershipLevel === 3 ? "Emerald" : " "}</p> */}
                                    <p><b>Comped:</b> {modalData && modalData.CompedFlag === 1 ? "Yes" : "No"}</p>
                                    <p><b>Internal Notes:</b> {modalData && modalData.InternalNotes ? modalData.InternalNotes : '--'}</p>
                                </div>
                                <div className="col-md-4 ps-1">
                                    <p><b>Date Created: </b>
                                        {/* {modalData && modalData.createdAt ? modalData.createdAt : '--'} */}
                                        {modalData && modalData.createdAt ? (
                                            <Moment format="YYYY-MM-DD HH:mm:ss">
                                                {modalData.createdAt}
                                            </Moment>
                                        ) : (
                                            '--'
                                        )}
                                    </p>
                                    <p><b>Founding Member: </b>{modalData && modalData.FounderFlag === 1 ? "Yes" : "No"}</p>
                                    <p><b>Filippo Referral: </b>{modalData && modalData.FilippoReferralFlag === 1 ? "Yes" : "No"}</p>
                                </div>
                                <div className="col-md-4 ps-1">
                                    <p><b>Status: {modalData && modalData.status === 1 ? "Active" : "Inactive"}</b></p>
                                    <p><b>Careyes Homeowner:</b> {modalData && modalData.CareyesHomeownerFlag === 1 ? "Yes" : "No"}</p>
                                    <p><b>Artist Type:</b>{modalData && modalData.ArtistType ? modalData.ArtistType : '--'}</p>
                                </div>
                            </div>
                        </div>


                        <div className="sytm-info  mt-4 p-2 rounded-3 shadow">
                            <h6 className="border-bottom py-2">Basic Additional Information</h6>
                            <div className="row mt-3 mx-0">
                                <div className="col-md-4 pe-1 ">
                                    <p><b>Accepted Terms & Conditions:</b>{modalData && modalData.offer_ticket_packages === 1 ? "Yes" : "No"}</p>
                                    <p><b>My Wellness Routine:</b> {modalData && modalData.advocate_for_harmony ? modalData.advocate_for_harmony : '--'}</p>
                                    <p><b>Communities are you member in :</b> {modalData && modalData.are_you_member ? modalData.are_you_member : '--'}</p>
                                    <p><b>Ondalinda Refernces:</b> {modalData && modalData.not_attendedfestival ? modalData.not_attendedfestival : '--'}</p>
                                    <p><b>My Remark:</b> {modalData && modalData.appreciate_your_honesty ? modalData.appreciate_your_honesty : '--'}</p>

                                </div>
                                <div className="col-md-4 ps-1">
                                    <p><b>Favorite Kind of Music:</b> {modalData && modalData.favourite_music ? modalData.favourite_music : '--'}</p>
                                    <p><b>My Core Values:</b>{modalData && modalData.core_values ? modalData.core_values : '--'}</p>
                                    <p><b>Comments: </b>{modalData && modalData.comments ? modalData.comments : '--'}</p>
                                    <p><b>Social Media Handles: </b>{modalData && modalData.instagram_handle ? modalData.instagram_handle : '--'}</p>
                                    <p><b>Past Ondalinda Events Attended :</b> {modalData && modalData.attended_festival_before ? modalData.attended_festival_before : '--'}</p>

                                </div>
                                <div className="col-md-4 ps-1">
                                    <p><b>Your Suggestion:</b> {modalData && modalData.sustainable_planet ? modalData.sustainable_planet : '--'}</p>
                                    <p><b>Social Media Accounts: </b>{modalData && modalData.social_media_platform ? modalData.social_media_platform : '--'}</p>
                                    <p><b>Interested In:</b> {modalData && modalData.most_interested_festival ? modalData.most_interested_festival : '--'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="sytm-info  mt-4 p-2 rounded-3 shadow">
                            <h6 className="border-bottom py-2">Social Media Links</h6>
                            <div className="row mt-3 mx-0 justify-content-between">
                                <div className="col-md-4 pe-1 ">
                                    <p><b>Facebook:</b>  {modalData && modalData.facebook_profile_link ? modalData.facebook_profile_link : '--'}</p>
                                    <p><b>Linkedin:</b>  {modalData && modalData.linkdin_profile_link ? modalData.linkdin_profile_link : '--'}</p>
                                </div>
                                <div className="col-md-6 ps-1">
                                    <p><b>Instagram:</b> {modalData && modalData.instagram_handle ? modalData.instagram_handle : '--'}</p>
                                    <p><b>Link Tree: </b> {modalData && modalData.link_tree_link ? modalData.link_tree_link : '--'}</p>
                                </div>
                            </div>
                        </div>

                        {/* <div className="col-sm-9 w-100 mx-2 bg-light border">
                            <b>Events Attended:</b> This user has no invitation/registrations at this time
                        </div> */}
                        <div className="sytm-info  mt-4 p-2 rounded-3 shadow">
                            <h6 className="border-bottom py-2">Events Attended</h6>
                            <div className="row mt-3 mx-0 justify-content-between">
                                <div className="col-md-6 pe-1 d-flex ">
                                    <div className="col-md-4 mt-2 p-0">
                                        <img src="https://www.ondalinda.com/_images/home/music.jpg" alt="" className="pe-2 align-top"></img>
                                    </div>
                                    <div className="col-md-7 ps-1 ">
                                        <p className="m-0"><b>Ondalinda x Careyes 2023</b></p>
                                        <p className="m-0">Nov 8-12-2023</p>
                                        <p className="m-0">Careyes Mexico</p>
                                        <p className="m-0">invited Oct 272023</p>
                                    </div>
                                </div>
                                <div className="col-md-6 pe-1 d-flex ">
                                    <div className="col-md-4 mt-2 p-0">
                                        <img src="https://www.ondalinda.com/_images/home/music.jpg" alt="" className="pe-2 align-top"></img>
                                    </div>
                                    <div className="col-md-7 ps-1 ">
                                        <p className="m-0"><b>Ondalinda x Careyes 2023</b></p>
                                        <p className="m-0">Nov 8-12-2023</p>
                                        <p className="m-0">Careyes Mexico</p>
                                        <p className="m-0">invited Oct 272023</p>
                                    </div>
                                </div>
                            </div>
                        </div>







                    </div>

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


InviteMembersTable.layout = "Contentlayout"
export default InviteMembersTable
