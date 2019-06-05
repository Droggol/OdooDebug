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

const getDebugQuery = (tab, target) => {
    /*
    5 cases:
    - debug=1 (simple debug)
    - debug=assets (full js/css files)
    - debug=tests (add js test files)
    - debug=assets,tests (both above)
    - / (no debug)
    */
    const url = tab.url;
    if (target === "tests") {
        if (url.indexOf("?debug=") === -1)
            return "tests";

        if (url.indexOf("?debug=assets") === 1)
            return "assetstests";

        if (url.indexOf("?debug=assets,tests") === 1)
            return "assets";

        if (url.indexOf("?debug=1") === 1) {
            return "tests";
        }
        // already in test
        return false;
    } else if (target === "1") {
        if (url.indexOf("?debug=") === -1)
            return "1";

        if (url.indexOf("?debug=assets,tests") === 1)
            return "tests";

        // already in 1, assets or tests
        return false;
    } else {
        if (url.indexOf("?debug=") === -1)
            return "assets";

        if (url.indexOf("?debug=assets,tests") === 1)
            return "tests";

        if (url.indexOf("?debug=1") === 1) {
            return "assets";
        }

        if (url.indexOf("?debug=tests") === 1) {
            return "assetstests";
        }

        // already in assets
        return false;
    }

};


const changeUrl = (tab, click, mode) => {
    var url = '';
    var el = document.createElement('a');
    el.href = tab.url;
    if (click === 1) {
        var newMode = getDebugQuery(tab, mode === "tests" && "tests" || "1");
    } else {
        if (mode === "1" || mode === "assets") {
            var newMode = getDebugQuery(tab, "assets");
        } else {
            var newMode = getDebugQuery(tab, "tests");
        }
    }
    if (newMode === "1") {
        var query = "?debug=1";
        currentBrowser.browserAction.setIcon({path: 'on.png'});
    } else if (newMode === "assets") {
        var query = "?debug=assets";
        currentBrowser.browserAction.setIcon({path: 'super_on.png'});
    } else if (newMode === "tests") {
        var query = "?debug=tests";
        currentBrowser.browserAction.setIcon({path: 'on.png'});
    } else if (newMode === "assetstests") {
        var query = "?debug=assets,tests";
        currentBrowser.browserAction.setIcon({path: 'super_on.png'});
    } else {
        var query = "";
    }
    url = el.origin + el.pathname + query + el.hash;
    currentBrowser.tabs.update(tab.id, {url: url});
};

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
            changeUrl(tab, click, "1");
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
