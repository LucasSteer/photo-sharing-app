import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon'; 

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.css'
})
export class FileUploaderComponent {
  fileName = '';

  constructor(private http: HttpClient) {}

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
        const upload$ = this.http.post("/photos", formData);
        upload$.subscribe();
    }
  }
}
