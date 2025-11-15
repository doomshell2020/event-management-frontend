import React, { useState, useEffect, useRef } from "react";
import MultiSelect from "react-multiple-select-dropdown-lite";
import { Breadcrumb, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { optiondefault } from "../../../shared/data/form/form-validation";
import {
  DateAndTimePickers,
  Datepicker,
} from "../../../shared/data/form/form-elements";
import DatePicker from "react-datepicker";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
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
  CFormTextarea,
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import SummernoteLite from "react-summernote-lite";
import "react-summernote-lite/dist/summernote-lite.min.css";

const EventAdd = () => {
  //DefaultValidation
  const [Default, setDefault] = useState("");
  const [Name, setName] = useState("");
  const [Venue, setVenue] = useState("");
  const [Address, setAddress] = useState("");
  const [City, setCity] = useState("");
  const [State, setState] = useState("");
  const [Country, setCountry] = useState("");
  const [PostalCode, setPostalCode] = useState("");
  const [ImageURL, setImageURL] = useState(null);
  const [Price, setPrice] = useState("");
  const [Summary, setSummary] = useState("");
  const [ListPrice, setListPrice] = useState("");
  const [StartDate, setStartDate] = useState("");
  const [EndDate, setEndDate] = useState("");
  const [eventType, setEventType] = useState("1");
  const [validatedCustom, setValidatedCustom] = useState(false);
  // const [startDate, setStartDate] = useState(new Date());
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [isClient, setIsClient] = useState(false);
  const noteRef = useRef();

  const [error, setError] = useState("");
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only PNG, JPG, and JPEG files are allowed.");
        setImageURL(null);
        return;
      }
      setError("");
      setImageURL(file);
    }
  };

  useEffect(() => {
    // Fetch currencies on page load
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get("/api/v1/events/?key=getCurrency");
        if (response.data && response.data.success) {
          setCurrencies(response.data.data); // Adjust the key based on API response structure
        } else {
          console.error("Failed to fetch currencies:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    };
    setIsClient(true);
    fetchCurrencies();
  }, []);

  // Route Change
  let navigate = useRouter();
  const routeChange = () => {
    let path = `/admin/events`;
    navigate.push(path);
  };

  const EventsAdd = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      const EventsAddUrl = "/api/v1/events/";
      event.preventDefault();
      const body = new FormData();
      body.append("Name", Name);
      body.append("ImageURL", ImageURL);
      body.append("Venue", Venue);
      body.append("PaymentCurrency", selectedCurrency);
      body.append("Address", Address);
      body.append("City", City);
      body.append("State", State);
      body.append("Country", Country);
      body.append("PostalCode", PostalCode);
      body.append("StartDate", StartDate);
      body.append("EndDate", EndDate);
      // body.append("EventType", eventType);
      const textContent = noteRef.current.summernote("code");
      body.append("Summary", textContent.trim());

      await axios
        .post(EventsAddUrl, body)
        .then((res) => {
          const msg = res.data.message;
          localStorage.setItem("staticAdded", msg);
          routeChange();
        })
        .catch((err) => {
          console.log("message", err);
          // const message = err.response.data.message
          // setError(message);
        });
    }
    setValidatedCustom(true);
  };

  const handleStartDate = (e) => {
    const selectedDate = e.target.value; // This will be a string in the format "YYYY-MM-DDTHH:MM"
    setStartDate(selectedDate);
  };

  const handleEndDate = (e) => {
    const selectedEndDate = e.target.value; // This will be a string in the format "YYYY-MM-DDTHH:MM"
    setEndDate(selectedEndDate);
  };

  const handleImageUpload = (files) => {
    const fileList = Array.from(files);
    fileList.forEach(async (file) => {
      await uploadImageToServer(file);
    });
  };

  const uploadImageToServer = async (file) => {
    try {
      setIsLoading(true);
      const body = new FormData();
      const apiurl = `/api/v1/cms/`;
      body.append("image", file);
      const response = await axios.post(apiurl, body);
      const imageUrl = `/uploads/profiles/${response.data}`;
      noteRef.current.summernote("insertImage", imageUrl);
    } catch (err) {
      const message = err.response ? err.response.data.message : "";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Seo title={"Add Events"} />

      {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Event Manager
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
              <h3 className="card-title">Add Event</h3>
            </Card.Header>
            <Card.Body>
              <CForm
                className="row g-3 needs-validation"
                noValidate
                validated={validatedCustom}
                onSubmit={EventsAdd}
              >
                <CCol md={4}>
                  <CFormLabel htmlFor="validationDefault01">
                    Name<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationDefault01"
                    placeholder="Name"
                    required
                    value={Name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="validationDefault02">Venue </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationDefault02"
                    placeholder="Venue"
                    value={Venue}
                    onChange={(e) => {
                      setVenue(e.target.value);
                    }}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="validationDefault01">
                    Event Type<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <select
                    name="id"
                    className="form-control"
                    required
                    value={eventType}
                    onChange={(e) => {
                      setEventType(e.target.value);
                    }}
                  >
                    <option value="">-Select-</option>
                    <option value="1">Without Housing</option>
                    <option value="2">With Housing</option>
                  </select>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="currencyDropdown">
                    Currency<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <select
                    id="currencyDropdown"
                    className="form-control"
                    required
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    <option value="">-Select-</option>
                    {currencies &&
                      currencies.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.Currency_symbol} - {currency.Currency}
                        </option>
                      ))}
                  </select>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="validationDefault02">
                    Start Date Time<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <InputGroup className="input-group reactdate-pic">
                    <InputGroup.Text className="input-group-text">
                      <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                    </InputGroup.Text>
                    <CFormInput
                      id="validationDefault02"
                      type="datetime-local"
                      required
                      value={StartDate}
                      min={new Date().toISOString().slice(0, 16)} // Set the minimum to the current datetime
                      onChange={handleStartDate}
                    />
                  </InputGroup>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="validationDefault03">
                    End Date Time<span style={{ color: "Red" }}>*</span>
                  </CFormLabel>
                  <InputGroup className="input-group reactdate-pic">
                    <InputGroup.Text className="input-group-text">
                      <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                    </InputGroup.Text>
                    <CFormInput
                      id="validationDefault03"
                      type="datetime-local"
                      required
                      value={EndDate}
                      min={StartDate || new Date().toISOString().slice(0, 16)} // Ensure End Date cannot be earlier than Start Date
                      onChange={handleEndDate}
                    />
                  </InputGroup>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="validationDefault02">
                    Address{" "}
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationDefault02"
                    placeholder="Address"
                    value={Address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                    }}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="validationDefault05">City</CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationDefault05"
                    placeholder="City"
                    value={City}
                    onChange={(e) => {
                      setCity(e.target.value);
                    }}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="validationDefault01">
                    State/Province
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationDefault01"
                    placeholder="State/Province"
                    value={State}
                    onChange={(e) => {
                      setState(e.target.value);
                    }}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="validationDefault01">
                    Postal Code
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="validationDefault01"
                    placeholder="Postal Code"
                    value={PostalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value);
                    }}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="validationDefault04">Country</CFormLabel>
                  {/* <Form.Select aria-label="Default select example" */}
                  <select
                    name="id"
                    className="form-control"
                    value={Country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                    }}
                  >
                    <option value="">Select Country</option>
                    <option value="Afghanistan">Afghanistan</option>
                    <option value="Albania">Albania</option>
                    <option value="Algeria">Algeria</option>
                    <option value="Andorra">Andorra</option>
                    <option value="Angola">Angola</option>
                    <option value="Antigua and Barbuda">
                      Antigua and Barbuda
                    </option>
                    <option value="Argentina">Argentina</option>
                    <option value="Armenia">Armenia</option>
                    <option value="Australia">Australia</option>
                    <option value="Austria">Austria</option>
                    <option value="Azerbaijan">Azerbaijan</option>
                    <option value="Bahamas">Bahamas</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Barbados">Barbados</option>
                    <option value="Belarus">Belarus</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Belize">Belize</option>
                    <option value="Benin">Benin</option>
                    <option value="Bhutan">Bhutan</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Bosnia and Herzegovina">
                      Bosnia and Herzegovina
                    </option>
                    <option value="Botswana">Botswana</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Brunei">Brunei</option>
                    <option value="Bulgaria">Bulgaria</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Burundi">Burundi</option>
                    <option value="Côte dIvoire">Côte dIvoire</option>
                    <option value="Cabo Verde">Cabo Verde</option>
                    <option value="Cambodia">Cambodia</option>
                    <option value="Cameroon">Cameroon</option>
                    <option value="Canada">Canada</option>
                    <option value="Central African Republic">
                      Central African Republic
                    </option>
                    <option value="Chad">Chad</option>
                    <option value="Chile">Chile</option>
                    <option value="China">China</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Comoros">Comoros</option>
                    <option value="Congo">Congo</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Croatia">Croatia</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Cyprus">Cyprus</option>
                    <option value="Czech Republic">Czech Republic</option>
                    <option value="Democratic Republic of the Congo">
                      Democratic Republic of the Congo
                    </option>
                    <option value="Denmark">Denmark</option>
                    <option value="Djibouti">Djibouti</option>
                    <option value="Dominica">Dominica</option>
                    <option value="Dominican Republic">
                      Dominican Republic
                    </option>
                    <option value="East Timor">East Timor</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Egypt">Egypt</option>
                    <option value="El Salvador">El Salvador</option>
                    <option value="Equatorial Guinea">Equatorial Guinea</option>
                    <option value="Eritrea">Eritrea</option>
                    <option value="Estonia">Estonia</option>
                    <option value="Eswatini">Eswatini</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Fiji">Fiji</option>
                    <option value="Finland">Finland</option>
                    <option value="France">France</option>
                    <option value="Gabon">Gabon</option>
                    <option value="Gambia">Gambia</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Germany">Germany</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Greece">Greece</option>
                    <option value="Grenada">Grenada</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Guinea">Guinea</option>
                    <option value="Guinea-Bissau">Guinea-Bissau</option>
                    <option value="Guyana">Guyana</option>
                    <option value="Haiti">Haiti</option>
                    <option value="Honduras">Honduras</option>
                    <option value="Hungary">Hungary</option>
                    <option value="Iceland">Iceland</option>
                    <option value="India">India</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Iran">Iran</option>
                    <option value="Iraq">Iraq</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Israel">Israel</option>
                    <option value="Italy">Italy</option>
                    <option value="Jamaica">Jamaica</option>
                    <option value="Japan">Japan</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Kazakhstan">Kazakhstan</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Kiribati">Kiribati</option>
                    <option value="Korea, North">Korea, North</option>
                    <option value="Korea, South">Korea, South</option>
                    <option value="Kosovo">Kosovo</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Kyrgyzstan">Kyrgyzstan</option>
                    <option value="Laos">Laos</option>
                    <option value="Latvia">Latvia</option>
                    <option value="Lebanon">Lebanon</option>
                    <option value="Lesotho">Lesotho</option>
                    <option value="Liberia">Liberia</option>
                    <option value="Libya">Libya</option>
                    <option value="Liechtenstein">Liechtenstein</option>
                    <option value="Lithuania">Lithuania</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Madagascar">Madagascar</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Mali">Mali</option>
                    <option value="Malta">Malta</option>
                    <option value="Marshall Islands">Marshall Islands</option>
                    <option value="Mauritania">Mauritania</option>
                    <option value="Mauritius">Mauritius</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Micronesia">Micronesia</option>
                    <option value="Moldova">Moldova</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Mongolia">Mongolia</option>
                    <option value="Montenegro">Montenegro</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="Myanmar">Myanmar</option>
                    <option value="Namibia">Namibia</option>
                    <option value="Nauru">Nauru</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Niger">Niger</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="North Macedonia">North Macedonia</option>
                    <option value="Norway">Norway</option>
                    <option value="Oman">Oman</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Palau">Palau</option>
                    <option value="Palestine">Palestine</option>
                    <option value="Panama">Panama</option>
                    <option value="Papua New Guinea">Papua New Guinea</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Peru">Peru</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Poland">Poland</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Romania">Romania</option>
                    <option value="Russia">Russia</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Saint Kitts and Nevis">
                      Saint Kitts and Nevis
                    </option>
                    <option value="Saint Lucia">Saint Lucia</option>
                    <option value="Saint Vincent and the Grenadines">
                      Saint Vincent and the Grenadines
                    </option>
                    <option value="Samoa">Samoa</option>
                    <option value="San Marino">San Marino</option>
                    <option value="Sao Tome and Principe">
                      Sao Tome and Principe
                    </option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Serbia">Serbia</option>
                    <option value="Seychelles">Seychelles</option>
                    <option value="Sierra Leone">Sierra Leone</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Slovakia">Slovakia</option>
                    <option value="Slovenia">Slovenia</option>
                    <option value="Solomon Islands">Solomon Islands</option>
                    <option value="Somalia">Somalia</option>
                    <option value="South Africa">South Africa</option>
                    <option value="South Korea">South Korea</option>
                    <option value="South Sudan">South Sudan</option>
                    <option value="Spain">Spain</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Sudan">Sudan</option>
                    <option value="Suriname">Suriname</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Syria">Syria</option>
                    <option value="Taiwan">Taiwan</option>
                    <option value="Tajikistan">Tajikistan</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Timor-Leste">Timor-Leste</option>
                    <option value="Togo">Togo</option>
                    <option value="Tonga">Tonga</option>
                    <option value="Trinidad and Tobago">
                      Trinidad and Tobago
                    </option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Turkmenistan">Turkmenistan</option>
                    <option value="Tuvalu">Tuvalu</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="United Arab Emirates">
                      United Arab Emirates
                    </option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Uzbekistan">Uzbekistan</option>
                    <option value="Vanuatu">Vanuatu</option>
                    <option value="Vatican City">Vatican City</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Yemen">Yemen</option>
                    <option value="Zambia">Zambia</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                  </select>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="eventImageInput">Event Image</CFormLabel>
                  <CFormInput
                    type="file"
                    id="eventImageInput"
                    required={true}
                    accept=".png, .jpg, .jpeg" // Restrict file types
                    onChange={handleFileChange}
                  />
                  {error && <p style={{ color: "red" }}>{error}</p>}
                </CCol>
                {/* <CCol md={12}>
                  <CFormLabel htmlFor="validationDefault01">Summary</CFormLabel>
                  <CFormTextarea
                    type="text"
                    id="validationDefault01"
                    value={Summary}
                    onChange={(e) => {
                      setSummary(e.target.value);
                    }}
                  />
                </CCol> */}

                <CCol md={12}>
                  <b>HTML Contents</b>
                  <span style={{ color: "Red" }}>*</span>
                  <br />
                  {isClient ? (
                    <div>
                      <SummernoteLite
                        ref={noteRef}
                        placeholder={"Write something here..."}
                        tabsize={2}
                        lang="zh-CN" // only if you want to change the default language
                        height={400 || "30vh"}
                        dialogsInBody={true}
                        blockquoteBreakingLevel={0}
                        toolbar={[
                          ["style", ["style"]],
                          [
                            "font",
                            [
                              "bold",
                              "underline",
                              "clear",
                              "strikethrough",
                              "superscript",
                              "subscript",
                            ],
                          ],
                          ["fontsize", ["fontsize"]],
                          ["fontname", ["fontname"]],
                          ["color", ["color"]],
                          ["para", ["ul", "ol", "paragraph"]],
                          ["table", ["table"]],
                          ["insert", ["link", "picture", "video", "hr"]],
                          ["view", ["fullscreen", "codeview", "help"]],
                        ]}
                        fontNames={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontNamesIgnoreCheck={[
                          "Arial",
                          "Georgia",
                          "Verdana",
                          "Didot-Ragular", // Include Didot-Regular font
                          "Didot-Italic",
                          "Satoshi",
                          "Satoshi-Bold",
                          "Satoshi-Italic",
                          "Satoshi-Light",
                          // Add other similar font names if necessary
                        ]}
                        fontSizes={[
                          "8",
                          "9",
                          "10",
                          "11",
                          "12",
                          "14",
                          "16",
                          "18",
                          "20",
                          "22",
                          "24",
                          "28",
                          "32",
                          "36",
                          "40",
                          "44",
                          "48",
                          "54",
                          "60",
                          "66",
                          "72",
                          "78",
                          "80",
                          "82",
                          "84",
                          "86",
                          "92",
                          "98",
                          "100",
                          "102",
                          "106",
                          "108",
                          "110",
                          "116",
                          "120",
                        ]}
                        onChange={(content) => setData({ ...data, content })}
                        callbacks={{
                          onImageUpload: handleImageUpload,
                        }}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </CCol>

                <CCol md={12} className="d-flex justify-content-end">
                  <Link href="/admin/events">
                    <CButton color="warning me-4">Back</CButton>
                  </Link>
                  <CButton color="primary" type="submit">
                    Submit
                  </CButton>
                </CCol>
              </CForm>
            </Card.Body>
          </Card>
        </Col>
      </div>
      {/* <!--/Row--> */}
    </div>
  );
};

EventAdd.propTypes = {};

EventAdd.defaultProps = {};

EventAdd.layout = "Contentlayout";

export default EventAdd;
