import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'curriculum-authoring-tool';
  inputStyles = [
    'font-size: 24px; color:  rgb(28, 218, 243);font-weight: bold',
    'font-size: 18px; color: black;font-weight: bold',
    'font-size: 15px; color: green;font-weight: bold',
    'font-size: 12px; color: rgba(201, 76, 76, 0.6);font-weight: bold',
  ];
}
