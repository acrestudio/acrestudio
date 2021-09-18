import * as React from 'react';
import Head from 'next/head';

export default function Meta({ title }: { title?: string }) {
  return (
    <Head>
      <title>{title ?? 'oida'}</title>
    </Head>
  );
}
