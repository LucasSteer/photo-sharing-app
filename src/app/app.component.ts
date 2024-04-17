import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { PhotoGalleryComponent } from './photo-gallery/photo-gallery.component';
import { SignupFormComponent } from './signup-form/signup-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FileUploaderComponent, PhotoGalleryComponent, SignupFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'photo-sharing-app';
}
