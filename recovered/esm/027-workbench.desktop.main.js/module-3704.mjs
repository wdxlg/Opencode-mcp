// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/editStats/aiStatsStatusBar.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { AI_STATS_SETTING_ID } from "./module-3702.mjs";
import { createHotClass } from "./module-0443.mjs";
import { n } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { nativeHoverDelegate } from "./module-0520.mjs";
import { createAiStatsChart } from "./module-3703.mjs";
import { ActionBar } from "./module-0477.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/editStats/aiStatsStatusBar.ts
var AiStatsStatusBar = class extends Disposable {
  constructor(_aiStatsFeature, _statusbarService, _commandService, _telemetryService) {
    super();
    this._aiStatsFeature = _aiStatsFeature;
    this._statusbarService = _statusbarService;
    this._commandService = _commandService;
    this._telemetryService = _telemetryService;
    this._register(autorun((reader) => {
      const statusBarItem = this._createStatusBar().keepUpdated(reader.store);
      const store = this._register(new DisposableStore());
      reader.store.add(this._statusbarService.addEntry({
        name: localize(14962, null),
        ariaLabel: localize(14963, null),
        text: "",
        tooltip: {
          element: async (_token) => {
            this._sendHoverTelemetry();
            store.clear();
            const elem = createAiStatsHover({
              data: this._aiStatsFeature,
              onOpenSettings: () => openSettingsCommand2({ ids: [AI_STATS_SETTING_ID] }).run(this._commandService)
            });
            return elem.keepUpdated(store).element;
          },
          markdownNotSupportedFallback: void 0
        },
        content: statusBarItem.element
      }, "aiStatsStatusBar", 1 /* RIGHT */, 100));
    }));
  }
  static {
    this.hot = createHotClass(this);
  }
  _sendHoverTelemetry() {
    this._telemetryService.publicLog2(
      "aiStatsStatusBar.hover",
      {
        aiRate: this._aiStatsFeature.aiRate.get()
      }
    );
  }
  _createStatusBar() {
    return n.div({
      style: {
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "3px",
        marginRight: "3px"
      }
    }, [
      n.div(
        {
          class: "ai-stats-status-bar",
          style: {
            display: "flex",
            flexDirection: "column",
            width: 50,
            height: 6,
            borderRadius: 6,
            borderWidth: "1px",
            borderStyle: "solid"
          }
        },
        [
          n.div({
            style: {
              flex: 1,
              display: "flex",
              overflow: "hidden",
              borderRadius: 6,
              border: "1px solid transparent"
            }
          }, [
            n.div({
              style: {
                width: this._aiStatsFeature.aiRate.map((v2) => `${v2 * 100}%`),
                backgroundColor: "currentColor"
              }
            })
          ])
        ]
      )
    ]);
  }
};

AiStatsStatusBar = __decorateClass([
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, ITelemetryService)
], AiStatsStatusBar);

function createAiStatsHover(options3) {
  const chartViewMode = observableValue("chartViewMode", "days");
  const aiRatePercent = options3.data.aiRate.map((r2) => `${Math.round(r2 * 100)}%`);
  const createToggleButton = (mode, tooltip, icon2) => {
    return derived((reader) => {
      const currentMode = chartViewMode.read(reader);
      const isActive2 = currentMode === mode;
      return n.div({
        class: ["chart-toggle-button", isActive2 ? "active" : ""],
        style: {
          padding: "2px 4px",
          borderRadius: "3px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        onclick: () => {
          chartViewMode.set(mode, void 0);
        },
        title: tooltip
      }, [
        n.div({
          class: ThemeIcon.asClassName(icon2),
          style: { fontSize: "14px" }
        })
      ]);
    });
  };
  return n.div({
    class: "ai-stats-status-bar"
  }, [
    n.div(
      {
        class: "header",
        style: {
          minWidth: "280px"
        }
      },
      [
        n.div({ style: { flex: 1 } }, [localize(14959, null)]),
        n.div({ style: { marginLeft: "auto" } }, options3.onOpenSettings ? actionBar2([
          {
            action: {
              id: "aiStats.statusBar.settings",
              label: "",
              enabled: true,
              run: options3.onOpenSettings,
              class: ThemeIcon.asClassName(Codicon.gear),
              tooltip: localize(14958, null)
            },
            options: { icon: true, label: false, hoverDelegate: nativeHoverDelegate }
          }
        ]) : [])
      ]
    ),
    n.div({ style: { display: "flex" } }, [
      n.div({ style: { flex: 1, paddingRight: "4px" } }, [
        localize(14964, null, aiRatePercent.get())
      ])
    ]),
    n.div({ style: { flex: 1, paddingRight: "4px" } }, [
      localize(14965, null, options3.data.acceptedInlineSuggestionsToday.get())
    ]),
    // Chart section
    n.div({
      style: {
        marginTop: "8px",
        borderTop: "1px solid var(--vscode-widget-border)",
        paddingTop: "8px"
      }
    }, [
      // Chart header with toggle
      n.div({
        class: "header",
        style: {
          display: "flex",
          alignItems: "center",
          marginBottom: "4px"
        }
      }, [
        n.div({ style: { flex: 1 } }, [
          chartViewMode.map(
            (mode) => mode === "days" ? localize(14960, null) : localize(14961, null)
          )
        ]),
        n.div({
          class: "chart-view-toggle",
          style: { marginLeft: "auto", display: "flex", gap: "2px" }
        }, [
          createToggleButton("days", localize(14966, null), Codicon.calendar),
          createToggleButton("sessions", localize(14967, null), Codicon.listFlat)
        ])
      ]),
      // Chart container
      derived((reader) => {
        const sessions = options3.data.sessions.read(reader);
        const viewMode = chartViewMode.read(reader);
        return n.div({
          ref: (container3) => {
            const chart = createAiStatsChart({
              sessions,
              viewMode
            });
            container3.appendChild(chart);
          }
        });
      })
    ])
  ]);
}

function actionBar2(actions, options3) {
  return derived((_reader) => n.div({
    class: [],
    style: {},
    ref: (elem) => {
      const actionBar3 = _reader.store.add(new ActionBar(elem, options3));
      for (const { action, options: options4 } of actions) {
        actionBar3.push(action, options4);
      }
    }
  }));
}

var CommandWithArgs = class {
  constructor(commandId, args2 = []) {
    this.commandId = commandId;
    this.args = args2;
  }
  run(commandService) {
    commandService.executeCommand(this.commandId, ...this.args);
  }
};

function openSettingsCommand2(options3 = {}) {
  return new CommandWithArgs("workbench.action.openSettings", [{
    query: options3.ids ? options3.ids.map((id2) => `@id:${id2}`).join(" ") : void 0
  }]);
}
export { createAiStatsHover, actionBar2, openSettingsCommand2, AiStatsStatusBar, CommandWithArgs };
