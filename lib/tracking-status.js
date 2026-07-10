export function normalizeTrackingStatus(tag = "") {
    const value = tag.toUpperCase();

    switch (value) {
        case "PENDING":
        case "INFO_RECEIVED":
            return "PENDING";

        case "INTRANSIT":
        case "IN_TRANSIT":
            return "IN_TRANSIT";

        case "OUTFORDELIVERY":
        case "OUT_FOR_DELIVERY":
            return "OUT_FOR_DELIVERY";

        case "DELIVERED":
            return "DELIVERED";

        case "EXCEPTION":
            return "FAILED_ATTEMPT";

        case "RETURNED":
            return "RETURNED";

        default:
            return "UNKNOWN";
    }
}