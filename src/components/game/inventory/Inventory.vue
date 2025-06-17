<template>
  <div class="inventory-container" v-if="inventory">
    <div class="inventory-header">
      <h2>{{ t('inventory.title') }}</h2>
      <div class="inventory-info">
        <div class="gold">
          <i class="fas fa-coins text-yellow-500"></i>
          {{ inventory.gold || 0 }}
        </div>
        <div class="slots">
          {{ t('inventory.slots', { 
            current: usedSlots,
            max: inventory.size 
          }) }}
        </div>
      </div>
    </div>

    <div class="inventory-grid">
      <InventorySlot
        v-for="slot in inventory.slots"
        :key="slot.id"
        :slot="slot"
        :show-tooltip="true"
        @click="onSlotClick(slot)"
        @right-click="onSlotRightClick(slot)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Inventory, InventorySlot as IInventorySlot } from '@/types/inventory'
import InventorySlot from './InventorySlot.vue'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  inventory?: Inventory
}>(), {
  inventory: undefined
})

const emit = defineEmits<{
  (e: 'slotClick', slot: IInventorySlot): void
  (e: 'slotRightClick', slot: IInventorySlot): void
}>()

const usedSlots = computed(() => 
  props.inventory?.slots?.filter(slot => slot.itemId !== null).length || 0
)

const onSlotClick = (slot: IInventorySlot) => {
  emit('slotClick', slot)
}

const onSlotRightClick = (slot: IInventorySlot) => {
  emit('slotRightClick', slot)
}
</script>

<style scoped>
.inventory-container {
  @apply bg-gray-900 border border-gray-700 rounded-lg p-4 w-96;
}

.inventory-header {
  @apply flex justify-between items-center mb-4;
}

.inventory-header h2 {
  @apply text-xl font-bold text-gray-200;
}

.inventory-info {
  @apply flex items-center space-x-4 text-sm text-gray-400;
}

.gold {
  @apply flex items-center space-x-1;
}

.inventory-grid {
  @apply grid grid-cols-6 gap-1;
}
</style> 