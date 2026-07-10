import axios from "axios";

const aftershipClient = axios.create({
    baseURL: "https://api.aftership.com",
    headers: {
        "as-api-key": process.env.AFTERSHIP_API_KEY,
        "Content-Type": "application/json",
    },
});

async function createTracking({ trackingNumber, orderNumber }) {
    const response = await aftershipClient.post(
        "/tracking/2024-07/trackings",
        {
            tracking_number: trackingNumber,
            slug: "india-post",
            title: `Order #${orderNumber}`,
        },
    );

    return response.data;
}

async function getTracking(trackingNumber) {
    const response = await aftershipClient.get(
        `/tracking/2024-07/trackings/india-post/${trackingNumber}`,
    );

    return response.data;
}

async function deleteTracking(trackingNumber) {
    return aftershipClient.delete(
        `/tracking/2024-07/trackings/india-post/${trackingNumber}`,
    );
}

export const trackingService = {
    createTracking,
    getTracking,
    deleteTracking,
};