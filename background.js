class onClickListener {
    constructor(callback) {
        const CONTROL_TIME = 500; // Max time between click events occurrence
        let click = 0;
        let timer;

        if (callback && callback instanceof Function) {
            return tab => {
                click += 1;
                clearTimeout(timer);
                timer = setTimeout(() => {
                    // Clear all timers
                    clearTimeout(timer);
                    callback.apply(this, [tab, click]);
                    click = 0;
                }, CONTROL_TIME);
            };
        }
        throw new Error('[InvalidArgumentException]');
    }
}

let currentBrowser;
if (navigator.userAgent.indexOf('Chrome') !== -1) {
    currentBrowser = chrome;
} else {
    currentBrowser = browser;
}

let debugMode = '';
let odooVersion = 'legacy';

let onClickActivateDebugMode = (tab, click) => {
    const debugOptions = {
        0: [odooVersion === 'legacy' ? '' : 'debug=0', 'off.png'],
        1: ['debug=1', 'on.png'],
        2: ['debug=assets', 'super_on.png'],
    }
    const hyperLinkEl = document.createElement('a');
    hyperLinkEl.href = tab.url;

    const selectedMode = debugMode && click === 1 ? 0 : click;
    const search = hyperLinkEl.search.split(/[&|?]debug=(0|1|assets)/)[0];
    const symbol = search ? '&' : '?';    
    const [debugOption, path] = debugOptions[selectedMode];

    const url = hyperLinkEl.origin + hyperLinkEl.pathname + `${search}${debugOption && symbol}${debugOption}` + hyperLinkEl.hash;

    currentBrowser.browserAction.setIcon({path});
    currentBrowser.tabs.update(tab.id, {url});
}

let adaptIcon = () => {
    currentBrowser.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length) {
            currentBrowser.tabs.sendMessage(tabs[0].id, {message: 'get_info'}, response => {
                if (chrome.runtime.lastError) {
                    return;
                }
                let path = 'off.png';
                if (response) {
                    if (response.debug_mode === 'assets') {
                        path = 'super_on.png';
                    } else if (response.debug_mode === '1') {
                        path = 'on.png';
                    }
                    odooVersion = response.odoo_version;
                    debugMode = response.debug_mode;
                }
                currentBrowser.browserAction.setIcon({path});
            });
        }
    });
}

currentBrowser.browserAction.onClicked.addListener(
    new onClickListener((tab, click) => onClickActivateDebugMode(tab, click))
);
currentBrowser.tabs.onActivated.addListener(adaptIcon);
currentBrowser.tabs.onUpdated.addListener(adaptIcon);
currentBrowser.windows.onFocusChanged.addListener(adaptIcon);