import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

type FeatureItem = {
  title: string;
  imgSrc: string;
  description?: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Elysium: the AR authoring engine',
    imgSrc: '/img/app-slides/elysium-1.jpg',
  },
  {
    title: 'Create AR experiences',
    imgSrc: '/img/app-slides/elysium-2.jpg',
  },
  {
    title: 'Browse & collect 3D assets',
    imgSrc: '/img/app-slides/elysium-3.jpg',
  },
  {
    title: 'Tether your work to the real world',
    imgSrc: '/img/app-slides/elysium-4.jpg',
  },
  {
    title: 'Manage images, 3D art and more',
    imgSrc: '/img/app-slides/elysium-5.jpg',
  },
  {
    title: 'Add real-world interaction',
    imgSrc: '/img/app-slides/elysium-6.jpg',
  },
];

function Feature({title, imgSrc, description}: FeatureItem) {
  return (
    <img className={styles.featureImage} src={useBaseUrl(imgSrc)} title={title} />
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className={styles.featureRow}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
      </div>
    </section>
  );
}
