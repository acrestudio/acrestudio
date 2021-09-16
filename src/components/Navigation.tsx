import Link from 'next/link';

export default function Navigation() {
  return (
    <ul>
      <li>
        <Link href="/">
          <a>about</a>
        </Link>
      </li>
      <li>
        <Link href="/items">
          <a>blog</a>
        </Link>
      </li>
    </ul>
  );
}
