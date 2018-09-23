'use strict';

let getCameraList = function() {
  let deviceList = [];

  navigator.mediaDevices.enumerateDevices().then(function(devices) {
    for (let i = 0; i < devices.length; i++) {
      let device = devices[i];

      if (device.kind === 'videoinput') {
        deviceList.push(device);
      }
    }
  });

  return deviceList;
};

let activateCamera = function(deviceId, element) {
  let constraints = {
    audio: false,
    video: {
      deviceId: {
        exact: deviceId,
      },
      width: {
        min: 854,
        ideal: 1280,
        max: 1280,
      },
      height: {
        min: 480,
        ideal: 720,
        max: 720,
      },
      framerate: {
        ideal: 30,
        max: 30,
      },
    },
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function(stream) {
      element.srcObject = stream;
      element.play();
    })
    .catch(function(error) {
      throw new Error(error);
    });
};
