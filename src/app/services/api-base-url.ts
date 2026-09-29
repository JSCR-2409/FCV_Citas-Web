import { InjectionToken } from '@angular/core';

declare global {
  interface Window {
    __FCV_CONFIG__?: { apiBaseUrl?: string };
  }
}

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => {
    if (typeof window !== 'undefined' && window.__FCV_CONFIG__?.apiBaseUrl) {
      return window.__FCV_CONFIG__.apiBaseUrl.replace(/\/$/, '');
    }
    return 'http://localhost:8080/api/v1';
  },
});
