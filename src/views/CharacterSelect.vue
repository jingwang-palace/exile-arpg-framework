<template>
  <div class="character-select">
    <h1 class="title">选择角色</h1>
    
    <!-- 角色列表 -->
    <div class="character-list" v-if="characters.length > 0">
      <div 
        v-for="character in characters" 
        :key="character.id"
        class="character-card"
        :class="{ active: currentCharacter?.id === character.id }"
        @click="selectCharacter(character.id)"
      >
        <div class="character-icon">
          <img 
            v-if="imageExists(`/assets/classes/${getClassIcon(character.class)}`)" 
            :src="`/assets/classes/${getClassIcon(character.class)}`" 
            :alt="character.class"
          >
          <div v-else class="placeholder-icon" :style="{ backgroundColor: getClassColor(character.class) }">
            {{ getClassNameInitial(character.class) }}
          </div>
        </div>
        <div class="character-info">
          <h3>{{ character.name }}</h3>
          <div class="character-details">
            <span class="class">{{ getClassName(character.class) }}</span>
            <span class="level">Level {{ character.level }}</span>
          </div>
          <div class="character-stats">
            <div class="stat">
              <span class="label">力量</span>
              <span class="value">{{ character.baseAttributes.strength }}</span>
            </div>
            <div class="stat">
              <span class="label">敏捷</span>
              <span class="value">{{ character.baseAttributes.dexterity }}</span>
            </div>
            <div class="stat">
              <span class="label">智力</span>
              <span class="value">{{ character.baseAttributes.intelligence }}</span>
            </div>
          </div>
        </div>
        <div class="character-actions">
          <button class="play-btn" @click.stop="playCharacter(character.id)">进入游戏</button>
          <button class="delete-btn" @click.stop="confirmDelete(character.id)">删除</button>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <p>你还没有创建任何角色</p>
    </div>
    
    <!-- 创建新角色按钮 -->
    <div class="actions">
      <button class="create-btn" @click="showCreateDialog = true">创建新角色</button>
    </div>
    
    <!-- 创建角色弹窗 -->
    <div class="create-dialog" v-if="showCreateDialog">
      <div class="dialog-content">
        <h2>创建新角色</h2>
        
        <div class="form-group">
          <label for="characterName">角色名称</label>
          <input 
            id="characterName" 
            v-model="newCharacter.name" 
            type="text" 
            placeholder="输入角色名称"
          >
        </div>
        
        <div class="form-group">
          <label>选择职业</label>
          <div class="class-select">
            <div 
              v-for="characterClass in availableClasses" 
              :key="characterClass"
              class="class-option"
              :class="{ selected: newCharacter.class === characterClass }"
              @click="newCharacter.class = characterClass"
            >
              <img :src="`/assets/classes/${getClassIcon(characterClass)}`" :alt="characterClass">
              <span>{{ getClassName(characterClass) }}</span>
            </div>
          </div>
        </div>
        
        <div class="class-description" v-if="newCharacter.class">
          <p>{{ getClassDescription(newCharacter.class) }}</p>
          <div class="class-stats">
            <div class="stat" v-for="(attr, key) in CLASS_BASE_ATTRIBUTES[newCharacter.class]" :key="key">
              <span class="label">{{ getAttributeName(key) }}</span>
              <span class="value">{{ attr }}</span>
            </div>
          </div>
        </div>
        
        <div class="dialog-actions">
          <button 
            class="create-confirm-btn" 
            @click="createNewCharacter" 
            :disabled="!isFormValid"
          >
            创建
          </button>
          <button class="cancel-btn" @click="showCreateDialog = false">取消</button>
        </div>
      </div>
    </div>
    
    <!-- 删除确认弹窗 -->
    <div class="delete-dialog" v-if="showDeleteDialog">
      <div class="dialog-content">
        <h2>确认删除</h2>
        <p>你确定要删除角色 "{{ characterToDelete?.name }}" 吗？此操作不可撤销。</p>
        
        <div class="dialog-actions">
          <button class="delete-confirm-btn" @click="deleteConfirmed">确认删除</button>
          <button class="cancel-btn" @click="showDeleteDialog = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/character'
import { CharacterClass } from '@/types/character'
import { CLASS_BASE_ATTRIBUTES, CLASS_DESCRIPTIONS, CLASS_ICONS } from '@/constants/characterTemplates'

// 初始化
const router = useRouter()
const characterStore = useCharacterStore()
const characters = computed(() => characterStore.characters)
const currentCharacter = computed(() => characterStore.currentCharacter)

// 职业列表
const availableClasses: CharacterClass[] = [
  'marauder', 
  'duelist', 
  'ranger', 
  'shadow', 
  'witch', 
  'templar', 
  'scion'
]

// 新角色表单
const newCharacter = ref({
  name: '',
  class: 'marauder' as CharacterClass
})

// 表单验证
const isFormValid = computed(() => {
  return newCharacter.value.name.trim().length >= 3
})

// 弹窗状态
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const characterToDelete = ref<{ id: string, name: string } | null>(null)

// 初始化
onMounted(() => {
  characterStore.initializeFromStorage()
})

// 选择角色
function selectCharacter(id: string) {
  characterStore.selectCharacter(id)
}

// 进入游戏
function playCharacter(id: string) {
  characterStore.selectCharacter(id)
  router.push('/game')
}

// 创建新角色
function createNewCharacter() {
  if (isFormValid.value) {
    const character = characterStore.createCharacter(
      newCharacter.value.name,
      newCharacter.value.class
    )
    showCreateDialog.value = false
    
    // 重置表单
    newCharacter.value = {
      name: '',
      class: 'marauder'
    }
    
    // 自动选择新创建的角色
    characterStore.selectCharacter(character.id)
  }
}

// 确认删除
function confirmDelete(id: string) {
  const character = characters.value.find(c => c.id === id)
  if (character) {
    characterToDelete.value = {
      id: character.id,
      name: character.name
    }
    showDeleteDialog.value = true
  }
}

// 执行删除
function deleteConfirmed() {
  if (characterToDelete.value) {
    characterStore.deleteCharacter(characterToDelete.value.id)
    showDeleteDialog.value = false
    characterToDelete.value = null
  }
}

// 辅助函数
function getClassName(characterClass: CharacterClass): string {
  const classNames = {
    marauder: '野蛮人',
    duelist: '决斗者',
    ranger: '游侠',
    shadow: '暗影',
    witch: '女巫',
    templar: '圣堂武僧',
    scion: '贵族'
  }
  return classNames[characterClass]
}

function getClassIcon(characterClass: CharacterClass): string {
  return CLASS_ICONS[characterClass]
}

function getClassDescription(characterClass: CharacterClass): string {
  return CLASS_DESCRIPTIONS[characterClass]
}

function getAttributeName(key: string): string {
  const attrNames: Record<string, string> = {
    strength: '力量',
    dexterity: '敏捷',
    intelligence: '智力',
    vitality: '体力'
  }
  return attrNames[key] || key
}

// 获取职业颜色
function getClassColor(characterClass: CharacterClass): string {
  const colors = {
    marauder: '#d63031',  // 红色
    duelist: '#0984e3',   // 蓝色
    ranger: '#00b894',    // 绿色
    shadow: '#6c5ce7',    // 紫色
    witch: '#8e44ad',     // 深紫色
    templar: '#fdcb6e',   // 金色
    scion: '#e17055'      // 橙色
  }
  return colors[characterClass] || '#ccc'
}

// 获取职业名称首字母
function getClassNameInitial(characterClass: CharacterClass): string {
  const names = {
    marauder: '野',
    duelist: '决',
    ranger: '游',
    shadow: '影',
    witch: '巫',
    templar: '圣',
    scion: '贵'
  }
  return names[characterClass] || 'C'
}

// 检查图片是否存在
function imageExists(url: string): boolean {
  // 这个函数在实际运行时不会完全准确，仅作为开发阶段的辅助
  // 在生产环境中应该预先确认图片是否存在
  return true // 默认返回true，假设图片存在
}
</script>

<style scoped>
.character-select {
  @apply min-h-screen bg-gray-900 text-white p-6;
}

.title {
  @apply text-3xl font-bold text-center mb-8 text-yellow-400;
}

.character-list {
  @apply max-w-4xl mx-auto space-y-4;
}

.character-card {
  @apply flex items-center bg-gray-800 rounded-lg p-4 cursor-pointer transition-all;
  @apply hover:bg-gray-700 border-2 border-transparent;
}

.character-card.active {
  @apply border-yellow-500;
}

.character-icon {
  @apply w-16 h-16 rounded-full overflow-hidden bg-gray-700 mr-4 flex-shrink-0;
}

.character-icon img {
  @apply w-full h-full object-cover;
}

.character-info {
  @apply flex-grow;
}

.character-info h3 {
  @apply text-xl font-bold text-yellow-300 mb-1;
}

.character-details {
  @apply flex items-center space-x-3 text-sm text-gray-400 mb-2;
}

.character-stats {
  @apply flex space-x-4;
}

.stat {
  @apply flex flex-col;
}

.label {
  @apply text-xs text-gray-400;
}

.value {
  @apply text-sm font-medium text-gray-200;
}

.character-actions {
  @apply flex flex-col space-y-2;
}

.play-btn {
  @apply bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded;
  @apply transition-colors font-medium;
}

.delete-btn {
  @apply bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm;
  @apply transition-colors font-medium;
}

.empty-state {
  @apply text-center py-12 text-gray-400;
}

.actions {
  @apply mt-8 text-center;
}

.create-btn {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg;
  @apply transition-colors font-bold;
}

.create-dialog, .delete-dialog {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
}

.dialog-content {
  @apply bg-gray-800 rounded-lg p-6 max-w-md w-full;
}

.dialog-content h2 {
  @apply text-2xl font-bold mb-4 text-yellow-400;
}

.form-group {
  @apply mb-4;
}

.form-group label {
  @apply block text-gray-300 mb-2;
}

.form-group input {
  @apply w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.class-select {
  @apply grid grid-cols-4 gap-2;
}

.class-option {
  @apply flex flex-col items-center bg-gray-700 rounded p-2 cursor-pointer;
  @apply hover:bg-gray-600 transition-colors border-2 border-transparent;
}

.class-option.selected {
  @apply border-yellow-500;
}

.class-option img {
  @apply w-12 h-12 object-cover rounded-full mb-2;
}

.class-option span {
  @apply text-xs text-center;
}

.class-description {
  @apply mt-4 p-4 bg-gray-700 rounded;
}

.class-description p {
  @apply text-sm text-gray-300 mb-3;
}

.class-stats {
  @apply grid grid-cols-4 gap-4;
}

.dialog-actions {
  @apply flex justify-end space-x-3 mt-6;
}

.create-confirm-btn {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded;
  @apply transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed;
}

.cancel-btn {
  @apply bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded;
  @apply transition-colors font-medium;
}

.delete-confirm-btn {
  @apply bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded;
  @apply transition-colors font-medium;
}

.placeholder-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}
</style> 