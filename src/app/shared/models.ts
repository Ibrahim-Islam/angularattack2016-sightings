export class Post {
    title: string = "";
    body: string = "";
    source: Geo;
    status: string = STATUS[STATUS.Open];
    sightings: Sighting[] = [];
    date: any;
    type: number = PostType.Lost;
    uid: string;
    name: string;
    profileImageURL: string;
    id: number;
    image: any;
}

export class Sighting
{
    coordinates: Geo;
    title: string = "";
    uid: string;
}

export enum PostType 
{
    Lost,
    Found
}

export class Geo 
{
    longitude: string;
    latitude: string;
}

export enum STATUS {
    Closed,
    Open
}

export class User {
    uid: string;
    name: string;
    email: string;
    country: string;
    contact: string;
    profileImageURL: string;
    date: any;
    notifications: Notification[] = [];
}

export class Notification {
    constructor(
        public message: string,
        public type: number,
        public postId: string,
        public isSeen: boolean = false
    ){}
}

export class PostListItem {
    author: string;
    title: string;
    body: string;
    status: string;
    imageURL: string = "images/image.png";

    constructor(initalizer? : any) {
        for(let key in initalizer) {
            if (initalizer.hasOwnProperty(key)) {
                this[key] = initalizer[key];
            }
        }
    }
}
