import {useState} from 'react';
import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  image,
  media,
  selectedVariantId,
}: {
  image: ProductVariantFragment['image'];
  media?: any[];
  selectedVariantId?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // If there's a variant image, just show that (no carousel)
  if (image) {
    return (
      <>
        <div className="product-image">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full hover:opacity-90 transition-opacity cursor-zoom-in rounded-lg overflow-hidden border-2 border-black hover:border-[var(--color-brand-yellow)] focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-yellow)] focus:ring-opacity-50"
            aria-label="Click to view full size image"
          >
            <Image
              alt={image.altText || 'Product Image'}
              data={image}
              key={image.id}
              sizes="(min-width: 45em) 50vw, 100vw"
            />
          </button>
        </div>

        {/* Modal for single image */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="relative max-w-7xl max-h-[90vh] mx-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 bg-white text-black rounded-full p-2 hover:bg-[var(--color-brand-yellow)] transition-colors border-2 border-black font-bold text-xl leading-none w-10 h-10 flex items-center justify-center"
                aria-label="Close modal"
              >
                ×
              </button>
              <div className="border-4 border-white rounded-lg overflow-hidden shadow-2xl">
                <Image
                  alt={image.altText || 'Product Image - Full Size'}
                  data={image}
                  key={`modal-${image.id}`}
                  sizes="90vw"
                  className="max-h-[90vh] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // No variant image - check if we have media images for carousel
  const allImages = media?.filter(m => m?.image)?.map(m => m.image) || [];
  
  // If no images at all, show placeholder
  if (allImages.length === 0) {
    return <div className="product-image bg-gray-100 rounded-lg aspect-square" />;
  }

  // If only one media image, show it without carousel
  if (allImages.length === 1) {
    const singleImage = allImages[0];
    return (
      <>
        <div className="product-image">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full hover:opacity-90 transition-opacity cursor-zoom-in rounded-lg overflow-hidden border-2 border-black hover:border-[var(--color-brand-yellow)] focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-yellow)] focus:ring-opacity-50"
            aria-label="Click to view full size image"
          >
            <Image
              alt={singleImage.altText || 'Product Image'}
              data={singleImage}
              key={singleImage.id}
              sizes="(min-width: 45em) 50vw, 100vw"
            />
          </button>
        </div>

        {/* Modal for single image */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="relative max-w-7xl max-h-[90vh] mx-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 bg-white text-black rounded-full p-2 hover:bg-[var(--color-brand-yellow)] transition-colors border-2 border-black font-bold text-xl leading-none w-10 h-10 flex items-center justify-center"
                aria-label="Close modal"
              >
                ×
              </button>
              <div className="border-4 border-white rounded-lg overflow-hidden shadow-2xl">
                <Image
                  alt={singleImage.altText || 'Product Image - Full Size'}
                  data={singleImage}
                  key={`modal-${singleImage.id}`}
                  sizes="90vw"
                  className="max-h-[90vh] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Multiple media images - show carousel
  const currentImage = allImages[currentImageIndex];

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="product-image">
        <div className="relative">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full hover:opacity-90 transition-opacity cursor-zoom-in rounded-lg overflow-hidden border-2 border-black hover:border-[var(--color-brand-yellow)] focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-yellow)] focus:ring-opacity-50"
            aria-label="Click to view full size image"
          >
            <Image
              alt={currentImage.altText || 'Product Image'}
              data={currentImage}
              key={currentImage.id}
              sizes="(min-width: 45em) 50vw, 100vw"
            />
          </button>

          {/* Navigation arrows */}
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[var(--color-brand-yellow)] text-black rounded-full p-2 border-2 border-black transition-colors shadow-lg"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[var(--color-brand-yellow)] text-black rounded-full p-2 border-2 border-black transition-colors shadow-lg"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/75 text-white px-3 py-1 rounded-full text-sm font-bold">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-[var(--color-brand-yellow)] scrollbar-track-gray-100">
          {allImages.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden transition-all ${
                index === currentImageIndex
                  ? 'border-[var(--color-brand-yellow)] ring-2 ring-[var(--color-brand-yellow)] ring-opacity-50'
                  : 'border-gray-300 hover:border-[var(--color-brand-blue)]'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                alt={img.altText || `Product thumbnail ${index + 1}`}
                data={img}
                sizes="80px"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Modal with carousel controls */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] mx-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white text-black rounded-full p-2 hover:bg-[var(--color-brand-yellow)] transition-colors border-2 border-black font-bold text-xl leading-none w-10 h-10 flex items-center justify-center"
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Modal navigation arrows */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[var(--color-brand-yellow)] text-black rounded-full p-3 border-2 border-black transition-colors shadow-lg z-10"
              aria-label="Previous image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[var(--color-brand-yellow)] text-black rounded-full p-3 border-2 border-black transition-colors shadow-lg z-10"
              aria-label="Next image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="border-4 border-white rounded-lg overflow-hidden shadow-2xl">
              <Image
                alt={currentImage.altText || 'Product Image - Full Size'}
                data={currentImage}
                key={`modal-${currentImage.id}`}
                sizes="90vw"
                className="max-h-[90vh] w-auto object-contain"
              />
            </div>

            {/* Modal image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-lg font-bold">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}