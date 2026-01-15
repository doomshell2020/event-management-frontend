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

// export const handleAdminLogout = (router) => {
//   // Remove all cookies

//   // console.log("click log outt....")
//   // return false
//   Cookies.remove("userAuthToken");
//   Cookies.remove("adminAuthToken");
//   Cookies.remove("token");

//   // Clear everything from localStorage & sessionStorage
//   localStorage.clear();
//   sessionStorage.clear();

//   // Redirect
//   router.push("/admin/auth");
// };


export const handleAdminLogout = () => {
  const url = window.location.pathname;

  if (url.startsWith("/admin")) {
    // ✅ Clear ONLY admin data
    Cookies.remove("adminAuthToken");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminAuthToken");
    sessionStorage.removeItem("admin");

    // 🔥 Force server-side middleware to re-run
    window.location.href = "/admin/auth";
  }
};