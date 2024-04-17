import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PhotoComponent } from '../../photo/photo.component';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule, PhotoComponent],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.css'
})
export class PhotoGalleryComponent implements OnInit {
  photos: Array<String> = [];

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const options = { params: new HttpParams().set('userId', this.auth.getUserId()) };
    const photo$ = this.http.get("/photos", options);
    photo$.subscribe((res: any) => {
      this.photos = res;
    });
  }
}
