// src/app/contexts/auth/Provider.jsx
import {useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import isObject from "lodash/isObject";
import isString from "lodash/isString";
import axios from "utils/axios"; // pastikan axios sudah set baseURL
import { setSession } from "utils/jwt";
import api from "configs/api.config"; // import api.config.js
import AuthContext from "./authContext";

// --- State awal AuthContext ---
const initialState = {
  isAuthenticated: false, // status login user
  isLoading: false,       // status loading saat login/logout
  isInitialized: false,   // status inisialisasi AuthProvider (cek token)
  errorMessage: null,     // pesan error login
  user: null,             // data user yang login
};

// --- Reducer handlers: mengatur state berdasarkan action ---
const reducerHandlers = {
  INITIALIZE: (state, action) => ({
    ...state,
    isAuthenticated: action.payload.isAuthenticated,
    isInitialized: true,
    user: action.payload.user,
  }),
  LOGIN_REQUEST: (state) => ({ ...state, isLoading: true }),
  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    user: action.payload.user,
    errorMessage: null,
  }),
  LOGIN_ERROR: (state, action) => ({
    ...state,
    isLoading: false,
    errorMessage: action.payload.errorMessage,
  }),
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

// --- Reducer utama untuk useReducer ---
const reducer = (state, action) => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

// --- AuthProvider: membungkus aplikasi untuk memberikan state Auth ---
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      // 🔄 Inisialisasi AuthProvider: cek token di localStorage
      try {
        const authToken = localStorage.getItem("authToken");

        if (authToken) {
          setSession(authToken);

          // 🔑 Ambil data profile user dari API baru (api.auth.profile)
          const response = await axios.get(api.auth.profile);
          const user = response.data?.data || response.data;

          if (isObject(user)) {
            dispatch({
              type: "INITIALIZE",
              payload: { isAuthenticated: true, user },
            });
          } else {
            console.warn("⚠️ User data invalid → clearing session...");
            setSession(null);
            localStorage.removeItem("authToken");
            dispatch({
              type: "INITIALIZE",
              payload: { isAuthenticated: false, user: null },
            });
          }
        } else {
          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (err) {
        console.error("🚨 INIT error:", err);
        setSession(null);
        localStorage.removeItem("authToken");
        dispatch({
          type: "INITIALIZE",
          payload: { isAuthenticated: false, user: null },
        });
      }
    };

    init();
  }, []);

  // --- Fungsi login menggunakan API baru ---
  const login = async ({ email, password }) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      const response = await axios.post(api.auth.login, { email, password });
      const { user, token } = response.data;

      if (!isString(token) || !isObject(user)) {
        throw new Error("Invalid response format from login");
      }

      setSession(token);
      localStorage.setItem("authToken", token);

      dispatch({ type: "LOGIN_SUCCESS", payload: { user } });
    } catch (err) {
      console.error("❌ Login error:", err);
      dispatch({
        type: "LOGIN_ERROR",
        payload: { errorMessage: err?.message || "Login failed" },
      });
    }
  };

  // --- Fungsi logout ---
  const logout = () => {
    setSession(null);
    localStorage.removeItem("authToken");
    dispatch({ type: "LOGOUT" });
    window.location.reload();
  };

  if (!state.isInitialized) {
    return null; // ⏳ Menunggu init selesai
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
