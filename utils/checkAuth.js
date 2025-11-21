import Cookies from "js-cookie";

export const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; 
    return Date.now() < exp;
  } catch (e) {
    // console.log('>>>>>>>>>>>>>>>>',e);
    
    return false;
  }
};
