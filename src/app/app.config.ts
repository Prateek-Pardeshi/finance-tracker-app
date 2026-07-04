import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import localeIn from '@angular/common/locales/en-IN';
import { routes } from './app.routes';
import { APP_BASE_HREF, registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ConfigService } from './services/config.service';

registerLocaleData(localeIn);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withFetch()),
    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      
      return configService.loadMetadata();
    }),
    { provide: APP_BASE_HREF, useValue: '/finance-tracker-app/#' }
  ]
};
