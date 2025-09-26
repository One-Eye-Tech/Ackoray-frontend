<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content card">
      <h3>{{ title }}</h3>
      <div class="form-group">
        <label for="trackingNumber">物流单号:</label>
        <input type="text" id="trackingNumber" v-model="localTrackingNumber" class="modal-input" placeholder="请输入物流单号">
      </div>
      <div class="form-group">
        <label for="shippingCarrier">物流公司:</label>
        <input type="text" id="shippingCarrier" v-model="localShippingCarrier" class="modal-input" placeholder="请输入物流公司">
      </div>
      <div class="modal-actions">
        <button @click="confirmAction" class="btn btn-primary">确认</button>
        <button @click="closeModal" class="btn btn-outline">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean, // 控制模态框显示隐藏
  title: { type: String, default: '填写物流信息' },
  initialTrackingNumber: { type: String, default: '' },
  initialShippingCarrier: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const localTrackingNumber = ref(props.initialTrackingNumber);
const localShippingCarrier = ref(props.initialShippingCarrier);

// 监听 prop 变化以更新本地值
watch(() => props.initialTrackingNumber, (newValue) => {
  localTrackingNumber.value = newValue;
});
watch(() => props.initialShippingCarrier, (newValue) => {
  localShippingCarrier.value = newValue;
});

// 在模态框显示时，重置本地值（如果需要，或者从 props 初始化）
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    localTrackingNumber.value = props.initialTrackingNumber;
    localShippingCarrier.value = props.initialShippingCarrier;
  }
});

const confirmAction = () => {
  emit('confirm', { trackingNumber: localTrackingNumber.value, shippingCarrier: localShippingCarrier.value });
  closeModal();
};

const closeModal = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-card);
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  color: var(--color-text);
}

.modal-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.modal-input {
  width: calc(100% - 20px); /* Adjust for padding */
  padding: 0.75rem 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-card);
  color: var(--color-text);
  font-size: 1rem;
}

.modal-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.modal-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Inherit base button styles from AdminOrderDetailPage if possible, or define here */
.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
}
.btn-primary:hover { background-color: var(--color-primary-hover); }

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-text-secondary);
  color: var(--color-text-secondary);
}
.btn-outline:hover {
  background-color: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-text-secondary);
}
</style> 