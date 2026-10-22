// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/deviceAccess.ts



// src/vs/base/browser/deviceAccess.ts
async function requestUsbDevice(options3) {
  const usb = navigator.usb;
  if (!usb) {
    return void 0;
  }
  const device = await usb.requestDevice({ filters: options3?.filters ?? [] });
  if (!device) {
    return void 0;
  }
  return {
    deviceClass: device.deviceClass,
    deviceProtocol: device.deviceProtocol,
    deviceSubclass: device.deviceSubclass,
    deviceVersionMajor: device.deviceVersionMajor,
    deviceVersionMinor: device.deviceVersionMinor,
    deviceVersionSubminor: device.deviceVersionSubminor,
    manufacturerName: device.manufacturerName,
    productId: device.productId,
    productName: device.productName,
    serialNumber: device.serialNumber,
    usbVersionMajor: device.usbVersionMajor,
    usbVersionMinor: device.usbVersionMinor,
    usbVersionSubminor: device.usbVersionSubminor,
    vendorId: device.vendorId
  };
}

async function requestSerialPort(options3) {
  const serial = navigator.serial;
  if (!serial) {
    return void 0;
  }
  const port = await serial.requestPort({ filters: options3?.filters ?? [] });
  if (!port) {
    return void 0;
  }
  const info = port.getInfo();
  return {
    usbVendorId: info.usbVendorId,
    usbProductId: info.usbProductId
  };
}

async function requestHidDevice(options3) {
  const hid = navigator.hid;
  if (!hid) {
    return void 0;
  }
  const devices = await hid.requestDevice({ filters: options3?.filters ?? [] });
  if (!devices.length) {
    return void 0;
  }
  const device = devices[0];
  return {
    opened: device.opened,
    vendorId: device.vendorId,
    productId: device.productId,
    productName: device.productName,
    collections: device.collections
  };
}
export { requestUsbDevice, requestSerialPort, requestHidDevice };
