let screamImg; // hidden background image
let skyShape, waterShape, greenShape, boardwalkShape, screamerOverlay; // colour map overlays
let skyCircles = [], waterCircles = [], greenCircles = [], boardwalkCircles = []; // arrays to store circles for each shape
let imgAspectRatio; // aspect ratio for resizing
let skyColour, waterColour, greenColour, boardwalkColour; // define colours for each shape
let frameCounter = 0; // frame counter for interpolation frequency


function preload() {
  // loads images from assets folder
  screamImg = loadImage("assets/scream.jpg"); // loads but doesn't display
  skyShape = loadImage("assets/skyColourMap.png"); // sky colour map
  waterShape = loadImage("assets/waterColourMap.png"); // water colour map
  greenShape = loadImage("assets/greenColourMap.png"); // foliage colour map
  boardwalkShape = loadImage("assets/boardwalkColourMap.png"); // boardwalk colour map
  screamerOverlay = loadImage("assets/screamerOpacity.png"); // screamer overlay image
}


function setup() {
  frameRate(30); // sets frame rate to reduce computational load
  imgAspectRatio = screamImg.width / screamImg.height; // calculates image aspect ratio
  resizeCanvasToFitWindow(); // initial resize based on window height
  screamImg.loadPixels(); // loads pixel data for scream image
  skyShape.loadPixels(); 
  waterShape.loadPixels();
  greenShape.loadPixels(); 
  boardwalkShape.loadPixels(); 

  // define target colours
  skyColour = color(255, 116, 2); // sky colour
  waterColour = color(2, 2, 255); // water colour
  greenColour = color(30, 255, 0); // green colour
  boardwalkColour = color(153, 43, 0); // boardwalk colour

  // initialise circles for each shape with customisable sizes
  initializeCircles(skyCircles, skyShape, skyColour, 2000, 0.3, 0, 16); // sky circles
  initializeCircles(waterCircles, waterShape, waterColour, 2000, 0.3, -0.15, 14); // water circles
  initializeCircles(greenCircles, greenShape, greenColour, 2000, 0.15, -0.25, 12); // green circles
  initializeCircles(boardwalkCircles, boardwalkShape, boardwalkColour, 7000, -0.3, -0.4, 10); // boardwalk circles
}


function draw() {
  background(0); // black background for contrast
  frameCounter++; // increment frame counter - used for changing colours

  // move and draw circles for each shape
  moveAndDrawCircles(skyCircles, skyShape, skyColour);
  moveAndDrawCircles(waterCircles, waterShape, waterColour);
  moveAndDrawCircles(greenCircles, greenShape, greenColour);
  moveAndDrawCircles(boardwalkCircles, boardwalkShape, boardwalkColour);

  // overlay the screamer image on top of everything else
  drawScreamer();
  //image(screamerOverlay, 0, 0, width, height);
}


// initialises circles with customisable size
function initializeCircles(circles, shape, colour, count, xSpeed, ySpeed, size) {
  for (let i = 0; i < count; i++) {
    let { x: xPos, y: yPos } = findRandomColourPosition(shape, colour); // find random position in shape
    let initialColour = getCachedColour(screamImg, int(xPos), int(yPos)); // get initial colour

    circles.push({
      x: xPos, // x position
      y: yPos, // y position
      size: size + random(5), // size with slight random variation
      opacity: 0, // start transparent
      fadeIn: true, // flag for fade in
      delay: int(random(30, 150)), // random delay before starting
      opacityDecayRate: random(1, 3), // random fade-out rate
      currentColour: initialColour, // current colour
      targetColour: initialColour, // target colour
      xSpeed: xSpeed, // horizontal speed
      ySpeed: ySpeed // vertical speed
    });
  }
}


// moves, fades, and draws circles based on shape
function moveAndDrawCircles(circles, shape, shapeColour) {
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
      circle.currentColour = lerpColor(circle.currentColour, circle.targetColour, 0.1);

      // handle fade in and fade out
      if (circle.fadeIn) {
        circle.opacity += 25; // increase opacity quickly
        if (circle.opacity >= 255) {
          circle.opacity = 255;
          circle.fadeIn = false; // switch to fading out
        }
      } else {
        circle.opacity -= circle.opacityDecayRate; // fade out slowly
        if (circle.opacity <= 0) {
          // reset circle when fully faded out
          let newPosition = findRandomColourPosition(shape, shapeColour);
          circle.x = newPosition.x; // reset x position
          circle.y = newPosition.y; // reset y position
          circle.opacity = 0; // reset opacity
          circle.fadeIn = true; // start fading in again
          circle.delay = frameCounter + int(random(30, 150)); // set new delay
          circle.currentColour = getCachedColour(screamImg, int(circle.x), int(circle.y));
          circle.targetColour = circle.currentColour; // reset colours
        }
      }

      // draw the circle
      fill(red(circle.currentColour), green(circle.currentColour), blue(circle.currentColour), circle.opacity);
      noStroke();
      ellipse(circle.x, circle.y, circle.size, circle.size);
    }

    // reset if circle moves off screen
    if (circle.x < 0 || circle.x > width || circle.y < 0 || circle.y > height) {
      let newPosition = findRandomColourPosition(shape, shapeColour);
      circle.x = newPosition.x; // reset x position
      circle.y = newPosition.y; // reset y position
      circle.opacity = 0; // reset opacity
      circle.fadeIn = true; // start fading in again
      circle.delay = frameCounter + int(random(30, 150)); // set new delay
    }
  }
}


// gets colour from cached pixel data
function getCachedColour(image, x, y) {
  let index = (x + y * image.width) * 4; // calculate index in pixels array
  return color(image.pixels[index], image.pixels[index + 1], image.pixels[index + 2]); // return colour
}


// finds a random position within the specified colour area
function findRandomColourPosition(shape, colour) {
  let x, y;
  let attempts = 0;
  const maxAttempts = 1000;

  do {
    x = int(random(width)); // random x within canvas
    y = int(random(height)); // random y within canvas
    attempts++;
    if (attempts >= maxAttempts) {
      console.error("max attempts reached: unable to find matching colour");
      break;
    }
  } while (!isShapeColour(getCachedColour(shape, x, y), colour));
  return { x, y }; // return position
}


// checks if a pixel colour matches the specified shape colour
function isShapeColour(pixelColour, shapeColour) {
  return red(pixelColour) === red(shapeColour) &&
         green(pixelColour) === green(shapeColour) &&
         blue(pixelColour) === blue(shapeColour);
}

function drawScreamer() {
  //in this function, the screaming guys is drawn by using curveVertex
  //to get the curvy effect instead of using regular vertex
  //reference: https://p5js.org/reference/p5/curveVertex/
  //reference: https://www.youtube.com/watch?v=76fiD5DvzeQ&ab_channel=TheCodingTrain 

  //to get the exact points, the trick is to 
  //replace them with mouseX and mouseY first
  //then console.log the mouseX & mouse Y position
  //move around the mouse until the desired shape is achieved
  //and then get the point by inspecting the element
  
  //draw body
  fill(76, 63, 55); //fill with brown 
  beginShape();
  curveVertex(width/3, height);
  curveVertex(202, 752);
  curveVertex(206, 692);
  curveVertex(188, 651);
  curveVertex(209, 593);
  curveVertex(222, 533);
  curveVertex(271, 509);
  curveVertex(249, 434);
  curveVertex(300, 387);
  curveVertex(365, 427);
  curveVertex(345, 520);
  curveVertex(374, 610);
  curveVertex(305, 738);
  curveVertex(320, height);
  endShape(CLOSE);
  
  //draw hand
  //the hand is drawn before the face
  //so that the face shape can cover up the hand shape
  fill(211, 164, 103); //fill with beige
  beginShape();
  curveVertex(246, 567);
  curveVertex(271, 509);
  curveVertex(249, 434);
  curveVertex(300, 387);
  curveVertex(365, 427);
  curveVertex(345, 520);
  curveVertex(374, 610);
  curveVertex(353, 617);
  curveVertex(318, 542);
  curveVertex(340, 450);
  curveVertex(285, 457);
  curveVertex(296, 505);
  curveVertex(263, 587);
  endShape(CLOSE);

  //draw face
  fill(163, 144, 105); //fill with light beige
  beginShape();
  curveVertex(295, 514);
  curveVertex(284, 484);
  curveVertex(263, 447);
  curveVertex(293, 389);
  curveVertex(351, 422);
  curveVertex(342, 469);
  curveVertex(329, 492);
  curveVertex(313, 513);
  endShape(CLOSE);

  //draw expression 
  fill(216, 181, 117); //fill with dark beige
  ellipse(290, 440, 20, 30);
  ellipse(325, 440, 20, 30);
  ellipse(308, 490, 15, 30);
}

// resizes canvas based on window height while maintaining aspect ratio
function resizeCanvasToFitWindow() {
  let newHeight = windowHeight; // new height based on window
  let newWidth = newHeight * imgAspectRatio; // calculate new width

  resizeCanvas(newWidth, newHeight); // resize canvas
  screamImg.resize(newWidth, newHeight); // resize image
  skyShape.resize(newWidth, newHeight); 
  waterShape.resize(newWidth, newHeight); 
  greenShape.resize(newWidth, newHeight); 
  boardwalkShape.resize(newWidth, newHeight);
  screamerOverlay.resize(newWidth, newHeight); 
  screamImg.loadPixels(); // reload pixels
  skyShape.loadPixels();
  waterShape.loadPixels(); 
  greenShape.loadPixels(); 
  boardwalkShape.loadPixels(); 
}

function windowResized() {
  resizeCanvasToFitWindow(); // adjust canvas on window resize
}
