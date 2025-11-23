// Background service worker for Chrome extension
console.log('Background service worker loaded');

// Listen for extension installation
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onInstalled.addListener(() => {
    console.log('유니버설 디코더가 설치되었습니다.');
  });
}

// Side Panel 제어
chrome.runtime.onMessage.addListener(
  (
    request: any,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (request.action === 'openSidePanel') {
      // @ts-ignore - Chrome 114+ sidePanel API
      if (chrome.sidePanel && chrome.sidePanel.open) {
        const windowId = request.windowId;

        if (windowId) {
          // @ts-ignore
          chrome.sidePanel.open({ windowId: windowId })
            .then(() => {
              console.log('Side Panel opened');
              sendResponse({ success: true });
            })
            .catch((error: Error) => {
              console.error('Failed to open side panel:', error);
              sendResponse({ success: false, error: error.message });
            });
        } else {
          sendResponse({ success: false, error: 'Window ID not provided' });
        }
        return true; // 비동기 응답을 위해 true 반환
      } else {
        sendResponse({ success: false, error: 'Side Panel API not available' });
      }
    }
  }
);
