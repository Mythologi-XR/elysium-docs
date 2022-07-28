import React from 'react';
import './styles.css';
import customFields from '@site/src/customFields';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { PartnersBlock } from './partners';

const Hero = () => (
  <div className="dark flex flex-1 justify-center max-h-[calc(100vh_-_82px)] hero-container">
    <div className="grid mx-10 px-4 py-8 gap-0 lg:py-16 md:grid-cols-12 max-w-screen-lg">
      <div className="space-y-5 mr-auto place-self-center md:col-span-5 text-center md:text-right w-full flex flex-col items-center md:items-end z-10">
        <h1 className="pt-10 md:pt-0 max-w-2xl mb-0 text-5xl font-extrabold tracking-tighter leading-none lg:text-6xl dark:text-white">
          <span className="text-shadow-light-softer">Build for AR.</span><br />
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
        <img src={useBaseUrl('img/app3.png')} className="app-img"/>
      </div>                
    </div>
  </div>
)

export default function HomepageFeatures(): JSX.Element {
  return (
    <>
      <section className="min-h-[calc(100vh_-_82px)] max-h-[calc(100vh_+_50px)] bg-gradient-to-tr from-rose-500 via-yellow-500 to-sky-500 flex flex-1 flex-direction-row align-items-center justify-items-center overflow-hidden">
        <Hero />
      </section>
      <section className="my-10">
        <PartnersBlock />
      </section>
    </>
  );
}
