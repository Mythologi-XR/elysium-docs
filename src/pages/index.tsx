import Spline from '@splinetool/react-spline';
import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css'
import InstaLogo from '../../static/img/instagram-new-outline.svg'
import LinkedinLogo from '../../static/img/linkedin-solid.svg'
import TwitterLogo from '../../static/img/twitter-solid.svg'
import { PopupButton } from '@typeform/embed-react'
import { useMediaQuery } from 'react-responsive'

export default function App() {

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  return (
    <div className={styles.background}>

      {/* socials */}
      <div className='absolute right-0 bottom-0 z-50 mb-3 mr-3 flex flex-row backdrop-blur-md bg-[rgb(234,255,195)]/20 rounded-full p-5'>
        <a href="https://www.instagram.com/elysium.xr/" target='_blank'><InstaLogo className='mr-4'/></a>
        <a href="https://twitter.com/elysiumXR" target='_blank'><TwitterLogo className='mr-4'/></a>
        <a href="https://www.linkedin.com/company/elysiumxr/" target='_blank'><LinkedinLogo className='mr-3'/></a>
        {/* <ElysiumLogo/> */}
      </div>
      
      {/* elysium logo */}
      <div className='absolute left-0 top-0 z-50 flex flex-row mt-[.6rem] ml-[.2rem] '>
        {
         !isMobile ?
        <img src={useBaseUrl('img/elysium-logo-light.png')} width="300"/>
        : <img src={useBaseUrl('img/elysium-logo-light-mob.png')} width="97"/>
        }
        {/* <img src={useBaseUrl('img/Elysium-Full_dark.png')} width="300"/> */}
      </div>

      {/* main content */}
      <div className='h-full w-full flex justify-center content-center flex-wrap'>
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
            <PopupButton id="BzV7hDhi" className={`self-center rounded-2xl bg-lime-100 hover:bg-cyan-200 hover:transition-all hover:ease-in-out border-solid border-white border-[1px] flex hover:duration-500 duration-500 cursor-pointer ${styles.cta}`}>
                Join the waitlist
            </PopupButton>
          </div>
        </div>
      </div>

      {/* spline component renders a container div and canvas element */}
      <Spline scene="https://prod.spline.design/53anxYhJwY5vn9g8/scene.splinecode" className={styles.spline}/>
    </div>
  );
}
