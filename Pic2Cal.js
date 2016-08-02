var express = require('express');
var app = express();
var fs = require("fs");
var removeChars = ['"','='];
var waiting = true;

function contentRequest(res)
{
	// create the JSON object with URL of image
	jsonObject = JSON.stringify({
		"url" : "http://www.atlanticposters.com/images/foofighters_SP0650.jpg",});

	// HTTP protocol
	var https = require('https');

	// prepare the header for content request to OCR
	var postheaders = {
    	'Content-Type' : 'application/json',
    	'Ocp-Apim-Subscription-Key' : '87a9835e760c4580b64cb7170b22430f'
	};

	// the post options for content request to OCR
	var optionspost = {
	    host : 'api.projectoxford.ai',
	    path : '/vision/v1.0/ocr?language=en&detectOrientation=true',
	    method : 'POST',
	    headers : postheaders,
	};

	// do the POST call
	var reqPost = https.request(optionspost, function(res1) {

	 
	    res1.on('data', function(OCRResponse) {
	        imageToText(OCRResponse, res);
	    });
	});

	// write the json data
	reqPost.write(jsonObject);
	reqPost.end();
	reqPost.on('error', function(e) {
	    console.error(e);
	});
}

function imageToText (jsonString, res) {
    var json = JSON.parse(jsonString, 'utf8');
    var region = json["regions"];
    textInImage = "";

    for(var regionKey in region) {
        var regionObjects = region[regionKey];
        for(var lineKey in regionObjects) {
            if (lineKey == "lines") {
                line = regionObjects[lineKey];
                for (var keyInLine in line) {
                    var lineObjects = line[keyInLine];
                    for (var wordKey in lineObjects) {
                        if (wordKey == "words") {
                            var word = lineObjects[wordKey];
                            for (var keyInWord in word) {
                                var wordObjects = word[keyInWord];
                                textInImage += wordObjects["text"] + " ";
                            }
                        }
                    } 
                }
            }
        }
    }

    textInImage = textInImage.replace(/[^\x20-\x7F]/g, "");
    for (var i = 0; i < removeChars.length; i++) {
       textInImage = textInImage.replace(removeChars[i], "");
     }

     // response for API
     res.send(textInImage);
     waiting = false;
}


app.get('/Pic2Cal', function (req, res) {
	contentRequest(res);
})

function convertBase64ToRaw() {

}

var server = app.listen(8080, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})