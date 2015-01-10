/**
 * New node file
 */
self.addEventListener("message", function(e) {
	var data = e.data;
	var canvas = null;
	try {
		canvas = eval("document.createElement('canvas');");
	} catch (ex) {
		self.postMessage({
			"msg" : "ERROR : " + ex
		});
	}

	self.postMessage({
		"msg" : "say : " + data.msg + " from worker"
	});
}, false);