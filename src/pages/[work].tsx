import { GetStaticProps, GetStaticPaths } from 'next';
import Layout from '../components/Layout';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { getPicture, Image, Picture, resizeImage } from '../lib/image';
import { Tag, Work } from '../lib/content';
import { getIndexFromCache, getWorkFromCache, getWorksFromCache } from '../lib/cache';
import Link from 'next/link';

type WorkProps = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: Tag[];
  text: string;
  images: (Image & { picture: Picture })[];
  previous: Work | null;
  next: Work | null;
};

export default function ItemPage({ title, description, image, tags, text, images, previous, next }: WorkProps) {
  return (
    <Layout {...{ title, description, image }}>
      <article>
        <small>{tags.map(tag => tag.name).join(', ')}</small>
        <ReactMarkdown>{text}</ReactMarkdown>
        {images.map(({ width, height, picture: { sources, img } }, i) => (
          <div key={i} className="relative bg-gray-100 block" style={{ width: '200px' }}>
            <div style={{ paddingTop: (height * 100) / width + '%' }} />
            <picture key={img.src}>
              {sources.map((source, i) => (
                <source key={i} {...source} />
              ))}
              <img className="absolute w-full h-full inset-0" {...img} alt="" />
            </picture>
          </div>
        ))}
        {previous && next && (
          <>
            <Link href={'/' + previous.id}>
              <a>{previous.title}</a>
            </Link>
            |
            <Link href={'/' + next.id}>
              <a>{next.title}</a>
            </Link>
          </>
        )}
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = (await getWorksFromCache()).map(item => '/' + item.id);
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async context => {
  const { work: id } = context.params as { work: string };
  const work = (await getWorkFromCache(id))!;
  // thumbs
  const image = !work.image ? '' : (await resizeImage({ image: work.image, width: 200 })).url;
  const images: (Image & { picture: Picture })[] = [];
  for (const img of work.images) {
    images.push({ ...img, picture: await getPicture(img, [{ width: 200 }]) });
  }
  // previous / next
  const { works: listedWorks } = await getIndexFromCache();
  const i = listedWorks.findIndex(({ id }) => work.id === id);
  const previous = i === -1 ? null : listedWorks[(i - 1 + listedWorks.length) % listedWorks.length];
  const next = i === -1 ? null : listedWorks[(i + 1) % listedWorks.length];
  // return props
  const props: WorkProps = { ...work, image, images, previous, next };
  return { props };
};
