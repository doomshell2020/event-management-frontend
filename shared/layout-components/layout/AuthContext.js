import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [adminToken, setAdminToken] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // useEffect(() => {
    //     const storedToken = Cookies.get("userAuthToken");
    //     const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    //         // 🔹 ADMIN AUTH
    //         const storedAdminToken = Cookies.get("adminAuthToken");
    //         const storedAdmin = localStorage.getItem("admin");

    //     if (storedToken && storedUser) {
    //         try {
    //             const userObj = JSON.parse(storedUser);
    //             setUser(userObj);         // 👉 Correct user set
    //             setToken(storedToken);    // 👉 Correct token set
    //             setIsLoggedIn(true);
    //         } catch (err) {
    //             console.error("Invalid user format:", err);
    //             setIsLoggedIn(false);
    //         }
    //         if (storedAdminToken && storedAdmin) {
    //             try {
    //                 setAdmin(JSON.parse(storedAdmin));
    //                 setAdminToken(storedAdminToken);
    //             } catch (e) {
    //                 console.error("Invalid admin data");
    //             }
    //         }




    //     } else {
    //         setIsLoggedIn(false);
    //     }

    //     setLoadingAuth(false);
    // }, []);

    useEffect(() => {
        // -----------------
        // 👤 USER AUTH
        // -----------------
        const storedUserToken = Cookies.get("userAuthToken");
        const storedUser =
            localStorage.getItem("user") || sessionStorage.getItem("user");

        if (storedUserToken && storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                setUser(userObj);
                setToken(storedUserToken);
                setIsLoggedIn(true);
            } catch (err) {
                console.error("Invalid user format:", err);
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }

        // -----------------
        // 🧑‍💼 ADMIN AUTH
        // -----------------
        const storedAdminToken = Cookies.get("adminAuthToken");
        const storedAdmin = localStorage.getItem("admin");

        if (storedAdminToken && storedAdmin) {
            try {
                setAdmin(JSON.parse(storedAdmin));
                setAdminToken(storedAdminToken);
            } catch (err) {
                
                console.error("Invalid admin format:", err);
            }
        } else {
            setAdmin(null);
            setAdminToken(null);
        }

        setLoadingAuth(false);
    }, []);



    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        setIsLoggedIn(true);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("userAuthToken", authToken);
        Cookies.set("userAuthToken", authToken, {
            expires: 1, // days
            secure: process.env.NODE_ENV == "production",
            sameSite: "Strict",
            path: "/",
        });
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsLoggedIn(false);

        localStorage.removeItem("user");
        localStorage.removeItem("userAuthToken");
        Cookies.remove("userAuthToken");
    };



    // =====================
    // ADMIN LOGIN / LOGOUT
    // =====================
    const adminLogin = (adminData, token) => {
        setAdmin(adminData);
        setAdminToken(token);

        localStorage.setItem("admin", JSON.stringify(adminData));
        Cookies.set("adminAuthToken", token, {
            expires: 1,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            path: "/", // ✅ IMPORTANT
        });
    };

    const adminLogout = () => {
        setAdmin(null);
        setAdminToken(null);
        localStorage.removeItem("admin");
        Cookies.remove("adminAuthToken", { path: "/admin" });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                admin,
                adminToken,
                isLoggedIn,
                loadingAuth,
                login,
                logout,
                adminLogin,
                adminLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
