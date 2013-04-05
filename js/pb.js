// Palette Builder v2.0
// Copyright 2012-2013 Play Crafts, Inc.

$(document).ready(startApp);
var palette = [];
var initialPalette = [];
var paletteDiv = [];
var initialPaletteDiv = [];
var bufferDiv = [];
var circleDiv = [];
var paletteCircles = [];
var initialCircles = [];
var newColorIcon;
var ctx, imgScale;
var img, uiFrame, imgFrame;
var defaultPaletteSize = 6;
var paletteSize;
var maxPaletteSize = 8;
var imgData;
var totalOffset = {x: 0, y: 0};
var newIconShown = false;
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

	newColorIcon = $("#newColor");
	newColorIcon.on ("click", addColor);
	newColorIcon.title = "Add another color to the palette";
	newColorIcon.hide();

	uiFrame = document.getElementById('UIframe');
	initialHeight = uiFrame.height;
	initialWidth = uiFrame.width;
	ctx = uiFrame.getContext('2d');

	// load all the palette divs into the array
	// create the "remove color" icons while we're at it
	for (i=0; i<maxPaletteSize; i++)
	{    	
		circleDiv[i] = document.getElementById('circle' + i);
		circleDiv[i].style.display = 'none';
		$("#circle"+i).draggable({
			containment: "#imgFrame",
			drag: moveCircle,
			stop: function (event, ui) {
				var circleID = this.id.substr(this.id.length-1);
				paletteCircles[circleID].x = ui.position.left - img.offsetLeft + circleDiv[circleID].offsetWidth/2;
				paletteCircles[circleID].y = ui.position.top - img.offsetTop + circleDiv[circleID].offsetWidth/2;
			}
		});
		// make palette div
		var $palDiv = $("<div/>")
			.attr("id", "palette" + i)
			.addClass("palette")
			.html('<div></div>')
			.hover(function(){ 
				$("#remColor"+this.id.substr(this.id.length-1)).show();
			}, function() { 
				$("#remColor"+this.id.substr(this.id.length-1)).hide();
			});
		$("#paletteUI").before($palDiv);
		paletteDiv[i] = $palDiv;
		paletteDiv[i].hide();
		
		//make buffer div
		var $bufDiv = $("<div/>")
			.attr("id", "buffer" + i)
			.addClass("buffer")
			.html('<div></div>');
		$("#paletteUI").before($bufDiv);
		bufferDiv[i] = $bufDiv;
		bufferDiv[i].hide();
		// make remove color button
		var $colorDiv = $("<div/>")
			.attr("id", "remColor"+i)
			.addClass("button grey newcolor")
			.html('<div><img src="/blog/wp-includes/images/minus.png"></div>');
		$("#palette" + i).append($colorDiv);
		$("#remColor" + i).on("click", remColor);
		$("#remColor" + i).hide();
		
	}
	// create a reset button div and hide it
	var $newDiv = $("<div/>")   // creates a div element
					 .attr("id", "resetButton")
					 .addClass("button orange newcolor")   // add a class
					 .html('<div><img src="/blog/wp-includes/images/reset.png"></div>');
	$("#paletteUI").append("<br><br>");
	$("#paletteUI").append($newDiv);
	$("#resetButton").on("click", resetPalette);
	$("#resetButton").hide();
}

function remColor() {
	// figure out which button we're pressing
	var colorID = +this.id.substr(this.id.length-1); // note this won't work if we ever allow more than 10 color palettes
	
	// remove that color from the palette
	if (paletteSize > 1)
	{
		palette.splice(colorID,1);
		// move everything up one in paletteCircles
		for (i=colorID; i<(paletteCircles.length-1); i++)
		{
			paletteCircles[i] = clone(paletteCircles[i+1]);
		}
		paletteSize--;
		// redraw the palette and circles
		reDraw();
	}
}

function resetPalette() {
	// Change to default number of colors
	paletteSize = defaultPaletteSize;
	// Reset palette colors to initial colors
	// using slice because it returns a copy of the array
	palette = clone(initialPalette);
	//paletteDiv = clone(initialPaletteDiv);
	paletteCircles = clone(initialCircles);
	// Reset position of circles
	reDraw();
}

function createImage() {
	// draw the palette into the canvas
	for (i=0; i<paletteSize; i++)
	{
		ctx.fillStyle = paletteDiv[i].css("backgroundColor");
		var rx = i * (paletteDiv[i].width() + bufferDiv[i].width());
		var ry = uiFrame.height - paletteDiv[i].height();
		var rw = paletteDiv[i].width();
		var rh = paletteDiv[i].height();
		ctx.fillRect(rx, ry, rw, rh);
	}
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
	var data = uiFrame.toDataURL('image/png');

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

function saveImage() {
	createImage();
	window.location = uiFrame.toDataURL('image/png');
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
	var paletteColorIdx = circleID; // paletteCircles[circleID].palette;
	palette[paletteColorIdx].r = imgData.data[pixelNum];
	palette[paletteColorIdx].g = imgData.data[pixelNum+1];
	palette[paletteColorIdx].b = imgData.data[pixelNum+2];
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
//        var paletteColorIdx = paletteCircles[i].palette;
		circleDiv[i].style.display = 'inline';
		circleDiv[i].style.left = (imgFrame.offsetLeft + paletteCircles[i].x - circleDiv[i].offsetWidth/2) + "px";
		circleDiv[i].style.top = (imgFrame.offsetTop + paletteCircles[i].y - circleDiv[i].offsetHeight/2) + "px";
		circleDiv[i].style.backgroundColor = "rgb(" + palette[i].r + "," + palette[i].g + ","  + palette[i].b + ")";
	}

	for (; i<maxPaletteSize; i++)
	{
		circleDiv[i].style.display = 'none';
	}
}

function drawPalette() {
	var colorWidth = Math.round(((uiFrame.width) - (paletteSpacing*(paletteSize -1)))/paletteSize);

	// update colors in the divs
	for (i=0; i<paletteSize; i++)
	{
		paletteDiv[i].show();
		bufferDiv[i].show();
		paletteDiv[i].css("width", colorWidth + "px");
		paletteDiv[i].css("backgroundColor", "rgb(" + palette[i].r + "," + palette[i].g + "," + palette[i].b + ")");
		bufferDiv[i].css("width", paletteSpacing + "px");
	}

	for (;i<maxPaletteSize; i++)
	{
		paletteDiv[i].hide();
		bufferDiv[i].hide();
//        paletteDiv[i].css("width", "0px");
 //       bufferDiv[i].css("width", "0px");
	}

	// if we have less than the maximum allowed images, show the new palette color icon
	if (paletteSize < maxPaletteSize && paletteSize < palette.length)
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
	  var imgPalette;
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
				// we add the height of the palette here because when we save the image, we draw the palette into this canvas
				// resizing it later causes it to clear the canvas which means we would have to redraw the image as well
				uiFrame.height = img.height + paletteSpacing + paletteDiv[0].height();
				ctx.drawImage(img, 0, 0, img.width, img.height);
				img.style.cssText = 'height:' + img.height + "px !important;" + 'width:' + img.width + "px !important;";

				imgFrame.style.width = img.width + "px";
				imgFrame.style.height = img.height + paletteSpacing + "px";
				imgFrame.appendChild(img);

				// Get list of colors in the image (colorutils)
				palette = get_colors(img, ctx);
				// get a copy of the palette in case we need to reset
				initialPalette = clone(palette);

				// Draw circles around each of the colors in the palette
				// loop through the pixels in the image
				imgData = ctx.getImageData(0, 0, img.width, img.height);

				maxPaletteSize = Math.min(8, palette.length);
				paletteSize = Math.min (paletteSize, palette.length);
				var colorDists = [null, null, null, null, null, null, null, null];
				paletteCircles = [];
				for (var pxl = 0; pxl < imgData.data.length; pxl += 4) {
					 var img_rVal = imgData.data[pxl];
					 var img_gVal = imgData.data[pxl + 1];
					 var img_bVal = imgData.data[pxl + 2];

					 // only looking at the first few palette colors
					 for (i = 0; i < maxPaletteSize; i++) {
						var palette_rVal = palette[i].r;
						var palette_gVal = palette[i].g;
						var palette_bVal = palette[i].b;

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
				// make a copy of the paletteCircles in case we need to reset
				initialCircles = clone(paletteCircles);

				// draw the circles and palette
				drawCircles();
				drawPalette();
			};
		
		  // move the load image button down below the picture
		  $("#loadImage").css({"position": "static"});
		  $("#shareImage").show();
		  $("#saveImage").show();
		  
		  // show the reset button
		  $("#resetButton").show();

		  
		  
		}; 
	  })(imageFile);

	  // Read in the image file as a data URL.
	  reader.readAsDataURL(imageFile);
	  
}

// Utilities
function clone(src) {
	function mixin(dest, source, copyFunc) {
		var name, s, i, empty = {};
		for(name in source){
			// the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
			// inherited from Object.prototype.	 For example, if dest has a custom toString() method,
			// don't overwrite it with the toString() method that source inherited from Object.prototype
			s = source[name];
			if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
				dest[name] = copyFunc ? copyFunc(s) : s;
			}
		}
		return dest;
	}

	if(!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]"){
		// null, undefined, any non-object, or function
		return src;	// anything
	}
	if(src.nodeType && "cloneNode" in src){
		// DOM Node
		return src.cloneNode(true); // Node
	}
	if(src instanceof Date){
		// Date
		return new Date(src.getTime());	// Date
	}
	if(src instanceof RegExp){
		// RegExp
		return new RegExp(src);   // RegExp
	}
	var r, i, l;
	if(src instanceof Array){
		// array
		r = [];
		for(i = 0, l = src.length; i < l; ++i){
			if(i in src){
				r.push(clone(src[i]));
			}
		}
		// we don't clone functions for performance reasons
		//		}else if(d.isFunction(src)){
		//			// function
		//			r = function(){ return src.apply(this, arguments); };
	}else{
		// generic objects
		r = src.constructor ? new src.constructor() : {};
	}
	return mixin(r, src, clone);

}
