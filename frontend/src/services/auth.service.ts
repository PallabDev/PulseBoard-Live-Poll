import { api } from '../lib/api';

export const authService = {
    async signup(data: any) {
        const response = await api.post('/auth/signup', data);
        return response.data;
    },
    async signin(data: any) {
        const response = await api.post('/auth/signin', data);
        return response.data;
    },
    async signout() {
        const response = await api.get('/auth/signout');
        return response.data;
    },
    async getMe() {
        const response = await api.get('/auth/me');
        return response.data;
    },
    async verifyEmail(token: string) {
        const response = await api.post('/auth/verify-email', { token });
        return response.data;
    },
    async forgotPassword(email: string) {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
    async resetPassword(token: string, password: string) {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    },
    async refreshToken() {
        const response = await api.post('/auth/refresh-token', {});
        return response.data;
    },
};
