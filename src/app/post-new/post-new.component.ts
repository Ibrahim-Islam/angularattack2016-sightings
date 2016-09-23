import {Component, ViewChild, Inject} from '@angular/core';
import {NgClass} from '@angular/common';
import {Router, RouteParams} from '@angular/router-deprecated';
import {AngularFire, FirebaseListObservable, FirebaseRef} from 'angularfire2';
import {Post, STATUS, Geo, PostType, Notification} from '../shared/models';
import {GMap, Editor} from 'primeng/primeng';

declare var $: any;
declare var google: any;
declare var toastr: any;

@Component({
    selector: 'post-new',
    templateUrl: 'app/post-new/post-new.template.html',
    styleUrls: ['app/post-new/post-new.component.css'],
    directives: [NgClass, GMap, Editor]
})

export class PostNewComponent {
    model: Post = new Post();
    PostType = PostType;
    isLostPost = true;
    isFoundPost = false;
    @ViewChild('gmap') gmap;
    options: any;
    overlays: any[] = [];
    infoWindow: any;
    details: string = "";
    selectedPosition: any;
    imageName: string = "Select A Picture...";
    postImage: any;

    constructor(private af: AngularFire, private router: Router, @Inject(FirebaseRef) private ref: Firebase) {
    }

    ngOnInit() {
        $.material.init();

        //set initial center option
        this.options = {
            center: {lat: 36.890257, lng: 30.707417},
            zoom: 12
        };

        //create a map modal window
        this.infoWindow = new google.maps.InfoWindow();

        //if browser has geolocation support
        //get user location and center map there
        if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {
                this.gmap.getMap().setCenter({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
              }, () => {
                  console.log('could not find user current location');
              });
        }
    }

    handleMapClick(event) {
        //only show modal for selecting location if source has not been already set
        if (!this.model.source) {
            $('#setlocation').modal('show');
            this.selectedPosition = event.latLng;
        }
    }

    AddSourceLocation() {
        //hide the modal
        $('#setlocation').modal('hide');

        let lat = this.selectedPosition.lat();
        let lng = this.selectedPosition.lng();

        //add selected location to post
        let geo = new Geo();
        geo.latitude = lat;
        geo.longitude = lng;
        this.model.source = geo;

        //show the marker in map
        this.overlays.push(new google.maps.Marker({
            position:{
                lat: lat,
                lng: lng
            },
            title: this.details || 'Last known location',
            draggable: true
        }));
    }

    handleOverlayClick(event){
        let title = event.overlay.getTitle();
        this.infoWindow.setContent('' + title + '');
        this.infoWindow.open(event.map, event.overlay);
        event.map.setCenter(event.overlay.getPosition());
    }

    private isValid(): boolean {
        console.log(this.model);

        if (typeof this.model.title === 'undefined') {
            toastr.error('The title is a required field.')
            return false;
        }

        if (typeof this.model.body === 'undefined' || this.model.body.trim().length < 150) {
            toastr.error('Please describe your post with at least 150 characters.')
            return false;
        }

        if (typeof this.model.source === 'undefined') {
            toastr.error('Please select last known location of your item.')
            return false;
        }

        if (typeof this.model.type === 'undefined') {
            toastr.error('Please select the type of your post.')
            return false;
        }

        if (typeof this.postImage === 'undefined') {
            toastr.error('Please select an image for the post.')
            return false;
        }

        return true;
    }

    private setPostType(postType) {
        this.model.type = postType;
        if(postType === PostType.Lost) {
            this.isLostPost = true;
            this.isFoundPost = false;
        } else {
            this.isLostPost = false;
            this.isFoundPost = true;
        }
    }

    imageSelected(event){
        let file = event.target.files[0];
        this.imageName = file.name;

        var reader = new FileReader();
        reader.onload =  () => {
            this.postImage = reader.result;
        }
        reader.readAsDataURL(file);
    }

    private broadcastNotification(post: Post, key: string) {
        let notifications: Notification[] = [];
        let userName = this.af.auth.getAuth()[this.af.auth.getAuth().auth['provider']].displayName;

        this.ref.child('/users/').on('child_added', snapshot => {
            let u = snapshot.val();

            if(u.uid !== this.af.auth.getAuth().uid) {
                u.notifications = u.notifications || [];
                u.notifications.push(new Notification(`${userName} ${PostType[post.type]} something.`, post.type, key));
                this.ref.child(`/users/${u.uid}`).update(u);
            }
        });
    }

    create() {
        if (this.isValid()) {
            //get the login provider
            let provider = this.af.auth.getAuth().auth["provider"];

            this.model.uid = this.af.auth.getAuth().uid;
            this.model.name = this.af.auth.getAuth()[provider].displayName;
            this.model.profileImageURL = this.af.auth.getAuth()[provider].profileImageURL;
            this.model.date = Firebase.ServerValue.TIMESTAMP;

            this.ref.child('/posts/').orderByChild("id").limitToFirst(1).once('child_added', snapshot => {
                let lastRecord = snapshot.val();
                this.model.id = lastRecord.id - 1;
                this.model.image = this.postImage;
                let posts = this.af.list("/posts");
                let key = posts.push(this.model).key();

                // Broadcast notification
                this.broadcastNotification(this.model, key);

                this.router.navigate(['PostDetail', {id: key}]);
            });
        }
    }
}
