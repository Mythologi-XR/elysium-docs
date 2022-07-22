import React from 'react'

export const PricingGrid = ({ children }) => (
  <div className="dark grid grid-cols-2 gap-6 pt-6">
    {children}
  </div>
)