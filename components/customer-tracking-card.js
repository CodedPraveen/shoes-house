import TrackingTimeline from "./tracking-timeline";

export default function CustomerTrackingCard({ order }) {
    return (
        <div className="space-y-0">

            <TrackingTimeline order={order} />

        </div>
    );
}