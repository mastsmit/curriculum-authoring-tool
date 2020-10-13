import { Component, Input, OnInit } from '@angular/core';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
  @Input() buttonName = 'button';
  @Input() buttonStyle: {
    [key: string]: string;
  } = {};
  faPlusCircleIcon = faPlusCircle;
  @Input() onClick: () => {} = () => (1);

  constructor() {}

  ngOnInit(): void {}
}
