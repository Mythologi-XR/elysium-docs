import React from 'react';
import clsx from 'clsx';
import './styles.css';
import customFields from '@site/src/customFields';
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

const Hero = () => (
  <section className="dark flex flex-1 justify-center">
    <div className="grid mx-10 px-4 py-8 gap-0 lg:py-16 md:grid-cols-12 max-w-screen-lg">
      <div className="space-y-5 mr-auto place-self-center md:col-span-5 text-center md:text-right w-full flex flex-col items-center md:items-end z-10">
        <h1 className="pt-10 md:pt-0 max-w-2xl mb-0 text-5xl font-extrabold tracking-tight leading-none lg:text-6xl dark:text-white">
          <span className="text-shadow">Build for AR.</span><br />
          <span className="text-purple-500 text-shadow-light">In AR.</span>
        </h1>
        <p className="max-w-xs mb-6 font-bold md:font-medium dark:text-white lg:mb-8 text-lg lg:text-xl text-shadow">
          Elysium is a new app for situated, no-code AR worldbuilding, publishing and discovery.
        </p>
        <a href={customFields.iosAppUrl}>
          <img src={useBaseUrl('img/app-store-button.svg')} width="200" />
        </a>
      </div>
      <div className="mt-5 md:mt-0 md:col-span-6 flex overflow-visible relative items-center app-img-container">
        <img src={useBaseUrl('img/app3.png')} alt="mockup" className="app-img"/>
      </div>                
    </div>
  </section>
)

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className="min-h-[calc(100vh_-_82px)] bg-gradient-to-tr from-rose-500 via-yellow-500 to-sky-500 flex flex-1 flex-direction-row align-items-center justify-items-center overflow-hidden">
      <Hero />
    </section>
  );
}
