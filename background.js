var onClickListener = function (callback) {
    // Max time between click events occurrence;
    var CONTROL_TIME = 500;

    var click = 0;
    var timer;

    if (callback && callback instanceof Function) {
        return function (tab) {
            click += 1;
            clearTimeout(timer);
            timer = setTimeout(function () {
                //Clear all timers
                clearTimeout(timer);
                callback.apply(this ,[tab, click]);
                click = 0;
            }, CONTROL_TIME);
        };
    }
    throw new Error('[InvalidArgumentException]');
};

var currentBrowser;
if (navigator.userAgent.indexOf('Chrome') !== -1) {
    currentBrowser = chrome;
} else {
    currentBrowser = browser;
}

var debugMode = '';
var odooVersion = 'legacy';

function onClickActivateDebugMode (tab, click) {
    var hyperLinkEl = document.createElement('a');
    hyperLinkEl.href = tab.url;
    var url = hyperLinkEl.origin + hyperLinkEl.pathname + (odooVersion === 'legacy' ? '' : '?debug=0') + hyperLinkEl.hash;
    var icon = 'off.png';

    if (debugMode !== '') {
        if (click === 2) {
            url = hyperLinkEl.origin + hyperLinkEl.pathname + '?debug=assets' + hyperLinkEl.hash;
            icon = 'super_on.png';
        }
    } else {
        if (click === 1) {
            url = hyperLinkEl.origin + hyperLinkEl.pathname + '?debug=1' + hyperLinkEl.hash;
            icon = 'on.png';
        } else if (click === 2) {
            url = hyperLinkEl.origin + hyperLinkEl.pathname + '?debug=assets' + hyperLinkEl.hash;
            icon = 'super_on.png';
        }
    }

    currentBrowser.browserAction.setIcon({path: icon});
    currentBrowser.tabs.update(tab.id, {url: url});
}

function adaptIcon () {
    currentBrowser.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (tabs.length) {
            currentBrowser.tabs.sendMessage(tabs[0].id, {message: 'get_info'}, function (response) {
                if (chrome.runtime.lastError) {
                    return;
                }
                var icon = 'off.png';
                if (response) {
                    if (response.debug_mode === 'assets') {
                        icon = 'super_on.png';
                    } else if (response.debug_mode === '1') {
                        icon = 'on.png';
                    }
                    odooVersion = response.odoo_version;
                    debugMode = response.debug_mode;
                }
                currentBrowser.browserAction.setIcon({path: icon});
            });
        }
    });
}

currentBrowser.browserAction.onClicked.addListener(
    new onClickListener(
        function onclick(tab, click) {
            onClickActivateDebugMode(tab, click);
        },
    )
);
currentBrowser.tabs.onActivated.addListener(function () {
    adaptIcon();
});
currentBrowser.tabs.onUpdated.addListener(function () {
    adaptIcon();
});
currentBrowser.windows.onFocusChanged.addListener(function () {
    adaptIcon();
});
