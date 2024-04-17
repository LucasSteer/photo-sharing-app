import { Component, OnInit } from '@angular/core';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';
import { PhotoGalleryComponent } from './photo-gallery/photo-gallery.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FileUploaderComponent, PhotoGalleryComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  userId = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.autoAuthUser();
    this.userId = this.auth.getUserId();
  }
}
