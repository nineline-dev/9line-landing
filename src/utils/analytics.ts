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

// ===================================================================
// ENHANCED TRACKING - ADVANCED ANALYTICS (Added 2025-11-10)
// ===================================================================

/**
 * Get UTM parameters from URL (attribution tracking)
 */
const getUTMParameters = (): Record<string, string | null> => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  };
};

/**
 * Get enriched context (all advanced tracking fields)
 */
const getEnrichedContext = (): Record<string, any> => {
  return {
    // Device & Browser
    device_type: getDeviceType(),
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    browser_language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    user_agent: navigator.userAgent,

    // Page context
    page_category: getPageCategory(),
    page_url: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    referrer: document.referrer,
    referrer_domain: document.referrer ? new URL(document.referrer).hostname : null,

    // Attribution
    ...getUTMParameters(),

    // Technical
    connection_type: (navigator as any).connection?.effectiveType || 'unknown',
    timestamp: new Date().toISOString(),
  };
};

/**
 * Enhanced track function with all context
 */
export const trackEnhanced = (eventName: string, properties?: Record<string, any>): void => {
  const enrichedProps = {
    ...getEnrichedContext(),
    ...properties,
  };

  // Track in both GA4 and RudderStack
  trackEvent(eventName, enrichedProps.category || 'engagement', enrichedProps.label);

  if (isRudderStackAvailable()) {
    window.rudderanalytics!.track(eventName, enrichedProps);
  }
};

/**
 * Track first-touch attribution (store in localStorage)
 */
export const trackFirstTouch = (): void => {
  const FIRST_TOUCH_KEY = '9line_first_touch';

  if (!localStorage.getItem(FIRST_TOUCH_KEY)) {
    const firstTouch = {
      ...getUTMParameters(),
      referrer: document.referrer,
      landing_page: window.location.href,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(firstTouch));

    if (isRudderStackAvailable()) {
      window.rudderanalytics!.track('First Touch', firstTouch);
    }
  }
};

/**
 * Track rage clicks (frustrated user behavior)
 */
let clickCounts: Record<string, number> = {};
export const detectRageClicks = (element: HTMLElement): void => {
  const elementId = element.id || element.className || 'unknown';
  clickCounts[elementId] = (clickCounts[elementId] || 0) + 1;

  if (clickCounts[elementId] >= 5) {
    trackEnhanced('Rage Click Detected', {
      element_id: elementId,
      click_count: clickCounts[elementId],
    });
    clickCounts[elementId] = 0; // Reset
  }
};

/**
 * Track errors (JavaScript errors)
 */
export const setupErrorTracking = (): void => {
  window.addEventListener('error', (event) => {
    trackEnhanced('JavaScript Error', {
      error_message: event.message,
      error_source: event.filename,
      error_line: event.lineno,
      error_column: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackEnhanced('Promise Rejection', {
      error_message: event.reason?.message || event.reason,
    });
  });
};

/**
 * Track visibility changes (tab switching)
 */
let pageVisibleStart = Date.now();
export const setupVisibilityTracking = (): void => {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      const visibleDuration = Math.floor((Date.now() - pageVisibleStart) / 1000);
      trackEnhanced('Page Hidden', {
        visible_duration_seconds: visibleDuration,
      });
    } else {
      pageVisibleStart = Date.now();
      trackEnhanced('Page Visible', {});
    }
  });
};

/**
 * Auto-initialize enhanced tracking
 */
if (typeof window !== 'undefined') {
  // Track first touch
  trackFirstTouch();

  // Setup error tracking
  setupErrorTracking();

  // Setup visibility tracking
  setupVisibilityTracking();

  console.log('[9line Analytics] Enhanced tracking initialized');
}