import React from 'react'
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans'

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
      <SubscriptionPlans 
        onPlanSelected={(planId) => {
          console.log('Plan selected:', planId)
          // Handle plan selection
        }}
      />
    </div>
  )
}