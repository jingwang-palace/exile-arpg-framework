<template>
  <Modal @close="$emit('close')">
    <template #title>{{ t('game.menus.equipment') }}</template>
    
    <div class="space-y-6">
      <!-- 角色属性总览 -->
      <div class="p-4 bg-background-tertiary rounded-lg">
        <h3 class="text-lg font-medium text-text-primary mb-3">
          {{ t('equipment.totalAttributes') }}
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div 
            v-for="(value, attr) in equipmentStore.totalAttributes" 
            :key="attr"
            class="flex justify-between"
          >
            <span class="text-text-secondary">{{ t(`attributes.${attr}`) }}</span>
            <span class="text-text-primary">+{{ value }}</span>
          </div>
        </div>
      </div>

      <!-- 装备槽位 -->
      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="slot in equipmentSlots" 
          :key="slot"
          class="relative group"
        >
          <!-- 装备槽 -->
          <div 
            class="w-20 h-20 border border-border-primary rounded-lg bg-background-tertiary 
                   hover:border-primary transition-colors duration-200 flex flex-col 
                   items-center justify-center gap-2"
            :class="{ 'cursor-pointer': equipmentStore.getEquippedItem(slot) }"
            @click="handleSlotClick(slot)"
          >
            <!-- 槽位名称 -->
            <div class="text-xs text-text-secondary">
              {{ t(`equipment.slots.${slot}`) }}
            </div>

            <!-- 装备图标 -->
            <template v-if="getEquippedItem(slot)">
              <div class="text-2xl">
                {{ getEquippedItem(slot)?.icon }}
              </div>
            </template>
          </div>

          <!-- 装备信息提示 -->
          <div 
            v-if="getEquippedItem(slot)"
            class="absolute z-10 w-64 p-3 bg-background-secondary border border-border-primary 
                   rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity
                   pointer-events-none left-full ml-2"
          >
            <div class="space-y-2">
              <!-- 装备名称和类型 -->
              <div :class="getQualityClass(getEquippedItem(slot)?.quality)">
                {{ getEquippedItem(slot)?.name }}
                <span class="text-xs text-text-secondary ml-1">
                  {{ t(`itemTypes.${getEquippedItem(slot)?.type}`) }}
                </span>
              </div>
              
              <!-- 装备描述 -->
              <div class="text-sm text-text-secondary">
                {{ getEquippedItem(slot)?.description }}
              </div>

              <!-- 装备属性 -->
              <div class="space-y-1 pt-2 border-t border-border-primary">
                <div 
                  v-for="(value, attr) in (getEquippedItem(slot) as Equipment)?.attributes" 
                  :key="attr"
                  class="text-sm"
                >
                  <span class="text-text-secondary">{{ t(`attributes.${attr}`) }}:</span>
                  <span class="text-text-primary ml-1">+{{ value }}</span>
                </div>
              </div>

              <!-- 装备等级 -->
              <div class="text-xs text-text-secondary pt-2 border-t border-border-primary">
                {{ t('equipment.level', { level: (getEquippedItem(slot) as Equipment)?.level }) }}
              </div>

              <!-- 品质显示 -->
              <div v-if="getEquippedItem(slot)?.quality > 0" class="text-blue-400">
                品质: +{{ getEquippedItem(slot)?.quality }}%
              </div>

              <!-- 隐式词缀 -->
              <div v-if="getEquippedItem(slot)?.implicitMods.length" class="text-gray-400">
                <div v-for="mod in getEquippedItem(slot)?.implicitMods" :key="mod.id">
                  {{ formatModDescription(mod) }}
                </div>
              </div>

              <!-- 显式词缀 -->
              <div v-if="getEquippedItem(slot)?.explicitMods.length" class="text-blue-300">
                <div v-for="mod in getEquippedItem(slot)?.explicitMods" :key="mod.id">
                  {{ formatModDescription(mod) }}
                </div>
              </div>

              <!-- 物品等级 -->
              <div class="text-xs text-gray-500">
                物品等级: {{ getEquippedItem(slot)?.itemLevel }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/common/Modal.vue'
import { useEquipmentStore } from '@/stores/equipment'
import { useItemStore } from '@/stores/item'
import { useInventoryStore } from '@/stores/inventory'
import { EquipmentSlot, ItemQuality, Mod } from '@/types/item'
import type { Equipment } from '@/types/item'

const { t } = useI18n()
const equipmentStore = useEquipmentStore()
const itemStore = useItemStore()
const inventoryStore = useInventoryStore()

const equipmentSlots = Object.values(EquipmentSlot)

// 获取装备信息
const getEquippedItem = (slot: EquipmentSlot) => {
  const itemId = equipmentStore.getEquippedItem(slot)
  return itemId ? itemStore.getItem(itemId) : null
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

// 处理槽位点击
const handleSlotClick = (slot: EquipmentSlot) => {
  const itemId = equipmentStore.getEquippedItem(slot)
  if (itemId) {
    // 卸下装备
    equipmentStore.unequipItem(slot)
    // 将装备放回背包
    const emptySlot = inventoryStore.slots.find(s => !s.itemId)
    if (emptySlot) {
      inventoryStore.addToSlot(emptySlot.id, itemId, 1)
    }
  }
}

// 添加新的方法
const formatModDescription = (mod: Mod) => {
  let desc = mod.name
  mod.values.forEach((value, index) => {
    desc = desc.replace(`{${index}}`, value.toString())
  })
  return desc
}

defineEmits(['close'])
</script> 