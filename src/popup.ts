import { DecoderService, DecoderType } from './decoderService';

// DOM 요소
let decoderTypeSelect: HTMLSelectElement;
let inputTextarea: HTMLTextAreaElement;
let decodeButton: HTMLButtonElement;
let clearButton: HTMLButtonElement;
let resultContainer: HTMLDivElement;
let metadataContainer: HTMLDivElement;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 가져오기
  decoderTypeSelect = document.getElementById(
    'decoder-type'
  ) as HTMLSelectElement;
  inputTextarea = document.getElementById('input-text') as HTMLTextAreaElement;
  decodeButton = document.getElementById('decode-btn') as HTMLButtonElement;
  clearButton = document.getElementById('clear-btn') as HTMLButtonElement;
  resultContainer = document.getElementById(
    'result-container'
  ) as HTMLDivElement;
  metadataContainer = document.getElementById(
    'metadata-container'
  ) as HTMLDivElement;

  // 디코더 옵션 초기화
  initializeDecoderOptions();

  // 이벤트 리스너 등록
  decodeButton.addEventListener('click', handleDecode);
  clearButton.addEventListener('click', handleClear);
  inputTextarea.addEventListener('input', handleInputChange);
  inputTextarea.addEventListener('paste', () => {
    // 붙여넣기 후 자동 디코딩 (자동 감지 모드일 때)
    setTimeout(() => {
      if (decoderTypeSelect.value === 'auto') {
        handleDecode();
      }
    }, 100);
  });

  // Enter로 디코딩 (Shift+Enter는 줄바꿈 허용)
  inputTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDecode();
    }
  });

  // ESC로 팝업 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.close();
    }
  });
});

/**
 * 디코더 옵션 초기화
 */
function initializeDecoderOptions() {
  const decoders = DecoderService.getAvailableDecoders();
  decoderTypeSelect.innerHTML = '';

  decoders.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    decoderTypeSelect.appendChild(option);
  });
}

/**
 * 입력 변경 시 자동 감지 업데이트
 */
function handleInputChange() {
  if (decoderTypeSelect.value === 'auto' && inputTextarea.value.trim()) {
    const detected = DecoderService.detectDecoder(inputTextarea.value);
    if (detected !== 'auto') {
      // 자동 감지된 타입을 선택 (UI 업데이트는 하지 않음)
      // 사용자가 직접 선택한 경우를 존중
    }
  }
}

/**
 * 디코딩 실행
 */
async function handleDecode() {
  const input = inputTextarea.value.trim();

  if (!input) {
    showResult('', false, '입력이 비어있습니다.');
    return;
  }

  const decoderType = decoderTypeSelect.value as DecoderType;

  // 로딩 표시
  showResult('디코딩 중...', false);
  decodeButton.disabled = true;

  try {
    const result = await DecoderService.decode(input, decoderType);

    if (result.success) {
      showResult(result.result, true, undefined, result.metadata);

      // 자동 감지 모드에서 감지된 타입이 있으면 선택 표시
      if (decoderType === 'auto' && result.type !== 'auto') {
        const detectedLabel =
          DecoderService.getAvailableDecoders().find(
            (d) => d.value === result.type
          )?.label || '';
        // 선택은 유지하되, 사용자에게 알림 (선택적)
      }
    } else {
      showResult(result.error || '디코딩 실패', false, result.error);
    }
  } catch (error) {
    showResult('오류가 발생했습니다: ' + (error as Error).message, false);
  } finally {
    decodeButton.disabled = false;
  }
}

/**
 * 결과 표시
 */
function showResult(
  text: string,
  success: boolean,
  error?: string,
  metadata?: any
) {
  resultContainer.textContent = text || '결과가 없습니다.';

  // 클래스 초기화
  resultContainer.classList.remove('empty', 'success', 'error');

  if (!text || text === '결과가 여기에 표시됩니다...') {
    resultContainer.classList.add('empty');
  } else if (error || !success) {
    resultContainer.classList.add('error');
  } else {
    resultContainer.classList.add('success');
  }

  // 메타데이터 표시 (JWT 등)
  if (metadata) {
    metadataContainer.style.display = 'block';
    let metadataHtml = '';

    if (metadata.header) {
      metadataHtml += `<div class="metadata-title">JWT Header:</div>`;
      metadataHtml += `<pre style="margin: 4px 0; white-space: pre-wrap;">${JSON.stringify(
        metadata.header,
        null,
        2
      )}</pre>`;
    }

    if (metadata.payload) {
      metadataHtml += `<div class="metadata-title" style="margin-top: 8px;">JWT Payload:</div>`;
      metadataHtml += `<pre style="margin: 4px 0; white-space: pre-wrap;">${JSON.stringify(
        metadata.payload,
        null,
        2
      )}</pre>`;
    }

    metadataContainer.innerHTML = metadataHtml;
  } else {
    metadataContainer.style.display = 'none';
    metadataContainer.innerHTML = '';
  }
}

/**
 * 초기화
 */
function handleClear() {
  inputTextarea.value = '';
  showResult('결과가 여기에 표시됩니다...', false);
  decoderTypeSelect.value = 'auto';
  metadataContainer.style.display = 'none';
  inputTextarea.focus();
}
