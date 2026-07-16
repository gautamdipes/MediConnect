import axios from "axios";
import { showToast } from "@/components/ToastProvider";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL 
    || "http://localhost:5000";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    // A stalled API request must not leave interactive pages permanently locked.
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

const fallbackSuccessMessage = (method?: string, url?: string) => {
    const path = url?.toLowerCase() || "";
    if (path.includes("login")) return "Logged in successfully.";
    if (path.includes("register") || path.includes("signup")) return "Registration completed successfully.";
    switch (method?.toLowerCase()) {
        case "post": return "Created successfully.";
        case "put":
        case "patch": return "Changes saved successfully.";
        case "delete": return "Deleted successfully.";
        default: return "Action completed successfully.";
    }
};

axiosInstance.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toLowerCase();
        if (["post", "put", "patch", "delete"].includes(method || "")) {
            showToast(response.data?.message || fallbackSuccessMessage(method, response.config.url), "success");
        }
        return response;
    },
    (error) => {
        const method = error.config?.method?.toLowerCase();
        const message = error.response?.data?.message || error.message || "Something went wrong. Please try again.";
        if (method !== "get") showToast(message, "error");
        return Promise.reject(error);
    }
);

export default axiosInstance;
