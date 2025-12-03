import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class AppComponent {
  title: string = 'Your App Title';

  ngOnInit() {
    this.title = 'test-app';
  }
}
