// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/localTranscription/node/localTranscriptionMain.js
// Original module marker: src/vs/platform/localTranscription/common/localTranscription.ts
import { createDecorator } from "./module-0033.mjs";


// src/vs/platform/localTranscription/common/localTranscription.ts
var ILocalTranscriptionService = createDecorator("localTranscriptionService");

var localTranscriptionChannelName = "localTranscription";

var DEFAULT_LOCAL_TRANSCRIPTION_MODEL = "nemotron-3.5-asr-streaming-0.6b";
export { ILocalTranscriptionService, localTranscriptionChannelName, DEFAULT_LOCAL_TRANSCRIPTION_MODEL };
