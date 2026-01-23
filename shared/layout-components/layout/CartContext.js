import { createContext, useContext, useEffect, useState } from "react";
import api from "@/utils/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [eventData, setEventData] = useState(null);
    const [loadingCart, setLoadingCart] = useState(true);
    const [slotCart, setSlotCart] = useState([]);
    const [normalCart, setNormalCart] = useState([]);
    const [addonCart, setAddonCart] = useState([]);
    const [eventId, setEventId] = useState(null);
    const [loginUserId, setLoginUserId] = useState(null);
    const [charges, setCharges] = useState({});

    /* NEW: COMMITTEE STATES */
    const [committeeAssigned, setCommitteeAssigned] = useState(false);
    const [committeePendingCount, setCommitteePendingCount] = useState(0);

    // MAIN CART LOADER (Uses internal eventId when nothing passed)
    const fetchCart = async (passedEventId = null) => {
        try {
            setLoadingCart(true);
            const token = localStorage.getItem("userAuthToken");
            if (!token) {
                setLoadingCart(false);
                return;
            }

            const finalEventId = passedEventId ?? eventId;
            const query = finalEventId ? `?event_id=${finalEventId}` : "";
            const res = await api.get(`/api/v1/cart/list${query}`);
            const data = res?.data?.data || {};

            const charges = data?.charges;

            const userInfoId = data?.user_id;
            const event = data.event || null;
            const cartItems = data.cart || [];
            setCharges(charges);

            /* 🔥 COMMITTEE DATA */
            const committee = data?.committee || {};
            setCommitteeAssigned(!!committee.assigned);
            setCommitteePendingCount(Number(committee.pending_count || 0));

            setLoginUserId(userInfoId);

            // Save event + items
            setEventData(event);
            setCart(cartItems);
            setCartCount(cartItems.length);

            // Slot Tickets
            setSlotCart(
                cartItems
                    .filter(c => c.item_type == "ticket_price")
                    .map(c => ({
                        cartId: c.id,
                        uniqueId: c.uniqueId,
                        count: c.count,
                    }))
            );

            // Normal Tickets
            setNormalCart(
                cartItems
                    .filter(c => c.item_type == "ticket")
                    .map(c => ({
                        cartId: c.id,
                        uniqueId: c.uniqueId,
                        count: c.count,
                    }))
            );

            // Normal Tickets
            setAddonCart(
                cartItems
                    .filter(c => c.item_type == "addon")
                    .map(c => ({
                        cartId: c.id,
                        uniqueId: c.uniqueId,
                        count: c.count,
                    }))
            );
        } catch (error) {
            console.log("Cart Error:", error);
        } finally {
            setLoadingCart(false);
        }
    };

    // GLOBAL CART LOAD ON APP START (No event selected)
    useEffect(() => {
        fetchCart(eventId || undefined); // load general cart (no event)
    }, []);

    return (
        <CartContext.Provider
            value={{
                cart,
                cartCount,
                eventData,
                loadingCart,
                slotCart,
                normalCart,
                addonCart,
                eventId,
                loginUserId,

                /* 🔥 COMMITTEE EXPORT */
                committeeAssigned,
                committeePendingCount,
                setCommitteeAssigned,
                setCommitteePendingCount,

                refreshCart: fetchCart, // refreshCart(eventId)
                setCart,
                setCartCount,
                setEventId, // allow components to set eventId
                charges
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
