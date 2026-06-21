import { prisma } from "@/lib/db";

export const metadata = {
    title: "Newsletter Subscribers | Admin",
};

export default async function NewsletterPage() {
    const subscribers = await prisma.newsletterSubscriber.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold">
                    Newsletter Subscribers
                </h1>
                <p className="text-sm text-black/60">
                    Total Subscribers: {subscribers.length}
                </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-black/10">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Subscribed</th>
                        </tr>
                    </thead>

                    <tbody>
                        {subscribers.map((subscriber) => (
                            <tr key={subscriber.id}>
                                <td className="px-4 py-3">
                                    {subscriber.email}
                                </td>
                                <td className="px-4 py-3">
                                    {new Date(
                                        subscriber.createdAt
                                    ).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}