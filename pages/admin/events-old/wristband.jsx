import React, { useState, useEffect } from "react";
import MultiSelect from "react-multiple-select-dropdown-lite";
import { Breadcrumb, Card, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import Link from "next/link";
import axios from "axios";
import Swal from "sweetalert2";

import { useRouter } from 'next/router';
import {
    CForm,
    CCol,
    CFormLabel,
    CFormInput,
    CButton,
    CFormCheck,
    CFormTextarea,
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";

const WristBand = () => {
    //DefaultValidation
    const [validatedCustom, setValidatedCustom] = useState(false);
    const [clasp_Colors, setClasp_Colors] = useState([]);
    // const [memberShip_Color, setMemberShip_Color] = useState([]);
    const [Name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { id } = router.query;
    console.log("id", id)



    const [membershipTypes, setMembershipTypes] = useState([
        { id: 1, type: 'Paying', color: '' },
        { id: 2, type: 'Non Paying', color: '' },
        { id: 3, type: 'All Access', color: '' },
        { id: 4, type: 'Staff', color: '' },
    ]);
    // view wristband color
    const fetchedColors = async () => {
        const SEARCH_API = `/api/v1/wristband?event_id=${id}`;
        try {
            const response = await axios.get(SEARCH_API);
            if (response.data.data) {
                const extractedColorss = response.data.data.clasp_colors.map(item => item.color);
                setClasp_Colors(extractedColorss[0])
                const updatedMembershipTypes = membershipTypes.map((membership) => {
                    const colorObj = response.data.data.membership_type_color.find(color => color.type === String(membership.id));
                    return colorObj ? { ...membership, color: colorObj.color } : membership;
                });
                setMembershipTypes(updatedMembershipTypes);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };


    useEffect(() => {
        if (id != undefined) {
            fetchedColors();
        } else {
            console.log("hy")
        }

    }, [id]);



    const handleColorChange = (index, color) => {
        const updatedMembershipTypes = [...membershipTypes];
        updatedMembershipTypes[index].color = color;
        setMembershipTypes(updatedMembershipTypes);
    };

    const ticketOptions = [
        { value: 'VIP EXPERIENCE PACKAGE', label: 'VIP EXPERIENCE PACKAGE' },
        // { value: 'VIP', label: 'VIP' },
        // { value: 'Backstage', label: 'Backstage' },
    ];

    const addonOptions = [
        { value: 'Illyrian Voyage | Karaka Boat', label: 'Illyrian Voyage | Karaka Boat' },
        // { value: 'Meal', label: 'Meal' },
        // { value: 'Merchandise', label: 'Merchandise' },
    ];

    const [combinations, setCombinations] = useState([
        { id: 1, ticketType: [], addons: [], color: '' },
    ]);

    const handleCombinationChange = (id, field, value) => {
        const updatedCombinations = combinations.map((combination) =>
            combination.id === id ? { ...combination, [field]: value } : combination
        );
        setCombinations(updatedCombinations);
    };

    const addCombination = () => {
        const newId = combinations.length > 0 ? combinations[combinations.length - 1].id + 1 : 1;
        setCombinations([...combinations, { id: newId, ticketType: [], addons: [], color: '' }]);
    };

    const deleteCombination = (id) => {
        const updatedCombinations = combinations.filter(combination => combination.id !== id);
        setCombinations(updatedCombinations);
    };

    const EventsAdd = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            setIsLoading(true);
            const wristbandAddUrl = '/api/v1/wristband';
            event.preventDefault();
            const body = {
                event_id: "108",
                membership_type_color: membershipTypes,
                clasp_colors: combinations
            }
            await axios.post(wristbandAddUrl, body)
                .then((res) => {
                    if (res.data.success) {
                        setIsLoading(false);
                        const msg = res.data.message;
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: msg,
                        });
                    } else {
                        setIsLoading(false);
                        const msg = res.data.message;
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops!',
                            text: msg,
                        });
                    }

                }).catch((err) => {
                    console.log("message", err)
                    setIsLoading(false);
                    // const message = err.response.data.message
                    // setError(message);
                });
        }
        setValidatedCustom(true);
    }

    //    reload the page click the back button
    const handleClick = () => {
        router.push('/admin/events/wristband/');
    };







    return (
        <div>
            <Seo title={"Wristband Manager"} />

            {/* <!-- breadcrumb --> */}
            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">
                        Color Settings
                    </span>

                </div>
                <div className="justify-content-center mt-2">
                    <Breadcrumb className="breadcrumb">
                        <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
                            Dashboard
                        </Breadcrumb.Item>
                        <Breadcrumb.Item
                            className="breadcrumb-item "
                            active
                            aria-current="page"
                        >
                            Events
                        </Breadcrumb.Item>
                        <Breadcrumb.Item
                            className="breadcrumb-item "
                            active
                            aria-current="page"
                        >
                            add
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>
            {/* <!-- /breadcrumb --> */}

            {/* <!--Row--> */}
            <div className="row">

                <Col lg={12} md={12}>
                    <Card>
                        <Card.Header>
                            <h3 className="card-title">Wristband Color Settings</h3>
                        </Card.Header>
                        <Card.Body>

                            <CForm
                                className="row g-3 needs-validation"
                                noValidate
                                validated={validatedCustom}
                                onSubmit={EventsAdd}
                            >

                                {/* Membership Type Color */}
                                <CCol md={12}>
                                    <h4 style={{ borderBottom: "2px solid black", paddingBottom: "5px" }}>Membership Type Color</h4>
                                    <Row>
                                        {membershipTypes.map((membership, index) => (
                                            <CCol md={12} key={index} className="mb-3">
                                                <div className="d-flex align-items-center">
                                                    <CCol md={4}>
                                                        <CFormLabel>{index === 0 ? membership.type + ' + Founding + Comp' : membership.type}</CFormLabel>
                                                    </CCol>
                                                    <CCol md={3}>
                                                        <input
                                                            type="color"
                                                            value={membership.color}
                                                            onChange={(e) => handleColorChange(index, e.target.value)}
                                                            className="form-control form-control-color"
                                                        />
                                                    </CCol>
                                                </div>
                                            </CCol>
                                        ))}
                                    </Row>
                                </CCol>

                                {/* Clasp Color */}
                                <CCol md={12}>
                                    <h4 style={{ borderBottom: "2px solid black", paddingBottom: "5px" }}>Clasp Color</h4>
                                    {/* Clasp color new functionality */}
                                    {combinations.map((combination) => (
                                        <Row key={combination.id} className="mb-3">
                                            <CCol md={2}>
                                                <CFormLabel>Clasp Color</CFormLabel>
                                                <input
                                                    type="color"
                                                    value={combination.color || clasp_Colors}
                                                    // value={combination.color}
                                                    onChange={(e) => handleCombinationChange(combination.id, 'color', e.target.value)}
                                                    className="form-control form-control-color"
                                                />
                                            </CCol>
                                        </Row>
                                    ))}

                                    {/* clasp Color Old Functionality */}
                                    {/* {combinations.map((combination) => (
                                        <Row key={combination.id} className="mb-3">
                                            <CCol md={4}>
                                                <CFormLabel>Ticket Type</CFormLabel>
                                                <MultiSelect
                                                    options={ticketOptions}
                                                    value={combination.ticketType}
                                                    onChange={(selected) => handleCombinationChange(combination.id, 'ticketType', selected)}
                                                    labelledBy="Select Ticket Types"
                                                />
                                            </CCol>
                                            <CCol md={4}>
                                                <CFormLabel>Addons</CFormLabel>
                                                <MultiSelect
                                                    options={addonOptions}
                                                    value={combination.addons}
                                                    onChange={(selected) => handleCombinationChange(combination.id, 'addons', selected)}
                                                    labelledBy="Select Addons"
                                                />
                                            </CCol>
                                            <CCol md={2}>
                                                <CFormLabel>Color</CFormLabel>
                                                <input
                                                    type="color"
                                                    value={combination.color}
                                                    onChange={(e) => handleCombinationChange(combination.id, 'color', e.target.value)}
                                                    className="form-control form-control-color"
                                                />
                                            </CCol>
                                            <CCol md={2} className="d-flex align-items-center mt-4">
                                                {combinations.length > 1 && (
                                                    <CButton color="danger" onClick={() => deleteCombination(combination.id)}>X</CButton>
                                                )}
                                                <CButton color="success" onClick={addCombination}>+</CButton>
                                            </CCol>
                                        </Row>
                                    ))} */}
                                </CCol>

                                <CCol md={12} className="d-flex ">
                                    <Link href="/admin/events/wristband/">
                                        <CButton color="primary me-4" >
                                            Back
                                        </CButton>
                                    </Link>
                                    {/* <CButton color="primary" type="submit">
                                        Submit
                                    </CButton> */}
                                    <CCol md={2}>

                                        <CButton variant="primary" className="btn btn-primary btn-block" type="submit"
                                            // disabled={isLoading}
                                            disabled={isLoading || clasp_Colors.length > 1}

                                        >
                                            {isLoading ? (
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                            ) : (
                                                'Submit'
                                            )}
                                        </CButton>
                                    </CCol>
                                </CCol>

                            </CForm>

                        </Card.Body>
                    </Card>
                </Col>
            </div>
            {/* <!--/Row--> */}
        </div>
    );
}

WristBand.propTypes = {};

WristBand.defaultProps = {};

WristBand.layout = "Contentlayout"

export default WristBand;
