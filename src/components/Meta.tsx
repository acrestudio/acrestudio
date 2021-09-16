import * as React from 'react';
import Head from 'next/head';
import config from '../lib/config';

export default function Meta({ title }: { title?: string }) {
  return (
    <Head>
      <title>{title ? [title, config.site_title].join(' | ') : config.site_title}</title>
    </Head>
  );
}
