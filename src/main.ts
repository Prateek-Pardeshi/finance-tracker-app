import { bootstrapApplication } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environment';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),

    provideFirebaseApp(() =>
      initializeApp(environment.firebaseConfig)
    ),

    provideFirestore(() =>
      getFirestore()
    )
  ]
})
  .catch((err) => console.error(err));
