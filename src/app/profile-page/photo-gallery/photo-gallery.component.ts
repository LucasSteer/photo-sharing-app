import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { PhotoEditorComponent } from './photo-editor/photo-editor.component';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule,  PhotoEditorComponent],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.css'
})
export class PhotoGalleryComponent implements OnInit {
  photos: Array<String> = [];

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const options = { params: new HttpParams().set('userId', this.auth.getUserId()) };
    const photo$ = this.http.get<Array<{ filename: String, userId: String}>>("/photos", options);
    photo$.subscribe((res) => {
      this.photos = res.map(photo => photo.filename);
    });
  }
}
