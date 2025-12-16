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

const CheckoutForm = ({ showNextStep, clientSecret }) => {
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

            const { error, paymentIntent } = await stripe.confirmPayment({
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





                <p style={{ textIndent: "0" }}>
                    This Ticket Terms and Conditions, and Waiver and Release
                    (“Waiver and Release” or this “Agreement”), is entered into by
                    and between the purchaser and/or user of the Event (as defined
                    below) ticket and/or participant and/or attendee of the Event
                    (“you&quot; or “Participant” or “Attendee”), on the one hand, and
                    Experiencias de la Costa SA de CV, a Mexican limited liability
                    company, and eboxtickets Productions, LLC, a Delaware limited liability company, on the other hand (collectively “we” or
                    “eboxtickets” or “eboxtickets”). Participant and
                    eboxtickets may collectively be referred
                    hereinafter as the &quot;Parties.&quot;
                </p>



                <p style={{ textIndent: "0" }}>
                    WHEREAS the Participant wishes to attend the Event;
                </p>

                <p style={{ textIndent: "0" }}>
                    WHEREAS the Participant agrees to retain full responsibility to be informed of any applicable local legislation and customs, follow the guidelines of the Event, identify and avoid all potential hazards, take reasonable and necessary precautions, carry proper gear, wear proper clothing and remain well hydrated;
                </p>

                <p style={{ textIndent: "0" }}>
                    WHEREAS the Participant enters into this Agreement as
                    medically, physically, and mentally able to participate in the
                    Event with respect to the services provided by eboxtickets X
                    CAREYES, upon the terms and conditions hereinafter set forth;
                    and
                </p>
                <p style={{ textIndent: "0" }}>
                    WHEREAS the terms set forth below are applicable to all participants of the Event for the duration of their stay and participation at the Event.
                </p>



                <p style={{ textIndent: "0" }}>
                    By purchasing and/or using an Event ticket, you agree to be
                    bound by this Agreement, and to the Terms of Service which are
                    available at <Link href="https://eboxtickets.com/terms/" target="_blank">https://eboxtickets.com/terms/</Link>. The “Event” means the
                    eboxtickets 2025, a music, art and wellness
                    festival that will be held in Costa Careyes in Jalisco, Mexico, on
                    November 6, 2025 through November 9, 2025.
                </p>
                <p style={{ textIndent: "0" }}>
                    For good and valuable consideration, the Parties agree as
                    follows:
                </p>

                <h6 style={{ fontWeight: "400" }}>TERM</h6>

                <p>
                    This Agreement shall be of full force and effect throughout the
                    duration of the 2025 Event (November 6, 2025 through
                    November 9, 2025) (the “Term”) unless otherwise expressed in
                    this Agreement.
                </p>


                <h6 style={{ fontWeight: "400" }}>LIMITATION OF LIABILITY</h6>
                <ol type="1">
                    <li>
                        eboxtickets disclaims liability arising out of
                        attendance at the Event, or any eboxtickets affiliated
                        activity in connection with the Event. In no event will
                        we or our members, managers, officers, employees,
                        directors, parents, subsidiaries, affiliates, agents or
                        licensors be liable for any direct, indirect, incidental,
                        special, consequential or exemplary damages,
                        including but not limited to, damages for loss of
                        revenues, lost registration fees, profits, goodwill, use, data, lost real estate opportunities, or business
                        interruptions or other intangible losses (even if such
                        parties were advised of, knew of or should have known
                        of the possibility of such damages, and
                        notwithstanding the failure of essential purpose of any
                        limited remedy), arising out of or related to your
                        attendance at one the Events), regardless of whether
                        such damages are based on contract, tort (including
                        negligence and strict liability), warranty, statute or
                        otherwise.

                    </li>
                </ol>
            </div>
            <div className="terms-check">
                <Form.Check
                    required
                    label="I ACKNOWLEDGE THAT I HAVE READ AND FULLY UNDERSTAND
THESE TERMS OF SERVICE AND THIS WAIVER AND RELEASE OF
LIABILITY. I UNDERSTAND THAT BY AGREEING TO THESE TERMS
OF SERVICE AND THIS WAIVER AND RELEASE I AM GIVING UP
SUBSTANTIAL RIGHTS, AND I DO SO KNOWINGLY AND
VOLUNTARILY WITHOUT ANY INDUCEMENT OR DURESS."
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
