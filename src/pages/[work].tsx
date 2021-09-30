import { GetStaticProps, GetStaticPaths } from 'next';
import Layout from '../components/layout';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { getPicture, Image, Picture, resizeImage } from '../lib/image';
import { Tag, Work } from '../lib/content';
import { getIndexFromCache, getWorkFromCache, getWorksFromCache } from '../lib/cache';
import Link from 'next/link';
import { Arrow } from '../components/arrow';

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
      <article className="mx-auto px-4 max-w-6xl">
        <div className="py-14 sm:py-24">
          {tags.length > 0 && (
            <div className="mb-10 text-gray-300 text-xs font-bold tracking-widest uppercase">
              {tags.map(tag => tag.name).join(', ')}
            </div>
          )}

          <ReactMarkdown
            className="text-white space-y-6"
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-5xl font-bold tracking-tighter md:text-7xl lg:text-8xl" {...props} />
              ),
              h2: ({ node, ...props }) => <h1 className="text-4xl font-bold" {...props} />,
              h3: ({ node, ...props }) => <h1 className="text-xl font-bold" {...props} />,
              h4: ({ node, ...props }) => <h1 className="text-lg font-bold" {...props} />,
              h5: ({ node, ...props }) => <h1 className="text-base font-bold leading-7" {...props} />,
              h6: ({ node, ...props }) => <h1 className="text-sm font-bold leading-7" {...props} />,
              ul: ({ node, ...props }) => <ul className="leading-7 list-inside list-disc" {...props} />,
              ol: ({ node, ...props }) => <ol className="leading-7 list-inside list-decimal" {...props} />,
              p: ({ node, ...props }) => <p className="leading-7" {...props} />,
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noreferrer"
                  {...props}
                />
              ),
            }}>
            {text}
          </ReactMarkdown>
        </div>

        <div className="space-y-14">
          {images.map(({ width, height, picture: { sources, img } }, i) => (
            <div key={i} className="relative block max-h-screen overflow-hidden">
              <div style={{ paddingTop: (height * 100) / width + '%' }} />
              <picture key={img.src}>
                {sources.map((source, i) => (
                  <source key={i} {...source} sizes="(min-width: 72rem) 70rem, calc(100vw - 2rem)" />
                ))}
                <img
                  className="absolute inset-0 w-full h-full object-contain object-left-top"
                  {...img}
                  alt=""
                  loading="lazy"
                />
              </picture>
            </div>
          ))}
        </div>
      </article>

      {previous && next && (
        <div className="flex justify-between mx-auto px-2 py-14 max-w-6xl sm:py-24">
          <Link href={'/' + previous.id}>
            <a className="text-left">
              <div className="inline-flex p-2 text-gray-300 hover:text-white whitespace-nowrap text-xs font-bold tracking-widest uppercase transition-colors">
                <Arrow className="mr-2.5 w-4 h-4 transform rotate-180" /> {previous.title}
              </div>
            </a>
          </Link>
          <Link href={'/' + next.id}>
            <a className="text-right">
              <div className="inline-flex p-2 text-gray-300 hover:text-white whitespace-nowrap text-xs font-bold tracking-widest uppercase transition-colors">
                {next.title} <Arrow className="ml-2.5 w-4 h-4" />
              </div>
            </a>
          </Link>
        </div>
      )}
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
  const index = await getIndexFromCache();
  const widths = [686, 1120, 1680, 2240];
  // title
  const title = work.title + ' – acre · Jesse Hickey';
  // thumbs
  const image = !work.image ? '' : (await resizeImage({ image: work.image, width: 2240 })).url;
  const images: (Image & { picture: Picture })[] = [];
  for (const img of work.images) {
    images.push({
      ...img,
      picture: await getPicture(
        img,
        widths.map(width => ({ width })),
      ),
    });
  }
  // previous / next
  const listedWorks = index.works;
  const i = listedWorks.findIndex(({ id }) => work.id === id);
  const previous = i === -1 ? null : listedWorks[(i - 1 + listedWorks.length) % listedWorks.length];
  const next = i === -1 ? null : listedWorks[(i + 1) % listedWorks.length];
  // return props
  const props: WorkProps = { ...work, title, image, images, previous, next };
  return { props };
};
