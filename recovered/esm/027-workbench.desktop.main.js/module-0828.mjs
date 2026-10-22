// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/parameterHints/browser/provideSignatureHelp.ts
import { RawContextKey } from "./module-0089.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { Position } from "./module-0079.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/editor/contrib/parameterHints/browser/provideSignatureHelp.ts
var Context2 = {
  Visible: new RawContextKey("parameterHintsVisible", false),
  MultipleSignatures: new RawContextKey("parameterHintsMultipleSignatures", false)
};

async function provideSignatureHelp(registry4, model, position2, context2, token) {
  const supports = registry4.ordered(model);
  for (const support of supports) {
    try {
      const result = await support.provideSignatureHelp(model, position2, token, context2);
      if (result) {
        return result;
      }
    } catch (err) {
      onUnexpectedExternalError(err);
    }
  }
  return void 0;
}

CommandsRegistry.registerCommand("_executeSignatureHelpProvider", async (accessor, ...args2) => {
  const [uri5, position2, triggerCharacter] = args2;
  assertType(URI.isUri(uri5));
  assertType(Position.isIPosition(position2));
  assertType(typeof triggerCharacter === "string" || !triggerCharacter);
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const ref = await accessor.get(ITextModelService).createModelReference(uri5);
  try {
    const result = await provideSignatureHelp(languageFeaturesService.signatureHelpProvider, ref.object.textEditorModel, Position.lift(position2), {
      triggerKind: 1 /* Invoke */,
      isRetrigger: false,
      triggerCharacter
    }, CancellationToken.None);
    if (!result) {
      return void 0;
    }
    setTimeout(() => result.dispose(), 0);
    return result.value;
  } finally {
    ref.dispose();
  }
});
export { provideSignatureHelp, Context2 };
