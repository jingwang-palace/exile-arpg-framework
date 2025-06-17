<template>
  <Modal @close="$emit('close')">
    <template #title>{{ t('game.menus.skills') }}</template>
    
    <div class="space-y-4">
      <!-- 技能列表 -->
      <div class="grid gap-4">
        <!-- 这里添加技能列表 -->
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Modal from '@/components/common/Modal.vue'

const { t } = useI18n()

defineEmits(['close'])
</script> 