import React from 'react';
import { Item } from '../lib/items';
import Link from 'next/link';

export default function ItemList({ items }: { items: Item[] }) {
  return (
    <div>
      <div>
        <ul>
          {items.map((item, i) => (
            <li key={i}>
              <Link href={'/items/' + item.data.slug}>
                <a>{item.data.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
