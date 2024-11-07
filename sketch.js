let skyShape, waterShape, greenShape, boardwalkShape; // colour map overlays for the left image
let skyFlippedShape, waterFlippedShape, greenFlippedShape, boardwalkFlippedShape; // flipped colour map overlays for the right image
let skyCircles = [], waterCircles = [], greenCircles = [], boardwalkCircles = []; // arrays to store circles for each shape
let imgAspectRatio; // aspect ratio for resizing
let skyColour, waterColour, greenColour, boardwalkColour; // define colours for each shape
let frameCounter = 0; // frame counter for interpolation frequency

function preload() {
    screamImg = loadImage("assets/scream.jpg"); // loads but doesn't display
    skyShape = loadImage("assets/skyColourMap.png"); //file for the sky colour map
    waterShape = loadImage("assets/waterColourMap.png"); //path for the water colour map
    greenShape = loadImage("assets/greenColourMap.png"); //path for the green colour map
    boardwalkShape = loadImage("assets/boardwalkColourMap.png"); //path for the boardwalk
    
    //added flipped assets using https://flip.imageonline.co/ to add complexity
    skyFlippedShape = loadImage("assets/skyFlippedColourMap.png");
    waterFlippedShape = loadImage("assets/waterFlippedColourMap.png");
    greenFlippedShape = loadImage("assets/greenFlippedColourMap.png");
    boardwalkFlippedShape = loadImage("assets/boardwalkFlippedColourMap.png");
}

//
function setup() { //for the animation
    frameRate(30); //adjusted to reduce load time
    imgAspectRatio = screamImg.width / screamImg.height; //gets aspect ratio by dividing width and height of image
    resizeCanvasToFitWindow(); //resized canvas
    screamImg.loadPixels(); //got the pixels for the image 'The Scream' Munch (1983)
    skyShape.loadPixels(); //got the pixels for the sky
    waterShape.loadPixels(); //got the pixels for the water
    greenShape.loadPixels(); //got the pixels for the green bush
    boardwalkShape.loadPixels(); //got the pixels for the boardwalk

    // loaded the pixels for the flipped images
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
}

function draw() {
  background(0);
  frameCounter++;

  // rendered the image on both the left and right halves
  for (let i = 0; i < 2; i++) {
      push(); // saved the current transformation state
      translate(i * width / 2, 0); // shifts to the left or right half of the canvas

      if (i === 0) {
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

          moveAndDrawCircles(skyCircles, skyFlippedShape, skyColour);
          moveAndDrawCircles(waterCircles, waterFlippedShape, waterColour);
          moveAndDrawCircles(greenCircles, greenFlippedShape, greenColour);
          moveAndDrawCircles(boardwalkCircles, boardwalkFlippedShape, boardwalkColour); // Use only the flipped boardwalk          

          // drew the flipped screamer figure
          drawScreamer();
      }

      pop(); // restored transformation state
  }
} //defined a function to built and drive circles with specific features added to an array  
function initializeCircles(circles, shape, colour, count, xSpeed, ySpeed, size) {
    for (let i = 0; i < count; i++) { 
        let { x: xPos, y: yPos } = findRandomColourPosition(shape, colour, false); //finds xy coordinate within the shape with that colour
        let initialColour = getCachedColour(screamImg, int(xPos), int(yPos)); //retrieves original colour from screamImg

        circles.push({ //adds the circle to the array
            x: xPos,
            y: yPos,
            size: size + random(5), //randomly adds
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

//function to find coordinate where colour is matched
function findRandomColourPosition(shape, colour, isFlipped = false) { 
  let x, y;
  let attempts = 0;
  const maxAttempts = 1000; 

  do { //generates random coordinates, checks colour match, and if max attempts are reached
      x = int(random(isFlipped ? width / 2 : 0, isFlipped ? width : width / 2));
      y = int(random(height));
      attempts++;
      if (attempts >= maxAttempts) {
          console.error("max attempts reached: unable to find matching colour");
          break;
      }
  } while (!isShapeColour(getCachedColour(shape, x, y), colour) || isPositionNearScreamer(x, y)); //checks if near screamer
  return { x, y }; 
}

function isPositionNearScreamer(x, y) {
    //adjusts the bounding box of the screamer shape to avoid overlap
    const screamerBounds = {
        xMin: 188, xMax: 374,  //horizontal bounds
        yMin: 487, yMax: 880   //vertical bounds 
    };
    return x > screamerBounds.xMin && x < screamerBounds.xMax && y > screamerBounds.yMin && y < screamerBounds.yMax;
} 

//function moveAndDrawCircles which iterates through each Circle in the array
function moveAndDrawCircles(circles, shape, shapeColour) {
    for (let i = 0; i < circles.length; i++) {
        let circle = circles[i]; //current circle object

        if (frameCounter >= circle.delay) { //ensure frame counter passes delay
            circle.x += circle.xSpeed; //updates position based on speed
            circle.y += circle.ySpeed;

            if (frameCounter % 5 === 0) { //gets ScreamImg colour every 5 frames at the circle pos
                let newTargetColour = getCachedColour(screamImg, int(circle.x), int(circle.y));
                circle.targetColour = newTargetColour;
            }

            circle.currentColour = lerpColor(circle.currentColour, circle.targetColour, 0.1); //smooth colour shift

            if (circle.fadeIn) {  //increase opactity by 25 if fade in is true until 255 
                circle.opacity += 25;
                if (circle.opacity >= 255) {
                    circle.opacity = 255;
                    circle.fadeIn = false;
                }
            } else { //else decreases opacity by DecayRate
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
            //sets fill colour
            fill(circle.currentColour.levels[0], circle.currentColour.levels[1], circle.currentColour.levels[2], circle.opacity);
            noStroke(); //no outlines
            ellipse(circle.x, circle.y, circle.size); //draws as ellipse
        }
    }
}
//finds random matching colour until 1000 times
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
    //draw body with brown color
    fill(76, 63, 55); //fills with brown
    beginShape();
    curveVertex(width / 5, height); //start from the base of the canvas
    curveVertex(202, 880); //first curve point 
    curveVertex(206, 792); //second curve point 
    curveVertex(188, 751); //third curve point 
    curveVertex(209, 693); //fourth curve point 
    curveVertex(222, 633); //fifth curve point 
    curveVertex(271, 609); //sixth curve point 
    curveVertex(249, 534); //seventh curve point 
    curveVertex(300, 487); //eighth curve point (near the chest)
    curveVertex(365, 527); //ninth curve point (upper part)
    curveVertex(345, 620); //curving back up
    curveVertex(374, 710); //reaching for the hand position
    curveVertex(305, 800); //curve back up
    curveVertex(320, 710); //end the curve at the bottom edge of the canvas
    endShape(CLOSE);
  
    //drew hand with beige color (which is a more expressive curve to mimic "screaming" pose)
    fill(222, 199, 146); //filled with beige
    beginShape();
    curveVertex(246, 667); //started the hand curve
    curveVertex(271, 609); //curve shape
    curveVertex(249, 534); //continue the curve down
    curveVertex(300, 487); //maintain body interaction
    curveVertex(365, 527); //add the hand pose
    curveVertex(345, 620); //wrapping hand back 
    curveVertex(374, 710); //finishing the hand curve 
    curveVertex(353, 717); //add expressive hand extension 
    curveVertex(318, 642); //adding more fluid motion 
    curveVertex(340, 550); //keep the fluid motion going
    curveVertex(285, 557); //adding hand fluidity 
    curveVertex(296, 605); //complete the hand shape 
    curveVertex(263, 687); //bottom end of the hand 
    endShape(CLOSE);
  
    //drew face with white color
    fill(169, 169, 169); //fill with white shade
    beginShape();
    curveVertex(295, 614); //start face curve 
    curveVertex(284, 584); //continue curve 
    curveVertex(263, 547); //continue to facial curve 
    curveVertex(293, 489); //extend face shape 
    curveVertex(351, 522); //curve for the mouth 
    curveVertex(342, 569); //finish upper facial features
    curveVertex(329, 592); //end face curve 
    curveVertex(313, 613); //closing the face shape 
    endShape(CLOSE);
  
    //drew eyes and mouth with dark beige color for expressions
    fill(255); //fill with dark beige for expression
    ellipse(290, 540, 20, 30); //left eye
    ellipse(325, 540, 20, 30); //right eye 
    ellipse(308, 590, 15, 30); //mouth expression 
    
    pop();
  }
  
  //resized canvas to fit the windowbased on height and aspect ratio
  function resizeCanvasToFitWindow() {
    let newHeight = windowHeight;
    let newWidth = newHeight * imgAspectRatio * 2;

    resizeCanvas(newWidth, newHeight);
    screamImg.resize(newWidth / 2, newHeight);
    skyShape.resize(newWidth / 2, newHeight); 
    waterShape.resize(newWidth / 2, newHeight); 
    greenShape.resize(newWidth / 2, newHeight); 
    boardwalkShape.resize(newWidth / 2, newHeight);
    
    //resized flipped images
    skyFlippedShape.resize(newWidth / 2, newHeight); 
    waterFlippedShape.resize(newWidth / 2, newHeight); 
    greenFlippedShape.resize(newWidth / 2, newHeight); 
    boardwalkFlippedShape.resize(newWidth / 2, newHeight);
}