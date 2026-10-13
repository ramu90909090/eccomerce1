export const calculateFinalPrice = (price, discount = 0) => {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;
  return Math.round(p - (p * d) / 100);
};

export const getImageUrl = (imagePath) => {
  const fallbackImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";

  if (!imagePath || typeof imagePath !== "string") {
    return fallbackImage;
  }

  // Direct internet URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Backend origin (Default: http://localhost:5000)
  const backendBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  return `${backendBase}${cleanPath}`;
};