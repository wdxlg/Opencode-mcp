// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/pcmCaptureWorklet.ts



// src/vs/workbench/contrib/chat/browser/pcmCaptureWorklet.ts
var PCM_CAPTURE_PROCESSOR = "vscode-pcm-capture";

var PCM_FLUSH_REQUEST = "vscode-pcm-flush";

var PCM_FLUSH_ACK = "vscode-pcm-flushed";

var FLUSH_TIMEOUT_MS = 250;

function pcmCaptureWorkletSource(chunkSize) {
  return `
class PcmCaptureProcessor extends AudioWorkletProcessor {
	constructor() {
		super();
		this._chunkSize = ${chunkSize};
		this._buffer = new Float32Array(this._chunkSize);
		this._offset = 0;
		this.port.onmessage = e => {
			if (e.data && e.data.type === '${PCM_FLUSH_REQUEST}') {
				this._flush();
				this.port.postMessage({ type: '${PCM_FLUSH_ACK}' });
			}
		};
	}
	_flush() {
		if (this._offset > 0) {
			const chunk = this._buffer.slice(0, this._offset);
			this.port.postMessage(chunk, [chunk.buffer]);
			this._offset = 0;
		}
	}
	process(inputs) {
		const channel = inputs[0] && inputs[0][0];
		if (channel) {
			for (let i = 0; i < channel.length; i++) {
				this._buffer[this._offset++] = channel[i];
				if (this._offset === this._chunkSize) {
					const chunk = this._buffer;
					this.port.postMessage(chunk, [chunk.buffer]);
					this._buffer = new Float32Array(this._chunkSize);
					this._offset = 0;
				}
			}
		}
		return true;
	}
}
registerProcessor('${PCM_CAPTURE_PROCESSOR}', PcmCaptureProcessor);
`;
}

function wirePcmCapturePort(port, timers, onChunk) {
  let onFlushed;
  port.onmessage = (e4) => {
    const data = e4.data;
    if (data && data.type === PCM_FLUSH_ACK) {
      onFlushed?.();
      return;
    }
    onChunk(data);
  };
  const flush = () => new Promise((resolve3) => {
    let settled = false;
    const done = () => {
      if (settled) {
        return;
      }
      settled = true;
      onFlushed = void 0;
      timers.clearTimeout(timer);
      resolve3();
    };
    onFlushed = done;
    const timer = timers.setTimeout(done, FLUSH_TIMEOUT_MS);
    port.postMessage({ type: PCM_FLUSH_REQUEST });
  });
  return { flush };
}

async function createPcmCaptureNode(window2, context2, chunkSize, onChunk) {
  const moduleUrl = URL.createObjectURL(new Blob([pcmCaptureWorkletSource(chunkSize)], { type: "application/javascript" }));
  try {
    await context2.audioWorklet.addModule(moduleUrl);
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
  const node = new window2.AudioWorkletNode(context2, PCM_CAPTURE_PROCESSOR, { numberOfInputs: 1, numberOfOutputs: 1, channelCount: 1 });
  const { flush } = wirePcmCapturePort(node.port, window2, onChunk);
  return { node, flush };
}
export { pcmCaptureWorkletSource, wirePcmCapturePort, createPcmCaptureNode, PCM_CAPTURE_PROCESSOR, PCM_FLUSH_REQUEST, PCM_FLUSH_ACK, FLUSH_TIMEOUT_MS };
