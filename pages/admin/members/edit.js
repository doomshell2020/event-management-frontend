import React, { useState, useEffect } from "react";
import MultiSelect from "react-multiple-select-dropdown-lite";
import { Breadcrumb, Card, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { optiondefault } from "../../../shared/data/form/form-validation"
import Swal from 'sweetalert2';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Link from "next/link";
import { useRouter } from 'next/router';
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
    CFormTextarea,
} from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";

const MemberEdit = () => {
    //DefaultValidation
    const router = useRouter();
    const { id } = router.query;

    const [memberdata, setMemberdata] = useState('')
    const [Default, setDefault] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [FirstName, setFirstName] = useState("");
    const [LastName, setLastName] = useState("");
    const [Email, setEmail] = useState("");
    const [Country, setCountry] = useState("");
    const [PhoneNumber, setPhoneNumber] = useState("");
    const [PhoneCountry, setPhoneCountry] = useState("");
    const [CompanyName, setCompanyName] = useState("");
    const [CompanyTitle, setCompanyTitle] = useState("");
    const [Gender, setGender] = useState("");
    const [dob, setDob] = useState(null);
    const [city_country_birth, setCity_country_birth] = useState("");
    const [city_country_live, setCity_country_live] = useState("");
    const [linkdin_profile_link, setLinkdin_profile_link] = useState("");
    const [instagram_handle, setInstagram_handle] = useState("");
    const [facebook_profile_link, setFacebook_profile_link] = useState("");
    const [link_tree_link, setLink_tree_link] = useState("");
    const [core_values, setCore_values] = useState("");
    const [not_attendedfestival, setNot_attendedfestival] = useState("");
    const [favourite_music, setFavourite_music] = useState("");
    const [appreciate_your_honesty, setAppreciate_your_honesty] = useState("");
    const [AddressLine1, setAddressLine1] = useState("");
    const [AddressLine2, setAddressLine2] = useState("");
    const [City, setCity] = useState("");
    const [PostalCode, setPostalCode] = useState("");
    const [AssistantName, setAssistantName] = useState("");
    const [AssistantEmail, setAssistantEmail] = useState("");
    const [AssistantPhoneNumber, setAssistantPhoneNumber] = useState("");
    const [WebsiteURL, setWebsiteURL] = useState("");
    const [InstagramURL, setInstagramURL] = useState("");
    const [TwitterURL, setTwitterURL] = useState("");
    const [LinkedInURL, setLinkedInURL] = useState("");
    const [ClubhouseURL, setClubhouseURL] = useState("");
    const [DiscordURL, setDiscordURL] = useState("");
    const [attended_festival_before, setAttended_festival_before] = useState([]);
    const [most_interested_festival, setMost_interested_festival] = useState([]);
    const [sustainable_planet, setSustainable_planet] = useState([]);
    const [Interest, setInterest] = useState([]);
    const [are_you_member, setAre_you_member] = useState([]);
    const [InternalNotes, setInternalNotes] = useState("");
    const [admin_notes, setAdmin_notes] = useState("");
    const [ArtistType, setArtistType] = useState("");
    const [FilippoReferralFlag, setFilippoReferralFlag] = useState(0);
    const [CompedFlag, setCompedFlag] = useState(0);
    const [CareyesHomeownerFlag, setCareyesHomeownerFlag] = useState("0");
    const [FounderFlag, setFounderFlag] = useState("0");
    const [MembershipLevel, setMembershipLevel] = useState("0");
    const [MembershipTypes, setMembershipTypes] = useState(0);
    const [Status, setStatus] = useState("0");
    const [ImageURL, setImageURL] = useState("");
    const [country_group, setCountry_group] = useState("0");
    const [refference1_first_name, setRefference1_first_name] = useState("");
    const [refference1_last_name, setRefference1_last_name] = useState("");
    const [refference1_email, setRefference1_email] = useState("");
    const [refference2_first_name, setRefference2_first_name] = useState("");
    const [refference2_last_name, setRefference2_last_name] = useState("");
    const [refference2_email, setRefference2_email] = useState("");
    const [mythical_and_mystical, setMythical_and_mystical] = useState("");
    const [userID, setUserId] = useState("");
    const [most_interested_other, setMost_interested_other] = useState("");
    const [are_you_member_other, setAre_you_member_other] = useState("");
    const [attended_festival_before_other, setAttended_festival_before_other] = useState("");
    const [sustainable_planet_other, setSustainable_planet_other] = useState("");

    // courrent date
    const today = new Date();

    const handleOnchangedefault = () => {
        console.log("PhoneCountry", PhoneCountry);
        setPhoneCountry(PhoneCountry);
    };
    const handleDobDate = (e) => {
        const selectedDob = e.target.value; // This will be a string in the format "YYYY-MM-DD

        setDob(selectedDob);
    };
    // View Dtat in forms
    var MemberURL = ""
    useEffect(() => {

        if (id != undefined) {
            var MemberURL = `/api/v1/members?id=${id}`
            fetch(MemberURL)
                .then((response) => response.json())
                .then((value) => {
                    // console.log("data", value.data)
                    setUserId(value.data.id)
                    setFirstName(value.data.FirstName);
                    setLastName(value.data.LastName);
                    setEmail(value.data.Email);
                    setPhoneCountry(value.data.PhoneCountry);
                    setPhoneNumber(value.data.PhoneNumber);
                    setCountry(value.data.Country);
                    setCompanyName(value.data.CompanyName);
                    setCompanyTitle(value.data.CompanyTitle);
                    setGender(value.data.Gender);
                    if (value.data.dob) {
                        setDob(value.data.dob.slice(0, 10));
                    }
                    setCity_country_birth(value.data.city_country_birth);
                    setCity_country_live(value.data.city_country_live);
                    setLinkdin_profile_link(value.data.linkdin_profile_link);
                    setInstagram_handle(value.data.instagram_handle);
                    setFacebook_profile_link(value.data.facebook_profile_link);
                    setLink_tree_link(value.data.link_tree_link);
                    setCore_values(value.data.core_values);
                    setNot_attendedfestival(value.data.not_attendedfestival);
                    setFavourite_music(value.data.favourite_music);
                    setAppreciate_your_honesty(value.data.appreciate_your_honesty);
                    setAddressLine1(value.data.AddressLine1);
                    setAddressLine2(value.data.AddressLine2);
                    setCity(value.data.City);
                    setPostalCode(value.data.PostalCode);
                    setAssistantName(value.data.AssistantName);
                    setAssistantEmail(value.data.AssistantEmail);
                    setAssistantPhoneNumber(value.data.AssistantPhoneNumber);
                    setWebsiteURL(value.data.WebsiteURL);
                    setInstagramURL(value.data.InstagramURL);
                    setTwitterURL(value.data.TwitterURL);
                    setLinkedInURL(value.data.LinkedInURL);
                    setClubhouseURL(value.data.ClubhouseURL);
                    setDiscordURL(value.data.DiscordURL);
                    setCountry_group(value.data.country_group);

                    // Attended festival before old functionality(16-01-2025)
                    // var FestivalAttended = value.data.attended_festival_before;
                    // const Attendedfestival = FestivalAttended ? FestivalAttended.split(",") : ''
                    // setAttended_festival_before(Attendedfestival);
                    //  Attended festival before new functionality(16-01-2025)
                    var FestivalAttended = value.data.attended_festival_ids
                    setAttended_festival_before(FestivalAttended);

                    // Moat intersted festival
                    var Festival = value.data.most_interested_festival;
                    const InterestedFestival = Festival ? Festival.split(",") : ''
                    setMost_interested_festival(InterestedFestival);
                    // setMost_interested_festival(value.data.most_interested_festival);
                    // sustainable_planet 
                    var location_id = value.data.sustainable_planet
                    const loc_ids_array = location_id ? location_id.split(",") : ''
                    setSustainable_planet(loc_ids_array);
                    // console.log("value", loc_ids_array)

                    // setSustainable_planet(value.data.sustainable_planet);
                    //Are you member
                    var AreYouMember = value.data.are_you_member
                    const AreYouMember_array = AreYouMember ? AreYouMember.split(",") : ''
                    setAre_you_member(AreYouMember_array);
                    // setAre_you_member(value.data.are_you_member);
                    // console.log("Userinterests", value.data.Userinterests.map((item) => item.Interest))
                    setInterest(value.data.Userinterests.map((item) => item.Interest))
                    /////////
                    setInternalNotes(value.data.InternalNotes);
                    setAdmin_notes(value.data.admin_notes);
                    setArtistType(value.data.ArtistType);
                    setFilippoReferralFlag(value.data.FilippoReferralFlag ? value.data.FilippoReferralFlag : 0);
                    setCompedFlag(value.data.CompedFlag ? value.data.CompedFlag : 0);
                    setCareyesHomeownerFlag(value.data.CareyesHomeownerFlag ? value.data.CareyesHomeownerFlag : 0);
                    setFounderFlag(value.data.FounderFlag ? value.data.FounderFlag : 0);
                    setMembershipLevel(value.data.MembershipLevel ? value.data.MembershipLevel : 0);
                    setStatus(value.data.Status);
                    setMythical_and_mystical(value.data.mythical_and_mystical);
                    setRefference1_email(value.data.refference1_email);
                    setRefference1_first_name(value.data.refference1_first_name);
                    setRefference1_last_name(value.data.refference1_last_name)
                    setRefference2_email(value.data.refference2_email);
                    setRefference2_first_name(value.data.refference2_first_name);
                    setRefference2_last_name(value.data.refference2_last_name)
                    setMembershipTypes(value.data.MembershipTypes);
                    setState(value.data.States);
                    setMost_interested_other(value.data.most_interested_other);
                    setTimeout(() => {
                        setMemberdata(value.data);
                    }, 3000);
                })
        }

    }, [id])


    // data Update  in staging.eboxtickets.com for third party  
    const updateDataEboxticket = async (formmData) => {
        // console.log("formData", formmData)
        const UPDATE_DATA = 'https://staging.eboxtickets.com/embedapi/updateUserData';
        try {
            const response = await axios.post(UPDATE_DATA, formmData);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // Gender select
    const handleGenderChange = (e) => {
        console.log(e.target.value)
        setGender(e.target.value);
    };


    let navigate = useRouter();
    const routeChange = () => {
        let path = `/admin/members/`;
        navigate.push(path);
    }
    const [validatedCustom, setValidatedCustom] = useState(false);

    // update members
    const UpdateMember = async (event) => {
        setIsLoading(true);
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            setIsLoading(false);
            event.preventDefault();
            event.stopPropagation();
        } else {
            const apiUrl = `/api/v1/members?id=${id}`;
            // const selectedLocationsString = sustainable_planet.join(',');
            // const selectmostintrested = most_interested_festival.join(',');
            // const selectattendedfestivalbefore = attended_festival_before.join(',');
            // const selectare_you_member = are_you_member.join(',');
            // const InterestSelectbox = Interest.join(',')
            const body = new FormData();
            body.append("FirstName", FirstName);
            body.append("LastName", LastName);
            body.append("country_group", country_group);
            body.append("ImageURL", ImageURL);
            body.append("Email", Email);
            body.append("Country", Country);
            body.append("PhoneCountry", PhoneCountry);
            body.append("CompanyName", CompanyName);
            body.append("CompanyTitle", CompanyTitle);
            body.append("Gender", Gender);
            body.append("dob", dob);
            body.append("city_country_birth", city_country_birth);
            body.append("PhoneNumber", PhoneNumber);
            body.append("city_country_live", city_country_live);
            body.append("linkdin_profile_link", linkdin_profile_link);
            body.append("instagram_handle", instagram_handle);
            body.append("facebook_profile_link", facebook_profile_link);
            body.append("link_tree_link", link_tree_link);
            body.append("core_values", core_values);
            body.append("not_attendedfestival", not_attendedfestival);
            body.append("favourite_music", favourite_music);
            body.append("appreciate_your_honesty", appreciate_your_honesty);
            body.append("AddressLine1", AddressLine1);
            body.append("AddressLine2", AddressLine2);
            body.append("City", City);
            body.append("PostalCode", PostalCode);
            body.append("AssistantName", AssistantName);
            body.append("AssistantEmail", AssistantEmail);
            body.append("AssistantPhoneNumber", AssistantPhoneNumber);
            body.append("InstagramURL", InstagramURL);
            body.append("WebsiteURL", WebsiteURL);
            body.append("TwitterURL", TwitterURL);
            body.append("LinkedInURL", LinkedInURL);
            body.append("ClubhouseURL", ClubhouseURL);
            body.append("DiscordURL", DiscordURL);
            body.append("attended_festival_before", attended_festival_before);
            body.append("most_interested_festival", most_interested_festival);
            body.append("sustainable_planet", sustainable_planet);
            body.append("are_you_member", are_you_member);
            body.append("InternalNotes", InternalNotes);
            body.append("ArtistType", ArtistType);
            body.append("FilippoReferralFlag", FilippoReferralFlag);
            body.append("CompedFlag", CompedFlag);
            body.append("CareyesHomeownerFlag", CareyesHomeownerFlag);
            body.append("FounderFlag", FounderFlag);
            body.append("MembershipLevel", MembershipLevel);
            body.append("Status", Status);
            body.append("Interest", Interest);
            body.append("refference1_first_name", refference1_first_name);
            body.append("refference1_last_name", refference1_last_name);
            body.append("refference1_email", refference1_email);
            body.append("refference2_first_name", refference2_first_name);
            body.append("refference2_last_name", refference2_last_name);
            body.append("refference2_email", refference2_email);
            body.append("mythical_and_mystical", mythical_and_mystical);
            body.append("admin_notes", admin_notes);
            body.append("most_interested_other", most_interested_other);
            if (MembershipTypes) {
                body.append("MembershipTypes", MembershipTypes);
            }
            body.append("States", State)

            await axios.put(apiUrl, body)
                .then((res) => {
                    setIsLoading(false);
                    const msg = res.data.Editmember.message;
                    if (res.data.Editmember.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Thank You!',
                            customClass: { popup: "add-tckt-dtlpop" },
                            text: msg
                        }).then((result) => {
                            if (result.isConfirmed) {
                                routeChange();
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            customClass: { popup: "add-tckt-dtlpop" },
                            text: msg
                        });
                    }
                    // localStorage.setItem("staticAdded", msg);
                    // routeChange()
                }).catch((err) => {
                    setIsLoading(false);
                    const message = err.message
                    // console.log("message", message)
                });
        }
        setValidatedCustom(true);
    }


    // sustainable_planet  checkboxs
    const checkboxData = [
        {
            name: "Indigenous Peoples & Cultures",
            key: "indigenousPeoples",
        },
        {
            name: "Ocean Conservation (Fauna & Flora)",
            key: "oceanConservation",
        },
        {
            name: "Land Conservation (Fauna & Flora)",
            key: "landConservation",
        },
        {
            name: "Climate Mitigation and Sustainability",
            key: "climateMitigation",
        },
        {
            name: "Plastic Pollution",
            key: "plasticPollution",
        },
        {
            name: "Other",
            key: "other",
        },
    ];

    const checkboxinterestedData = [
        { name: "Classical Music Events", key: "Classical Music Events" },
        { name: "Rugged luxury travel adventures", key: "Rugged luxury travel adventures" },
        { name: "Networking", key: "Networking" },
        { name: "Talks & speakers & workshops", key: "Talks & speakers & workshops", },
        { name: "Peak performance & bio-hacking", key: "Peak performance & bio-hacking" },
        { name: "Music industry gatherings", key: "Music industry gatherings" },
        { name: "Culture,art exhibition, art fair satellite events", key: "Culture* art exhibition* art fair satellite events" },
        { name: "Ondalinda Real Estate Developments", key: "Ondalinda Real Estate Developments", },
        { name: "Tech industry gatherings", key: "Tech industry gatherings" },
        { name: "Electronic Music Festival", key: "Electronic Music Festival" },
        { name: "Love,partnerships, dating", key: "Love* partnerships* dating" },
        { name: "Indigenous Peoples and Culture,Plant Medicines", key: "Indigenous Peoples and Culture* Plant Medicines" },
        { name: "Film industry gatherings", key: "Film industry gatherings" },
        { name: "Ondalinda Foundation Volunteering or Sponsoring", key: "Ondalinda Foundation Volunteering or Sponsoring" },
        { name: "Fashion,private collections and collaborations", key: "Fashion* private collections and collaborations" },
        { name: "Other", key: "Other" },
    ];

    const AttendedFestivalBefore = [
        { name: "ONDALINDA x CAREYES 2024", key: "ONDALINDA x CAREYES 2024" },
        { name: "ONDALINDA x MONTENEGRO 2024", key: "ONDALINDA x MONTENEGRO 2024" },
        { name: "ONDALINDA x CAREYES 2023", key: "ONDALINDA x CAREYES 2023" },
        { name: "ONDALINDA x CAREYES 2022", key: "ONDALINDA x CAREYES 2022" },
        { name: "ONDALINDA x CAREYES 2021", key: "ONDALINDA x CAREYES 2021" },
        { name: "ONDALINDA x CAREYES 2020", key: "ONDALINDA x CAREYES 2020" },
        { name: "ONDALINDA x CAREYES 2019", key: "ONDALINDA x CAREYES 2019" },
        { name: "ONDALINDA x CAREYES 2018", key: "ONDALINDA x CAREYES 2018" },
        { name: "ONDALINDA x CAREYES 2017", key: "ONDALINDA x CAREYES 2017" },
        { name: "ONDALINDA x CAREYES 2016", key: "ONDALINDA x CAREYES 2016", },
        { name: "ONDALINDA x LA HAVANA, CUBA 2015", key: "ONDALINDA x LA HAVANA* CUBA 2015" },
        { name: "“BRIDGES BETWEEN WORLDS” L.A. FRIEZE EVENT 2019", key: "“BRIDGES BETWEEN WORLDS” L.A. FRIEZE EVENT 2019", },
        { name: "I HAVE NEVER ATTENDED AN ONDALINDA EVENT", key: "I HAVE NEVER ATTENDED AN ONDALINDA EVENT" },
    ];


    const checkboxesFormatted = [
        { name: "Summit", key: "summit" },
        { name: "5 Hartford", key: "hartford" },
        { name: "Sopra", key: "sopra" },
        { name: "YPO", key: "ypo", },
        { name: "Zero Bond", key: "zeroBond" },
        { name: "Maison Estelle", key: "maisonEstelle" },
        { name: "Burning Man", key: "burningMan" },
        { name: "San Vincente Bungalows", key: "sanVincenteBungalows" },
        { name: "Casa Tua", key: "casaTua" },
        { name: "Casa Cipriani", key: "casaCipriani" },
        { name: "St James", key: "stJames" },
        { name: "Faena", key: "faena" },
        { name: "Petit Ermitage", key: "petitErmitage" },
        { name: "The Groucho", key: "theGroucho" },
        { name: "Ninho", key: "ninho" },
        { name: "Nexus", key: "nexus" },
        { name: "Aspen Institute", key: "aspenInstitute" },
        { name: "Casa Cruz", key: "casaCruz" },
        { name: "Arcade", key: "arcade" },
        { name: "Soho House", key: "sohoHouse" },
        { name: "Near Future", key: "nearFuture" },
        { name: "The Battery", key: "battery" },
        { name: "Other", key: "other", },
    ];

    const InterestCheckbox = [
        { name: "Art & Artisans", key: "Art&Artisans" },
        { name: "Health & Wellness", key: "Health&Wellness" },
        { name: "Web3 & Metaverse", key: "Web3&Metaverse" },
        { name: "Careyes Real Estate", key: "CareyesRealEstate" },
        { name: "NFTs", key: "NFTs" },
        { name: "Psychedelics", key: "Psychedelics" },
        { name: "Indigenous Peoples and Culture", key: "IndigenousPeoplesandCulture" },
        { name: "Crypto & Blockchain", key: "Crypto&Blockchain" },
        { name: "Land & Ocean Conservation", key: "Land&OceanConservation" },
        { name: "Climate Mitigation & Sustainability", key: "ClimateMitigation&Sustainability" },
        { name: "Music & Festivals", key: "Music&Festivals", },
    ];

    const handleCheckboxChange = (value) => {
        const isChecked = most_interested_festival.includes(value.key);
        if (isChecked) {
            setMost_interested_festival((prevList) =>
                prevList.filter((item) => item !== value.key)
            );
            // If "Other" checkbox is unchecked, clear the input field
            if (value.key === "Other") {
                setMost_interested_other(""); // Clear the input field
            }
        } else {
            setMost_interested_festival((prevList) => [...prevList, value.key]);
        }
    };

    const handleOtherInputChange = (e) => {
        const value = e.target.value;
        setMost_interested_other(value);

        // Check or uncheck the "Other" checkbox based on input field value
        if (value.trim() !== "") {
            // If input field is filled, check the "Other" checkbox
            setMost_interested_festival((prevList) => {
                if (!prevList.includes("Other")) {
                    return [...prevList, "Other"];
                }
                return prevList;
            });
        } else {
            // If input field is empty, uncheck the "Other" checkbox
            setMost_interested_festival((prevList) =>
                prevList.filter((item) => item !== "Other")
            );
        }
    };






    const [neverAttended, setNeverAttended] = useState(false);
    // old functionality
    // const handleAttendedeventChange = (value) => {
    //     if (value.name === "I HAVE NEVER ATTENDED AN ONDALINDA EVENT") {
    //         setNeverAttended(!neverAttended);
    //         if (!neverAttended) {
    //             setAttended_festival_before([value.name]);
    //         } else {
    //             setAttended_festival_before([]);
    //         }
    //     } else {
    //         if (neverAttended) {
    //             return;
    //         }
    //         const newAttendedFestivalBefore = attended_festival_before.includes(value.key)
    //             ? attended_festival_before.filter(name => name !== value.key)
    //             : [...attended_festival_before, value.key];
    //         setAttended_festival_before(newAttendedFestivalBefore);
    //     }
    // };
    //  New functionality added
    const handleAttendedeventChange = (value) => {
        if (value.id === 0) {
            // Toggle the `neverAttended` state
            const newNeverAttended = !neverAttended;
            setNeverAttended(newNeverAttended);

            if (newNeverAttended) {
                // If `neverAttended` is now true, set `attended_festival_before` to `[-1]`
                setAttended_festival_before([value.id]);
            } else {
                // If `neverAttended` is now false, clear `attended_festival_before`
                setAttended_festival_before([]);
            }
        } else {
            // Handle other checkboxes if `neverAttended` is not active
            if (neverAttended) {
                return; // Do nothing if `neverAttended` is active
            }

            // Toggle the selected event in `attended_festival_before`
            const newAttendedFestivalBefore = attended_festival_before.includes(value.id)
                ? attended_festival_before.filter(id => id !== value.id)
                : [...attended_festival_before, value.id];

            setAttended_festival_before(newAttendedFestivalBefore);
        }
    };









    const [State, setState] = useState("");
    const [states, setStates] = useState([]);
    const [countries, setCountries] = useState([]);
    // Fetch all countries from db
    const fetchAllCountry = async () => {
        const { data } = await axios.get('/api/v1/country');
        if (data.success === true) {
            setCountries(data.data);
        } else {
            console.log('There was an issue');
        }
    };
    // Fetch all states based on selected country_id
    const fetchAllStates = async (country_id) => {
        const { data } = await axios.get(`/api/v1/states?country_id=${country_id}`);
        if (data.success === true) {
            setStates(data.data);
        } else {
            console.log('There was an issue fetching states');
        }
    };

    // Fetch all locations based on selected country_id
    const fetchAllCountryLocation = async (country_id) => {
        try {
            const { data } = await axios.get(`/api/v1/country_location?country_id=${country_id}`);
            if (data.success) {
                // Collect all location IDs in an array and set them at once
                const locationIds = data.data.map((e) => e.location_id);
                setCountry_group(locationIds);
            } else {
                console.log('There was an issue fetching states');
            }
        } catch (error) {
            console.error('Error fetching country locations:', error);
        }
    };


    // All events
    const [events, setEvents] = useState([]);
    const fecthAllEvents = async () => {
        try {
            const body = {
                "key": "viewAllEvents"
            }
            const { data } = await axios.post("/api/v1/front/event/events", body);
            if (data.success) {
                setEvents(data.data);
            } else {
                console.log("There was an issue fetching events");
            }
        } catch (err) {
            console.log("err", err.message)
        }
    }

    useEffect(() => {
        fetchAllCountry();
        fecthAllEvents();
    }, [])

    // UseEffect to make API calls when the component mounts or when the Country state changes
    useEffect(() => {
        const selectedCountry = countries.find(country => country.name === Country);

        if (selectedCountry) {
            fetchAllStates(selectedCountry.id);
            // fetchAllCountryLocation(selectedCountry.id);
        }
    }, [Country, countries]); // This runs when Country or countries changes












    return (
        <div>
            <Seo title={"Edit-Member"} />

            {/* <!-- breadcrumb --> */}
            <div className="breadcrumb-header justify-content-between">
                <div className="left-content">
                    <span className="main-content-title mg-b-0 mg-b-lg-1">
                        Member Manager
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
                            Member
                        </Breadcrumb.Item>
                        <Breadcrumb.Item
                            className="breadcrumb-item "
                            active
                            aria-current="page"
                        >
                            edit
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
                            <h3 className="card-title">Edit Member</h3>
                        </Card.Header>
                        <Card.Body>

                            <CForm
                                className="row g-3 needs-validation"
                                noValidate
                                validated={validatedCustom}
                                onSubmit={UpdateMember}
                            >
                                <CCol md={12}>
                                    <b>System Information</b>   </CCol>

                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationCustom04">Status</CFormLabel>
                                    <select name="id" className="form-control"
                                        value={Status}
                                        onChange={(e) => {
                                            setStatus(e.target.value);
                                        }}
                                    >
                                        <option value="">-Select-</option>
                                        <option value="0">Pending Approval</option>
                                        <option value="1">Active</option>

                                    </select>

                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationCustom04">Membership Level </CFormLabel>
                                    <select name="id" className="form-control"
                                        value={MembershipLevel}
                                        onChange={(e) => {

                                            setMembershipLevel(e.target.value);
                                        }}
                                    >
                                        <option value="">-Select-</option>
                                        <option value="0">Standard</option>
                                        <option value="1">Topaz</option>
                                        <option value="2">Turquoise</option>
                                        <option value="3">Emerald</option>
                                    </select>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationCustom04">Membership Types</CFormLabel>
                                    <select name="id" className="form-control"
                                        value={MembershipTypes}
                                        onChange={(e) => {

                                            setMembershipTypes(e.target.value);
                                        }}
                                    >
                                        <option value="">-Select-</option>
                                        <option value="1">Founding</option>
                                        <option value="2">Paying</option>
                                        <option value="3">Free</option>
                                        <option value="4">Comp</option>
                                        <option value="5">Staff</option>
                                    </select>

                                </CCol>





                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault04">Founding Member</CFormLabel>
                                    <select name="id" className="form-control"
                                        value={FounderFlag}
                                        onChange={(e) => {

                                            setFounderFlag(e.target.value);
                                        }}
                                    >
                                        <option value="">-Select-</option>
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>

                                    </select>

                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault04">Careyes Homeowner</CFormLabel>
                                    <select name="id" className="form-control"
                                        value={CareyesHomeownerFlag}
                                        onChange={(e) => {

                                            setCareyesHomeownerFlag(e.target.value);
                                        }}
                                    >
                                        <option value="">-Select-</option>
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault04">Comp ed</CFormLabel>
                                    <select name="id" className="form-control"
                                        value={CompedFlag}
                                        onChange={(e) => {

                                            setCompedFlag(e.target.value);
                                        }}
                                    >
                                        <option value="">-Select-</option>
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>

                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel htmlFor="validationDefault04">Filippo Referral</CFormLabel>
                                    <select name="id" className="form-control"
                                        value={FilippoReferralFlag}
                                        onChange={(e) => {
                                            setFilippoReferralFlag(e.target.value);
                                        }}
                                    >
                                        <option value="">-Select-</option>
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>



                                </CCol>

                                <CCol md={6}>
                                    <CFormLabel htmlFor="validationDefault02">Artist Type </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault02"
                                        value={ArtistType}
                                        onChange={(e) => {

                                            setArtistType(e.target.value);
                                        }}
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault01">Event Notes</CFormLabel>
                                    <CFormTextarea
                                        type="text"
                                        id="validationDefault01"
                                        value={InternalNotes}
                                        onChange={(e) => {
                                            setInternalNotes(e.target.value);
                                        }}
                                    />
                                </CCol>


                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault001"><strong>Member Notes</strong></CFormLabel>
                                    <CFormTextarea
                                        type="text"
                                        id="validationDefault001"
                                        value={admin_notes}
                                        onChange={(e) => {
                                            setAdmin_notes(e.target.value);
                                        }}
                                    />
                                </CCol>

                                <CCol md={12} className="mt-5">
                                    <b>Basic Information</b></CCol>

                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault02">First Name <span style={{ color: "red" }}>*</span> </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault02"
                                        placeholder="First Name"
                                        required
                                        value={FirstName}
                                        onChange={(e) => {

                                            setFirstName(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault05">Last Name<span style={{ color: "red" }}>*</span></CFormLabel>
                                    <CFormInput type="text" id="validationDefault05"
                                        placeholder="Last Name"
                                        required
                                        value={LastName}
                                        onChange={(e) => {

                                            setLastName(e.target.value);
                                        }}
                                    />
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Email<span style={{ color: "red" }}>*</span></CFormLabel>
                                    <CFormInput
                                        type="email"
                                        id="validationDefault01"
                                        placeholder="Email"
                                        // readOnly
                                        required
                                        value={Email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                        }}
                                    />
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault04">Phone Country</CFormLabel>
                                    <select name="id" className="form-control"
                                        value={PhoneCountry}
                                        onChange={(e) => {

                                            setPhoneCountry(e.target.value);
                                        }}
                                    >
                                        <option value="">--Select Phone Country--</option>
                                        <option value="Afghanistan">Afghanistan</option>
                                        <option value="Albania">Albania</option>
                                        <option value="Algeria">Algeria</option>
                                        <option value="Andorra">Andorra</option>
                                        <option value="Angola">Angola</option>
                                        <option value="Antigua and Barbuda">Antigua and Barbuda</option>
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
                                        <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
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
                                        <option value="Central African Republic">Central African Republic</option>
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
                                        <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                                        <option value="Denmark">Denmark</option>
                                        <option value="Djibouti">Djibouti</option>
                                        <option value="Dominica">Dominica</option>
                                        <option value="Dominican Republic">Dominican Republic</option>
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
                                        <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                                        <option value="Saint Lucia">Saint Lucia</option>
                                        <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                                        <option value="Samoa">Samoa</option>
                                        <option value="San Marino">San Marino</option>
                                        <option value="Sao Tome and Principe">Sao Tome and Principe</option>
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
                                        <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                                        <option value="Tunisia">Tunisia</option>
                                        <option value="Turkey">Turkey</option>
                                        <option value="Turkmenistan">Turkmenistan</option>
                                        <option value="Tuvalu">Tuvalu</option>
                                        <option value="Uganda">Uganda</option>
                                        <option value="Ukraine">Ukraine</option>
                                        <option value="United Arab Emirates">United Arab Emirates</option>
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
                                    <CFormLabel htmlFor="validationDefault01">Phone Number</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        placeholder="Phone Number"
                                        minLength={10}
                                        maxLength={10}
                                        value={PhoneNumber}
                                        onChange={(e) => {

                                            setPhoneNumber(e.target.value);
                                        }}

                                    />
                                    <CFormFeedback invalid>Please provide a minimum length of 10 characters and a maximum length of 10 characters.</CFormFeedback>
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Company Name</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        placeholder="Company Name"
                                        value={CompanyName}
                                        onChange={(e) => {

                                            setCompanyName(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01"> Job Title</CFormLabel>


                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        placeholder="Title"
                                        value={CompanyTitle}
                                        onChange={(e) => {

                                            setCompanyTitle(e.target.value);
                                        }}
                                    />

                                </CCol>

                                <CCol md={6} >
                                    <CFormLabel htmlFor="validationDefault01">Gender</CFormLabel>
                                    <div className="form-check form-check-inline" >
                                        <label className="rdiobox">
                                            <input type="radio" name="gender" value="Male" checked={Gender === 'Male'} onChange={handleGenderChange} />
                                            <span className="ms-1">Male</span>
                                        </label>
                                    </div>
                                    <div className="form-check form-check-inline" >
                                        <label className="rdiobox">
                                            <input type="radio" name="gender" value="Female" checked={Gender === 'Female'} onChange={handleGenderChange} />
                                            <span className="ms-1">Female</span>
                                        </label></div>
                                    <div className="form-check form-check-inline" >
                                        <label className="rdiobox">
                                            <input type="radio" name="gender" value="Non-Binary" checked={Gender === 'Non-Binary'} onChange={handleGenderChange} />
                                            <span className="ms-1">Non-Binary</span>
                                        </label></div>
                                    <div className="form-check form-check-inline" >
                                        <label className="rdiobox">
                                            <input type="radio" name="gender" value="Prefer not to say" checked={Gender === 'Prefer not to say'} onChange={handleGenderChange} />
                                            <span className="ms-1">Prefer not to say</span>
                                        </label></div>
                                    <div className="form-check form-check-inline" >
                                        <label className="rdiobox">
                                            <input type="radio" name="gender" value="Other" checked={Gender === 'Other'} onChange={handleGenderChange} />
                                            <span className="ms-1">Other</span>
                                        </label></div>
                                </CCol>

                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Profile Picture</CFormLabel>
                                    <CFormInput
                                        type="file"
                                        id="validationDefault01"
                                        onChange={(e) => {
                                            setImageURL(e.target.files[0]);
                                        }}
                                    />

                                </CCol>

                                <CCol md={12} className="mt-5">
                                    <strong> Basic Additional Information</strong></CCol>

                                <CCol md={4} className="membr-info-dt">



                                    <CFormLabel htmlFor="validationDefault01">Date of Birth </CFormLabel>

                                    <CFormInput
                                        id="validationDefault01"
                                        type="date"
                                        // defaultValue="2020-01-16T14:22"
                                        value={dob}
                                        onChange={handleDobDate}
                                    />

                                    {/* <InputGroup className="input-group reactdate-pic">
                                        <DatePicker
                                            maxDate={today}
                                            className="form-control"
                                            selected={startDate}
                                            value="2024/16/01"
                                            onChange={(date) => {
                                                console.log(date)
                                                setStartDate(date)
                                            }}

                                        />
                                        { <DatePicker selected={startDate} onChange={(date) => setDob(date)} /> }
                                    </InputGroup> */}
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">City and Country of Birth </CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={city_country_birth}
                                        onChange={(e) => {

                                            setCity_country_birth(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">City and Country where you currently live</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={city_country_live}
                                        onChange={(e) => {

                                            setCity_country_live(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">What is your LinkedIn profile link?</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={linkdin_profile_link}
                                        onChange={(e) => {

                                            setLinkdin_profile_link(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">What is your Instagram handle?</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={instagram_handle}
                                        onChange={(e) => {

                                            setInstagram_handle(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault04">What is your Facebook profile link?</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={facebook_profile_link}
                                        onChange={(e) => {

                                            setFacebook_profile_link(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault04">What is your LinkTree link?</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={link_tree_link}
                                        onChange={(e) => {

                                            setLink_tree_link(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault04">Please share with us 3 of your core values.</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={core_values}
                                        onChange={(e) => {

                                            setCore_values(e.target.value);
                                        }}
                                    />

                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault04">Please provide us with the full names of two existing members (min) of the
                                        ONDALINDA community that can serve as a References for your Application. We will check-in with them to validate your application.
                                        If you do not have any references, please write “NO REFERENCES” and let us know how you heard of us.</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={not_attendedfestival}
                                        onChange={(e) => {

                                            setNot_attendedfestival(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault04">What is your favorite kind of music? Write down a few of your favorites musicians, groups, DJs, genres, decades etc.</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={favourite_music}
                                        onChange={(e) => {

                                            setFavourite_music(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault04">We appreciate your honesty and the time youve generously given us. We look forward to having you
                                        join our family in the near future. If theres anything else youd like to share, please dont hesitate to do so in the space provided below.</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={appreciate_your_honesty}
                                        onChange={(e) => {
                                            setAppreciate_your_honesty(e.target.value);
                                        }}
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel htmlFor="validationDefault04">What mythical and mystical creature would you bring with you to the next Ondalinda event and why?</CFormLabel>
                                    <CFormTextarea
                                        type="text"
                                        id="validationDefault01"
                                        value={mythical_and_mystical}
                                        onChange={(e) => {
                                            setMythical_and_mystical(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={12} className="mt-5">
                                    <b>Address</b></CCol>

                                {/* <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault04">Country</CFormLabel>
                                    <select name="id" className="form-control"
                                        value={Country}
                                        onChange={(e) => {
                                            setCountry(e.target.value);
                                        }}
                                    >
                                        <option value="">--Select Country--</option>
                                        <option value="Afghanistan">Afghanistan</option>
                                        <option value="Albania">Albania</option>
                                        <option value="Algeria">Algeria</option>
                                        <option value="Andorra">Andorra</option>
                                        <option value="Angola">Angola</option>
                                        <option value="Antigua and Barbuda">Antigua and Barbuda</option>
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
                                        <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
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
                                        <option value="Central African Republic">Central African Republic</option>
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
                                        <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                                        <option value="Denmark">Denmark</option>
                                        <option value="Djibouti">Djibouti</option>
                                        <option value="Dominica">Dominica</option>
                                        <option value="Dominican Republic">Dominican Republic</option>
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
                                        <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                                        <option value="Saint Lucia">Saint Lucia</option>
                                        <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                                        <option value="Samoa">Samoa</option>
                                        <option value="San Marino">San Marino</option>
                                        <option value="Sao Tome and Principe">Sao Tome and Principe</option>
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
                                        <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                                        <option value="Tunisia">Tunisia</option>
                                        <option value="Turkey">Turkey</option>
                                        <option value="Turkmenistan">Turkmenistan</option>
                                        <option value="Tuvalu">Tuvalu</option>
                                        <option value="Uganda">Uganda</option>
                                        <option value="Ukraine">Ukraine</option>
                                        <option value="United Arab Emirates">United Arab Emirates</option>
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

                                </CCol> */}

                                {/* Find Countrys from db */}
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault04">Country</CFormLabel>
                                    <select
                                        name="id" className="form-control"
                                        value={Country}
                                        onChange={(e) => {
                                            const selectedCountryName = e.target.value; // Capture the country name
                                            setCountry(selectedCountryName); // Set the selected country name
                                            const selectedCountry = countries.find(country => country.name === selectedCountryName);

                                            if (selectedCountry) {
                                                fetchAllStates(selectedCountry.id);
                                                fetchAllCountryLocation(selectedCountry.id)
                                            } else {
                                                setStates([]);
                                            }
                                        }}
                                    >
                                        <option value="">Select Country*</option>
                                        {countries.map((item) => {
                                            return (
                                                <option key={item.id} value={item.name}>
                                                    {item.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </CCol>

                                {/* Find States from db */}
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault04">State</CFormLabel>
                                    <select
                                        name="id" className="form-control"
                                        value={State}
                                        onChange={(e) => {
                                            setState(e.target.value);
                                        }}
                                    >
                                        <option value="">Select States</option>
                                        {states.map((item) => {
                                            return (
                                                <option key={item.id} value={item.name}>
                                                    {item.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Location</CFormLabel>
                                    <select name="id" className="form-control"
                                        value={country_group}
                                        onChange={(e) => {
                                            setCountry_group(e.target.value);
                                        }}
                                    >
                                        <option value="0">-Select-</option>
                                        <option value="1">Europe</option>
                                        <option value="2">Africa</option>
                                        <option value="3">Mexico</option>
                                        <option value="4">South America</option>
                                        <option value="5">USA</option>
                                        <option value="6">Australia</option>
                                        <option value="7">North America</option>
                                        <option value="8">Middle East</option>
                                        <option value="9">Asia</option>
                                        <option value="10">Oceania</option>
                                    </select>

                                </CCol>







                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Address Line 1</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={AddressLine1}
                                        onChange={(e) => {

                                            setAddressLine1(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Address Line 2</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={AddressLine2}
                                        onChange={(e) => {

                                            setAddressLine2(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">City</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={City}
                                        onChange={(e) => {

                                            setCity(e.target.value);
                                        }}
                                    />
                                </CCol>

                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Postal Code</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={PostalCode}
                                        onChange={(e) => {
                                            setPostalCode(e.target.value);
                                        }}
                                    />

                                </CCol>



                                <CCol md={12} className="mt-5">
                                    <b>Assistant Information</b></CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Assistants Name</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={AssistantName}
                                        onChange={(e) => {

                                            setAssistantName(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Assistants Email</CFormLabel>
                                    <CFormInput
                                        type="email"
                                        id="validationDefault01"
                                        value={AssistantEmail}
                                        onChange={(e) => {

                                            setAssistantEmail(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Assistants Phone</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        maxLength={10}
                                        minLength={10}
                                        value={AssistantPhoneNumber}
                                        onChange={(e) => {

                                            setAssistantPhoneNumber(e.target.value);
                                        }}
                                    />
                                    <CFormFeedback invalid>Please provide a minimum length of 10 characters and a maximum length of 10 characters.</CFormFeedback>

                                </CCol>



                                <CCol md={12} className="mt-5">
                                    <b> Reference 1</b></CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">First Name</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={refference1_first_name}
                                        onChange={(e) => {

                                            setRefference1_first_name(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Last Name</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={refference1_last_name}
                                        onChange={(e) => {

                                            setRefference1_last_name(e.target.value);
                                        }}
                                    />
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Email</CFormLabel>
                                    <CFormInput
                                        type="email"
                                        id="validationDefault01"
                                        value={refference1_email}
                                        onChange={(e) => {

                                            setRefference1_email(e.target.value);
                                        }}
                                    />
                                </CCol>
                                <CCol md={12} className="mt-5">
                                    <b>Reference 2</b></CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">First Name</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={refference2_first_name}
                                        onChange={(e) => {

                                            setRefference2_first_name(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Last Name</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={refference2_last_name}
                                        onChange={(e) => {

                                            setRefference2_last_name(e.target.value);
                                        }}
                                    />
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01"> Email</CFormLabel>
                                    <CFormInput
                                        type="email"
                                        id="validationDefault01"
                                        value={refference2_email}
                                        onChange={(e) => {

                                            setRefference2_email(e.target.value);
                                        }}
                                    />

                                </CCol>


                                <CCol md={12} className="mt-5">
                                    <b> Social Networks</b></CCol>

                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Website URL</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={WebsiteURL}
                                        onChange={(e) => {

                                            setWebsiteURL(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Instagram URL</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={InstagramURL}
                                        onChange={(e) => {

                                            setInstagramURL(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Twitter URL</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={TwitterURL}
                                        onChange={(e) => {

                                            setTwitterURL(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">LinkedIn URL</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={LinkedInURL}
                                        onChange={(e) => {

                                            setLinkedInURL(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Clubhouse URL</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={ClubhouseURL}
                                        onChange={(e) => {

                                            setClubhouseURL(e.target.value);
                                        }}
                                    />

                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="validationDefault01">Discord URL</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        id="validationDefault01"
                                        value={DiscordURL}
                                        onChange={(e) => {

                                            setDiscordURL(e.target.value);
                                        }}
                                    />

                                </CCol>

                                {/* <CCol md={12} className="mt-5">
                                    <b>Interests</b></CCol>

                                {InterestCheckbox.map((value) => {
                                    const isChecked = Interest.includes(value.name);
                                    // console.log("isChecked", isChecked)
                                    return (
                                        <Col lg={4} key={value.key}>
                                            <label className="ckbox">
                                                <input
                                                    type="checkbox"
                                                    value={value.name} // Set the value attribute to the name of the checkbox
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) {
                                                            setInterest((prevList) =>
                                                                prevList.filter((item) => item !== value.name)
                                                            );
                                                        } else {
                                                            setInterest((prevList) => [...prevList, value.name]);
                                                        }
                                                    }}
                                                />
                                                <span>{value.name}</span>
                                            </label>
                                        </Col>
                                    );
                                })} */}


                                <CCol md={9} className="mt-5 mb-2">
                                    <strong > Are you a member - or have you been a member within the past 5 years - of any of
                                        the communities listed below? Please select the ones that apply:</strong>
                                </CCol>

                                {checkboxesFormatted.map((value) => {
                                    const isChecked = are_you_member.includes(value.name);
                                    // console.log("isChecked", isChecked)
                                    return (
                                        <Col lg={4} key={value.key}>
                                            <label className="ckbox">
                                                <input
                                                    type="checkbox"
                                                    value={value.name} // Set the value attribute to the name of the checkbox

                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) {
                                                            setAre_you_member((prevList) =>
                                                                prevList.filter((item) => item !== value.name)
                                                            );
                                                        } else {
                                                            setAre_you_member((prevList) => [...prevList, value.name]);
                                                        }
                                                    }}
                                                />
                                                <span>{value.name}</span>
                                            </label>
                                        </Col>
                                    );
                                })}


                                <CCol md={9} className="mt-5 mb-2">
                                    <strong > Have you attended ONDALINDA x CAREYES festival before? Please select all that apply.</strong>
                                </CCol>
                                {/* old functionality attended festival before */}


                                {/* {AttendedFestivalBefore.map((value) => {
                                    const isChecked = attended_festival_before.includes(value.key);
                                    const isDisabled = neverAttended && value.name !== "I HAVE NEVER ATTENDED AN ONDALINDA EVENT";
                                    return (
                                        <Col lg={4} key={value.key}>
                                            <label className="ckbox">
                                                <input
                                                    type="checkbox"
                                                    value={value.key} // Set the value attribute to the name of the checkbox
                                                    checked={isChecked}
                                                    disabled={isDisabled}
                                                    onChange={() => handleAttendedeventChange(value)}
                                                />
                                                <span>{value.name}</span>
                                            </label>
                                        </Col>
                                    );
                                })} */}
                                {/* new functionality implimint */}

                                {events.map((value) => {
                                    // const isChecked = attended_festival_before.includes(value.id);
                                    // const isDisabled = neverAttended && value.id !== 0; // Disable all except 0 when `neverAttended` is active
                                    const attendedList = Array.isArray(attended_festival_before) ? attended_festival_before : [];
                                    const isChecked = attendedList.includes(value.id);
                                    const isDisabled = neverAttended && value.id !== 0; // Disable all except 0 when `neverAttended` is active
                                    return (
                                        <Col lg={4} key={value.key}>
                                            <label className="ckbox">
                                                <input
                                                    type="checkbox"
                                                    value={value.id}
                                                    checked={isChecked}
                                                    disabled={isDisabled}
                                                    onChange={() => handleAttendedeventChange(value)}
                                                />
                                                <span>{value.name}</span>
                                            </label>
                                        </Col>
                                    );
                                })}




                                <CCol md={9} className="mt-5 mb-2">
                                    <strong >We are planning different kind of gatherings, which would interest you the most?.</strong>
                                </CCol>
                                {checkboxinterestedData.map((value) => {
                                    const isChecked = most_interested_festival.includes(
                                        // value.name
                                        value.key
                                    );

                                    if (value.key === "Other") {
                                        return (
                                            <Col lg={4} key={value.key}>
                                                <label className="ckbox">
                                                    <input
                                                        type="checkbox"
                                                        value={value.name}
                                                        checked={isChecked}
                                                        onChange={() => handleCheckboxChange(value)}
                                                    />
                                                    <span className="">{value.name}</span>
                                                </label>
                                                {isChecked && ( // This condition ensures the input field shows only when "Other" is checked
                                                    // <Form.Control
                                                    //     type="text"
                                                    //     placeholder="Type here.."
                                                    //     value={most_interested_other}
                                                    //     onChange={handleOtherInputChange}
                                                    //     required={isChecked}
                                                    // />
                                                    <CCol md={12} className="mt-3">
                                                        <CFormInput
                                                            type="text"
                                                            placeholder="Type here.."
                                                            value={most_interested_other}
                                                            onChange={handleOtherInputChange}
                                                            required={isChecked}
                                                        />

                                                    </CCol>
                                                )}
                                            </Col>
                                        );
                                    } else {
                                        return (
                                            <Col lg={4} key={value.key}>
                                                <label className="ckbox">
                                                    <input
                                                        type="checkbox"
                                                        value={value.key}
                                                        checked={isChecked}
                                                        onChange={() => handleCheckboxChange(value)}
                                                    />
                                                    <span className="">{value.name}</span>
                                                </label>
                                            </Col>
                                        );
                                    }
                                })}




                                {/* {checkboxinterestedData.map((value) => {
                                    const isChecked = most_interested_festival.includes(
                                        // value.name
                                        value.key
                                    );
                                    // console.log("isChecked", isChecked)
                                    return (
                                        <Col lg={4} key={value.key}>
                                            <label className="ckbox">
                                                <input
                                                    type="checkbox"
                                                    value={value.key} // Set the value attribute to the name of the checkbox
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) {
                                                            setMost_interested_festival((prevList) =>
                                                                prevList.filter((item) => item !== value.key)
                                                            );
                                                        } else {
                                                            setMost_interested_festival((prevList) => [...prevList, value.key]);
                                                        }
                                                    }}
                                                />
                                                <span>{value.name}</span>
                                            </label>
                                        </Col>
                                    );
                                })} */}




                                {/* <CCol md={12} className="mt-5 mb-2">
                                    <strong >Your ideas on how we can create a more sustainable planet are important to us. What topics do you care the most about?</strong></CCol>

                                {checkboxData.map((value) => {
                                    const isChecked = sustainable_planet.includes(value.name);
                                    // console.log("isChecked", isChecked)
                                    return (
                                        <Col lg={4} key={value.key}>
                                            <label className="ckbox">
                                                <input
                                                    type="checkbox"
                                                    value={value.name} // Set the value attribute to the name of the checkbox

                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) {
                                                            setSustainable_planet((prevList) =>
                                                                prevList.filter((item) => item !== value.name)
                                                            );
                                                        } else {
                                                            setSustainable_planet((prevList) => [...prevList, value.name]);
                                                        }
                                                    }}
                                                />
                                                <span>{value.name}</span>
                                            </label>
                                        </Col>
                                    );
                                })} */}



                                <CCol md={4} className=" mt-5 d-flex justify-content-beetwen">
                                    <Link className="w-50 me-2" href={"/admin/members"}>
                                        <CButton className="w-100" color="dark op-7 " >
                                            Back
                                        </CButton>
                                    </Link>
                                    <CButton color="primary" className="w-50" type="submit" disabled={isLoading} >
                                        {/* Update */}
                                        {isLoading ? (
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        ) : (
                                            'Update'
                                        )}
                                    </CButton>
                                </CCol>


                                {/* <Button variant="" className="btn btn-dark mt-4 mb-0 w-100 rounded-0" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                    'Sign In'
                  )}
                </Button> */}










                            </CForm>

                        </Card.Body>
                    </Card>
                </Col>
            </div>
            {/* <!--/Row--> */}
        </div>
    );
}

MemberEdit.propTypes = {};

MemberEdit.defaultProps = {};

MemberEdit.layout = "Contentlayout"

export default MemberEdit;
