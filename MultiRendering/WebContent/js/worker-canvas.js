// ANTS_TAG : try add to file width, height of canvas -> should made
// serializer...

var filer, reader;

try {
    importScripts("blob.js", "filer.js");
}
catch (ex) {
    self.postMessage({
        "msg" : "Can't load scripts! : " + ex
    });
}

filer = new Filer();
reader = new FileReader();

function onError(e) {
    self.postMessage({
        "msg" : " Has occured an error : " + e.name
    });
}

function fetchData(fileEntry, fileWriter) {
    var localFileURL;
    localFileURL = fileEntry.toURL();
    self.postMessage({
        "msg" : "url is : " + localFileURL,
        "url" : localFileURL
    });
}

filer.init({
    persistent : false,
    size : 1024 * 1024 * 32
}, function(fs) {
    self.postMessage({
        "msg" : "Worker initialize file system"
    });
}, onError);

self.addEventListener("message", function(e) {
    var data = e.data;
    
    // responce to page
    if (data.msg) {
        self.postMessage({
            "msg" : "Worker has recieved : " + data.msg
        });
    }
    
    if (data.action && data.action === "saveSnapshot") {
        filer.write(data.name, {
            data : data.content,
            type : "binary/octet-stream",
            append : false
        }, fetchData, onError);
    }
    
});
