import path from 'path';
import md5File from 'md5-file';
import fs from 'fs';
import sharp from 'sharp';
import uniq from 'lodash/uniq';

const thumbFormats = ['jpg', 'avif'] as const;
export type ThumbFormat = typeof thumbFormats[number];

export type Image = {
  id: string;
  url: string;
  width: number;
  height: number;
};

export type Thumb = {
  url: string;
  width: number;
  height: number;
  format: ThumbFormat;
};

export type Picture = {
  sources: { srcSet: string; type: string }[];
  img: { src: string; width: number; height: number };
};

const publicDir = path.join(process.cwd(), 'public');
const cacheDir = path.join(process.cwd(), '.next', 'cache', 'images');
const staticDir = path.join(process.cwd(), '.next', 'static', 'images');

const fsExists = async (file: string) => fs.promises.stat(file).catch(_ => false);

/**
 * Returns image meta data for images in public folder
 * Image info is cached in /.next/cache/images/[file-hash]/data.json
 */
export const getImage = async (url: string): Promise<Image | null> => {
  const imageFile = path.join(publicDir, url);
  // check if file exists
  if (!(await fsExists(imageFile))) {
    console.error(`Image does not exist: ${url}`);
    return null;
  }
  // prep paths
  const hash = (await md5File(imageFile)).substring(0, 10);
  const base = path.parse(url).base.replaceAll('.', '-');
  const id = `${base}-${hash}`;
  const imageDir = path.join(cacheDir, id);
  const dataFile = path.join(imageDir, 'data.json');
  // find data file
  if (await fsExists(dataFile)) {
    return JSON.parse(await fs.promises.readFile(dataFile, 'utf8'));
  }
  // create /.next/cache/images folder
  if (!(await fsExists(cacheDir))) {
    await fs.promises.mkdir(cacheDir);
  }
  // create /.next/cache/images/[id] folder
  if (!(await fsExists(imageDir))) {
    await fs.promises.mkdir(imageDir);
  }
  // extract meta data
  const image = sharp(imageFile);
  // get width and height
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  // write data file
  const data = { id, url, width, height };
  await fs.promises.writeFile(dataFile, JSON.stringify(data), { encoding: 'utf8' });
  return data;
};

/**
 * Resizes image and returns thumb data
 * Thumbs are created in /.next/cache/images and copied to /.next/static/images/ folder.
 * Next.js copies static folder on export.
 */
export const resizeImage = async ({
  image,
  width,
  height,
  format = 'jpg',
}: {
  image: Image;
  width: number;
  height?: number;
  format?: ThumbFormat;
}): Promise<Thumb> => {
  const imageFile = path.join(publicDir, image.url);
  height = height ? height : Math.round((image.height / image.width) * width);
  // adjust if source dimensions are too small
  const ratio = width / height;
  if (image.width < width) {
    width = image.width;
    height = Math.round(width / ratio);
  }
  if (image.height < height) {
    height = image.height;
    width = Math.round(height * ratio);
  }
  // prep result
  const name = `${width}x${height}.${format}`;
  const thumb = { url: `/_next/static/images/${image.id}/${name}`, width, height, format };
  // check /.next/static/images/[id]/[name]
  const imageStaticPath = path.join(staticDir, image.id, name);
  if (await fsExists(imageStaticPath)) {
    return thumb;
  }
  // create /.next/static/images folder
  if (!(await fsExists(staticDir))) {
    await fs.promises.mkdir(staticDir);
  }
  // create /.next/static/images/[id] folder
  const imageStaticDir = path.join(staticDir, image.id);
  if (!(await fsExists(imageStaticDir))) {
    await fs.promises.mkdir(imageStaticDir);
  }
  // check /.next/cache/images/[id]/[name]
  const imageCachePath = path.join(cacheDir, image.id, name);
  if (await fsExists(imageCachePath)) {
    await fs.promises.copyFile(imageCachePath, imageStaticPath);
    return thumb;
  }
  // resize image to cache
  console.log(`Resizing ${imageCachePath}`);
  await sharp(imageFile)
    .resize(width, height, { fit: 'cover' })
    .toFormat(format, { quality: 60 })
    .toFile(imageCachePath);
  // copy to static
  await fs.promises.copyFile(imageCachePath, imageStaticPath);
  return thumb;
};

/**
 * Helper for creating picture element thumbs in jpg and avif formats
 */
export const getPicture = async (image: Image, dimensions: { width: number; height?: number }[]): Promise<Picture> => {
  const sources: { avif: Thumb[]; jpeg: Thumb[] } = { avif: [], jpeg: [] };
  for (let { width, height } of dimensions) {
    height = height ? height : Math.round((image.height * width) / image.width);
    sources.jpeg.push(await resizeImage({ image, width, height, format: 'jpg' }));
    sources.avif.push(await resizeImage({ image, width, height, format: 'avif' }));
  }
  const img = sources.jpeg[sources.jpeg.length - 1];
  const { width: imgWidth, height: imgHeight } = dimensions[dimensions.length - 1];
  return {
    sources: [
      { srcSet: uniq(sources.avif.map(({ url, width }) => `${url} ${width}w`)).join(', '), type: 'image/avif' },
      { srcSet: uniq(sources.jpeg.map(({ url, width }) => `${url} ${width}w`)).join(', '), type: 'image/jpeg' },
    ],
    img: {
      src: img.url,
      width: imgWidth,
      height: imgHeight ? imgHeight : Math.round((image.height * imgWidth) / image.width),
    },
  };
};
