// components/CheckoutForm.js
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import {
    useStripe,
    useElements,
    Elements,
    PaymentElement,
} from "@stripe/react-stripe-js";
import { useEffect, useState, useCallback } from "react";
import { Button, Col, Row, Modal, Form } from "react-bootstrap";
import axios from "axios";
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY);
const stripePromiseDev = loadStripe(process.env.STRIPE_DEV_PUBLIC_KEY);

// Loading Component
const LoadingComponent = ({ isActive }) =>
    isActive && (
        <div
            style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.7)",
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                top: 0,
                zIndex: 9998,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <span
                className="fas fa-spinner fa-3x fa-spin"
                style={{ color: "black" }}
            />
        </div>
    );

const CheckoutForm = ({ showNextStep }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [validated, setValidated] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setErrorMessage(null); // Clear any previous error message
        // Validate the form
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            setErrorMessage("Please complete all required fields.");
            return;
        }

        // Check if the card details are provided
        const cardElement = elements.getElement(PaymentElement);
        if (!cardElement || cardElement._empty) {
            setValidated(true);
            setErrorMessage("Please enter your card details.");
            return;
        }
        setIsLoading(true);
        // Ensure that stripe and elements are properly loaded
        if (!stripe || !elements) {
            setValidated(true);
            setErrorMessage("Stripe has not loaded. Please try again later.");
            return;
        }

        try {
            // Confirm the payment with Stripe
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation`,
                },
            });

            if (error) {
                // Handle Stripe errors like card declined, network issues, etc.
                setErrorMessage(error.message);
                setIsLoading(false);
                setValidated(true);
            } else {
                setValidated(false);
                // Payment successful
                setErrorMessage(null);
                // setIsLoading(false);
            }
        } catch (err) {
            setIsLoading(false);
            // Catch any unexpected errors
            console.error("Payment error:", err);
            setErrorMessage("Something went wrong. Please try again.");
        }
    };

    // Show loader until form is ready
    useEffect(() => {
        if (elements) {
            const paymentElement = elements.getElement(PaymentElement);
            if (paymentElement) {
                paymentElement.on("ready", () => setIsLoading(false));
            }
        }
    }, [elements]);

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <LoadingComponent isActive={isLoading} />

            <PaymentElement onReady={() => setIsLoading(false)} />

            {errorMessage && (
                <div
                    style={{
                        color: "#9e2146",
                        marginTop: "10px",
                        textAlign: "center",
                    }}
                >
                    {errorMessage}
                </div>
            )}

            <div className="secnd-flw-trms">
                <h3 className="terms-hd">Terms and Conditions</h3>

                <h6>Revised 12/17/2025.</h6>

                <p style={{ textIndent: "0" }}>
                    This <b> Ticket Terms and Conditions, and Waiver and Release (this “Agreement”),</b> is entered into by and between the purchaser and/or user of the Event (as defined below) ticket and/or participant and/or attendee of the Event (“you" or “your” or “Participant” or “Attendee”), on the one hand, and Ondalinda Productions, LLC, a Delaware limited liability company, on the other hand (collectively “we” or “our” or “us” or “ONDALINDA X MONTENEGRO” or “ONDALINDA”). Participant and ONDALINDA X MONTENEGRO are each known herein as a “Party” and, collectively, as the “Parties”.
                </p>

                <p style={{ textIndent: "0" }}>WHEREAS the Participant voluntarily and knowingly wishes to attend the Event;</p>

                <p style={{ textIndent: "0" }}>
                    WHEREAS the Participant agrees to retain full responsibility to be informed of any applicable local legislation and customs, follow the guidelines of the Event, identify and avoid all potential hazards, take reasonable and necessary precautions, carry proper gear, wear proper clothing and remain well hydrated;
                </p>

                <p style={{ textIndent: "0" }}>
                    WHEREAS the Participant enters into this Agreement as medically, physically, and mentally able to participate in the Event with respect to the services provided by ONDALINDA X MONTENEGRO, upon the terms and conditions hereinafter set forth; and
                </p>

                <p style={{ textIndent: "0" }}>
                    WHEREAS the terms set forth below are applicable to all participants of the Event for the duration of their stay and participation at the Event.
                </p>

                <p style={{ textIndent: "0" }}>
                    By purchasing and/or using an Event ticket, you agree to be bound by this Agreement, to the Terms of Service which are available at the ONDALINDA website (the “Site”) at <Link href="https://ondalinda.com/terms/">www.ondalinda.com/terms/</Link>, and to the Privacy Policy which is available at the Site at <Link href="https://ondalinda.com/privacy/">www.ondalinda.com/privacy/</Link>. All terms used in this Agreement shall have the same meaning as set forth in the Terms of Service, unless otherwise defined in this Agreement. In the event of a conflict between the Terms of Service and/or Privacy Policy on the one hand and this Agreement, the terms of this Agreement control. The “Event” means the <i>ONDALINDA x MONTENEGRO 2025</i>, a music, art and wellness festival that will be held in Montenegro, from July 3 through July 6, 2025.
                </p>
                <p style={{ textIndent: "0" }}>
                    For good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:
                </p>

                <h6>1. TERM</h6>

                <p>
                    This Agreement shall be of full force and effect throughout the duration of the 2025 Event (July 3, 2025 through July 6, 2025) (the “Term”) unless otherwise expressed in this Agreement.
                </p>

                <p>Upon the end of the Term or termination of this Agreement, neither Party shall have any remaining duties or obligations hereunder, except for any obligations that expressly or by implication from their nature are intended to survive termination or expiration of this Agreement. </p>

                <h6>2. LIMITATION OF LIABILITY</h6>

                <p>ONDALINDA disclaims any and all liability arising out of attendance at the Event, or any ONDALINDA affiliated activity in connection with the Event. In no event will we or our members, managers, officers, employees, directors, parents, subsidiaries, affiliates, agents, vendors, suppliers, subcontractors or licensors be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, accident, physical or psychological illness, injury, death, disability, property damage, loss, damages for loss of revenues, lost registration fees, profits, goodwill, use, data, lost real estate opportunities, or business interruptions or other intangible losses (whether or not such parties were advised of, knew of or should have known of the possibility of such damages, and notwithstanding the failure of essential purpose of any limited remedy), arising out of or related to your attendance at the Event, regardless of whether such damages are based on contract, tort (including negligence and strict liability), warranty, statute, violation of law or otherwise.
                </p>

                <h6>3. ATTENDEE CONDUCT AT EVENTS</h6>

                <ol className="alfa" type="a">
                    <li>
                        All participants and attendees at the Event, including you and your guests, must be approved by ONDALINDA through advance registration and at all times during the Event wear official wristbands designating proper registration.
                    </li>
                    <li>
                        We reserve the right to remove Attendees who do not comply with the proper registration, security procedures or conduct requirements set forth in this Agreement, the Terms of Service or the Privacy Policy at any point during the Event.
                    </li>
                    <li>
                        You may not impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.
                    </li>
                    <li>
                        You may not aid in gaining an unauthorized person access to the Event; this is grounds for removal.
                    </li>
                    <li>
                        You must not defame, abuse, harass, harm or threaten others, or defame, damage, steal or modify any property of ONDALINA or its guests, exhibitors, vendors, suppliers or subcontractors, or make any bigoted, hateful, or racially offensive statements.
                    </li>
                    <li>
                        You may not advocate illegal activity or discuss illegal activities with the intent to commit them or cause injury or property damage to any person. You may not post or distribute any material that infringes and/or violates any right of a third party or any law or post or distribute any vulgar, obscene, discourteous, or indecent language or images.
                    </li>
                    <li>
                        You may not advertise or sell to or solicit others.
                    </li>
                    <li>
                        You may not hand out, transmit or otherwise make available any unsolicited or unauthorized advertising, promotional materials, or any other form of solicitation.
                    </li>
                    <li>
                        If we deem any online, social networking, or other media reference post, article, photo or video regarding the Event inappropriate, you are required to take down or cause to be taken down the material immediately upon our request for removal. If the posting is made during the Event, this may be grounds for removal from the Event, removal and preclusion from the Site and future involvement in ONDALINDA.
                    </li>
                    <li>
                        Without limitation of the foregoing, ONDALINDA may, in its sole and absolute discretion, remove you or any other Attendee from the Event, without explanation, either before or during the Event, if you or any such Attendee engages in any unlawful, unauthorized, prohibited, improper, or unethical activities, or any other acts or omissions that, in our sole and absolute discretion, poses a safety or security concern, or any other acts or omissions that, in our sole and absolute discretion, we deem worthy of your removal from the Event.
                    </li>

                </ol>

                <h6>4. CHARGEBACKS</h6>

                <p>
                    You agree that you will not attempt to evade, avoid, or circumvent any refund prohibitions in any manner with regard to tickets you purchased. Without limiting the generality of the foregoing and for the avoidance of doubt, you will not dispute or otherwise seek a “chargeback” from the company whose credit card or other method of payment you used to purchase tickets from the Site. Should you do so, your tickets are subject to immediate cancellation, and we may, in our sole and absolute discretion, refuse to honor pending and future ticket purchases made from all credit card accounts or online accounts on which such chargebacks have been made, and may prohibit future purchases from all persons in whose name the credit card accounts exist, and from any person who accesses any associated online account or credit card or who otherwise breaches this provision from using the Site.

                </p>

                <h6>5. INTELLECTUAL PROPERTY</h6>

                <ol className="alfa" type="a">
                    <li>
                        Participant acknowledges that “ONDALINDA” and the ONDALINDA logo/symbol are trademarks owned or licensed by CHECKMARK INC., and that CHECKMARK INC. and ONDALINDA PRODUCTIONS, LLC have the exclusive right to license and enforce those trademarks and any other trademarks, copyrights, or other intellectual property owned by or licensed to CHECKMARK INC., including any likenesses, drawings, and representations of the ONDALINDA mark and/or symbol (“ONDALINDA IP”). Participant acknowledges that CHECKMARK INC. is not granting Participant any rights in any ONDALINDA IP and that any such grant may only be made by a separate writing signed by both Parties. Participant agrees that Participant will not use any ONDALINDA IP on any website (except for Personal Use, as described in Section 5(b)) or in any other manner, commercial or otherwise, unless the use constitutes a fair use under United States Copyright law. CHECKMARK INC. only permits the use of ONDALINDA IP, without payment of any license fee, on materials that are given away at the Event or in connection with ONDALINDA X MONTENEGRO (“Gift Materials”), under the following conditions: (1) CHECKMARK INC. may, for any reason in its sole discretion, determine that such use is not in maintaining CHECKMARK INC. quality control, and if so, all such materials shall no longer be utilized; and (2) no ungifted Gift Materials may be sold or transferred in exchange for something of value or distributed in any form such that the Gift Materials are likely to be sold or transferred in exchange for something of value.
                    </li>
                    <li>
                        PARTICIPANT UNDERSTANDS AND ACCEPTS THAT PARTICIPANT HAS NO RIGHT TO ANY USE OF ANY IMAGES OR AUDIO/VISUAL FOOTAGE OF THE EVENT (“Event Imagery”) WITHOUT PRIOR WRITTEN CONSENT FROM ONDALINDA PRODUCTIONS, LLC, OTHER THAN FOR PARTICIPANT’S PERSONAL, NON-COMMERCIAL USE (“Personal Use”). Participant understands that Participant has no right to sell, transfer, license, sublicense, copy, reproduce, republish, download, post, broadcast, record, transmit, commercially exploit, edit, communicate to the public, distribute in any way or give Event Imagery to any other party, except for Personal Use, and Participant agrees to cause any third party to whom Participant gives Event Imagery to also only use Event Imagery for Personal Use. Without the prior written consent of ONDALINDA PRODUCTIONS, LLC, Participant understands that Participant may not use any (1) Event Imagery, (2) drawings or representations of the “Ondalinda” mark and/or symbols, or (3) any copyrights, trademarks, or other intellectual property owned by or licensed to ONDALINDA PRODUCTIONS, LLC. Participant acknowledges and agrees that Participant may not use any of the above in any advertisement, promotional materials (including music videos), or in the title or on or in any publication designed for public dissemination (other than personal blog posts and social media).
                    </li>
                    <li>
                        <u>
                            To the extent Participant may have rights in and to the Event Imagery, Participant hereby assigns to ONDALINDA PRODUCTIONS, LLC all right, title and interest in the copyright to Participant’s Event Imagery that Participant may have for the purpose of enabling ONDALINDA PRODUCTIONS, LLC to enforce the copyright against any party that displays or disseminates any of the Event Imagery in a manner prohibited by or not so authorized by this Agreement. Participant hereby appoints ONDALINDA PRODUCTIONS, LLC as Participant’s attorney-in-fact to execute any documents necessary to effectuate such assignment in intellectual property rights. If Participant posts, or allows to be posted, any Event Imagery on a personal website or a website controlled by a third party, even if permissible as Personal Use; Participant shall not license any Event Imagery that contains any nudity or partial nudity (including any imagery in which bare breasts, bare buttocks, genitals, or genital areas are visible); and if for any reason whatsoever, at ONDALINDA PRODUCTIONS, LLC’s sole discretion, it is determined that any such images must be removed, Participant will promptly remove or cause those images to be removed. ONDALINDA PRODUCTIONS, LLC reserves all rights to revoke any creative commons license that was erroneously placed on Event Imagery in violation of this Agreement and may cause the removal of such Event Imagery on any webpage on which it is displayed. Participant understands that use of the creative commons licenses approved herein does not supersede this Agreement, nor Participant’s responsibility as the photographer or videographer to obtain all necessary permissions from subjects and artists as appropriate under any applicable law. ONDALINDA PRODUCTIONS, LLC requires any party interested in making any commercial use of their documentation of the Event or in distributing footage beyond Personal Use to enter into a separate written agreement with ONDALINDA PRODUCTIONS, LLC.

                        </u>
                    </li>

                    <li>We retain the rights to all staff photography and video footage from the Event.</li>
                    <li>Any use other than that permitted under this Section 5 may only be undertaken with our prior express written authorization.</li>

                </ol>

                <h6>6. RECORDING, TRANSMISSION AND EXHIBITION</h6>
                <ol className="alfa" type="a">
                    <li>You agree that the Event for which you attend is a public event, that your appearance and actions inside and outside the venue where the Event occurs are public in nature, and that you have no expectation of privacy with regard to your actions or conduct at the Event. You grant to ONDALINDA, our partners, licensees and assigns, including but not limited to our brand and media partners, the non-exclusive, irrevocable royalty-free right and license to utilize your name, image, likeness, acts, poses, plays, appearance, movements, statements, photographs and videos in any live or recorded audio, video, or photographic display or other transmission, exhibition, publication or reproduction made of, or at, the Event (regardless of whether before, during or after the Event) for any purpose, in any manner, in any medium or context now known or hereafter developed, without further authorization from, or compensation to, you or anyone acting on your behalf.</li>
                    <li>Without limiting the foregoing, you further acknowledge that other parties, including but not limited to other participants at the Event will be using film, video, and photographic cameras at the Event, and that your image may be captured on film, video, or photographs that may subsequently be displayed or disseminated without your consent or payment of compensation to you, and you hereby release ONDALINDA X MONTENEGRO from any liability due to such filming, photographing, or dissemination. You acknowledge that by purchasing a ticket and attending the Event, you are consenting to be filmed or photographed while participating in any activities or throughout the course of the Event. </li>
                </ol>


                <h6>7. YOU ARE SUBJECT TO SEARCH</h6>

                <p>
                    You and your belongings may be searched by Event personnel on entry to the Event or at any time during your participation at the Event. You consent to such searches and waive any related claims that may arise. If you elect not to consent to, or refuse to permit such searches, you may be denied entry to the Event, or be removed from the Event. Certain items may not be brought into the premises of the Event, including without limitation: firearms, weapons, alcohol, drugs, controlled substances, fireworks, rockets, other explosives, handheld lasers, live plants, or other dangerous or illegal items (collectively, “Prohibited Items”). In addition to the Prohibited Items, stowaways and pets are not permitted into the Event, provided, however, that service animals are permitted into the Event.

                </p>

                <h6>8. VEHICLES ARE SUBJECT TO SEARCH; PARKING PERMITS</h6>

                <ol className="alfa" type="a">
                    <li>
                        You further acknowledge and agree that all vehicles, including without limitation, trucks, trailers, recreational vehicles, shuttles and watercraft entering the Event are subject to search by Event personnel for Prohibited Items, stowaways and pets. You consent to such searches and waive any related claims that may arise.
                    </li>
                    <li>
                        Pre-allocated parking permits (“Parking Permit”) will be required for entry into the Event with a vehicle. Parking without a Parking Permit is strictly prohibited at all official ONDALINDA x MONTENEGRO Events.
                    </li>

                </ol>

                <h6>9. WAIVER AND RELEASE</h6>
                <ol className="alfa" type="a">
                    <li>Throughout this Agreement, ONDALINDA X MONTENEGRO includes Ondalinda Productions, LLC, its affiliates, members, managers, agents, contractors, employees, representatives, volunteers, coaches/instructors, assigns and the manufacturers and distributors of the equipment used in any Event and each of their affiliates, officers, directors, shareholders, members, managers, agents, contractors, employees, coaches/instructors, volunteers, vendors, representatives and assigns.</li>
                    <li>Throughout this Agreement, the term “Event” encompasses all activities, programs, events, and services provided, sponsored or organized by ONDALINDA X MONTENEGRO including but not limited to, social activities, volunteering for ONDALINDA X MONTENEGRO, consuming any food items provided by ONDALINDA X MONTENEGRO. The Participants with food or insect intolerance or allergies are responsible for making sure they are not exposed or ingesting any of the intolerances or allergens.</li>
                    <li><u>Participant’s Duties:</u> During the Term, the Participant shall have the full and complete responsibility to perform the obligations set forth in this Agreement.</li>
                    <li><u>Participant’s Expenses:</u> The Participant shall be responsible for arranging all food, beverage, medical or other personal expenses outside the Event. The Participant shall be fully responsible for all belongings and valuables Participant brings to the Event. The Participant shall be liable for reimbursing ONDALINDA X MONTENEGRO at their demand, for any and all expenses afforded by ONDALINDA X MONTENEGRO on behalf of the Participant that falls outside the scope of this Agreement. The terms of this Section 9(d) shall survive termination of the Agreement and shall remain binding upon the Parties hereto and in full force and effect following termination of this Agreement.</li>
                    <li><u>Medical/Health & Travel Insurance:</u> The Participant is solely responsible for selecting and purchasing adequate medical/health insurance throughout the course of the Event and any affiliated trip. The Participant freely accepts and assumes all responsibility to provide him/herself with the appropriate medical/health insurance coverage. In the event of any accident, injury, illness or other medical/health problem, ONDALINDA X MONTENEGRO shall not be liable for any costs associated with such medical/health issues, including without limitation as a result of the performance, or nonperformance, whether negligence or otherwise, of emergency response personnel, medical treatment or rescue operations by ONDALINDA X MONTENEGRO, its vendors, suppliers, subcontractors, performers, Event participants, response organizations, or others, nor shall ONDALINDA X MONTENEGRO pay for any medical/health expenses, which may be required during your participation in any programs (as a participant, volunteer or performer); provided however, that, during the Event, or while visiting MONTENEGRO during the Term, it is the responsibility of the Participant to alert ONDALINDA X MONTENEGRO of any relevant medical conditions. ONDALINDA X MONTENEGRO reserves the right to refuse or deny the Participant entry to, or continued participation at, the Event or in any Event activity, at ONDALINDA X MONTENEGRO’s sole discretion, should the Participant appear to be unfit to safely engage in any event or activity as determined by ONDALINDA X MONTENEGRO representatives. Participant understands and acknowledges that it is their responsibility to consult with a qualified health authority prior to and regarding their participation in the Event. Participant represents and warrants that they are adequately fit and of sound ability to take responsibility for the choice to participate in the Event. Participant understands their own physical limitations and is sufficiently self-aware to stop physical activity before becoming ill or injured. The terms of this paragraph shall survive the termination of the Agreement and shall remain binding upon the Parties hereto and in full force and effect following termination of this Agreement.</li>
                    <li><u>Description of Risks:</u> In consideration of Participant’s participation in any programs/activities at the Event, the Participant acknowledges that Participant is aware of, and freely accepts the inherent risks, dangers and hazards associated with some programs/activities, including the possible risk of severe or fatal injury, and in extraordinary cases death, property loss and severe social and economic losses. These risks include without limitation:

                        <ol className="roman" type="i">
                            <li>all manner of injuries such as muscular and soft tissue injuries including without limitation bruises, scrapes and cuts resulting from engaging in strenuous and demanding physical activities, contact with other participants, volunteers or performers and failure in proper use of equipment either by the Participant or other participants, performers or volunteers;</li>
                            <li>all manner of injuries resulting in sprains, dislocations, concussion, and broken bones, heart attack/stroke, spinal injury and tendonitis;</li>
                            <li>all manner of injuries related to bites or stings from animals or insects including but not limited to scorpions and snakes;
                            </li>
                            <li>all manner of head, facial, eye and/or dental injuries;</li>
                            <li>all manner of hearing damage due to excessive exposure to loud music;</li>
                            <li>all manner of medical problems resulting from heat exhaustion, dehydration, asthma, communicable diseases, food poisoning, skin rashes, cramps, chemical poisoning, and lack of fitness or conditioning;</li>
                            <li>all manner of injuries and/or death that could result from a physical confrontation whether caused by the Participant or someone else;</li>
                            <li>all manner of illness and/or death that could result from COVID-19 exposure;</li>
                            <li>all manner of injuries and/or death that could result from the performance, or nonperformance, whether negligence or otherwise, of emergency response personnel, medical treatment or rescue operations by ONDALINDA X MONTENEGRO, its vendors, suppliers, subcontractors, performers, Event participants, response organizations, or other;</li>
                            <li>all manner of injuries and/or death that may result from collision with other Event participants or Event personnel on watercraft, foot, bikes, motor vehicles and/or shuttles;</li>
                            <li>all manner of injuries and/or death that may result from the use of boat transportation services provided at the Event; </li>
                            <li>all manner of injuries and/or death that may result in connection with the following:

                                <ol className="alpha-2" type="A">
                                    <li>risk of possible injury increases as a Participant becomes fatigued; the property where the Event will take place is remote and includes rocky, terrain, cliffs, beaches and other bodies of water, which may contain potentially harmful plants and animals, included but not limited to snakes, lizards, mosquitoes, scorpions, ticks, crocodiles and poisonous plants.</li>
                                    <li>the Event may take place on the oceanfront and it can be dangerous, and the waters may not be swimmable.</li>
                                    <li>all of the scenery, props, and installations that will be displayed or in use during the Event are not to be climbed on, walked on, or ridden (“Prohibited Activity”) and any Participant’s engagement in any Prohibited Activity can be dangerous;
                                    </li>


                                </ol>


                            </li>

                            <li>all manner of injuries and/or death that may result in connection with: (A) the actions, inactions, or negligence of the organizers of ONDALINDA X MONTENEGRO and/or other participants, vendors, suppliers, performers, or subcontractors in the Event; (B) existing conditions of the premises or equipment used; (C) your violation of any rules and regulations regarding the activities; (D) temperature; (E) weather; (F) the physical or mental condition of other participants; (G) the use by Participants and by ONDALINDA X MONTENEGRO of fire, pyrotechnics, flame effects, explosions, and other similar activities; (H) vehicular traffic; and (I) participating in the Event during the COVID-19 pandemic;</li>
                            <li>all manner of injuries and/or death that may result in connection with art installations, stages, vehicles, events, and performances held and/or on display which Participant understands may be owned or operated by third parties; and</li>
                            <li>all manner of injuries and/or death that may result in connection with risks that are not known or foreseeable at this time by ONDALINDA X MONTENEGRO.
                            </li>


                        </ol>
                    </li>
                    <li><u>Medical Consent:</u> Participant hereby consents to have emergency medical treatment that may be deemed advisable in the event of injury, accident, and/or illness during any program, event, or activity at the Event. Without limiting anything hereunder, Participant releases ONDALINDA X MONTENEGRO and all persons participating in any such medical treatment from all responsibility for any such actions that are required to be taken.
                    </li>
                    <li><u>Waiver, Release and Agreement Not to Sue: Participant, on his/her own behalf, his/her assigns, executors, guardians and all other legal representatives, hereby releases, discharges, waives and forever relinquishes ONDALINDA X MONTENEGRO, Ondalinda Productions, LLC, and each of their affiliates (including, without limitation, property owners in MONTENEGRO), and each of their agents, employees, officers, directors, shareholders, members, managers, employees and any other person associated with the aforementioned persons and entities (collectively, the “Released Parties”), from any and all present and future known or unknown claims, including, without limitation, claims for property damage, personal injury, or death resulting from, arising out of or in any way connected to Participant’s participation at the Event, including, but not limited to, Claims actually or allegedly arising out of or relating to the negligence of any of the Released Parties, wherever, whenever, or however the damage, injury, or death may occur (including without limitation any Claims actually or allegedly arising out of or in connection with Participant’s use of the boat transportation services provided at the Event). Participant further agrees that under no circumstance will Participant attempt to present any Claims against, prosecute, sue, seek to attach any lien for any purpose including satisfaction of a judgment or other judicial decree, to the property of the Released Parties. Participant understands and agrees that the Released Parties are not responsible for any harm, such as property damage, personal injury, or death, arising out of or in any way related to Participant’s participation at the Event, including harm caused by the Released Parties’ actual or alleged negligence. IT IS THEREFORE PARTICIPANT’S INTENTION TO EXEMPT AND RELIEVE THE RELEASED PARTIES FROM ALL LIABILITY, INCLUDING, BUT NOT LIMITED TO, LIABILITY FOR ANY PERSONAL INJURY, PROPERTY DAMAGE, OR DEATH, INCLUDING, WITHOUT LIMITATION, THAT CAUSED BY THE RELEASED PARTIES’ ACTUAL OR ALLEGED NEGLIGENCE.</u></li>
                </ol>

                <h6>10. COMPLIANCE WITH RULES, REGULATIONS, TERMS AND CONDITIONS</h6>

                <p>
                    In consideration of being permitted to participate in and attend the Event, Participant agrees to comply with any and all rules, regulations, terms and conditions of ONDALINDA X MONTENEGRO and without limiting the generality of the foregoing, specifically acknowledges and agrees to the following:

                </p>

                <ol className="alfa" type="a">

                    <li> Participant acknowledges that Participant is required to comply with any COVID-19 regulations set by ONDALINDA x MONTENEGRO which may include on-site Antigen testing, proof of vaccination, or a negative PCR or Antigen COVID-19 test for entry.
                    </li>
                    <li>Participant understands that some participants at the Event may engage in expressive activity and dress, which may include partial nudity or nudity and other types of expressive activity. Participant agrees that such expressive activity and dress is neither indecent nor offensive to Participant, and that Participant has decided to attend the Event with full knowledge that such expressive activity and dress may occur. If Participant is accompanied by minors at the Event in breach of this Agreement, Participant nevertheless acknowledges that Participant is aware, has consented on their behalf, and are aware that the minors may be exposed to the expressive activities and dress that may take place at the Event, and that Participant has exercised parental responsibility and control in bringing the minors to the Event. Should Participant find that any activity at the Event is offensive to Participant, or to any minors accompanying Participant, Participant acknowledges that Participant can avoid such activity by, among other things, leaving the vicinity of the activity or leaving the Event.
                    </li>
                    <li>Participant understands that children under 18 years of age are prohibited from attending the Event even if accompanied by a parent or guardian.</li>
                    <li>Participant shall read and abide by the terms and all information listed in this Agreement, the Terms of Service, the Privacy Policy as well as the terms in the Welcome Package which Participant will receive at registration.</li>
                    <li>Participant must bring sunscreen, insect repellent, adequate footwear, prescription medication and first aid supplies to be comfortable during the Event in a natural tropical environment as ONDALINDA X MONTENEGRO shall not provide these items.</li>
                    <li>Participant acknowledges and understands that this is a LEAVE NO TRACE, pack it IN, pack it OUT event, meaning all waste shall be properly disposed of and all personal items shall be taken with Participant at the end of the Event.</li>
                    <li>Commercial vending of any kind, including without limitation the provision of any goods or services delivered to or at the Event, is prohibited except with the express prior written authorization of ONDALINDA X MONTENEGRO.
                    </li>
                    <li> As part of the vehicle pass process, Participant shall provide current contact information. ONDALINDA X MONTENEGRO retains the right to cancel, rescind or revoke any vehicle pass at any time for any reason whatsoever at ONDALINDA X MONTENEGRO’s sole and absolute discretion.</li>
                    <li>The use of the Event ticket for advertising, promotions, contests, sweepstakes, giveaways, etc. without the prior express written consent of ONDALINDA X MONTENEGRO is expressly prohibited.</li>

                </ol>

                <h6><u>11. INDEMNIFICATION </u></h6>

                <ol className="alfa" type="a">
                    <li><u><b>ONDALINDA X MONTENEGRO shall not be held liable for any and all acts or omissions on the part of the Participant. Participant shall fully indemnify, defend, hold harmless and release ONDALINDA X MONTENEGRO and our affiliated companies, suppliers, advertisers, and sponsors, and each of our officers, directors, shareholders, managers, members, employees, agents, representatives and assigns from and against any and all liabilities, claims, causes of action, suits, losses, damages, fines, judgments and expenses (including reasonable attorneys’ fees and court costs) in the event any third-party claims (“Claims”) which may be suffered, made or incurred by ONDALINDA X MONTENEGRO that arise, directly or indirectly, from any and all acts or omissions on the part of the Participant including without limitation: (i) the negligent, intentional or criminal actions of the Participant; (ii) your attendance/participation at the Event (including without limitation any Claim brought in connection with your use of any of the boat transportation services offered during the Event); or (iii) your violation of this Agreement.</b></u></li>
                    <li><u><b>Without limiting the foregoing, if a Participant causes damage to boats and other vessels during the ride organized by ONDALINDA or its Montenegrin partner, which are rented from transportation organizing companies, the Participant will be directly liable to the engaged company renting the boats and vessels. If ONDALINDA or its Montenegrin partner, in event organization, pays for the damage caused by the Participant, ONDALINDA has the right of recourse from the Participant for the full amount paid for the damage incurred, increased by all costs incurred in the damage recovery process (including but not limited to costs of engagement and representation by attorneys).</b></u></li>
                    <li><u><b>We reserve the right to take exclusive control and defense of any claim, and Participant will cooperate fully with us in asserting any available defenses.
                    </b></u></li>
                    <li style={{ color: "red" }}>THE INDEMNIFICATION PROVISIONS PROVIDED FOR IN THIS AGREEMENT HAVE BEEN EXPRESSLY NEGOTIATED IN EVERY DETAIL, ARE INTENDED TO BE GIVEN FULL AND LITERAL EFFECT, AND SHALL BE APPLICABLE WHETHER OR NOT THE LIABILITIES, OBLIGATIONS, CLAIMS, JUDGMENTS, LOSSES, COSTS, EXPENSES, OR DAMAGES IN QUESTION ARISE OR AROSE SOLELY OR IN PART FROM THE GROSS, ACTIVE, PASSIVE, OR CONCURRENT NEGLIGENCE, STRICT LIABILITY, OR OTHER FAULT OF ANY INDEMNIFIED PARTY.  THE PARTIES ACKNOWLEDGE THAT THIS STATEMENT COMPLIES WITH THE EXPRESS NEGLIGENCE RULE AS IN EFFECT IN THE RELEVANT JURISDICTION AND THAT THIS STATEMENT CONSTITUTES CONSPICUOUS NOTICE.  <u>THIS CONSPICUOUS NOTICE IS NOT INTENDED TO PROVIDE OR ALTER THE RIGHTS AND OBLIGATIONS OF THE PARTIES, ALL OF WHICH ARE SPECIFIED ELSEWHERE IN THIS AGREEMENT.</u>
                    </li>


                </ol>



                <h6>12. FORCE MAJEURE</h6>

                <p>
                    Notwithstanding anything to the contrary contained in this Agreement, ONDALINDA X MONTENEGRO will not incur any liability to Participant, or to any other person or entity, with respect to any failure of ONDALINDA X MONTENEGRO to perform any of its obligations under this Agreement in the event that the failure is due to or arises out of: (i) any act of God; (ii) any act of a public enemy; (iii) any act of any local, county, state, federal or other government in its sovereign or contractual capacity; (iv) any act of war or terrorism or criminal acts (including narco-related); (v) any riot; (vi) any fire, flood or adverse weather condition; (vii) any epidemic, pandemic or quarantine (including the COVID-19 pandemic and any travel restrictions as a result imposed by any government impacting the Event); (viii) any act of sabotage; (ix) any strike, lock-out or other labor disturbance; or (x) any other cause beyond the reasonable control of ONDALINDA X MONTENEGRO (each, a “Force Majeure Event”). Participant understands that any fees paid by Participant are nonrefundable even if the Event is terminated early or canceled, or entry conditions are modified, due to an event of Force Majeure.

                </p>

                <h6>13. NO REFUNDS</h6>

                <p>
                    All sales are final, and any fees are nonrefundable. No refunds or exchanges will be issued for any reason. Participant acknowledges and accepts the cancellation/refund policy set forth in the Terms of Service.
                </p>


                <h6>14. INJUNCTIVE RELIEF</h6>
                <ol className="alfa" type="a">
                    <li>The rights and remedies of Participant in the event of any material breach by ONDALINDA X MONTENEGRO of this Agreement or any of ONDALINDA X MONTENEGRO’s obligations hereunder shall be limited to Participant’s right to recover damages, if any, up to a maximum amount equal to the purchase price of Participant’s ticket, in action at law, and Participant hereby waives any right or remedy in equity, including, without limitation, any rights granted to ONDALINDA X MONTENEGRO’s hereunder and/or to seek injunctive relief or other equitable relief with respect to any breach of ONDALINDA X MONTENEGRO’s obligations hereunder.</li>
                    <li>Any breach of this Agreement by you shall be considered a material breach of this Agreement, and you acknowledge that such breach may cause material harm to ONDALINDA X MONTENEGRO, for which injunctive relief and other equitable relief (without posting bond) may be sought to prevent or cure any such breach or threatened breach, in addition to and without limitation of any other remedies available at law or in equity.</li>
                </ol>

                <h6>15. AMENDMENTS</h6>
                <p>Participant understands that this Agreement may be amended or modified by ONDALINDA X MONTENEGRO, in its sole and absolute discretion, prior to the Event, and if so, such revised Agreement shall also govern. The current form of the Agreement will be contained on the Site, and Participant, by attending the Event acknowledges, agrees and consents to the terms and conditions of such form of Agreement.
                </p>

                <h6>16. PERSONALLY IDENTIFIABLE INFORMATION
                </h6>
                <p>Except to the extent that ONDALINDA X MONTENEGRO is required or permitted by law to do otherwise, personally identifiable information provided by Participant to ONDALINDA X MONTENEGRO will only be used in accordance with the Privacy Policy and any consents given by Participant in relation to Participant’s personal information.</p>


                <h6>17. CLASS ACTION WAIVER; NO JURY TRIAL</h6>
                <p>THE PARTIES EACH AGREE TO WAIVE ANY RIGHT TO A JURY TRIAL, AND AGREE THAT EACH PARTY MAY ONLY BRING CLAIMS AGAINST THE OTHER PARTY IN AN INDIVIDUAL CAPACITY, AND NOT AS A CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING</p>


                <h6>18. GOVERNING LAW</h6>
                <p>This Agreement and any disputes arising under or related thereto (whether for breach of contract, damage, injury, death, tortious conduct or otherwise) shall be governed by the laws of Montenegro, without reference to its conflicts of law principles. You confirm and agree that the forum for any dispute between you and ONDALINDA X MONTENEGRO arising out of or in connection with this Agreement shall be exclusively under Montenegro law and in the courts of Montenegro. In any such action, You and ONDALINDA hereby irrevocably waive, to the fullest extent permitted by requirements of law, any objection that it may now or hereafter have to the laying of venue of any such action brought in such court and any claim that any such action brought in such court has been brought in an inconvenient forum.</p>


                <h6>19. SEVERABILITY</h6>
                <p>It is our belief that this Agreement does not contain any provision contrary to law. However, if any part of this Agreement is determined to be illegal, invalid, or unenforceable, you agree that: (a) that part shall nevertheless be enforced to the extent permissible in order to effect the intent of the Agreement, and (b) the remaining parts shall be deemed valid and enforceable.</p>


                <h6>20. MISCELLANEOUS</h6>
                <ol className="alfa" type="a">
                    <li>The captions of the sections of this Agreement are for convenience of reference only and in no way define, limit or affect the scope or substance of any section of this Agreement.</li>
                    <li>No waiver of any default or breach of this Agreement by ONDALINDA X MONTENEGRO shall be deemed a continuing waiver or a waiver of any other preceding or succeeding breach or default of the same or any other provision hereof, no matter how similar. </li>
                    <li>Whenever the singular number is used in this Agreement and when required by the context, the same shall include the plural and vice versa, and the masculine gender shall include the feminine and neuter genders and vice versa. </li>
                </ol>
            </div>

            <div className="terms-check">
                <Form.Check
                    required
                    label="I ACKNOWLEDGE THAT I HAVE READ AND FULLY UNDERSTAND THE TERMS OF SERVICE, THE PRIVACY POLICY AND THIS TICKET TERMS AND CONDITIONS, AND WAIVER AND RELEASE OF LIABILITY. I UNDERSTAND THAT BY AGREEING TO THESE TERMS OF SERVICE,  THE PRIVACY POLICY AND THIS TICKET TERMS AND CONDITIONS, AND WAIVER AND RELEASE I AM GIVING UP SUBSTANTIAL RIGHTS, AND I DO SO KNOWINGLY AND VOLUNTARILY WITHOUT ANY INDUCEMENT OR DURESS."
                    // feedback="Please check the terms and conditions."
                    feedbackType="invalid"
                />
            </div>

            <div className="secon-flw-btn">
                <Row className="gy-2">
                    <Col md={5}>
                        <Button
                            variant=""
                            onClick={() => showNextStep(false)}
                            className="btn-out"
                            type="button"
                        >
                            GO BACK
                        </Button>
                    </Col>
                    <Col md={2}></Col>
                    <Col md={5}>
                        <Button
                            variant=""
                            className="btn-bg"
                            type="submit"
                            disabled={!stripe || isLoading}
                        >
                            {isLoading ? "Processing..." : "PAY NOW"}
                        </Button>
                    </Col>
                </Row>
            </div>
        </Form>
    );
};

const Wrapper = (props) => {

    if (props.userId == 10272) {
        return (
            <Elements
                stripe={stripePromiseDev}
                options={{ clientSecret: props.clientSecret }}
            >
                <CheckoutForm {...props} />
            </Elements>
        );
    } else {
        return (
            <Elements
                stripe={stripePromise}
                options={{ clientSecret: props.clientSecret }}
            >
                <CheckoutForm {...props} />
            </Elements>
        );
    }

};
export default Wrapper;
