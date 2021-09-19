import * as React from 'react';
import Head from 'next/head';

export default function Meta({ title, description, image }: { title?: string; description?: string; image?: string }) {
  return (
    <Head>
      <title>{title ?? 'oida'}</title>
    </Head>
  );
}
