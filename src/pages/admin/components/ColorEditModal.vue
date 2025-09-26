<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3 class="modal-title">{{ isEditMode ? '编辑颜色' : '添加新颜色' }}</h3>
      
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="colorName">颜色名称:</label>
          <input type="text" id="colorName" v-model="formData.name" required class="form-control">
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn btn-outline">取消</button>
          <button type="submit" class="btn btn-primary">{{ isEditMode ? '保存更改' : '创建颜色' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, nextTick } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  colorData: { // For editing, now expects { id, name } or just { name } for add
    type: Object,
    default: null
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const defaultFormData = () => ({
  name: ''
  // value: '' // Removed value
});

const formData = ref(defaultFormData());

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.isEditMode && props.colorData) {
      // formData.value = { ...props.colorData }; // spread operator might bring in 'value' if parent not careful
      formData.value = { 
        id: props.colorData.id, // Keep id for updates
        name: props.colorData.name || ''
        // value: props.colorData.value || '' // Ensure value is not set
      };
    } else {
      formData.value = defaultFormData();
    }
    nextTick(() => {
      const firstInput = document.querySelector('#colorName');
      if (firstInput) {
        firstInput.focus();
      }
    });
  }
});

const closeModal = () => {
  emit('close');
};

const submitForm = () => {
  if (!formData.value.name.trim()) {
    alert('颜色名称不能为空。');
    return;
  }
  
  // Emit only necessary data, primarily name and id if editing
  const dataToSave = { name: formData.value.name };
  if (props.isEditMode && formData.value.id) {
    dataToSave.id = formData.value.id;
  }
  
  emit('save', dataToSave);
};

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's above other content */
}

.modal-content {
  background-color: var(--color-card);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 100%;
  max-width: 450px;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-text);
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.form-control {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-card);
  color: var(--color-text);
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.3);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.btn-outline {
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}
.btn-outline:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text);
  background-color: var(--color-surface);
}

.btn-primary {
  background-color: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-button-primary-text);
}
.btn-primary:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}
</style> 