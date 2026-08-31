const fs = require('fs');
const filepath = 'src/pages/Index.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const search1 = `      <ProductRail
        eyebrow="Just arrived"
        title="Newest Products"
        count={4}
        className="py-20 bg-background"
      />`;
const replace1 = `      <ProductRail
        type="newest"
        eyebrow="Just arrived"
        title="Newest Products"
        count={4}
        className="py-20 bg-background"
      />`;
content = content.replace(search1, replace1);

const search2 = `      <ProductRail
        eyebrow="Hand-picked"
        title="Featured Essentials"
        query="product_type:Socks"
        count={4}
        ctaTo="/collections/socks"
        className="py-20 bg-background"
      />`;
const replace2 = `      <ProductRail
        type="featured"
        eyebrow="Hand-picked"
        title="Featured Essentials"
        count={4}
        className="py-20 bg-background"
      />`;
content = content.replace(search2, replace2);

fs.writeFileSync(filepath, content);
console.log("Index updated");
