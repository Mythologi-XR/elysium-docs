import React from 'react'
import { PricingCard } from './PricingCard'

export { PricingCard } from './PricingCard'
export { PricingGrid } from './PricingGrid'

export const PricingTable = () => (
  <section className="bg-white dark:bg-gray-900">
    <div className="py-8 px-4 mx-auto md:max-w-screen-md sm:max-w-screen-sm lg:py-16 lg:px-6">
      <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Get started for free</h2>
        <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-200">
          All the features and space you need to start building and publishing.
        </p>
      </div>
      <div className="space-y-8 lg:grid lg:grid-cols-2 sm:gap-6 lg:space-y-0">
        <PricingCard 
          title='Personal'
          description="We're committed to maintaining a generous personal plan that will remain free forever."
          price='Free'
          pricePeriod='for good!'
          items={[
            {
              description: 'One private world',
              included: true
            },
            {
              description: 'Unlimited private scenes',
              included: true
            },
            {
              description: '3 public scenes',
              included: true
            },
            {
              description: '10 GB asset storage',
              included: true
            },
            {
              description: 'Unlimited bandwidth',
              included: true
            },
            {
              description: 'Publish up to 30 assets on our global CDN',
              included: true
            },
          ]}
        />
        <PricingCard 
          title='Professional & Enterprise'
          description="We're still working on pricing and features for professional and enterprise users."
          price='TBD'
          pricePeriod=''
          items={[
            {
              description: 'Publish more worlds & scenes',
              included: true
            },
            {
              description: 'Upload & publish more assets',
              included: true
            },
            {
              description: 'Collaborate with team members',
              included: true
            },
            {
              description: 'Advanced analytics and reporting',
              included: true
            },
            {
              description: '...',
              included: true
            },
            {
              description: 'Get in touch on [Discord](https://discord.gg/Dvdmu3saNp) with your ideas!',
              included: true
            },
          ]}
        />
      </div>
    </div>
  </section>
)