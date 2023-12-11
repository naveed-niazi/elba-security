import Header from '../Header/header';
import Footer from '../Footer/footer';
import React, { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {

  const {data} = useSession()

  console.log("data ==== ", data);

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}