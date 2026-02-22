import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css'
import InstaLogo from '../../static/img/instagram-new-outline.svg'
import LinkedinLogo from '../../static/img/linkedin-solid.svg'
import TwitterLogo from '../../static/img/twitter-solid.svg'
import { PopupButton } from '@typeform/embed-react'

export default function App() {

  return (
    <div className={styles.background}>

      {/* socials - desktop*/}
      <div className='hidden md:flex absolute md:right-0 bottom-0 z-50 mb-3 mr-3 flex-row backdrop-blur-md bg-[rgb(234,255,195)]/20 rounded-full p-5 max-w-sm'>
        <a href="https://www.instagram.com/elysium.xr/" target='_blank'><InstaLogo className='mr-4'/></a>
        <a href="https://twitter.com/elysiumXR" target='_blank'><TwitterLogo className='mr-4'/></a>
        <a href="https://www.linkedin.com/company/elysiumxr/" target='_blank'><LinkedinLogo className='mr-4'/></a>
      </div>

      {/* elysium logo */}
      <div className='absolute left-0 top-0 z-50 flex flex-row mt-[.6rem] ml-[.2rem] '>
        <img src={useBaseUrl('img/elysium-logo-light.png')} width="300" className='hidden md:inline-block'/>
        <img src={useBaseUrl('img/elysium-logo-light-mob.png')} width="97" className='md:hidden inline-block'/>
      </div>

      {/* main content */}
      <div className='md:h-full h-screen w-full flex justify-center content-center flex-wrap mt-16 md:mt-0'>
        <div className={`z-50 backdrop-blur-md bg-[rgb(234,255,195)]/20 self-center p-10 rounded-[3rem] flex flex-col align-center content-center ${styles.unselectable} mx-5`} >
          <span className={`text-center ${styles.heading}`}>
            Shape your reality.
          </span>
          <span className={`text-black mt-5 self-center text-center ${styles.copy}`}>
            Introducing <b>Elysium</b>, our no-code AR world-building platform.
          </span>
          <span className={`text-black text-center self-center ${styles.copy}`}>
            Join the waitlist to receive updates about our next launch.
          </span>
          <div className='self-center mt-9'>
            <PopupButton id="BzV7hDhi" className={`self-center rounded-2xl bg-lime-100 md:hover:bg-cyan-200 md:hover:transition-all md:hover:ease-in-out border-solid border-white border-[1px] flex md:hover:duration-500 md:duration-500 cursor-pointer ${styles.cta}`}>
                Join the waitlist
            </PopupButton>
          </div>
        </div>
          <div className='md:hidden flex mt-8 z-50 mb-3 mr-3 flex-row backdrop-blur-md bg-[rgb(234,255,195)]/20 rounded-full p-5 max-w-sm'>
          <a href="https://www.instagram.com/elysium.xr/" target='_blank'><InstaLogo className='mr-4'/></a>
          <a href="https://twitter.com/elysiumXR" target='_blank'><TwitterLogo className='mr-4'/></a>
          <a href="https://www.linkedin.com/company/elysiumxr/" target='_blank'><LinkedinLogo className='mr-4'/></a>
        </div>
      </div>
    </div>
  );
}
