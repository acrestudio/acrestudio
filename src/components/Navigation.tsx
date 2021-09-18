import Link from 'next/link';

export default function Navigation() {
  return (
    <ul>
      <li>
        <Link href="/">
          <a>about</a>
        </Link>
      </li>
    </ul>
  );
}
