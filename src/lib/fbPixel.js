// Meta Pixel Helper Utility
// Pixel ID: 4644854332416201

/**
 * Track a standard Meta Pixel event
 * @param {string} eventName - Standard event name (e.g. 'PageView', 'AddToCart')
 * @param {object} params - Optional event parameters
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, params);
  }
};

/**
 * Track a custom Meta Pixel event
 * @param {string} eventName - Custom event name
 * @param {object} params - Optional event parameters
 */
export const trackCustomEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, params);
  }
};

/** Fire when user views a product */
export const trackViewContent = (product) => {
  trackEvent('ViewContent', {
    content_name: product?.name || '',
    content_ids: [product?.id || ''],
    content_type: 'product',
    value: product?.price || 0,
    currency: 'BDT',
  });
};

/** Fire when user adds item to cart */
export const trackAddToCart = (product, quantity = 1) => {
  trackEvent('AddToCart', {
    content_name: product?.name || '',
    content_ids: [product?.id || ''],
    content_type: 'product',
    value: (product?.price || 0) * quantity,
    currency: 'BDT',
    num_items: quantity,
  });
};

/** Fire when user reaches checkout page */
export const trackInitiateCheckout = (cartItems = [], totalValue = 0) => {
  trackEvent('InitiateCheckout', {
    content_ids: cartItems.map(item => item.id),
    num_items: cartItems.length,
    value: totalValue,
    currency: 'BDT',
  });
};

/** Fire when user completes a purchase / order */
export const trackPurchase = (orderId, totalValue = 0, items = []) => {
  trackEvent('Purchase', {
    order_id: orderId,
    content_ids: items.map(item => item.id),
    num_items: items.length,
    value: totalValue,
    currency: 'BDT',
  });
};

/** Fire when user submits a contact / inquiry form */
export const trackLead = () => {
  trackEvent('Lead');
};

/** Fire on every route/page change */
export const trackPageView = () => {
  trackEvent('PageView');
};
