// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: node_modules/eventsource-parser/dist/stream.js
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { createParser } from "./module-0103.mjs";


// node_modules/eventsource-parser/dist/stream.js
init_define_OPENCODE_BUILD_INFO();

var EventSourceParserStream = class extends TransformStream {
  constructor({ onError, onRetry, onComment, maxBufferSize } = {}) {
    let parser;
    super({
      start(controller) {
        parser = createParser({
          onEvent: (event) => {
            controller.enqueue(event);
          },
          onError(error2) {
            typeof onError == "function" && onError(error2), (onError === "terminate" || error2.type === "max-buffer-size-exceeded") && controller.error(error2);
          },
          onRetry,
          onComment,
          maxBufferSize
        });
      },
      transform(chunk) {
        parser.feed(chunk);
      }
    });
  }
};
export { EventSourceParserStream };
