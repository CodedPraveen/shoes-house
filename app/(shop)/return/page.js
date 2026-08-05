export const metadata = {
    title: "Return Policy | Post Mart",
};

export default function ReturnPage() {
    return (
        <main className="pt-20">
            <section className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="mb-8 text-4xl font-bold">Return & Refund Policy</h1>

                <div className="space-y-8 text-zinc-700">
                    <p>
                        At Post Mart, we are committed to delivering premium-quality sneakers. If you
                        receive a product with a manufacturing defect or damage, you may request a
                        return subject to the conditions below.
                    </p>

                    <div>
                        <h2 className="mb-3 text-2xl font-semibold">Return Eligibility</h2>
                        <p className="mb-3">
                            Customers may submit a return request within{" "}
                            <strong>5 business days</strong> of successful delivery of the order.
                        </p>

                        <p className="mb-3">
                            To initiate a return, customers must provide:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Clear photos of the product showing the issue.</li>
                            <li>An unedited video of the product from multiple angles.</li>
                            <li>Photos of the original packaging and labels.</li>
                            <li>Order number and purchase details.</li>
                        </ul>

                        <p className="mt-3">
                            Our support team will review the submitted evidence before approving any
                            return request.
                        </p>
                    </div>

                    <div>
                        <h2 className="mb-3 text-2xl font-semibold">Eligibility</h2>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Products must be unworn and unused.</li>
                            <li>Items must be returned in the original box.</li>
                            <li>All original tags and labels must remain attached.</li>
                            <li>
                                Original packaging, accessories, and included materials must be
                                returned.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="mb-3 text-2xl font-semibold">
                            Return Approval Process
                        </h2>

                        <ol className="list-decimal space-y-2 pl-6">
                            <li>
                                Customer submits a return request within 5 business days of delivery.
                            </li>
                            <li>
                                Photos and videos are reviewed by our support and quality team.
                            </li>
                            <li>
                                If the issue appears to be a genuine manufacturing defect or quality
                                issue, a return pickup may be approved.
                            </li>
                            <li>
                                Approval of pickup does not guarantee a refund. Final approval is
                                subject to warehouse inspection.
                            </li>
                        </ol>
                    </div>

                    <div>
                        <h2 className="mb-3 text-2xl font-semibold">Process</h2>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Initiate a return from your Orders page.</li>
                            <li>
                                Pickup is arranged within 48 hours in most serviceable cities.
                            </li>
                            <li>
                                Customers may be contacted for additional photos, videos, or details
                                before approval.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="mb-3 text-2xl font-semibold">
                            Inspection After Return
                        </h2>

                        <p>
                            Once the returned product reaches our warehouse, our quality inspection
                            team will carefully verify the item.
                        </p>

                        <p className="mt-3">
                            A refund will only be approved if:
                        </p>

                        <ul className="mt-3 list-disc space-y-2 pl-6">
                            <li>The reported defect is verified by our team.</li>
                            <li>The returned product matches the originally shipped product.</li>
                            <li>The product shows no signs of misuse or unauthorized alteration.</li>
                            <li>
                                The issue is confirmed to be a manufacturing or quality-related
                                defect.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="mb-3 text-2xl font-semibold">
                            Non-Returnable Situations
                        </h2>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                Return requests submitted after 5 business days from delivery.
                            </li>
                            <li>Products that have been worn, damaged, modified, or altered.</li>
                            <li>Items returned without original packaging or tags.</li>
                            <li>
                                Products returned in a condition different from how they were shipped.
                            </li>
                            <li>
                                Defects caused by improper use, accidental damage, or normal wear and
                                tear.
                            </li>
                            <li>
                                Issues that cannot be verified during warehouse inspection.
                            </li>
                            <li>
                                Size, color, or style selected incorrectly by the customer at the time
                                of purchase.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="mb-3 text-2xl font-semibold">Refunds</h2>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                Refunds are processed to the original payment method after successful
                                inspection.
                            </li>
                            <li>
                                Refunds are typically completed within 5–7 business days after
                                inspection approval.
                            </li>
                            <li>
                                Bank processing times may vary depending on the payment provider.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="mb-3 text-2xl font-semibold">Fraud Prevention</h2>

                        <p>
                            To protect our customers and business, Post Mart reserves the right to reject
                            returns involving substituted products, manipulated evidence,
                            fraudulent claims, or abuse of the return process.
                        </p>
                    </div>

                    <div>
                        <h2 className="mb-3 text-2xl font-semibold">Important Note</h2>

                        <p>
                            Approval of a return request or pickup does not automatically guarantee
                            a refund. The final decision is made only after the returned product is
                            physically inspected by our quality team.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}