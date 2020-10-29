import { DialogComponent } from './../dialog/dialog.component';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

import {
  faArrowLeft,
  faArrowRight,
  faTrashAlt,
  faArrowsAlt,
  faJoint,
} from '@fortawesome/free-solid-svg-icons';
import { v4 as uuid } from 'uuid';

type CurriculumObject = {
  id: string;
  name: string;
  children: CurriculumObject[];
};

type IdToParentMap = {
  [key: string]: string | null;
};

@Component({
  selector: 'app-curriculum-authoring-tool',
  templateUrl: './curriculum-authoring-tool.component.html',
  styleUrls: ['./curriculum-authoring-tool.component.scss'],
})
export class CurriculumAuthoringToolComponent implements OnInit {
  button = 1;
  searchedParent = null;
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
  parsedListWithLevel = [];
  buttonStyle = { cursor: 'pointer', margin: '20px 0 0 0' };
  fakeList = ['first', 'second', 'third', 'fourth'];
  styles = [
    'font-size: 20px; color:  rgb(28, 218, 243);font-weight: bold',
    'font-size: 15px; color: black;font-weight: bold',
    'font-size: 12px; color: green;',
  ];
  currentRef = this.curriculumObject.children;
  downloadJsonHref: SafeUrl;
  selectedFile;
  fakeObj = [
    { child: [{ id: 1 }], id: 1 },
    { child: [{ id: 2, anotherChild: [{ id: 3 }] }], id: 2 },
  ];
  // formGroup = new FormGroup({
  //   name: new FormControl(''),
  // });

  constructor(private sanitizer: DomSanitizer, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.printToConsole();

    // this.curriculumObject.children.push(
    //   this.getNewCourseObject(this.curriculumObject, 'Numbers')
    // );
    // this.curriculumObject.children[0].children.push(
    //   this.getNewCourseObject(
    //     this.curriculumObject.children[0],
    //     'Count to determine the number of objects in a set'
    //   )
    // );
    // this.curriculumObject.children[0].children[0].children.push(
    //   this.getNewCourseObject(
    //     this.curriculumObject.children[0].children[0],
    //     'describe observation about events and objects in real-life situations'
    //   )
    // );
    // this.curriculumObject.children.push(
    //   this.getNewCourseObject(this.curriculumObject, 'Measurement')
    // );
    // this.curriculumObject.children[1].children.push(
    //   this.getNewCourseObject(
    //     this.curriculumObject.children[1],
    //     'Measure the width of the line'
    //   )
    // );
    // console.log(
    //   '-----id_vs_parent',
    //   JSON.stringify(this.idToParentMap, null, 3)
    // );
    // this.updateParsedListWithLevel();
    // 1, 4, this.parsedListWithLevel, this.curriculumIbject, this.idVSMap
  }

  getNewCourseObject = (
    parent: CurriculumObject | null = this.curriculumObject,
    text?: string
  ): CurriculumObject => {
    const id = uuid();
    this.idToParentMap[id] = parent.id;
    return {
      name: text,
      id,
      children: [],
    };
  }

  dragAndDrop = (
    root,
    toNodeWithLevel,
    fromNodeWithLevel,
    toNodeParent,
    fromNodeParent
  ) => {
    const [toNode, toLevel] = toNodeWithLevel;
    const [fromNode, fromLevel] = fromNodeWithLevel;
    console.log('================', toLevel, fromLevel);
    if (toLevel === fromLevel) {
      if (toNodeParent.id === fromNodeParent.id) {
        console.log('same  level case with same parent', toNodeParent);
        fromNodeParent.children = fromNodeParent.children.filter(
          (node) => node.id !== fromNode.id
        );

        const toNodeIndex = toNodeParent.children.findIndex(
          (node) => node.id === toNode.id
        );
        const remainingNodeIds = toNodeParent.children.slice(toNodeIndex);
        toNodeParent.children = toNodeParent.children
          .slice(0, toNodeIndex)
          .concat([fromNode])
          .concat(remainingNodeIds);
      } else {
        console.log('same  level case with different parent', toNodeParent);
        const toNodeIndex = toNodeParent.children.findIndex(
          (node) => node.id === toNode.id
        );
        const remainingNodeIds = toNodeParent.children.slice(toNodeIndex);
        toNodeParent.children = toNodeParent.children
          .slice(0, toNodeIndex)
          .concat([fromNode])
          .concat(remainingNodeIds);
        this.idToParentMap[fromNode.id] = toNodeParent.id;
        fromNodeParent.children = fromNodeParent.children.filter(
          (node) => node.id !== fromNode.id
        );
      }
      this.curriculumObject = { ...this.curriculumObject };
      this.updateParsedListWithLevel();
      // console.log('to level larger', this.curriculumObject, toNode);
    } else if (toLevel - 1 === fromLevel) {
      console.log('to level larger', toNodeParent);
      const toNodeIndex = toNodeParent.children.findIndex(
        (node) => node.id === toNode.id
      );
      const remainingNodeIds = toNodeParent.children.slice(toNodeIndex);
      toNodeParent.children = toNodeParent.children.slice(0, toNodeIndex);
      fromNode.children = remainingNodeIds.concat(fromNode.children);
      this.curriculumObject = { ...this.curriculumObject };
      this.idToParentMap[toNode.id] = fromNode.id;
      this.updateParsedListWithLevel();
      console.log(
        'to level larger',
        this.curriculumObject,
        remainingNodeIds,
        toNode
      );
    } else if (toLevel < fromLevel) {

    }

  }

  handleOnSave(): void {
    const theJSON = JSON.stringify(this.curriculumObject, null, 3);
    const blob = new Blob([theJSON], { type: 'text/json' });
    const url = window.URL.createObjectURL(blob);
    const uri = this.sanitizer.bypassSecurityTrustUrl(url);
    this.downloadJsonHref = uri;
  }

  handleOnLoad(event): void {
    this.selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, 'UTF-8');
    fileReader.onload = () => {
      try {
        this.curriculumObject = JSON.parse(fileReader.result as string);
        this.idToParentMap = {};
        this.idToParentSyncOnLoadFile(this.curriculumObject);
        this.updateParsedListWithLevel();
      } catch {
        const dialogRef = this.dialog.open(DialogComponent);
      }
    };
  }

  idToParentSyncOnLoadFile = (node) => {
    console.log('obj', JSON.stringify(node, null, 3));
    if (!node.children) { return; }
    for (const child of node.children) {
      if (child.children !== []) {
        this.idToParentMap[child.id] = node.id;
        this.idToParentSyncOnLoadFile(child);
      }
    }
    console.log('this.itemToIdParent', this.idToParentMap);
  }

  searchInNode = (node: CurriculumObject, key) => {
    console.log('--------------', node.id, key);

    if (node.id === key) {
      this.searchedParent = node;
      console.log('--------------', node);
      return true;
    }
    let child = null;
    for (child of node.children) {
      if (this.searchInNode(child, key)) {
        return true;
      }
    }
    return false;
  }

  getIdVsParentSubOptimal = (key): CurriculumObject => {
    this.searchedParent = null;
    console.log('-------', this.curriculumObject, key);
    this.searchInNode(this.curriculumObject, this.idToParentMap[key]);
    console.log('searchedNode-------', this.searchedParent);
    return this.searchedParent;
  }


  drop = (event) => {
    const toNodeWithLevel = this.parsedListWithLevel[event.currentIndex];
    const fromNodeWithLevel = this.parsedListWithLevel[event.previousIndex];
    const toNodeParent = this.getIdVsParentSubOptimal(toNodeWithLevel[0].id);
    const fromNodeParent = this.getIdVsParentSubOptimal(fromNodeWithLevel[0].id);

    this.dragAndDrop(
      this.curriculumObject.children,
      toNodeWithLevel,
      fromNodeWithLevel,
      toNodeParent,
      fromNodeParent
    );
    this.curriculumObject = { ...this.curriculumObject };
  }

  handleIndent = (node): void => {
    const oldParent = this.getIdVsParentSubOptimal(node.id);
    const tempCourseList = oldParent.children;
    const courseIndex = tempCourseList.findIndex(
      (singleCourse) => singleCourse.id === node.id
    );
    if (courseIndex === 0) {
      return;
    }
    tempCourseList[courseIndex - 1].children.push(tempCourseList[courseIndex]);
    this.idToParentMap[node.id] = tempCourseList[courseIndex - 1].id;
    if (oldParent) {
      oldParent.children = tempCourseList.filter(
        (singleCourse) => singleCourse.id !== node.id
      );
      this.curriculumObject = { ...this.curriculumObject };
      this.updateParsedListWithLevel();
    }
  }

  handleUnIndent = (node: CurriculumObject) => {
    let grandParent: CurriculumObject;
    const oldParent = this.getIdVsParentSubOptimal(node.id);
    if (oldParent) {
      grandParent = this.getIdVsParentSubOptimal(oldParent.id);
    }
    if (!grandParent) {
      return;
    }
    else {
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
      this.idToParentMap[node.id] = grandParent.id;
      this.curriculumObject = { ...this.curriculumObject };
      this.updateParsedListWithLevel();
    }
    this.printToConsole();
  }

  traverseNode = (node: CurriculumObject, level) => {
    if (level !== -1) {
      this.parsedListWithLevel.push([node, level]);
    }
    console.log('-=', this.parsedListWithLevel);
    let child = null;
    for (child of node.children) {
      this.traverseNode(child, level + 1);
    }
  }

  updateParsedListWithLevel = () => {
    this.parsedListWithLevel = [];
    this.traverseNode(this.curriculumObject, -1);
    console.log('-=', this.parsedListWithLevel);
  }

  handleDelete = (node: CurriculumObject) => {
    let oldParent: CurriculumObject = this.getIdVsParentSubOptimal(node.id);
    if (this.idToParentMap[node.id] === this.curriculumObject.id) {
      oldParent = this.curriculumObject;
    }
    if (oldParent) {
      oldParent.children = oldParent.children.filter(
        (singleCourse) => singleCourse.id !== node.id
      );
      this.curriculumObject = JSON.parse(JSON.stringify(this.curriculumObject));
      this.updateParsedListWithLevel();
      this.idToParentMap[node.id] = null;
    }
  }

  addCourse = () => {
    let lastEntry;
    const newCourse = this.getNewCourseObject();
    lastEntry = this.parsedListWithLevel[this.parsedListWithLevel.length - 1];
    let parentOfLastEntryId = this.curriculumObject.id;
    if (lastEntry) {
      parentOfLastEntryId = this.idToParentMap[lastEntry[0].id];
    }
    if (parentOfLastEntryId === this.curriculumObject.id || !lastEntry) {
      this.curriculumObject.children.push(newCourse);
    }
    this.insertNewCourseOnLevel(
      this.curriculumObject.children,
      parentOfLastEntryId,
      newCourse
    );
    this.curriculumObject = { ...this.curriculumObject };
    this.updateParsedListWithLevel();
    this.printToConsole();
  }

  insertNewCourseOnLevel = (root, parentId, nodeToInsert) => {
    let child = null;
    for (child of root) {
      if (child.id === parentId) {
        child.children = [...child.children, nodeToInsert];
        this.idToParentMap[nodeToInsert.id] = child.id;
      }
      if (child !== []) {
        this.insertNewCourseOnLevel(child.children, parentId, nodeToInsert);
      }
    }
  }

  printToConsole = () => {
    console.log(
      'curriculumObj',
      JSON.stringify(this.curriculumObject, null, 3),
      '\n idtoParent',
      JSON.stringify(this.idToParentMap, null, 3),
      'updateParsed',
      JSON.stringify(this.insertNewCourseOnLevel, null, 3)
    );
  }
}
