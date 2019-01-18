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

function changeUrl (tab, click) {
    var url = '';
    var el = document.createElement('a');
    el.href = tab.url;
    if (el.search.indexOf('?debug') !== -1) {
        if (click === 2 && el.search.indexOf('?debug=assets') === -1) {
            url = el.origin + el.pathname + '?debug=assets' + el.hash;
            currentBrowser.browserAction.setIcon({path: 'super_on.png'});
        } else {
            url = el.origin + el.pathname + el.hash;
            currentBrowser.browserAction.setIcon({path: 'off.png'});
        }
    } else {
        if (click === 1) {
            url = el.origin + el.pathname + '?debug' + el.hash;
            currentBrowser.browserAction.setIcon({path: 'on.png'});
        } else {
            url = el.origin + el.pathname + '?debug=assets' + el.hash;
            currentBrowser.browserAction.setIcon({path: 'super_on.png'});
        }
    }
    currentBrowser.tabs.update(tab.id, {url: url});
}

function changeIcon () {
    currentBrowser.tabs.query({active: true, currentWindow: true}, function (tab) {
        if (tab.length) {
            var icon = 'off.png';
            var el = document.createElement('a');
            el.href = tab[0].url;
            if (el.search.indexOf('?debug') !== -1) {
                if (el.search.indexOf('?debug=assets') !== -1) {
                    icon = 'super_on.png';
                } else {
                    icon = 'on.png';
                }
            }
            currentBrowser.browserAction.setIcon({path: icon});
        }
    });
}

currentBrowser.browserAction.onClicked.addListener(
    new onClickListener(
        function onclick(tab, click) {
            changeUrl(tab, click);
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
