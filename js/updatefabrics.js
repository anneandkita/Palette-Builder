var curFabric = 0;

$(document).ready(startApp);

function startApp() {
	// show first fabric
	nextFabric();
	$("#newid").click(updateID);
	$("#ok").click(nextFabric);
	$("#update").click(updateFabric);
	$("#updatename").click(updateName);
}

function updateID() {
	curFabric = $("#newidtext").val()-1;
	nextFabric();
}

function nextFabric() {
	curFabric++;
	
	$.ajax({
		url: 'getFabricByID.php',
		type: 'GET',
		data: {
			id: curFabric
		},
		complete: function(xhr, status) {
			// show all the stuff
			var data = jQuery.parseJSON(xhr.responseText);
			
			$("#fabricinfo").html(data[0] + ": " + data[2] + " " + data[1] + " - " + data[3]);
			$("#rgb").html("red: " + data[4] + "<br>green: " + data[5] + "<br>blue: " + data[6] + "<br><br>");
			$("#paletteColor").css("background-color", "rgb(" + data[4] + "," + data[5] + "," + data[6] + ")");
				
			$("#fabricname").val(data[1]);
			var img = new Image();
			var ctx = $("#imgFrame")[0].getContext("2d");
			img.onload = function(){  // ...then set the onload handler...
				ctx.canvas.height = img.height;
				ctx.canvas.width = img.width;
				ctx.drawImage(img,0,0);
			}
			img.src = data[3];	
			$("#errorMessage").html("");		
		}
	});
}

function updateName() {
	if ($("#fabricname").val() === "")
		alert("need a name");
	else {
		
		$.ajax({
			url: 'updateNameByID.php',
			type: 'GET',
			data: {
				id:$("#fabricinfo").text().substr(0, $("#fabricinfo").text().indexOf(':')),
				name: $("#fabricname").val()
			},
			complete: function(xhr, status) {
				curFabric--;
				nextFabric();
			}
		});
	}
}

function updateFabric() {
	// update to new RGB values
	if ($("#rgbvalue").val() === "")
		alert("need rgb value");
	else {
		var hex = $("#rgbvalue").val();
		// convert hex to rgb
		var bigint = parseInt(hex, 16);
		var color = {r:0, g:0, b:0};
		color.r = (bigint >> 16) & 255;
		color.g = (bigint >> 8) & 255;
		color.b = bigint & 255;
		
		var lab=rgb2lab(color);
		
		var colorID = ('000'+color.r).slice(-3) + ('000'+color.g).slice(-3) + ('000' + color.b).slice(-3);
		// update color info in the database
		$.ajax({
			url: 'updateColorByID.php',
			type: 'GET',
			data: {
				id:$("#fabricinfo").text().substr(0, $("#fabricinfo").text().indexOf(':')),
				colorID: colorID,
				red: color.r,
				green: color.g,
				blue: color.b,
				CIEL:lab.CIEL,
				CIEa:lab.CIEa,
				CIEb:lab.CIEb
			}, 
			complete: function(xhr, status) {
				$("#errorMessage").html(status + "<BR>");
				curFabric--;
				nextFabric();
			}
		});
	}
}

function processImage(imgURL) {
	// load image
	var img = new Image();
	var ctx = $("#imgFrame")[0].getContext("2d");
	img.onload = function(){  // ...then set the onload handler...
		ctx.drawImage(img,0,0);
		var fileName = imgURL.replace(/^.*[\\\/]/, '');
		// Filenames are in the form of K001-189-Baby_Pink.jpg
		//var name = fileName.replace(/^.*[\-]/, '');
		// remove .jpg
		var name = fileName.substring(0, fileName.length-4);
		//name = name.substring(0, name.length-4);
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
			    fabricLine: "Bella Solids",
			    fabricDesigner: "Moda",
			    fabricManufacturer: "Moda",
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
			    fabricLine: "Bella Solids",
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
		  			var imgURL = "http://ec2-54-244-186-162.us-west-2.compute.amazonaws.com/fabrics/Moda/Bella_Solids/" + array[i].match(/"(.*?)"/)[1];
		  			// get the palette of the image
		  			processImage(imgURL);
		  		}
		    }
		  }
	  } 
	});
}