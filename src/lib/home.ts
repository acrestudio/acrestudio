import * as fs from 'fs';
import path from 'path';

type Home = {
  title: string;
  description: string;
  image: string;
  items: { item: string }[];
  categories: { category: string }[];
};

export const fetchHome = async () => {
  const homePath = path.join(process.cwd(), 'content', 'home.json');
  return JSON.parse(await fs.promises.readFile(homePath, { encoding: 'utf8' })) as Home;
};
