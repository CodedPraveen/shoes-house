import {
    getProductUploadSession,
    setProductUploadImages,
} from "@/lib/product-upload-session";

import {
    imageUploadService,
} from "@/services/upload/image-upload-service";

const MAX_PRODUCT_IMAGES = 8;

export const runtime = "nodejs";

async function cleanupReferences(references) {
    if (!references.length) {
        return;
    }

    await Promise.allSettled(
        references.map((reference) =>
            imageUploadService.delete(reference),
        ),
    );
}

export async function POST(request) {
    let sessionId = null;
    let stagedReferences = [];

    try {
        const formData = await request.formData();

        sessionId = formData.get("uploadSessionId");

        if (
            typeof sessionId !== "string" ||
            !sessionId.trim()
        ) {
            return Response.json(
                {
                    ok: false,
                    error: "Upload session is required.",
                },
                { status: 400 },
            );
        }

        const session =
            await getProductUploadSession(sessionId);

        if (!session) {
            return Response.json(
                {
                    ok: false,
                    error:
                        "Upload session expired. Please try again.",
                },
                { status: 410 },
            );
        }

        if (
            Array.isArray(session.images) &&
            session.images.length > 0
        ) {
            return Response.json(
                {
                    ok: false,
                    error:
                        "This upload session has already been used.",
                },
                { status: 409 },
            );
        }

        const files = formData
            .getAll("files")
            .filter(
                (file) =>
                    file &&
                    typeof file.arrayBuffer === "function",
            );

        if (!files.length) {
            return Response.json(
                {
                    ok: false,
                    error: "Add at least one product image.",
                },
                { status: 400 },
            );
        }

        if (files.length > MAX_PRODUCT_IMAGES) {
            return Response.json(
                {
                    ok: false,
                    error:
                        `Maximum ${MAX_PRODUCT_IMAGES} product images are allowed.`,
                },
                { status: 400 },
            );
        }

        for (const file of files) {
            const result =
                await imageUploadService.uploadFile(file);

            if (!result.ok) {
                await cleanupReferences(
                    stagedReferences,
                );

                return Response.json(
                    {
                        ok: false,
                        error:
                            result.message ||
                            "One or more images could not be uploaded.",
                    },
                    { status: 400 },
                );
            }

            stagedReferences.push(result.url);
        }

        const storeResult = await setProductUploadImages(
            sessionId,
            stagedReferences,
        );

        if (!storeResult.ok) {
            await cleanupReferences(stagedReferences);
            stagedReferences = [];

            if (storeResult.reason === "reused") {
                return Response.json(
                    {
                        ok: false,
                        error:
                            "This upload session has already been used.",
                    },
                    { status: 409 },
                );
            }

            return Response.json(
                {
                    ok: false,
                    error:
                        "Upload session expired. Please try again.",
                },
                { status: 410 },
            );
        }

        return Response.json({
            ok: true,
            uploadSessionId: sessionId,
            images: stagedReferences,
            count: stagedReferences.length,
        });
    } catch (error) {
        console.error(
            "[PRODUCT UPLOAD SESSION] failed",
            error,
        );

        await cleanupReferences(
            stagedReferences,
        );

        return Response.json(
            {
                ok: false,
                error:
                    error?.message ||
                    "Unable to upload product images.",
            },
            { status: 500 },
        );
    }
}
