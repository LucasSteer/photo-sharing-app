import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-photo',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.css'
})
export class PhotoComponent {
  @Input() photoName = '';

  constructor(private http: HttpClient) {}

  // TODO: handle removing image from screen (refresh?)
  onClickDelete() {
    this.http.delete(`/photos/${this.photoName}`).subscribe({next: (res: any) => {
      console.log(`Photo named ${this.photoName} deleted`);
    }, error: (err: any) => {
      console.error("Error: ", err);
    }});
  }
}
