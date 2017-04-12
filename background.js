var OnDoubleClickListener = function(config){
    // Max time between click events occurrence;
    var CONTROL_TIME = 250;

    //Set click to false at beginning
    var alreadyClicked = false;
    var doubleClicked = false;
    var timer;
    var timer2;

    if(config && config.onDoubleClick instanceof Function)
    return function(tab) {

        //Check for previous click
        if (alreadyClicked) {
            //Yes, Previous Click Detected

            //Clear timer already set in earlier Click
            clearTimeout(timer);

            //Clear all Clicks
            alreadyClicked = false;
            doubleClicked = true;


            return config.onDoubleClick.apply(config.onDoubleClick,[tab]);
        }else{
            setTimeout(function () {
                if(!doubleClicked){
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
    throw new Error("[InvalidArgumentException]");
};


chrome.browserAction.onClicked.addListener(new OnDoubleClickListener({
    onDoubleClick : function(tab) {
        change_url(tab, false);
    },
    onSingleClick : function(tab) {
        change_url(tab, true);
    }
}));

function change_url(tab, single){
    $(document).ready(function() {
        var el = document.createElement('a');
        el.href = tab.url;
        var deparam = $.deparam.querystring(tab.url);
        var url = "";
        if(deparam.hasOwnProperty('debug')) {
            if(deparam.debug != 'assets' && !single){
                url = $.param.querystring(tab.url, 'debug=assets');
                chrome.browserAction.setIcon({'path': 'super_on.png'});
            }else{
                var p = $.deparam.querystring(el.search);
                delete p['debug'];
                url = $.param.querystring(el.origin + el.pathname, p);
                url = url + el.hash;
                chrome.browserAction.setIcon({'path': 'off.png'});
            }
        } else {
            if(single){
                url = $.param.querystring(tab.url, 'debug');
                chrome.browserAction.setIcon({'path': 'on.png'});
            }
            else{
                url = $.param.querystring(tab.url, 'debug=assets');
                chrome.browserAction.setIcon({'path': 'super_on.png'});
            }
        }
        chrome.tabs.update(tab.id, {"url": url});
    });
}

function changeIcon() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
        var url = tab[0].url;
        var deparam = $.deparam.querystring(url);
        if(deparam.hasOwnProperty('debug')) {
            if(deparam.debug == 'assets'){
                chrome.browserAction.setIcon({'path': 'super_on.png'});
            }else{
                chrome.browserAction.setIcon({'path': 'on.png'});
                
            }
        } else {
            chrome.browserAction.setIcon({'path': 'off.png'});
        }
    });
}

chrome.tabs.onActivated.addListener(function(activeInfo, active) {
    changeIcon();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    changeIcon();
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
    changeIcon();
});
