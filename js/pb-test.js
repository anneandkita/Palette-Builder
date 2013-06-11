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
var initialPaletteSize = 0;
var paletteSize;
var maxPaletteSize = 10;
var imgData;
var totalOffset = {x: 0, y: 0};
var newIconShown = false;
var newWindow;
var initialHeight;
var initialWidth;
var i;
var paletteSpacing = 5;
var filename;

function startApp() {
	// set up for the load image button
	$("#loadImage").click(buttonClicked);
	$("#loadImage").attr("title", "Load new image");
	document.getElementById('imageUploadBrowse').addEventListener('change', loadImage, false);
	
	// setup for the share button
	var shareButton = $("#shareImage");
	shareButton.mousedown(shareImage);
	shareButton.attr("title", "Share your palette to Flickr");
	// hide until an image is loaded
	shareButton.hide();

	// setup for the feedback button
	$("#feedback").mousedown(feedback);
	$("#feedback").attr("title", "Send us feedback about Palette Builder");
	// hide until an image is loaded
	$("#feedback").hide();
	
	// setup for the save button
	var saveButton = $("#saveImage");
	saveButton.mousedown(saveImage);
	saveButton.attr("title", "Save your palette to your computer");
	// hide until an image is loaded
	saveButton.hide();

	// setup for the new palette color button
	newColorIcon = $("#newColor");
	newColorIcon.mousedown(addColor);
	newColorIcon.attr("title", "Add another color to the palette");
	// hide until an image is loaded
	newColorIcon.hide();

	// setup for the image and palette area that the user will interact with
	uiFrame = document.getElementById('UIframe');
	initialHeight = uiFrame.height;
	initialWidth = uiFrame.width;
	ctx = uiFrame.getContext('2d');

	for (i=0; i<maxPaletteSize; i++)
	{   
		// load all the information for each circle element
		var $cirDiv = $("<div/>")
			.attr("id", "circle" + i)
			.addClass("circle")
			.html('<div></div>')
			.draggable({
				containment: "#imgFrame",
				drag: moveCircle,
				stop: function (event, ui) {
					var circleID = this.id.substr(this.id.length-1);
					paletteCircles[circleID].x = ui.position.left - img.offsetLeft + circleDiv[circleID].width()/2;
					paletteCircles[circleID].y = ui.position.top - img.offsetTop + circleDiv[circleID].width()/2;
				}
			});
		// add the palette circle elements to the paletteCircles div
		$("#paletteCircles").append($cirDiv);
		circleDiv[i] = $cirDiv;
		// hide until the an image is loaded
		circleDiv[i].hide();
		
		// add information for each palette square
		var $palDiv = $("<div/>")
			.attr("id", "palette" + i)
			.addClass("palette")
			.html('<div></div>')
			// asssociate remove color button for each palette square
			.hover(function(){ 
				$("#remColor"+this.id.substr(this.id.length-1)).show();
			}, function() { 
				$("#remColor"+this.id.substr(this.id.length-1)).hide();
			});
		// add the palette square to the paletteUI div
		$("#paletteUI").before($palDiv);
		paletteDiv[i] = $palDiv;
		// hide until an image is loaded
		paletteDiv[i].hide();
		
		//make buffer div (whitespace between the palette squares)
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
			.attr("title", "Remove this color from palette")
			.addClass("button grey newcolor")
			.html('<div><img src="/blog/wp-includes/images/minus.png"></div>');
		$("#palette" + i).append($colorDiv);
		$("#remColor" + i).mousedown(remColor);
		$("#remColor" + i).hide();
		
	} // end for each color loop
	
	// create a reset button div and hide it
	var $newDiv = $("<div/>")   // creates a div element
					 .attr("id", "resetButton")
					 .attr("title", "Reset the palette")
					 .addClass("button orange newcolor")   // add a class
					 .html('<div><img src="/blog/wp-includes/images/reset.png"></div>');
	$("#paletteUI").append("<br><br>");
	$("#paletteUI").append($newDiv);
	$("#resetButton").mousedown(resetPalette);
	$("#resetButton").hide();
	
	// create div and load information for color matching area
	$newDiv = $("<div/>")
				.attr("id", "colorMatch")
				.addClass("colormatch")
				.html('<div></div>');
	$("#pblogo").append($newDiv);
	$("#colorMatch").hide();
	 	
	// create the flickr share dialog box for popping up when the user clicks the share button
	$newDiv = $("<div/>")
					.attr("id", "flickrShare")
					.html('<div align=center><canvas id="flickrImg" width=300 height=250></canvas><br><br><form id="flickrForm"><label for="title">Title</label><input class="dialogbox" type="text" id="title" name="title" value="My palette"><br><label for="description">Description</label><textarea id="description" class="dialogbox" rows="3" name="description">Created with Play Crafts Palette Builder. http://www.play-crafts.com/</textarea></form></div>');
	$("#paletteUI").append($newDiv);
	$("#flickrShare").dialog({ width: 600, resizable: false, modal: true, position: 'center', closeText: 'x', title: 'Share to flickr', autoOpen: false,
	         buttons: { "Cancel": function() { $(this).dialog("close"); }, "Share": flickrShare } 
	         });
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
	paletteSize = initialPaletteSize;
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
	ctx.fillStyle = "white";
	ctx.fillRect(0, uiFrame.height - paletteDiv[0].height() - paletteSpacing, uiFrame.width, paletteDiv[0].height()+paletteSpacing);
	
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
	var width = 500;
	var height = 400;
	var left = (screen.width/2)-(width/2);
	var top = (screen.height/2)-(height/2);
	newWindow = window.open(url, 'popup', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width='+width+', height='+height+', top='+top+', left='+left);
	newWindow.onbeforeunload = function () {
		// if the popup is closed, we should close our dialog as well
		$('#flickrShare').dialog("close");
	}
	if (window.focus) {newWindow.focus()}
	return false;
}

function shareImage() {
	//Flickr API stuff goes here
	// Open pop-up immediately to minimize chances of pop-up blocker throwing a fit
	$('#flickrShare').dialog("open");
	
	//popup(url);
	createImage();
	var flickrCtx = document.getElementById("flickrImg").getContext('2d');
	flickrCtx.clearRect(0, 0, $('#flickrImg').width(), $('#flickrImg').height());
	
	var widthScale = $('#flickrImg').width() / uiFrame.width;
	var heightScale = $('#flickrImg').height() / uiFrame.height;
	var flickrScale = 1;
	
	// if the scale factor is less than 1 for either width or height, the image is bigger than the area it's going
	// to be drawn to
	if (widthScale < 1 || heightScale < 1) {
		// Take the smallest number and scale the image by that, guaranteeing that both the width and height will
		// fit in the area it's going to be drawn to, and the proportions will be constrained
		flickrScale = Math.min(widthScale, heightScale);
	}
	else {
		flickrScale = 1;
	}
	
	flickrCtx.fillStyle="white";
	flickrCtx.fillRect(0,0,flickrScale * uiFrame.width, flickrScale * uiFrame.height);
	flickrCtx.drawImage(uiFrame, 0, 0, flickrScale * uiFrame.width, flickrScale * uiFrame.height);
}

function flickrShare() {
	var data = uiFrame.toDataURL('image/png');
	var url = 'http://ec2-54-244-186-162.us-west-2.compute.amazonaws.com/upload.php';
	
	popup('about:blank');
	var form = document.createElement("form");
	form.setAttribute("method", "post");
	form.setAttribute("action", url);
	form.setAttribute("target", "popup");

	var hiddenField = document.createElement("input");
	hiddenField.setAttribute("type", "hidden");
	hiddenField.setAttribute("name", "base64data");
	hiddenField.setAttribute("value", data);

	form.appendChild(hiddenField);

	hiddenField = document.createElement("input");
	hiddenField.setAttribute("type", "hidden");
	hiddenField.setAttribute("name", "title");
	hiddenField.setAttribute("value", $("#title").val());
	
	form.appendChild(hiddenField);
	
	hiddenField = document.createElement("input");
	hiddenField.setAttribute("type", "hidden");
	hiddenField.setAttribute("name", "description");
	hiddenField.setAttribute("value", $("#description").val());
	
	form.appendChild(hiddenField);
	
	document.body.appendChild(form);
	form.submit();
	
	   // popup(url+"?base64data="+data);
/*        $.ajax({
			type: "POST",
			url: url,
			dataType: 'text',
			data: {
				auth : "false",
				title : $("input#title").val(),
				description: $("textarea#description").val(),
				base64data : data
			},
			success: function (result) {
//				if (result > -1)
			    	$('#flickrForm').html("Your palette was successfully shared to Flickr!"); 
			    else {
			    	// need to authenticate
			    	$('#flickrForm').html("You need to authenticate or login with Flickr.");
			    	// doing a form because just putting everything on the URL creates a URL that is too long. yay.
			    	// can't use AJAX because we need the user to do some stuff over on flickr
			    	// there has got to be a better way to do this, but I don't know what it is
					var form = document.createElement("form");
					form.setAttribute("method", "post");
					form.setAttribute("action", url);
					form.setAttribute("target", "popup");
				
					var hiddenField = document.createElement("input");
					hiddenField.setAttribute("type", "hidden");
					hiddenField.setAttribute("name", "base64data");
					hiddenField.setAttribute("value", data);
				
					form.appendChild(hiddenField);
				
					hiddenField = document.createElement("input");
					hiddenField.setAttribute("type", "hidden");
					hiddenField.setAttribute("name", "title");
					hiddenField.setAttribute("value", $("#title").val());
					
					form.appendChild(hiddenField);
					
					hiddenField = document.createElement("textarea");
					hiddenField.setAttribute("type", "hidden");
					hiddenField.setAttribute("name", "description");
					hiddenField.setAttribute("value", $("#description").val());
					
					form.appendChild(hiddenField);
					
					hiddenField = document.createElement("input");
					hiddenField.setAttribute("type", "hidden");
					hiddenField.setAttribute("name", "auth");
					hiddenField.setAttribute("value", "true");
					
					form.appendChild(hiddenField);
				
					document.body.appendChild(form);
			    	form.submit();
			    } 
			    
			} 
		}); */
}

function feedback() {
	var feedbackWindow = window.open("http://www.play-crafts.com/blog/palette-builder-v2-0-feedback/");
	if (window.focus) {feedbackWindow.focus();}
}

function saveImage() {
	createImage();
	
	var data = uiFrame.toDataURL('image/png');
	var url = 'http://ec2-54-244-186-162.us-west-2.compute.amazonaws.com/savefile.php';
	
//	window.location = uiFrame.toDataURL('image/png');
	// Create iFrame
	var iframe = document.createElement('iframe');
	iframe.style.display = "none";
	document.body.appendChild(iframe);
	
	// Get the iframe's document
	var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
	
	// Make a form
	var form = document.createElement('form');
	form.action = url; 
	form.method = 'POST';
	
	// Add form element, to post your value
	var input = document.createElement('input');
	input.type = 'hidden';
	input.name = 'base64data';
	input.value = data;  
	
	// Add input to form
	form.appendChild(input);
	
	input = document.createElement('input');
	input.type = 'hidden';
	input.name = 'filename';
	input.value = filename + '-palette';
	
	form.appendChild(input);
	
	// Add form to iFrame
	// IE doesn't have the "body" property
	(iframeDoc.body || iframeDoc).appendChild(form);
	
	// Post the form :-)
	form.submit();
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

	// can't have palettes bigger than 8, and can't add colors past the length of the master palette
	if (paletteSize >= maxPaletteSize || paletteSize >= palette.length)
	{
		newColorIcon.hide();
	}
	
	// figure out location for new circle
	var newCircleID = paletteSize-1;
	var colorDist = null;
	
	for (var pxl = 0; pxl < imgData.data.length; pxl += 4) {
		var img_rVal = imgData.data[pxl];
		var img_gVal = imgData.data[pxl + 1];
		var img_bVal = imgData.data[pxl + 2];

		var palette_rVal = palette[newCircleID].r;
		var palette_gVal = palette[newCircleID].g;
		var palette_bVal = palette[newCircleID].b;

			var distance = Math.sqrt(Math.pow(palette_rVal - img_rVal, 2) +
			   Math.pow(palette_gVal - img_gVal, 2) +
			   Math.pow(palette_bVal - img_bVal, 2));

			if (!colorDist || distance < colorDist) {
				// if this is a better match, update the palette circle
				//ctx.rect((pxl/4)%uiFrame.width, (pxl/4)/uiFrame.width, 5, 5);
				var x = (pxl / 4) % img.width; //(imgScale*img.width);
				var y = (pxl / 4) / img.width; //(imgScale*img.width);
				paletteCircles[newCircleID] = {x:x, y:y};
				colorDist = distance;                    
			}
	 	}
	
	
	reDraw();
}

// move the circle to where the mouse on mousemove
function moveCircle(event, ui) {
	// find current x,y of div
	var circleID = this.id.substr(this.id.length-1);
	var circleX = Math.round(ui.position.left - img.offsetLeft + circleDiv[circleID].width()/2);
	var circleY = Math.round(ui.position.top - img.offsetTop + circleDiv[circleID].width()/2);

	// figure out what color pixel the circle is over
	var pixelNum = (circleY * img.width + circleX) * 4;
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

// take care of drawing what fabrics or hex values the colors match to
// this should be done on mouseUp for color changes since database calls are a bit too long to do real time
// TODO test that this claim is true
function drawColorMatch() {
	// for each color
	for (var i=0; i<paletteSize; i++)
	{
		var paletteL = palette[i].CIEL;
		// convert to 0-255
		var palettea = palette[i].CIEa + 127;
		// convert to 0-255
		var paletteb = palette[i].CIEb + 127;
		var closestMatch;
		var smallestDistance = 9999999;
		
		// find the closest reference color
		for (var CIEL = 0; CIEL <= 100; CIEL += 12)
		{
			for (var CIEa = 0; CIEa <= 255; CIEa += 31)
			{
				for (var CIEb = 0; CIEb <= 255; CIEb += 31)
				{
					var distance = Math.sqrt(Math.pow((CIEL-paletteL), 2) + Math.pow((CIEa-palettea), 2) + Math.pow((CIEb - paletteb), 2));
					if (distance < smallestDistance)
					{
						smallestDistance = distance;
						closestMatch = CIEL.toString() + CIEa.toString() + CIEb.toString();
					}
				}
			}
		}
		// find closest matching solid fabric
		$.ajax({
		  url: 'http://ec2-54-244-186-162.us-west-2.compute.amazonaws.com/getClosestFabric.php',
		  type: 'GET',
		  data: {
		  	refColor: closestMatch
		  },
		  
		  complete: function(xhr, status) {
			  if (status === 'error' || !xhr.responseText) {
			       alert("error: " + xhr.responseText);
			  }
			  else {
			  	var data = jQuery.parseJSON(xhr.responseText);
			  	for (var i=0 ; i < data.length; i+=2)
			  	{
			  		//add the image and the name
			  		if (i > 1)
			  		{
			  			$("#colorMatch").append(" or ");
			  		}
			  		$("#colorMatch").append("<img style='width:50px !important' src=\"" + data[i] + "\"> " + data[i+1]);
			    }
				$("#colorMatch").append("<BR>");
			  }
		  } 
		});
	
		// draw fabric swatch
		// write name of fabric
	}
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
		circleDiv[i].show();
		circleDiv[i].css("left", (imgFrame.offsetLeft + paletteCircles[i].x - circleDiv[i].width()/2) + "px");
		circleDiv[i].css("top", (imgFrame.offsetTop + paletteCircles[i].y - circleDiv[i].height()/2) + "px");
		circleDiv[i].css("backgroundColor", "rgb(" + palette[i].r + "," + palette[i].g + ","  + palette[i].b + ")");
	}

	for (; i<maxPaletteSize; i++)
	{
		circleDiv[i].hide();
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
	  	var input = imageFile.name;
	  	//strip the ending off the filename
	  	filename = input.substr(0, input.lastIndexOf('.')) || input;
	  	$("#title").val(filename + " palette");
	  		  	
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
				ctx.fillStyle="ffffff";
				ctx.fillRect(0,0,uiFrame.width, uiFrame.height);
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
				initialPaletteSize = Math.min(palette.length, defaultPaletteSize);

				// Draw circles around each of the colors in the palette
				// loop through the pixels in the image
				imgData = ctx.getImageData(0, 0, img.width, img.height);

				paletteSize = Math.min (paletteSize, palette.length);
				var colorDists = [null, null, null, null, null, null, null, null];
				paletteCircles = [];
				for (var pxl = 0; pxl < imgData.data.length; pxl += 4) {
					 var img_rVal = imgData.data[pxl];
					 var img_gVal = imgData.data[pxl + 1];
					 var img_bVal = imgData.data[pxl + 2];

					 // only looking at the first few palette colors
					 for (i = 0; i < paletteSize; i++) {
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
							paletteCircles[i] = {x:x, y:y};
							colorDists[i] = distance;                    
						}
				 	}
				 }
				// make a copy of the paletteCircles in case we need to reset
				initialCircles = clone(paletteCircles);

				// draw the circles and palette
				drawCircles();
				drawPalette();

			  // move the load image button down below the picture
			  $("#loadImage").css({"position": "static"});
			  
			  // show all the stuff that's been hidden
			  $("#shareImage").show();
			  $("#saveImage").show();
			  $("#feedback").show();
			  $("#colorMatch").show();
			  $("#resetButton").show();
	
			  // change where colorMatch div is drawn based on size of image canvas
			  $("#colorMatch").css({
			  		'top': imgFrame.offsetTop + "px",
			  		'width': '300px',
			  		'left': imgFrame.offsetLeft + imgFrame.offsetWidth + 20 + "px",
			  		'height': uiFrame.height + "px"
			  });
			  $("#colorMatch").html("");
			  drawColorMatch();		  
			}; 
			
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
