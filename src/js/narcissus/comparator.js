let createMask = function (input1, input2, output, width, height, threshold) {
    let white = [255, 255, 255, 255];
    let black = [0, 0, 0, 255];

    if (input1.length !== input2.length) {
        throw new Error('Image sizes do not match.');
    }

    if (threshold > 1 || threshold < 0) {
        throw new Error('Threshold must be between 0 and 1.');
    }

    let maxDelta = 35215 * threshold * threshold;
    let differenceCount = 0;

    for (let yPos = 0; yPos < height; yPos++) {
        for (let xPos = 0; xPos < width; xPos++) {
            let position = (yPos * width + xPos) * 4;
            let delta = calculateColourDelta(input1, input2, position, position);

            if (delta > maxDelta) {
                if (output) {
                    drawPixel(output, position, white);
                    differenceCount++;
                }
            } else if (output) {
                drawPixel(output, position, black);
            }
        }
    }

    return differenceCount;
}

let calculateColourDelta = function (input1, input2, position1, position2) {
    let alpha1 = input1[position1 + 3] / 255;
    let alpha2 = input2[position2 + 3] / 255;

    let red1 = blendWithWhite(input1[position1 + 0], alpha1);
    let green1 = blendWithWhite(input1[position1 + 1], alpha1);
    let blue1 = blendWithWhite(input1[position1 + 3], alpha1);

    let red2 = blendWithWhite(input2[position2 + 0], alpha2);
    let green2 = blendWithWhite(input2[position2 + 1], alpha2);
    let blue2 = blendWithWhite(input2[position2 + 2], alpha2);

    let percievedLuminance = rgb2y(red1, green1, blue1) - rgb2y(red2, green2, blue2);
    let colourInformation = rgb2i(red1, green1, blue1) - rgb2i(red2, green2, blue2);
    let luminanceInformation = rgb2q(red1, green1, blue1) - rgb2q(red2, green2, blue2);

    return 0.5053 * percievedLuminance * percievedLuminance + 0.299 * colourInformation * colourInformation + 0.1957 * luminanceInformation * luminanceInformation;
}

let rgb2y = function (red, green, blue) {
    return red * 0.29889531 + green * 0.58662247 + blue * 0.11448223;
}

let rgb2i = function (red, green, blue) {
    return red * 0.59597799 - green * 0.27417610 - blue * 0.32180189;
}

let rgb2q = function (red, green, blue) {
    return red * 0.21147017 - green * 0.52261711 + blue * 0.31114694;
}

let blendWithWhite = function (colour, alpha) {
    return 255 + (colour - 255) * alpha;
}

let drawPixel = function (output, position, rgbaArray) {
    output[position + 0] = rgbaArray[0];
    output[position + 1] = rgbaArray[1];
    output[position + 2] = rgbaArray[2];
    output[position + 3] = rgbaArray[3];
}
