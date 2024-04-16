import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PhotoComponent } from '../photo/photo.component';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule, PhotoComponent],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.css'
})
export class PhotoGalleryComponent implements OnInit {
  photos: Array<String> = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const photo$ = this.http.get("/photos");
    photo$.subscribe((res: any) => {
      this.photos = res;
    });
  }
}
