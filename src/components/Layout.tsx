import * as React from 'react';
import Head from 'next/head';
import Navigation from './Navigation';

const Layout: React.FC<{ title?: string; description?: string; image?: string }> = ({
  title,
  description,
  image,
  children,
}) => {
  return (
    <div className="root">
      <Head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={description} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content="https://acrestudio.art/" />
        <meta property="og:site_name" content="ACRE Studio" />
        <meta property="og:locale" content="en_US" />

        <link href="/assets/favicons/site.webmanifest" rel="manifest" />
        <link href="/favicon.ico" rel="icon" />
        <link href="/assets/favicons/icon.svg" rel="icon" type="image/svg+xml" />
        <link href="/assets/favicons/icon-apple.png" rel="apple-touch-icon" />
        <meta content="#161c2d" name="theme-color" />

        <link
          as="font"
          crossOrigin="anonymous"
          href="/assets/fonts/Inter-roman.var.woff2"
          rel="preload"
          type="font/woff2"
        />
      </Head>
      <nav>
        <Navigation />
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
