<template>
  <div v-if="show" class="modal-overlay" @click.self="cancel">
    <div class="modal-panel confirmation-modal-panel">
      <h3 class="modal-title">{{ title }}</h3>
      <!-- 如图所示，删除确认框中第二行二级标签 -->
      <!-- <p class="modal-message">{{ message }}</p> -->
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" @click="cancel">{{ cancelButtonText }}</button>
        <button type="button" class="btn btn-primary" @click="confirm">{{ confirmButtonText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    default: '您确定要执行此操作吗？'
  },
  confirmButtonText: {
    type: String,
    default: '确认'
  },
  cancelButtonText: {
    type: String,
    default: '取消'
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => {
  emit('confirm');
};

const cancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7); /* 更深的背景 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-panel.confirmation-modal-panel {
  background: var(--color-card-background-deep, #121212); /* 继承UserProfilePage.vue的深色背景 */
  color: var(--color-text-input, #E0E0E0);
  border-radius: 8px;
  padding: 20px; /* 缩小内边距 */
  min-width: 300px; /* 缩小最小宽度 */
  max-width: 300px; /* 缩小最大宽度 */
  width: 90vw;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); /* 更明显的阴影 */
  border: 1px solid var(--color-border-subtle, #2C2C2E);
  text-align: center; /* 文本居中 */
}

.confirmation-modal-panel .modal-title {
  font-size: 1.4rem; /* 标题更大 */
  font-weight: 600;
  margin-bottom: 1.5rem; /* 标题与按钮组的间距 */
  color: var(--color-text-primary, #ffffff);
}

/* modal-message 已被移除，因此这部分样式将不再生效 */
.confirmation-modal-panel .modal-message {
  font-size: 1rem;
  color: var(--color-text-secondary, #b0b0b0);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.confirmation-modal-panel .modal-actions {
  display: flex;
  justify-content: center; /* 按钮靠左靠右对齐 */
  gap: 4rem;
  margin-top: 0rem; /* 调整为0，因为移除了message，让按钮组更靠近标题 */
  padding-top: 1rem;
  border-top: none; /* 移除分隔线 */
}

.confirmation-modal-panel .modal-actions .btn {
  padding: 0.5rem 1.2rem; /* 按钮缩小 */
  border-radius: 8px;
  font-weight: 500; /* 按钮文字更细 */
  font-size: 0.85rem; /* 按钮字体缩小 */
}

/* 按钮颜色继承UserProfilePage.vue中的定义 */
.confirmation-modal-panel .modal-actions .btn-secondary {
  background-color: transparent; /* 背景透明 */
  color: var(--color-text-secondary, #b0b0b0);
  border: 1px solid var(--color-border-input, #3F3F46); /* 添加细小描边 */
}
.confirmation-modal-panel .modal-actions .btn-secondary:hover {
  background-color: transparent; /* Changed from #252527 to transparent */
  border-color: var(--color-text-secondary, #b0b0b0);
  color: var(--color-text-primary, #ffffff);
}

.confirmation-modal-panel .modal-actions .btn-primary {
  background-color: var(--color-accent, #007AFF);
  color: #fff;
  border: none; /* 主按钮无边框 */
}
.confirmation-modal-panel .modal-actions .btn-primary:hover {
  background-color: var(--color-accent-hover, #005ECB);
}
</style>