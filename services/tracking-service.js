import axios from "axios";

const AFTERSHIP_API_URL = "https://api.aftership.com";

const aftershipClient = axios.create({
    baseURL: "https://api.aftership.com",
    headers: {
        "as-api-key": process.env.AFTERSHIP_API_KEY,
        "Content-Type": "application/json",
    },
});

async function createTracking({ trackingNumber, orderNumber }) {
    try {
        const response = await aftershipClient.post("/tracking/2024-07/trackings", {
            tracking_number: trackingNumber,
            slug: "india-post",
            title: `Order #${orderNumber}`,
        });

        return response.data;
    } catch (error) {
        console.error("AfterShip Create Tracking Error:", error.response?.data || error.message);
        throw new Error("Unable to create tracking.");
    }
}
async function getTracking(trackingNumber) {
    try {
        const response = await aftershipClient.get(
            `/tracking/2024-07/trackings/india-post/${trackingNumber}`,
        );

        return response.data;
    } catch (error) {
        console.error(
            "AfterShip Get Tracking Error:",
            error.response?.data || error.message,
        );

        throw new Error("Unable to fetch tracking.");
    }
}
export const trackingService = {
  createTracking,
  getTracking,
};
