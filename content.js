var currentBrowser;
if (navigator.userAgent.indexOf('Chrome') !== -1) {
    currentBrowser = chrome;
} else {
    currentBrowser = browser;
}

var s = document.createElement('script');
s.src = currentBrowser.extension.getURL('script.js');
(document.head || document.documentElement).appendChild(s);
s.onload = function () {
    s.parentNode.removeChild(s);
};

currentBrowser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "get_debug_mode") {
        var debugMode = false;
        var body = document.getElementsByTagName('body')[0];
        if (body) {
            debugMode = body.getAttribute('data-debug-mode') || false;
        }
        sendResponse({debug_mode: debugMode});
        return true; // force wait
    }
});
