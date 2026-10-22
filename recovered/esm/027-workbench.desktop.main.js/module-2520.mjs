// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/voiceChatService.ts
import { createDecorator } from "./module-0077.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { chatAgentLeader, chatSubcommandLeader } from "./module-0987.mjs";
import { Emitter } from "./module-0017.mjs";
import { rtrim } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISpeechService } from "./module-1254.mjs";
import { IChatAgentService } from "./module-0974.mjs";


// src/vs/workbench/contrib/chat/common/voiceChatService.ts
var IVoiceChatService = createDecorator("voiceChatService");

var VoiceChatInProgress = new RawContextKey("voiceChatInProgress", false, { type: "boolean", description: localize(13482, null) });

var VoiceChatService = class extends Disposable {
  constructor(speechService, chatAgentService, contextKeyService) {
    super();
    this.speechService = speechService;
    this.chatAgentService = chatAgentService;
    this.activeVoiceChatSessions = 0;
    this.voiceChatInProgress = VoiceChatInProgress.bindTo(contextKeyService);
  }
  static {
    this.AGENT_PREFIX = chatAgentLeader;
  }
  static {
    this.COMMAND_PREFIX = chatSubcommandLeader;
  }
  static {
    this.PHRASES_LOWER = {
      [this.AGENT_PREFIX]: "at",
      [this.COMMAND_PREFIX]: "slash"
    };
  }
  static {
    this.PHRASES_UPPER = {
      [this.AGENT_PREFIX]: "At",
      [this.COMMAND_PREFIX]: "Slash"
    };
  }
  static {
    this.CHAT_AGENT_ALIAS = /* @__PURE__ */ new Map([["vscode", "code"]]);
  }
  createPhrases(model) {
    const phrases = /* @__PURE__ */ new Map();
    for (const agent of this.chatAgentService.getActivatedAgents()) {
      const agentPhrase = `${VoiceChatService.PHRASES_LOWER[VoiceChatService.AGENT_PREFIX]} ${VoiceChatService.CHAT_AGENT_ALIAS.get(agent.name) ?? agent.name}`.toLowerCase();
      phrases.set(agentPhrase, { agent: agent.name });
      for (const slashCommand of agent.slashCommands) {
        const slashCommandPhrase = `${VoiceChatService.PHRASES_LOWER[VoiceChatService.COMMAND_PREFIX]} ${slashCommand.name}`.toLowerCase();
        phrases.set(slashCommandPhrase, { agent: agent.name, command: slashCommand.name });
        const agentSlashCommandPhrase = `${agentPhrase} ${slashCommandPhrase}`.toLowerCase();
        phrases.set(agentSlashCommandPhrase, { agent: agent.name, command: slashCommand.name });
      }
    }
    return phrases;
  }
  toText(value2, type) {
    switch (type) {
      case 1 /* AGENT */:
        return `${VoiceChatService.AGENT_PREFIX}${value2.agent}`;
      case 2 /* COMMAND */:
        return `${VoiceChatService.COMMAND_PREFIX}${value2.command}`;
      case 3 /* AGENT_AND_COMMAND */:
        return `${VoiceChatService.AGENT_PREFIX}${value2.agent} ${VoiceChatService.COMMAND_PREFIX}${value2.command}`;
    }
  }
  async createVoiceChatSession(token, options3) {
    const disposables = new DisposableStore();
    const onSessionStoppedOrCanceled = (dispose2) => {
      this.activeVoiceChatSessions = Math.max(0, this.activeVoiceChatSessions - 1);
      if (this.activeVoiceChatSessions === 0) {
        this.voiceChatInProgress.reset();
      }
      if (dispose2) {
        disposables.dispose();
      }
    };
    disposables.add(token.onCancellationRequested(() => onSessionStoppedOrCanceled(true)));
    let detectedAgent = false;
    let detectedSlashCommand = false;
    const emitter = disposables.add(new Emitter());
    const session = await this.speechService.createSpeechToTextSession(token, "chat");
    if (token.isCancellationRequested) {
      onSessionStoppedOrCanceled(true);
    }
    const phrases = this.createPhrases(options3.model);
    disposables.add(session.onDidChange((e) => {
      switch (e.status) {
        case 2 /* Recognizing */:
        case 3 /* Recognized */: {
          let massagedEvent = e;
          if (e.text) {
            const startsWithAgent = e.text.startsWith(VoiceChatService.PHRASES_UPPER[VoiceChatService.AGENT_PREFIX]) || e.text.startsWith(VoiceChatService.PHRASES_LOWER[VoiceChatService.AGENT_PREFIX]);
            const startsWithSlashCommand = e.text.startsWith(VoiceChatService.PHRASES_UPPER[VoiceChatService.COMMAND_PREFIX]) || e.text.startsWith(VoiceChatService.PHRASES_LOWER[VoiceChatService.COMMAND_PREFIX]);
            if (startsWithAgent || startsWithSlashCommand) {
              const originalWords = e.text.split(" ");
              let transformedWords;
              let waitingForInput = false;
              if (options3.usesAgents && startsWithAgent && !detectedAgent && !detectedSlashCommand && originalWords.length >= 4) {
                const phrase = phrases.get(originalWords.slice(0, 4).map((word) => this.normalizeWord(word)).join(" "));
                if (phrase) {
                  transformedWords = [this.toText(phrase, 3 /* AGENT_AND_COMMAND */), ...originalWords.slice(4)];
                  waitingForInput = originalWords.length === 4;
                  if (e.status === 3 /* Recognized */) {
                    detectedAgent = true;
                    detectedSlashCommand = true;
                  }
                }
              }
              if (options3.usesAgents && startsWithAgent && !detectedAgent && !transformedWords && originalWords.length >= 2) {
                const phrase = phrases.get(originalWords.slice(0, 2).map((word) => this.normalizeWord(word)).join(" "));
                if (phrase) {
                  transformedWords = [this.toText(phrase, 1 /* AGENT */), ...originalWords.slice(2)];
                  waitingForInput = originalWords.length === 2;
                  if (e.status === 3 /* Recognized */) {
                    detectedAgent = true;
                  }
                }
              }
              if (startsWithSlashCommand && !detectedSlashCommand && !transformedWords && originalWords.length >= 2) {
                const phrase = phrases.get(originalWords.slice(0, 2).map((word) => this.normalizeWord(word)).join(" "));
                if (phrase) {
                  transformedWords = [this.toText(
                    phrase,
                    options3.usesAgents && !detectedAgent ? 3 /* AGENT_AND_COMMAND */ : (
                      // rewrite `/fix` to `@workspace /foo` in this case
                      2 /* COMMAND */
                    )
                    // when we have not yet detected an agent before
                  ), ...originalWords.slice(2)];
                  waitingForInput = originalWords.length === 2;
                  if (e.status === 3 /* Recognized */) {
                    detectedSlashCommand = true;
                  }
                }
              }
              massagedEvent = {
                status: e.status,
                text: (transformedWords ?? originalWords).join(" "),
                waitingForInput
              };
            }
          }
          emitter.fire(massagedEvent);
          break;
        }
        case 1 /* Started */:
          this.activeVoiceChatSessions++;
          this.voiceChatInProgress.set(true);
          emitter.fire(e);
          break;
        case 4 /* Stopped */:
          onSessionStoppedOrCanceled(false);
          emitter.fire(e);
          break;
        case 5 /* Error */:
          emitter.fire(e);
          break;
      }
    }));
    return {
      onDidChange: emitter.event
    };
  }
  normalizeWord(word) {
    word = rtrim(word, ".");
    word = rtrim(word, ",");
    word = rtrim(word, "?");
    return word.toLowerCase();
  }
};

VoiceChatService = __decorateClass([
  __decorateParam(0, ISpeechService),
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IContextKeyService)
], VoiceChatService);
export { IVoiceChatService, VoiceChatInProgress, VoiceChatService };
