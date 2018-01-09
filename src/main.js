'use strict';

/* Variable declarations. */
// Camera.
let cameraListHandle = document.getElementById('device-list');
let cameraHandle = document.getElementById('camera');

let cameraList = getCameraList();
let cameraSelected;

// Stream.
let streamHandle = document.getElementById('stream');

// Canvas.
let width, height;

let converterHandle = document.createElement('canvas');
let converterContext = converterHandle.getContext('2d');

let comparatorHandle = document.createElement('canvas');
let comparatorContext = comparatorHandle.getContext('2d');

let compositorHandle = document.createElement('canvas');
let compositorContext = compositorHandle.getContext('2d');

let referenceHandle = document.createElement('canvas');
let referenceContext = referenceHandle.getContext('2d');

let backgroundHandle = document.createElement('canvas');
let backgroundContext = backgroundHandle.getContext('2d');

// Background.
let backgroundInput = document.getElementById('input-background');
let backgroundImage = document.getElementById('background-image');
let backgroundSelected = false;

// Reference.
let referenceButton = document.getElementById('take-reference');
let referenceImage = document.getElementById('reference-image');
let referenceDelay = 3;
let referenceTaken = false;

// Comparator.
let thresholdTitleHandle = document.getElementById('threshold-title');
let thresholdValueHandle = document.getElementById('threshold-slider');
let thresholdValue = parseInt(thresholdValueHandle.value);

// Entry.
setTimeout(function() {
    // Camera.
    if (cameraList.length > 0) {
        for (let i = 0; i < cameraList.length; i++) {
            let option = document.createElement('option');

            option.value = cameraList[i].deviceId;
            option.text = cameraList[i].label || 'Camera ' + (i + 1);

            cameraListHandle.add(option);
        }

        cameraSelected = cameraListHandle.options[cameraListHandle.selectedIndex].value;
        activateCamera(cameraSelected, cameraHandle);
    }

    cameraListHandle.addEventListener('input', function () {
        cameraSelected = cameraListHandle.options[cameraListHandle.selectedIndex].value;
        activateCamera(cameraSelected, cameraHandle);
    });

    // Reference.
    referenceButton.addEventListener('click', function () {
        let count = referenceDelay;

        let referenceCountdown = setInterval(function () {
            document.getElementById('countdown').innerHTML = count;

            if (count === 0) {
                clearInterval(referenceCountdown);
                document.getElementById('countdown').innerHTML = '';

                referenceContext.drawImage(converterHandle, 0, 0, width, height);
                referenceImage.src = referenceHandle.toDataURL();
                referenceTaken = true;
            } else {
                count--;
            }
        }, 1000);
    });

    // Loop Entry.
    cameraHandle.addEventListener('loadedmetadata', function () {
        width = cameraHandle.videoWidth;
        height = cameraHandle.videoHeight;

        converterHandle.width = width, converterHandle.height = height;
        comparatorHandle.width = width, comparatorHandle.height = height;
        compositorHandle.width = width, compositorHandle.height = height;
        referenceHandle.width = width, referenceHandle.height = height;
        backgroundHandle.width = width, backgroundHandle.height = height;

        converterContext.drawImage(cameraHandle, 0, 0, width, height);

        // Disable loading overlay.
        document.getElementById('loading').classList.remove('active');

        beginLoops();
    });
}, 1000);

// Loops.
let post;
let ui;

// Begin loops.
let beginLoops = function () {
    post = post || requestAnimationFrame(postProcessLoop);
    ui = ui || requestAnimationFrame(uiLoop);
}

let uiLoop = function () {
    ui = requestAnimationFrame(uiLoop);

    if (!referenceTaken) {
        thresholdTitleHandle.classList.add('disabled');
        thresholdValueHandle.classList.add('disabled');
    } else {
        thresholdTitleHandle.classList.remove('disabled');
        thresholdValueHandle.classList.remove('disabled');

        if (streamHandle.classList.contains('off-screen')) {
            cameraHandle.classList.add('off-screen');
            cameraHandle.classList.remove('feed');
            streamHandle.classList.add('feed');
            streamHandle.classList.remove('off-screen');
        }

        thresholdValue = thresholdValueHandle.value;
    }

    $(document).mousemove(function(event) {
        if (event.pageX < 304) {
            if (document.getElementById('menu').classList.contains('closed')) {
                document.getElementById('menu').classList.remove('closed');
            }
        } else {
            if (!document.getElementById('menu').classList.contains('closed')) {
                document.getElementById('menu').classList.add('closed');
            }
        }
    });
}

// Post Process.
let postProcessLoop = function () {
    post = requestAnimationFrame(postProcessLoop);

    // Background.
    backgroundInput.onchange = function (event) {
        let image = new Image();
        image.src = URL.createObjectURL(event.target.files[0]);
        image.onload = function () {
            backgroundContext.drawImage(image, 0, 0, width, height);
            backgroundImage.src = backgroundHandle.toDataURL();
            backgroundSelected = true;
        }
    }

    // Converter.
    converterContext.clearRect(0, 0, width, height);
    converterContext.drawImage(cameraHandle, 0, 0, width, height);

    // Comparator and masker.
    if (referenceTaken) {
        let referenceFrame = referenceContext.getImageData(0, 0, width, height);
        let converterFrame = converterContext.getImageData(0, 0, width, height);
        let comparatorFrame = comparatorContext.createImageData(width, height);

        createMask(referenceFrame.data, converterFrame.data, comparatorFrame.data, width, height, thresholdValue);

        comparatorContext.clearRect(0, 0, width, height);
        comparatorContext.putImageData(comparatorFrame, 0, 0);

        compositorContext.clearRect(0, 0, width, height);
        compositorContext.drawImage(comparatorHandle, 0, 0, width, height);
        compositorContext.globalCompositeOperation = "source-out";
        compositorContext.drawImage(converterHandle, 0, 0, width, height);

        if (backgroundSelected) {
            compositorContext.globalCompositeOperation = "destination-over";
            compositorContext.drawImage(backgroundHandle, 0, 0, width, height);
        }

        compositorContext.globalCompositeOperation = "source-over";
    }
}

let outputStream = compositorHandle.captureStream();

streamHandle.src = URL.createObjectURL(outputStream);
streamHandle.play();
