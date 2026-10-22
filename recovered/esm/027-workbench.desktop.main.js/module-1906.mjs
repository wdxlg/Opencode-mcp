// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewParts/notebookViewZones.ts
import { Disposable } from "./module-0012.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { IsDevelopmentContext } from "./module-0635.mjs";
import { IEditorService } from "./module-0934.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0941.mjs";


// src/vs/workbench/contrib/notebook/browser/viewParts/notebookViewZones.ts
var invalidFunc3 = () => {
  throw new Error(`Invalid notebook view zone change accessor`);
};

var NotebookViewZones = class extends Disposable {
  constructor(listView, coordinator) {
    super();
    this.listView = listView;
    this.coordinator = coordinator;
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setClassName("view-zones");
    this.domNode.setPosition("absolute");
    this.domNode.setAttribute("role", "presentation");
    this.domNode.setAttribute("aria-hidden", "true");
    this.domNode.setWidth("100%");
    this._zones = {};
    this.listView.containerDomNode.appendChild(this.domNode.domNode);
  }
  changeViewZones(callback) {
    let zonesHaveChanged = false;
    const changeAccessor = {
      addZone: (zone) => {
        zonesHaveChanged = true;
        return this._addZone(zone);
      },
      removeZone: (id2) => {
        zonesHaveChanged = true;
        this._removeZone(id2);
      },
      layoutZone: (id2) => {
        zonesHaveChanged = true;
        this._layoutZone(id2);
      }
    };
    safeInvoke1Arg2(callback, changeAccessor);
    changeAccessor.addZone = invalidFunc3;
    changeAccessor.removeZone = invalidFunc3;
    changeAccessor.layoutZone = invalidFunc3;
    return zonesHaveChanged;
  }
  getViewZoneLayoutInfo(viewZoneId) {
    const zoneWidget = this._zones[viewZoneId];
    if (!zoneWidget) {
      return null;
    }
    const top2 = this.listView.getWhitespacePosition(zoneWidget.whitespaceId);
    const height = zoneWidget.zone.heightInPx;
    return { height, top: top2 };
  }
  onCellsChanged(e) {
    const splices = e.splices.slice().reverse();
    splices.forEach((splice3) => {
      const [start, deleted, newCells] = splice3;
      const fromIndex = start;
      const toIndex = start + deleted;
      for (const id2 in this._zones) {
        const zone = this._zones[id2].zone;
        const cellBeforeWhitespaceIndex = zone.afterModelPosition - 1;
        if (cellBeforeWhitespaceIndex >= fromIndex && cellBeforeWhitespaceIndex < toIndex) {
          zone.afterModelPosition = fromIndex;
          this._updateWhitespace(this._zones[id2]);
        } else if (cellBeforeWhitespaceIndex >= toIndex) {
          const insertLength = newCells.length;
          const offset = insertLength - deleted;
          zone.afterModelPosition += offset;
          this._updateWhitespace(this._zones[id2]);
        }
      }
    });
  }
  onHiddenRangesChange() {
    for (const id2 in this._zones) {
      this._updateWhitespace(this._zones[id2]);
    }
  }
  _updateWhitespace(zone) {
    const whitespaceId = zone.whitespaceId;
    const viewPosition = this.coordinator.convertModelIndexToViewIndex(zone.zone.afterModelPosition);
    const isInHiddenArea = this._isInHiddenRanges(zone.zone);
    zone.isInHiddenArea = isInHiddenArea;
    this.listView.changeOneWhitespace(whitespaceId, viewPosition, isInHiddenArea ? 0 : zone.zone.heightInPx);
  }
  layout() {
    for (const id2 in this._zones) {
      this._layoutZone(id2);
    }
  }
  _addZone(zone) {
    const viewPosition = this.coordinator.convertModelIndexToViewIndex(zone.afterModelPosition);
    const whitespaceId = this.listView.insertWhitespace(viewPosition, zone.heightInPx);
    const isInHiddenArea = this._isInHiddenRanges(zone);
    const myZone = {
      whitespaceId,
      zone,
      domNode: createFastDomNode(zone.domNode),
      isInHiddenArea
    };
    this._zones[whitespaceId] = myZone;
    myZone.domNode.setPosition("absolute");
    myZone.domNode.domNode.style.width = "100%";
    myZone.domNode.setDisplay("none");
    myZone.domNode.setAttribute("notebook-view-zone", whitespaceId);
    this.domNode.appendChild(myZone.domNode);
    return whitespaceId;
  }
  _removeZone(id2) {
    this.listView.removeWhitespace(id2);
    const zoneWidget = this._zones[id2];
    if (zoneWidget) {
      try {
        this.domNode.removeChild(zoneWidget.domNode);
      } catch {
      }
    }
    delete this._zones[id2];
  }
  _layoutZone(id2) {
    const zoneWidget = this._zones[id2];
    if (!zoneWidget) {
      return;
    }
    this._updateWhitespace(this._zones[id2]);
    const isInHiddenArea = this._isInHiddenRanges(zoneWidget.zone);
    if (isInHiddenArea) {
      zoneWidget.domNode.setDisplay("none");
    } else {
      const top2 = this.listView.getWhitespacePosition(zoneWidget.whitespaceId);
      zoneWidget.domNode.setTop(top2);
      zoneWidget.domNode.setDisplay("block");
      zoneWidget.domNode.setHeight(zoneWidget.zone.heightInPx);
    }
  }
  _isInHiddenRanges(zone) {
    const afterIndex = zone.afterModelPosition;
    return !this.coordinator.modelIndexIsVisible(afterIndex);
  }
  dispose() {
    super.dispose();
    this._zones = {};
  }
};

function safeInvoke1Arg2(func, arg1) {
  try {
    func(arg1);
  } catch (e) {
    onUnexpectedError(e);
  }
}

var ToggleNotebookViewZoneDeveloperAction = class _ToggleNotebookViewZoneDeveloperAction extends Action2 {
  static {
    this.viewZoneIds = [];
  }
  constructor() {
    super({
      id: "notebook.developer.addViewZones",
      title: localize2(17916, "Toggle Notebook View Zones"),
      category: Categories.Developer,
      precondition: IsDevelopmentContext,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    if (_ToggleNotebookViewZoneDeveloperAction.viewZoneIds.length > 0) {
      editor.changeViewZones((accessor2) => {
        _ToggleNotebookViewZoneDeveloperAction.viewZoneIds.reverse().forEach((id2) => {
          accessor2.removeZone(id2);
        });
        _ToggleNotebookViewZoneDeveloperAction.viewZoneIds = [];
      });
    } else {
      editor.changeViewZones((accessor2) => {
        const cells = editor.getCellsInRange();
        if (cells.length === 0) {
          return;
        }
        const viewZoneIds = [];
        for (let i2 = 0; i2 < cells.length; i2++) {
          const domNode = document.createElement("div");
          domNode.innerText = `View Zone ${i2}`;
          domNode.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
          const viewZoneId = accessor2.addZone({
            afterModelPosition: i2,
            heightInPx: 200,
            domNode
          });
          viewZoneIds.push(viewZoneId);
        }
        _ToggleNotebookViewZoneDeveloperAction.viewZoneIds = viewZoneIds;
      });
    }
  }
};

registerAction2(ToggleNotebookViewZoneDeveloperAction);
export { safeInvoke1Arg2, invalidFunc3, NotebookViewZones, ToggleNotebookViewZoneDeveloperAction };
