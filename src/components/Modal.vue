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

          <!-- 头部 -->
          <div class="modal-header">
            <h3>{{ title }}</h3>
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
              <button class="btn-cancel" @click="closeModal">取消</button>
              <button class="btn-confirm" @click="confirmModal">确定</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
// 定义组件接口
interface Props {
  modelValue: boolean;   // 控制显示/隐藏，用于 v-model 双向绑定
  title?: string;        // 模态框标题
  width?: string;        // 模态框宽度，如 '600px' 或 '50%'
  closeOnClickOverlay?: boolean; // 点击遮罩层是否可关闭，默认为 true
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
  closeOnClickOverlay: true
});

const emit = defineEmits<Emits>();

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

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明遮罩 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 90vw; /* 响应式设计，避免在小屏幕上溢出 */
  max-height: 80vh; /* 限制最大高度 */
  overflow: hidden; /* 确保子元素圆角不被破坏 */
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2em;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto; /* 内容过长时允许滚动 */
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px; /* 按钮间距 */
}

.btn-cancel, .btn-confirm {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
}

.btn-confirm {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

/* 进入和离开的过渡效果 */
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.3s ease;
}
</style>