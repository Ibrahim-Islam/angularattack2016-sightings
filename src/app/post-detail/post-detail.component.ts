import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {RouteParams} from '@angular/router-deprecated';
import {AngularFire, FirebaseRef} from 'angularfire2';
import {GMap, Editor} from 'primeng/primeng';
import { Geo, Sighting } from '../shared/models';

declare var $: any;
declare var google: any;
declare var toastr:any;

@Component({
    selector: "post-detail",
    templateUrl: "app/post-detail/post-detail.template.html",
    styleUrls: ["app/post-detail/post-detail.component.css"],
    directives: [GMap, Editor]
})
export class PostDetailComponent implements OnInit
{
    post: any = {};
    options: any;
    defaultCenter: any = {lat: 36.890257, lng: 30.707417};
    postCenter: any = {};
    @ViewChild('gmap') gmap;
    overlays: any[] = [];
    owner: boolean = false;
    selectedPosition: any;
    details: string;
    infoWindow: any;
    postid: string;

    constructor(@Inject(FirebaseRef) private ref: Firebase, private routeParams: RouteParams, private af: AngularFire){
        this.postid = this.routeParams.get('id');
    }

    handleMapClick(event) {
        if (this.post.status === "Open") {
            $('#setlocation').modal('show');
            this.selectedPosition = event.latLng;
        } else {
            toastr.info("This post is already solved. Please see another post.");
        }
    }

    handleOverlayClick(event){
        let title = event.overlay.getTitle();
        this.infoWindow.setContent(title);
        this.infoWindow.open(event.map, event.overlay); 
        event.map.setCenter(event.overlay.getPosition());
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
        
        //show the marker in map
        this.overlays.push(new google.maps.Marker({
            position:{
                lat: lat, 
                lng: lng
            }, 
            title: this.getMapWindowMarkup(this.details, this.af.auth.getAuth().uid), 
            draggable: true
        }));
        
        let sighting = new Sighting();
        sighting.coordinates = geo;
        sighting.title = this.details;
        sighting.uid = this.af.auth.getAuth().uid;
        
        if (!this.post.sightings) {
            this.post.sightings = [];
        }
        this.post.sightings.push(sighting);      
        this.ref.child('/posts/' + this.postid)
            .update(this.post)
            .then(() => toastr.success('Your sighting has been added'));
    }

    markAsResolve() {
        this.post.status = 'Closed';
        this.ref.child('/posts/' + this.postid).update(this.post).then(() => toastr.success('Case Resolved.'));
    }

    getMapWindowMarkup(text: string, uid: string){
        uid = uid || this.af.auth.getAuth().uid;
        return '"' + text + '" - <a href=' + window.location.origin + '/users/' + uid + '>'+ this.af.auth.getAuth()[this.af.auth.getAuth().auth['provider']].displayName +'</a>';
    }

    ngOnInit(){
        //create a map modal window        
        this.infoWindow = new google.maps.InfoWindow();
        
        $.material.init();
        /* share buttons add */
        var addShareBtnDom = $('#shareBtnDom').children()
        $('#share-button').append(addShareBtnDom);

        /* Comments section add */
        var disqus_config = function () {
            this.page.url = '/posts/';  // PAGE_URL
            this.page.identifier = this.postid; // page's unique identifier variable
        };

        (function() {
            var d = document, s = d.createElement('script');

            s.src = '//aattack-sightings.disqus.com/embed.js';

            s.setAttribute('data-timestamp', new Date().toString());
            (d.head || d.body).appendChild(s);
        })();

        /* Map section */
        this.options = {
            center: this.defaultCenter,
            zoom: 14
        };       
        
        this.ref.child('/posts/' + this.postid).once('value', post => {
            this.post = post.val();
            this.owner = this.af.auth.getAuth().uid === this.post.uid;
          
            this.postCenter = {lat: this.post.source.latitude,lng: this.post.source.longitude};
            
            let component = this;            
            setTimeout(function() {
                component.gmap.getMap().setCenter(component.postCenter);
            }, 10);
            
            this.overlays.push(new google.maps.Marker({
                position:this.postCenter,
                title: 'Last Known Location'
            }));
            
            //if sightings property exists then loop and add them to the map
            if (this.post.sightings) {
                (<any[]>this.post.sightings).forEach((s, i) => {
                    this.overlays.push(new google.maps.Marker({
                        position: {lat: s.coordinates.latitude,lng: s.coordinates.longitude},
                        title: this.getMapWindowMarkup(s.title, s.uid)
                    }));
                });
            }
        });
        
    }
}
