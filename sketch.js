// declare all the global variables
// global variables will be used throughout the functions
let skyShape, waterShape, greenShape, boardwalkShape; // colour map overlays for the left image
let skyFlippedShape, waterFlippedShape, greenFlippedShape, boardwalkFlippedShape; // flipped colour map overlays for the right image
let skyCircles = [], waterCircles = [], greenCircles = [], boardwalkCircles = []; // arrays to store circles for each shape
let imgAspectRatio; // aspect ratio for resizing
let skyColour, waterColour, greenColour, boardwalkColour; // define colours for each shape
let frameCounter = 0; // frame counter to control the animation speed

// declare global variables for individual project
let skyWave, waterWave, greenWave, boardwalkWave;

// create a new class for individual project
// this class tells all the circles to move in one shape
// this class has perlin noise to make a smooth path everytime the screen updates
class WavePattern {
    constructor()
    {
        //start position for perlin noise
        //to give random starting position for the circles
        this.xNoiseOffset = random(1000); // randomise x positon
        this.yNoiseOffset = random(1000); // randomise y positoin
        this.sizeNoiseOffset = random(1000); // randomise circles' size
    }

    // update the circles' position based on perlin noise
    update(circles)
    {
        // give a subtle wave-like movement by adding an angle
        let angleMove = map(noise(1000), 0, 360, 0, width);
        this.xNoiseOffset += cos(angleMove) + 0.001; // drift along x axis
        this.yNoiseOffset += sin(angleMove) + 0.001; // drift along y axis
        this.sizeNoiseOffset += 0.01; // slowly change size effect

        // go through each circle and add perlin noise based offset
        for (let circle of circles)
        {
            // calculate the offsets for each circle based on the noise
            let xMove = (noise(this.xNoiseOffset) - 0.5) * cos(angleMove);
            let yMove = (noise(this.yNoiseOffset) - 0.5) * sin(angleMove);

            // apply the movement to each circle
            circle.x += xMove;
            circle.y += yMove;

            // update size to create the grow-shrink effect
            let scaleFactor = (noise(this.sizeNoiseOffset) * 0.5) + 0.75; // range between 0.75 - 1.25
            circle.size = circle.originalSize * scaleFactor;
        }
    }
}

//preload the images
//these images will be used as a guide for the color map
function preload() {
    screamImg = loadImage("assets/scream.jpg"); // loads but doesn't display
    skyShape = loadImage("assets/skyColourMap.png"); //file for the sky colour map
    waterShape = loadImage("assets/waterColourMap.png"); //path for the water colour map
    greenShape = loadImage("assets/greenColourMap.png"); //path for the green colour map
    boardwalkShape = loadImage("assets/boardwalkColourMap.png"); //path for the boardwalk
    
    // we're going to create a flipped version of the art
    // to fill up the whole screen
    // added flipped assets using https://flip.imageonline.co/ to add complexity
    skyFlippedShape = loadImage("assets/skyFlippedColourMap.png");
    waterFlippedShape = loadImage("assets/waterFlippedColourMap.png");
    greenFlippedShape = loadImage("assets/greenFlippedColourMap.png");
    boardwalkFlippedShape = loadImage("assets/boardwalkFlippedColourMap.png");
}

//
function setup() { //for the animation
    angleMode(DEGREES);
    frameRate(30); //adjusted to reduce load time
    createCanvas(windowWidth, windowHeight);
    imgAspectRatio = screamImg.width / screamImg.height;
    
    // Initialize your existing setup code here
    screamImg.loadPixels();
    skyShape.loadPixels();
    waterShape.loadPixels();
    greenShape.loadPixels();
    boardwalkShape.loadPixels();
    
    // Load flipped images pixels
    skyFlippedShape.loadPixels();
    waterFlippedShape.loadPixels();
    greenFlippedShape.loadPixels();
    boardwalkFlippedShape.loadPixels();
    
    //sets the colour for the sky, water, green, boardwalk
    skyColour = color(255, 116, 2);
    waterColour = color(2, 2, 255);
    greenColour = color(30, 255, 0);
    boardwalkColour = color(153, 43, 0);

    // initialized circles for the original and flipped images
    initializeCircles(skyCircles, skyShape, skyColour, 2000, 0.3, 0, 16);
    initializeCircles(waterCircles, waterShape, waterColour, 2000, 0.3, -0.15, 14);
    initializeCircles(greenCircles, greenShape, greenColour, 2000, 0.15, -0.25, 12);
    initializeCircles(boardwalkCircles, boardwalkShape, boardwalkColour, 7000, -0.3, -0.4, 10);

    // create the wave patterns
    skyWave = new WavePattern();
    waterWave = new WavePattern();
    greenWave = new WavePattern();
    boardwalkWave = new WavePattern();

    //setup window resized to make it responsive
    windowResized();
}

function draw() {
  background(0); // clear the canvas with a black background
  frameCounter++; // frame counter increment to increase the speed

  // rendered the image on both the left and right halves
  for (let i = 0; i < 2; i++) {
      push(); // saved the current transformation state
      translate(i * width / 2, 0); // shifts to the left or right half of the canvas

      if (i === 0) {
          //update each set of circles with its wave pattern
          skyWave.update(skyCircles);
          waterWave.update(waterCircles);
          greenWave.update(greenCircles);
          boardwalkWave.update(boardwalkCircles);

          // draws circles for left half of image (normal)
          moveAndDrawCircles(skyCircles, skyShape, skyColour);
          moveAndDrawCircles(waterCircles, waterShape, waterColour);
          moveAndDrawCircles(greenCircles, greenShape, greenColour);
          moveAndDrawCircles(boardwalkCircles, boardwalkShape, boardwalkColour);
          
          // draws the screamer figure
          drawScreamer();
      } else {
          // Right half (flipped images)
          scale(-1, 1); // flips the objects horizontally
          translate(-width / 2, 0); // moves the origin back into the canvas

          //update each set of circles with its wave pattern
          skyWave.update(skyCircles);
          waterWave.update(waterCircles);
          greenWave.update(greenCircles);
          boardwalkWave.update(boardwalkCircles);

          moveAndDrawCircles(skyCircles, skyFlippedShape, skyColour);
          moveAndDrawCircles(waterCircles, waterFlippedShape, waterColour);
          moveAndDrawCircles(greenCircles, greenFlippedShape, greenColour);
          moveAndDrawCircles(boardwalkCircles, boardwalkFlippedShape, boardwalkColour); // Use only the flipped boardwalk          

          // drew the flipped screamer figure
          drawScreamer();
      }

      pop(); // restored transformation state
  }
} 

//defined a function to built and drive circles with specific features added to an array  
function initializeCircles(circles, shape, colour, count, xSpeed, ySpeed, size) {
    for (let i = 0; i < count; i++) { 
        let { x: xPos, y: yPos } = findRandomColourPosition(shape, colour, false); //finds xy coordinate within the shape with that colour
        let initialColour = getCachedColour(screamImg, int(xPos), int(yPos)); //retrieves original colour from screamImg

        circles.push({ //adds the circle to the array
            x: xPos,
            y: yPos,
            size: size + random(5), //randomly adds
            originalSize: random(5, 15),
            opacity: 0, //beginning opacity for glittery effect
            fadeIn: true, //circles fade in
            delay: int(random(30, 150)), //added delay
            opacityDecayRate: random(1, 3), //smooth darkening
            currentColour: initialColour, //set initial colour
            targetColour: initialColour, //also set as initial colour
            xSpeed: xSpeed, //x-speed value
            ySpeed: ySpeed //y-speed value
        });
    }
}

// to check whether the position is near the screaming guy or not
function isPositionNearScreamer(x, y) {
  let scaleFactor = height / 830;
  let verticalOffset = 80 * scaleFactor;  
  //adjusts the bounding box of the screamer shape to avoid overlap
    const screamerBounds = {
        xMin: 188 * scaleFactor, xMax: 374 * scaleFactor,  //horizontal bounds
        yMin: 487 * scaleFactor + verticalOffset, yMax: 880 * scaleFactor + verticalOffset   //vertical bounds 
    };
    return x > screamerBounds.xMin && x < screamerBounds.xMax && y > screamerBounds.yMin && y < screamerBounds.yMax;
} 

// to animate each circle within a specific shape
// we use this function
// this function updates the position, color, and opacity
// of each circle and reposition circles that have faded out completely
function moveAndDrawCircles(circles, shape, shapeColour) {
    let buffer = 16; // allow circles to move slightly beyond the screen edges before resetting

  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];

    // start moving and fading in after delay
    if (frameCounter >= circle.delay) {
      circle.x += circle.xSpeed; // update x position
      circle.y += circle.ySpeed; // update y position

      // update colour every few frames
      if (frameCounter % 5 === 0) {
        let newTargetColour = getCachedColour(screamImg, int(circle.x), int(circle.y));
        circle.targetColour = newTargetColour; // set new target colour
      }

      // interpolate between current and target colour
      // reference: https://p5js.org/reference/p5/lerpColor/ 
      circle.currentColour = lerpColor(circle.currentColour, circle.targetColour, 0.1);

      // handle fade in and fade out
      if (circle.fadeIn) {
        circle.opacity += 12.5; // increase opacity more slowly (was 25)
        if (circle.opacity >= 255) {
          circle.opacity = 255;
          circle.fadeIn = false; // switch to fading out
        }
      } else {
        circle.opacity -= circle.opacityDecayRate; // fade out more slowly
        if (circle.opacity <= 0) {
          // reset circle when fully faded out
          let newPosition = findRandomColourPosition(shape, shapeColour);
          circle.x = newPosition.x; // reset x position
          circle.y = newPosition.y; // reset y position
          circle.opacity = 0; // reset opacity
          circle.fadeIn = true; // start fading in again
          circle.delay = frameCounter + int(random(30, 300)); // set new delay with greater randomness
          circle.currentColour = getCachedColour(screamImg, int(circle.x), int(circle.y));
          circle.targetColour = circle.currentColour; // reset colours
        }
      }

      // apply scale factor to circle size
      let scaleFactor = height / 812;
      fill(red(circle.currentColour), green(circle.currentColour), blue(circle.currentColour), circle.opacity);
      noStroke();
      ellipse(circle.x, circle.y, circle.size * scaleFactor, circle.size * scaleFactor);
    }

    // reset if circle moves off screen, with a 20px buffer
    if (circle.x < -buffer || circle.x > width + buffer || circle.y < -buffer || circle.y > height + buffer) {
      let newPosition = findRandomColourPosition(shape, shapeColour);
      circle.x = newPosition.x; // reset x position
      circle.y = newPosition.y; // reset y position
      circle.opacity = 0; // reset opacity
      circle.fadeIn = true; // start fading in again
      circle.delay = frameCounter + int(random(30, 300)); // set new delay with greater randomness
    }
  }
}

// we need to find the colour the random position in a given shape
// where the pixel colour matches a specific colour
// the purpose is to place the circles in areas of a specific colour
function findRandomColourPosition(shape, colour, isFlipped = false) {
  let x, y; // declare variables for x & y coordinates
  let attempts = 0; // initialize attempts
  const maxAttempts = 1000; // set the max attempts allowed to find matching colour
 
  // repeat until the pixel matches a specified colour or attempts exceeds limit
  // the do-while loop is used because we want to run the code at least once
  // reference: https://www.w3schools.com/jsref/jsref_dowhile.asp
  do {
      x = int(random(isFlipped ? width / 2 : 0, isFlipped ? width : width / 2));
      y = int(random(height));
      attempts++;
      if (attempts >= maxAttempts) {
          console.error("max attempts reached: unable to find matching colour");
          break;
      }
  } while (!isShapeColour(getCachedColour(shape, x, y), colour));
  return { x, y };
}

//to check if pixelColour matches shapeColour
function isShapeColour(pixelColour, shapeColour) {
    return red(pixelColour) === red(shapeColour) &&
           green(pixelColour) === green(shapeColour) &&
           blue(pixelColour) === blue(shapeColour);
}
//retrieves colour from coordinates through pixels
function getCachedColour(image, x, y) {
    let index = (x + y * image.width) * 4;
    return color(image.pixels[index], image.pixels[index + 1], image.pixels[index + 2]);
}

function drawScreamer() {
  noStroke(); // ensures no outlines are drawn around shapes

  // the screamer was originally made without accounting for window resize,
  // the scale factor was created based on the windows height in comparison
  // to the height of the original proportions of the screamer at the optimal height
  // with scaleFactor being added to each element ensuring correct sizing for current window height
  let scaleFactor = height / 830;
  let horizontalOffset = screamImg.width/8 * scaleFactor;

  // i also incorporate perlin noise into the screamer function
  // code reference: chat gpt
  // first, set up noise offsets for subtle movements
  let noiseX = noise(frameCount * 0.1) * 10 * scaleFactor; // small horizontal movements
  let noiseY = noise(frameCount * 0.1 + 1000) * 10 * scaleFactor // small vertical movement
  // then add noiseX and noiseY to each vertex to create a small movement


  // Draw bodies main shape with curves
  // the vertex function were introduced in the lecture
  // however, in this code i will use curveVertex to give more control on the curve
  // reference: https://p5js.org/reference/p5/curveVertex/

  fill(76, 63, 55); // body color
  beginShape();
  curveVertex(202 * scaleFactor + noiseX + horizontalOffset, height + noiseY); // start from bottom left of the screen
  curveVertex(202 * scaleFactor + noiseX + horizontalOffset, 752 * scaleFactor + noiseY); // curve down towards body base
  curveVertex(206 * scaleFactor + noiseX + horizontalOffset, 692 * scaleFactor + noiseY); // upward curve to define waist
  curveVertex(188 * scaleFactor + noiseX + horizontalOffset, 651 * scaleFactor + noiseY); // curve inwards for shape contour
  curveVertex(209 * scaleFactor + noiseX + horizontalOffset, 593 * scaleFactor + noiseY); // define shoulder area
  curveVertex(222 * scaleFactor + noiseX + horizontalOffset, 533 * scaleFactor + noiseY); // further shape upper body
  curveVertex(271 * scaleFactor + noiseX + horizontalOffset, 509 * scaleFactor + noiseY); // neck and head start
  curveVertex(249 * scaleFactor + noiseX + horizontalOffset, 434 * scaleFactor + noiseY); // further curve for neck
  curveVertex(300 * scaleFactor + noiseX + horizontalOffset, 387 * scaleFactor + noiseY); // head curve start
  curveVertex(365 * scaleFactor + noiseX + horizontalOffset, 427 * scaleFactor + noiseY); // complete head shape
  curveVertex(345 * scaleFactor + noiseX + horizontalOffset, 520 * scaleFactor + noiseY); // outline back to body
  curveVertex(374 * scaleFactor + noiseX + horizontalOffset, 610 * scaleFactor + noiseY); // lower body
  curveVertex(305 * scaleFactor + noiseX + horizontalOffset, 738 * scaleFactor + noiseY); // return to lower body area
  curveVertex(305 * scaleFactor + noiseX + horizontalOffset, height + noiseY); // complete body outline at bottom right
  endShape(CLOSE);

  // draw his hand - positioned near upper part of the body
  fill(211, 164, 103); // hand color
  beginShape();
  curveVertex(246 * scaleFactor + noiseX + horizontalOffset, 567 * scaleFactor + noiseY); // hand start
  curveVertex(271 * scaleFactor + noiseX + horizontalOffset, 509 * scaleFactor + noiseY); // move to lower hand section
  curveVertex(249 * scaleFactor + noiseX + horizontalOffset, 434 * scaleFactor + noiseY); // curve up to hand contour
  curveVertex(300 * scaleFactor + noiseX + horizontalOffset, 387 * scaleFactor + noiseY); // hand wrist area
  curveVertex(365 * scaleFactor + noiseX + horizontalOffset, 427 * scaleFactor + noiseY); // base of fingers
  curveVertex(345 * scaleFactor + noiseX + horizontalOffset, 520 * scaleFactor + noiseY); // up along fingers
  curveVertex(374 * scaleFactor + noiseX + horizontalOffset, 610 * scaleFactor + noiseY); // back down along hand
  curveVertex(353 * scaleFactor + noiseX + horizontalOffset, 617 * scaleFactor + noiseY); // close off hand shape
  curveVertex(318 * scaleFactor + noiseX + horizontalOffset, 542 * scaleFactor + noiseY); // hand thumb area
  curveVertex(340 * scaleFactor + noiseX + horizontalOffset, 450 * scaleFactor + noiseY); // fingers continue
  curveVertex(285 * scaleFactor + noiseX + horizontalOffset, 457 * scaleFactor + noiseY); // top of hand contour
  curveVertex(296 * scaleFactor + noiseX + horizontalOffset, 505 * scaleFactor + noiseY); // lower back of hand
  curveVertex(263 * scaleFactor + noiseX + horizontalOffset, 587 * scaleFactor + noiseY); // base of hand near wrist
  endShape(CLOSE);

  // draw face: contour of the face structure
  fill(163, 144, 105); // face color
  beginShape();
  curveVertex(295 * scaleFactor + noiseX + horizontalOffset, 514 * scaleFactor + noiseY); // face outline start
  curveVertex(284 * scaleFactor + noiseX + horizontalOffset, 484 * scaleFactor + noiseY); // top of face
  curveVertex(263 * scaleFactor + noiseX + horizontalOffset, 447 * scaleFactor + noiseY); // curve down left side of face
  curveVertex(293 * scaleFactor + noiseX + horizontalOffset, 389 * scaleFactor + noiseY); // lower chin area
  curveVertex(351 * scaleFactor + noiseX + horizontalOffset, 422 * scaleFactor + noiseY); // right side of face
  curveVertex(342 * scaleFactor + noiseX + horizontalOffset, 469 * scaleFactor + noiseY); // return to top right of face
  curveVertex(329 * scaleFactor + noiseX + horizontalOffset, 492 * scaleFactor + noiseY); // finish contour
  curveVertex(313 * scaleFactor + noiseX + horizontalOffset, 513 * scaleFactor + noiseY); // end at chin
  endShape(CLOSE);

  //  eyes and mouth to define facial expression
  fill(216, 181, 117); // color for expression details

  // add perlin noise to animate the eyes
  let eyeNoiseX = noise(frameCount * 0.1) * 8 * scaleFactor; // noise for horizontal eye movement
  let eyeNoiseY = noise(frameCount * 0.1 + 5000) * 8 * scaleFactor; // noise for vertical eye movement
  // apply perlin noise to the eyes
  ellipse(290 * scaleFactor + horizontalOffset + eyeNoiseX, 440 * scaleFactor + eyeNoiseY, 20 * scaleFactor, 30 * scaleFactor); // left eye
  ellipse(325 * scaleFactor + horizontalOffset + eyeNoiseX, 440 * scaleFactor + eyeNoiseY, 20 * scaleFactor, 30 * scaleFactor); // right eye
  // add perlin noise to animate the mouth
  let mouthNoiseX = noise(frameCount * 0.2) * 8 * scaleFactor; // noise for horizontal movement
  let mouthNoiseY = noise(frameCount * 0.2 + 1000) * 8 * scaleFactor; // noise for vertical movement
  // apply perlin noise to the mouth
  ellipse(308 * scaleFactor + horizontalOffset + mouthNoiseX, 490 * scaleFactor + mouthNoiseY, 15 * scaleFactor, 30 * scaleFactor); // mouth

}
  
//resized canvas to fit the windowbased on height and aspect ratio
function windowResized() {
  let newWidth = windowWidth; // Use window width instead of calculating from height
  let newHeight = windowHeight;

  resizeCanvas(newWidth, newHeight);
  
  // Calculate the width for each half of the screen
  let halfWidth = newWidth / 2;
  
  // Resize all images to fill half the screen width while maintaining aspect ratio
  screamImg.resize(halfWidth, newHeight);
  skyShape.resize(halfWidth, newHeight); 
  waterShape.resize(halfWidth, newHeight); 
  greenShape.resize(halfWidth, newHeight); 
  boardwalkShape.resize(halfWidth, newHeight);
  
  // Resize flipped images
  skyFlippedShape.resize(halfWidth, newHeight); 
  waterFlippedShape.resize(halfWidth, newHeight); 
  greenFlippedShape.resize(halfWidth, newHeight); 
  boardwalkFlippedShape.resize(halfWidth, newHeight);
}

// acknowledgements
// chat gpt was used to assist with bug fixing the code

// references
// Flip image online (quickly) - free tool. (n.d.). https://flip.imageonline.co/
// lerpColor. (n.d.). https://p5js.org/reference/p5/lerpColor/
// W3Schools.com. (n.d.). https://www.w3schools.com/jsref/jsref_dowhile.asp 
// curveVertex. (n.d.). https://p5js.org/reference/p5/curveVertex/
// OpenAI. (2024). ChatGPT [Large language model]. https://chatgpt.com

