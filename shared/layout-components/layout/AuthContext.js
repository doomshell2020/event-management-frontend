import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const storedToken = Cookies.get("userAuthToken");
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (storedToken && storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                setUser(userObj); 
                setToken(storedToken);
                setIsLoggedIn(true);
            } catch (err) {
                console.error("Invalid user format:", err);
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
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

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoggedIn,
                loadingAuth,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
