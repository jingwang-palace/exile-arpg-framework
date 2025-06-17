<!-- 通用弹框组件 -->
<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div 
        v-if="isVisible" 
        class="modal-overlay"
        @click="handleOverlayClick"
      >
        <div 
          class="modal-container"
          :class="[
            `modal-${type}`,
            `modal-${size}`,
            { 'modal-closable': closable }
          ]"
          @click.stop
        >
          <!-- 头部 -->
          <div class="modal-header" v-if="showHeader">
            <div class="modal-title">
              <Icon v-if="icon" :name="icon" class="modal-icon" />
              <h3>{{ title }}</h3>
            </div>
            <button 
              v-if="closable"
              class="modal-close"
              @click="handleClose"
              aria-label="关闭"
            >
              <Icon name="close" />
            </button>
          </div>

          <!-- 内容区域 -->
          <div class="modal-body">
            <slot name="content">
              <div class="modal-message" v-if="message">
                {{ message }}
              </div>
            </slot>
          </div>

          <!-- 底部操作区 -->
          <div class="modal-footer" v-if="showFooter">
            <slot name="footer">
              <div class="modal-actions">
                <Button
                  v-if="showCancelButton"
                  variant="secondary"
                  @click="handleCancel"
                  :disabled="loading"
                >
                  {{ cancelText }}
                </Button>
                <Button
                  v-if="showConfirmButton"
                  :variant="confirmVariant"
                  @click="handleConfirm"
                  :loading="loading"
                >
                  {{ confirmText }}
                </Button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, nextTick } from 'vue'
import Icon from './Icon.vue'
import Button from './Button.vue'

export interface ModalDialogProps {
  // 显示控制
  modelValue: boolean
  
  // 基本属性
  title?: string
  message?: string
  icon?: string
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'custom'
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  
  // 行为控制
  closable?: boolean
  maskClosable?: boolean
  escClosable?: boolean
  showHeader?: boolean
  showFooter?: boolean
  
  // 按钮配置
  showConfirmButton?: boolean
  showCancelButton?: boolean
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'success' | 'warning' | 'danger'
  
  // 状态
  loading?: boolean
  
  // 回调函数
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  onClose?: () => void
}

const props = withDefaults(defineProps<ModalDialogProps>(), {
  type: 'info',
  size: 'medium',
  closable: true,
  maskClosable: true,
  escClosable: true,
  showHeader: true,
  showFooter: true,
  showConfirmButton: true,
  showCancelButton: false,
  confirmText: '确定',
  cancelText: '取消',
  confirmVariant: 'primary',
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
  'close': []
}>()

// 计算属性
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 处理函数
const handleClose = () => {
  isVisible.value = false
  emit('close')
  props.onClose?.()
}

const handleOverlayClick = () => {
  if (props.maskClosable && props.closable) {
    handleClose()
  }
}

const handleConfirm = async () => {
  try {
    if (props.onConfirm) {
      await props.onConfirm()
    }
    emit('confirm')
    if (!props.loading) {
      handleClose()
    }
  } catch (error) {
    console.error('确认操作失败:', error)
  }
}

const handleCancel = () => {
  emit('cancel')
  props.onCancel?.()
  handleClose()
}

// ESC键关闭
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.escClosable && props.closable) {
    handleClose()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  // 防止背景滚动
  if (isVisible.value) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

// 监听显示状态变化
watch(isVisible, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%);
  border-radius: 12px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 2px solid #444;
  overflow: hidden;
  max-height: 90vh;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
}

/* 尺寸变体 */
.modal-small {
  width: 400px;
  min-height: 200px;
}

.modal-medium {
  width: 600px;
  min-height: 300px;
}

.modal-large {
  width: 800px;
  min-height: 500px;
}

.modal-fullscreen {
  width: 95vw;
  height: 95vh;
}

/* 类型变体 */
.modal-info .modal-header {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.modal-success .modal-header {
  background: linear-gradient(135deg, #27ae60, #229954);
}

.modal-warning .modal-header {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.modal-error .modal-header {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.modal-confirm .modal-header {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.modal-header {
  padding: 20px 24px 16px;
  background: linear-gradient(135deg, #555, #333);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #444;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
}

.modal-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-icon {
  font-size: 20px;
  color: #fff;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: scale(1.1);
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  color: #e0e0e0;
}

.modal-message {
  font-size: 16px;
  line-height: 1.5;
  text-align: center;
}

.modal-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid #444;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 动画效果 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-container {
    width: 95vw !important;
    max-height: 90vh;
    margin: 20px;
  }
  
  .modal-header {
    padding: 16px 20px 12px;
  }
  
  .modal-title h3 {
    font-size: 16px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 12px 20px 20px;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
}

/* 像素风主题 */
.pixel-theme .modal-container {
  border-radius: 0;
  background: #2a2a2a;
  border: 3px solid #00ff88;
  box-shadow: 
    0 0 20px rgba(0, 255, 136, 0.3),
    inset 0 0 20px rgba(0, 255, 136, 0.1);
}

.pixel-theme .modal-header {
  background: #1a1a2e;
  border-bottom: 2px solid #00ff88;
}

.pixel-theme .modal-title h3 {
  font-family: 'Courier New', monospace;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.pixel-theme .modal-close {
  border: 1px solid #00ff88;
  color: #00ff88;
}

.pixel-theme .modal-close:hover {
  background: rgba(0, 255, 136, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}
</style> 