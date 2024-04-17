import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { PhotoGalleryComponent } from './photo-gallery/photo-gallery.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FileUploaderComponent, PhotoGalleryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'photo-sharing-app';
}
