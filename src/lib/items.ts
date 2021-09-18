import fs from 'fs';
import matter from 'gray-matter';
import md5File from 'md5-file';
import path from 'path';
import sharp from 'sharp';

const itemsDirectory = path.join(process.cwd(), 'content/items');

type ImageInfo = { src: string; width: number; height: number; color: string };

export type Item = {
  slug: string;
  title: string;
  image: string;
  description: string;
  category: string;
  images: ImageInfo[];
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

const fsExists = async (file: string) => fs.promises.stat(file).catch(_ => false);

const getImage = async (src: string): Promise<ImageInfo | null> => {
  console.info(`get image ${src}`);
  const imageFile = path.join(process.cwd(), 'public', src);
  // check if file exists
  if (!(await fsExists(imageFile))) {
    console.error(`Image does not exist: ${src}`);
    return null;
  }
  // prep paths
  const hash = (await md5File(imageFile)).substring(0, 10);
  const base = path.parse(src).base.replaceAll('.', '-');
  const imageId = `${base}-${hash}`;
  const imagesDir = path.join(process.cwd(), '.next', 'cache', 'images');
  const imageDir = path.join(imagesDir, imageId);
  const dataFile = path.join(imageDir, 'data.json');
  // find data file
  if (await fsExists(dataFile)) {
    return JSON.parse(await fs.promises.readFile(dataFile, 'utf8'));
  }
  // create /.next/cache/images folder
  if (!(await fsExists(imagesDir))) {
    await fs.promises.mkdir(imagesDir);
  }
  // create /.next/cache/images/[name]-[hash] folder
  if (!(await fsExists(imageDir))) {
    await fs.promises.mkdir(imageDir);
  }
  // extract meta data
  const image = sharp(imageFile);
  // get width and height
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  // get dominant color
  const { dominant } = await image.stats();
  const color = `rgb(${dominant.r},${dominant.g},${dominant.b})`;
  // write data file
  const data = { src, width, height, color };
  await fs.promises.writeFile(dataFile, JSON.stringify(data), { encoding: 'utf8' });
  return { src, width, height, color };
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
  const images: ImageInfo[] = [];
  for (const image of data.images) {
    const info = await getImage(image);
    if (info !== null) {
      images.push(info);
    }
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
