import Layout from '../components/Layout';
import Meta from '../components/Meta';
import { GetStaticProps } from 'next';
import { fetchItems, Item } from '../lib/items';
import ItemList from '../components/ItemList';

export default function IndexPage({ items }: { items: Item[] }) {
  return (
    <Layout>
      <Meta />
      <h1>Hi!!</h1>
      <ItemList items={items} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const items = await fetchItems();
  return { props: { items } };
};
