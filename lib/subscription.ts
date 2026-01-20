// Centralized subscription and admin management
// Handles trial periods, admin exemption, and subscription status

// Admin emails - users who bypass all payment requirements
export const ADMIN_EMAILS = [
  'mickyblenk@gmail.com',
  'admin@liftplannerpro.org',
]

// Subscription configuration
export const SUBSCRIPTION_CONFIG = {
  price: 19, // £19/month
  currency: 'gbp',
  trialDays: 7,
  priceId: process.env.STRIPE_PRICE_ID || 'price_1RrBNCFzzHwoqssW6DtAPF2N', // Update this in Stripe
}

// Check if a user is an admin
export function isAdmin(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Calculate trial end date for new users
export function getTrialEndDate(): Date {
  const now = new Date()
  now.setDate(now.getDate() + SUBSCRIPTION_CONFIG.trialDays)
  return now
}

// Check if user's trial has expired
export function isTrialExpired(trialEndsAt?: Date | null): boolean {
  if (!trialEndsAt) return true
  return new Date() > new Date(trialEndsAt)
}

// Check if user has active subscription
export function hasActiveSubscription(
  subscription?: string | null,
  trialEndsAt?: Date | null
): boolean {
  // Active paid subscription
  if (subscription && subscription !== 'free' && subscription !== 'trial') {
    return true
  }
  
  // Still in trial period
  if (subscription === 'trial' && trialEndsAt && !isTrialExpired(trialEndsAt)) {
    return true
  }
  
  return false
}

// Get subscription status for a user
export interface SubscriptionStatus {
  isAdmin: boolean
  hasAccess: boolean
  inTrial: boolean
  trialDaysLeft: number
  subscriptionTier: string
  needsPayment: boolean
}

export function getSubscriptionStatus(
  email?: string | null,
  subscription?: string | null,
  trialEndsAt?: Date | null
): SubscriptionStatus {
  const userIsAdmin = isAdmin(email)
  
  // Admins always have full access
  if (userIsAdmin) {
    return {
      isAdmin: true,
      hasAccess: true,
      inTrial: false,
      trialDaysLeft: 0,
      subscriptionTier: 'admin',
      needsPayment: false,
    }
  }
  
  // Check if in trial
  const now = new Date()
  const trialEnd = trialEndsAt ? new Date(trialEndsAt) : null
  const inTrial = subscription === 'trial' && trialEnd && now < trialEnd
  
  // Calculate trial days left
  let trialDaysLeft = 0
  if (inTrial && trialEnd) {
    const msLeft = trialEnd.getTime() - now.getTime()
    trialDaysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
  }
  
  // Check subscription
  const hasPaidSubscription = subscription && 
    subscription !== 'free' && 
    subscription !== 'trial'
  
  const hasAccess = hasPaidSubscription || inTrial
  
  return {
    isAdmin: false,
    hasAccess: hasAccess ?? false,
    inTrial: !!inTrial,
    trialDaysLeft,
    subscriptionTier: subscription || 'free',
    needsPayment: !hasAccess,
  }
}

// Format price for display
export function formatPrice(): string {
  return `£${SUBSCRIPTION_CONFIG.price}`
}

// Get trial end message
export function getTrialMessage(daysLeft: number): string {
  if (daysLeft <= 0) return 'Your trial has expired'
  if (daysLeft === 1) return '1 day left in your trial'
  return `${daysLeft} days left in your trial`
}

