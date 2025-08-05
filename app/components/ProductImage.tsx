import {useState} from 'react';
import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!image) {
    return <div className="product-image" />;
  }

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

      {/* Modal */}
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
