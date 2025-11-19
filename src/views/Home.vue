<template>
  <div class="home-container">
    <a rel="noopener noreferrer" href="https://github.com/atqq/md-qrlink" target="_blank" class="github-link">
      <span>GitHub</span>
      <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true">
        <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
      </svg>
    </a>
    <h1>Markdown标题外链转二维码</h1>
    <p class="description">将Markdown中带超链接的标题提取出来，放在标题下方，并在左侧生成对应的二维码图片</p>
    <p class="description">
      搭配 <a href="https://github.com/doocs/md?tab=readme-ov-file" target="_blank" rel="noopener noreferrer">微信
      Markdown 编辑器</a>（<a href="https://md.doocs.org" target="_blank">md.doocs.org</a>） 使用效果更加
    </p>
    <div class="actions">
      <button @click="loadSample">加载示例</button>
      <button @click="clearContent">清空内容</button>
      <button @click="copyTransformed">复制转换后内容</button>
      <button @click="handleSetQrCode">设置二维码</button>
    </div>
    <Modal v-model="showModal"
           title="设置二维码样式"
           @confirm="handleQrCodeConfirm"
           @cancel="handleQrCodeCancel"
    >
      <form class="qr-style-form">
        <div class="form-heading">
          <h4>主题参数</h4>
          <p>调整颜色与绘制模式，打造与编辑器一致的科技感视觉。</p>
        </div>
        <div class="form-grid">
          <div class="form-item">
            <label class="label">背景色</label>
            <div class="control">
              <input v-model="options.background" type="color" class="form-control color-picker">
              <span class="value-chip">{{ options.background }}</span>
            </div>
          </div>
          <div class="form-item">
            <label class="label">前景色</label>
            <div class="control">
              <input v-model="options.foreground" type="color" class="form-control color-picker">
              <span class="value-chip">{{ options.foreground }}</span>
            </div>
          </div>
          <div class="form-item">
            <label class="label">纠错级别</label>
            <select v-model="options.level" class="form-control">
              <option label="L" value="L"></option>
              <option label="M" value="M"></option>
              <option label="Q" value="Q"></option>
              <option label="H" value="H"></option>
            </select>
            <p class="form-tip">级别越高容错越强，但二维码密度更大。</p>
          </div>
          <div class="form-item">
            <label class="label">图片模式</label>
            <select v-model="options.renderAs" class="form-control">
              <option label="SVG" value="svg"></option>
              <option label="Canvas" value="canvas"></option>
            </select>
            <p class="form-tip">SVG 便于导出高清矢量，Canvas 性能更优。</p>
          </div>
        </div>
      </form>
    </Modal>
    <div class="editor-wrapper">
      <MarkdownEditor
          :initial-content="markdownContent"
          v-model:content="markdownContent"
          ref="editor"
      />
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';
import MarkdownEditor from '../components/MarkdownEditor.vue';
import {getTransformedContentForCopy} from '../utils/markdownParser';
import Modal from "../components/Modal.vue"
import {useQrCodeStore} from "../store/qrcode.js";
import {storeToRefs} from "pinia";

// 从localStorage读取缓存的内容，如果没有则使用空字符串
const savedContent = localStorage.getItem('markdownContent') || '';
const markdownContent = ref(savedContent);
const editor = ref(null);
const showModal = ref(false);
const qrcodeStore = useQrCodeStore()
const {options} = storeToRefs(qrcodeStore)

const sampleMarkdown = `# [Vue.js官网](https://vuejs.org/)

Vue.js是一个流行的JavaScript前端框架。

## [Vite官方文档](https://vitejs.dev/)

Vite是一个现代前端构建工具，提供了极速的开发体验。

### [Markdown语法指南](https://www.markdownguide.org/)

Markdown是一种轻量级标记语言，创建格式化文本的语法简洁明了。`;

// 如果没有缓存内容，则默认加载示例内容
if (!savedContent) {
  markdownContent.value = sampleMarkdown;
}

// 监听内容变化，保存到localStorage
watch(markdownContent, (newContent) => {
  localStorage.setItem('markdownContent', newContent);
});

const loadSample = () => {
  markdownContent.value = sampleMarkdown;
};

const clearContent = () => {
  markdownContent.value = '';
  localStorage.removeItem('markdownContent');
};

const copyTransformed = async () => {
  try {
    const transformedContent = await getTransformedContentForCopy(markdownContent.value);
    await navigator.clipboard.writeText(transformedContent);
    alert('转换后的内容已复制到剪贴板！');
  } catch (err) {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制。');
  }
};
/**
 * 设置二维码样式
 */
const handleSetQrCode = () => {
  showModal.value = true
}
const handleQrCodeConfirm = async () => {
  if (editor.value) {
    editor.value.refreshContent()
    showModal.value = false
  }
}
const handleQrCodeCancel = () => {
}
</script>

<style scoped>
.github-link {
  position: absolute;
  top: 10px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.home-container {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.description {
  color: #666;
  margin-bottom: 20px;
  font-size: 1rem;
}

.actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.actions button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.actions button:hover {
  background-color: #45a049;
}

.editor-wrapper {
  width: 100%;
  height: 75vh;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qr-style-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #fff;
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 16px;
  padding: 20px;
  color: #213547;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.form-heading h4 {
  margin: 0 0 6px;
  font-size: 1.05rem;
  color: #1f2937;
}

.form-heading p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  background: #f7f7fb;
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.label {
  font-size: 0.95rem;
  color: #111827;
  letter-spacing: 0.2px;
}

.control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: #fff;
  color: #1f2937;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: rgba(100, 108, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.2);
}

.color-picker {
  width: 56px;
  height: 40px;
  padding: 6px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: #fff;
}

.value-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.4);
  font-size: 0.85rem;
  color: #4b5563;
}

.form-tip {
  margin: 0;
  font-size: 0.82rem;
  color: #6b7280;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .home-container {
    padding: 10px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .description {
    font-size: 0.9rem;
  }

  .actions button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .editor-wrapper {
    height: 85vh;
  }

  .qr-style-form {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

}
</style>