import {Component, Inject} from '@angular/core';
import {RouteParams} from '@angular/router-deprecated';
import {AngularFire, FirebaseRef, FirebaseListObservable} from 'angularfire2';
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {SharedService} from '../shared/services';
import {PostType, STATUS} from '../shared/models';
import {Observable} from 'rxjs/Rx';

declare var $: any;

@Component({
    selector: "post-list",
    templateUrl: "app/post-list/post-list.component.html",
    styleUrls: ["app/post-list/post-list.component.css"],
    directives: [ROUTER_DIRECTIVES],
    providers: [SharedService]
})

export class PostListComponent {
    posts: any[] = [];
    private offset: number = 3;
    private lastStartFrom: number;
    PostType = PostType;
    STATUS = STATUS;
    loading: boolean;

    constructor(private af: AngularFire, private sharedService: SharedService, @Inject(FirebaseRef) private ref: Firebase) {
        this.loading = true;
        this.ref.child('/posts/')
                .orderByChild("id")
                .limitToFirst(1)
                .once('child_added', snapshot => {
                    let lastRecord = snapshot.val();
                    let start = lastRecord.id;
                    let end = start + this.offset;
                    this.loading = false;
                    this.pushData(start, end);
                });
    }

    pushData(startAt, endAt){
        this.lastStartFrom = endAt;
        this.ref.child('/posts/')
            .orderByChild("id")
            .startAt(startAt)
            .endAt(endAt)
            .on('child_added', snapshot => {
                let post = snapshot.val();
				post.body = post.body.replace(/<(?:.|\n)*?>/gm, '');
                post.key = snapshot.key();
                this.posts.push(post);
            });
    }

    ngAfterViewInit(){
        $(window).scroll(() => {
            if (window.scrollY == document.body.scrollHeight - window.innerHeight) {
                let start = this.lastStartFrom + 1;
                let to = start + this.offset;
                this.pushData(start, to);
            }
        });
    }
}
