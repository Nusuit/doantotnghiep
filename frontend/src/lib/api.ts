import axios from 'axios';
import { toast } from 'sonner';
import { API_BASE_API_URL } from './config';

const apiClient = axios.create({
    baseURL: API_BASE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
    const csrf = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrf_token='))
        ?.split('=')[1];
    if (csrf && config.method && config.method.toLowerCase() !== 'get') {
        config.headers['x-csrf-token'] = csrf;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        let message = error.response?.data?.error?.message || 'Something went wrong';

        // Append detailed validation issues if available
        if (error.response?.data?.error?.details) {
            const issues = error.response.data.error.details
                .map((i: any) => i.message || i.code)
                .join(', ');
            message += `: ${issues}`;
        }

        toast.error(message);
        return Promise.reject(error);
    }
);

export const api = {
    auth: {
        login: async (email: string, password: string) => {
            const { data } = await apiClient.post('/auth/login', { email, password });
            return data.data;
        },
        register: async (email: string, password: string, displayName: string) => {
            const { data } = await apiClient.post('/auth/register', { email, password, displayName });
            // Note: Register usually returns token too in this backend
            return data.data;
        },
        logout: () => {
            return apiClient.post('/auth/logout').finally(() => {
                window.location.href = '/auth';
            });
        },
        me: async () => {
            const { data } = await apiClient.get('/auth/me');
            return data.data;
        },
        verifyEmailOtp: async (email: string, otpCode: string) => {
            const { data } = await apiClient.post('/auth/verify-email-otp', { email, otpCode });
            return data.data;
        },
        verifyEmail: async (email: string, token: string) => {
            const { data } = await apiClient.post('/auth/verify-email', { email, token });
            return data.data;
        },
        resendEmailOtp: async (email: string) => {
            const { data } = await apiClient.post('/auth/resend-email-otp', { email });
            return data.data;
        }
    },
    posts: {
        create: async (title, content, category = "ABSTRACT_TOPIC", contexts = []) => {
            // Default mock context if none provided, to pass validation
            const finalContexts = contexts.length > 0 ? contexts : [
                { type: 'TOPIC', name: 'General Knowledge' }
            ];

            const { data } = await apiClient.post('/articles', {
                title,
                content,
                category, // Must be slug e.g. "ABSTRACT_TOPIC"
                contexts: finalContexts
            });
            return data;
        },
        interact: async (articleId: number, payload: { type: "VIEW" | "SAVE" | "UPVOTE"; timeSpentMs?: number; scrollDepthPercent?: number }) => {
            const { data } = await apiClient.post(`/articles/${articleId}/interactions`, payload);
            return data.data;
        },
        suggest: async (articleId: number, payload: { content: string; comment?: string }) => {
            const { data } = await apiClient.post(`/articles/${articleId}/suggestions`, payload);
            return data.data;
        }
    }
};

export default api;
