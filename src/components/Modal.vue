<template>
  <!-- 使用 Teleport 将模态框挂载到 body 元素，避免层级样式问题 -->
  <Teleport to="body">
    <!-- 遮罩层，点击外部关闭。使用 Transition 包裹实现动画 -->
    <Transition name="modal">
      <div
          v-if="modelValue"
          class="modal-overlay"
          @click.self="handleOverlayClick"
      >
        <!-- 模态框容器，阻止点击事件冒泡到遮罩层 -->
        <div class="modal-container" :style="{ width: width }">
          <div class="modal-accent"></div>

          <!-- 头部 -->
          <div class="modal-header">
            <div class="modal-title">
              <span class="modal-title-dot"></span>
              <h3>{{ title }}</h3>
            </div>
            <button class="close-btn" @click="closeModal" aria-label="关闭模态框">
              &times;
            </button>
          </div>

          <!-- 主体内容，使用默认插槽 -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- 底部，使用具名插槽并提供默认内容 -->
          <div class="modal-footer">
            <slot name="footer">
              <button
                  class="btn-cancel"
                  @click="closeModal"
                  :disabled="cancelLoading"
              >
                <span v-if="cancelLoading" class="btn-spinner"></span>
                <span>取消</span>
              </button>
              <button
                  class="btn-confirm"
                  @click="confirmModal"
                  :disabled="confirmLoading"
              >
                <span v-if="confirmLoading" class="btn-spinner light"></span>
                <span>确定</span>
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {onBeforeUnmount, watch} from 'vue';
// 定义组件接口
interface Props {
  modelValue: boolean;   // 控制显示/隐藏，用于 v-model 双向绑定
  title?: string;        // 模态框标题
  width?: string;        // 模态框宽度，如 '600px' 或 '50%'
  closeOnClickOverlay?: boolean; // 点击遮罩层是否可关闭，默认为 true
  confirmLoading?: boolean; // 确认按钮 loading 状态
  cancelLoading?: boolean;  // 取消按钮 loading 状态
}

// 定义抛出的事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

// 接收 Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  width: '520px',
  cancelLoading: false,
  confirmLoading: false,
  closeOnClickOverlay: true
});

const emit = defineEmits<Emits>();

let bodyOverflowBackup: string | null = null;
const lockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  const {body} = document;
  if (bodyOverflowBackup === null) {
    bodyOverflowBackup = body.style.overflow || '';
  }
  body.style.overflow = 'hidden';
};

const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  const {body} = document;
  if (bodyOverflowBackup !== null) {
    body.style.overflow = bodyOverflowBackup;
    bodyOverflowBackup = null;
  } else {
    body.style.overflow = '';
  }
};

watch(() => props.modelValue, (visible) => {
  if (visible) {
    lockBodyScroll();
  } else {
    unlockBodyScroll();
  }
}, {immediate: true});

onBeforeUnmount(() => {
  unlockBodyScroll();
});

// 关闭模态框
const closeModal = () => {
  emit('update:modelValue', false);
  emit('cancel'); // 触发取消事件
};

// 确认操作
const confirmModal = () => {
  emit('confirm'); // 触发确认事件
  // 通常确认后需要关闭模态框，可根据业务需求决定是否在此处关闭
  // emit('update:modelValue', false);
};

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    closeModal();
  }
};

// 可选：监听键盘事件，按 ESC 键关闭
// 需要在父组件或此组件内动态添加/移除监听器，这里提供一个思路
// 可以在 watch 中监听 modelValue 的变化，来添加/移除 keydown 事件监听
</script>

<style lang="scss" scoped>
:global(:root) {
  --modal-surface: #ffffff;
  --modal-muted: #f5f5f7;
  --modal-border: rgba(15, 23, 42, 0.08);
  --modal-text: #213547;
  --modal-subtle: #6b7280;
  --modal-accent: #646cff;
  --modal-accent-strong: #535bf2;
}

@media (prefers-color-scheme: dark) {
  :global(:root) {
    --modal-surface: #1f2432;
    --modal-muted: #2a3142;
    --modal-border: rgba(255, 255, 255, 0.08);
    --modal-text: #f5f7fb;
    --modal-subtle: #bcc4d7;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  padding: 20px;
  box-sizing: border-box;
}

.modal-container {
  background: var(--modal-surface);
  border-radius: 16px;
  border: 1px solid var(--modal-border);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
  max-width: 90vw;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.modal-accent {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(100, 108, 255, 0.08), transparent 60%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 10px;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--modal-accent);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--modal-text);
  letter-spacing: 0.2px;
}

.close-btn {
  background: transparent;
  border: 1px solid transparent;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--modal-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  border-color: var(--modal-accent);
  color: var(--modal-accent);
  background: rgba(100, 108, 255, 0.08);
}

.modal-body {
  padding: 0 24px 20px;
  flex-grow: 1;
  overflow-y: auto;
  color: var(--modal-subtle);
}

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: var(--modal-muted);
  border-top: 1px solid var(--modal-border);
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  color: var(--modal-subtle);
  background: transparent;
  border-color: var(--modal-border);
}

.btn-cancel:hover {
  color: var(--modal-text);
  border-color: var(--modal-accent);
}

.btn-confirm {
  background: var(--modal-accent);
  color: #fff;
  border: none;
  box-shadow: 0 10px 20px rgba(83, 91, 242, 0.25);
  

}
.btn-cancel:disabled,
.btn-confirm:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(100, 108, 255, 0.25);
  border-top-color: var(--modal-accent);
  animation: modal-btn-spin 0.7s linear infinite;
}

.btn-spinner.light {
  border-color: rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
}

@keyframes modal-btn-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.btn-confirm:hover {
  background: var(--modal-accent-strong);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

@media (max-width: 600px) {
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>