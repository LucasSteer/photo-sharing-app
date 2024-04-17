import { Component } from '@angular/core';
import { PhotoFeedComponent } from './photo-feed/photo-feed.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [PhotoFeedComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
