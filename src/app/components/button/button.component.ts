import { Component, Input, OnInit } from '@angular/core';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

type ButtonStyle =  {
  [key: string]: string;
};
@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})

export class ButtonComponent implements OnInit {
  faPlusCircleIcon = faPlusCircle;
  @Input() buttonName = 'button';
  @Input() buttonStyle: ButtonStyle = {};
  @Input() showIcon = true;
  @Input() onClick: () => {} = () => (1);

  constructor() {}

  ngOnInit(): void {}
}
