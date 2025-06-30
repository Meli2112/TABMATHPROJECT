import { supabase } from '@/lib/supabase'

class PaymentService {
  private publishableKey: string

  constructor() {
    this.publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
  }

  async createSubscription(priceId: string, userId: string): Promise<{ clientSecret: string }> {
    const { data, error } = await supabase.functions.invoke('create-subscription', {
      body: { priceId, userId }
    })

    if (error) throw new Error('Failed to create subscription')
    return data
  }

  async getSubscriptionPlans(): Promise<any[]> {
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
          'Basic challenges',
          'Limited Dr. Marcie interactions',
          'Basic scoring',
          'Community support'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        priceId: 'price_premium_monthly',
        features: [
          'All challenges unlocked',
          'Unlimited Dr. Marcie conversations',
          'Advanced analytics',
          'SOS Fight Solver',
          'Custom consequences',
          'Priority support'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 19.99,
        priceId: 'price_pro_monthly',
        features: [
          'Everything in Premium',
          'Personalized therapy plans',
          'Video calls with Dr. Marcie',
          'Relationship coaching',
          'Advanced AI insights',
          'White-glove support'
        ]
      }
    ]
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId }
    })

    if (error) throw new Error('Failed to cancel subscription')
  }

  async updatePaymentMethod(subscriptionId: string, paymentMethodId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('update-payment-method', {
      body: { subscriptionId, paymentMethodId }
    })

    if (error) throw new Error('Failed to update payment method')
  }
}

export const paymentService = new PaymentService()