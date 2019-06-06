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

function changeUrl (tab, click, response) {
    var url = '';
    var el = document.createElement('a');
    el.href = tab.url;
    var debugMode = response.debug_mode;
    if (debugMode && click === 1) {
        url = el.origin + el.pathname + '?debug' + el.hash;
        currentBrowser.browserAction.setIcon({path: 'off.png'});
    } else {
        if (click === 1) {
            url = el.origin + el.pathname + '?debug=1' + el.hash;
            currentBrowser.browserAction.setIcon({path: 'on.png'});
        } else if (click === 2) {
            url = el.origin + el.pathname + '?debug=assets' + el.hash;
            currentBrowser.browserAction.setIcon({path: 'super_on.png'});
        } else {
            url = el.origin + el.pathname + '?debug=tests' + el.hash;
            currentBrowser.browserAction.setIcon({path: 'tests.png'});
        }
    }
    currentBrowser.tabs.update(tab.id, {url: url});
}

function changeIcon () {
    currentBrowser.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (tabs.length) {
            currentBrowser.tabs.sendMessage(tabs[0].id, {action: "get_debug_mode"}, function(response) {
                  var icon = 'off.png';
                  var debugMode = response.debug_mode;
                  if (debugMode) {
                      if (debugMode === 'assets') {
                          icon = 'super_on.png';
                      } else if (debugMode === 'tests') {
                          icon = 'tests.png';
                      } else {
                          icon = 'on.png';
                      }
                  }
                  currentBrowser.browserAction.setIcon({path: icon});
            });
        }
    });
}
currentBrowser.browserAction.onClicked.addListener(
    new onClickListener(
        function onclick(tab, click) {
            currentBrowser.tabs.sendMessage(tab.id, {action: "get_debug_mode"}, function(response) {
                changeUrl(tab, click, response);
            });
        },
    )
);
currentBrowser.tabs.onActivated.addListener(function () {
    changeIcon();
});
currentBrowser.tabs.onUpdated.addListener(function () {
    changeIcon();
});
currentBrowser.windows.onFocusChanged.addListener(function () {
    changeIcon();
});
