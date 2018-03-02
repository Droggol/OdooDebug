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

browser.browserAction.onClicked.addListener(
    new onClickListener(
        function onclick(tab, click) {
            changeUrl(tab, click);
        },
    )
);

function changeUrl (tab, click) {
    var url = '';
    var el = document.createElement('a');
    el.href = tab.url;

    if (el.search.indexOf('?debug') !== -1) {
        if (click==2 && el.search.indexOf('?debug=assets') === -1) {
            url = el.origin + el.pathname + '?debug=assets' + el.hash;
            browser.browserAction.setIcon({'path': 'super_on.png'});
        } else {
            url = el.origin + el.pathname + el.hash;
            browser.browserAction.setIcon({'path': 'off.png'});
        }
    } else {
        if (click==1) {
            url = el.origin + el.pathname + '?debug' + el.hash;
            browser.browserAction.setIcon({'path': 'on.png'});
        } else {
            url = el.origin + el.pathname + '?debug=assets' + el.hash;
            browser.browserAction.setIcon({'path': 'super_on.png'});
        }
    }

    browser.tabs.update(tab.id, {'url': url});
}

function changeIcon () {
    browser.tabs.query({active: true, currentWindow: true}, function (tab) {
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

        browser.browserAction.setIcon({'path': icon});
    });
}

browser.tabs.onActivated.addListener(function () { changeIcon(); });
browser.tabs.onUpdated.addListener(function () { changeIcon(); });
browser.windows.onFocusChanged.addListener(function () { changeIcon(); });
