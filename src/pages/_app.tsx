import { AppProps } from 'next/app';
import 'tailwindcss/tailwind.css';
import '../../public/assets/css/global.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
