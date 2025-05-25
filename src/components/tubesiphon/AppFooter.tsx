import type { FC } from 'react';

const AppFooter: FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-6 text-center">
      <p className="text-sm text-muted-foreground">
        &copy; {currentYear} TubeSiphon. All rights reserved.
      </p>
    </footer>
  );
};

export default AppFooter;
