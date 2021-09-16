import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const itemsDirectory = path.join(process.cwd(), 'content/items');

export type Item = {
  readonly data: {
    readonly title: string;
    readonly slug: string;
  };
  readonly content: string;
};

let itemCache: Item[];

export function fetchItems(): Item[] {
  if (itemCache) {
    return itemCache;
  }
  // Get file names under /items
  const fileNames = fs.readdirSync(itemsDirectory);
  itemCache = fileNames
    .filter(it => it.endsWith('.md'))
    .map(fileName => {
      // Read markdown file as string
      const fullPath = path.join(itemsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      // Use gray-matter to parse the item metadata section
      const { data, content } = matter(fileContents);
      const slug = fileName.replace(/\.md$/, '');
      return { data: { slug, ...data }, content } as Item;
    });
  return itemCache;
}
