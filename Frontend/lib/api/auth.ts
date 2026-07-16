import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const register = async (data: any) => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.REGISTER, data); // path, data
        return response.data; // reponse ko body
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Registration failed');
        // error?.response?.data -> response ko body
    }
}

export const login = async (data: any) => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.LOGIN, data); // path, data
        return response.data; // reponse ko body
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Login failed');
    }
}

export const loginWithGoogle = async (idToken: string) => {
    try {
        const response = await axiosInstance.post(API.AUTH.GOOGLE, { idToken });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Google sign-in failed");
    }
}

export const hospitalLogin = async (data: { email: string; password: string }) => {
    try {
        const response = await axiosInstance.post(API.AUTH.HOSPITAL_LOGIN, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Hospital login failed");
    }
}

export const requestPasswordReset = async (email: string) => {
    try {
        const response = await axiosInstance.post(API.AUTH.PASSWORD_RESET_REQUEST, { email });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Unable to send a verification code");
    }
}

export const verifyPasswordResetCode = async (email: string, code: string) => {
    try {
        const response = await axiosInstance.post(API.AUTH.PASSWORD_RESET_VERIFY, { email, code });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Invalid verification code");
    }
}

export const confirmPasswordReset = async (email: string, code: string, newPassword: string) => {
    try {
        const response = await axiosInstance.post(API.AUTH.PASSWORD_RESET_CONFIRM, { email, code, newPassword });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || "Unable to reset password");
    }
}
