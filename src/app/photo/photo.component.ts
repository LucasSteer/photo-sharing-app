import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-photo',
  standalone: true,
  imports: [],
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.css'
})
export class PhotoComponent {
  @Input() photoName = '';
}
