import React from 'react';
import clsx from 'clsx';
import type {Props} from '@theme/Footer/Layout';
import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

const FooterContent = () => {
  return (
    <div className={styles.footerContent}>
      <img
        alt="Elysium logo"
        height={50}
        src={useBaseUrl('/img/elysium-logo-mono.svg')}
        title="Elysium - no-code world building studio for augmented reality"
      />
      <p>
        Elysium is a no-code creator studio and player application for interactive augmented reality experiences.
      </p>
      <a href="#">
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
}: Props): JSX.Element {
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