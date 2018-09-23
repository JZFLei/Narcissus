# Narcissus

Narcissus is an awesome background removal software made with love! The background removal algorithm is simple — it calculates a color delta of individual pixels to generate a mask.

## Installation

1. Ensure you have the latest `node` and `npm` installed on your system.
2. Navigate to the `src/` directory.
3. Execute `npm install`.
4. Then to run Narcissus, execute `npm start`.

## Usage

Before running the program, we will need to setup the environment for best results. To do this, we need to create a strong contrast between the background and foreground. One method of doing so is to make sure your background is well lit.

1. Once the environment is setup, ensure your webcam or camera interface is positioned well and will not move.
2. Run the program — `npm start` in the `src/` directory.
3. Select your camera interface if it is not selected already.
4. Select an image to replace the background.
5. If you are in frame move out of frame.
6. Capture a reference image for the background removal process.
7. Come back into frame.
8. Adjust the threshold to your liking.
