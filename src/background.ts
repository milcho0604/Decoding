// Background service worker for Chrome extension
console.log('Background service worker loaded');

// Listen for extension installation
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onInstalled.addListener(() => {
    console.log('디코더 도구가 설치되었습니다.');
  });
}
