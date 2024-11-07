let skyShape, waterShape, greenShape, boardwalkShape; // colour map overlays for the left image
let skyFlippedShape, waterFlippedShape, greenFlippedShape, boardwalkFlippedShape; // flipped colour map overlays for the right image
let skyCircles = [], waterCircles = [], greenCircles = [], boardwalkCircles = []; // arrays to store circles for each shape
let imgAspectRatio; // aspect ratio for resizing
let skyColour, waterColour, greenColour, boardwalkColour; // define colours for each shape
let frameCounter = 0; // frame counter for interpolation frequency

function preload() {
    screamImg = loadImage("assets/scream.jpg"); // loads but doesn't display
    skyShape = loadImage("assets/skyColourMap.png");
    waterShape = loadImage("assets/waterColourMap.png");
    greenShape = loadImage("assets/greenColourMap.png");
    boardwalkShape = loadImage("assets/boardwalkColourMap.png");
    
    // Load flipped images
    skyFlippedShape = loadImage("assets/skyFlippedColourMap.png");
    waterFlippedShape = loadImage("assets/waterFlippedColourMap.png");
    greenFlippedShape = loadImage("assets/greenFlippedColourMap.png");
    boardwalkFlippedShape = loadImage("assets/boardwalkFlippedColourMap.png");
}

function setup() {
    frameRate(30); 
    imgAspectRatio = screamImg.width / screamImg.height;
    resizeCanvasToFitWindow(); 
    screamImg.loadPixels();
    skyShape.loadPixels(); 
    waterShape.loadPixels();
    greenShape.loadPixels(); 
    boardwalkShape.loadPixels();

    // Load flipped images' pixels
    skyFlippedShape.loadPixels();
    waterFlippedShape.loadPixels();
    greenFlippedShape.loadPixels();
    boardwalkFlippedShape.loadPixels();
    
    skyColour = color(255, 116, 2);
    waterColour = color(2, 2, 255);
    greenColour = color(30, 255, 0);
    boardwalkColour = color(153, 43, 0);

    // Initialize circles for both shapes (original and flipped)
    initializeCircles(skyCircles, skyShape, skyColour, 2000, 0.3, 0, 16);
    initializeCircles(waterCircles, waterShape, waterColour, 2000, 0.3, -0.15, 14);
    initializeCircles(greenCircles, greenShape, greenColour, 2000, 0.15, -0.25, 12);
    initializeCircles(boardwalkCircles, boardwalkShape, boardwalkColour, 7000, -0.3, -0.4, 10);
}

function draw() {
  background(0);
  frameCounter++;

  // Render the image on both the left and right halves
  for (let i = 0; i < 2; i++) {
      push(); // Save the current transformation state
      translate(i * width / 2, 0); // Shift to the left or right half of the canvas

      if (i === 0) {
          // Left half (normal images)
          moveAndDrawCircles(skyCircles, skyShape, skyColour);
          moveAndDrawCircles(waterCircles, waterShape, waterColour);
          moveAndDrawCircles(greenCircles, greenShape, greenColour);
          moveAndDrawCircles(boardwalkCircles, boardwalkShape, boardwalkColour);
          
          // Draw the screamer figure
          drawScreamer();
      } else {
          // Right half (flipped images)
          scale(-1, 1); // Flip horizontally
          translate(-width / 2, 0); // Move the origin back into the canvas

          moveAndDrawCircles(skyCircles, skyFlippedShape, skyColour);
          moveAndDrawCircles(waterCircles, waterFlippedShape, waterColour);
          moveAndDrawCircles(greenCircles, greenFlippedShape, greenColour);
          moveAndDrawCircles(boardwalkCircles, boardwalkFlippedShape, boardwalkColour); // Use only the flipped boardwalk          

          // Draw the flipped screamer figure
          drawScreamer();
      }

      pop(); // Restore transformation state
  }
}
function initializeCircles(circles, shape, colour, count, xSpeed, ySpeed, size) {
    for (let i = 0; i < count; i++) {
        let { x: xPos, y: yPos } = findRandomColourPosition(shape, colour, false);
        let initialColour = getCachedColour(screamImg, int(xPos), int(yPos));

        circles.push({
            x: xPos,
            y: yPos,
            size: size + random(5),
            opacity: 0,
            fadeIn: true,
            delay: int(random(30, 150)),
            opacityDecayRate: random(1, 3),
            currentColour: initialColour,
            targetColour: initialColour,
            xSpeed: xSpeed,
            ySpeed: ySpeed
        });
    }
}

function findRandomColourPosition(shape, colour, isFlipped = false) {
  let x, y;
  let attempts = 0;
  const maxAttempts = 1000;

  do {
      x = int(random(isFlipped ? width / 2 : 0, isFlipped ? width : width / 2));
      y = int(random(height));
      attempts++;
      if (attempts >= maxAttempts) {
          console.error("max attempts reached: unable to find matching colour");
          break;
      }
  } while (!isShapeColour(getCachedColour(shape, x, y), colour) || isPositionNearScreamer(x, y)); // Check if near screamer
  return { x, y };
}

function isPositionNearScreamer(x, y) {
    // Adjust the bounding box of the screamer shape to avoid overlap
    const screamerBounds = {
        xMin: 188, xMax: 374,  // Horizontal bounds (example values, adjust as needed)
        yMin: 487, yMax: 880   // Vertical bounds (example values, adjust as needed)
    };
    return x > screamerBounds.xMin && x < screamerBounds.xMax && y > screamerBounds.yMin && y < screamerBounds.yMax;
}

function moveAndDrawCircles(circles, shape, shapeColour) {
    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i];

        if (frameCounter >= circle.delay) {
            circle.x += circle.xSpeed;
            circle.y += circle.ySpeed;

            if (frameCounter % 5 === 0) {
                let newTargetColour = getCachedColour(screamImg, int(circle.x), int(circle.y));
                circle.targetColour = newTargetColour;
            }

            circle.currentColour = lerpColor(circle.currentColour, circle.targetColour, 0.1);

            if (circle.fadeIn) {
                circle.opacity += 25;
                if (circle.opacity >= 255) {
                    circle.opacity = 255;
                    circle.fadeIn = false;
                }
            } else {
                circle.opacity -= circle.opacityDecayRate;
                if (circle.opacity <= 0) {
                    let newPosition = findRandomColourPosition(shape, shapeColour);
                    circle.x = newPosition.x;
                    circle.y = newPosition.y;
                    circle.opacity = 0;
                    circle.fadeIn = true;
                    circle.delay = frameCounter + int(random(30, 150));
                }
            }

            fill(circle.currentColour.levels[0], circle.currentColour.levels[1], circle.currentColour.levels[2], circle.opacity);
            noStroke();
            ellipse(circle.x, circle.y, circle.size);
        }
    }
}

function findRandomColourPosition(shape, colour, isFlipped = false) {
  let x, y;
  let attempts = 0;
  const maxAttempts = 1000;

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

function isShapeColour(pixelColour, shapeColour) {
    return red(pixelColour) === red(shapeColour) &&
           green(pixelColour) === green(shapeColour) &&
           blue(pixelColour) === blue(shapeColour);
}

function getCachedColour(image, x, y) {
    let index = (x + y * image.width) * 4;
    return color(image.pixels[index], image.pixels[index + 1], image.pixels[index + 2]);
}

function resizeCanvasToFitWindow() {
    let newHeight = windowHeight;
    let newWidth = newHeight * imgAspectRatio * 2;

    resizeCanvas(newWidth, newHeight);
    screamImg.resize(newWidth / 2, newHeight);
    skyShape.resize(newWidth / 2, newHeight); 
    waterShape.resize(newWidth / 2, newHeight); 
    greenShape.resize(newWidth / 2, newHeight); 
    boardwalkShape.resize(newWidth / 2, newHeight);
    
    // Resize flipped images
    skyFlippedShape.resize(newWidth / 2, newHeight); 
    waterFlippedShape.resize(newWidth / 2, newHeight); 
    greenFlippedShape.resize(newWidth / 2, newHeight); 
    boardwalkFlippedShape.resize(newWidth / 2, newHeight);
}

function drawScreamer() {
    // Draw body with brown color
    fill(76, 63, 55); // Fill with brown
    beginShape();
    curveVertex(width / 5, height); // Start from the base of the canvas
    curveVertex(202, 880); // First curve point (moved down)
    curveVertex(206, 792); // Second curve point (moved down)
    curveVertex(188, 751); // Third curve point (moved down)
    curveVertex(209, 693); // Fourth curve point (moved down)
    curveVertex(222, 633); // Fifth curve point (moved down)
    curveVertex(271, 609); // Sixth curve point (moved down)
    curveVertex(249, 534); // Seventh curve point (moved down)
    curveVertex(300, 487); // Eighth curve point (near the chest) (moved down)
    curveVertex(365, 527); // Ninth curve point (upper part) (moved down)
    curveVertex(345, 620); // Curving back up (moved down)
    curveVertex(374, 710); // Reaching for the hand position (moved down)
    curveVertex(305, 800); // Curve back up (moved down)
    curveVertex(320, 710); // End the curve at the bottom edge of the canvas (moved down)
    endShape(CLOSE);
  
    // Draw hand with beige color (more expressive curve to mimic "screaming" pose)
    fill(222, 199, 146); // Fill with beige
    beginShape();
    curveVertex(246, 667); // Start the hand curve (moved down)
    curveVertex(271, 609); // Curve shape (moved down)
    curveVertex(249, 534); // Continue the curve down (moved down)
    curveVertex(300, 487); // Maintain body interaction (moved down)
    curveVertex(365, 527); // Add the hand pose (moved down)
    curveVertex(345, 620); // Wrapping hand back (moved down)
    curveVertex(374, 710); // Finishing the hand curve (moved down)
    curveVertex(353, 717); // Add expressive hand extension (moved down)
    curveVertex(318, 642); // Adding more fluid motion (moved down)
    curveVertex(340, 550); // Keep the fluid motion going (moved down)
    curveVertex(285, 557); // Adding hand fluidity (moved down)
    curveVertex(296, 605); // Complete the hand shape (moved down)
    curveVertex(263, 687); // Bottom end of the hand (moved down)
    endShape(CLOSE);
  
    // Draw face with white color
    fill(169, 169, 169); // Fill with light beige
    beginShape();
    curveVertex(295, 614); // Start face curve (moved down)
    curveVertex(284, 584); // Continue curve (moved down)
    curveVertex(263, 547); // Continue to facial curve (moved down)
    curveVertex(293, 489); // Extend face shape (moved down)
    curveVertex(351, 522); // Curve for the mouth (moved down)
    curveVertex(342, 569); // Finish upper facial features (moved down)
    curveVertex(329, 592); // End face curve (moved down)
    curveVertex(313, 613); // Closing the face shape (moved down)
    endShape(CLOSE);
  
    // Draw eyes and mouth with dark beige color for expressions
    fill(255); // Fill with dark beige for expression
    ellipse(290, 540, 20, 30); // Left eye (moved down)
    ellipse(325, 540, 20, 30); // Right eye (moved down)
    ellipse(308, 590, 15, 30); // Mouth expression (moved down)
    
    pop();
  }
  