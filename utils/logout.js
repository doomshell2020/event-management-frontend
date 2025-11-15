import Cookies from "js-cookie";

export const handleLogout = (router) => {
  Cookies.remove("userAuthToken");
  Cookies.remove("adminAuthToken");
  Cookies.remove("token");

  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("loginCredentials");

  router.push("/login");
};
