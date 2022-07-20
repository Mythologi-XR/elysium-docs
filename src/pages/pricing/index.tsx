import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { PricingTable } from '@site/src/components/Pricing';

export default function Pricing(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout description={"Elysium is free in beta"} title="Pricing">
      <main className="dark">
        <PricingTable />
      </main>
    </Layout>
  );
}
