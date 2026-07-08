export const TRIAL_DAYS = 7;

export const PAYMENT_METHODS = [
  { id: 'stripe', name: 'Stripe', description: 'Credit / debit card' },
  { id: 'apple_pay', name: 'Apple Pay', description: 'Quick & secure checkout' },
  { id: 'google_pay', name: 'Google Pay', description: 'Fast and easy payment' },
  { id: 'paypal', name: 'PayPal', description: 'Pay using your PayPal balance' },
] as const;

export const PAYMENT_METHOD_IDS = PAYMENT_METHODS.map((m) => m.id);
