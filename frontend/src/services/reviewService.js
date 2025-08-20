import axios from 'axios';

const API_URL = 'http://localhost:8000/api/reviews';

export const getReviews = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getReview = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createReview = async (reviewData, token) => {
    const response = await axios.post(API_URL, reviewData, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const checkLocationAvailability = async (location_name, address) => {
    const response = await axios.post(`${API_URL}/check-location`, {
        location_name,
        address
    });
    return response.data;
}; 