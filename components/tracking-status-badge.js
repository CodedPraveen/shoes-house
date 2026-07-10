export default function TrackingStatusBadge({
    status,
}) {
    const colors = {
        PENDING:
            "bg-zinc-100 text-zinc-700",

        SHIPPED:
            "bg-blue-100 text-blue-700",

        IN_TRANSIT:
            "bg-yellow-100 text-yellow-700",

        OUT_FOR_DELIVERY:
            "bg-orange-100 text-orange-700",

        DELIVERED:
            "bg-green-100 text-green-700",

        RETURNED:
            "bg-red-100 text-red-700",

        FAILED_ATTEMPT:
            "bg-red-100 text-red-700",

        UNKNOWN:
            "bg-zinc-100 text-zinc-700",
    };

    return (
        <span
            className={`rounded-xs px-3 py-1 text-sm font-medium ${colors[status] ||
                colors.UNKNOWN
                }`}
        >
            {status.replaceAll("_", " ")}
        </span>
    );
}