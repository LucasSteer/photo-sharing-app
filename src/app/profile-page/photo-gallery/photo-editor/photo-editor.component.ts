
import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { PhotoComponent } from '../../../photo/photo.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [MatIconModule, PhotoComponent],
  templateUrl: './photo-editor.component.html',
  styleUrl: './photo-editor.component.css'
})
export class PhotoEditorComponent {
  @Input() photoName = '';

  constructor(private http: HttpClient, private router: Router) {}

  // TODO: handle removing image from screen (refresh?)
  onClickDelete() {
    this.http.delete(`/photos/${this.photoName}`).subscribe({next: (res: any) => {
      console.log(`Photo named ${this.photoName} deleted`);
      this.router.navigate(['/profile']);
    }, error: (err: any) => {
      console.error("Error: ", err);
    }});
  }
}