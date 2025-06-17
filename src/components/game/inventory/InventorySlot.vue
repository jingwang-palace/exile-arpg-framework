<template>
  <div 
    class="inventory-slot"
    :class="{ 'is-empty': !hasItem, 'is-locked': locked }"
    @click="onClick"
    @contextmenu.prevent="onRightClick"
  >
    <template v-if="hasItem">
      <div class="item-icon" :class="qualityClass">
        <!-- TODO: 替换为实际的图标系统 -->
        <i :class="'fas fa-' + item.icon"></i>
      </div>
      <div v-if="showQuantity" class="item-quantity">
        {{ quantity }}
      </div>
      <div class="item-tooltip" v-if="showTooltip">
        <div class="tooltip-header" :class="qualityClass">
          {{ item.name }}
        </div>
        <div class="tooltip-type">
          {{ t(`itemTypes.${item.type}`) }}
        </div>
        <div class="tooltip-description">
          {{ item.description }}
        </div>
        <!-- 如果是装备，显示属性 -->
        <template v-if="isEquipment">
          <div class="tooltip-attributes">
            <div v-for="(value, key) in item.attributes" :key="key" class="attribute">
              {{ t(`attributes.${key}`) }}: +{{ value }}
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { InventorySlot } from '@/types/inventory'
import { itemService } from '@/services/ItemService'
import { ItemType } from '@/types/item'

const { t } = useI18n()

const props = defineProps<{
  slot: InventorySlot
  showTooltip?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', slot: InventorySlot): void
  (e: 'rightClick', slot: InventorySlot): void
}>()

const item = computed(() => {
  if (!props.slot.itemId) return null
  return itemService.getItem(props.slot.itemId)
})

const hasItem = computed(() => !!item.value)
const quantity = computed(() => props.slot.quantity)
const locked = computed(() => props.slot.locked)
const showQuantity = computed(() => hasItem.value && quantity.value > 1)
const isEquipment = computed(() => 
  item.value?.type === ItemType.WEAPON || 
  item.value?.type === ItemType.ARMOR || 
  item.value?.type === ItemType.ACCESSORY
)

const qualityClass = computed(() => {
  if (!item.value) return ''
  return `quality-${item.value.quality.toLowerCase()}`
})

const onClick = () => {
  emit('click', props.slot)
}

const onRightClick = () => {
  emit('rightClick', props.slot)
}
</script>

<style scoped>
.inventory-slot {
  @apply relative w-12 h-12 border border-gray-700 bg-gray-800 
         flex items-center justify-center cursor-pointer
         hover:border-gray-500 transition-colors duration-200;
}

.inventory-slot.is-empty {
  @apply bg-gray-900;
}

.inventory-slot.is-locked {
  @apply cursor-not-allowed opacity-50;
}

.item-icon {
  @apply w-10 h-10 flex items-center justify-center text-xl;
}

.item-quantity {
  @apply absolute bottom-0 right-0 text-xs bg-black bg-opacity-75
         px-1 rounded-tl text-white;
}

.item-tooltip {
  @apply absolute z-50 w-48 p-2 bg-gray-900 border border-gray-700
         rounded shadow-lg left-full ml-2 text-sm
         invisible opacity-0 transition-opacity duration-200;
}

.inventory-slot:hover .item-tooltip {
  @apply visible opacity-100;
}

.tooltip-header {
  @apply text-base font-bold mb-1;
}

.tooltip-type {
  @apply text-gray-400 text-xs mb-2;
}

.tooltip-description {
  @apply text-gray-300 mb-2;
}

.tooltip-attributes {
  @apply border-t border-gray-700 pt-2 text-xs;
}

.attribute {
  @apply text-blue-400;
}

/* 品质颜色 */
.quality-common { @apply text-gray-200; }
.quality-uncommon { @apply text-green-400; }
.quality-rare { @apply text-blue-400; }
.quality-epic { @apply text-purple-400; }
.quality-legendary { @apply text-yellow-400; }
</style> 