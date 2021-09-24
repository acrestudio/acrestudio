import memoize from 'lodash/memoize';
import fs from 'fs';
import path from 'path';
import { getImage, Image } from './image';
import matter from 'gray-matter';

const fsExists = async (file: string) => fs.promises.stat(file).catch(_ => false);

async function asyncGetExisting<T>(getId: (ids: string) => Promise<T | null>, ids: string[]): Promise<T[]> {
  const items: T[] = [];
  for (const id of ids) {
    const item = await getId(id);
    if (item === null) continue;
    items.push(item);
  }
  return items;
}

// Tag -----------------------------------------------------------------------------------------------------------------

type RawTag = {
  slug: string;
  title: string;
};

export type Tag = {
  id: string;
  name: string;
};

const _getTag = async (id: string): Promise<Tag | null> => {
  const file = path.join(process.cwd(), 'content', 'tags', id + '.json');
  if (!(await fsExists(file))) return null;
  const raw = JSON.parse(await fs.promises.readFile(file, { encoding: 'utf-8' })) as RawTag;
  return { id: raw.slug, name: raw.title };
};

export const getTag = memoize(_getTag);

const _getTags = async (): Promise<Tag[]> => {
  const dir = path.join(process.cwd(), 'content', 'tags');
  const files = await fs.promises.readdir(dir);
  const tagIds = files.filter(x => x.endsWith('.json')).map(x => x.slice(0, -5));
  return asyncGetExisting(getTag, tagIds);
};

export const getTags = memoize(_getTags);

// Work ----------------------------------------------------------------------------------------------------------------

type RawWork = {
  data: {
    slug: string;
    title: string;
    description?: string;
    image: string;
    tags?: { tag: string }[];
    images?: string[];
  };
  content: string;
};

export type Work = {
  id: string;
  title: string;
  description: string;
  image: Image | null;
  tags: Tag[];
  text: string;
  images: Image[];
};

const _getWork = async (id: string): Promise<Work | null> => {
  const file = path.join(process.cwd(), 'content', 'works', id + '.md');
  if (!(await fsExists(file))) return null;
  const { data, content: text } = matter(await fs.promises.readFile(file, { encoding: 'utf-8' })) as unknown as RawWork;
  const title = data.title;
  const description = data.description ?? '';
  const image = await getImage(data.image);
  const tagIds = data.tags?.map(x => x.tag) ?? [];
  const tags = await asyncGetExisting(getTag, tagIds);
  const images = await asyncGetExisting(getImage, data.images ?? []);
  return { id, title, description, image, tags, text, images };
};

export const getWork = memoize(_getWork);

const _getWorks = async (): Promise<Work[]> => {
  const dir = path.join(process.cwd(), 'content', 'works');
  const files = await fs.promises.readdir(dir);
  const workIds = files.filter(x => x.endsWith('.md')).map(x => x.slice(0, -3));
  return await asyncGetExisting(getWork, workIds);
};

export const getWorks = memoize(_getWorks);

// Index ---------------------------------------------------------------------------------------------------------------

type RawIndex = {
  title: string;
  description: string;
  image: string;
  works: { work: string }[];
  tags: { tag: string }[];
};

export type Index = {
  title: string;
  description: string;
  image: Image | null;
  works: Work[];
  tags: Tag[];
};

const _getIndex = async (): Promise<Index> => {
  const file = path.join(process.cwd(), 'content', 'index.json');
  const raw = JSON.parse(await fs.promises.readFile(file, { encoding: 'utf-8' })) as RawIndex;
  const { title, description } = raw;
  const image = await getImage(raw.image);
  const workIds = raw.works.map(x => x.work);
  const works = await asyncGetExisting(getWork, workIds);
  const tagIds = raw.tags.map(x => x.tag);
  const tags = await asyncGetExisting(getTag, tagIds);
  return { title, description, image, works, tags };
};

export const getIndex = memoize(_getIndex);
