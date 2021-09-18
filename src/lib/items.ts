import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { getImage, Image, resizeImage, Thumb } from './image';

const itemsDirectory = path.join(process.cwd(), 'content/items');

export type Item = {
  slug: string;
  title: string;
  image: string;
  description: string;
  category: string;
  images: { image: Image; thumb: Thumb }[];
  content: string;
  previous: { slug: string; title: string };
  next: { slug: string; title: string };
};

type ItemFrontMatter = {
  title: string;
  image: string;
  description: string;
  category: string;
  images: string[];
};

const getItem = async (fileName: string): Promise<Item> => {
  console.info(`get item ${fileName}`);
  // read markdown file as string
  const fullPath = path.join(itemsDirectory, fileName);
  const fileContents = await fs.promises.readFile(fullPath, 'utf8');
  // use gray-matter to parse the item metadata section
  const frontMatter = matter(fileContents);
  const data = frontMatter.data as ItemFrontMatter;
  const content = frontMatter.content;
  // get image info
  const images: { image: Image; thumb: Thumb }[] = [];
  for (const src of data.images) {
    const image = await getImage(src);
    if (image === null) {
      continue;
    }
    const width = 200;
    const height = Math.round((image.height / image.width) * width);
    const thumbs = await resizeImage(image, [{ width, height }]);
    images.push({ image, thumb: thumbs[0] });
  }
  // get slug
  const slug = fileName.replace(/\.md$/, '');
  // previous/next dummy
  const previous = { slug: '', title: '' };
  const next = { slug: '', title: '' };
  return { slug, ...data, images, previous, next, content };
};

const getItems = async (): Promise<Item[]> => {
  console.info(`get items`);
  // Get file names under /items
  const fileNames = await fs.promises.readdir(itemsDirectory);
  const mdFiles = fileNames.filter(it => it.endsWith('.md'));
  const items: Item[] = [];
  for (const mdFile of mdFiles) {
    items.push(await getItem(mdFile));
  }
  // add previous/next item infos
  items.forEach((item, i) => {
    const previous = items[(i - 1 + items.length) % items.length];
    const next = items[(i + 1) % items.length];
    item.previous = { slug: previous.slug, title: previous.title };
    item.next = { slug: next.slug, title: next.title };
  });
  return items;
};

export async function fetchItems(): Promise<Item[]> {
  const cachePath = path.join(process.cwd(), '.next', 'cache', 'items.json');
  // load from cache
  if (await fs.promises.stat(cachePath).catch(_ => false)) {
    const { buildId, items } = JSON.parse(await fs.promises.readFile(cachePath, 'utf8'));
    // note: no build id provided on dev mode. data changes require rebuild
    if (buildId === process.env.BUILD_ID) {
      return items;
    }
  }
  // save to cache
  const buildId = process.env.BUILD_ID;
  const items = await getItems();
  await fs.promises.writeFile(cachePath, JSON.stringify({ buildId, items }), { encoding: 'utf8' });
  return items;
}
