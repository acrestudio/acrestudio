import Layout from '../components/Layout';
import Meta from '../components/Meta';
import { GetStaticProps } from 'next';
import { fetchItems, Item } from '../lib/items';
import ItemList from '../components/ItemList';
import { fetchHome } from '../lib/home';
import { Category, fetchCategories } from '../lib/categories';

export default function IndexPage({
  title,
  description,
  image,
  items,
  categories,
}: {
  title: string;
  description: string;
  image: string;
  items: Item[];
  categories: Category[];
}) {
  return (
    <Layout>
      <Meta title={title} description={description} image={image} />
      <h1>Hi!!</h1>
      <ItemList items={items} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const home = await fetchHome();
  const allItems = await fetchItems();
  const items = home.items.map(x => allItems.find(y => y.slug === x.item)).filter(x => x !== undefined);
  const allCategories = await fetchCategories();
  const categories = home.categories
    .map(x => allCategories.find(y => y.slug === x.category))
    .filter(x => x !== undefined);
  return { props: { ...home, items, categories } };
};
