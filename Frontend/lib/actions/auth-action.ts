"use server"; // server side api call
import { register, login } from "@/lib/api/auth";
import { LoginFormData, RegisterFormData } from "@/app/(auth)/Component/schema";
import { setTokenCookie, storeUserData } from "@/lib/cookies";

export const handleRegisterUser = async (data: RegisterFormData) => {
    try{
        const result = await register(data);
        if (result && result.user) {
            return { success: true, message: result.message || 'Registration successful', data: result.user }; 
        } else {
            return { success: false, message: result.message || 'Registration failed' };    
        }
    }catch (error: Error | any){
        return { success: false, message: error?.message || 'Registration failed' };    
    }
}

export const handleLoginUser = async (data: LoginFormData) => {
    try{
        const result = await login(data);
        if (result && result.token) {
            const user = result.user;
            const token = result.token;
            await setTokenCookie(token);
            await storeUserData(user);
            return { success: true, message: 'Login successful', data: result }; 
        } else {
            return { success: false, message: 'Login failed: Invalid server response' };    
        }
    }catch (error: Error | any){
        return { success: false, message: error?.message || 'Login failed' };    
    }
}