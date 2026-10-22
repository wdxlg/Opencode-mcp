// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/services/languagesAssociations.ts
import { parse4 } from "./module-0857.mjs";
import { basename, posix } from "./module-0026.mjs";
import { Schemas } from "./module-0033.mjs";
import { DataUri } from "./module-0034.mjs";
import { Mimes } from "./module-0136.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { endsWithIgnoreCase, equals2, startsWithUTF8BOM } from "./module-0030.mjs";


// src/vs/editor/common/services/languagesAssociations.ts
var registeredAssociations = [];

var nonUserRegisteredAssociations = [];

var userRegisteredAssociations = [];

function registerPlatformLanguageAssociation(association, warnOnOverwrite = false) {
  _registerLanguageAssociation(association, false, warnOnOverwrite);
}

function registerConfiguredLanguageAssociation(association) {
  _registerLanguageAssociation(association, true, false);
}

function _registerLanguageAssociation(association, userConfigured, warnOnOverwrite) {
  const associationItem = toLanguageAssociationItem(association, userConfigured);
  registeredAssociations.push(associationItem);
  if (!associationItem.userConfigured) {
    nonUserRegisteredAssociations.push(associationItem);
  } else {
    userRegisteredAssociations.push(associationItem);
  }
  if (warnOnOverwrite && !associationItem.userConfigured) {
    registeredAssociations.forEach((a) => {
      if (a.mime === associationItem.mime || a.userConfigured) {
        return;
      }
      if (associationItem.extension && a.extension === associationItem.extension) {
        console.warn(`Overwriting extension <<${associationItem.extension}>> to now point to mime <<${associationItem.mime}>>`);
      }
      if (associationItem.filename && a.filename === associationItem.filename) {
        console.warn(`Overwriting filename <<${associationItem.filename}>> to now point to mime <<${associationItem.mime}>>`);
      }
      if (associationItem.filepattern && a.filepattern === associationItem.filepattern) {
        console.warn(`Overwriting filepattern <<${associationItem.filepattern}>> to now point to mime <<${associationItem.mime}>>`);
      }
      if (associationItem.firstline && a.firstline === associationItem.firstline) {
        console.warn(`Overwriting firstline <<${associationItem.firstline}>> to now point to mime <<${associationItem.mime}>>`);
      }
    });
  }
}

function toLanguageAssociationItem(association, userConfigured) {
  return {
    id: association.id,
    mime: association.mime,
    filename: association.filename,
    extension: association.extension,
    filepattern: association.filepattern,
    firstline: association.firstline,
    userConfigured,
    filepatternParsed: association.filepattern ? parse4(association.filepattern, { ignoreCase: true }) : void 0,
    filepatternOnPath: association.filepattern ? association.filepattern.indexOf(posix.sep) >= 0 : false
  };
}

function clearPlatformLanguageAssociations() {
  registeredAssociations = registeredAssociations.filter((a) => a.userConfigured);
  nonUserRegisteredAssociations = [];
}

function clearConfiguredLanguageAssociations() {
  registeredAssociations = registeredAssociations.filter((a) => !a.userConfigured);
  userRegisteredAssociations = [];
}

function getMimeTypes(resource, firstLine) {
  return getAssociations(resource, firstLine).map((item) => item.mime);
}

function getLanguageIds(resource, firstLine) {
  return getAssociations(resource, firstLine).map((item) => item.id);
}

function getAssociations(resource, firstLine) {
  let path;
  if (resource) {
    switch (resource.scheme) {
      case Schemas.file:
        path = resource.fsPath;
        break;
      case Schemas.data: {
        const metadata = DataUri.parseMetaData(resource);
        path = metadata.get(DataUri.META_DATA_LABEL);
        break;
      }
      case Schemas.vscodeNotebookCell:
        path = void 0;
        break;
      default:
        path = resource.path;
    }
  }
  if (!path) {
    return [{ id: "unknown", mime: Mimes.unknown }];
  }
  path = path.toLowerCase();
  const filename = basename(path);
  const configuredLanguage = getAssociationByPath(path, filename, userRegisteredAssociations);
  if (configuredLanguage) {
    return [configuredLanguage, { id: PLAINTEXT_LANGUAGE_ID, mime: Mimes.text }];
  }
  const registeredLanguage = getAssociationByPath(path, filename, nonUserRegisteredAssociations);
  if (registeredLanguage) {
    return [registeredLanguage, { id: PLAINTEXT_LANGUAGE_ID, mime: Mimes.text }];
  }
  if (firstLine) {
    const firstlineLanguage = getAssociationByFirstline(firstLine);
    if (firstlineLanguage) {
      return [firstlineLanguage, { id: PLAINTEXT_LANGUAGE_ID, mime: Mimes.text }];
    }
  }
  return [{ id: "unknown", mime: Mimes.unknown }];
}

function getAssociationByPath(path, filename, associations) {
  let filenameMatch = void 0;
  let patternMatch = void 0;
  let extensionMatch = void 0;
  for (let i2 = associations.length - 1; i2 >= 0; i2--) {
    const association = associations[i2];
    if (equals2(filename, association.filename, true)) {
      filenameMatch = association;
      break;
    }
    if (association.filepattern) {
      if (!patternMatch || association.filepattern.length > patternMatch.filepattern.length) {
        const target = association.filepatternOnPath ? path : filename;
        if (association.filepatternParsed?.(target)) {
          patternMatch = association;
        }
      }
    }
    if (association.extension) {
      if (!extensionMatch || association.extension.length > extensionMatch.extension.length) {
        if (endsWithIgnoreCase(filename, association.extension)) {
          extensionMatch = association;
        }
      }
    }
  }
  if (filenameMatch) {
    return filenameMatch;
  }
  if (patternMatch) {
    return patternMatch;
  }
  if (extensionMatch) {
    return extensionMatch;
  }
  return void 0;
}

function getAssociationByFirstline(firstLine) {
  if (startsWithUTF8BOM(firstLine)) {
    firstLine = firstLine.substring(1);
  }
  if (firstLine.length > 0) {
    for (let i2 = registeredAssociations.length - 1; i2 >= 0; i2--) {
      const association = registeredAssociations[i2];
      if (!association.firstline) {
        continue;
      }
      const matches2 = firstLine.match(association.firstline);
      if (matches2 && matches2.length > 0) {
        return association;
      }
    }
  }
  return void 0;
}
export { registerPlatformLanguageAssociation, registerConfiguredLanguageAssociation, _registerLanguageAssociation, toLanguageAssociationItem, clearPlatformLanguageAssociations, clearConfiguredLanguageAssociations, getMimeTypes, getLanguageIds, getAssociations, getAssociationByPath, getAssociationByFirstline, registeredAssociations, nonUserRegisteredAssociations, userRegisteredAssociations };
