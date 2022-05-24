const getURL = typeof browser == 'object' ? chrome.extension.getURL : chrome.runtime.getURL; // Browser compatibility

const scriptEl = document.createElement('script');
scriptEl.src = getURL('pageScript.js');
(document.head || document.documentElement).appendChild(scriptEl);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'getOdooDebugInfo') {
        const body = document.getElementsByTagName('body')[0];
        if (body && body.hasAttribute('data-odoo')) {
            sendResponse({
                odooVersion: body.getAttribute('data-odoo'),
                debugMode: body.getAttribute('data-odoo-debug-mode'),
            });
        } else {
            sendResponse({ odooVersion: false });
        }
    }
});
