import { DialogComponent } from './components/dialog/dialog.component';
import { CurriculumAuthoringToolComponent } from './components/curriculum-authoring-tool/curriculum-authoring-tool.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatTooltipModule} from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import { ButtonComponent } from './components/button/button.component';

@NgModule({
  declarations: [
    AppComponent,
    ButtonComponent,
    DialogComponent,
    CurriculumAuthoringToolComponent
  ],
  imports: [
    BrowserModule,
    // ReactiveFormsModule,
    FontAwesomeModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    DragDropModule,
    FormsModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
