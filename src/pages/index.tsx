import Layout from '../components/layout';
import { GetStaticProps } from 'next';
import { Tag, Work } from '../lib/content';
import { getPicture, Image, Picture, resizeImage } from '../lib/image';
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
  works: (Work & { image: Image; picture: Picture })[];
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
      <div className="max-w-6xl mx-auto px-2 md:flex justify-between items-center py-8 sm:py-16 md:py-32">
        <div className="md:w-7/12 px-2 py-6">
          <div className="font-bold tracking-widest uppercase text-white mb-10 text-xs leading-relaxed text-gray-300">
            Illustrator, Graphic Designer, Traveler
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-bold tracking-tighter">
            I design digital crafts for clients.
          </h1>
          <button className="rounded-full tracking-widest font-bold px-8 py-5 text-white bg-blue-300 uppercase inline-flex items-center mt-12 text-xs hover:bg-white hover:text-blue-300 transition-colors">
            Explore Works
            <Arrow className="h-6 w-6 ml-5" />
          </button>
        </div>
        <div className="md:w-5/12 px-2 max-w-md py-6">
          <img className="w-full" src="/assets/images/jesse.png" alt="" />
        </div>
      </div>

      <ul className="max-w-6xl mx-auto flex flex-wrap px-2 pb-8">
        {filter.map((tag, i) => (
          <li key={i} className="py-2 pr-4 md:pr-8 lg:pr-16">
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

      <div className="max-w-6xl mx-auto">
        <Masonry options={{ transitionDuration: 1000 }}>
          {visibleWorks.map(work => (
            <div key={work.id} className="p-4 w-full sm:w-6/12 lg:w-4/12">
              <Link href={'/' + work.id}>
                <a className="relative block group">
                  <div style={{ paddingTop: (work.image.height * 100) / work.image.width + '%' }} />
                  <picture>
                    {work.picture.sources.map((source, i) => (
                      <source key={i} {...source} />
                    ))}
                    <img className="absolute w-full h-full inset-0" {...work.picture.img} alt="" />
                  </picture>
                  <div className="group-hover:opacity-100 transform border-gray-400 border-opacity-30 border text-blue-300 bg-white tracking-widest hover:bg-blue-300 hover:text-white transition-all font-bold opacity-0 absolute top-2 left-2 uppercase text-xs py-2.5 px-4 rounded-full flex items-center">
                    {work.title}
                    <Arrow className="h-4 w-4 ml-2.5" />
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </Masonry>
      </div>

      <div className="max-w-2xl mx-auto p-2 py-32 lg:py-48 text-center">
        <div className="text-4xl md:text-5xl lg:text-6xl text-white font-bold tracking-tighter">
          <span className="leading-tight">Do you have illustration project? Let’s talk.</span>
        </div>
        <a
          className="email rounded-full tracking-widest font-bold px-8 py-5 text-white bg-blue-300 uppercase inline-flex items-center mt-12 text-xs hover:bg-white hover:text-blue-300 transition-colors cursor-pointer"
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
  const image = !index.image ? '' : (await resizeImage({ image: index.image, width: 200 })).url;
  const works: (Work & { image: Image; picture: Picture })[] = [];
  for (const work of index.works) {
    if (work.image === null) continue;
    works.push({ ...work, image: work.image, picture: await getPicture(work.image, [{ width: 200 }]) });
  }
  const props: IndexProps = { ...index, image, works };
  return { props };
};
