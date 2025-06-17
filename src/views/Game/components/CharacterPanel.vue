<template>
  <Modal @close="$emit('close')">
    <template #title>{{ t('game.menus.character') }}</template>
    
    <div class="space-y-6">
      <!-- 角色基本信息 -->
      <div class="flex items-center space-x-4 p-4 bg-background-tertiary rounded-lg">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-text-primary">{{ character?.name }}</h3>
          <div class="flex space-x-4 mt-2">
            <span class="text-text-secondary">
              {{ t(`character.classes.${character?.class}.name`) }}
            </span>
            <span class="text-text-secondary">
              {{ t('character.level', { level: character?.level }) }}
            </span>
          </div>
        </div>
        <!-- 经验条 -->
        <div class="w-48">
          <div class="text-xs text-text-secondary mb-1">
            {{ t('character.experience', { 
              current: character?.experience?.current || 0,
              next: character?.experience?.next || 0
            }) }}
          </div>
          <div class="w-full h-2 bg-background-primary rounded-full">
            <div 
              class="h-full bg-primary rounded-full" 
              :style="{
                width: `${((character?.experience?.current || 0) / (character?.experience?.next || 1)) * 100}%`
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 属性和状态 -->
      <div class="grid grid-cols-2 gap-6">
        <!-- 基础属性 -->
        <div class="space-y-4">
          <h4 class="text-lg font-medium text-text-primary border-b border-border-primary pb-2">
            {{ t('character.attributes.title') }}
          </h4>
          <div class="space-y-3">
            <div 
              v-for="attr in character?.attributes" 
              :key="attr.name" 
              class="flex justify-between items-center p-3 hover:bg-background-tertiary rounded"
            >
              <span class="text-text-secondary">{{ t(`character.attributes.${attr.name}`) }}</span>
              <div class="flex items-center space-x-2">
                <span class="text-text-primary font-medium">{{ attr.value }}</span>
                <span 
                  v-if="attr.bonus" 
                  class="text-xs text-green-400"
                >+{{ attr.bonus }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 衍生属性 -->
        <div class="space-y-4">
          <h4 class="text-lg font-medium text-text-primary border-b border-border-primary pb-2">
            {{ t('character.derived.title') }}
          </h4>
          <div class="space-y-3">
            <div 
              v-for="(value, key) in character?.derivedAttributes" 
              :key="key" 
              class="flex justify-between items-center p-3 hover:bg-background-tertiary rounded"
            >
              <span class="text-text-secondary">{{ t(`character.derived.${key}`) }}</span>
              <span class="text-text-primary font-medium">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 状态效果 -->
      <div v-if="character?.effects?.length" class="space-y-4">
        <h4 class="text-lg font-medium text-text-primary border-b border-border-primary pb-2">
          {{ t('character.effects.title') }}
        </h4>
        <div class="grid grid-cols-2 gap-4">
          <div 
            v-for="effect in character.effects" 
            :key="effect.id"
            class="flex items-center space-x-3 p-2 bg-background-tertiary rounded"
          >
            <div class="w-8 h-8 rounded bg-background-primary flex items-center justify-center">
              <span class="text-lg">{{ effect.icon }}</span>
            </div>
            <div class="flex-1">
              <div class="text-text-primary font-medium">{{ effect.name }}</div>
              <div class="text-xs text-text-secondary">{{ effect.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { computed } from 'vue'
import Modal from '@/components/common/Modal.vue'

const { t } = useI18n()
const characterStore = useCharacterStore()
const character = computed(() => characterStore.currentCharacter)

defineEmits(['close'])
</script> 