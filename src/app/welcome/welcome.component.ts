import {Component, ViewChild, OnInit, Inject} from '@angular/core';
import {AngularFire, FirebaseRef} from 'angularfire2';
import {Router} from '@angular/router-deprecated';
import {GMap, Editor} from 'primeng/primeng';

declare var $: any;
declare var google: any;

@Component({
    selector: 'welcome',
    templateUrl: 'app/welcome/welcome.component.html',
    styleUrls: ["app/welcome/welcome.component.css"],
    directives: [GMap, Editor]
})

export class WelcomeComponent implements OnInit{

    options: any;
    defaultCenter: any = {lat: 23.796575608641923, lng: 90.40353298187256};
    mapCenter: any = {};
    @ViewChild('gmap') gmap;
    overlays: any[] = [];
    infoWindow: any;
    posts: any[] = [];

    constructor(private af: AngularFire, private router: Router, @Inject(FirebaseRef) private ref: Firebase) {
    }

    addMarkers() {
        this.posts.forEach((post,val) => {
            this.overlays.push(new google.maps.Marker({
                position:{
                    lat: post.source.latitude,
                    lng: post.source.longitude
                },
                title: 'posted by '+post.name
            }));
            if(post.source.latitude) {
                let mapCenter = {lat:post.source.latitude, lng:post.source.longitude};
                this.gmap.getMap().setCenter(mapCenter);
            }
        });
    }

    handleOverlayClick(event){
        let title = event.overlay.getTitle();
        this.infoWindow.setContent(title);
        this.infoWindow.open(event.map, event.overlay);
        event.map.setCenter(event.overlay.getPosition());
    }

    ngOnInit() {
        /* Map section */
        this.options = {
            center: this.defaultCenter,
            zoom: 10
        };

        this.infoWindow = new google.maps.InfoWindow();
        
        if(this.af.auth.getAuth()) {
            this.router.navigate(['PostList']);
        }

        this.ref.child('/posts/')
            .orderByChild("id")
            .limitToLast(10)
            .on('child_added', snapshot => {
                this.posts.push(snapshot.val());
                this.addMarkers();
            });
    }
}
