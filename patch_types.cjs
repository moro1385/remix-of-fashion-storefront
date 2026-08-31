const fs = require('fs');
const filepath = 'src/integrations/supabase/types.ts';
let content = fs.readFileSync(filepath, 'utf8');

const search = `          is_featured: boolean
          name: string
          price: number`;
const replace = `          is_featured: boolean
          is_new: boolean
          images: string[]
          name: string
          price: number`;

content = content.replace(search, replace);

const search2 = `          is_featured?: boolean
          name: string
          price?: number`;
const replace2 = `          is_featured?: boolean
          is_new?: boolean
          images?: string[]
          name: string
          price?: number`;

content = content.replace(search2, replace2);

const search3 = `          is_featured?: boolean
          name?: string
          price?: number`;
const replace3 = `          is_featured?: boolean
          is_new?: boolean
          images?: string[]
          name?: string
          price?: number`;

content = content.replace(search3, replace3);

fs.writeFileSync(filepath, content);
console.log("Types updated");
