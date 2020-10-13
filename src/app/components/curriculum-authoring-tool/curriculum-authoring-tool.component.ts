import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import {
  faPlusCircle,
  faArrowLeft,
  faArrowRight,
  faTrashAlt,
  faArrowsAlt,
} from '@fortawesome/free-solid-svg-icons';
import { v4 as uuid } from 'uuid';

type CurriculumObject = {
  id: string;
  name: string;
  children: CurriculumObject[];
};

type IdToParentMap = {
  [key: string]: CurriculumObject | null;
};

@Component({
  selector: 'app-curriculum-authoring-tool',
  templateUrl: './curriculum-authoring-tool.component.html',
  styleUrls: ['./curriculum-authoring-tool.component.scss'],
})
export class CurriculumAuthoringToolComponent implements OnInit {
  button = 1;
  curriculumObject: CurriculumObject = {
    id: uuid(),
    name: 'curriculumRoot',
    children: [],
  };
  idToParentMap: IdToParentMap = {};
  faArrowLeftIcon = faArrowLeft;
  faArrowRightIcon = faArrowRight;
  faArrowTrashAltIcon = faTrashAlt;
  faArrowsAltIcon = faArrowsAlt;
  buttonStyle = { cursor: 'pointer', margin: '20px 0 0 0' };
  fakeList = ['first', 'second', 'third', 'fourth'];
  styles = [
    'font-size: 20px; color:  rgb(28, 218, 243);font-weight: bold',
    'font-size: 15px; color: black;font-weight: bold',
    'font-size: 12px; color: green;',
  ];
  currentRef = this.curriculumObject.children;
  downloadJsonHref: SafeUrl;
  isJsonLoadSuccessfully = true;
  errorMessageForJsonLoadFailed = '';
  selectedFile;
  fakeObj = [
    { child: [{ id: 1 }], id: 1 },
    { child: [{ id: 2, anotherChild: [{ id: 3 }] }], id: 2 },
  ];
  // formGroup = new FormGroup({
  //   name: new FormControl(''),
  // });

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // this.formGroup.
    // this.fb.
    this.curriculumObject.children.push(
      this.getNewCourseObject(this.curriculumObject, 'smit')
    );
    this.curriculumObject.children[0].children.push(
      this.getNewCourseObject(this.curriculumObject.children[0], 'vaibhav')
    );
    this.curriculumObject.children[0].children[0].children.push(
      this.getNewCourseObject(
        this.curriculumObject.children[0].children[0],
        'bablu'
      )
    );
    this.curriculumObject.children.push(
      this.getNewCourseObject(this.curriculumObject, 'aashka')
    );
    console.log(
      '-----id_vs_parent',
      JSON.stringify(this.idToParentMap, null, 3)
    );
  }

  generateDownloadJsonUri() {
    let theJSON = JSON.stringify(this.curriculumObject, null, 3);
    let blob = new Blob([theJSON], { type: 'text/json' });
    console.log('blob', blob.text, 'blob', blob);
    let url = window.URL.createObjectURL(blob);
    console.log('url', url);
    let uri = this.sanitizer.bypassSecurityTrustUrl(url);
    this.downloadJsonHref = uri;
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, 'UTF-8');
    fileReader.onload = () => {
      try {
        this.curriculumObject = JSON.parse(fileReader.result as string);
        this.idToParentSync(this.curriculumObject);
        this.isJsonLoadSuccessfully = true;
      } catch {
        console.log('here In error');
        this.errorMessageForJsonLoadFailed = 'invalid json';
        this.isJsonLoadSuccessfully = false;
      }
    };
  }

  idToParentSync = (obj) => {
    console.log('obj', obj);
    for (const item of obj.children) {
      item.id = uuid();
      this.idToParentMap[item.id] = item.children;
      if (item.children !== []) {
        this.idToParentSync(item.children);
      }
    }
    console.log(
      'LatestIdToParent',
      JSON.stringify(this.idToParentMap, null, 2)
    );
  };

  checking = (node) => {
    console.log('clicked id', node);
  };

  drop = (e) => {
    // const temp = this.fakeList[e.currentIndex];
    // const temp1 = this.fakeList[e.previousIndex];
    // this.fakeList[e.currentIndex] = temp1;
    // this.fakeList[e.previousIndex] = temp;
    console.log('event', e);
  };

  getNewCourseObject = (
    parent: CurriculumObject | null = this.curriculumObject,
    text?: string
  ): CurriculumObject => {
    const id = uuid();
    this.idToParentMap[id] = parent;
    return {
      name: text,
      id,
      children: [],
    };
  };

  handleIndent = (node): void => {
    const oldParent = this.idToParentMap[node.id];
    const tempCourseList = oldParent.children;
    console.log(
      'node',
      node,
      'idToParent',
      JSON.stringify(this.idToParentMap, null, 2),
      'curriculumObject'
    );

    const courseIndex = tempCourseList.findIndex(
      (singleCourse) => singleCourse.id === node.id
    );
    console.log(
      '---------id, oldParent, courseIndex, tempParentList ',
      node.id,
      oldParent,
      courseIndex,
      tempCourseList
    );
    if (courseIndex === 0) {
      return;
    }

    tempCourseList[courseIndex - 1].children.push(tempCourseList[courseIndex]);
    this.idToParentMap[node.id] = tempCourseList[courseIndex - 1];
    if (oldParent) {
      oldParent.children = tempCourseList.filter(
        (singleCourse) => singleCourse.id !== node.id
      );
      this.curriculumObject = { ...this.curriculumObject };
    }
    console.log(
      '---------id, oldParent, courseIndex, tempParentList ',
      node.id,
      oldParent,
      courseIndex,
      tempCourseList
    );
  };

  handleUnIndent = (node) => {
    let tempList: [];
    let grandParent;
    let oldParent = this.idToParentMap[node.id];
    if (oldParent) {
      grandParent = this.idToParentMap[oldParent.id];
    }
    if (!grandParent) {
      return;
    }
    if (grandParent) {
      const oldParentIndex = grandParent.children.findIndex(
        (singleCourse) => singleCourse.id === oldParent.id
      );
      oldParent.children = oldParent.children.filter(
        (singleCourse) => singleCourse.id !== node.id
      );
      grandParent.children = [
        ...grandParent.children.slice(0, oldParentIndex + 1),
        node,
        ...grandParent.children.slice(oldParentIndex + 1),
      ];
      this.idToParentMap[node.id] = grandParent;
    }
  };

  handleDelete = (node: CurriculumObject) => {
    let oldParent: CurriculumObject = this.idToParentMap[node.id];
    if (this.idToParentMap[node.id].id === this.curriculumObject.id) {
      oldParent = this.curriculumObject;
    }
    if (oldParent) {
      oldParent.children = oldParent.children.filter(
        (singleCourse) => singleCourse.id !== node.id
      );
      this.curriculumObject = JSON.parse(JSON.stringify(this.curriculumObject));
      this.idToParentMap[node.id] = null;
    }
  };

  addCourse = () => {
    const newCourse = this.getNewCourseObject();
    this.curriculumObject.children.push(newCourse);
    this.curriculumObject = { ...this.curriculumObject };
  };
}
