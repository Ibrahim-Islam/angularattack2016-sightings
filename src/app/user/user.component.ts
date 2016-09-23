import {Component, Inject} from '@angular/core';
import {AngularFire, FirebaseRef} from 'angularfire2';
import {User} from '../shared/models';
import {RouteParams, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {SharedService} from '../shared/services';

declare var toastr:any;

@Component({
    selector: 'user',
    templateUrl: 'app/user/user.component.html',
    directives: [ROUTER_DIRECTIVES]
})

export class UserComponent {
    model: User = new User();
    owner: boolean = this.routeParams.get('id') === this.af.auth.getAuth().uid;

    constructor(@Inject(FirebaseRef) private ref: Firebase, private af: AngularFire, private routeParams: RouteParams, private sharedService: SharedService) {
        this.sharedService.isGlobalLoading = true;
        this.ref.child(`/users/${this.routeParams.get('id')}`).once('value', snapshot => {
            this.model = snapshot.val();
            this.sharedService.isGlobalLoading = false;
        });
    }

    save() {
        if(this.owner) {
            this.sharedService.isGlobalLoading = true;
            this.ref.child(`/users/${this.af.auth.getAuth().uid}`).update(this.model).then(() => {
                this.sharedService.isGlobalLoading = false;
                toastr.success('Profile updated successfully.')
            });
        }
    }
}
