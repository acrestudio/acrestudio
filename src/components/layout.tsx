import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const Nav = () => (
  <nav className="flex justify-between items-center max-w-6xl mx-auto p-2">
    <Link href="/">
      <a className="text-xl p-2">
        <span className="text-white font-bold">acre</span>
        <span className="text-blue-300 px-1 font-bold"> · </span>
        <span className="text-gray-400 lowercase font-medium">Jesse Hickey</span>
      </a>
    </Link>
    <Link href="https://www.instagram.com/acre.sketches/">
      <a className="p-2" target="_blank" rel="noreferrer">
        <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path
            fill="#fff"
            d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
          />
        </svg>
      </a>
    </Link>
  </nav>
);

const Layout: React.FC<{ title?: string; description?: string; image?: string }> = ({
  title,
  description,
  image,
  children,
}) => {
  return (
    <>
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
      <Nav />
      <main>{children}</main>
      <Nav />
    </>
  );
};

export default Layout;
