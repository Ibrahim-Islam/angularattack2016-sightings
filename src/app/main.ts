import {bootstrap} from '@angular/platform-browser-dynamic';
import {ROUTER_PROVIDERS} from '@angular/router-deprecated';
import {provide} from '@angular/core';
import {FIREBASE_PROVIDERS, defaultFirebase, firebaseAuthConfig, AuthProviders, AuthMethods} from 'angularfire2';
import {AppComponent} from './app.component';
import {SharedService} from './shared/services';

bootstrap(AppComponent, [
    SharedService,
    FIREBASE_PROVIDERS,
    defaultFirebase('https://shining-inferno-1807.firebaseio.com'),
    firebaseAuthConfig({
        method: AuthMethods.Popup,
        provider: AuthProviders.Github
    }),
    ROUTER_PROVIDERS
])
.catch(err => console.error(err));
