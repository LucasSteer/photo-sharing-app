import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.css'
})
export class FileUploaderComponent {
  fileName = '';

  constructor(private http: HttpClient, private router: Router) {}

  onFileSelected(event: Event) {
    if (event === null || event.target === null) return;
    const target = event.target as HTMLInputElement;
    if (target.files === null) return;
    const file: File = target.files[0];

    // TODO: permit only image files
    if (file) {
        this.fileName = file.name;
        const formData = new FormData();
        formData.append("photo", file);
        this.http.post("/photos", formData).subscribe({next: (res: any) => {
          // TODO: should store images in some common store
          window.location.reload();
        }, error: (err: any) => {
          // TODO: handle error when uploading image
          console.error("Error: ", err);
        }});
    }
  }
}
