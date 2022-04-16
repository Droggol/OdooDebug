const browserAction = typeof browser == 'object' ? chrome.browserAction : chrome.action; // Firefox compatibility

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

let debugMode = '';
let odooVersion = false;

const onClickActivateDebugMode = (tab, click) => {
    if (odooVersion) {
        const debugOptions = {
            0: [odooVersion === 'legacy' ? '' : 'debug=0', '/images/icons/off_16.png'],
            1: ['debug=1', '/images/icons/on_16.png'],
            2: ['debug=assets', '/images/icons/super_16.png'],
        }

        if (debugMode) {
            click = click > 2 ? 0 : click;
        } else {
            click = click > 2 ? 1 : click;
        }
        const selectedMode = debugMode && click === 1 ? 0 : click;
        const tabUrl = new URL(tab.url);
        const search = tabUrl.search.split(/[&|?]debug=(0|1|assets)/)[0];
        const symbol = search ? '&' : '?';
        const [debugOption, path] = debugOptions[selectedMode];
        const url = tabUrl.origin + tabUrl.pathname + `${search}${debugOption && symbol}${debugOption}` + tabUrl.hash;

        browserAction.setIcon({path});
        chrome.tabs.update(tab.id, {url});
    }
}

const adaptIcon = () => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length) {
            chrome.tabs.sendMessage(tabs[0].id, {message: 'getOdooDebugInfo'}, response => {
                if (chrome.runtime.lastError) {
                    return;
                }
                if (response.odooVersion) {
                    let path = '/images/icons/off_16.png';
                    if (response.debugMode === 'assets') {
                        path = '/images/icons/super_16.png';
                    } else if (response.debugMode === '1') {
                        path = '/images/icons/on_16.png';
                    }
                    odooVersion = response.odooVersion;
                    debugMode = response.debugMode;
                    browserAction.setIcon({ path });
                } else {
                    odooVersion = false;
                    browserAction.setIcon({ path: '/images/icons/no_debug_16.png' });
                }
            });
        }
    });
}

browserAction.onClicked.addListener(new onClickListener((tab, click) => onClickActivateDebugMode(tab, click)));
chrome.tabs.onActivated.addListener(adaptIcon);
chrome.tabs.onUpdated.addListener(adaptIcon);
chrome.windows.onFocusChanged.addListener(adaptIcon);
