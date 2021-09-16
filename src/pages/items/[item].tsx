import { GetStaticProps, GetStaticPaths } from 'next';
import { fetchItems, Item } from '../../lib/items';
import Layout from '../../components/Layout';
import Meta from '../../components/Meta';
import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function ItemPage({ data, content }: Item) {
  return (
    <Layout>
      <Meta title={data.title} />
      <article>
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = fetchItems().map(item => '/items/' + item.data.slug);
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { item: slug } = context.params as { item: string };
  const item = fetchItems().find(item => item.data.slug === slug)!;
  return { props: item };
};
