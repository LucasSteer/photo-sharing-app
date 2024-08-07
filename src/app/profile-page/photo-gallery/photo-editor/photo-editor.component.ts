
import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { PhotoComponent } from '../../../photo/photo.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [MatIconModule, PhotoComponent, MatCardModule, MatButtonModule],
  templateUrl: './photo-editor.component.html',
  styleUrl: './photo-editor.component.css'
})
export class PhotoEditorComponent {
  @Input() photoName = '';

  constructor(private http: HttpClient) {}

  onClickDelete() {
    this.http.delete(`/photos/${this.photoName}`).subscribe({next: (res: any) => {
      window.location.reload();
    }, error: (err: any) => {
      // TODO: handle error when deleting image
      console.error("Error: ", err);
    }});
  }
}