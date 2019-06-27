var currentBrowser;
if (navigator.userAgent.indexOf('Chrome') !== -1) {
    currentBrowser = chrome;
} else {
    currentBrowser = browser;
}

var scriptEl = document.createElement('script');
scriptEl.src = currentBrowser.extension.getURL('pageScript.js');
(document.head || document.documentElement).appendChild(scriptEl);
scriptEl.onload = function () {
    scriptEl.parentNode.removeChild(scriptEl);
};

currentBrowser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === 'get_info') {
        var body = document.getElementsByTagName('body')[0];
        if (body) {
            sendResponse({
                odoo_version: body.getAttribute('data-odoo-version'),
                debug_mode: body.getAttribute('data-debug-mode'),
            });
        }
    }
});
