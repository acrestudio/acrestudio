import Layout from '../components/Layout';
import Meta from '../components/Meta';
import Image from 'next/image';

export default function IndexPage() {
  return (
    <Layout>
      <Meta />
      <h1>Hi!</h1>
      <Image src="/images/sticker-mancat.png" alt="Picture of the author" />
    </Layout>
  );
}
