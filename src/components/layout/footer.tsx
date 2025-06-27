'use client';

import { useState, useEffect } from 'react';

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="text-center p-4 text-sm text-muted-foreground">
      <p>&copy; {year}{year && ' '}Annadata AI. Empowering Farmers with Technology.</p>
    </footer>
  );
}
