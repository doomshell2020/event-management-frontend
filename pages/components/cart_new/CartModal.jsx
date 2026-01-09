import React, { useEffect, useState } from "react";
import {
    Modal,
    Button,
    Col,
    Row,
    Spinner,
    InputGroup,
} from "react-bootstrap";
import Image from "next/image";
import api from "@/utils/api";
import Swal from "sweetalert2";
import { useCart } from "@/shared/layout-components/layout/CartContext";
import CheckoutForm from "@/pages/components/cart_new/CheckOut";
import { formatPrice } from "@/utils/commonFunction";

// Loader Component
const LoadingComponent = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div
            style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.7)",
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "27px",
            }}
        >
            <span
                className="fas fa-spinner fa-3x fa-spin"
                style={{ color: "black" }}
            ></span>
        </div>
    );
};

export default function CartModal({ show, handleClose, eventId }) {

    const { cart, refreshCart, eventData, normalCart, addonCart, slotCart, loadingCart, setEventId } = useCart();
    // console.log('cart :', cart);

    const finalEventId = eventId || eventData?.id;


    const [isLoading, setIsLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null); // track which pricing ID is loading
    const [adminFees, setAdminFees] = useState(8);
    const [showNextStep, setShowNextStep] = useState(false);

    const currencySymbol = eventData?.currencyName?.Currency_symbol || "₹";
    const currencyName = (eventData?.currencyName?.Currency || "INR").toLowerCase();
    const ticket_limit = (eventData?.ticket_limit || 0);

    useEffect(() => {
        setIsLoading(loadingCart);
    }, [loadingCart]);

    useEffect(() => {
        if (finalEventId) {
            setEventId(finalEventId);
            refreshCart(finalEventId);
        }
    }, [finalEventId]);


    const [addCartParams, setAddCartParams] = useState({
        event_id: eventId,
        count: 1,               // default count
        item_type: "",          // "slot"
        ticket_id: null,        // not needed for slot
        ticket_price_id: null,  // not needed for slot
        package_id: null,       // not needed for slot
    });

    const getTotalTicketCountInCart = () => {
        return cart.reduce((total, item) => {
            if (item.item_type == "ticket") {
                return total + (item.count || 0);
            }
            return total;
        }, 0);
    };

    const checkTicketLimit = () => {
        if (!ticket_limit || ticket_limit <= 0) return true; // no limit

        const totalTicketsInCart = getTotalTicketCountInCart();

        if (totalTicketsInCart >= ticket_limit) {
            Swal.fire({
                icon: "warning",
                title: "Ticket Limit Reached",
                text: `You can add maximum ${ticket_limit} tickets for this event.`,
                confirmButtonText: "OK"
            });
            return false;
        }

        return true;
    };

    const increaseCart = async (cartId) => {
        return await api.put(`/api/v1/cart/increase/${cartId}`);
    };

    const decreaseCart = async (cartId) => {
        return await api.put(`/api/v1/cart/decrease/${cartId}`);
    };

    const deleteCart = async (cartId) => {
        return await api.delete(`/api/v1/cart/remove/${cartId}`);
    };

    const addToCart = async (params) => {
        return await api.post(`/api/v1/cart/add`, params)
    }

    const increaseSlot = async (slot) => {
        const pricingId = slot.pricings[0]?.id;

        try {
            setLoadingId(pricingId);

            const existing = slotCart.find(item => item.uniqueId == pricingId);

            if (existing) {
                await increaseCart(existing.cartId);
            } else {
                await addToCart({
                    event_id: finalEventId,
                    item_type: "ticket_price",
                    ticket_price_id: pricingId,
                    count: 1
                });
            }

            await refreshCart(finalEventId || undefined);

        } catch (err) {

            if (err?.response?.status == 409) {

                const result = await Swal.fire({
                    title: "Items from another event found!",
                    text: err?.response?.data?.message ||
                        "Your cart has tickets or addons from another event. Clear it?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    cancelButtonText: "No",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    reverseButtons: true
                });

                if (!result.isConfirmed) {
                    setLoadingId(null);
                    return;
                }

                // ➋ SHOW LOADER
                Swal.fire({
                    title: "Clearing Cart...",
                    text: "Please wait",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                // ➌ CLEAR CART
                await clearCart();

                Swal.fire({
                    title: "Cart Cleared",
                    text: "You can add items now.",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false
                });

                // ➍ RETRY ADDING ITEM AUTOMATICALLY
                try {
                    await addToCart({
                        event_id: finalEventId,
                        item_type: "ticket_price",
                        ticket_price_id: pricingId,
                        count: 1
                    });

                    await refreshCart(finalEventId || undefined);

                    Swal.fire({
                        icon: "success",
                        title: "Added Successfully",
                        timer: 1200,
                        showConfirmButton: false
                    });

                } catch (retryError) {
                    console.log("Retry error:", retryError);
                    Swal.fire({
                        icon: "error",
                        title: "Failed",
                        text: "Could not add the ticket after clearing cart."
                    });
                }

                setLoadingId(null);
                return;
            }

            console.log("Increase ticket error:", err);

        } finally {
            setLoadingId(null); // ensures loader is removed ALWAYS
        }
    };

    const decreaseSlot = async (slot) => {
        const pricingId = slot.pricings[0]?.id;

        try {
            setLoadingId(pricingId);

            const existing = slotCart.find(item => item.uniqueId == pricingId);
            if (!existing) return;

            if (existing.count > 1) {
                await decreaseCart(existing.cartId);
            } else {
                await deleteCart(existing.cartId);
            }

            await refreshCart(finalEventId || undefined);

        } catch (err) {
            if (err?.response?.status == 409) {

                const result = await Swal.fire({
                    title: "Items from another event found!",
                    text: err.response.data?.message ||
                        "Your cart belongs to another event. Clear it?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    cancelButtonText: "No",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    reverseButtons: true
                });

                if (!result.isConfirmed) {
                    setLoadingId(null);
                    return;
                }

                // Loader
                Swal.fire({
                    title: "Clearing...",
                    text: "Please wait...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                // Clear cart
                await clearCart();

                Swal.close();

                Swal.fire({
                    title: "Cart Cleared",
                    text: "You can continue now.",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false
                });
                await decreaseCart(existing.cartId);
            }
            console.log("Decrease error:", err);
        } finally {
            setLoadingId(null);
        }
    };

    const clearCart = async () => {
        return await api.delete(`/api/v1/cart/clear`);
    };

    const increaseTicket = async (ticket) => {
        const ticketId = ticket?.id;

        if (!ticket_limit || ticket_limit <= 0 || !ticketId) return true; // no limit

        const questionAnswers = buildQuestionAnswers(ticketId);

        // TICKET LIMIT VALIDATION
        const inCart = cart.reduce((total, item) => {
            if (item.item_type == "ticket" && item.uniqueId == ticketId) {
                return total + (item.count || 0);
            }
            return total;
        }, 0);

        // TICKET LIMIT VALIDATION
        if (ticket_limit > 0 && inCart >= ticket_limit) {
            Swal.fire({
                icon: "warning",
                title: "Ticket Limit Reached",
                text: `You can add maximum ${ticket_limit} tickets for this event.`,
                confirmButtonText: "OK"
            });
            return false;
        }

        try {
            setLoadingId(ticketId);

            const existing = normalCart.find(item => item.uniqueId == ticketId);

            if (existing) {
                await increaseCart(existing.cartId);
            } else {
                await addToCart({
                    event_id: finalEventId,
                    item_type: "ticket",
                    ticket_id: ticketId,
                    count: 1,
                    questionAnswers
                });
            }

            await refreshCart(finalEventId);

        } catch (err) {

            if (err?.response?.status == 409) {

                const result = await Swal.fire({
                    title: "Items from another event found!",
                    text: err?.response?.data?.message ||
                        "Your cart has tickets or addons from another event. Clear it?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    cancelButtonText: "No",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    reverseButtons: true
                });

                if (!result.isConfirmed) {
                    setLoadingId(null);
                    return;
                }

                // ➋ SHOW LOADER
                Swal.fire({
                    title: "Clearing Cart...",
                    text: "Please wait",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                // ➌ CLEAR CART
                await clearCart();
                // await refreshCart();

                Swal.fire({
                    title: "Cart Cleared",
                    text: "You can add items now.",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false
                });

                // ➍ RETRY ADDING ITEM AUTOMATICALLY
                try {
                    await addToCart({
                        event_id: finalEventId,
                        item_type: "ticket",
                        ticket_id: ticketId,
                        count: 1
                    });

                    await refreshCart(finalEventId);

                    Swal.fire({
                        icon: "success",
                        title: "Added Successfully",
                        timer: 1200,
                        showConfirmButton: false
                    });

                } catch (retryError) {
                    console.log("Retry error:", retryError);
                    Swal.fire({
                        icon: "error",
                        title: "Failed",
                        text: "Could not add the ticket after clearing cart."
                    });
                }

                setLoadingId(null);
                return;
            }

            console.log("Increase ticket error:", err);

        } finally {
            setLoadingId(null); // ensures loader is removed ALWAYS
        }
    };

    const decreaseTicket = async (ticket) => {
        const ticketId = ticket?.id;

        // 🚫 TICKET LIMIT VALIDATION
        // if (!checkTicketLimit()) return;

        try {
            setLoadingId(ticketId);

            const existing = normalCart.find(item => item.uniqueId == ticketId);
            if (!existing) return;
            if (existing.count > 1) {
                await decreaseCart(existing.cartId);
            }
            else {
                await deleteCart(existing.cartId);
            }
            await refreshCart(finalEventId);
        } catch (err) {
            if (err?.response?.status == 409) {

                const result = await Swal.fire({
                    title: "Items from another event found!",
                    text: err.response.data?.message ||
                        "Your cart belongs to another event. Clear it?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    cancelButtonText: "No",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    reverseButtons: true
                });

                if (!result.isConfirmed) {
                    setLoadingId(null);
                    return;
                }

                // Loader
                Swal.fire({
                    title: "Clearing...",
                    text: "Please wait...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                // Clear cart
                await clearCart();

                Swal.close();

                Swal.fire({
                    title: "Cart Cleared",
                    text: "You can continue now.",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false
                });
                await decreaseCart(existing.cartId);
                // No retry for decrease (because item doesn't exist anymore)
                // await refreshCart(finalEventId);
            }

            console.log("Decrease error:", err);

        } finally {
            setLoadingId(null);
        }
    };

    const increaseAddon = async (addon) => {
        const addonId = addon?.id;
        try {
            setLoadingId(addonId);

            const existing = addonCart.find(
                item => item.uniqueId == addonId
            );

            if (existing) {
                await increaseCart(existing.cartId);
            } else {
                await addToCart({
                    event_id: finalEventId,
                    item_type: "addon",
                    addons_id: addonId,
                    count: 1
                });
            }

            await refreshCart(finalEventId);

        } catch (err) {

            if (err?.response?.status == 409) {

                const result = await Swal.fire({
                    title: "Items from another event found!",
                    text:
                        err?.response?.data?.message ||
                        "Your cart has tickets or addons from another event. Clear it?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    cancelButtonText: "No",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    reverseButtons: true
                });

                if (!result.isConfirmed) {
                    setLoadingId(null);
                    return;
                }

                // Loader
                Swal.fire({
                    title: "Clearing Cart...",
                    text: "Please wait",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                await clearCart();

                Swal.fire({
                    title: "Cart Cleared",
                    text: "You can add items now.",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false
                });

                // Retry add addon
                try {
                    await addToCart({
                        event_id: finalEventId,
                        item_type: "addon",
                        addon_id: addonId,
                        count: 1
                    });

                    await refreshCart(finalEventId);

                    Swal.fire({
                        icon: "success",
                        title: "Added Successfully",
                        timer: 1200,
                        showConfirmButton: false
                    });

                } catch (retryError) {
                    console.log("Retry addon error:", retryError);
                    Swal.fire({
                        icon: "error",
                        title: "Failed",
                        text: "Could not add the addon after clearing cart."
                    });
                }

                setLoadingId(null);
                return;
            }

            console.log("Increase addon error:", err);

        } finally {
            setLoadingId(null);
        }
    };

    const decreaseAddon = async (addon) => {
        const addonId = addon?.id;

        try {
            setLoadingId(addonId);

            const existing = addonCart.find(
                item => item.uniqueId == addonId
            );

            if (!existing) return;

            if (existing.count > 1) {
                await decreaseCart(existing.cartId);
            } else {
                await deleteCart(existing.cartId);
            }

            await refreshCart(finalEventId);

        } catch (err) {

            if (err?.response?.status == 409) {

                const result = await Swal.fire({
                    title: "Items from another event found!",
                    text:
                        err?.response?.data?.message ||
                        "Your cart belongs to another event. Clear it?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    cancelButtonText: "No",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    reverseButtons: true
                });

                if (!result.isConfirmed) {
                    setLoadingId(null);
                    return;
                }

                Swal.fire({
                    title: "Clearing...",
                    text: "Please wait...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                await clearCart();

                Swal.close();

                Swal.fire({
                    title: "Cart Cleared",
                    text: "You can continue now.",
                    icon: "success",
                    timer: 1200,
                    showConfirmButton: false
                });
            }

            console.log("Decrease addon error:", err);

        } finally {
            setLoadingId(null);
        }
    };

    const increasePackage = async (pkg) => {
        const packageId = pkg?.id;
        if (!packageId) return;
        const packageLimit = pkg?.package_limit;

        const inCart = cart.reduce((total, item) => {
            if (item.item_type == "package" && item.uniqueId == packageId) {
                return total + (item.count || 0);
            }
            return total;
        }, 0);

        // 🚫 PACKAGE LIMIT VALIDATION
        if (packageLimit > 0 && inCart >= packageLimit) {
            Swal.fire({
                icon: "warning",
                title: "Package limit reached",
                text: `You can only purchase up to ${packageLimit} of this package.`,
                confirmButtonText: "Okay",
            });
            return false; // stop further execution
        }


        try {
            setLoadingId(`package-${packageId}`);

            const existing = cart.find(
                item => item.item_type == "package" && item.uniqueId == packageId
            );

            const currentCount = existing?.count || 0;
            const maxLimit = pkg?.limit || pkg?.max_quantity;

            // 🚫 Limit validation
            if (maxLimit && currentCount >= maxLimit) {
                Swal.fire({
                    icon: "warning",
                    title: "Limit Reached",
                    text: `Maximum ${maxLimit} packages allowed.`
                });
                return;
            }

            if (existing) {
                await increaseCart(existing.id);
            } else {
                await addToCart({
                    event_id: finalEventId,
                    item_type: "package",
                    package_id: packageId,
                    count: 1
                });
            }

            await refreshCart(finalEventId);

        } catch (err) {

            if (err?.response?.status == 409) {
                const result = await Swal.fire({
                    title: "Items from another event found!",
                    text: err?.response?.data?.message || "Clear cart to continue?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Clear Cart",
                    reverseButtons: true
                });

                if (!result.isConfirmed) return;

                Swal.fire({ title: "Clearing Cart...", didOpen: () => Swal.showLoading() });
                await clearCart();
                Swal.close();

                await addToCart({
                    event_id: finalEventId,
                    item_type: "package",
                    package_id: packageId,
                    count: 1
                });

                await refreshCart(finalEventId);
            }

        } finally {
            setLoadingId(null);
        }
    };

    const decreasePackage = async (pkg) => {
        const packageId = pkg?.id;
        if (!packageId) return;

        // Count package in cart
        const inCart = cart.reduce((total, item) => {
            if (item.item_type == "package" && item.uniqueId == packageId) {
                return total + (item.count || 0);
            }
            return total;
        }, 0);

        // NOTHING TO DECREASE
        if (inCart <= 0) {
            Swal.fire({
                icon: "info",
                title: "Nothing to remove",
                text: "This package is not added to your cart yet.",
                confirmButtonText: "Okay",
            });
            return false;
        }

        try {
            setLoadingId(`package-${packageId}`);

            const existing = cart.find(
                item => item.item_type == "package" && item.uniqueId == packageId
            );

            if (!existing) return;

            if (existing.count > 1) {
                await decreaseCart(existing.id);
            } else {
                await deleteCart(existing.id);
            }

            await refreshCart(eventId);

        } catch (err) {
            console.log("Decrease package error:", err);
        } finally {
            setLoadingId(null);
        }
    };

    // Calculate Totals
    const totalTickets = cart.reduce((n, item) => n + item.count, 0);
    const sub_total = cart.reduce(
        (n, item) => n + item.count * item.ticket_price,
        0
    );
    const tax_total = (sub_total * adminFees) / 100;
    const grand_total = sub_total + tax_total;

    const formatEventDateRange = (start, end) => {
        if (!start || !end) return "";

        const startDate = new Date(start);
        const endDate = new Date(end);

        const options = { day: "2-digit", month: "short" };

        const startFormatted = startDate.toLocaleDateString("en-GB", options);
        const endFormatted = endDate.toLocaleDateString("en-GB", {
            ...options,
            year: "numeric",
        });

        return `${startFormatted} – ${endFormatted}`;
    };

    const [showFullDesc, setShowFullDesc] = useState(false);
    const [payLoading, setPayLoading] = useState(false);

    const handlePayNow = async () => {
        if (payLoading) return; // Prevent double click
        // setPayLoading(true);
        setShowNextStep(true);
        return
        try {
            // const res = await api.post("/api/v1/orders/create", {
            //     event_id: finalEventId,
            //     total_amount: grand_total,
            //     payment_method: "Online"
            // });
            handleClose(false)

            // SUCCESS POPUP
            // Swal.fire({
            //     icon: "success",
            //     title: "Order Created!",
            //     text: res?.data?.message || "Your order has been created successfully.",
            //     confirmButtonText: "OK",
            // });

            // console.log("Order created:", res.data);

            // await refreshCart(finalEventId || undefined);

            // OPTIONAL: redirect to payment page
            // navigate("/payment");
        } catch (error) {
            handleClose(false)

            // ERROR POPUP
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "Something went wrong while creating the order.",
                confirmButtonText: "Close",
            });

            console.error("Order create error:", error);

        } finally {
            setPayLoading(false);
            handleClose(false)

        }
    };

    const formatReadableDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleDeleteItem = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This item will be removed from your cart.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, remove it",
            cancelButtonText: "Cancel"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteCart(id); // your API function
                await refreshCart(finalEventId || undefined);

                Swal.fire({
                    icon: "success",
                    title: "Removed!",
                    text: "The item has been deleted from your cart."
                });
            }
        });
    };

    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const handlePurchase = async (event) => {
        event.preventDefault();
        setIsBtnLoading(true);
        setTimeout(() => {
            setShowNextStep(true);
            setIsBtnLoading(false);
        }, 1000);
    };

    const Counter = ({ count = 0, onInc, onDec, loading }) => {
        if (loading) return <Spinner size="sm" />;

        return (
            <div className="d-flex align-items-center counter-btn">
                <button className="btn btn-sm text-white" onClick={onDec}>–</button>

                <span className="mx-2 text-white" style={{
                    fontSize: "11px",
                    width: "20px",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                }}>
                    {count}
                </span>

                <button className="btn btn-sm text-white" onClick={onInc}>+</button>
            </div>
        );
    };

    // Store selected committee member per ticket
    const [selectedMembers, setSelectedMembers] = useState({});

    const requestCommitteeTicket = async (ticket, selectedMember) => {

        // 1️⃣ Prepare question answers
        const questionAnswers = buildQuestionAnswers(ticket.id);

        try {
            Swal.fire({
                title: "Requesting ticket...",
                text: "Please wait",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            const cartData = {
                event_id: finalEventId,
                item_type: "committesale",
                ticket_id: ticket.id,
                count: 1,
                committee_member_id: selectedMember.id,
                questionAnswers
            };
            const response = await api.post("/api/v1/cart/add", cartData);
            Swal.close();
            if (response?.data?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Request Sent",
                    text: "Committee ticket request sent successfully"
                });
            }
        } catch (error) {
            Swal.close();
            const errorMessage =
                error?.response?.data?.error?.message ||
                "Something went wrong";
            Swal.fire({
                icon: "error",
                title: "Request Failed",
                text: errorMessage
            });

            console.log("Committee Request Error:", error);
            return false;
        }
    };

    const [ticketAnswers, setTicketAnswers] = useState({});

    const handleQuestionChange = (ticketId, questionId, value) => {
        setTicketAnswers(prev => {
            const tId = String(ticketId);
            const qId = String(questionId);

            // If empty → remove question answer
            if (typeof value == "string" && value.trim() == "") {
                const updatedTicket = { ...(prev[tId] || {}) };
                delete updatedTicket[qId];

                // If no questions left → remove ticket object
                if (Object.keys(updatedTicket).length == 0) {
                    const updatedState = { ...prev };
                    delete updatedState[tId];
                    return updatedState;
                }

                return {
                    ...prev,
                    [tId]: updatedTicket
                };
            }

            // Normal set
            return {
                ...prev,
                [tId]: {
                    ...prev[tId],
                    [qId]: value
                }
            };
        });
    };

    const validateTicketQuestions = (ticketId, ticketQuestions) => {

        const missingQuestions = [];

        for (let q of ticketQuestions) {
            const answer =
                ticketAnswers?.[String(ticketId)]?.[String(q.id)];

            if (
                answer == undefined ||
                answer == null ||
                (typeof answer == "string" && answer.trim() == "")
            ) {
                missingQuestions.push(q.question);
            }
        }

        if (missingQuestions.length > 0) {
            return {
                valid: false,
                message: `Please answer the following questions:\n\n• ${missingQuestions.join("\n• ")}`
            };
        }

        return { valid: true };
    };

    const buildQuestionAnswers = (ticketId) => {
        const answersObj = ticketAnswers?.[String(ticketId)] || {};

        return Object.entries(answersObj).map(([questionId, answer]) => ({
            question_id: Number(questionId),
            answer: answer
        }));
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={true}
            dialogClassName="cart-modal-size cart-mdl-only"
            className="careyes-chekout-new oxmonten2025EvntSec"
        >
            {!showNextStep ? (
                <>
                    <Modal.Header>
                        <Button onClick={handleClose} className="btn-close ms-auto">
                            ×
                        </Button>
                    </Modal.Header>

                    <Modal.Body className="px-3 care-new-check">
                        <LoadingComponent isActive={isLoading} />
                        {eventData && (
                            <div className="checkout-innr">
                                <Row>
                                    {/* LEFT SIDE */}
                                    <Col lg={8}>
                                        <div className="model-left-content">

                                            <div className="cart-mdl-innercontent">
                                                <Row className="align-items-start">

                                                    {/* EVENT IMAGE BIG SIZE */}
                                                    <Col md={5}>
                                                        <h2 className="cart-mdl-title">{eventData.name}</h2>
                                                        <div className="cartmdl-left-img" style={{ textAlign: "center" }}>
                                                            <Image
                                                                src={eventData.feat_image}
                                                                alt={eventData.name}
                                                                width={380}
                                                                height={380}
                                                                className="firstDayEvent"
                                                                style={{
                                                                    borderRadius: "12px",
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover"
                                                                }}
                                                            />


                                                        </div>
                                                        <div className="event-crt-deta mt-2 text-center">
                                                            <strong className="mdl-event-name">
                                                                {eventData.location}
                                                            </strong>

                                                            <p
                                                                className="badge rounded-pill border text-wrap px-3 py-2 mt-1"
                                                                style={{
                                                                    backgroundColor: "#fdf7ff",
                                                                    color: "black",
                                                                    borderColor: "rgba(96,14,125,.25)",
                                                                    boxShadow: "0px 6px 7px -8px #000"
                                                                }}
                                                            >
                                                                {formatEventDateRange(
                                                                    eventData.date_from?.local,
                                                                    eventData.date_to?.local
                                                                )}
                                                            </p>

                                                        </div>
                                                    </Col>

                                                    <Col md={7}>
                                                    <h5 className="mb-3">Available Tickets</h5>
                                                        {(eventData.tickets?.length > 0 || eventData.addons?.length > 0 || eventData.slots?.length > 0) && (
                                                            <div className="ticket-section">
                                                                {/* 📦 PACKAGES */}
                                                                {eventData.package
                                                                    ?.filter(pkg => pkg.hidden != "Y" && pkg.status == "Y")
                                                                    .map((pkg, i) => (
                                                                        <div
                                                                            key={`package-${i}`}
                                                                            className="ticket-item only-ticket package-box"
                                                                            style={{

                                                                                borderRadius: "8px",
                                                                                padding: "20px 16px",
                                                                                marginBottom: "12px",
                                                                                background: "#ffffffff",
                                                                                borderTop: "none",
                                                                                borderRight: "none",
                                                                                borderBottom: "none"
                                                                            }}
                                                                        >

                                                                            {/* HEADER */}
                                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                                <div>
                                                                                    <strong style={{ fontSize: "16px" }}>
                                                                                        {pkg.name}
                                                                                        <span
                                                                                            style={{
                                                                                                marginLeft: 8,
                                                                                                fontSize: 10,
                                                                                                padding: "4px 9px",
                                                                                                background: "#2ec2b3",
                                                                                                color: "#fff",
                                                                                                borderRadius: 4
                                                                                            }}
                                                                                        >
                                                                                            PACKAGE
                                                                                        </span>
                                                                                    </strong>

                                                                                    {/* <div className="text-muted text-13 mt-1">
                                                                                        Limit: {pkg.package_limit}
                                                                                    </div> */}
                                                                                </div>

                                                                                <div className="text-end">
                                                                                    <div style={{ fontSize: 14 }}>
                                                                                        Total: <strong>{currencySymbol}{formatPrice(pkg.total)}</strong>
                                                                                    </div>

                                                                                    {pkg.discount_amt > 0 && (
                                                                                        <div
                                                                                            className="text-13 fw-bold"
                                                                                            style={{
                                                                                                color: "#2ec2b3",
                                                                                                background: "transparent"
                                                                                            }}
                                                                                        >
                                                                                            Discount: −{currencySymbol}{formatPrice(pkg.discount_amt)}
                                                                                        </div>
                                                                                    )}

                                                                                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                                                                                        Pay: {currencySymbol}{formatPrice(pkg.grandtotal)}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* PACKAGE ITEMS */}
                                                                            <div className="mt-2">
                                                                                {pkg.details.map((item, idx) => (
                                                                                    <div
                                                                                        key={idx}
                                                                                        className="d-flex justify-content-between align-items-center py-1"
                                                                                        style={{ fontSize: 14 }}
                                                                                    >
                                                                                        <div className="text-dark" style={{ fontSize: "13px" }}>
                                                                                            {item.ticketType && (
                                                                                                <>
                                                                                                    {/* Ticket SVG Icon */}
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="17"
                                                                                                        height="17"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="#2ec2b3"
                                                                                                        strokeWidth="1.8"
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                        style={{ verticalAlign: "middle", marginRight: "4px" }}
                                                                                                    >
                                                                                                        <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7z" />
                                                                                                        <line x1="12" y1="5" x2="12" y2="19" strokeDasharray="2 2" />
                                                                                                    </svg>

                                                                                                    {item.ticketType.title}
                                                                                                    <span className="text-muted"> × {item.qty}</span>
                                                                                                </>
                                                                                            )}

                                                                                            {item.addonType && (
                                                                                                <>
                                                                                                    {/* Plus SVG Icon */}
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="17"
                                                                                                        height="17"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="#2ec2b3"
                                                                                                        strokeWidth="2"
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                        style={{ verticalAlign: "middle", margin: "0 4px 0 0px" }}
                                                                                                    >
                                                                                                        <path d="M12 5v14" />
                                                                                                        <path d="M5 12h14" />
                                                                                                    </svg>

                                                                                                    {item.addonType.name}
                                                                                                    <span className="text-muted"> × {item.qty}</span>
                                                                                                </>
                                                                                            )}
                                                                                        </div>


                                                                                        <div className="text-muted">
                                                                                            {currencySymbol}
                                                                                            {formatPrice(
                                                                                                (item.ticketType?.price || item.addonType?.price || 0) * item.qty
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>

                                                                            {/* ACTION */}
                                                                            <div className="text-end mt-3 d-flex justify-content-end">

                                                                                <Counter
                                                                                    count={
                                                                                        cart.find(
                                                                                            item => item.item_type == "package" && item.uniqueId == pkg.id
                                                                                        )?.count || 0
                                                                                    }
                                                                                    loading={loadingId == `package-${pkg.id}`}
                                                                                    onInc={() => increasePackage(pkg)}
                                                                                    onDec={() => decreasePackage(pkg)}
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                    ))}


                                                                {/* 🎟️ TICKETS */}
                                                                {eventData.tickets
                                                                    ?.filter(ticket => ticket.hidden != "Y")
                                                                    .map((ticket, i) => {
                                                                        const cartItem = normalCart.find(item => item.uniqueId == ticket.id);
                                                                        const isLoading = loadingId == ticket.id;
                                                                        const isSoldOut = ticket.sold_out == "Y";
                                                                        const isCommittee = ticket.type == "committee_sales";
                                                                        const committeeStatus = ticket.committee_status || null;

                                                                        // console.log('ticket.committeeAssignedTickets :', ticket.committeeAssignedTickets);
                                                                        const committeeMembers = isCommittee
                                                                        ? ticket.committeeAssignedTickets
                                                                        ?.filter(ct =>
                                                                                    ct.status == "Y" &&
                                                                                    ct.committeeMember?.status == "Y" &&
                                                                                    ct.committeeMember?.user
                                                                                )
                                                                                ?.map(ct => ({
                                                                                    id: ct.committeeMember.user.id,
                                                                                    name: `${ct.committeeMember.user.first_name} ${ct.committeeMember.user.last_name}`.trim(),
                                                                                    email: ct.committeeMember.user.email
                                                                                })) || []
                                                                            : [];
                                                                            
                                                                            // console.log('committeeMembers :', committeeMembers);
                                                                        // ✅ Filter questions that belong to this ticket
                                                                        const ticketQuestions = eventData.questions?.filter(q =>
                                                                            q.ticket_type_id
                                                                                .split(",")
                                                                                .map(id => id.trim())
                                                                                .includes(ticket.id.toString())
                                                                        ) || [];

                                                                        return (
                                                                            <div
                                                                                key={`ticket-${i}`}
                                                                                className={`ticket-item only-ticket ${isCommittee ? "committee-ticket" : ""}`}
                                                                                style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 15px" }}
                                                                            >
                                                                                <div className="d-flex justify-content-between align-items-start ticket-infobox">
                                                                                    {/* LEFT INFO */}
                                                                                    <div className="ticket-info" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                                                        <strong style={{ fontSize: "15px" }}>
                                                                                            {ticket.title}
                                                                                            {isCommittee && <span className="ticket-type-badge committee">COMMITTEE</span>}
                                                                                        </strong>
                                                                                        <p className="mt-1 mb-0">Base Price: {currencySymbol}{formatPrice(ticket.price)}</p>

                                                                                        {isCommittee && committeeStatus == null && (
                                                                                            <select
                                                                                                className="form-select"
                                                                                                style={{ height: "auto", borderRadius: "5px" }}
                                                                                                value={selectedMembers[ticket.id]?.id || ""}
                                                                                                onChange={(e) => {
                                                                                                    const member = committeeMembers.find(m => m.id == e.target.value);
                                                                                                    setSelectedMembers(prev => ({
                                                                                                        ...prev,
                                                                                                        [ticket.id]: member
                                                                                                    }));
                                                                                                }}
                                                                                            >
                                                                                                <option value="">Select Member</option>
                                                                                                {committeeMembers.map(member => (
                                                                                                    <option key={member.id} value={member.id}>
                                                                                                        {member.name}
                                                                                                    </option>
                                                                                                ))}
                                                                                            </select>
                                                                                        )}
                                                                                    </div>

                                                                                    {/* RIGHT ACTION */}
                                                                                    {isSoldOut ? (
                                                                                        <div className="sold-out-box">Sold Out</div>
                                                                                    ) : isCommittee ? (
                                                                                        committeeStatus == "approved" ? (
                                                                                            <Counter
                                                                                                count={cartItem?.count || 0}
                                                                                                loading={isLoading}
                                                                                                onInc={() => increaseTicket(ticket)}
                                                                                                onDec={() => decreaseTicket(ticket)}
                                                                                            />
                                                                                        ) : committeeStatus == "pending" ? (
                                                                                            <div className="committee-status pending">Request Sent</div>
                                                                                        ) : committeeStatus == "rejected" ? (
                                                                                            <div className="committee-status rejected">Rejected</div>
                                                                                        ) : (
                                                                                            selectedMembers[ticket.id] && (
                                                                                                <button
                                                                                                    className="btn btn-sm primery-button"
                                                                                                    onClick={() => {

                                                                                                        const validation = validateTicketQuestions(ticket.id, ticketQuestions);

                                                                                                        if (!validation.valid) {
                                                                                                            Swal.fire({
                                                                                                                icon: "warning",
                                                                                                                title: "Incomplete Information",
                                                                                                                text: validation.message
                                                                                                            });
                                                                                                            return;
                                                                                                        }

                                                                                                        requestCommitteeTicket(ticket, selectedMembers[ticket.id]);
                                                                                                    }}

                                                                                                >
                                                                                                    Request
                                                                                                </button>


                                                                                            )
                                                                                        )
                                                                                    ) : (
                                                                                        <Counter
                                                                                            count={cartItem?.count || 0}
                                                                                            loading={isLoading}
                                                                                            onInc={() => {
                                                                                                const validation = validateTicketQuestions(ticket.id, ticketQuestions);
                                                                                                if (!validation.valid) {
                                                                                                    Swal.fire({
                                                                                                        icon: "warning",
                                                                                                        title: "Incomplete Information",
                                                                                                        text: validation.message,
                                                                                                    });
                                                                                                    return;
                                                                                                }
                                                                                                increaseTicket(ticket);
                                                                                            }}
                                                                                            onDec={() => decreaseTicket(ticket)}
                                                                                        />
                                                                                    )}
                                                                                </div>

                                                                                {/* 🎯 Questions for this ticket only */}
                                                                                {ticketQuestions.map(q => (
                                                                                    <div key={q.id} className="ticket-question" style={{ marginTop: "5px" }}>
                                                                                        {/* ✅ Question Label */}
                                                                                        <label style={{ fontWeight: 500 }}>{q.question}</label>

                                                                                        {/* 🎯 Agree → Yes / No */}
                                                                                        {q.type == "Agree" && (
                                                                                            <div>
                                                                                                <label style={{ marginRight: "10px" }}>
                                                                                                    <input
                                                                                                        type="radio"
                                                                                                        name={`q_${ticket.id}_${q.id}`}
                                                                                                        value="Y"
                                                                                                        checked={ticketAnswers?.[ticket.id]?.[q.id] == "Y"}
                                                                                                        onChange={(e) => handleQuestionChange(ticket.id, q.id, e.target.value)}
                                                                                                    /> Yes
                                                                                                </label>
                                                                                                <label>
                                                                                                    <input
                                                                                                        type="radio"
                                                                                                        name={`q_${ticket.id}_${q.id}`}
                                                                                                        value="N"
                                                                                                        checked={ticketAnswers?.[ticket.id]?.[q.id] == "N"}
                                                                                                        onChange={(e) => handleQuestionChange(ticket.id, q.id, e.target.value)}
                                                                                                    /> No
                                                                                                </label>
                                                                                            </div>
                                                                                        )}

                                                                                        {/* 🎯 Select → Dropdown */}
                                                                                        {q.type == "Select" && (
                                                                                            <select
                                                                                                className="form-select"
                                                                                                style={{ height: "auto", borderRadius: "5px" }}
                                                                                                value={ticketAnswers?.[ticket.id]?.[q.id] || ""}
                                                                                                onChange={(e) => handleQuestionChange(ticket.id, q.id, e.target.value)}
                                                                                            >
                                                                                                <option value="">Select</option>
                                                                                                {q.questionItems.map(item => (
                                                                                                    <option key={item.id} value={item.items}>
                                                                                                        {item.items}
                                                                                                    </option>
                                                                                                ))}
                                                                                            </select>
                                                                                        )}

                                                                                        {/* 🎯 Text → Input */}
                                                                                        {q.type == "Text" && (
                                                                                            <input
                                                                                                type="text"
                                                                                                className="form-control"
                                                                                                placeholder={`Type your answer`}
                                                                                                value={ticketAnswers?.[ticket.id]?.[q.id] || ""}
                                                                                                onChange={(e) => handleQuestionChange(ticket.id, q.id, e.target.value)}
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        );
                                                                    })}

                                                                {/* ➕ ADDONS */}
                                                                {eventData.addons
                                                                    ?.filter(addon => addon.hidden !== "Y")
                                                                    .map((addon, i) => {
                                                                        const cartItem = addonCart.find(item => item.uniqueId == addon.id);
                                                                        const isLoading = loadingId == addon.id;
                                                                        const isSoldOut = addon.sold_out == "Y";

                                                                        return (
                                                                            <div key={`addon-${i}`} className="ticket-item only-ticket ticket-addon">
                                                                                <div className="d-flex justify-content-between align-items-start ticket-infobox">
                                                                                    <div className="ticket-info">
                                                                                        <strong style={{ fontSize: "15px" }}>{addon.name} <span className="addon-badge">ADDON</span></strong>
                                                                                        <p className="mt-2">Price: {currencySymbol}{formatPrice(addon.price)}</p>
                                                                                    </div>
                                                                                    {isSoldOut ? (
                                                                                        <div className="sold-out-box">Sold Out</div>
                                                                                    ) : (
                                                                                        <Counter
                                                                                            count={cartItem?.count || 0}
                                                                                            loading={isLoading}
                                                                                            onInc={() => increaseAddon(addon)}
                                                                                            onDec={() => decreaseAddon(addon)}
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}

                                                                {/* ⏰ SLOTS */}
                                                                {eventData.slots
                                                                    ?.filter(slot => slot.hidden !== "Y")
                                                                    .map((slot, i) => {
                                                                        const pricingId = slot.pricings?.[0]?.id;
                                                                        const cartItem = slotCart.find(item => item.uniqueId == pricingId);
                                                                        const isLoading = loadingId == pricingId;
                                                                        const isSoldOut = slot.sold_out == "Y";

                                                                        return (
                                                                            <div key={`slot-${i}`} className="ticket-item only-ticket">
                                                                                <div className="d-flex justify-content-between align-items-start ticket-infobox">
                                                                                    <div className="ticket-info">
                                                                                        <strong>{slot.slot_name}</strong>
                                                                                        <p className="mt-2">{formatReadableDate(slot.slot_date)} | {slot.start_time} - {slot.end_time}</p>
                                                                                    </div>
                                                                                    {isSoldOut ? (
                                                                                        <div className="sold-out-box">Sold Out</div>
                                                                                    ) : (
                                                                                        <Counter
                                                                                            count={cartItem?.count || 0}
                                                                                            loading={isLoading}
                                                                                            onInc={() => increaseSlot(slot)}
                                                                                            onDec={() => decreaseSlot(slot)}
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}

                                                            </div>

                                                        )}
                                                    </Col>
                                                </Row>
                                            </div>

                                        </div>
                                    </Col>

                                    {/* RIGHT SIDE (CART SUMMARY) */}

                                    <Col lg={4}>
                                        {cart?.length > 0 ? (
                                            <div className="chackout-box">
                                                <h2>Checkout</h2>
                                                <div className="monte25-tct-purcs">
                                                    <h6>YOUR TICKETS</h6>

                                                    {cart.map((item) => {
                                                        const itemPrice = Number(item.ticket_price || 0);
                                                        const itemTotal = item.count * itemPrice;

                                                        return (
                                                            <div key={item.id} className="chackout-detabox mb-3">
                                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                                    <strong>{item.display_name}</strong>

                                                                    <button
                                                                        className="btn btn-sm delete-btn"
                                                                        onClick={() => handleDeleteItem(item.id)}
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                </div>

                                                                <div className="d-flex justify-content-between">
                                                                    <p className="mb-0">
                                                                        {item.count} × {currencySymbol} {formatPrice(itemPrice)}
                                                                    </p>

                                                                    <p className="mb-0">{currencySymbol} {formatPrice(itemTotal)}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}


                                                    <h6 className="mt-4 fw-bold">
                                                        TOTAL {totalTickets} ITEM{totalTickets > 1 ? "S" : ""}
                                                    </h6>

                                                    <div className="apply-cd my-3">
                                                        <InputGroup>
                                                            <input
                                                                type="text"
                                                                placeholder="Promo code"
                                                                className="form-control"
                                                            />
                                                        </InputGroup>
                                                    </div>

                                                    <div className="tickt-ttl-prs">
                                                        <div className="d-flex justify-content-between mb-3 pb-3 border-bottom border-dark">
                                                            <p className="mb-0 fw-bold">PRICE</p>
                                                            <span>{currencySymbol}{formatPrice(sub_total)}</span>
                                                        </div>

                                                        <div className="d-flex justify-content-between mb-3 pb-3 border-bottom border-dark">
                                                            <p className="mb-0 fw-bold">FEES ({adminFees}%)</p>
                                                            <span>{currencySymbol}{formatPrice(tax_total)}</span>
                                                        </div>

                                                        <div className="d-flex justify-content-between total mb-3 pb-3 border-bottom border-dark">
                                                            <p className="mb-0 fw-bold">TOTAL</p>
                                                            <p>{currencySymbol}{formatPrice(grand_total)}</p>
                                                        </div>
                                                    </div>

                                                    {/* PAY NOW BUTTON */}

                                                    {grand_total > 0 && (
                                                        <div className="by-nw-btn accomofl-ck-bt">
                                                            <Button
                                                                variant=""
                                                                className="btn"
                                                                type="submit"
                                                                disabled={isBtnLoading}
                                                                style={{
                                                                    backgroundColor: "rgb(223, 59, 103)",
                                                                    color: "white",
                                                                    borderRadius: "30px",
                                                                    padding: "10px 24px",
                                                                    fontWeight: "600",
                                                                    border: "none",
                                                                    width: "50%",
                                                                    display: "block",
                                                                    margin: "20px auto 0",
                                                                    opacity: isBtnLoading ? 0.7 : 1,
                                                                    cursor: isBtnLoading ? "not-allowed" : "pointer"
                                                                }}
                                                                onClick={(e) => {
                                                                    if (isBtnLoading) return;

                                                                    if (grand_total == 0) {
                                                                        e.preventDefault();
                                                                        handleFreeTicket();
                                                                    } else {
                                                                        handlePurchase(e);
                                                                    }
                                                                }}
                                                            >
                                                                {isBtnLoading ? (
                                                                    <>
                                                                        <span
                                                                            className="spinner-border spinner-border-sm me-2"
                                                                            role="status"
                                                                            aria-hidden="true"
                                                                        />
                                                                        Processing...
                                                                    </>
                                                                ) : grand_total == 0 ? (
                                                                    "FREE TICKET"
                                                                ) : (
                                                                    "PURCHASE"
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                        ) : (
                                            <div className="chackout-box">
                                                <h3 className="text-center mt-2">Cart is Empty</h3>
                                            </div>
                                        )}
                                    </Col>

                                </Row>
                            </div>
                        )}
                    </Modal.Body>
                </>
            ) : (
                <CheckoutForm
                    eventId={finalEventId}
                    handleModalClose={handleClose}
                    showNextStep={setShowNextStep}
                    adminFees={adminFees}
                    couponDetails={null}
                    sub_total={sub_total}
                    tax_total={tax_total}
                    grand_total={grand_total}
                />
            )
            }

        </Modal >
    );
}