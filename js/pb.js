// Palette Builder v2.0
// Copyright 2012-2013 Play Crafts, Inc.

$(document).ready(startApp);
var palette = [];
var paletteDiv = [];
var bufferDiv = [];
var circleDiv = [];
var paletteCircles = [];
var newColorIcon;
var ctx, imgScale;
var img, uiFrame, imgFrame;
var defaultPaletteSize = 6;
var paletteSize;
var maxPaletteSize = 8;
var imgData;
var totalOffset = {x: 0, y: 0};
var newIconShown = false;
var combineFrame, combinectx, paletteImage;
var newWindow;
var initialHeight;
var initialWidth;
var i;
var paletteSpacing = 5;

// Let us know when the user wants to load an image
function startApp() {
    $("#loadImage").on("click", buttonClicked);
    document.getElementById('imageUploadBrowse').addEventListener('change', loadImage, false);
    var shareButton = $("#shareImage");
    shareButton.on("click", shareImage);
    shareButton.hide();

    var saveButton = $("#saveImage");
    saveButton.on("click", saveImage);
    saveButton.hide();

    newColorIcon = $("#paletteUI");
    newColorIcon.on ("click", addColor);
    newColorIcon.hide();

    uiFrame = document.getElementById('UIframe');
    initialHeight = uiFrame.height;
    initialWidth = uiFrame.width;
    ctx = uiFrame.getContext('2d');

    // load all the palette divs into the array
    for (i=0; i<maxPaletteSize; i++)
    {
        circleDiv[i] = document.getElementById('circle' + i);
        circleDiv[i].style.display = 'none';
        $("#circle"+i).draggable({
            drag: moveCircle,
            stop: function (event, ui) {
                var circleID = this.id.substr(this.id.length-1);
                paletteCircles[circleID].x = ui.position.left - img.offsetLeft + circleDiv[circleID].offsetWidth/2;
                paletteCircles[circleID].y = ui.position.top - img.offsetTop + circleDiv[circleID].offsetWidth/2;
            }
        });
        paletteDiv[i] = document.getElementById('palette' + (i+1));
        bufferDiv[i] = document.getElementById('buffer' + (i+1));
    }
}

function createImage() {
    // combine the image and the palette into one canvas for saving leaving off the palette circles
    combineFrame = document.getElementById('combinedFrame');
    combinectx = combineFrame.getContext("2d");
    paletteImage = new Image();
    paletteImage.src = paletteFrame.toDataURL("image/png");
}

function popup(url) {
    newWindow=window.open('','popup','height=200,width=150');
    if (window.focus) {newWindow.focus()}
    return false;
}

function shareImage() {
    //Flickr API stuff goes here
    // Open pop-up immediately to minimize chances of pop-up blocker throwing a fit
    var url = '../wp-includes/upload.php';
    popup(url);
    createImage();
    paletteImage.onload = function () {
        combinectx.clearRect(0, 0, combineFrame.width, combineFrame.height);
        combinectx.drawImage(img, 0, 0, img.width*imgScale, img.height*imgScale);
        // draw the palette, but include a 5 pixel buffer between the image and the palette itself
        combinectx.drawImage(paletteImage, 0, img.height*imgScale + 5);

        var data = combineFrame.toDataURL('image/png');

        var form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", url);
        form.setAttribute("target", "popup");

        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", "base64data");
        hiddenField.setAttribute("value", data);

        form.appendChild(hiddenField);

        document.body.appendChild(form);
        form.submit();
       // popup(url+"?base64data="+data);
/*        $.ajax({
            type: "POST",
            url: url,
            dataType: 'text',
            data: {
                base64data : data
            }
        }); */
    }
}

function saveImage() {
    createImage();
    paletteImage.onload = function () {
        combinectx.drawImage(img, 0, 0, img.width*imgScale, img.height*imgScale);
        combinectx.drawImage(paletteImage, 0, img.height*imgScale + 5);
        window.location = combineFrame.toDataURL('image/png');
    }
}

// When the user clicks on our pretty button, trigger the actual ugly button for the file browser window
function buttonClicked() {
	// trigger browser window
	$('#imageUploadBrowse').trigger('click');
}

// recursively find the offset x and y of our object going through all the objects it's nested inside of
function getOffset(object, offset)
{
	if (!object)
		return;
		
	offset.x += object.offsetLeft;
	offset.y += object.offsetTop;
	
	getOffset(object.offsetParent, offset);
}

function addColor() {
    paletteSize++;

    if (paletteSize >= maxPaletteSize)
    {
        newColorIcon.hide();
    }
    reDraw();
}

// move the circle to where the mouse on mousemove
function moveCircle(event, ui) {
    // find current x,y of div
    var circleID = this.id.substr(this.id.length-1);
    var circleX = ui.position.left - img.offsetLeft + circleDiv[circleID].offsetWidth/2;
    var circleY = ui.position.top - img.offsetTop + circleDiv[circleID].offsetWidth/2;

    // figure out what color pixel the circle is over
    var pixelNum = Math.round(circleY * img.width + circleX) * 4;
    var color = "rgba(" + imgData.data[pixelNum] + "," + imgData.data[pixelNum+1] + "," + imgData.data[pixelNum+2] + ")";

    // change div background to the appropriate color
    $(ui.helper).css({backgroundColor: color});
    var paletteColorIdx = paletteCircles[circleID].palette;
    palette[paletteColorIdx][0] = imgData.data[pixelNum];
    palette[paletteColorIdx][1] = imgData.data[pixelNum+1];
    palette[paletteColorIdx][2] = imgData.data[pixelNum+2];
    $(paletteDiv[paletteColorIdx]).css({backgroundColor: color});
}

// Redraw the screen at set intervals to support the movement of the circles
function reDraw() {

	// draw the image using the scales we've calculate, or 1 if the image wasn't too big
	//ctx.clearRect(0, 0, uiFrame.width, uiFrame.height);
	//ctx.drawImage(img, 0, 0, imgScale * img.width, imgScale * img.height);

    // draw the circles and palette
    drawCircles();
    drawPalette();
}

function drawCircles() {
    // reset offset
    totalOffset.x = totalOffset.y = 0;

    // calculate new offset
    getOffset(imgFrame, totalOffset);

    // draw the circles
    for (i=0; i<paletteSize; i++)
    {
        var paletteColorIdx = paletteCircles[i].palette;
        circleDiv[i].style.display = 'inline';
        circleDiv[i].style.left = (imgFrame.offsetLeft + paletteCircles[i].x - circleDiv[i].offsetWidth/2) + "px";
        circleDiv[i].style.top = (imgFrame.offsetTop + paletteCircles[i].y - circleDiv[i].offsetHeight/2) + "px";
        circleDiv[i].style.backgroundColor = "rgb(" + palette[paletteColorIdx][0] + "," + palette[paletteColorIdx][1] + ","  + palette[paletteColorIdx][2] + ")";
    }

    for (; i<maxPaletteSize; i++)
    {
        circleDiv[i].style.display = 'none';
    }
}

function drawPalette() {
    var colorWidth = ((uiFrame.width) - (paletteSpacing*(paletteSize -1)))/paletteSize;

    // update colors in the divs
    for (i=0; i<paletteSize; i++)
    {
        paletteDiv[i].style.width = colorWidth + "px";
        paletteDiv[i].style.backgroundColor = "rgb(" + palette[i][0] + "," + palette[i][1] + "," + palette[i][2] + ")";
        bufferDiv[i].style.width = paletteSpacing + "px";
    }

    for (;i<maxPaletteSize; i++)
    {
        paletteDiv[i].style.width = "0px";
        bufferDiv[i].style.width = "0px";
    }

    // if we have less than the maximum allowed images, show the new palette color icon
    if (paletteSize < maxPaletteSize)
    {
            newIconShown = true;
            newColorIcon.show();
    }
    else
    {
        newIconShown = false;
        newColorIcon.hide();
    }
}

function loadImage(evt) {
      // load image
      var reader = new FileReader();
      var imageFile = evt.target.files[0]; // File object
      imgFrame = document.getElementById('imgFrame');
      paletteSize = defaultPaletteSize;

      // Closure to capture the file information.
      reader.onload = (function (imageFile) {
	  	return function(e) {
          // Render thumbnail
		  	img = new Image();

			// make the cursor not turn into an I-beam when we're moving circles around
			uiFrame.onselectstart = function() { return false; }; // ie
			uiFrame.onmousedown = function() { return false; }; // mozilla

                  // load the image to the webpage
			img.src = e.target.result;
			img.onload = function () {
                uiFrame.width = initialWidth;
                uiFrame.height = initialHeight;
                // We need to figure out if the image is too big to fit in the area it's being drawn to
                // Figure out how much the width and height of the image would need to be scaled by to fit
                // 1 or above means the image fits exactly or is smaller than the canvas area
                var widthScale = uiFrame.width / img.width;
                var heightScale = uiFrame.height / img.height;

                // if the scale factor is less than 1 for either width or height, the image is bigger than the area it's going
                // to be drawn to
                if (widthScale < 1 || heightScale < 1) {
                    // Take the smallest number and scale the image by that, guaranteeing that both the width and height will
                    // fit in the area it's going to be drawn to, and the proportions will be constrained
                    imgScale = Math.min(widthScale, heightScale);
                }
                else {
                    imgScale = 1;
                }

                // check if the user is doing a mousedown over the image so we can see if they are
                // clicking onto a palette circle
//                uiFrame.addEventListener('mousedown', findCircle);
               // paletteFrame.addEventListener('click', paletteUI);

                // draw the image using the scales we've calculate, or 1 if the image wasn't too big
                // clear the canvas first so we're not drawing a bunch of images on top of each other
                ctx.clearRect(0, 0, uiFrame.width, uiFrame.height);
                if (imgFrame.lastChild)
                    imgFrame.removeChild(imgFrame.lastChild);

                // scale the uiFrame to match the picture
                img.width = imgScale * img.width;
                img.height = imgScale * img.height;
                uiFrame.width = img.width;
                uiFrame.height = img.height + paletteSpacing;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                img.style.cssText = 'height:' + img.height + "px !important;" + 'width:' + img.width + "px !important;";

                imgFrame.appendChild(img);

                // Get list of colors in the image (colorutils)
                palette = get_colors(img, ctx);

                // Draw circles around each of the colors in the palette
                // loop through the pixels in the image
                imgData = ctx.getImageData(0, 0, img.width, img.height);

                var colorDists = [null, null, null, null, null, null, null, null];
                paletteCircles = [];
                for (var pxl = 0; pxl < imgData.data.length; pxl += 4) {
                    var img_rVal = imgData.data[pxl];
                    var img_gVal = imgData.data[pxl + 1];
                    var img_bVal = imgData.data[pxl + 2];

                    // only looking at the first few palette colors
                    for (i = 0; i < maxPaletteSize; i++) {
                        var palette_rVal = palette[i][0];
                        var palette_gVal = palette[i][1];
                        var palette_bVal = palette[i][2];

                        var distance = Math.sqrt(Math.pow(palette_rVal - img_rVal, 2) +
                            Math.pow(palette_gVal - img_gVal, 2) +
                            Math.pow(palette_bVal - img_bVal, 2));

                        if (!colorDists[i] || distance < colorDists[i]) {
                            // if this is a better match, update the palette circle
                            //ctx.rect((pxl/4)%uiFrame.width, (pxl/4)/uiFrame.width, 5, 5);
                            var x = (pxl / 4) % img.width; //(imgScale*img.width);
                            var y = (pxl / 4) / img.width; //(imgScale*img.width);
                            var radius = 5;
                            paletteCircles[i] = {x:x, y:y, palette:i};
                            colorDists[i] = distance;
                        }
                    }
                }

                // draw the circles and palette
                drawCircles();
                drawPalette();
            };
		
		  // move the load image button down below the picture
		  $("#loadImage").css({"position": "static"});
          $("#shareImage").show();
          $("#saveImage").show();

		  
		  
        }; 
      })(imageFile);

      // Read in the image file as a data URL.
      reader.readAsDataURL(imageFile);
      
}
