import React from 'react';
import NavbarLayout from '@theme/Navbar/Layout';
import NavbarContent from '@theme/Navbar/Content';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Navbar() {
  const { siteConfig: { url } } = useDocusaurusContext();
  return (
    <NavbarLayout>
      <Head>
        <meta property="og:image" content={`${url}/img/elysium-og.jpg`} />
      </Head>
      <NavbarContent />
    </NavbarLayout>
  );
}