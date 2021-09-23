import memoize from 'lodash/memoize';
import { getIndex, getTags, getWorks, Index, Tag, Work } from './content';
import path from 'path';
import fs from 'fs';

const fsExists = async (file: string) => fs.promises.stat(file).catch(_ => false);

async function getFromCache<T>(id: string, fallback: () => Promise<T>): Promise<T> {
  const file = path.join(process.cwd(), '.next', 'cache', id + '.json');
  // load from cache
  if (await fsExists(file)) {
    const { buildId, data } = JSON.parse(await fs.promises.readFile(file, 'utf8')) as { buildId: string; data: T };
    // note: no build id provided on dev mode. data changes require rebuild
    if (buildId === process.env.BUILD_ID) {
      return data;
    }
  }
  // get new data
  const data = await fallback();
  // save to cache
  const buildId = process.env.BUILD_ID;
  await fs.promises.writeFile(file, JSON.stringify({ buildId, data }), { encoding: 'utf8' });
  return data;
}

// Tag -----------------------------------------------------------------------------------------------------------------

const _getTagFromCache = async (id: string): Promise<Tag | null> => {
  const tag = (await getTagsFromCache()).find(x => x.id === id);
  return tag ? tag : null;
};

export const getTagFromCache = memoize(_getTagFromCache);

const _getTagsFromCache = async (): Promise<Tag[]> => getFromCache('tags', getTags);

export const getTagsFromCache = memoize(_getTagsFromCache);

// Work ----------------------------------------------------------------------------------------------------------------

const _getWorkFromCache = async (id: string): Promise<Work | null> => {
  const work = (await getWorksFromCache()).find(x => x.id === id);
  return work ? work : null;
};

export const getWorkFromCache = memoize(_getWorkFromCache);

const _getWorksFromCache = async (): Promise<Work[]> => getFromCache('works', getWorks);

export const getWorksFromCache = memoize(_getWorksFromCache);

// Index ---------------------------------------------------------------------------------------------------------------

const _getIndexFromCache = async (): Promise<Index> => getFromCache('index', getIndex);

export const getIndexFromCache = memoize(_getIndexFromCache);
