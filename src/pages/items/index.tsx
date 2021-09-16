import { GetStaticProps } from 'next';
import Layout from '../../components/Layout';
import Meta from '../../components/Meta';
import ItemList from '../../components/ItemList';
import { fetchItems, Item } from '../../lib/items';

export default function ItemsPage({ items }: { items: Item[] }) {
  const url = '/items';
  const title = 'All items';
  return (
    <Layout>
      <Meta title={title} />
      <ItemList items={items} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const items = fetchItems();
  return { props: { items } };
};
