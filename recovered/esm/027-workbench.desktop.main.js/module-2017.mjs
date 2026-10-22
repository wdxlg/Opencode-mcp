// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/fileConstants.ts
import { localize, localize2 } from "./module-0001.mjs";
import { RawContextKey } from "./module-0089.mjs";


// src/vs/workbench/contrib/files/browser/fileConstants.ts
var REVEAL_IN_EXPLORER_COMMAND_ID = "revealInExplorer";

var REVERT_FILE_COMMAND_ID = "workbench.action.files.revert";

var OPEN_TO_SIDE_COMMAND_ID = "explorer.openToSide";

var OPEN_WITH_EXPLORER_COMMAND_ID = "explorer.openWith";

var SELECT_FOR_COMPARE_COMMAND_ID = "selectForCompare";

var COMPARE_SELECTED_COMMAND_ID = "compareSelected";

var COMPARE_RESOURCE_COMMAND_ID = "compareFiles";

var COMPARE_WITH_SAVED_COMMAND_ID = "workbench.files.action.compareWithSaved";

var COPY_PATH_COMMAND_ID = "copyFilePath";

var COPY_RELATIVE_PATH_COMMAND_ID = "copyRelativeFilePath";

var SAVE_FILE_AS_COMMAND_ID = "workbench.action.files.saveAs";

var SAVE_FILE_AS_LABEL = localize2(15856, "Save As...");

var SAVE_FILE_COMMAND_ID = "workbench.action.files.save";

var SAVE_FILE_LABEL = localize2(15854, "Save");

var SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID = "workbench.action.files.saveWithoutFormatting";

var SAVE_FILE_WITHOUT_FORMATTING_LABEL = localize2(15857, "Save without Formatting");

var SAVE_ALL_COMMAND_ID = "saveAll";

var SAVE_ALL_LABEL = localize2(15855, "Save All");

var SAVE_ALL_IN_GROUP_COMMAND_ID = "workbench.files.action.saveAllInGroup";

var SAVE_FILES_COMMAND_ID = "workbench.action.files.saveFiles";

var OpenEditorsGroupContext = new RawContextKey("groupFocusedInOpenEditors", false);

var OpenEditorsDirtyEditorContext = new RawContextKey("dirtyEditorFocusedInOpenEditors", false);

var OpenEditorsReadonlyEditorContext = new RawContextKey("readonlyEditorFocusedInOpenEditors", false);

var OpenEditorsSelectedFileOrUntitledContext = new RawContextKey("openEditorsSelectedFileOrUntitled", true);

var ResourceSelectedForCompareContext = new RawContextKey("resourceSelectedForCompare", false);

var REMOVE_ROOT_FOLDER_COMMAND_ID = "removeRootFolder";

var REMOVE_ROOT_FOLDER_LABEL = localize(15853, null);

var PREVIOUS_COMPRESSED_FOLDER = "previousCompressedFolder";

var NEXT_COMPRESSED_FOLDER = "nextCompressedFolder";

var FIRST_COMPRESSED_FOLDER = "firstCompressedFolder";

var LAST_COMPRESSED_FOLDER = "lastCompressedFolder";

var NEW_UNTITLED_FILE_COMMAND_ID = "workbench.action.files.newUntitledFile";

var NEW_UNTITLED_FILE_LABEL = localize2(15852, "New Untitled Text File");

var NEW_FILE_COMMAND_ID = "workbench.action.files.newFile";
export { REVEAL_IN_EXPLORER_COMMAND_ID, REVERT_FILE_COMMAND_ID, OPEN_TO_SIDE_COMMAND_ID, OPEN_WITH_EXPLORER_COMMAND_ID, SELECT_FOR_COMPARE_COMMAND_ID, COMPARE_SELECTED_COMMAND_ID, COMPARE_RESOURCE_COMMAND_ID, COMPARE_WITH_SAVED_COMMAND_ID, COPY_PATH_COMMAND_ID, COPY_RELATIVE_PATH_COMMAND_ID, SAVE_FILE_AS_COMMAND_ID, SAVE_FILE_AS_LABEL, SAVE_FILE_COMMAND_ID, SAVE_FILE_LABEL, SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID, SAVE_FILE_WITHOUT_FORMATTING_LABEL, SAVE_ALL_COMMAND_ID, SAVE_ALL_LABEL, SAVE_ALL_IN_GROUP_COMMAND_ID, SAVE_FILES_COMMAND_ID, OpenEditorsGroupContext, OpenEditorsDirtyEditorContext, OpenEditorsReadonlyEditorContext, OpenEditorsSelectedFileOrUntitledContext, ResourceSelectedForCompareContext, REMOVE_ROOT_FOLDER_COMMAND_ID, REMOVE_ROOT_FOLDER_LABEL, PREVIOUS_COMPRESSED_FOLDER, NEXT_COMPRESSED_FOLDER, FIRST_COMPRESSED_FOLDER, LAST_COMPRESSED_FOLDER, NEW_UNTITLED_FILE_COMMAND_ID, NEW_UNTITLED_FILE_LABEL, NEW_FILE_COMMAND_ID };
