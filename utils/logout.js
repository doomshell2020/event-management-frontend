import Cookies from "js-cookie";

export const handleLogout = (router) => {
  // Remove all cookies
  Cookies.remove("userAuthToken");
  Cookies.remove("adminAuthToken");
  Cookies.remove("token");

  // Clear everything from localStorage & sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // Redirect
  router.push("/login");
};

export const handleAdminLogout = (router) => {
  // Remove all cookies



  // console.log("click log outt....")
  // return false
  Cookies.remove("userAuthToken");
  Cookies.remove("adminAuthToken");
  Cookies.remove("token");

  // Clear everything from localStorage & sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // Redirect
  router.push("/admin/auth");
};
