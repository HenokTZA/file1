import { useState, useEffect, useMemo } from "react";

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState([]);

  // Memoize the grid configuration
  const gridClass = useMemo(() => {
    if (!loadedImages || loadedImages.length === 0) return "";
    if (loadedImages.length === 1) return "flex justify-center";
    if (loadedImages.length === 2) return "grid grid-cols-2 gap-3";
    if (loadedImages.length === 3) return "grid grid-cols-3 gap-3";
    if (loadedImages.length === 4) return "grid grid-cols-4 gap-3";
    return "grid grid-cols-5 gap-3";
  }, [loadedImages]);

  useEffect(() => {
    if (images && images.length > 0) {
      setIsLoading(true);
      setLoadedImages([]);

      const loadImages = async () => {
        const loaded = await Promise.all(
          images.map((image) => {
            return new Promise((resolve) => {
              const img = new Image();
              // Handle both blob URLs (image.url) and direct URLs/objects
              img.src = image.url || image.base64 || image;
              img.onload = () => resolve({
                ...image,
                // Preserve all image properties
                src: image.url || image.base64 || image
              });
              img.onerror = () => {
                console.error("Failed to load image:", image);
                resolve(null);
              };
            });
          })
        );

        setLoadedImages(loaded.filter(Boolean));
        setIsLoading(false);
      };

      loadImages();
    } else {
      setIsLoading(false);
      setLoadedImages([]);
    }

    // Cleanup function to revoke blob URLs when component unmounts
    return () => {
      loadedImages.forEach(image => {
        if (image?.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!loadedImages || loadedImages.length === 0) {
    return <p className="text-center text-gray-500">No images available</p>;
  }

  return (
    <>
      <div className={`w-full p-4 ${gridClass}`}>
        {loadedImages.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image.url || image.base64 || image}
              alt={image.filename || `Image ${index + 1}`}
              className={`rounded-lg shadow-md cursor-pointer transition-all duration-300 ${
                loadedImages.length === 1 
                  ? "w-full h-60 object-cover" 
                  : "w-full h-60 object-cover group-hover:opacity-90"
              }`}
              onClick={() => setSelectedImage(image.url || image.base64 || image)}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg'; // Fallback image
              }}
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              className="absolute -top-12 right-0 bg-white text-black text-2xl font-bold 
                         w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              &times;
            </button>
            <div className="flex justify-center items-center h-full">
              <img
                src={selectedImage}
                alt="Zoomed"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;