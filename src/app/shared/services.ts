import { Injectable } from '@angular/core';
import { PostListItem } from './models';

@Injectable()
export class ApiService {

    getPosts(): PostListItem[] {
        return [
            new PostListItem({
                $key: 1,
                title: "Lost my dog",
                body: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",
                status: "Opened",
                author: "x"
            }),
            new PostListItem({
                $key: 2,
                title: "Bike stolen",
                body: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",
                status: "Closed",
                author: "xx"
            }),
            new PostListItem({
                $key: 3,
                title: "Left wallet",
                body: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",
                status: "Dropped",
                author: "xxx"
            })
        ];
    }
}

@Injectable()
export class SharedService {
    isGlobalLoading: boolean;
}
