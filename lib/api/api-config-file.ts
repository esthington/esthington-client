import axios from "axios";
import cookie from "js-cookie";

const esToken = cookie.get("esToken");

export const apiConfigFile = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_LIVE_URL
      : process.env.NEXT_PUBLIC_LOCAL_URL,

  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
    Authorization: "Bearer " + esToken,
  },
});

apiConfigFile.interceptors.request.use(
  async (config) => {
    try {
      const Token = cookie.get("esToken");
      if (Token) {
        config.headers.Authorization = `Bearer ${Token}`;
      }
      console.log("Sending Request: ", {
        url: config.url,
        method: config.method,
        data: config.data,
      });
      return config;
    } catch (error) {
      console.error("Request Interceptor Error: ", error);
      return Promise.reject(error);
    }
  },
  async (error) => {
    console.error("Request Error: ", error);
    return Promise.reject(error);
  }
);

apiConfigFile.interceptors.response.use(
  async (response) => {
    try {
      console.log("Response recieved", response);
      return response;
    } catch (error) {
      console.error("Response Interceptor Error: ", error);
      return Promise.reject(error);
    }
  },

  async (error) => {
    try {
      if (error.response?.status === 401) {
        console.warn("Unauthorized! Token may have expired.");
      }
      console.log("Response Error: ", error);

      return Promise.reject(error);
    } catch (err) {
      console.error("Error in Response Error Interceptor: ", err);
      return Promise.reject(err);
    }
  }
);
