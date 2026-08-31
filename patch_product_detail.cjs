const fs = require('fs');
const filepath = 'src/pages/ProductDetail.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const search = `          <div className="w-full aspect-[4/5] bg-warm-bg">
            <img
              src={productImage(product)}
              alt={product.node.title}
              className="w-full h-full object-cover"
            />
          </div>`;

const replace = `          <div className="flex flex-col gap-4">
            <div className="w-full aspect-[4/5] bg-warm-bg overflow-hidden relative">
              <img
                src={product.node.images.edges[0]?.node.url || "/placeholder.svg"}
                alt={product.node.title}
                className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-500 opacity-100"
                id="main-product-image"
              />
            </div>
            {product.node.images.edges.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {product.node.images.edges.map((img, idx) => (
                  <button
                    key={idx}
                    className="flex-shrink-0 w-24 h-24 border focus:outline-none focus:ring-2 focus:ring-foreground snap-start bg-warm-bg"
                    onClick={() => {
                      const mainImg = document.getElementById('main-product-image');
                      if (mainImg) (mainImg as HTMLImageElement).src = img.node.url;
                    }}
                  >
                    <img src={img.node.url} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>`;

content = content.replace(search, replace);

fs.writeFileSync(filepath, content);
console.log("Product detail updated");
