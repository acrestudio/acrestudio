import Layout from '../components/layout';
import { GetStaticProps } from 'next';
import { Tag, Work } from '../lib/content';
import { Image, resizeImage, Thumb } from '../lib/image';
import Masonry from 'react-masonry-component';
import React, { useState } from 'react';
import { getIndexFromCache } from '../lib/cache';
import Link from 'next/link';
import { Arrow } from '../components/arrow';

export type IndexProps = {
  title: string;
  description: string;
  image: string;
  tags: Tag[];
  works: (Work & { image: Image; thumb: Thumb })[];
};

export default function IndexPage({ title, description, image, tags, works }: IndexProps) {
  const [visibleWorks, setVisibleWorks] = useState(works);
  const [activeTag, setActiveTag] = useState('*');

  const filterBy = (tagId: string) => {
    if (tagId === '*') {
      setActiveTag('*');
      setVisibleWorks(works);
    } else {
      setActiveTag(tagId);
      setVisibleWorks(works.filter(work => work.tags.some(tag => tagId === '*' || tag.id === tagId)));
    }
  };

  const filter = [{ id: '*', name: 'All Works' }, ...tags];

  return (
    <Layout {...{ title, description, image }}>
      <div className="items-center justify-between mx-auto px-2 py-8 max-w-6xl sm:py-16 md:flex md:py-32">
        <div className="px-2 py-6 md:w-7/12">
          <div className="mb-10 text-gray-300 text-white text-xs font-bold tracking-widest leading-relaxed uppercase">
            Illustrator, Graphic Designer, Teacher
          </div>
          <h1 className="text-white tracking-tighter">
            <div className="text-5xl font-bold md:text-6xl lg:text-7xl">Hi, I’m Jesse!</div>
            <div className="pt-6 text-3xl font-medium md:text-4xl lg:text-5xl">
              <span className="leading-tight">Illustrator, designer and art educator from California</span>
            </div>
          </h1>
          <button
            className="inline-flex items-center mt-12 px-8 py-5 hover:text-blue-300 text-white text-xs font-bold tracking-widest bg-blue-300 hover:bg-white rounded-full uppercase transition-colors"
            onClick={() => document.querySelector('#tags')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore Works
            <Arrow className="ml-5 w-6 h-6" />
          </button>
        </div>
        <div className="px-2 py-6 max-w-md md:w-5/12">
          <picture>
            <source
              srcSet="/assets/images/jesse-1x.avif 1x, /assets/images/jesse-1.5x.avif 1.5x, /assets/images/jesse-2x.avif 2x"
              type="image/avif"
            />
            <source
              srcSet="/assets/images/jesse-1x.jpg 1x, /assets/images/jesse-1.5x.jpg 1.5x, /assets/images/jesse-2x.jpg 2x"
              type="image/jpeg"
            />
            <img className="w-full" src="/assets/images/jesse-2x.jpg" alt="" width="864" height="929" />
          </picture>
        </div>
      </div>

      <ul className="flex flex-wrap mx-auto pb-8 px-2 max-w-6xl" id="tags">
        {filter.map((tag, i) => (
          <li key={i} className="pr-4 py-2 md:pr-8 lg:pr-16">
            <button
              className={`uppercase font-bold p-2 tracking-widest text-xs whitespace-nowrap hover:text-white transition-colors ${
                activeTag === tag.id ? 'text-blue-300' : 'text-gray-300'
              }`}
              onClick={() => filterBy(tag.id)}>
              {tag.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="mx-auto max-w-6xl">
        <Masonry options={{ transitionDuration: 1000 }}>
          {visibleWorks.map(work => (
            <div key={work.id} className="inline-block p-4 w-full sm:w-6/12 lg:w-4/12">
              <Link href={'/' + work.id}>
                <a className="group relative block">
                  <div style={{ paddingTop: (work.image.height * 100) / work.image.width + '%' }} />
                  <img
                    className="absolute inset-0 w-full h-full"
                    src={work.thumb.url}
                    width={work.image.width}
                    height={work.image.height}
                    alt=""
                    loading="lazy"
                  />
                  <div className="absolute left-2 top-2 flex items-center px-4 py-2.5 text-blue-300 hover:text-white text-xs font-bold tracking-widest hover:bg-blue-300 bg-white border border-gray-400 border-opacity-30 rounded-full opacity-0 group-hover:opacity-100 transform uppercase transition-all">
                    {work.title}
                    <Arrow className="ml-2.5 w-4 h-4" />
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </Masonry>
      </div>

      <div className="mx-auto p-2 py-32 max-w-2xl text-center lg:py-48">
        <div className="text-white text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
          <span className="leading-tight">Do you have illustration project? Let’s talk.</span>
        </div>
        <a
          className="email inline-flex items-center mt-12 px-8 py-5 hover:text-blue-300 text-white text-xs font-bold tracking-widest bg-blue-300 hover:bg-white rounded-full cursor-pointer uppercase transition-colors"
          data-name="jesse"
          data-domain="acrestudio"
          data-tld="art"
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            const { name, domain, tld } = event.currentTarget.dataset;
            window.location.href = `mailto:${name}@${domain}.${tld}`;
            return false;
          }}
        />
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const index = await getIndexFromCache();
  const image = !index.image ? '' : (await resizeImage({ image: index.image, width: 2240 })).url;
  const works: (Work & { image: Image; thumb: Thumb })[] = [];
  for (const work of index.works) {
    if (work.image === null) continue;
    works.push({
      ...work,
      image: work.image,
      thumb: await resizeImage({ image: work.image, width: 686 }),
    });
  }
  const props: IndexProps = { ...index, image, works };
  return { props };
};
