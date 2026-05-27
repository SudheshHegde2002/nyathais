import { products } from '../../data/productData';
import './Products.css';

export default function Products() {
  return (
    <div id="products" className="products-container">
      {products.map((product, idx) => (
        <div key={product.folder || idx} className={`product-section ${idx % 2 === 1 ? 'product-section--alt' : ''}`}>
          <div className="product-inner">
            <div className="product-label fade-up">
              <span className="product-number">No. {String(idx + 1).padStart(2, '0')}</span>
              <h2 className="product-title">{product.name || "Signature Blend"}</h2>
            </div>
            <div className="product-media">
              {product.media.map((item, mIdx) => {
                const src = `/gif/${product.folder}/${item.file}`;
                return (
                  <div key={item.file || mIdx} className={`media-wrap fade-up delay-${mIdx + 1} ${item.type === 'gif' ? 'media-wrap--gif' : 'media-wrap--image'}`}>
                    <img
                      src={src}
                      alt={`${product.name} showcase`}
                      className={item.type === 'gif' ? 'media-gif' : 'media-image'}
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
