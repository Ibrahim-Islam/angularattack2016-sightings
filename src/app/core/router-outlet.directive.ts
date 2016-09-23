import {Attribute, DynamicComponentLoader, Directive, ViewContainerRef} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router-deprecated';
import {AngularFire} from 'angularfire2';

@Directive({
    selector: 'auth-router-outlet'
})

export class AuthRouterOutlet extends RouterOutlet {
    publicRoutes: any;

    private parentRouter: Router;

    constructor(_viewContainerRef: ViewContainerRef, _loader: DynamicComponentLoader, parentRouter: Router, @Attribute('name') nameAttr: string, private af: AngularFire) {
        super(_viewContainerRef, _loader, parentRouter, nameAttr);

        this.publicRoutes = [''];
        this.parentRouter = parentRouter;
    }

    activate(instruction) {
        if (this._canActivate(instruction.urlPath)) {
            return super.activate(instruction);
        } else {
            this.parentRouter.navigate(['Welcome']);
        }
    };

    _canActivate(url) {
        if (this.publicRoutes.indexOf(url) !== -1 || this.af.auth.getAuth()) {
            return true;
        }

        return false;
    };
}
