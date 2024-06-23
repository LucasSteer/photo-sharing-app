import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PhotoComponent } from '../../photo/photo.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-photo-feed',
  standalone: true,
  imports: [CommonModule, PhotoComponent, MatCardModule],
  templateUrl: './photo-feed.component.html',
  styleUrl: './photo-feed.component.css'
})
export class PhotoFeedComponent implements OnInit {
  photos: Array<{ name: String, author: String}> = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const photo$ = this.http.get<Array<{ filename: String, userId: String}>>("/photos");
  
    // TODO: replace with idiomatic RxJS approach
    photo$.subscribe((photosArray) => {
      photosArray.forEach(photo => {
        let author$ = this.http.get(`/users/${photo.userId}`);
  
        author$.subscribe((author: any) => {
          this.photos.push({
            name: photo.filename,
            author: author.email,
          });
        })
      });
    });
  }
}
