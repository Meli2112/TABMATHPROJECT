import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Star, Zap } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { paymentService } from '@/services/paymentService'
import { useAuth } from '@/contexts/AuthContext'

interface SubscriptionPlansProps {
  onPlanSelected?: (planId: string) => void
}

export default function SubscriptionPlans({ onPlanSelected }: SubscriptionPlansProps) {
  const { user } = useAuth()
  const [plans, setPlans] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>('premium')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const subscriptionPlans = await paymentService.getSubscriptionPlans()
      setPlans(subscriptionPlans)
    } catch (error) {
      console.error('Error loading plans:', error)
    }
  }

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      onPlanSelected?.(planId)
      return
    }

    setIsLoading(true)
    try {
      const plan = plans.find(p => p.id === planId)
      if (plan?.priceId && user) {
        const { clientSecret } = await paymentService.createSubscription(plan.priceId, user.id)
        // Handle payment confirmation
        onPlanSelected?.(planId)
      }
    } catch (error) {
      console.error('Error selecting plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="w-6 h-6" />
      case 'premium':
        return <Zap className="w-6 h-6" />
      case 'pro':
        return <Crown className="w-6 h-6" />
      default:
        return <Star className="w-6 h-6" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'from-gray-500 to-gray-600'
      case 'premium':
        return 'from-pink-500 to-purple-600'
      case 'pro':
        return 'from-yellow-500 to-orange-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gradient mb-4">
          Choose Your Relationship Journey
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select the plan that best fits your relationship goals. 
          Dr. Marcie is ready to guide you at any level.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02, y: -5 }}
            className="relative"
          >
            <Card 
              className={`p-8 text-center relative overflow-hidden ${
                selectedPlan === plan.id ? 'ring-2 ring-pink-500' : ''
              }`}
            >
              {plan.id === 'premium' && (
                <Badge 
                  variant="primary" 
                  className="absolute top-4 right-4"
                >
                  Most Popular
                </Badge>
              )}

              <div className={`w-16 h-16 bg-gradient-to-r ${getPlanColor(plan.id)} rounded-full flex items-center justify-center mx-auto mb-6 text-white`}>
                {getPlanIcon(plan.id)}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {plan.name}
              </h3>

              <div className="mb-6">
                {plan.price === 0 ? (
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Free
                  </div>
                ) : (
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 ml-1">
                      /month
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center text-left">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className="w-full"
                variant={plan.id === 'premium' ? 'primary' : 'secondary'}
                isLoading={isLoading && selectedPlan === plan.id}
                disabled={isLoading}
              >
                {plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
              </Button>

              {plan.price > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  7-day free trial, then ${plan.price}/month
                </p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          All plans include Dr. Marcie's signature relationship guidance
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
          <span>✓ Cancel anytime</span>
          <span>✓ 30-day money-back guarantee</span>
          <span>✓ Secure payments</span>
        </div>
      </div>
    </div>
  )
}