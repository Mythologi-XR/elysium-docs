import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

export default function Home(): JSX.Element {
  const {siteConfig: { tagline }} = useDocusaurusContext();
  return (
    <Layout description={tagline}>
        <HomepageFeatures />
    </Layout>
  );
}
