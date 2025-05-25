import { Youtube } from 'lucide-react';
import type { FC } from 'react';

const AppHeader: FC = () => {
  return (
    <header className="py-6">
      <div className="container mx-auto flex items-center space-x-3">
        <Youtube className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          TubeSiphon
        </h1>
      </div>
    </header>
  );
};

export default AppHeader;
