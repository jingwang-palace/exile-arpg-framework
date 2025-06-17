<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-2xl rounded-lg bg-background-secondary p-6 shadow-xl">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-text-primary">
            <slot name="title"></slot>
          </h3>
          <button 
            @click="$emit('close')" 
            class="text-text-secondary hover:text-text-primary"
          >
            ✕
          </button>
        </div>
        
        <!-- 内容区 -->
        <div class="mt-2">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close'])
</script> 