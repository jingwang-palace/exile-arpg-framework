<template>
  <Modal @close="$emit('close')">
    <template #title>{{ t('game.menus.inventory') }}</template>
    
    <div class="space-y-6">
      <!-- 背包容量信息 -->
      <div class="flex justify-between items-center px-4 py-2 bg-background-tertiary rounded-lg">
        <span class="text-text-secondary">
          {{ t('inventory.slots', { 
            current: filledSlots,
            max: inventory.size 
          }) }}
        </span>
        <span class="text-text-secondary">
          {{ t('inventory.gold', { amount: inventory.gold }) }}
        </span>
      </div>

      <!-- 背包网格 -->
      <div class="grid grid-cols-6 gap-2">
        <div 
          v-for="slot in inventory.slots" 
          :key="slot.id"
          class="relative group"
        >
          <!-- 物品槽 -->
          <div 
            class="w-16 h-16 border border-border-primary rounded-lg bg-background-tertiary 
                   hover:border-primary transition-colors duration-200 flex items-center justify-center"
            :class="{
              'cursor-pointer': slot.itemId,
              'opacity-50': slot.locked
            }"
            @click="slot.itemId && selectSlot(slot)"
          >
            <template v-if="slot.itemId && getItem(slot.itemId)">
              <!-- 物品图标 -->
              <div class="text-2xl">
                {{ getItemIcon(slot.itemId) }}
              </div>
              
              <!-- 物品数量 -->
              <div 
                v-if="slot.quantity > 1"
                class="absolute bottom-1 right-1 text-xs bg-background-primary 
                       px-1 rounded text-text-secondary"
              >
                {{ slot.quantity }}
              </div>
            </template>
          </div>

          <!-- 物品信息提示 -->
          <div 
            v-if="slot.itemId && getItem(slot.itemId)"
            class="absolute z-10 w-64 p-3 bg-background-secondary border border-border-primary 
                   rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity
                   pointer-events-none left-full ml-2"
          >
            <div class="space-y-2">
              <!-- 物品名称和类型 -->
              <div :class="getQualityClass(getItem(slot.itemId)?.quality)">
                {{ getItem(slot.itemId)?.name }}
                <span class="text-xs text-text-secondary ml-1">
                  {{ t(`itemTypes.${getItem(slot.itemId)?.type}`) }}
                </span>
              </div>
              
              <!-- 物品描述 -->
              <div class="text-sm text-text-secondary">
                {{ getItem(slot.itemId)?.description }}
              </div>

              <!-- 装备属性 -->
              <div v-if="isEquipment(getItem(slot.itemId))" class="space-y-1 pt-2 border-t border-border-primary">
                <div v-for="(value, attr) in (getItem(slot.itemId) as Equipment).attributes" 
                     :key="attr"
                     class="text-sm"
                >
                  <span class="text-text-secondary">{{ t(`attributes.${attr}`) }}:</span>
                  <span class="text-text-primary ml-1">+{{ value }}</span>
                </div>
              </div>

              <!-- 消耗品效果 -->
              <div v-if="isConsumable(getItem(slot.itemId))" class="space-y-1 pt-2 border-t border-border-primary">
                <div v-for="(effect, index) in (getItem(slot.itemId) as Consumable).effects" 
                     :key="index"
                     class="text-sm text-text-secondary"
                >
                  {{ t(`effects.${effect.type}`, { value: effect.value }) }}
                  <span v-if="effect.duration" class="text-xs">
                    ({{ t('effects.duration', { seconds: effect.duration }) }})
                  </span>
                </div>
              </div>

              <!-- 物品价值 -->
              <div class="text-xs text-text-secondary pt-2 border-t border-border-primary">
                {{ t('item.sellPrice', { price: getItem(slot.itemId)?.sellPrice }) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 选中物品的操作面板 -->
      <div 
        v-if="selectedSlot"
        class="fixed bottom-0 left-1/2 transform -translate-x-1/2 mb-4 
               bg-background-secondary border border-border-primary rounded-lg p-4 shadow-lg"
      >
        <div class="flex space-x-4">
          <button 
            v-if="isConsumable(getItem(selectedSlot.itemId))"
            class="btn-primary text-sm"
            @click="useItem(selectedSlot)"
          >
            {{ t('inventory.actions.use') }}
          </button>
          <button 
            v-if="isEquipment(getItem(selectedSlot.itemId))"
            class="btn-primary text-sm"
            @click="equipItem(selectedSlot)"
          >
            {{ t('inventory.actions.equip') }}
          </button>
          <button 
            class="btn-secondary text-sm"
            @click="dropItem(selectedSlot)"
          >
            {{ t('inventory.actions.drop') }}
          </button>
          <button 
            class="btn-danger text-sm"
            @click="selectedSlot = null"
          >
            {{ t('inventory.actions.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/common/Modal.vue'
import { useInventoryStore } from '@/stores/inventory'
import { useItemStore } from '@/stores/item'
import { useEquipmentStore } from '@/stores/equipment'
import { useCharacterStore } from '@/stores/character'
import type { InventorySlot } from '@/types/inventory'
import type { Equipment, Consumable } from '@/types/item'
import { ItemQuality, ItemType } from '@/types/item'

const { t } = useI18n()
const inventoryStore = useInventoryStore()
const itemStore = useItemStore()
const equipmentStore = useEquipmentStore()
const characterStore = useCharacterStore()

// 获取当前角色的背包数据
const inventory = computed(() => {
  const character = characterStore.currentCharacter
  if (!character) return inventoryStore

  return {
    size: character.inventory.size,
    gold: character.inventory.gold,
    slots: character.inventory.slots
  }
})

const selectedSlot = ref<InventorySlot | null>(null)

// 计算已使用的格子数
const filledSlots = computed(() => {
  const character = characterStore.currentCharacter
  if (!character) return 0
  
  return character.inventory.slots.filter(slot => slot.itemId !== null).length
})

// 获取物品信息
const getItem = (itemId: string | null) => {
  if (!itemId) return null
  return itemStore.getItem(itemId)
}

// 类型判断
const isEquipment = (item: any): item is Equipment => {
  return item?.type === ItemType.WEAPON || 
         item?.type === ItemType.ARMOR || 
         item?.type === ItemType.ACCESSORY
}

const isConsumable = (item: any): item is Consumable => {
  return item?.type === ItemType.CONSUMABLE
}

// 获取品质样式
const getQualityClass = (quality?: ItemQuality) => {
  const qualityClasses = {
    [ItemQuality.COMMON]: 'text-gray-200',
    [ItemQuality.UNCOMMON]: 'text-green-400',
    [ItemQuality.RARE]: 'text-blue-400',
    [ItemQuality.EPIC]: 'text-purple-400',
    [ItemQuality.LEGENDARY]: 'text-yellow-400'
  }
  return qualityClasses[quality || ItemQuality.COMMON]
}

// 物品操作方法
const selectSlot = (slot: InventorySlot) => {
  selectedSlot.value = slot
}

const useItem = (slot: InventorySlot) => {
  if (slot.itemId) {
    const result = inventoryStore.removeFromSlot(slot.id, 1)
    if (result.success) {
      itemStore.useItem(slot.itemId)
    }
  }
  selectedSlot.value = null
}

const equipItem = (slot: InventorySlot) => {
  if (!slot.itemId) return
  
  const item = itemStore.getItem(slot.itemId) as Equipment
  if (!item?.slot) return

  // 尝试装备物品
  const { success, previousItemId } = equipmentStore.equipItem(slot.itemId)
  
  if (success) {
    // 从背包中移除已装备的物品
    inventoryStore.removeFromSlot(slot.id, 1)
    
    // 如果有之前装备的物品，将其放回背包
    if (previousItemId) {
      const emptySlot = inventory.value.slots.find(s => !s.itemId)
      if (emptySlot) {
        inventoryStore.addToSlot(emptySlot.id, previousItemId, 1)
      }
    }
  }
  
  selectedSlot.value = null
}

const dropItem = (slot: InventorySlot) => {
  if (slot.itemId && confirm(t('inventory.confirmDrop'))) {
    inventoryStore.removeFromSlot(slot.id, slot.quantity)
    selectedSlot.value = null
  }
}

// 添加获取物品图标的方法
const getItemIcon = (itemId: string) => {
  const item = itemStore.getItem(itemId)
  return item?.icon || '📦' // 如果没有图标则显示默认箱子图标
}

defineEmits(['close'])
</script>

<style scoped>
.btn-primary, .btn-secondary, .btn-danger {
  @apply px-4 py-2 rounded transition-colors duration-200;
}
</style> 