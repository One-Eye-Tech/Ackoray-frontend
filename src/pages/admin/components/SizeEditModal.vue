<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3 class="modal-title">{{ isEditMode ? '编辑尺码' : '添加新尺码' }}</h3>
      
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="sizeName">尺码名称:</label>
          <input type="text" id="sizeName" v-model="formData.name" required class="form-control">
        </div>

        <div class="form-group">
          <label for="sizeOrderIndex">排序索引:</label>
          <input type="number" id="sizeOrderIndex" v-model.number="formData.orderIndex" placeholder="例如: 0, 1, 2..." class="form-control">
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn btn-outline">取消</button>
          <button type="submit" class="btn btn-primary">{{ isEditMode ? '保存更改' : '创建尺码' }}</button>
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
  sizeData: { 
    type: Object,
    default: null // Expects { name, orderIndex } for add, { id, name, orderIndex } for edit
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const defaultFormData = () => ({
  name: '',
  orderIndex: 0 // Default orderIndex to 0 for new sizes
});

const formData = ref(defaultFormData());

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.isEditMode && props.sizeData) {
      formData.value = { 
        id: props.sizeData.id, 
        name: props.sizeData.name || '',
        orderIndex: props.sizeData.orderIndex !== undefined ? props.sizeData.orderIndex : 0
      };
    } else if (!props.isEditMode && props.sizeData) { // For add mode, prefill from props.sizeData
       formData.value = {
        name: props.sizeData.name || '',
        orderIndex: props.sizeData.orderIndex !== undefined ? props.sizeData.orderIndex : 0
      };
    } else {
      formData.value = defaultFormData();
    }
    nextTick(() => {
      const firstInput = document.querySelector('#sizeName');
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
    alert('尺码名称不能为空。');
    return;
  }
  if (typeof formData.value.orderIndex !== 'number' || formData.value.orderIndex < 0) {
    alert('排序索引必须是一个非负数字。');
    return;
  }
  
  const dataToSave = { 
    name: formData.value.name,
    orderIndex: formData.value.orderIndex 
  };
  if (props.isEditMode && formData.value.id) { 
    dataToSave.id = formData.value.id;
  }
  
  emit('save', dataToSave);
};

</script>

<style scoped>
/* Styles can be copied from ColorEditModal.vue or made global */
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
  z-index: 1000;
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