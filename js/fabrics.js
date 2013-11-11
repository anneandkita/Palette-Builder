$(document).ready(startApp);

function startApp() {
	$("#process").click(processFiles);
}

function processImage(imgURL) {
	// load image
	var img = new Image();
	var ctx = $("#imgFrame")[0].getContext("2d");
	img.onload = function(){  // ...then set the onload handler...
		ctx.drawImage(img,0,0);
		var fileName = imgURL.replace(/^.*[\\\/]/, '');
		// Filenames are in the form of K001-189-Baby_Pink.jpg
		var name = fileName.replace(/^.*[\-]/, '');
		// remove .jpg
		name = name.substring(0, name.length-4);
		// Get list of colors in the image (colorutils)
		var palette = get_colors(img, ctx);
		$("#paletteColor").css("background-color", "rgb(" + palette[0].r + "," + palette[0].g + "," + palette[0].b + ")");
		
		// Now that we have the palette, we can start putting the information into the right tables
		// fabric: id (auto-incremented), fabric name, line, designer, manufacturer, image filename, url
		// TODO: Don't have this be hardcoded for Konas
		$.ajax({
			url: 'insertfabricsdb.php',
			type: 'POST',
			data: {
				tableName: "fabric",
			    fabricName: name,
			    fabricLine: "Kona Cotton",
			    fabricDesigner: "Robert Kaufman",
			    fabricManufacturer: "Robert Kaufman",
			    fabricFilename: fileName,
			    fabricURL: imgURL
			},
			complete: function(xhr, status) {
				$("#errorMessage").append(status + "<BR>");
			}
		}); 
		// color: id (rgb), r, g, b, L, a, b
		// note: if there is a leading 0 in the id (e.g. r is 0) then it is dropped when it's entered into the table since it's stored as an integer. I don't think that's an issue, but if it becomes an issue, those columns should be changed to hold chars instead of ints to solve that issue.
		$.ajax({
			url: 'insertfabricsdb.php',
			type: 'POST',
			data: {
				tableName: "color",
			    colorID: palette[0].r.toString() + palette[0].g.toString() + palette[0].b.toString(),
			    colorRed: palette[0].r,
			    colorGreen: palette[0].g,
			    colorBlue: palette[0].b,
			    colorL: palette[0].CIEL,
			    colora: palette[0].CIEa,
			    colorb: palette[0].CIEb
			},
			complete: function(xhr, status) {
				$("#errorMessage").append(status + "<BR>");
			}
		});
		
		// fabriccolor: fabric id, color id, percentage (0-1)
		// note: if there is a leading 0 in the id (e.g. r is 0) then it is dropped when it's entered into the table since it's stored as an integer. I don't think that's an issue, but if it becomes an issue, those columns should be changed to hold chars instead of ints to solve that issue.
		$.ajax({
			url: 'insertfabricsdb.php',
			type: 'POST',
			data: {
				tableName: "fabriccolor",
			    colorID: palette[0].r.toString() + palette[0].g.toString() + palette[0].b.toString(),
			    fabricName: name,
			    fabricLine: "Kona Cotton",
			    colorPercentage: 1.0
			},
			complete: function(xhr, status) {
				$("#errorMessage").append(status + "<BR>");
			}
		});
		
		// for each reference color (eg refcolor2550128): fabric id, color id, distance to reference color
		// send the color, have the php script calculate the distance so we can do every reference table at once
		$.ajax({
			url: 'insertfabricsdb.php',
			type: 'POST',
			data: {
				tableName: "reftables",
			    colorID: palette[0].r.toString() + palette[0].g.toString() + palette[0].b.toString(),		
			    colorL: palette[0].CIEL,
			    colora: palette[0].CIEa,
			    colorb: palette[0].CIEb
			},
			complete: function(xhr, status) {
				$("#errorMessage").append(status + "<BR>");
			}
		});
		
	};
	img.src = imgURL;
}	  

function processFiles() {
	$.ajax({
	  url: 'getFolderAsArrayOfNames.php',
	  dataType: 'json',
	  complete: function(xhr, status) {
		  if (status === 'error' || !xhr.responseText) {
		       alert("error: " + xhr.responseText);
		  }
		  else {
		  	var data = xhr.responseText;
		  	var array = data.split(",");
		  	for (var i=0 ; i < array.length; i++)
		  	{
		  		// if the filename ends in .jpg then we want to color process it
		  		if (array[i].indexOf(".jpg") !== -1)
		  		{
		  			var imgURL = "http://ec2-54-244-186-162.us-west-2.compute.amazonaws.com/fabrics/Robert_Kaufman/Kona_Cotton/" + array[i].match(/"(.*?)"/)[1];
		  			// get the palette of the image
		  			processImage(imgURL);
		  		}
		    }
		  }
	  } 
	});
}