// context variable
//try {
//	var context = new CanvasRenderingContext2D();
//} catch (ex) {
//	self.postMessage({
//		"msg" : " ERROR : " + ex
//	});
//}

var blob, ex, fileName,localFileURL;

try {
	importScripts("blob.js", "canvas-to-blob.js");
} catch (ex) {
	self.postMessage({
		"msg" : "Can't load scripts! : " + ex
	});
}

function fetchData(localstorage) {
	localstorage.root.getFile(fileName, {
		create : true
	}, function(DatFile) {
		DatFile.createWriter(function(DatContent) {
			DatContent.write(blob);
			localFileURL = DatFile.toURL();
			self.postMessage({
				"msg" : "url is : " + localFileURL ,
				"url" : localFileURL
			});
		});
	});
}

self.addEventListener("message", function(e) {
	var data = e.data;

	// responce to page
	if (data.msg) {
		self.postMessage({
			"msg" : "Worker has recieved : " + data.msg
		});
	}

	if (data.url) {
		try {
			self.webkitResolveLocalFileSystemURL(data.url, function(fileEntry) {
				self.postMessage({
					"msg" : "Worker has viewed localSystem " + fileEntry
				});
			});
		} catch (ex) {
			self.postMessage({
				"msg" : " ERROR : " + ex
			});
		}
	}

	if (data.action && data.action==="saveSnapshot" ) {
		self.postMessage( {  "msg" : "type of content is : " + data.content } );
		blob = new Blob( [data.content] , {type: 'binary/octet-stream'} );
		fileName = data.name;
		self.webkitRequestFileSystem(self.TEMPORARY, 10 * blob.size,
				fetchData);
	}

});