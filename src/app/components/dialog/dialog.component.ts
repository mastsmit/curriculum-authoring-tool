import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
  constructor(private dialogRef: MatDialogRef<DialogComponent>) {}

  onclose = () => {
    this.dialogRef.close();
  };
}
