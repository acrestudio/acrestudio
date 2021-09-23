import Layout from '../components/Layout';
import { GetStaticProps } from 'next';
import { Tag, Work } from '../lib/content';
import { getPicture, Image, Picture, resizeImage } from '../lib/image';
import Masonry from 'react-masonry-component';
import React, { useState } from 'react';
import { getIndexFromCache } from '../lib/cache';
import Link from 'next/link';

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
      setVisibleWorks(works.filter(work => work.tags.some(tag => tag.id === tagId)));
    }
  };

  return (
    <Layout {...{ title, description, image }}>
      <h1>Hi!!</h1>

      <ul>
        <li>
          <button onClick={() => filterBy('*')}>All works</button>
        </li>
        {tags.map((tag, i) => (
          <li key={i}>
            <button className={activeTag === tag.id ? 'font-bold' : ''} onClick={() => filterBy(tag.id)}>
              {tag.name}
            </button>
          </li>
        ))}
      </ul>

      <Masonry options={{ transitionDuration: 1000 }}>
        {visibleWorks.map(work => (
          <Link key={work.id} href={'/' + work.id}>
            <a className="relative bg-gray-100 block" style={{ width: '200px' }}>
              <div style={{ paddingTop: (work.image.height * 100) / work.image.width + '%' }} />
              <picture>
                {work.picture.sources.map((source, i) => (
                  <source key={i} {...source} />
                ))}
                <img className="absolute w-full h-full inset-0" {...work.picture.img} alt="" />
              </picture>
            </a>
          </Link>
        ))}
      </Masonry>
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
