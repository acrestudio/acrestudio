import { GetStaticProps, GetStaticPaths } from 'next';
import { fetchItems, Item } from '../lib/items';
import Layout from '../components/Layout';
import Meta from '../components/Meta';
import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function ItemPage(item: Item) {
  return (
    <Layout>
      <Meta title={item.title} />
      <article>
        <small>{item.category}</small>
        <ReactMarkdown>{item.content}</ReactMarkdown>
        {item.images.map(image => (
          <div key={image.src} style={{ position: 'relative', width: '200px', backgroundColor: image.color }}>
            <div style={{ paddingTop: (image.height * 100) / image.width + '%' }} />
            <img
              width={image.width}
              height={image.height}
              src={image.src}
              alt=""
              style={{ position: 'absolute', width: '100%', height: '100%', inset: 0 }}
            />
          </div>
        ))}
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = (await fetchItems()).map(item => '/' + item.slug);
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { item: slug } = context.params as { item: string };
  const items = await fetchItems();
  const item = items.find(item => item.slug === slug)!;
  return { props: item };
};
