"use client";

import { useEffect } from "react";

console.log('Journal layout module loading');

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('JournalLayout render start');

  useEffect(() => {
    console.log('JournalLayout mounted');
    return () => {
      console.log('JournalLayout unmounted');
    };
  }, []);

  console.log('JournalLayout rendering children');
  return <div>{children}</div>;
}

