// Background service worker for Chrome extension
console.log('Background service worker loaded');

// Listen for extension installation
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onInstalled.addListener(() => {
    console.log('유니버설 디코더가 설치되었습니다.');
  });
}
