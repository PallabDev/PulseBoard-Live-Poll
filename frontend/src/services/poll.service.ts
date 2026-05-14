import { api } from '../lib/api';

export const pollService = {
    async createPoll(data: any) {
        const response = await api.post('/poll', data);
        return response.data;
    },
    async updatePoll(pollId: string, data: any) {
        const response = await api.patch(`/poll/${pollId}`, data);
        return response.data;
    },
    async deletePoll(pollId: string) {
        const response = await api.delete(`/poll/${pollId}`);
        return response.data;
    },
    async getAllPolls() {
        const response = await api.get('/poll/mypoll');
        return response.data;
    },
    async getPollById(pollId: string) {
        const response = await api.get(`/poll/mypoll/${pollId}`);
        return response.data;
    },
    async createQuestion(pollId: string, data: any) {
        const response = await api.post(`/poll/${pollId}/question`, data);
        return response.data;
    },
    async updateQuestion(pollId: string, questionId: string, data: any) {
        const response = await api.patch(`/poll/${pollId}/question/${questionId}`, data);
        return response.data;
    },
    async deleteQuestion(pollId: string, questionId: string) {
        const response = await api.delete(`/poll/${pollId}/question/${questionId}`);
        return response.data;
    },
    async updateQuestionOrder(pollId: string, data: { questionId: string, questionNumber: number }[]) {
        const response = await api.patch(`/poll/${pollId}/questions/order`, data);
        return response.data;
    },
    async updateOption(pollId: string, questionId: string, optionId: string, data: any) {
        const response = await api.patch(`/poll/${pollId}/${questionId}/${optionId}`, data);
        return response.data;
    },
    async getPublicPoll(shareCode: string) {
        const response = await api.get(`/public/polls/${shareCode}`);
        return response.data;
    },
    async getPublicAnalytics(analyticsCode: string) {
        const response = await api.get(`/public/analytics/${analyticsCode}`);
        return response.data;
    },
    async getParticipantSummary(analyticsCode: string, page = 1, limit = 10) {
        const response = await api.get(`/public/analytics/${analyticsCode}/participants`, {
            params: { page, limit },
        });
        return response.data;
    }
};
