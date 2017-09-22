var onDoubleClickListener = function (config) {
    // Max time between click events occurrence;
    var CONTROL_TIME = 250;

    // Set click to false at beginning
    var alreadyClicked = false;
    var doubleClicked = false;
    var timer;
    var timer2;

    if (config && config.onDoubleClick instanceof Function) {
        return function (tab) {

            // Check for previous click
            if (alreadyClicked) {
                // Yes, Previous Click Detected

                // Clear timer already set in earlier Click
                clearTimeout(timer);

                // Clear all Clicks
                alreadyClicked = false;
                doubleClicked = true;

                return config.onDoubleClick.apply(config.onDoubleClick,[tab]);
            } else {
                setTimeout(function () {
                    if (!doubleClicked) {
                        config.onSingleClick.apply(config.onDoubleClick,[tab]);
                    }
                }, CONTROL_TIME + 20);
            }

            //Set Click to  true
            alreadyClicked = true;

            //Add a timer to detect next click to a sample of 250
            timer = setTimeout(function () {
                //Clear all timers
                clearTimeout(timer);
                //Ignore clicks
                alreadyClicked = false;
            }, CONTROL_TIME);

            timer2 = setTimeout(function () {
                //Clear all timers
                clearTimeout(timer2);
                //Ignore clicks
                doubleClicked = false;
            }, CONTROL_TIME + 50);
        };
    }
    throw new Error('[InvalidArgumentException]');
};

chrome.browserAction.onClicked.addListener(new onDoubleClickListener({
    onDoubleClick: function (tab) {
        changeUrl(tab, false);
    },
    onSingleClick: function (tab) {
        changeUrl(tab, true);
    }
}));

function changeUrl (tab, single) {
    var url = '';
    var el = document.createElement('a');
    el.href = tab.url;
    if (el.search.indexOf('?debug') !== -1) {
        if (!single && el.search.indexOf('?debug=assets') == -1) {
            url = el.origin + el.pathname + '?debug=assets' + el.hash;
            chrome.browserAction.setIcon({'path': 'super_on.png'});
        } else {
            url = el.origin + el.pathname + el.hash;
            chrome.browserAction.setIcon({'path': 'off.png'});
        }
    } else {
        if (single) {
            url = el.origin + el.pathname + '?debug' + el.hash;
            chrome.browserAction.setIcon({'path': 'on.png'});
        } else {
            url = el.origin + el.pathname + '?debug=assets' + el.hash;
            chrome.browserAction.setIcon({'path': 'super_on.png'});
        }
    }
    chrome.tabs.update(tab.id, {'url': url});
}

function changeIcon () {
    chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
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
        chrome.browserAction.setIcon({'path': icon});
    });
}

chrome.tabs.onActivated.addListener(function () { changeIcon(); });
chrome.tabs.onUpdated.addListener(function () { changeIcon(); });
chrome.windows.onFocusChanged.addListener(function () { changeIcon(); });
