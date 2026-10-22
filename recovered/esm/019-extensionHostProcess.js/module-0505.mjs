// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/node/ports.ts



// src/vs/base/node/ports.ts
import * as net3 from "net";

var BROWSER_RESTRICTED_PORTS = {
  1: true,
  // tcpmux
  7: true,
  // echo
  9: true,
  // discard
  11: true,
  // systat
  13: true,
  // daytime
  15: true,
  // netstat
  17: true,
  // qotd
  19: true,
  // chargen
  20: true,
  // ftp data
  21: true,
  // ftp access
  22: true,
  // ssh
  23: true,
  // telnet
  25: true,
  // smtp
  37: true,
  // time
  42: true,
  // name
  43: true,
  // nicname
  53: true,
  // domain
  69: true,
  // tftp
  77: true,
  // priv-rjs
  79: true,
  // finger
  87: true,
  // ttylink
  95: true,
  // supdup
  101: true,
  // hostriame
  102: true,
  // iso-tsap
  103: true,
  // gppitnp
  104: true,
  // acr-nema
  109: true,
  // pop2
  110: true,
  // pop3
  111: true,
  // sunrpc
  113: true,
  // auth
  115: true,
  // sftp
  117: true,
  // uucp-path
  119: true,
  // nntp
  123: true,
  // NTP
  135: true,
  // loc-srv /epmap
  137: true,
  // netbios
  139: true,
  // netbios
  143: true,
  // imap2
  161: true,
  // snmp
  179: true,
  // BGP
  389: true,
  // ldap
  427: true,
  // SLP (Also used by Apple Filing Protocol)
  465: true,
  // smtp+ssl
  512: true,
  // print / exec
  513: true,
  // login
  514: true,
  // shell
  515: true,
  // printer
  526: true,
  // tempo
  530: true,
  // courier
  531: true,
  // chat
  532: true,
  // netnews
  540: true,
  // uucp
  548: true,
  // AFP (Apple Filing Protocol)
  554: true,
  // rtsp
  556: true,
  // remotefs
  563: true,
  // nntp+ssl
  587: true,
  // smtp (rfc6409)
  601: true,
  // syslog-conn (rfc3195)
  636: true,
  // ldap+ssl
  989: true,
  // ftps-data
  990: true,
  // ftps
  993: true,
  // ldap+ssl
  995: true,
  // pop3+ssl
  1719: true,
  // h323gatestat
  1720: true,
  // h323hostcall
  1723: true,
  // pptp
  2049: true,
  // nfs
  3659: true,
  // apple-sasl / PasswordServer
  4045: true,
  // lockd
  5060: true,
  // sip
  5061: true,
  // sips
  6e3: true,
  // X11
  6566: true,
  // sane-port
  6665: true,
  // Alternate IRC [Apple addition]
  6666: true,
  // Alternate IRC [Apple addition]
  6667: true,
  // Standard IRC [Apple addition]
  6668: true,
  // Alternate IRC [Apple addition]
  6669: true,
  // Alternate IRC [Apple addition]
  6697: true,
  // IRC + TLS
  10080: true
  // Amanda
};

function findFreePortFaster(startPort, giveUpAfter, timeout2, hostname = "127.0.0.1") {
  let resolved = false;
  let timeoutHandle = void 0;
  let countTried = 1;
  const server = net3.createServer({ pauseOnConnect: true });
  function doResolve(port, resolve2) {
    if (!resolved) {
      resolved = true;
      server.removeAllListeners();
      server.close();
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      resolve2(port);
    }
  }
  return new Promise((resolve2) => {
    timeoutHandle = setTimeout(() => {
      doResolve(0, resolve2);
    }, timeout2);
    server.on("listening", () => {
      doResolve(startPort, resolve2);
    });
    server.on("error", (err) => {
      if (err && (err.code === "EADDRINUSE" || err.code === "EACCES") && countTried < giveUpAfter) {
        startPort++;
        countTried++;
        server.listen(startPort, hostname);
      } else {
        doResolve(0, resolve2);
      }
    });
    server.on("close", () => {
      doResolve(0, resolve2);
    });
    server.listen(startPort, hostname);
  });
}
export { findFreePortFaster, net3, BROWSER_RESTRICTED_PORTS };
