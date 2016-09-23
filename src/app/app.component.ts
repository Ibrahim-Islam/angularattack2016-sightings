import {Component, Inject} from '@angular/core';
import {Router, Route, RouteConfig, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {AngularFire, FirebaseRef} from 'angularfire2';
import {WelcomeComponent} from './welcome/welcome.component';
import {PostListComponent} from './post-list/post-list.component';
import {PostDetailComponent} from './post-detail/post-detail.component';
import {PostNewComponent} from './post-new/post-new.component';
import {AuthRouterOutlet} from './core/router-outlet.directive';
import {UserComponent} from './user/user.component';
import {User, Notification} from './shared/models';
import {SharedService} from './shared/services';

declare var $:any;

@Component({
    selector: 'app',
    templateUrl: 'app/app.component.html',
    styles:['.container-fluid {padding-left: 0 !important;padding-right: 0 !important;}'],
    directives: [ROUTER_DIRECTIVES, AuthRouterOutlet]
})

@RouteConfig([
    new Route({ path: '/', component: WelcomeComponent, name: 'Welcome', useAsDefault: true }),
    new Route({ path: '/posts/new', component: PostNewComponent, name: 'PostNew' }),
    new Route({ path: '/posts', component: PostListComponent, name: 'PostList' }),
    new Route({ path: '/posts/:id', component: PostDetailComponent, name: 'PostDetail' }),
    new Route({ path: '/users/:id', component: UserComponent, name: 'User' }),
    { path: '/**', redirectTo: ['Welcome'] }
])

export class AppComponent {
    user: User = new User();
    notifications: Notification[] = [];

    constructor(public af: AngularFire, private router: Router, @Inject(FirebaseRef) private ref: Firebase, public sharedService: SharedService) {
        if(this.af.auth.getAuth()) {
            this.ref.child(`/users/${this.af.auth.getAuth().uid}`).once('value', snapshot => {
                this.notifications = snapshot.val().notifications || [];
            });
        }
    }

    login() {
        this.af.auth.login().then(authData => {
            this.ref.child(`/users/${authData.uid}`).once('value', snapshot => {
                if(snapshot.val() === null) {
                    this.user.uid = authData.uid;
                    this.user.name = authData.github.displayName;
                    this.user.email = authData.github.email;
                    this.user.profileImageURL = authData.github.profileImageURL;
                    this.user.date = Firebase.ServerValue.TIMESTAMP;

                    this.ref.child(`/users/${authData.uid}`).set(this.user);
                }
                this.router.navigate(['PostList']);
            });
        }).catch(err => console.error(err));
    }

    logout() {
        this.af.auth.logout();
        this.router.navigate(['Welcome']);
    }

    clearNotifications() {
        this.ref.child(`/users/${this.af.auth.getAuth().uid}`).once('value', snapshot => {
            let model = snapshot.val();
            model.notifications = [];
            this.ref.child(`/users/${this.af.auth.getAuth().uid}`).update(model).then(() => this.notifications = []);
        });
    }

    redirectToDetails(postId) {
        $('#notifications-dialog').modal('hide');
        this.clearNotifications();
        this.router.navigate(['PostDetail', {id: postId}]);
    }
}
