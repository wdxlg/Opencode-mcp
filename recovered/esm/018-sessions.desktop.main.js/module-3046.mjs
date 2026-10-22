// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalMenus.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { HasSpeechProvider } from "./module-1254.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { terminalStrings } from "./module-3030.mjs";
import { TaskExecutionSupportedContext } from "./module-1403.mjs";
import { TERMINAL_VIEW_ID } from "./module-1174.mjs";
import { Codicon } from "./module-0085.mjs";
import { TerminalContribContextKeyStrings } from "./module-1173.mjs";
import { ResourceContextKey } from "./module-0950.mjs";
import { Schemas } from "./module-0033.mjs";
import { hasKey } from "./module-0010.mjs";
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, SIDE_GROUP } from "./module-0935.mjs";
import { Action, Separator, SubmenuAction } from "./module-0082.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalMenus.ts
var TerminalDictationAvailable = ContextKeyExpr.or(
  HasSpeechProvider,
  ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.speechToTextConfigured)
);

function setupTerminalMenus() {
  MenuRegistry.appendMenuItems(
    [
      {
        id: MenuId.MenubarTerminalMenu,
        item: {
          group: "1_create" /* Create */,
          command: {
            id: "workbench.action.terminal.new" /* New */,
            title: localize(20030, null)
          },
          order: 1
        }
      },
      {
        id: MenuId.MenubarTerminalMenu,
        item: {
          group: "1_create" /* Create */,
          command: {
            id: "workbench.action.terminal.newInNewWindow" /* NewInNewWindow */,
            title: localize(20029, null),
            precondition: ContextKeyExpr.has("terminalIsOpen" /* IsOpen */)
          },
          order: 2,
          when: TerminalContextKeys.processSupported
        }
      },
      {
        id: MenuId.MenubarTerminalMenu,
        item: {
          group: "1_create" /* Create */,
          command: {
            id: "workbench.action.terminal.split" /* Split */,
            title: localize(20033, null),
            precondition: ContextKeyExpr.has("terminalIsOpen" /* IsOpen */)
          },
          order: 2,
          when: TerminalContextKeys.processSupported
        }
      },
      {
        id: MenuId.MenubarTerminalMenu,
        item: {
          group: "3_run" /* Run */,
          command: {
            id: "workbench.action.terminal.runActiveFile" /* RunActiveFile */,
            title: localize(20031, null)
          },
          order: 3,
          when: TerminalContextKeys.processSupported
        }
      },
      {
        id: MenuId.MenubarTerminalMenu,
        item: {
          group: "3_run" /* Run */,
          command: {
            id: "workbench.action.terminal.runSelectedText" /* RunSelectedText */,
            title: localize(20032, null)
          },
          order: 4,
          when: TerminalContextKeys.processSupported
        }
      }
    ]
  );
  MenuRegistry.appendMenuItems(
    [
      {
        id: MenuId.TerminalInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.killViewOrEditor" /* KillViewOrEditor */,
            title: terminalStrings.kill.value
          },
          group: "7_kill" /* Kill */
        }
      },
      {
        id: MenuId.TerminalInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.copySelection" /* CopySelection */,
            title: localize(20041, null)
          },
          group: "3_edit" /* Edit */,
          order: 1
        }
      },
      {
        id: MenuId.TerminalInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.copySelectionAsHtml" /* CopySelectionAsHtml */,
            title: localize(20042, null)
          },
          group: "3_edit" /* Edit */,
          order: 2
        }
      },
      {
        id: MenuId.TerminalInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.paste" /* Paste */,
            title: localize(20046, null)
          },
          group: "3_edit" /* Edit */,
          order: 3
        }
      },
      {
        id: MenuId.TerminalInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.clear" /* Clear */,
            title: localize(20039, null)
          },
          group: "5_clear" /* Clear */
        }
      },
      {
        id: MenuId.TerminalInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.sizeToContentWidth" /* SizeToContentWidth */,
            title: terminalStrings.toggleSizeToContentWidth
          },
          group: "9_config" /* Config */
        }
      },
      {
        id: MenuId.TerminalInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.selectAll" /* SelectAll */,
            title: localize(20050, null)
          },
          group: "3_edit" /* Edit */,
          order: 3
        }
      },
      {
        id: MenuId.TerminalInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.startVoice" /* StartVoice */,
            title: localize(20053, null)
          },
          group: "3_edit" /* Edit */,
          order: 4,
          when: ContextKeyExpr.and(TerminalDictationAvailable, TerminalContextKeys.terminalDictationInProgress.toNegated())
        }
      }
    ]
  );
  MenuRegistry.appendMenuItem(MenuId.EditorTabsBarContext, {
    command: {
      id: "workbench.action.createTerminalEditorSameGroup" /* CreateTerminalEditorSameGroup */,
      title: terminalStrings.new
    },
    group: "1_zzz_file",
    order: 30,
    when: TerminalContextKeys.processSupported
  });
  MenuRegistry.appendMenuItem(MenuId.EmptyEditorGroupContext, {
    command: {
      id: "workbench.action.createTerminalEditorSameGroup" /* CreateTerminalEditorSameGroup */,
      title: terminalStrings.new
    },
    group: "1_zzz_file",
    order: 30,
    when: TerminalContextKeys.processSupported
  });
  MenuRegistry.appendMenuItems(
    [
      {
        id: MenuId.TerminalEditorInstanceContext,
        item: {
          group: "1_create" /* Create */,
          command: {
            id: "workbench.action.terminal.split" /* Split */,
            title: terminalStrings.split.value
          }
        }
      },
      {
        id: MenuId.TerminalEditorInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.new" /* New */,
            title: terminalStrings.new
          },
          group: "1_create" /* Create */
        }
      },
      {
        id: MenuId.TerminalEditorInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.killEditor" /* KillEditor */,
            title: terminalStrings.kill.value
          },
          group: "7_kill" /* Kill */
        }
      },
      {
        id: MenuId.TerminalEditorInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.copySelection" /* CopySelection */,
            title: localize(20041, null)
          },
          group: "3_edit" /* Edit */,
          order: 1
        }
      },
      {
        id: MenuId.TerminalEditorInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.copySelectionAsHtml" /* CopySelectionAsHtml */,
            title: localize(20042, null)
          },
          group: "3_edit" /* Edit */,
          order: 2
        }
      },
      {
        id: MenuId.TerminalEditorInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.paste" /* Paste */,
            title: localize(20046, null)
          },
          group: "3_edit" /* Edit */,
          order: 3
        }
      },
      {
        id: MenuId.TerminalEditorInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.clear" /* Clear */,
            title: localize(20039, null)
          },
          group: "5_clear" /* Clear */
        }
      },
      {
        id: MenuId.TerminalEditorInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.selectAll" /* SelectAll */,
            title: localize(20050, null)
          },
          group: "3_edit" /* Edit */,
          order: 3
        }
      },
      {
        id: MenuId.TerminalEditorInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.startVoice" /* StartVoice */,
            title: localize(20053, null)
          },
          group: "3_edit" /* Edit */,
          order: 4,
          when: ContextKeyExpr.and(TerminalDictationAvailable, TerminalContextKeys.terminalDictationInProgress.toNegated())
        }
      },
      {
        id: MenuId.TerminalEditorInstanceContext,
        item: {
          command: {
            id: "workbench.action.terminal.sizeToContentWidth" /* SizeToContentWidth */,
            title: terminalStrings.toggleSizeToContentWidth
          },
          group: "9_config" /* Config */
        }
      }
    ]
  );
  MenuRegistry.appendMenuItems(
    [
      {
        id: MenuId.TerminalTabEmptyAreaContext,
        item: {
          command: {
            id: "workbench.action.terminal.newWithProfile" /* NewWithProfile */,
            title: localize(20044, null)
          },
          group: "1_create" /* Create */
        }
      },
      {
        id: MenuId.TerminalTabEmptyAreaContext,
        item: {
          command: {
            id: "workbench.action.terminal.new" /* New */,
            title: terminalStrings.new
          },
          group: "1_create" /* Create */
        }
      }
    ]
  );
  MenuRegistry.appendMenuItems(
    [
      {
        id: MenuId.TerminalNewDropdownContext,
        item: {
          command: {
            id: "workbench.action.terminal.selectDefaultShell" /* SelectDefaultProfile */,
            title: localize2(20051, "Select Default Profile")
          },
          group: "3_configure"
        }
      },
      {
        id: MenuId.TerminalNewDropdownContext,
        item: {
          command: {
            id: "workbench.action.terminal.openSettings" /* ConfigureTerminalSettings */,
            title: localize(20045, null)
          },
          group: "3_configure"
        }
      },
      {
        id: MenuId.TerminalNewDropdownContext,
        item: {
          command: {
            id: "workbench.action.tasks.runTask",
            title: localize(20036, null)
          },
          when: TaskExecutionSupportedContext,
          group: "4_tasks",
          order: 1
        }
      },
      {
        id: MenuId.TerminalNewDropdownContext,
        item: {
          command: {
            id: "workbench.action.tasks.configureTaskRunner",
            title: localize(20035, null)
          },
          when: TaskExecutionSupportedContext,
          group: "4_tasks",
          order: 2
        }
      }
    ]
  );
  MenuRegistry.appendMenuItems(
    [
      {
        id: MenuId.ViewTitle,
        item: {
          command: {
            id: "workbench.action.terminal.switchTerminal" /* SwitchTerminal */,
            title: localize2(20057, "Switch Terminal")
          },
          group: "navigation",
          order: 0,
          when: ContextKeyExpr.and(
            ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
            ContextKeyExpr.not(`config.${"terminal.integrated.tabs.enabled" /* TabsEnabled */}`)
          )
        }
      },
      {
        // This is used to show instead of tabs when there is only a single terminal
        id: MenuId.ViewTitle,
        item: {
          command: {
            id: "workbench.action.terminal.focus" /* Focus */,
            title: terminalStrings.focus
          },
          alt: {
            id: "workbench.action.terminal.split" /* Split */,
            title: terminalStrings.split.value,
            icon: Codicon.splitHorizontal
          },
          group: "navigation",
          order: 0,
          when: ContextKeyExpr.and(
            ContextKeyExpr.not(TerminalContribContextKeyStrings.ChatHasHiddenTerminals),
            ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
            ContextKeyExpr.has(`config.${"terminal.integrated.tabs.enabled" /* TabsEnabled */}`),
            ContextKeyExpr.or(
              ContextKeyExpr.and(
                ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TabsShowActiveTerminal */}`, "singleTerminal"),
                ContextKeyExpr.equals("terminalGroupCount" /* GroupCount */, 1)
              ),
              ContextKeyExpr.and(
                ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TabsShowActiveTerminal */}`, "singleTerminalOrNarrow"),
                ContextKeyExpr.or(
                  ContextKeyExpr.equals("terminalGroupCount" /* GroupCount */, 1),
                  ContextKeyExpr.has("isTerminalTabsNarrow" /* TabsNarrow */)
                )
              ),
              ContextKeyExpr.and(
                ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TabsShowActiveTerminal */}`, "singleGroup"),
                ContextKeyExpr.equals("terminalGroupCount" /* GroupCount */, 1)
              ),
              ContextKeyExpr.equals(`config.${"terminal.integrated.tabs.showActiveTerminal" /* TabsShowActiveTerminal */}`, "always")
            )
          )
        }
      },
      {
        id: MenuId.ViewTitle,
        item: {
          command: {
            id: "workbench.action.terminal.split" /* Split */,
            title: terminalStrings.split,
            icon: Codicon.splitHorizontal
          },
          group: "navigation",
          order: 2,
          when: TerminalContextKeys.shouldShowViewInlineActions
        }
      },
      {
        id: MenuId.ViewTitle,
        item: {
          command: {
            id: "workbench.action.terminal.kill" /* Kill */,
            title: terminalStrings.kill,
            icon: Codicon.trash
          },
          group: "navigation",
          order: 3,
          when: TerminalContextKeys.shouldShowViewInlineActions
        }
      },
      {
        id: MenuId.ViewTitle,
        item: {
          command: {
            id: "workbench.action.terminal.new" /* New */,
            title: terminalStrings.new,
            icon: Codicon.plus
          },
          alt: {
            id: "workbench.action.terminal.split" /* Split */,
            title: terminalStrings.split.value,
            icon: Codicon.splitHorizontal
          },
          group: "navigation",
          order: 0,
          when: ContextKeyExpr.and(
            ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
            ContextKeyExpr.or(TerminalContextKeys.webExtensionContributedProfile, TerminalContextKeys.processSupported)
          )
        }
      },
      {
        id: MenuId.ViewTitle,
        item: {
          command: {
            id: "workbench.action.terminal.clear" /* Clear */,
            title: localize(20040, null),
            icon: Codicon.clearAll
          },
          group: "navigation",
          order: 6,
          when: ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
          isHiddenByDefault: true
        }
      },
      {
        id: MenuId.ViewTitle,
        item: {
          command: {
            id: "workbench.action.terminal.runActiveFile" /* RunActiveFile */,
            title: localize(20048, null),
            icon: Codicon.run
          },
          group: "navigation",
          order: 7,
          when: ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
          isHiddenByDefault: true
        }
      },
      {
        id: MenuId.ViewTitle,
        item: {
          command: {
            id: "workbench.action.terminal.runSelectedText" /* RunSelectedText */,
            title: localize(20049, null),
            icon: Codicon.selection
          },
          group: "navigation",
          order: 8,
          when: ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
          isHiddenByDefault: true
        }
      },
      {
        id: MenuId.ViewTitle,
        item: {
          command: {
            id: "workbench.action.terminal.startVoice" /* StartVoice */,
            title: localize(20052, null)
          },
          group: "navigation",
          order: 9,
          when: ContextKeyExpr.and(ContextKeyExpr.equals("view", TERMINAL_VIEW_ID), TerminalContextKeys.terminalDictationInProgress.toNegated()),
          isHiddenByDefault: true
        }
      },
      {
        id: MenuId.ViewTitle,
        item: {
          command: {
            id: "workbench.action.terminal.stopVoice" /* StopVoice */,
            title: localize(20055, null)
          },
          group: "navigation",
          order: 9,
          when: ContextKeyExpr.and(ContextKeyExpr.equals("view", TERMINAL_VIEW_ID), TerminalContextKeys.terminalDictationInProgress),
          isHiddenByDefault: true
        }
      }
    ]
  );
  MenuRegistry.appendMenuItems(
    [
      {
        id: MenuId.TerminalTabContext,
        item: {
          command: {
            id: "workbench.action.terminal.splitActiveTab" /* SplitActiveTab */,
            title: terminalStrings.split.value
          },
          group: "1_create" /* Create */,
          order: 1
        }
      },
      {
        id: MenuId.TerminalTabContext,
        item: {
          command: {
            id: "workbench.action.terminal.moveToEditor" /* MoveToEditor */,
            title: terminalStrings.moveToEditor.value
          },
          group: "1_create" /* Create */,
          order: 2
        }
      },
      {
        id: MenuId.TerminalTabContext,
        item: {
          command: {
            id: "workbench.action.terminal.moveIntoNewWindow" /* MoveIntoNewWindow */,
            title: terminalStrings.moveIntoNewWindow.value
          },
          group: "1_create" /* Create */,
          order: 2
        }
      },
      {
        id: MenuId.TerminalTabContext,
        item: {
          command: {
            id: "workbench.action.terminal.renameActiveTab" /* RenameActiveTab */,
            title: localize(20047, null)
          },
          group: "3_edit" /* Edit */
        }
      },
      {
        id: MenuId.TerminalTabContext,
        item: {
          command: {
            id: "workbench.action.terminal.changeIconActiveTab" /* ChangeIconActiveTab */,
            title: localize(20038, null)
          },
          group: "3_edit" /* Edit */
        }
      },
      {
        id: MenuId.TerminalTabContext,
        item: {
          command: {
            id: "workbench.action.terminal.changeColorActiveTab" /* ChangeColorActiveTab */,
            title: localize(20037, null)
          },
          group: "3_edit" /* Edit */
        }
      },
      {
        id: MenuId.TerminalTabContext,
        item: {
          command: {
            id: "workbench.action.terminal.sizeToContentWidth" /* SizeToContentWidth */,
            title: terminalStrings.toggleSizeToContentWidth
          },
          group: "3_edit" /* Edit */
        }
      },
      {
        id: MenuId.TerminalTabContext,
        item: {
          command: {
            id: "workbench.action.terminal.joinActiveTab" /* JoinActiveTab */,
            title: localize(20043, null)
          },
          when: TerminalContextKeys.tabsSingularSelection.toNegated(),
          group: "9_config" /* Config */
        }
      },
      {
        id: MenuId.TerminalTabContext,
        item: {
          command: {
            id: "workbench.action.terminal.unsplit" /* Unsplit */,
            title: terminalStrings.unsplit.value
          },
          when: ContextKeyExpr.and(TerminalContextKeys.tabsSingularSelection, TerminalContextKeys.splitTerminalTabFocused),
          group: "9_config" /* Config */
        }
      },
      {
        id: MenuId.TerminalTabContext,
        item: {
          command: {
            id: "workbench.action.terminal.killActiveTab" /* KillActiveTab */,
            title: terminalStrings.kill.value
          },
          group: "7_kill" /* Kill */
        }
      }
    ]
  );
  MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
    command: {
      id: "workbench.action.terminal.moveToTerminalPanel" /* MoveToTerminalPanel */,
      title: terminalStrings.moveToTerminalPanel
    },
    when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
    group: "2_files"
  });
  MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
    command: {
      id: "workbench.action.terminal.rename" /* Rename */,
      title: terminalStrings.rename
    },
    when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
    group: "2_files"
  });
  MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
    command: {
      id: "workbench.action.terminal.changeColor" /* ChangeColor */,
      title: terminalStrings.changeColor
    },
    when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
    group: "2_files"
  });
  MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
    command: {
      id: "workbench.action.terminal.changeIcon" /* ChangeIcon */,
      title: terminalStrings.changeIcon
    },
    when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
    group: "2_files"
  });
  MenuRegistry.appendMenuItem(MenuId.EditorTitleContext, {
    command: {
      id: "workbench.action.terminal.sizeToContentWidth" /* SizeToContentWidth */,
      title: terminalStrings.toggleSizeToContentWidth
    },
    when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
    group: "2_files"
  });
  for (const menuId of [MenuId.EditorTitle, MenuId.CompactWindowEditorTitle]) {
    MenuRegistry.appendMenuItem(menuId, {
      command: {
        id: "workbench.action.createTerminalEditorSameGroup" /* CreateTerminalEditorSameGroup */,
        title: terminalStrings.new,
        icon: Codicon.plus
      },
      alt: {
        id: "workbench.action.terminal.split" /* Split */,
        title: terminalStrings.split.value,
        icon: Codicon.splitHorizontal
      },
      group: "navigation",
      order: 0,
      when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal)
    });
    MenuRegistry.appendMenuItem(menuId, {
      command: {
        id: "workbench.action.terminal.clear" /* Clear */,
        title: localize(20040, null),
        icon: Codicon.clearAll
      },
      group: "navigation",
      order: 6,
      when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
      isHiddenByDefault: true
    });
    MenuRegistry.appendMenuItem(menuId, {
      command: {
        id: "workbench.action.terminal.runActiveFile" /* RunActiveFile */,
        title: localize(20048, null),
        icon: Codicon.run
      },
      group: "navigation",
      order: 7,
      when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
      isHiddenByDefault: true
    });
    MenuRegistry.appendMenuItem(menuId, {
      command: {
        id: "workbench.action.terminal.runSelectedText" /* RunSelectedText */,
        title: localize(20049, null),
        icon: Codicon.selection
      },
      group: "navigation",
      order: 8,
      when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
      isHiddenByDefault: true
    });
    MenuRegistry.appendMenuItem(menuId, {
      command: {
        id: "workbench.action.terminal.startVoice" /* StartVoice */,
        title: localize(20054, null),
        icon: Codicon.mic
      },
      group: "navigation",
      order: 9,
      when: ContextKeyExpr.and(ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal), TerminalContextKeys.terminalDictationInProgress.negate()),
      isHiddenByDefault: true
    });
    MenuRegistry.appendMenuItem(menuId, {
      command: {
        id: "workbench.action.terminal.stopVoice" /* StopVoice */,
        title: localize(20056, null),
        icon: Codicon.run
      },
      group: "navigation",
      order: 10,
      when: ContextKeyExpr.and(ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal), HasSpeechProvider, TerminalContextKeys.terminalDictationInProgress),
      isHiddenByDefault: true
    });
  }
}

function getTerminalActionBarArgs(location2, profiles2, defaultProfileName, contributedProfiles, terminalService, dropdownMenu, disposableStore) {
  profiles2 = profiles2.filter((e4) => !e4.isAutoDetected);
  const [aiProfiles, otherProfiles] = splitProfiles(profiles2);
  const [aiContributedProfiles, otherContributedProfiles] = splitContributedProfiles(contributedProfiles);
  const dropdownActions = [];
  const submenuActions = [];
  const splitLocation = location2 === 2 /* Editor */ || typeof location2 === "object" && hasKey(location2, { viewColumn: true }) && location2.viewColumn === ACTIVE_GROUP ? { viewColumn: SIDE_GROUP } : { splitActiveTerminal: true };
  if (location2 === 2 /* Editor */) {
    location2 = { viewColumn: ACTIVE_GROUP };
  }
  dropdownActions.push(disposableStore.add(new Action("workbench.action.terminal.new" /* New */, terminalStrings.new, void 0, true, () => terminalService.createAndFocusTerminal())));
  dropdownActions.push(disposableStore.add(new Action("workbench.action.terminal.newInNewWindow" /* NewInNewWindow */, terminalStrings.newInNewWindow.value, void 0, true, () => terminalService.createAndFocusTerminal({
    location: {
      viewColumn: AUX_WINDOW_GROUP,
      auxiliary: { compact: true }
    }
  }))));
  dropdownActions.push(disposableStore.add(new Action("workbench.action.terminal.split" /* Split */, terminalStrings.split.value, void 0, true, () => terminalService.createAndFocusTerminal({
    location: splitLocation
  }))));
  dropdownActions.push(new Separator());
  for (const p of aiProfiles) {
    addProfileActions(p, defaultProfileName, location2, splitLocation, terminalService, dropdownActions, submenuActions, disposableStore);
  }
  for (const contributed of aiContributedProfiles) {
    addContributedProfileActions(contributed, defaultProfileName, location2, splitLocation, terminalService, dropdownActions, submenuActions, disposableStore);
  }
  if ((aiProfiles.length > 0 || aiContributedProfiles.length > 0) && (otherProfiles.length > 0 || otherContributedProfiles.length > 0)) {
    dropdownActions.push(new Separator());
  }
  for (const p of otherProfiles) {
    addProfileActions(p, defaultProfileName, location2, splitLocation, terminalService, dropdownActions, submenuActions, disposableStore);
  }
  for (const contributed of otherContributedProfiles) {
    addContributedProfileActions(contributed, defaultProfileName, location2, splitLocation, terminalService, dropdownActions, submenuActions, disposableStore);
  }
  if (dropdownActions.length > 0) {
    dropdownActions.push(new SubmenuAction("split.profile", localize(20034, null), submenuActions));
    dropdownActions.push(new Separator());
  }
  const actions = dropdownMenu.getActions();
  dropdownActions.push(...Separator.join(...actions.map((a) => a[1])));
  const dropdownAction = disposableStore.add(new Action("refresh profiles", localize(20028, null), "codicon-chevron-down", true));
  return { dropdownAction, dropdownMenuActions: dropdownActions, className: `terminal-tab-actions-${terminalService.resolveLocation(location2)}` };
}

function splitProfiles(profiles2) {
  const aiProfiles = [];
  const otherProfiles = [];
  for (const profile of profiles2) {
    if (isAiProfileName(profile.profileName)) {
      aiProfiles.push(profile);
    } else {
      otherProfiles.push(profile);
    }
  }
  return [aiProfiles, otherProfiles];
}

function splitContributedProfiles(contributedProfiles) {
  const aiContributedProfiles = [];
  const otherContributedProfiles = [];
  for (const profile of contributedProfiles) {
    if (isAiContributedProfile(profile)) {
      aiContributedProfiles.push(profile);
    } else {
      otherContributedProfiles.push(profile);
    }
  }
  return [aiContributedProfiles, otherContributedProfiles];
}

function isAiContributedProfile(profile) {
  const extensionIdentifier = profile.extensionIdentifier.toLowerCase();
  if (extensionIdentifier === "github.copilot-chat" || extensionIdentifier === "anthropic.claude-code") {
    return true;
  }
  return isAiProfileName(profile.title);
}

function isAiProfileName(name) {
  const lowerCaseName = name.toLowerCase();
  return lowerCaseName.includes("copilot") || lowerCaseName.includes("claude");
}

function addProfileActions(profile, defaultProfileName, location2, splitLocation, terminalService, dropdownActions, submenuActions, disposableStore) {
  const isDefault = profile.profileName === defaultProfileName;
  const options3 = { config: profile, location: location2 };
  const splitOptions = { config: profile, location: splitLocation };
  const sanitizedProfileName = profile.profileName.replace(/[\n\r\t]/g, "");
  dropdownActions.push(disposableStore.add(new Action("workbench.action.terminal.newWithProfile" /* NewWithProfile */, isDefault ? localize(20027, null, sanitizedProfileName) : sanitizedProfileName, void 0, true, async () => {
    await terminalService.createAndFocusTerminal(options3);
  })));
  submenuActions.push(disposableStore.add(new Action("workbench.action.terminal.split" /* Split */, isDefault ? localize(20027, null, sanitizedProfileName) : sanitizedProfileName, void 0, true, async () => {
    await terminalService.createAndFocusTerminal(splitOptions);
  })));
}

function addContributedProfileActions(contributed, defaultProfileName, location2, splitLocation, terminalService, dropdownActions, submenuActions, disposableStore) {
  const isDefault = contributed.title === defaultProfileName;
  const title = isDefault ? localize(20027, null, contributed.title.replace(/[\n\r\t]/g, "")) : contributed.title.replace(/[\n\r\t]/g, "");
  dropdownActions.push(disposableStore.add(new Action("contributed", title, void 0, true, () => terminalService.createAndFocusTerminal({
    config: {
      extensionIdentifier: contributed.extensionIdentifier,
      id: contributed.id,
      title
    },
    location: location2
  }))));
  submenuActions.push(disposableStore.add(new Action("contributed-split", title, void 0, true, () => terminalService.createAndFocusTerminal({
    config: {
      extensionIdentifier: contributed.extensionIdentifier,
      id: contributed.id,
      title
    },
    location: splitLocation
  }))));
}
export { setupTerminalMenus, getTerminalActionBarArgs, splitProfiles, splitContributedProfiles, isAiContributedProfile, isAiProfileName, addProfileActions, addContributedProfileActions, TerminalDictationAvailable };
