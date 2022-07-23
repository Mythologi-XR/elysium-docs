import React from "react";
import useBaseUrl from '@docusaurus/useBaseUrl';
import './styles.css'

export interface Partner {
  name: string
  url: string
  logo: string
}

export const partners: Partner[] = [
  {
    name: 'C2 Montreal',
    url: 'https://www.c2montreal.com/',
    logo: 'partners/c2.jpg'
  },
  {
    name: 'Chromatic',
    url: 'https://www.chromatic.ca/',
    logo: 'partners/chromatic.jpg'
  },
  {
    name: 'Invision AI',
    url: 'https://invision.ai/',
    logo: 'partners/invision.jpg'
  },
  {
    name: 'MAPP',
    url: 'https://mattmtl.com/',
    logo: 'partners/mapp.jpg'
  },
  {
    name: 'MASSIVart',
    url: 'https://massivart.com/',
    logo: 'partners/massiv-art.jpg'
  },
  {
    name: 'Moment Factory',
    url: 'https://momentfactory.com/',
    logo: 'partners/moment-factory.jpg'
  },
  {
    name: 'Metaverse Standards Forum',
    url: 'https://metaverse-standards.org/',
    logo: 'partners/msf.jpg'
  },
  {
    name: 'MUTEK',
    url: 'https://mutek.org/',
    logo: 'partners/mutek.jpg'
  },
  {
    name: 'OASIS immersion',
    url: 'https://oasis.im/',
    logo: 'partners/oasis.jpg'
  },
  {
    name: 'PHI',
    url: 'https://phi.ca/en',
    logo: 'partners/phi.jpg'
  },
  {
    name: 'PME MTL',
    url: 'https://pmemtl.com/en',
    logo: 'partners/pme-montreal.jpg'
  },
  {
    name: 'POP Montreal',
    url: 'https://popmontreal.com/',
    logo: 'partners/pop-montreal.jpg'
  },
  {
    name: 'R&D Partners',
    url: 'https://www.r-dpartners.com/',
    logo: 'partners/rd-partners.jpg'
  },
  {
    name: 'Universitat Pompeu Fabra',
    url: 'https://upf.edu',
    logo: 'partners/upf.jpg'
  },
  {
    name: 'valtech_',
    url: 'https://www.valtech.com/',
    logo: 'partners/valtech.jpg'
  },
  {
    name: 'Zú',
    url: 'https://zumtl.com/en/',
    logo: 'partners/zu-montreal.jpg'
  }
];

export const PartnerThumb = ({ partner }: { partner: Partner }) => (
  <a href={partner.url} target="_blank" className="flex w-[100px] lg:w-[120px] mx-2 my-2 border-gray-800 hover:border-gray-200 border border-solid">
    <img src={useBaseUrl(`img/${partner.logo}`)} title={partner.name} />
  </a>
)

export const PartnersBlock = () => (
  <div className="text-center flex flex-col items-center md:mx-10">
    <h1>Our Partners</h1>
    <div className="flex flex-row flex-wrap justify-center my-3 max-w-screen-lg">
      {partners.map((partner, key) => (
        <PartnerThumb key={key} partner={partner} />
      ))}
    </div>
  </div>
)