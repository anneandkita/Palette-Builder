// Palette Builder v2.0
// Copyright 2012-2013 Play Crafts, Inc.

$(document).ready(startApp);
var palette = [];
var initialPalette = [];
var paletteDiv = [];
var initialPaletteDiv = [];
var bufferDiv = [];
var circleDiv = [];
var matchDiv = [];
var paletteCircles = [];
var initialCircles = [];
var newColorIcon;
var ctx, ctxMatch, imgScale;
var img, uiFrame, imgFrame, uiFrameMatch;
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
var matching = "moda";
var saveMatching = true;
// height/width of hex value div
var hexDivSize = 40;
// this is a hack to get around tainted canvases by just drawing the color instead of using the kona image
// this is a bad hack. And is going to suck later when we're not using solids. Hopefully IE will be 
// compliant by then.
var kona = []; 

// I'm creating a lot of the elements on the fly here because it's easier than updating the Wordpress host that the app is buried inside. Wordpress likes to lose ids and stuff if you accidently load the post in Visual style instead of Text style.
function startApp() {
	// set up for the load image button
	$("#loadImage").click(buttonClicked);
	$("#loadImage").attr("title", "Load new image");
	document.getElementById('imageUploadBrowse').addEventListener('change', loadImage, false);
	
	// setup for the share button
/*	var shareButton = $("#shareImage");
	shareButton.mousedown(shareImage);
	shareButton.attr("title", "Share your palette to Flickr");
	// hide until an image is loaded
	shareButton.hide(); */

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

	uiFrameMatch = document.getElementById('UIframeMatch');
	ctxMatch = uiFrameMatch.getContext('2d');

	for (i=0; i<maxPaletteSize; i++)
	{    
		// load all the information for each circle element
		var $cirDiv = $("<div/>")
			.attr("id", "circle" + i)
			.addClass("circle")
			.html('<div></div>')
			.hover(addCircleHoverEffects, removeCircleHoverEffects)
			.draggable({
				containment: "#imgFrame",
				drag: moveCircle,
				stop: function (event, ui) {
					var circleID = this.id.substr(this.id.length-1);
					paletteCircles[circleID].x = ui.position.left - img.offsetLeft + circleDiv[circleID].width()/2;
					paletteCircles[circleID].y = ui.position.top - img.offsetTop + circleDiv[circleID].width()/2;
					drawColorMatch(circleID);
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
			.hover(addPaletteHoverEffects, removePaletteHoverEffects);
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
		
		// create divs inside the color matching area to hold the color info
		var $matchDiv = $("<div/>")
			.attr("id", "matchColor"+i)
			.addClass("match");
		$("#colorMatch").append($matchDiv);
		matchDiv[i] = $matchDiv;
		matchDiv[i].hide();
		
	} // end for each color loop
	$("#colorMatch").css({'width': '250px'});
	
	$("#colorMatch").hide();
	
	$("#resetButton").attr("title", "Reset the palette");	
	$("#resetButton").mousedown(resetPalette);
	$("#resetButton").hide();	
	 	
	// create the flickr share dialog box for popping up when the user clicks the share button
	$newDiv = $("<div/>")
					.attr("id", "flickrShare")
					.html('<div align=center><canvas id="flickrImg" width=300 height=250></canvas><br><br><form id="flickrForm"><label for="title">Title</label><input class="dialogbox" type="text" id="title" name="title" value="My palette"><br><label for="description">Description</label><textarea id="description" class="dialogbox" rows="3" name="description">Created with Play Crafts Palette Builder. http://www.play-crafts.com/blog/palettebuilder2/</textarea></form></div>');
	$("#paletteUI").append($newDiv);
	$("#flickrShare").dialog({ width: 600, resizable: false, modal: true, position: 'center', stack: false, 'z-index':120, closeText: 'x', title: 'Share to flickr', autoOpen: false,
	         buttons: { "Cancel": function() { $(this).dialog("close"); }, "Share": flickrShare } 
	         });
	         
	//dropdown stuff
	$(".matchwhat").click(function()
	{
		$(this).css('box-shadow', "none");
		var X=$(this).attr('id');
		if(X==1)
		{
			$(".submenu").hide();
			$(this).attr('id', '0'); 
		}
		else
		{
			$(".submenu").show();
			$(this).attr('id', '1');
		}
	
	});
	
	//Mouse click on sub menu
	$(".submenu").mouseup(function(){
		$(this).css({ boxShadow: '0 1px 4px rgba(0, 0, 0, 0.45)' });
		$(".submenu").hide();
		$(".matchwhat").attr('id', '');
	});
	$('#root li').click(function(){
		matching = $(this).attr('id');
		$.cookie('matchwhat', matching, { expires: 365 });
		if (matching === "hex")
			$('.matchwhat').text("Match: Hex Values");
		else if (matching === "both")
			$('.matchwhat').text("Match: All Solids");
		else if (matching === "kona")
			$('.matchwhat').text("Match: Kona Cottons");
		else if (matching === "moda")
			$('.matchwhat').text("Match: Moda Bella Solids");
		else {
			$('.matchwhat').text("Match: Aurifil Threads");
		}
		drawColorMatch();
	});
	
	matching = $.cookie('matchwhat');
	if (matching == undefined)
		matching = "moda";
		
	if (matching === "hex")
		$('.matchwhat').text("Match: Hex Values");
	else if (matching === "both")
		$('.matchwhat').text("Match: All Solids");	
	else if (matching === "kona")
		$('.matchwhat').text("Match: Kona Cottons");
	else if (matching === "moda")
		$('.matchwhat').text("Match: Moda Bella Solids");
	else {
		$('.matchwhat').text("Match: Aurifil Threads");
	}

	//Mouse click on Match link
	$(".matchwhat").mouseup(function(){
		$(this).css({ boxShadow: '0 1px 4px rgba(0, 0, 0, 0.45)'});
		$(".submenu").hide();
		$(".matchwhat").attr('id', '');
	});
	
	
	//Document Click
	$(document).mouseup(function(){
		$(this).css({ boxShadow: '0 1px 4px rgba(0, 0, 0, 0.45)'});
		$(".submenu").hide();
		$(".matchwhat").attr('id', '');
	});
	
	// save whether info with palette is checked or not
	$('#SaveMatch').click(function() {
		saveMatching = $(this).is(':checked');
		$.cookie('saveMatching', saveMatching, { expires: 365 });
	});
	
	saveMatching = ($.cookie('saveMatching') == 'true');
	if (saveMatching === undefined)
		saveMatching = true;
		
	$('#SaveMatch').prop('checked', saveMatching);
}

function addCircleHoverEffects() {
	var paletteNum = $(this).attr('id').substr($(this).attr('id').length-1);
	$(this).addClass("Hover");
	$("#palette"+paletteNum).addClass("Hover");
	$("#palette"+paletteNum).css("border-color", $("#palette"+paletteNum).css("backgroundColor"));
	
	// account for circle biggerness
	$(this).css("top", $(this).position().top - 2 + "px");
	$(this).css("left", $(this).position().left - 2 + "px");
	
}

function addPaletteHoverEffects() {
	var paletteNum = $(this).attr('id').substr($(this).attr('id').length-1);
	$(this).addClass("Hover");
	$(this).css("border-color", $(this).css("backgroundColor"));
	$("#remColor"+paletteNum).show();
	$("#circle"+paletteNum).addClass("Hover");
	
	// account for circle biggerness
	$("#circle"+paletteNum).css("top", $("#circle"+paletteNum).position().top - 2 + "px");
	$("#circle"+paletteNum).css("left", $("#circle"+paletteNum).position().left - 2 + "px");
	
	// account for palette biggerness
	$(this).css("top", $(this).position().top - 1 + "px");
	$(this).css("left", $(this).position().left - 1 + "px");
	
}

function removePaletteHoverEffects() {
	var paletteNum = $(this).attr('id').substr($(this).attr('id').length-1);
	$(this).removeClass("Hover");
	$("#remColor"+paletteNum).hide();
	$("#circle"+paletteNum).removeClass("Hover");
	
	// account for circle biggerness
	$("#circle"+paletteNum).css("top", $("#circle"+paletteNum).position().top + 2 + "px");
	$("#circle"+paletteNum).css("left", $("#circle"+paletteNum).position().left + 2 + "px");
		
}

function removeCircleHoverEffects() {
	$(this).removeClass("Hover");
	$("#palette"+this.id.substr(this.id.length-1)).removeClass("Hover");
	
	// account for circle biggerness
	$(this).css("top", $(this).position().top + 2 + "px");
	$(this).css("left", $(this).position().left + 2 + "px");
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
	
	var curctx = ctx;
	var curFrame = uiFrame;
	
	// if we need to save the matching info, draw the elements
	if (saveMatching)
	{
		curctx = ctxMatch;
		curFrame = uiFrameMatch;
	}
	
	// palette needs to be drawn first so that it doesn't cover the bottom part of the matching area with a white box
	
	// draw the palette into the canvas
	// clear palette area
	curctx.fillStyle = "white";
	curctx.fillRect(0, curFrame.height - paletteDiv[0].height() - paletteSpacing, curFrame.width, paletteDiv[0].height()+paletteSpacing);

	for (i=0; i<paletteSize; i++)
	{
		curctx.fillStyle = paletteDiv[i].css("backgroundColor");
		var rx = i * (paletteDiv[i].width() + bufferDiv[i].width());
		var ry = curFrame.height - paletteDiv[i].height();
		var rw = paletteDiv[i].width();
		var rh = paletteDiv[i].height();
		curctx.fillRect(rx, ry, rw, rh);
	}

	if (saveMatching)
	{
		// draw color match information
		// draw white background in color match area
		curctx.fillStyle = "white";
		curctx.fillRect(img.width, 0, $('#colorMatch').width() + paletteSpacing, curFrame.height);

		for (i=0; i<paletteSize; i++)
		{
			var fontHeight = 20;
			var rx = img.width + paletteSpacing;
			var ry = i * (hexDivSize + paletteSpacing) + fontHeight + paletteSpacing;
			var rw = hexDivSize;
			var rh = hexDivSize;
	
			// write what thing we've matched to
			curctx.fillStyle="#000000";
			curctx.font="10pt Calibri, arial, helvetica, sans-serif";
			curctx.fillText($('.matchwhat').text(), rx, fontHeight-paletteSpacing);
	
			// if it's a hex value, we need to draw the color in a box
			if (matching === "hex") {
				curctx.fillStyle = $("#hex"+i).css("backgroundColor");
				curctx.fillRect(rx, ry, rw, rh);			
			}
			else if (matching === "aurifil") {
				curctx.fillStyle = $("#hex"+i).css("backgroundColor");
				curctx.fillRect(rx, ry, rw, rh);
			}
			// otherwise we need to draw the image in that div
			else {
				// this is a hack to get around tainted canvases by just drawing the color instead of using the kona image
				// this is a bad hack. And is going to suck later when we're not using solids. Hopefully IE will be 
				// compliant by then.
				// 0-pad if necessary
				var hexred = ("00" + parseInt(kona[i]["red"]).toString(16)).substr(-2);
				var hexgreen = ("00" + parseInt(kona[i]["green"]).toString(16)).substr(-2);
				var hexblue = ("00" + parseInt(kona[i]["blue"]).toString(16)).substr(-2);
				curctx.fillStyle = "#" + hexred + hexgreen + hexblue;
				curctx.fillRect(rx, ry, rw, rh);
				//ctx.drawImage($("#matched"+i).get(0), rx, ry, hexDivSize, hexDivSize);
			}
			// draw text for each element
			var labelx = rx + rw + paletteSpacing;
			var labely = ry + hexDivSize/2; // to center text
			// regular expression crap to get just the label, label is everything after the image tag if there is one
			curctx.fillStyle = "#000000";
			var label = $("#matchColor"+i).text();
			curctx.fillText(label, labelx, labely);
			
		}
	} 
}

function popup(url) {
	var width = 500;
	var height = 400;
	var left = (screen.width/2)-(width/2);
	var top = (screen.height/2)-(height/2);
	newWindow = window.open(url, 'popup', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width='+width+', height='+height+', top='+top+', left='+left);
	newWindow.onload = function () {
		makeForm();
	}
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
	
	createImage();
	var flickrWidth = uiFrame.width;
	var flickrHeight = uiFrame.height;
	if (saveMatching)
	{
		flickrWidth = uiFrameMatch.width;
		flickrHeight = uiFrameMatch.height;
	}
	var flickrCtx = document.getElementById("flickrImg").getContext('2d');
	flickrCtx.clearRect(0, 0, $('#flickrImg').width(), $('#flickrImg').height());
	
	var widthScale = $('#flickrImg').width() / flickrWidth;
	var heightScale = $('#flickrImg').height() / flickrHeight;
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
	flickrCtx.fillRect(0,0,flickrScale * flickrWidth, flickrScale * uiFrame.height);
	if (saveMatching)
		flickrCtx.drawImage(uiFrameMatch, 0, 0, flickrScale * flickrWidth, flickrScale * uiFrameMatch.height);
	else
		flickrCtx.drawImage(uiFrame, 0, 0, flickrScale * flickrWidth, flickrScale * uiFrame.height);
}

function makeForm() {
	var data;
	if (saveMatching)
		data = uiFrameMatch.toDataURL('image/png');
	else
		data = uiFrame.toDataURL('image/png');
	var url = "http://ec2-54-244-186-162.us-west-2.compute.amazonaws.com/upload.php";

	// add this stuff to the popup window, create iFrame
	var iframe = document.createElement('iframe');
	iframe.style.display = "none";
	newWindow.document.body.appendChild(iframe);
	
	// Get the iframe's document
	var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
	
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
	
	(iframeDoc.body || iframeDoc).appendChild(form);
	form.submit();
	
}


function flickrShare() {
	popup("http://www.play-crafts.com/loading.html");
	
}

function feedback() {
	var feedbackWindow = window.open("http://www.play-crafts.com/blog/palette-builder-v2-0-feedback/");
	if (window.focus) {feedbackWindow.focus();}
}

function saveImage() {
	createImage();
	var data;
	if (saveMatching)
		data = uiFrameMatch.toDataURL('image/png');
	else
		data = uiFrame.toDataURL('image/png');
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
	if (paletteSize >= maxPaletteSize) // || paletteSize >= palette.length)
	{
		newColorIcon.hide();
	}

	if (paletteSize > palette.length)
	{
		// pick random color from image
		var randomPixel = Math.floor(Math.random() * imgData.data.length/4) * 4;
		var r = imgData.data[randomPixel];
		var g = imgData.data[randomPixel+1];
		var b = imgData.data[randomPixel+2];
		
		// add another random color to palette
		palette.push({r: r, g: g, b: b});
		var Lab = rgb2lab(palette[paletteSize-1]);
		palette[paletteSize-1].CIEL = Lab.CIEL;
		palette[paletteSize-1].CIEa = Lab.CIEa;
		palette[paletteSize-1].CIEb = Lab.CIEb;
		
		var x = (randomPixel / 4) % img.width; //(imgScale*img.width);
		var y = (randomPixel / 4) / img.width; //(imgScale*img.width);
		paletteCircles[paletteSize-1] = {x:x, y:y};
		
		reDraw(paletteSize-1);
		return;
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
	
	
	reDraw(paletteSize-1);
}

// move the circle to where the mouse on mousemove
function moveCircle(event, ui) {
	// find current x,y of div
	var circleID = $(this).attr('id').substr($(this).attr('id').length-1);
	var circleX = Math.round(ui.position.left - img.offsetLeft + circleDiv[circleID].width()/2);
	var circleY = Math.round(ui.position.top - img.offsetTop + circleDiv[circleID].width()/2);

	// figure out what color pixel the circle is over
	var pixelNum = (circleY * img.width + circleX) * 4;
	var color = "rgba(" + imgData.data[pixelNum] + "," + imgData.data[pixelNum+1] + "," + imgData.data[pixelNum+2] + ")";
		
	// change div background to the appropriate color
	$(this).css({backgroundColor: color});
	$("#palette"+circleID).css("border-bottom-color", $(this).css("background-color"));
	$("#palette"+circleID).addClass("Hover");
	var paletteColorIdx = circleID; // paletteCircles[circleID].palette;
	palette[paletteColorIdx].r = imgData.data[pixelNum];
	palette[paletteColorIdx].g = imgData.data[pixelNum+1];
	palette[paletteColorIdx].b = imgData.data[pixelNum+2];

	var Lab = rgb2lab(palette[paletteColorIdx]);
	palette[paletteColorIdx].CIEL = Lab.CIEL;
	palette[paletteColorIdx].CIEa = Lab.CIEa;
	palette[paletteColorIdx].CIEb = Lab.CIEb;
	$(paletteDiv[paletteColorIdx]).css({backgroundColor: color});
}

// Redraw the screen to support the movement of the circles
function reDraw(palIndex) {

	// draw the image using the scales we've calculate, or 1 if the image wasn't too big
	//ctx.clearRect(0, 0, uiFrame.width, uiFrame.height);
	//ctx.drawImage(img, 0, 0, imgScale * img.width, imgScale * img.height);

	// draw the circles and palette
	drawCircles();
	drawPalette();
	drawColorMatch(palIndex);
}

// take care of drawing what fabrics or hex values the colors match to
// this should be done on mouseUp for color changes since database calls are a bit too long to do real time
// TODO test that this claim is true
function drawColorMatch(indexColor) {
	var startNum = 0;
	var endNum = paletteSize;
	
	if ((typeof indexColor !== 'undefined'))
	{
		startNum = parseInt(indexColor);
		endNum = startNum+1;
	}
	switch (matching)
	{
		case "hex":
		for (var i=startNum; i<endNum; i++)
		{
			matchDiv[i].show();
			matchDiv[i].html("");
			// draw a square of the color
			// print out hex value
			var rgb = $("#palette"+i).css("backgroundColor");
			matchDiv[i].html("<div id='hex" + i + "' style='float: left; background-color: " + rgb + "; height: " + hexDivSize + "px; width: " + hexDivSize + "px;'>&nbsp;</div>");
			rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			function hex(x) {
			    return ("0" + parseInt(x).toString(16)).slice(-2);
			}
			matchDiv[i].append("&nbsp;&nbsp;#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]));
		}
		break;
		case "aurifil":
		// Anne: This is where you need to debug
		for (var i=startNum; i<endNum; i++)
		{
			(function (i)
			{
				var paletteL = palette[i].CIEL;
				var palettea = palette[i].CIEa;
				var paletteb = palette[i].CIEb;
				
				matchDiv[i].show();
				matchDiv[i].html("");
				// find closest matching solid fabric
				$.ajax({
				  url: 'http://ec2-54-244-186-162.us-west-2.compute.amazonaws.com/getClosestThread.php',
				  type: 'GET',
				  data: {
				  	CIEL: paletteL,
				  	CIEa: palettea,
				  	CIEb: paletteb
				  },
				  
				  complete: function(xhr, status) {
					  if (status === 'error' || !xhr.responseText) {
					       alert("error: " + xhr.responseText);
					  }
					  else {
					  	var data = jQuery.parseJSON(xhr.responseText);
					  	for (var j=0 ; j < data.length; j+=3)
					  	{
					  		var rgb = data[j+2];
					  		//add the image and the name
					  		if (j > 1)
					  		{
					  			matchDiv[i].append(" or ");
					  		}
					  		var hexred = ("00" + parseInt(rgb["red"]).toString(16)).substr(-2);
					  		var hexgreen = ("00" + parseInt(rgb["green"]).toString(16)).substr(-2);
					  		var hexblue = ("00" + parseInt(rgb["blue"]).toString(16)).substr(-2);
								
							matchDiv[i].html("<div id='hex" + i + "' style='float: left; background-color: #" + hexred + hexgreen + hexblue + "; height: " + hexDivSize + "px; width: " + hexDivSize + "px;'>&nbsp;&nbsp;</div>");
							matchDiv[i].append("&nbsp;" + data[j] + " - " + data[j+1]);
					    }
					//	matchDiv[i].append("<BR>");
					  }
				  } 
				});		
			})(i);
		}
		break;
		case "moda":
		// for each color
		for (var i=startNum; i<endNum; i++)
		{
			(function (i)
			{
				var paletteL = palette[i].CIEL;
				var palettea = palette[i].CIEa;
				var paletteb = palette[i].CIEb;
				
				matchDiv[i].show();
				matchDiv[i].html("");
				// find closest matching solid fabric
				$.ajax({
				  url: 'http://ec2-54-244-186-162.us-west-2.compute.amazonaws.com/getClosestModa.php',
				  type: 'GET',
				  data: {
				  	CIEL: paletteL,
				  	CIEa: palettea,
				  	CIEb: paletteb
				  },
				  
				  complete: function(xhr, status) {
					  if (status === 'error' || !xhr.responseText) {
					       alert("error: " + xhr.responseText);
					  }
					  else {
					  	var data = jQuery.parseJSON(xhr.responseText);
					  	for (var j=0 ; j < data.length; j+=3)
					  	{
					  		//add the image and the name
					  		if (j > 1)
					  		{
					  			matchDiv[i].append(" or ");
					  		}
					  		matchDiv[i].append("<img id='matched" + i + "' style='width:40px !important; vertical-align:middle' src=\"" + data[j] + "\">Bella Solids " + data[j+1].replace(/_/g," "));
					  		// this is a hack to get around tainted canvases by just drawing the color instead of using the kona image
					  		// this is a bad hack. And is going to suck later when we're not using solids. Hopefully IE will be 
					  		// compliant by then.
					  		kona[i] = data[j+2];
					  		
					    }
//						matchDiv[i].append("<BR>");
					  }
				  } 
				});		
			})(i);
		}
		
		break;
		case "kona":
		// for each color
		for (var i=startNum; i<endNum; i++)
		{
			(function (i)
			{
				var paletteL = palette[i].CIEL;
				var palettea = palette[i].CIEa;
				var paletteb = palette[i].CIEb;
				
				matchDiv[i].show();
				matchDiv[i].html("");
				// find closest matching solid fabric
				$.ajax({
				  url: 'http://ec2-54-244-186-162.us-west-2.compute.amazonaws.com/getClosestKona.php',
				  type: 'GET',
				  data: {
				  	CIEL: paletteL,
				  	CIEa: palettea,
				  	CIEb: paletteb
				  },
				  
				  complete: function(xhr, status) {
					  if (status === 'error' || !xhr.responseText) {
					       alert("error: " + xhr.responseText);
					  }
					  else {
					  	var data = jQuery.parseJSON(xhr.responseText);
					  	for (var j=0 ; j < data.length; j+=3)
					  	{
					  		//add the image and the name
					  		if (j > 1)
					  		{
					  			matchDiv[i].append(" or ");
					  		}
					  		matchDiv[i].append("<img id='matched" + i + "' style='width:40px !important; vertical-align:middle' src=\"" + data[j] + "\">Kona Cotton " + data[j+1].replace(/_/g," "));
					  		// this is a hack to get around tainted canvases by just drawing the color instead of using the kona image
					  		// this is a bad hack. And is going to suck later when we're not using solids. Hopefully IE will be 
					  		// compliant by then.
					  		kona[i] = data[j+2];
					  		
					    }
						//matchDiv[i].append("<BR>");
					  }
				  } 
				});		
			})(i);
		}
		break;
		case "both":
		// for each color
		for (var i=startNum; i<endNum; i++)
		{
			(function (i)
			{
				var paletteL = palette[i].CIEL;
				var palettea = palette[i].CIEa;
				var paletteb = palette[i].CIEb;
				
				matchDiv[i].show();
				matchDiv[i].html("");
				// find closest matching solid fabric
				$.ajax({
				  url: 'http://ec2-54-244-186-162.us-west-2.compute.amazonaws.com/getClosestFabric.php',
				  type: 'GET',
				  data: {
				  	CIEL: paletteL,
				  	CIEa: palettea,
				  	CIEb: paletteb
				  },
				  
				  complete: function(xhr, status) {
					  if (status === 'error' || !xhr.responseText) {
					       alert("error: " + xhr.responseText);
					  }
					  else {
					  	var data = jQuery.parseJSON(xhr.responseText);
					  	for (var j=0 ; j < data.length; j+=4)
					  	{
					  		//add the image and the name
					  		if (j > 1)
					  		{
					  			matchDiv[i].append(" or ");
					  		}
					  		matchDiv[i].append("<img id='matched" + i + "' style='width:40px !important; vertical-align:middle' src=\"" + data[j] + "\">" + data[j+2] + " " + data[j+1].replace(/_/g," "));
					  		kona[i] = data[j+3];
					  		
					    }
					//	matchDiv[i].append("<BR>");
					  }
				  } 
				});		
			})(i);
		}
		break;
		
	}
	
	for (i=paletteSize; i<maxPaletteSize; i++)
	{
		matchDiv[i].hide();
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
	var colorWidth = Math.round(((img.width) - (paletteSpacing*(paletteSize -1)))/paletteSize);

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

	// if we have less than the maximum allowed colors, show the new color icon
	if (paletteSize < maxPaletteSize) // && paletteSize < palette.length)
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
				uiFrameMatch.width = initialWidth;
				uiFrameMatch.height = initialHeight;
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

				// draw the image using the scales we've calculate, or 1 if the image wasn't too big
				// clear the canvas first so we're not drawing a bunch of images on top of each other
				ctx.clearRect(0, 0, uiFrame.width, uiFrame.height);
				ctx.fillStyle="ffffff";
				ctx.fillRect(0,0,uiFrame.width, uiFrame.height);
				ctxMatch.clearRect(0, 0, uiFrameMatch.width, uiFrameMatch.height);
				ctxMatch.fillStyle = "ffffff";
				ctxMatch.fillRect(0, 0, uiFrameMatch.width, uiFrameMatch.height);
				
				if (imgFrame.lastChild)
					imgFrame.removeChild(imgFrame.lastChild);

				// scale the uiFrame to match the picture
				img.width = imgScale * img.width;
				img.height = imgScale * img.height;
				// we add the height of the palette here because when we save the image, we draw the palette into this canvas
				// resizing it later causes it to clear the canvas which means we would have to redraw the image as well
				uiFrame.height = img.height + paletteSpacing + paletteDiv[0].height();
				uiFrameMatch.height = uiFrame.height;
				// we add the width of the matching div here because when we save the image, we draw the 
				// matching stuff into the canvas. 
				uiFrame.width = img.width;
				uiFrameMatch.width = img.width + paletteSpacing + $('#colorMatch').width();
				ctx.drawImage(img, 0, 0, img.width, img.height);
				ctxMatch.drawImage(img, 0, 0, img.width, img.height);
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

				// set palette frame width
				// The 3*paletteSpacing is so when the new color button disappears, there's room for the reload button and it doesn't get pushed to the bottom. Probably better to just have a deactivated new color button. Someday. TODO
				$('#paletteFrame').width($('#imgFrame').width() + (3 * paletteSpacing) + $('#newColor').outerWidth());
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
			  		'width': '250px',
			  		'left': imgFrame.offsetLeft + imgFrame.offsetWidth + 45 + "px",
			  		'height': uiFrame.height + "px"
			  });
			  
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
