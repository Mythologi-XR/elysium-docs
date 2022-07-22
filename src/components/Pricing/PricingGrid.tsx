import React from 'react'

export const PricingGrid = ({ children }) => (
  <div className="dark lg:grid lg:grid-cols-2 sm:gap-6 pt-6">
    {children}
  </div>
)