import React from 'react';
import clsx from 'clsx';
import type {Props} from '@theme/Footer/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import customFields from '@site/src/customFields';
import styles from './styles.module.css';

const FooterContent = () => {
  return (
    <div className={styles.footerContent}>
      <img
        alt="Elysium logo"
        height={50}
        src={useBaseUrl('/img/elysium-logo-mono.svg')}
        title="Elysium - no-code world building studio for augmented reality"
      />
      <p className='my-5'>
        Elysium is a no-code creator studio and player application for interactive augmented reality experiences.
      </p>
      <a href={customFields.iosAppUrl}>
        <img src={useBaseUrl('img/app-store-button.svg')} width="120" />
      </a>
    </div>
  )
}

export default function FooterLayout({
  style,
  links,
  logo,
  copyright,
}: Props) {
  return (
    <footer
      className={clsx('footer', {
        'footer--dark': style === 'dark',
      })}>
      <div className="container container-fluid">
        <div className={styles.footerColumns}>
          <FooterContent />
          {links}
        </div>
        {(logo || copyright) && (
          <div className="footer__bottom text--center">
            {logo && <div className="margin-bottom--sm">{logo}</div>}
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}