export function optimizeCloudinaryImage(url) {
    if (!url?.includes("res.cloudinary.com")) return url;

    return url.replace(
        "/upload/",
        "/upload/f_auto,q_auto/"
    );
}