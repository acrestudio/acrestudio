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
      <article className="max-w-6xl mx-auto px-4">
        <div className="py-14 sm:py-24">
          {tags.length > 0 && (
            <div className="text-gray-300 text-xs uppercase font-bold tracking-widest mb-10">
              {tags.map(tag => tag.name).join(', ')}
            </div>
          )}

          <ReactMarkdown
            className="text-white space-y-6"
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter" {...props} />
              ),
              h2: ({ node, ...props }) => <h1 className="font-bold text-4xl" {...props} />,
              h3: ({ node, ...props }) => <h1 className="font-bold text-xl" {...props} />,
              h4: ({ node, ...props }) => <h1 className="font-bold text-lg" {...props} />,
              h5: ({ node, ...props }) => <h1 className="font-bold text-base leading-7" {...props} />,
              h6: ({ node, ...props }) => <h1 className="font-bold text-sm leading-7" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside leading-7" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside leading-7" {...props} />,
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
                  <source key={i} {...source} />
                ))}
                <img className="absolute w-full h-full inset-0 object-contain object-left-top" {...img} alt="" />
              </picture>
            </div>
          ))}
        </div>
      </article>

      {previous && next && (
        <div className="max-w-6xl mx-auto px-2 flex justify-between py-14 sm:py-24">
          <Link href={'/' + previous.id}>
            <a className="text-left">
              <div className="hover:text-white transition-colors text-gray-300 text-xs uppercase font-bold tracking-widest whitespace-nowrap inline-flex p-2">
                <Arrow className="h-4 w-4 mr-2.5 transform rotate-180" /> {previous.title}
              </div>
            </a>
          </Link>
          <Link href={'/' + next.id}>
            <a className="text-right">
              <div className="hover:text-white transition-colors text-gray-300 text-xs uppercase font-bold tracking-widest whitespace-nowrap inline-flex p-2">
                {next.title} <Arrow className="h-4 w-4 ml-2.5" />
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
