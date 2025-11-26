import { jwtDecode } from "jwt-decode";
import axios from "./axios";

/**
 * Checks if the provided JWT token is valid (not expired).
 *
 * @param {string} authToken - The JWT token to validate.
 * @returns {boolean} - Returns `true` if the token is valid, otherwise `false`.
 */
export const isTokenValid = (authToken) => {
  if (!authToken || typeof authToken !== "string" || authToken.split(".").length !== 3) {
    // Jangan log error jika token kosong
    if (authToken) {
      console.error("Invalid token format (missing parts).");
    }
    return false;
  }

  try {
    const decoded = jwtDecode(authToken);
    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return false;
  }
};



/**
 * Sets or removes the authentication token in local storage and axios headers.
 *
 * @param {string} [authToken] - The JWT token to set. If `undefined` or `null`, the session will be cleared.
 */
export const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("authToken", accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common.Authorization;
  }
};



