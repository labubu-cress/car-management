import React from 'react';
import { Header } from './Header';
import * as styles from './Layout.css';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}; 