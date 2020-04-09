let currentBrowser;
if (typeof chrome == 'object') {
    currentBrowser = chrome;
} else {
    currentBrowser = browser;
}

const scriptEl = document.createElement('script');
scriptEl.src = currentBrowser.extension.getURL('pageScript.js');
(document.head || document.documentElement).appendChild(scriptEl);
scriptEl.onload = () => scriptEl.parentNode.removeChild(scriptEl);

currentBrowser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'get_info') {
        const body = document.getElementsByTagName('body')[0];
        if (body) {
            sendResponse({
                odoo_version: body.getAttribute('data-odoo-version'),
                debug_mode: body.getAttribute('data-debug-mode'),
            });
        }
    }
});
