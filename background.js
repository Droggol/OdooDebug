const browserAction = typeof browser == 'object' ? chrome.browserAction : chrome.action; // Browser compatibility

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
let odooVersion = 'legacy';

const onClickActivateDebugMode = (tab, click) => {
    if (click <= 2) {
        const debugOptions = {
            0: [odooVersion === 'legacy' ? '' : '0', '/images/icons/off_48.png'],
            1: ['1', '/images/icons/on_48.png'],
            2: ['assets', '/images/icons/super_48.png'],
        };
        const selectedMode = debugMode && click === 1 ? 0 : click;
        const tabUrl = new URL(tab.url);
        const [debugOption, path] = debugOptions[selectedMode];
        const params = new URLSearchParams(tabUrl.search);
        params.set('debug', debugOption);
        const url = tabUrl.origin + tabUrl.pathname + `?${params.toString()}` + tabUrl.hash;
        browserAction.setIcon({ path });
        chrome.tabs.update(tab.id, { url });
    }
}

const adaptIcon = () => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length) {
            chrome.tabs.sendMessage(tabs[0].id, {message: 'getOdooDebugInfo'}, response => {
                if (chrome.runtime.lastError) {
                    return;
                }
                let path = '/images/icons/off_48.png';
                if (response.odooVersion) {
                    if (response.debugMode === 'assets') {
                        path = '/images/icons/super_48.png';
                    } else if (response.debugMode === '1') {
                        path = '/images/icons/on_48.png';
                    }
                    odooVersion = response.odooVersion;
                    debugMode = response.debugMode;
                }
                browserAction.setIcon({ path });
            });
        }
    });
}

browserAction.onClicked.addListener(new onClickListener((tab, click) => onClickActivateDebugMode(tab, click)));
chrome.tabs.onActivated.addListener(adaptIcon);
chrome.tabs.onUpdated.addListener(adaptIcon);
chrome.windows.onFocusChanged.addListener(adaptIcon);
