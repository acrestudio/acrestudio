import path from 'path';
import fs from 'fs';

const categoriesDir = path.join(process.cwd(), 'content/categories');

export type Category = {
  slug: string;
  title: string;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const cachePath = path.join(process.cwd(), '.next', 'cache', 'categories.json');
  // load from cache
  if (await fs.promises.stat(cachePath).catch(_ => false)) {
    const { buildId, categories } = JSON.parse(await fs.promises.readFile(cachePath, 'utf8'));
    // note: no build id provided on dev mode. data changes require rebuild
    if (buildId === process.env.BUILD_ID) {
      return categories;
    }
  }
  // fetch categories
  const fileNames = await fs.promises.readdir(categoriesDir);
  const jsonFiles = fileNames.filter(x => x.endsWith('.json'));
  const categories: Category[] = [];
  for (const fileName of jsonFiles) {
    const fullPath = path.join(categoriesDir, fileName);
    const category = JSON.parse(await fs.promises.readFile(fullPath, 'utf8')) as Category;
    category.slug = fileName.replace(/\.json$/, '');
    categories.push(category);
  }
  // save to cache
  const buildId = process.env.BUILD_ID;
  await fs.promises.writeFile(cachePath, JSON.stringify({ buildId, categories }), { encoding: 'utf8' });
  return categories;
};
