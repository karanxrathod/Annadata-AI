
import { Sprout } from 'lucide-react';
import { HelpDialog } from './help-dialog';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <Sprout className="w-8 h-8 mr-3" />
          <h1 className="text-2xl font-bold tracking-tight font-headline">
            Annadata AI
          </h1>
        </div>
        <HelpDialog />
      </div>
    </header>
  );
}
