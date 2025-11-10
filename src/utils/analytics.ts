// Google Analytics + RudderStack utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    rudderanalytics?: {
      track: (event: string, properties?: Record<string, any>) => void;
      page: (category?: string, name?: string, properties?: Record<string, any>) => void;
      identify: (userId: string, traits?: Record<string, any>) => void;
      alias: (newId: string, previousId?: string) => void;
      reset: () => void;
      getAnonymousId: () => string;
      ready: (callback: () => void) => void;
    };
  }
}

// Check if gtag is available
const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Track page views
export const trackPageView = (url: string, title?: string): void => {
  if (!isGtagAvailable()) return;
  
  window.gtag('config', 'G-PWZM3DK5MW', {
    page_path: url,
    page_title: title || document.title,
  });
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (!isGtagAvailable()) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track form submissions
export const trackFormSubmission = (formName: string, success: boolean = true): void => {
  trackEvent(
    success ? 'form_submit_success' : 'form_submit_error',
    'engagement',
    formName,
    success ? 1 : 0
  );
};

// Track CTA clicks
export const trackCTAClick = (ctaName: string, location: string): void => {
  trackEvent('cta_click', 'engagement', `${ctaName} - ${location}`);
};

// Track competitive analysis requests
export const trackCompetitiveAnalysisRequest = (email: string, domain?: string): void => {
  trackEvent('competitive_analysis_request', 'lead_generation', domain || 'no_domain');
  
  // Track as conversion (email is used for conversion tracking context)
  window.gtag('event', 'conversion', {
    send_to: 'G-PWZM3DK5MW',
    event_category: 'lead_generation',
    event_label: 'free_analysis_form',
    user_id: email, // Use email for user identification
  });
};

// Track pricing interactions
export const trackPricingInteraction = (plan: string, action: 'view' | 'click'): void => {
  trackEvent(`pricing_${action}`, 'business', plan);
};

// Track testimonial interactions
export const trackTestimonialView = (testimonialId: string): void => {
  trackEvent('testimonial_view', 'engagement', testimonialId);
};

// Track scroll depth
export const trackScrollDepth = (percentage: number): void => {
  trackEvent('scroll_depth', 'engagement', `${percentage}%`, percentage);
};

// Track time on page
export const trackTimeOnPage = (seconds: number): void => {
  trackEvent('time_on_page', 'engagement', undefined, seconds);
};

// Enhanced ecommerce tracking (for future use)
export const trackPurchase = (transactionId: string, value: number, items: any[]): void => {
  if (!isGtagAvailable()) return;
  
  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'USD',
    items: items,
  });
};

// Track user engagement
export const trackUserEngagement = (engagementType: string, details?: string): void => {
  trackEvent(engagementType, 'user_engagement', details);
};

// ===================================================================
// RUDDERSTACK INTEGRATION (Added 2025-11-10)
// ===================================================================

// Check if RudderStack is available
const isRudderStackAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.rudderanalytics !== 'undefined';
};

// Helper to get device type
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Helper to get page category
const getPageCategory = (): string => {
  const path = window.location.pathname.toLowerCase();
  if (path === '/' || path === '/index.html') return 'home';
  if (path.includes('/pricing')) return 'pricing';
  if (path.includes('/features')) return 'features';
  if (path.includes('/about')) return 'about';
  if (path.includes('/contact')) return 'contact';
  if (path.includes('/blog')) return 'blog';
  return 'other';
};

/**
 * Track event to both GA4 and RudderStack
 */
export const trackDualEvent = (eventName: string, properties?: Record<string, any>): void => {
  // Track in GA4 (existing)
  trackEvent(eventName, properties?.category || 'engagement', properties?.label);

  // Track in RudderStack (new)
  if (isRudderStackAvailable()) {
    window.rudderanalytics!.track(eventName, {
      ...properties,
      page_category: getPageCategory(),
      device_type: getDeviceType(),
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Identify user in RudderStack
 */
export const identifyUser = (userId: string, traits?: Record<string, any>): void => {
  if (!isRudderStackAvailable()) return;

  window.rudderanalytics!.identify(userId, {
    ...traits,
    identified_at: new Date().toISOString(),
  });
};

/**
 * Track button click (dual tracking)
 */
export const trackButtonClickDual = (buttonText: string, category?: string): void => {
  trackDualEvent('Button Clicked', {
    button_text: buttonText,
    button_category: category || 'general',
    category: 'engagement',
    label: buttonText,
  });
};

/**
 * Track form submission (dual tracking)
 */
export const trackFormSubmitDual = (formName: string, success: boolean = true): void => {
  // GA4
  trackFormSubmission(formName, success);

  // RudderStack
  if (isRudderStackAvailable()) {
    window.rudderanalytics!.track(success ? 'Form Submitted' : 'Form Error', {
      form_name: formName,
      success,
    });
  }
};

/**
 * Track demo request (enhanced for dual tracking)
 */
export const trackDemoRequestDual = (email: string, formData?: Record<string, any>): void => {
  // GA4 (existing)
  trackCompetitiveAnalysisRequest(email, formData?.domain);

  // RudderStack (new)
  if (isRudderStackAvailable()) {
    window.rudderanalytics!.track('Demo Requested', {
      email,
      ...formData,
    });
  }
};

/**
 * Track pricing interaction (enhanced for dual tracking)
 */
export const trackPricingInteractionDual = (plan: string, action: 'view' | 'click'): void => {
  // GA4 (existing)
  trackPricingInteraction(plan, action);

  // RudderStack (new)
  if (isRudderStackAvailable()) {
    window.rudderanalytics!.track(action === 'view' ? 'Pricing Viewed' : 'Pricing Plan Selected', {
      plan,
      action,
    });
  }
};