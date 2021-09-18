import path from 'path';
import md5File from 'md5-file';
import fs from 'fs';
import sharp from 'sharp';

const thumbFormats = ['jpg', 'avif'] as const;
export type ThumbFormat = typeof thumbFormats[number];

export type Thumb = {
  src: string;
  width: number;
  height: number;
  format: ThumbFormat;
};

export type Image = {
  id: string;
  src: string;
  width: number;
  height: number;
  color: string;
};

type ResizeOptions = {
  width: number;
  height: number;
  format?: 'jpg' | 'avif';
};

const publicDir = path.join(process.cwd(), 'public');
const cacheDir = path.join(process.cwd(), '.next', 'cache', 'images');
const staticDir = path.join(process.cwd(), '.next', 'static', 'images');

const fsExists = async (file: string) => fs.promises.stat(file).catch(_ => false);

export const getImage = async (src: string): Promise<Image | null> => {
  console.info(`get image ${src}`);
  const imageFile = path.join(publicDir, src);
  // check if file exists
  if (!(await fsExists(imageFile))) {
    console.error(`Image does not exist: ${src}`);
    return null;
  }
  // prep paths
  const hash = (await md5File(imageFile)).substring(0, 10);
  const base = path.parse(src).base.replaceAll('.', '-');
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
  // get dominant color
  const { dominant } = await image.stats();
  const color = `rgb(${dominant.r},${dominant.g},${dominant.b})`;
  // write data file
  const data = { id, src, width, height, color };
  await fs.promises.writeFile(dataFile, JSON.stringify(data), { encoding: 'utf8' });
  return data;
};

export const resizeImage = async (image: Image, options: ResizeOptions[]): Promise<Thumb[]> => {
  const imageFile = path.join(publicDir, image.src);
  const thumbs: Thumb[] = [];
  for (let { width, height, format = 'jpg' } of options) {
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
    // add to results
    const name = `${width}x${height}.${format}`;
    thumbs.push({ src: `/_next/static/images/${image.id}/${name}`, width, height, format });
    // check /.next/static/images/[id]/[name]
    const imageStaticPath = path.join(staticDir, image.id, name);
    if (await fsExists(imageStaticPath)) {
      continue;
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
      continue;
    }
    // resize image to cache
    console.log(`Resizing ${imageCachePath}`);
    await sharp(imageFile)
      .resize(width, height, { fit: 'cover' })
      .toFormat(format, { quality: 60 })
      .toFile(imageCachePath);
    // copy to static
    await fs.promises.copyFile(imageCachePath, imageStaticPath);
  }
  return thumbs;
};
