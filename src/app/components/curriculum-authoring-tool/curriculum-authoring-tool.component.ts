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
    this.curriculumObject.children.push(
      this.getNewCourseObject(this.curriculumObject, 'Numbers')
    );
    this.curriculumObject.children[0].children.push(
      this.getNewCourseObject(this.curriculumObject.children[0], 'Count to determine the number of objects in a set')
    );
    this.curriculumObject.children[0].children[0].children.push(
      this.getNewCourseObject(
        this.curriculumObject.children[0].children[0],
        'describe observation about events and objects in real-life situations'
      )
    );
    this.curriculumObject.children.push(
      this.getNewCourseObject(this.curriculumObject, 'Measurement')
    );
    this.curriculumObject.children[1].children.push(
      this.getNewCourseObject(this.curriculumObject.children[1], 'Measure the width of the line')
    );
    console.log(
      '-----id_vs_parent',
      JSON.stringify(this.idToParentMap, null, 3)
    );
    this.updateParsedListWithLevel();
    // 1, 4, this.parsedListWithLevel, this.curriculumIbject, this.idVSMap
  }

  changePosition = (event) => {
    console.log(
      'event',
      event,
      event.currentIndex,
      event.previousIndex,
      this.parsedListWithLevel,
      'id To Paretn', JSON.stringify(this.idToParentMap, null, 3),
      '\n', 'curriculumObject' , JSON.stringify(this.curriculumObject,null, 3),
    );
    let toNode = this.parsedListWithLevel[event.currentIndex];
    let fromNode = this.parsedListWithLevel[event.previousIndex];
    let toNodeParentId = this.idToParentMap[toNode[0].id];
    let fromNodeParentId = this.idToParentMap[fromNode[0].id];

    if(toNodeParentId) {
      console.log('here');
      this.curriculumObject.children = this.curriculumObject.children.filter(each => {
        for(let child of each.children) {
          if(child.id === toNode[0].id) {
            each.children = each.children.filter(temp => temp.id !== child.id);
          }
        }
        if(each.id === fromNode[0].id) {
          console.log('smit patel');
          each.children = [...each.children, ...toNode];
        }
        return each;
      });
      console.log('curriculumObject', JSON.stringify(this.curriculumObject, null , 3));
    }


    this.curriculumObject = { ...this.curriculumObject };


    console.log('fromNode', fromNode, '\n', 'toNode', toNode, '\n', 'fromNodeParent', fromNodeParentId, '\n', 'toNodeParent', toNodeParentId);
    this.swapPosition(this.curriculumObject.children, fromNode, toNode, fromNodeParentId, toNodeParentId);
  }

  swapPosition = (iteratorObj, fromNode, toNode, fromNodeParent, tempParent) => {
    for(let child of iteratorObj) {
      console.log('child', child);
      if(child.id === fromNode[0].id) {
        console.log('only 1 found');
      }
      this.swapPosition(child.children, fromNode, toNode, fromNodeParent, tempParent);
    }
  }

  // dragAndDrop = (each, fromNode, temp, event) => {
  //   event.currentIndex--;
  //   event.previousIndex--;
  //   console.log('event --', event);
  //   for (const child of each.children) {
  //     console.log(JSON.stringify(child, null, 3));
  //     if(event.currentIndex === 0) {

  //     }
  //     this.dragAndDrop(child, fromNode, temp, event);
  //   }
  //   }

  generateDownloadJsonUri() {
    let theJSON = JSON.stringify(this.curriculumObject, null, 3);
    let blob = new Blob([theJSON], { type: 'text/json' });
    // console.log('blob', blob.text, 'blob', blob);
    let url = window.URL.createObjectURL(blob);
    // console.log('url', url);
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
        this.idToParentMap = {};
        this.idToParentSync(this.curriculumObject.children);
        this.updateParsedListWithLevel();
      } catch {
        const dialogRef = this.dialog.open(DialogComponent);
      }
    };
  }

  idToParentSync = (list) => {
    console.log('obj', JSON.stringify(list, null, 3));
    for (const item of list) {
      console.log('item', item, 'item.id', item.id)
      this.idToParentMap[item.id] = item.children;
      this.idToParentSync(item.children);
    }
    console.log('this.itemToIdParent', this.idToParentMap);
  };

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
  };

  getIdVsParentSubOptimal = (key): CurriculumObject => {
    this.searchedParent = null;
    console.log('-------', this.curriculumObject, key);
    this.searchInNode(this.curriculumObject, this.idToParentMap[key]);
    console.log('searchedNode-------', this.searchedParent);
    return this.searchedParent;
  };

 

  checking = (node) => {
    console.log('clicked id', node);
  };

  drop = (e) => {
    this.changePosition(e);
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
    this.idToParentMap[id] = parent.id;
    return {
      name: text,
      id,
      children: [],
    };
  };

  handleIndent = (node): void => {
    console.log(
      'node first time ',
      node,
      '\n idToParent first time  ',
      JSON.stringify(this.idToParentMap, null, 2),
      '\n obj first time ',
      JSON.stringify(this.curriculumObject, null, 3)
    );
    const oldParent = this.getIdVsParentSubOptimal(node.id);
    // const oldParent = this.idToParentMap[node.id];

    const tempCourseList = oldParent.children;
    console.log(
      'node',
      node,
      'idToParent',
      JSON.stringify(this.idToParentMap, null, 2),
      'curriculumObject',
      JSON.stringify(this.curriculumObject, null, 3)
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
    this.idToParentMap[node.id] = tempCourseList[courseIndex - 1].id;
    console.log(
      '---------id 3 rd, oldParent 3rd , courseIndex 3rd , tempParentList 3rd',
      node.id,
      oldParent,
      courseIndex,
      tempCourseList
    );
    if (oldParent) {
      console.log('in old parent');
      oldParent.children = tempCourseList.filter(
        (singleCourse) => singleCourse.id !== node.id
      );
      this.curriculumObject = { ...this.curriculumObject };
      this.updateParsedListWithLevel();
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
    let oldParent = this.getIdVsParentSubOptimal(node.id);

    // let oldParent = this.idToParentMap[node.id];
    if (oldParent) {
      grandParent = this.getIdVsParentSubOptimal(oldParent.id);

      // grandParent = this.idToParentMap[oldParent.id];
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
      this.idToParentMap[node.id] = grandParent.id;
      this.curriculumObject = { ...this.curriculumObject };
      this.updateParsedListWithLevel();
    }
   this.printToConsole();
  };

  traverseNode = (node: CurriculumObject, level) => {
    if (level !== -1) {
      this.parsedListWithLevel.push([node, level]);
    }
    console.log('-=', this.parsedListWithLevel);
    let child = null;
    for (child of node.children) {
      this.traverseNode(child, level + 1);
    }
  };

  updateParsedListWithLevel = () => {
    this.parsedListWithLevel = [];
    this.traverseNode(this.curriculumObject, -1);
    console.log('-=', this.parsedListWithLevel);
  };

  handleDelete = (node: CurriculumObject) => {
    let oldParent: CurriculumObject = this.getIdVsParentSubOptimal(node.id);

    // let oldParent: CurriculumObject = this.idToParentMap[node.id];
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
  };

  addCourse = () => {
    const newCourse = this.getNewCourseObject();
    let lastEntry;
    console.log(JSON.stringify(this.idToParentMap, null ,3 ));
    lastEntry = this.parsedListWithLevel[this.parsedListWithLevel.length - 1];
    console.log('lastEntyr', lastEntry);
    let parentOfLastEntryId = this.idToParentMap[lastEntry[0].id];
    if(parentOfLastEntryId === this.curriculumObject.id) {
      this.curriculumObject.children.push(newCourse);
    } 
    console.log('parentOfLastEntryId', parentOfLastEntryId);
    console.log('latest id to parent' , JSON.stringify(this.idToParentMap, null ,3 ));
    this.insertNewCourseOnLevel(this.curriculumObject.children, parentOfLastEntryId, newCourse);
    // console.log('parentOfLastEntry', parentOfLastEntryId);
    // this.curriculumObject.children.push(newCourse);
    this.curriculumObject = { ...this.curriculumObject };
    this.updateParsedListWithLevel();
    this.printToConsole();
  };

  insertNewCourseOnLevel = (root, parentId, nodeToInsert) => {
    let child = null;
    console.log('nodeToInsert', nodeToInsert.id);
    for(child of root) {
      console.log('child', child.id, 'parent', parentId, '\n');
      if(child.id === parentId) {
        console.log('found only one');
        child.children = [...child.children, nodeToInsert];
        this.idToParentMap[nodeToInsert.id] = child.id;
      }
      if(child !== []) {
        this.insertNewCourseOnLevel(child.children, parentId, nodeToInsert);
      }
    }
    // console.log('curriculumObject', JSON.stringify(this.curriculumObject, null, 3));
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
