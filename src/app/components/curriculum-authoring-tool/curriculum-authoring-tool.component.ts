import { DialogComponent } from './../dialog/dialog.component';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { v4 as uuid } from 'uuid';
import {
  faArrowLeft,
  faArrowRight,
  faTrashAlt,
  faArrowsAlt,
} from '@fortawesome/free-solid-svg-icons';

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
  idToParentMap: IdToParentMap = {};
  faArrowLeftIcon = faArrowLeft;
  faArrowRightIcon = faArrowRight;
  faArrowTrashAltIcon = faTrashAlt;
  faArrowsAltIcon = faArrowsAlt;
  searchedParent = null;
  parsedListWithLevel = [];
  isLoading = false;
  downloadJsonHref: SafeUrl;
  buttonStyle = { cursor: 'pointer', margin: '20px 0 0 0' };
  curriculumObject: CurriculumObject = {
    id: uuid(),
    name: 'curriculum-authoring-tool',
    children: [],
  };
  @Input() inputStyles: string[] = [
    'font-size: 20px; color:  rgb(28, 218, 243);font-weight: bold',
    'font-size: 15px; color: black;font-weight: bold',
    'font-size: 12px; color: green;',
  ];

  constructor(private sanitizer: DomSanitizer, private dialog: MatDialog) {}

  ngOnInit(): void {}

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

  addCourse = () => {
    let lastEntry;
    this.updateParsedListWithLevel();
    const newCourse = this.getNewCourseObject();
    lastEntry = this.parsedListWithLevel[this.parsedListWithLevel.length - 1];
    let parentOfLastEntryId = this.curriculumObject.id;
    if (lastEntry) {
      parentOfLastEntryId = this.idToParentMap[lastEntry[0].id];
      if (!lastEntry[0].name) {
        return;
      }
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

  handleOnSave(): void {
    const theJSON = JSON.stringify(this.curriculumObject, null, 3);
    const blob = new Blob([theJSON], { type: 'text/json' });
    const url = window.URL.createObjectURL(blob);
    const uri = this.sanitizer.bypassSecurityTrustUrl(url);
    this.downloadJsonHref = uri;
  }

  handleOnLoad(event): void {
    this.isLoading = true;
    let selectedFile = null;
    try {
      selectedFile = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsText(selectedFile, 'UTF-8');
      fileReader.onload = () => {
        try {
          this.curriculumObject = JSON.parse(fileReader.result as string);
          this.idToParentMap = {};
          this.idToParentSyncOnLoadFile(this.curriculumObject);
          this.updateParsedListWithLevel();
        } catch {
          this.isLoading = false;
          const dialogRef = this.dialog.open(DialogComponent);
        }
      };
    } catch {
      this.isLoading = false;
    }
    this.isLoading = false;
  }

  idToParentSyncOnLoadFile = (node) => {
    if (!node.children) {
      return;
    }
    for (const child of node.children) {
      if (child.children !== []) {
        this.idToParentMap[child.id] = node.id;
        this.idToParentSyncOnLoadFile(child);
      }
    }
  }

  drop = (event) => {
    const toNodeWithLevel = this.parsedListWithLevel[event.currentIndex];
    const fromNodeWithLevel = this.parsedListWithLevel[event.previousIndex];
    const toNodeParent = this.getIdVsParentSubOptimal(toNodeWithLevel[0].id);
    const fromNodeParent = this.getIdVsParentSubOptimal(
      fromNodeWithLevel[0].id
    );
    if (toNodeWithLevel === fromNodeWithLevel) {
      return;
    }
    this.dragAndDrop(
      toNodeWithLevel,
      fromNodeWithLevel,
      toNodeParent,
      fromNodeParent,
      event.currentIndex
    );
    this.curriculumObject = { ...this.curriculumObject };
  }

  dragAndDrop = (
    toNodeWithLevel,
    fromNodeWithLevel,
    toNodeParent,
    fromNodeParent,
    currentIndex: number
  ) => {
    const [toNode, toLevel] = toNodeWithLevel;
    const [fromNode, fromLevel] = fromNodeWithLevel;
    const toNodeIndex = toNodeParent.children.findIndex(
      (node) => node.id === toNode.id
    );
    if (toLevel === fromLevel) {
      this.handleToAndFromNodeAreEqualLevel(
        toNodeParent,
        fromNodeParent,
        toNodeIndex,
        fromNode
      );
    } else if (toLevel - 1 === fromLevel) {
      this.handleToLevelIsLessThanFromLevel(
        toNodeParent,
        toNodeIndex,
        toNode,
        fromNode
      );
    } else if (toLevel + 1 === fromLevel) {
      if (fromNodeParent.id === toNode.id) {
        this.handleToLevelIsGreaterThanFromLevel(
          fromNode,
          fromLevel,
          fromNodeParent,
          currentIndex
        );
      }
    }
    this.curriculumObject = { ...this.curriculumObject };
    this.updateParsedListWithLevel();
  }

  handleToAndFromNodeAreEqualLevel = (
    toNodeParent,
    fromNodeParent,
    toNodeIndex,
    fromNode
  ) => {
    if (toNodeParent.id === fromNodeParent.id) {
      fromNodeParent.children = fromNodeParent.children.filter(
        (node) => node.id !== fromNode.id
      );
      const remainingNodeIds = toNodeParent.children.slice(toNodeIndex);
      toNodeParent.children = toNodeParent.children
        .slice(0, toNodeIndex)
        .concat([fromNode])
        .concat(remainingNodeIds);
    } else {
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
  }

  handleToLevelIsLessThanFromLevel = (
    toNodeParent,
    toNodeIndex,
    toNode,
    fromNode
  ) => {
    const remainingNodeIds = toNodeParent.children.slice(toNodeIndex);
    toNodeParent.children = toNodeParent.children.slice(0, toNodeIndex);
    fromNode.children = remainingNodeIds.concat(fromNode.children);
    this.idToParentMap[toNode.id] = fromNode.id;
  }

  handleToLevelIsGreaterThanFromLevel = (
    fromNode,
    fromLevel,
    fromNodeParent,
    currentIndex
  ) => {
    if (currentIndex - 1 >= 0) {
      const beforeToNode = this.parsedListWithLevel[currentIndex - 1][0];
      const beforeToNodeLevel = this.parsedListWithLevel[currentIndex - 1][1];
      const beforeToNodeParent = this.getIdVsParentSubOptimal(beforeToNode.id);
      if (beforeToNodeLevel === fromLevel) {
        beforeToNodeParent.children = beforeToNodeParent.children.concat([
          fromNode,
        ]);
        fromNodeParent.children = fromNodeParent.children.filter(
          (node) => node.id !== fromNode.id
        );
        this.idToParentMap[fromNode.id] = beforeToNodeParent.id;
      } else if (beforeToNodeLevel < fromLevel) {
        beforeToNode.children = beforeToNode.children.concat([fromNode]);
        fromNodeParent.children = fromNodeParent.children.filter(
          (node) => node.id !== fromNode.id
        );
        this.idToParentMap[fromNode.id] = beforeToNode.id;
      }
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
    } else {
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

  searchInNode = (node: CurriculumObject, key: string) => {
    if (node.id === key) {
      this.searchedParent = node;
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

  getIdVsParentSubOptimal = (key: string): CurriculumObject => {
    this.searchedParent = null;
    this.searchInNode(this.curriculumObject, this.idToParentMap[key]);
    return this.searchedParent;
  }

  traverseNode = (node: CurriculumObject, level) => {
    if (level !== -1) {
      this.parsedListWithLevel.push([node, level]);
    }
    let child = null;
    for (child of node.children) {
      this.traverseNode(child, level + 1);
    }
  }

  updateParsedListWithLevel = () => {
    this.parsedListWithLevel = [];
    this.traverseNode(this.curriculumObject, -1);
  }
}
