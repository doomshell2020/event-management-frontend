import { React, useState, useEffect } from "react";
import { Button, Form, Modal, Card, Row, Col, Breadcrumb, Alert, Collapse, Pagination, Spinner } from "react-bootstrap";
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table";
import Seo from '@/shared/layout-components/seo/seo';
import Link from "next/link";
import axios from "axios"
import Moment from "react-moment";
import { useRouter } from 'next/router';
import moment from 'moment';
import { MultiSelect } from "react-multi-select-component";
import ClipLoader from "react-spinners/ClipLoader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';


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
// import { Checkbox, ListItemIcon, ListItemText, MenuItem } from "@mui/material";

const InvitationsTable = () => {
    const navigate = useRouter();

    const [validatedCustom, setValidatedCustom] = useState(false);
    const [lgShow, setLgShow] = useState(false);
    const [DATATABLE, SetDATATABLE] = useState([]);
    const [modalData, setModalData] = useState([]);
    const [FirstName, setFirstName] = useState("");
    const [LastName, setLastName] = useState("");
    const [Email, setEmail] = useState("");
    const [ID, setID] = useState("");
    const [MembershipLevel, setMembershipLevel] = useState("");
    const [Status, setStatus] = useState([]);
    const [HousingOption, setHousingOption] = useState([]);
    const [ArtistType, setArtistType] = useState("");
    const [attended_festival_before, setAttended_festival_before] = useState("");
    const [CareyesHomeownerFlag, setCareyesHomeownerFlag] = useState("");
    const [Interests, setInterests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [spinner, setSpinner] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [staticAdded, setStaticAdded] = useState("");
    const [pagination, setPagintion] = useState({});
    const [pages, setPage] = useState(1);
    const [pageSize, setManualPageSize] = useState(10);
    const [selected, setSelected] = useState([]);
    const [UserID, setUserID] = useState([]);
    const [Basic, setBasic] = useState(false);
    const router = useRouter();
    const { id } = router.query;
    const [errorAlert, setErrorAlert] = useState('');
    const [openerror, setOpenError] = useState(false);
    const [isHideShow, setIsHideShow] = useState(true);


    console.log("UserID", UserID)

    // const fetchTotalTickets = async (userId, eventId) => {
    //     try {
    //         const totaltickapiurl = `https://staging.eboxtickets.com/embedapi/totalticketsbyuser`;
    //         const ticparams = {
    //             "userId": "10303",
    //             "eventId": "108"
    //         }
    //         const myResponse = await axios.post(totaltickapiurl, ticparams);
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //     }
    // }

    const routeChange = () => {
        let path = `/admin/events/invitations/`;
        navigate.push({
            pathname: path,
            search: `?id=${id}`,
        });

    }

    const handleRentInclude = (e) => {
        if (e) {
            setUserID((prev) => [...prev, e]);
        } else {
            setUserID((prev) => prev.filter((item) => item !== e));
        }
    }

    const [selectAllChecked, setSelectAllChecked] = useState([]);
    console.log("🚀 ~ InvitationsTable ~ selectAllChecked:", selectAllChecked)

    const selectAll = () => {
        const updatedData = DATATABLE.map((row) => ({
            ...row,
            User: {
                ...row.User,
                isChecked: row.User && row.User.isChecked ? false : true,
            },
        }));

        const checkedIds = updatedData
            .filter((row) => row.User && row.User.isChecked)
            .map((row) => row.UserID);
        setSelectAllChecked(checkedIds);

        SetDATATABLE(updatedData);
    };


    const [COLUMNS, setCOLUMNS] = useState([
        {
            Header: "S.No",
            accessor: (row, index) => index + 1,
            className: "borderrigth",
        },
        {
            Header: "#",
            accessor: "SNO",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    <input
                        type="checkbox"
                        className="rupam"
                        checked={row.original.User && row.original.User.isChecked || false}
                        onChange={selectAll}
                    />
                </div>
            )
        },
        {
            Header: "Member",
            accessor: "Name",
            className: "wd-25p borderrigth",
            Cell: ({ row }) => (
                <div className="d-flex mt-2">
                    <div className="evnt-invts-prfl">
                        {row.original.User && row.original.User.ImageURL ? (
                            <img
                                width="50px"
                                height="50px"
                                src={`/uploads/profiles/${row.original.User.ImageURL}`}
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
                        {/* <strong> <Link href={"#"} customvalue={`${row.original.id}`} className="rupam">
                            {row.original.User.LastName}, {row.original.User.FirstName}</Link></strong><br /> */}
                        <Link href="#" customvalue={row.original.UserID} className="rupam" onClick={(e) => handleClick(e, row.original.UserID)}>
                            <strong>

                                {row.original && row.original.User ? (
                                    `${row.original.User.LastName || ''}, ${row.original.User.FirstName || ''}`
                                ) : (
                                    "User Information Not Available"
                                )}
                            </strong>
                        </Link>
                        {/* {row.original.User.CompanyName}, {row.original.User.CompanyTitle}<br /> */}
                        {row.original.User && (
                            <>
                                {row.original.User.CompanyName && (
                                    <>{row.original.User.CompanyName}, </>
                                )}
                                {row.original.User.CompanyTitle && (
                                    <>{row.original.User.CompanyTitle}</>
                                )}
                            </>
                        )}<br />
                        {/* {row.original.User.Email}<br /> */}
                        {row.original.User && row.original.User.Email ? (
                            <>{row.original.User.Email}</>
                        ) : (
                            "Email Not Available"
                        )}<br />
                        Member ID : {row.original.UserID}
                        <br />
                    </div>
                </div>
            ),
        },
        {
            Header: "Housing",
            accessor: "Housing",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>

                    {row.original.HousingOption === 1 && "Renter"}
                    {row.original.HousingOption === 2 && "House Guset"}
                    {row.original.HousingOption === 4 && "Home Owner"}
                    {row.original.HousingOption === 3 && "No Housing Required"}
                </div>
            )
        },
        {
            Header: "Invited",
            accessor: "Invited",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {/* {row.original.DateInvited} */}
                    {row.original.updatedAt ? (
                        <Moment format="YYYY-MM-DD">
                            {row.original.updatedAt}
                        </Moment>
                    ) : (
                        '--'
                    )}
                </div>
            )
        },
        {
            Header: "Expires",
            accessor: "Expires",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {row.original.DateExpired ? (
                        <Moment format="YYYY-MM-DD">
                            {row.original.DateExpired}
                        </Moment>
                    ) : (
                        '--'
                    )}
                </div>

            )
        },
        {
            Header: "Registered",
            accessor: "Registered",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {row.original.User ? (
                        <Moment format="YYYY-MM-DD">
                            {row.original.User.DateCreated}
                        </Moment>
                    ) : (
                        '--'
                    )}
                </div>
            )
        },
        {
            Header: "Status",
            accessor: "Status",
            className: "borderrigth",
            Cell: ({ row }) => (
                <div>
                    {/* {row.original.Status === 0 && "Invited"} */}
                    {row.original.Status === 0 && "Interested"}
                    {/* {row.original.Status === 1 && "Completed"} */}
                    {row.original.Status === 1 && "Invited"}
                    {row.original.Status === 3 && "Partially Paid"}
                    {row.original.Status === 4 && "Over Paid"}
                    {/* {row.original.Status === 2 && "Pending CC Approval"} */}
                    {row.original.Status === 2 && "Completed"}


                </div>
            )
        },

        // {
        //     Header: "Buy Tickets",
        //     accessor: "TicketsPurchased",
        //     className: "borderrigth",
        //     Cell: ({ row }) => (
        //         <div>
        //             {row.original.NumTicketsRequired}
        //         </div>
        //     )
        // },
        {
            Header: "Internal Notes",
            accessor: "InternalNotes",
            className: "wd-25p borderrigth",
            Cell: ({ row }) => (
                <div>
                    {row.original.InternalNotes}

                </div>
            )
        },
    ]);

    // Multiple select invite
    const InviteEvent = async (event) => {

        const confirmationResult = await Swal.fire({
            title: 'Are you sure you want to invite?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, invite!',
            cancelButtonText: 'No, cancel',
        });

        if (confirmationResult.isConfirmed) {

            setIsLoading(true);
            const selectedLocationsString = UserID.join(',');
            if (!selectedLocationsString) {
                setIsLoading(false);
                return false;
            }

            const CmsAddUrl = '/api/v1/invitationevents';
            setSpinner(true);
            const body = {
                UserID: selectedLocationsString,
                key: "Addinvitation",
                EventID: id
            };
            await axios.post(CmsAddUrl, body)
                .then((res) => {
                    setSpinner(false);
                    const msg = res.data.message;
                    Swal.fire({
                        title: "Done!",
                        text: msg,
                        icon: "success"
                    });

                    fetch(EventsURL)
                        .then((response) => response.json())
                        .then((value) => {
                            setPagintion(value.pagination);
                            setTimeout(() => {
                                SetDATATABLE(value.data);
                                setIsLoading(false);
                            }, 1000);
                        })
                }).catch((err) => {
                    Swal.fire({
                        title: "Error!",
                        text: msg,
                        icon: "error"
                    });

                    setIsLoading(false);
                    setSpinner(false);
                    let message = err.response.data.message
                    setOpenError(true);
                    setErrorAlert(message)
                    setTimeout(() => {
                        setOpenError(false);
                    }, 3000);
                });
        }
    }


    const SingleInviteEvent = async (event) => {
        const confirmationResult = await Swal.fire({
            title: 'Are you sure you want to invite?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, invite!',
            cancelButtonText: 'No, cancel',
        });

        if (confirmationResult.isConfirmed) {
            setIsLoading(true);
            if (event.original.id != null) {
                const CmsAddUrl = '/api/v1/invitationevents';
                const userID = String(event.original.User ? event.original.User.id : "");
                const body = {
                    key: "Addinvitation",
                    UserID: userID,
                    EventID: id
                };

                try {
                    const res = await axios.post(CmsAddUrl, body);
                    const msg = res.data.message;

                    Swal.fire({
                        title: "Done!",
                        text: msg,
                        icon: "success"
                    });

                    const response = await fetch(EventsURL);
                    const value = await response.json();

                    setPagintion(value.pagination);
                    setTimeout(() => {
                        SetDATATABLE(value.data);
                        setIsLoading(false);
                    }, 1000);

                } catch (err) {
                    setIsLoading(false);
                    let message = err.response.data.message;
                    Swal.fire({
                        title: "Done!",
                        text: message,
                        icon: "error"
                    });
                    setOpenError(true);
                    setErrorAlert(message);
                    setTimeout(() => {
                        setOpenError(false);
                    }, 3000);
                }
            }
            setIsLoading(false);

        }

    };


    const tableInstance = useTable(
        {
            columns: COLUMNS,
            data: DATATABLE,
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

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
        // fetchTotalTickets();

    }, [StaticMessage]);


    function renderPageNumbers(currentPage, totalPages) {
        const maxVisiblePages = 5; // You can adjust this number based on your preference
        const halfMaxVisiblePages = Math.floor(maxVisiblePages / 2);
        let startPage = Math.max(1, currentPage - halfMaxVisiblePages);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Pagination.Item
                    key={i}
                    className={`page-item ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }
        return pages;
    }

    function handlePageChange(pageNumber) {
        setIsLoading(true);
        setPage(pageNumber);
        // console.log("Navigating to page", pageNumber);
        const EventsURL = `/api/v1/invitationevents?id=${id}&page=${pageNumber}&pageSize=${pageSize}`;
        fetch(EventsURL)
            .then((response) => response.json())
            .then((value) => {
                setPagintion(value.pagination);
                // console.log(value.pagination, "value");
                setTimeout(() => {
                    SetDATATABLE(value.data);
                    setIsLoading(false);
                    // console.log("value.data", value.data)
                }, 1000);
            })
    }


    // Modal popup open 
    const handleClick = (e, userID) => {
        e.preventDefault();
        const DetailURL = `/api/v1/members?id=${userID}`;
        axios.get(DetailURL)
            .then(response => {
                if (response.data.data) {
                    setModalData(response.data.data)
                    viewDemoShow('lgShow');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        // const target = e.target.classList.contains('rupam');
        // if (target) {
        //     console.log('iff');
        // }
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

    const { globalFilter, pageIndex } = state;
    // View Data for memeber

    const EventsURL = `/api/v1/invitationevents?id=${id}&page=${pages}&pageSize=${pageSize}`;

    useEffect(() => {
        setPageSize(pageSize)
        // console.log(EventsURL, "EventsURL");
        if (id != undefined) {
            fetch(EventsURL)
                .then((response) => response.json())
                .then((value) => {
                    setPagintion(value.pagination);
                    // console.log(value.pagination, "value");
                    // console.log("value.data", value.data)
                    setTimeout(() => {
                        SetDATATABLE(value.data);
                        setIsLoading(false);
                    }, 1000);
                })
        }
    }, [id, pageSize])
    // Data Searching

    const SearchUrl = "/api/v1/invitationevents";
    const SearchMember = async (event) => {
        event.preventDefault();
        setIsHideShow(false);
        // Check if any of the parameters is provided, if not, keep the previous 'data' value (empty array).
        if (!FirstName && !LastName && !ID && !MembershipLevel && !Status && !Email && !HousingOption && !ArtistType && !CareyesHomeownerFlag && !attended_festival_before && !Interests) {
            return;
        }
        const HousingOptionsSelect = HousingOption.map((e) => {
            return e.value
        })
        const HousingSelectbox = HousingOptionsSelect.join(',')
        const StatusoptionSelect = Status.map((e) => {
            return e.value
        })
        const StatusSelectbox = StatusoptionSelect.join(',')
        // User Interested
        const InterestSelect = Interests.map((e) => {
            return e.value
        })
        const InterestSelectbox = InterestSelect.join(',')


        const Searchbody = {
            FirstName: FirstName,
            LastName: LastName,
            Email: Email,
            EventID: id,
            UserID: ID,
            MembershipLevel: MembershipLevel,
            Status: StatusSelectbox,
            // EventID: id,
            HousingOption: HousingSelectbox,
            ArtistType: ArtistType,
            CareyesHomeownerFlag: CareyesHomeownerFlag,
            attended_festival_before: attended_festival_before,
            Interest: InterestSelectbox,

        };

        console.log("Searchbody", Searchbody)
        await axios
            .post(SearchUrl, Searchbody)
            .then((res) => {

                // console.log("data", data)
                // console.log("=>>>", res.data.searchResults);
                SetDATATABLE(res.data.searchResults)
            })
            .catch((err) => console.log(err));
    };

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
    var Firstname, Lastname, email, UserPhone, MemberShipLevel, Foundingmember, Careyesowner, Compeds, Comment, FilippoReferrals, ArtistTypess, Genders, Dobs, PlaceBirth, CurrentlyLive,
        CompanysName, CompanyTitless, PartysPeople, Tiers, Statuss, InternalNotess, TermsConditions, KindofMusics, YourSuggestions, MyWellnessRoutines, MyCoreValuess, Communitiesareyoumemberins, SocialMediaAccounts,
        OndalindaRefernces, SocialMediaHandles, InterestedIn, MyRemark, PastOndalindaEventsAttended, FacebookUrl, InstagramUrl, LinkedinUrl, LinkTree, CreatedDate

    // Export Excel
    const headers = [
        { label: "Member ID", key: "id" },
        { label: "First Name", key: "FirstNamee" },
        { label: "Last Name", key: "LastNamee" },
        { label: "Email", key: "userEmail" },
        { label: "Mobile", key: "userMobile" },
        { label: "Membership Level", key: "MembershipLevels" },
        { label: "Founding Member", key: "FoundingMember" },
        { label: "Careyes Owner", key: "CareyesOwner" },
        { label: "Comp'ed", key: "Comped" },
        { label: "Filippo Referral", key: "FilippoReferral" },
        { label: "Artist Type", key: "ArtistTypes" },
        { label: "Comments", key: "commentss" },

        { label: "Gender", key: "Gender" },
        { label: "Dob", key: "Dobss" },
        { label: "Place of Birth", key: "PlaceofBirth" },
        { label: "Currently Live", key: "CurrentlyLive" },
        { label: "Company", key: "Companys" },
        { label: "Title", key: "CompanyTitles" },
        { label: "Party people", key: "Partypeoples" },
        { label: "Tier", key: "Tierss" },
        { label: "Status", key: "Statusss" },
        { label: "Internal Notes", key: "InternalNotes" },
        { label: "Accepted Terms & Conditions", key: "TermsConditions" },
        { label: "Favorite Kind of Music", key: "KindofMusic" },
        { label: "Your Suggestion", key: "YourSuggestion" },
        { label: "My Wellness Routine", key: "MyWellnessRoutine" },
        { label: "My Core Values", key: "MyCoreValues" },
        { label: "Communities are you member in", key: "Communitiesareyoumemberin" },
        { label: "Social Media Accounts", key: "SocialMediaAccounts" },
        { label: "Ondalinda Refernces", key: "OndalindaRefernces" },
        { label: "Social Media Handles", key: "SocialMediaHandles" },
        { label: "Interested In", key: "InterestedIn" },
        { label: "My Remark", key: "MyRemark" },
        { label: "Past Ondalinda Events Attended ", key: "PastOndalindaEventsAttended" },
        { label: "Facebook Url", key: "FacebookUrl" },
        { label: "Instagram Url", key: "InstagramUrl" },
        { label: "Linkedin Url", key: "LinkedinUrl" },
        { label: "Link Tree", key: "LinkTree" },
        { label: "Date Created", key: "DateCreateds" },


    ];

    const data = DATATABLE.map((item) => {
        if (item.FirstName != null) {
            Firstname = item.FirstName
        } else {
            Firstname = "----"
        } if (item.LastName != null) {
            Lastname = item.LastName
        } else {
            Lastname = "----"
        } if (item.Email != null) {
            email = item.Email
        } else {
            email = "----"
        } if (item.PhoneNumber != null) {
            UserPhone = item.PhoneNumber
        } else {
            UserPhone = "----"
        }
        // if (item.MembershipLevel != null) {
        //     MemberShipLevel = item.MembershipLevel
        // } else {
        //     MemberShipLevel = "----"
        // }
        if (item.MembershipLevel != null) {
            switch (item.MembershipLevel) {
                case 0:
                    MemberShipLevel = "Standard";
                    break;
                case 1:
                    MemberShipLevel = "Topaz";
                    break;
                case 2:
                    MemberShipLevel = "Turquoise";
                    break;
                case 3:
                    MemberShipLevel = "Emerald";
                    break;
                default:
                    MemberShipLevel = "Unknown";
                    break;
            }
        } else {
            MemberShipLevel = "----";
        }

        if (item.FounderFlag != null) {
            // Foundingmember = item.FounderFlag
            Foundingmember = item.FounderFlag === 0 ? "No" : item.FounderFlag === 1 ? "Yes" : "Unknown";
        } else {
            Foundingmember = "----"
        }

        if (item.CareyesHomeownerFlag != null) {
            // Careyesowner = item.CareyesHomeownerFlag
            Careyesowner = item.CareyesHomeownerFlag === 0 ? "No" : item.CareyesHomeownerFlag === 1 ? "Yes" : "Unknown";

        } else {
            Careyesowner = "----"
        } if (item.CompedFlag != null) {
            // Compeds = item.CompedFlag
            Compeds = item.CompedFlag === 0 ? "No" : item.CompedFlag === 1 ? "Yes" : "Unknown";
        } else {
            Compeds = "----"
        } if (item.FilippoReferralFlag != null) {
            // Compeds = item.FilippoReferralFlag
            FilippoReferrals = item.FilippoReferralFlag === 0 ? "No" : item.FilippoReferralFlag === 1 ? "Yes" : "Unknown";

        } else {
            FilippoReferrals = "----"
        }
        if (item.ArtistType != null) {
            ArtistTypess = item.ArtistType
        } else {
            ArtistTypess = "----"
        } if (item.comments != null) {
            Comment = item.comments
        } else {
            Comment = "----"
        }
        // 
        if (item.comments != null) {
            Comment = item.comments
        } else {
            Comment = "----"
        } if (item.comments != null) {
            Comment = item.comments
        } else {
            Comment = "----"
        } if (item.comments != null) {
            Comment = item.comments
        } else {
            Comment = "----"
        } if (item.comments != null) {
            Comment = item.comments
        } else {
            Comment = "----"
        } if (item.comments != null) {
            Comment = item.comments
        } else {
            Comment = "----"
        } if (item.comments != null) {
            Comment = item.comments
        } else {
            Comment = "----"
        } if (item.Gender != null) {
            Genders = item.Gender
        } else {
            Genders = "----"
        } if (item.dob != null) {
            Dobs = item.dob
        } else {
            Dobs = "----"
        } if (item.city_country_birth != null) {
            PlaceBirth = item.city_country_birth
        } else {
            PlaceBirth = "----"
        } if (item.city_country_live != null) {
            CurrentlyLive = item.city_country_live
        } else {
            CurrentlyLive = "----"
        } if (item.CompanyName != null) {
            CompanysName = item.CompanyName
        } else {
            CompanysName = "----"
        } if (item.CompanyTitle != null) {
            CompanyTitless = item.CompanyTitle
        } else {
            CompanyTitless = "----"
        } if (item.party_people != null) {
            PartysPeople = item.party_people
        } else {
            PartysPeople = "----"
        } if (item.tier != null) {
            Tiers = item.tier
        } else {
            Tiers = "----"
        } if (item.status != null) {
            Statuss = item.status === 1 ? "Active" : "Inactive"
        } else {
            Statuss = "----"
        } if (item.InternalNotes != null) {
            InternalNotess = item.InternalNotes
        } else {
            InternalNotess = "----"
        } if (item.offer_ticket_packages != null) {
            TermsConditions = item.offer_ticket_packages
        } else {
            TermsConditions = "----"
        } if (item.favourite_music != null) {
            KindofMusics = item.favourite_music
        } else {
            KindofMusics = "----"
        } if (item.sustainable_planet != null) {
            YourSuggestions = item.sustainable_planet
        } else {
            YourSuggestions = "----"
        } if (item.advocate_for_harmony != null) {
            MyWellnessRoutines = item.advocate_for_harmony
        } else {
            MyWellnessRoutines = "----"
        } if (item.core_values != null) {
            MyCoreValuess = item.core_values
        } else {
            MyCoreValuess = "----"
        } if (item.are_you_member != null) {
            Communitiesareyoumemberins = item.are_you_member
        } else {
            Communitiesareyoumemberins = "----"
        } if (item.social_media_platform != null) {
            SocialMediaAccounts = item.social_media_platform
        } else {
            SocialMediaAccounts = "----"
        } if (item.not_attendedfestival != null) {
            OndalindaRefernces = item.not_attendedfestival
        } else {
            OndalindaRefernces = "----"
        } if (item.instagram_handle != null) {
            SocialMediaHandles = item.instagram_handle
        } else {
            SocialMediaHandles = "----"
        } if (item.most_interested_festival != null) {
            InterestedIn = item.most_interested_festival
        } else {
            InterestedIn = "----"
        } if (item.appreciate_your_honesty != null) {
            MyRemark = item.appreciate_your_honesty
        } else {
            MyRemark = "----"
        } if (item.attended_festival_before != null) {
            PastOndalindaEventsAttended = item.attended_festival_before
        } else {
            PastOndalindaEventsAttended = "----"
        } if (item.facebook_profile_link != null) {
            FacebookUrl = item.facebook_profile_link
        } else {
            FacebookUrl = "----"
        } if (item.InstagramURL != null) {
            InstagramUrl = item.InstagramURL
        } else {
            InstagramUrl = "----"
        } if (item.LinkedInURL != null) {
            LinkedinUrl = item.LinkedInURL
        } else {
            LinkedinUrl = "----"
        } if (item.link_tree_link != null) {
            LinkTree = item.link_tree_link
        } else {
            LinkTree = "----"
        }
        return {
            id: item.id + 1,
            FirstNamee: Firstname,
            LastNamee: Lastname,
            userEmail: email,
            userMobile: UserPhone,
            MembershipLevels: MemberShipLevel,
            FoundingMember: Foundingmember,
            CareyesOwner: Careyesowner,
            Comped: Compeds,
            FilippoReferral: FilippoReferrals,
            ArtistTypes: ArtistTypess,
            commentss: Comment,
            Dobss: moment(Dobs).format("DD-MM-YYYY"),
            // moment(item.pkg_expiredate).format("DD-MM-YYYY")
            Gender: Genders,
            PlaceofBirth: PlaceBirth,
            CurrentlyLive: CurrentlyLive,
            Companys: CompanysName,
            CompanyTitles: CompanyTitless,
            Partypeoples: PartysPeople,
            Tierss: Tiers,
            Statusss: Statuss,
            InternalNotes: InternalNotess,
            TermsConditions: TermsConditions,
            KindofMusic: KindofMusics,
            YourSuggestion: YourSuggestions,
            MyWellnessRoutine: MyWellnessRoutines,
            MyCoreValues: MyCoreValuess,
            Communitiesareyoumemberin: Communitiesareyoumemberins,
            SocialMediaAccounts: SocialMediaAccounts,
            OndalindaRefernces: OndalindaRefernces,
            SocialMediaHandles: SocialMediaHandles,
            InterestedIn: InterestedIn,
            MyRemark: MyRemark,
            PastOndalindaEventsAttended: PastOndalindaEventsAttended,
            FacebookUrl: FacebookUrl,
            InstagramUrl: InstagramUrl,
            LinkedinUrl: LinkedinUrl,
            LinkTree: LinkTree,
            DateCreateds: moment(item.createdAt).format = ("YYYY-MM-DD  HH:mm:ss"), // Format createdAt date
        };
    });
    //     <Moment format="YYYY-MM-DD HH:mm:ss">
    //     {modalData.createdAt}
    // </Moment>


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

    const HousingAreaoptions = [
        { label: "El Careyes Hotel", value: "housingarea-elcareyeshotel" },
        { label: "Cuixmala", value: "housingarea-cuixmal" },
    ];
    // Housing Options
    const HousingOptions = [
        { value: "1", label: "Renter" },
        { value: "2", label: "House Guest" },
        { value: "4", label: "Home Owner" },
        { value: "3", label: "No Housing Required" }
    ]

    // Statuses options
    const StatusOptions = [
        { value: "0", label: "Interested" },
        { value: "1", label: "Invited" },
        { value: "3", label: "Partially Paid" },
        { value: "4", label: "Over Paid" },
        { value: "2", label: "Completed" }
    ]

    // Interests options
    const InterestedOptions = [
        { value: "Art & Artisans", label: "Art & Artisans" },
        { value: "NFTs", label: "NFTs" },
        { value: "Health & Wellness", label: "Health & Wellness" },
        { value: "Land & Ocean Conservation", label: "Land & Ocean Conservation" },
        { value: "Psychedelics", label: "Psychedelics" },
        { value: "Climate Mitigation & Sustainability", label: "Climate Mitigation & Sustainability" },
        { value: "Web3 & Metaverse", label: "Web3 & Metaverse" },
        { value: "Indigenous Peoples and Culture4", label: "Indigenous Peoples and Culture" },
        { value: "Music & Festivals", label: "Music & Festivals" },
        { value: "Careyes Real Estate", label: "Careyes Real Estate" },
        { value: "Crypto & Blockchain", label: "Crypto & Blockchain" },
    ]


    return (
        <>

            <Seo title={"Invitaions Manager"} />
            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">Manage Invitations</span>
                </div>

                <div className="justify-content-center mt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item className=" tx-15">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active aria-current="page">
                            Invitations
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>

            <div className="left-content mt-2">


                <Row className="row-sm mt-4">
                    <Col xl={2}>
                        <Card>
                            <Card.Header className="">
                                <div className="d-flex justify-content-between">
                                    <h4 className="card-title mg-b-0">Filters</h4>

                                    {/* <Link href="/admin/events" className="btn btn-secondary "><i className="ri-arrow-go-back-fill align-bottom pe-1"></i>Back</Link> */}
                                </div>
                            </Card.Header>
                            <Card.Body className="">

                                <CForm
                                    className="row g-3 needs-validation"
                                    noValidate
                                    // validated={validatedCustom}
                                    onSubmit={SearchMember}
                                >
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">Status</CFormLabel>
                                        <MultiSelect
                                            options={StatusOptions}
                                            value={Status}
                                            onChange={setStatus}
                                            labelledBy="Select"
                                        />
                                        <CFormFeedback invalid>Please provide a valid Name.</CFormFeedback>
                                    </CCol>

                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">Member ID</CFormLabel>
                                        <CFormInput type="number" id="validationCustom03" required
                                            value={ID}
                                            onChange={(e) => {
                                                // console.log(e.target.value);
                                                setID(e.target.value);
                                            }}
                                        />
                                        <CFormFeedback invalid>Please provide a valid Name.</CFormFeedback>
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">First Name</CFormLabel>
                                        <CFormInput type="text"
                                            id="validationCustom03"
                                            required
                                            value={FirstName}
                                            onChange={(e) => {
                                                // console.log(e.target.value);
                                                setFirstName(e.target.value);
                                            }}

                                        />
                                        <CFormFeedback invalid>Please provide a valid Name.</CFormFeedback>
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">Last Name</CFormLabel>
                                        <CFormInput type="text" id="validationCustom03" required
                                            value={LastName}
                                            onChange={(e) => {
                                                // console.log(e.target.value);
                                                setLastName(e.target.value);
                                            }}

                                        />
                                        <CFormFeedback invalid>Please provide a valid Name.</CFormFeedback>
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">Email</CFormLabel>
                                        <CFormInput type="text" id="validationCustom03" required
                                            value={Email}
                                            onChange={(e) => {
                                                const trimmedValue = e.target.value.trim();
                                                // console.log(trimmedValue);
                                                setEmail(trimmedValue);
                                            }}
                                        />
                                        <CFormFeedback invalid>Please provide a valid Name.</CFormFeedback>
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationDefault04">Membership Level</CFormLabel>
                                        <Form.Select aria-label="Default select example"
                                            value={MembershipLevel}
                                            onChange={(e) => {
                                                // console.log(e.target.value);
                                                setMembershipLevel(e.target.value);
                                            }}
                                        >
                                            <option value="">Select Level</option>
                                            <option value="0">Standard</option>
                                            <option value="1">Topaz</option>
                                            <option value="2">Turquoise</option>
                                            <option value="3">Emerald</option>

                                        </Form.Select>
                                        <CFormFeedback invalid>Please provide a valid Country.</CFormFeedback>
                                    </CCol>

                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationDefault04">Careyes Homeowner</CFormLabel>
                                        <Form.Select aria-label="Default select example"
                                            value={CareyesHomeownerFlag}
                                            onChange={(e) => {
                                                // console.log(e.target.value);
                                                setCareyesHomeownerFlag(e.target.value);
                                            }}

                                        >
                                            <option value="">Select</option>
                                            <option value="1">Is Homeowner</option>
                                            <option value="0">Not Homeowner</option>
                                        </Form.Select>
                                        <CFormFeedback invalid>Please provide a valid Country.</CFormFeedback>
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationDefault04">Artist</CFormLabel>
                                        <Form.Select aria-label="Default select example"
                                            value={ArtistType}
                                            onChange={(e) => {
                                                // console.log(e.target.value);
                                                setArtistType(e.target.value);
                                            }}

                                        >
                                            <option value="">Select Artist</option>
                                            <option value="1">Is Artist</option>
                                            <option value="0">Not Artist</option>
                                        </Form.Select>
                                        <CFormFeedback invalid>Please provide a valid Country.</CFormFeedback>
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationDefault04">Past Event attended</CFormLabel>
                                        <Form.Select aria-label="Default select example"
                                            value={attended_festival_before}
                                            onChange={(e) => {
                                                // console.log(e.target.value);
                                                setAttended_festival_before(e.target.value);
                                            }}
                                        >
                                            <option value="">Select</option>
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </Form.Select>
                                        <CFormFeedback invalid>Please provide a valid Country.</CFormFeedback>
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationDefault04"> Interests</CFormLabel>
                                        <MultiSelect
                                            options={InterestedOptions}
                                            value={Interests}
                                            onChange={setInterests}
                                            labelledBy="Select"
                                        />

                                        <CFormFeedback invalid>Please provide a valid Country.</CFormFeedback>
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">Housing Option</CFormLabel>
                                        <MultiSelect
                                            options={HousingOptions}
                                            value={HousingOption}
                                            onChange={setHousingOption}
                                            labelledBy="Select"
                                        />
                                        <CFormFeedback invalid>Please provide a valid Name.</CFormFeedback>
                                    </CCol>
                                    <CCol md={12}>
                                        <CFormLabel htmlFor="validationCustom03">Housing Area </CFormLabel>

                                        <MultiSelect
                                            options={HousingAreaoptions}
                                            value={selected}
                                            onChange={setSelected}
                                            labelledBy="Select"
                                        />
                                        <CFormFeedback invalid>Please provide a valid Name.</CFormFeedback>
                                    </CCol>



                                    <CCol md={13} className="d-flex justify-content-between mt-2">
                                        <CButton color="primary" type="submit">
                                            Submit
                                        </CButton>
                                    </CCol>
                                </CForm>
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
                            <Card.Header className="">
                                <div className="d-flex justify-content-between align-items-center">

                                    <Button variant="" className="btn btn-info" type="submit" disabled={spinner} onClick={InviteEvent}>
                                        {spinner ? (
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        ) : (
                                            '+INVITE'
                                        )}
                                    </Button>

                                    <Button variant="" className="btn btn-info" type="submit" disabled={spinner} onClick={selectAll}>
                                        {spinner ? (
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        ) : (
                                            'Select All'
                                        )}
                                    </Button>

                                    <div className="d-flex align-items-start">
                                        <span className=" py-2 px-3 me-1  bg-success border border-light rounded"></span> <span>Preferences Submitted</span>
                                        <span className="py-2 px-3 me-1 ms-3 bg-warning border border-light rounded"></span> <span>Invited</span>
                                        <span className="py-2 px-3 me-1 ms-3 bg-dark opacity-25 border border-light rounded"></span> <span>Registered</span>
                                    </div>
                                    <h4></h4>
                                    <Link className="btn ripple btn-info btn-sm" href={`/admin/members/?id=${id}`}>Invite Members</Link>
                                </div>
                            </Card.Header>

                            <Card.Body className="">
                                <ToastContainer />

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


                                {/* <table {...getTableProps()} className="table table-hover mb-0" onClick={handleClick}> */}

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
                                                <th>Actions</th>

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
                                                // console.log('rupam singh', row.original.Status);
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
                                                        <td>
                                                            <div className="d-flex align-items-center">

                                                                {id && row.original.Status === 0 && (
                                                                    <button className="btn  btn-sm btn-info" onClick={() => SingleInviteEvent(row)} >
                                                                        +INVITE
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}


                                        </tbody>
                                    )}
                                    {/* <tbody {...getTableBodyProps()}>
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

                       </tbody> */}
                                </table>

                                {isHideShow && (
                                    <div className="text-wrap">
                                        <div className="example">
                                            <Pagination className="mb-0">
                                                <Pagination.Item className="page-item" onClick={() => handlePageChange(1)}>
                                                    First
                                                </Pagination.Item>
                                                <Pagination.Item className="page-item" onClick={() => handlePageChange(pagination.currentPage - 1)}>
                                                    <i className="icon ion-ios-arrow-back"></i>
                                                </Pagination.Item>
                                                {renderPageNumbers(pagination.currentPage, pagination.totalPages)}
                                                <Pagination.Item className="page-item" onClick={() => handlePageChange(pagination.currentPage + 1)}>
                                                    <i className="icon ion-ios-arrow-forward"></i>
                                                </Pagination.Item>
                                                <Pagination.Item className="page-item" onClick={() => handlePageChange(pagination.totalPages)}>
                                                    Last
                                                </Pagination.Item>
                                            </Pagination>
                                        </div>
                                    </div>)}



                                {/* <div className="d-flex">
                                    <select
                                        className=" mb-4 selectpage border me-1"
                                        value={pageSize}
                                        onChange={((e) => {
                                            setManualPageSize(Number(e.target.value))
                                        })}
                                    >
                                        {[10, 25, 50, 100].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                Show {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}

                                {!isHideShow && (
                                    <div className="d-block d-sm-flex mt-4 ">
                                        <span className="ms-sm-auto">
                                            <span className="">
                                                Page{" "}
                                                <strong>
                                                    {pageIndex + 1} of {pageOptions.length}
                                                </strong>{" "}
                                            </span>
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
                                )}

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
                                        src={`/uploads/profiles/${modalData.ImageURL}`}
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


InvitationsTable.layout = "Contentlayout"
export default InvitationsTable