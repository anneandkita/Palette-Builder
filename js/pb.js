// Palette Builder v2.0
// Copyright 2012-2013 Play Crafts, Inc.

$(document).ready(startApp);
var palette = [];
var paletteCircles = [];
var circleIndex = -1;
var circledx, circledy;
var ctx, imgScale;
var img, uiFrame;
var stroke = 3;
var imgData;
var reDrawTimer;
var totalOffset = {x: 0, y: 0};

// Let us know when the user wants to load an image
function startApp() {
	$(".button").on("click", buttonClicked);
	document.getElementById('imageUploadBrowse').addEventListener('change', loadImage, false);
}

function buttonClicked() {
	// trigger browser window
	$('#imageUploadBrowse').trigger('click');
}

function getOffset(object, offset)
{
	if (!object)
		return;
		
	offset.x += object.offsetLeft;
	offset.y += object.offsetTop;
	
	getOffset(object.offsetParent, offset);
}

function findCircle(event) {
	var x, y;
	
	totalOffset.x = totalOffset.y = 0;
	
	getOffset(uiFrame, totalOffset);
	
    var x = event.pageX - totalOffset.x,
        y = event.pageY - totalOffset.y;

    // Collision detection between clicked offset and a circle. Start from the top of the stack down in case
    // there are more than one nearby
    for (var i=(paletteCircles.length-1); i>=0; i--)
    {
    	var obj = paletteCircles[i];
    	
        if (y > obj.y - obj.radius && y < obj.y + obj.radius 
            && x > obj.x - obj.radius && x < obj.x + obj.radius) {
            // Note which circle we're on, and store the difference between the center of the circle
            // and the mouse x/y so it doesn't jump to where the mouse is.
            circleIndex = i;
            circledx = x - obj.x;
            circledy = y - obj.y;
            uiFrame.addEventListener('mousemove', moveCircle);
            uiFrame.addEventListener('mouseup', stopMovement);
			redrawTimer = setInterval(reDraw, 20);
            // TODO: update the palette with new color
        }
    }

}

function moveCircle(event) {
	// figure out the new placement of the circle
	paletteCircles[circleIndex].x = Math.round(event.pageX - totalOffset.x - circledx);
	paletteCircles[circleIndex].y = Math.round(event.pageY - totalOffset.y - circledy);
	
	// figure out the pixel color found under the circle
	// pixel # = (y * imgWidth + x) * 4 (since each pixel has 4 pieces of data)
	var imgY = paletteCircles[circleIndex].y;
	var imgX = paletteCircles[circleIndex].x;
	var pixelNum = (imgY * img.width + imgX) * 4;
	var paletteIdx = paletteCircles[circleIndex].palette;
	palette[paletteIdx][0] = imgData.data[pixelNum];
	palette[paletteIdx][1] = imgData.data[pixelNum+1];
	palette[paletteIdx][2] = imgData.data[pixelNum+2];
}

function stopMovement(event) {
	uiFrame.removeEventListener('mousemove', moveCircle);
	uiFrame.removeEventListener('mouseup', stopMovement);
	clearInterval(redrawTimer);
}

// Redraw the screen at set intervals to support the movement of the circles
function reDraw() {

	// draw the image
	// draw the image using the scales we've calculate, or 1 if the image wasn't too big
	ctx.clearRect(0, 0, uiFrame.width, uiFrame.height);
	ctx.drawImage(img, 0, 0, imgScale * img.width, imgScale * img.height);
	
	// draw the circles
	for (var i=0; i<paletteCircles.length; i++)
	{
		var paletteColorIdx = paletteCircles[i].palette;
		ctx.beginPath();
		ctx.arc(paletteCircles[i].x,paletteCircles[i].y,paletteCircles[i].radius-stroke,0,2*Math.PI);
		ctx.fillStyle = "rgb(" + palette[paletteColorIdx][0] + "," + palette[paletteColorIdx][1] + ","  + palette[paletteColorIdx][2] + ")";
		ctx.fill();
		ctx.strokeStyle="#000000";
		ctx.lineWidth=stroke+1;
		ctx.stroke();
		ctx.strokeStyle="#FFFFFF";
		ctx.lineWidth=stroke;
		ctx.stroke();
	}
	// draw the palette
	// Now that we have the colors, let's draw them to the screen
	// Do this after circling them, so that we don't circle the palette
	// TODO: Move the palette to a different canvas
	for (var i=0; i<8; i++)
	{
		// draw each palette color in a 25x25 box along the top
		// TODO: Get the palette to draw in the right place
		ctx.fillStyle = "rgb(" + palette[i][0] + "," + palette[i][1] + ","  + palette[i][2] + ")";
		ctx.fillRect(i*25, 0, 25, 25);
	}
}

function loadImage(evt) {
	// load image
      var reader = new FileReader();
      var imageFile = evt.target.files[0]; // File object

      // Closure to capture the file information.
      reader.onload = (function(theFile) {        
	  	return function(e) {
			
          // Render thumbnail
		  	img = new Image();
			uiFrame = document.getElementById('UIframe');
			
			// make the cursor not turn into an I-beam when we're moving circles around
			uiFrame.onselectstart = function() { return false; } // ie
			uiFrame.onmousedown = function() { return false; } // mozilla
						
			
			ctx = uiFrame.getContext('2d');
	
			// load the image to the webpage
			img.src = e.target.result;
			img.onload = function() {
				// We need to figure out if the image is too big to fit in the area it's being drawn to
				// Figure out how much the width and height of the image would need to be scaled by to fit 
				// 1 or above means the image fits exactly or is smaller than the canvas area
				var widthScale = uiFrame.width/img.width;
				var heightScale = uiFrame.height/img.height;
				
				// if the scale factor is less than 1 for either width or height, the image is bigger than the area it's going 
				// to be drawn to
				if (widthScale < 1 || heightScale < 1)
				{
					// Take the smallest number and scale the image by that, guaranteeing that both the width and height will
					// fit in the area it's going to be drawn to, and the proportions will be constrained
					imgScale = Math.min(widthScale, heightScale);
				}
				else {
					imgScale = 1;
				}
				// check if the user is doing a mousedown over the image so we can see if they are
				// clicking onto a palette circle
				uiFrame.addEventListener('mousedown', findCircle);

				// draw the image using the scales we've calculate, or 1 if the image wasn't too big
				// clear the canvas first so we're not drawing a bunch of images on top of each other
				ctx.clearRect(0, 0, uiFrame.width, uiFrame.height);
				ctx.drawImage(img, 0, 0, imgScale * img.width, imgScale * img.height);

 			  	// Get list of colors in the image (colorutils)
			  	palette = get_colors(img, ctx);
								
				// Draw circles around each of the colors in the palette
				// loop through the pixels in the image
				imgData = ctx.getImageData(0, 0, img.width, img.height);
				
				var foundColor = [false, false, false, false, false, false, false, false];
				paletteCircles = [];
				var toFind = 8;
				var numFound = 0;
				for (var pxl = 0; pxl < imgData.data.length; pxl+=4) {
					// Does it match one of the 8 palette colors?
					for (var i=0; i<8; i++)
					{
						if (!foundColor[i])
						{
							// only looking at the first 8 palette colors
							// TODO: Make this a variable somewhere. bad hacker coder
							if (imgData.data[pxl] === palette[i][0] && imgData.data[pxl+1] === palette[i][1] 
							&& imgData.data[pxl+2] === palette[i][2])
							{
								// if so, draw a circle, and mark it found (so we don't continue to look
								//ctx.rect((pxl/4)%uiFrame.width, (pxl/4)/uiFrame.width, 5, 5);
								var x = (pxl/4)%img.width; //(imgScale*img.width);
								var y = (pxl/4)/img.width; //(imgScale*img.width);
								var radius = 5;
								paletteCircles[numFound] = {x: x, y: y, radius: radius + stroke, palette:i};
								numFound++;								
								foundColor[i] = true;
								toFind--;
							}
						}
						if (toFind === 0)
							break;
					}
				}
				// alert if we didn't find the color, remove this for live
				if (toFind != 0)
					alert("We didn't find " + toFind + " colors.");
				// draw the circles
				for (var i=0; i<paletteCircles.length; i++)
				{
					var paletteColorIdx = paletteCircles[i].palette;
					ctx.beginPath();
					ctx.arc(paletteCircles[i].x,paletteCircles[i].y,paletteCircles[i].radius-stroke,0,2*Math.PI);
					ctx.fillStyle = "rgb(" + palette[paletteColorIdx][0] + "," + palette[paletteColorIdx][1] + ","  + palette[paletteColorIdx][2] + ")";
					ctx.fill();
					ctx.strokeStyle="#000000";
					ctx.lineWidth=stroke+1;
					ctx.stroke();
					ctx.strokeStyle="#FFFFFF";
					ctx.lineWidth=stroke;
					ctx.stroke();
				}		        
				
				// draw the palette
				// Now that we have the colors, let's draw them to the screen
				// Do this after circling them, so that we don't circle the palette
				// TODO: Move the palette to a different canvas
				for (var i=0; i<8; i++)
				{
					// draw each palette color in a 25x25 box along the top
					// TODO: Get the palette to draw in the right place
					ctx.fillStyle = "rgb(" + palette[i][0] + "," + palette[i][1] + ","  + palette[i][2] + ")";
					ctx.fillRect(i*25, 0, 25, 25);
				}
			}
		
		  // move the load image button down below the picture
		  $(".button").css({"position": "static"});

		  
		  
        }; 
      })(imageFile);

      // Read in the image file as a data URL.
      reader.readAsDataURL(imageFile);
      
}
