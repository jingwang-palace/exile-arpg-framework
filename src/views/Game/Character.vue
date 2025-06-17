<template>
  <div class="game-character">
    <div class="character-sheet">
      <!-- 角色基本信息 -->
      <div class="char-header">
        <div class="char-portrait" :style="{ backgroundColor: getClassColor(character.class) }">
          {{ getClassNameInitial(character.class) }}
        </div>
        <div class="char-info">
          <h1 class="char-name">{{ character.name }}</h1>
          <div class="char-class">{{ getClassName(character.class) }}</div>
          <div class="char-level">等级 {{ character.level }}</div>
          <div class="char-exp">
            经验: {{ character.experience }}/{{ getRequiredExperience(character.level) }}
            <div class="exp-bar">
              <div class="exp-fill" :style="{ width: `${(character.experience / getRequiredExperience(character.level)) * 100}%` }"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="char-sections">
        <!-- 基础属性 -->
        <div class="char-section">
          <h2 class="section-title">基础属性</h2>
          <div class="attributes-grid">
            <div class="attribute-item">
              <div class="attribute-icon strength">力</div>
              <div class="attribute-info">
                <div class="attribute-name">力量</div>
                <div class="attribute-value">{{ character.baseAttributes.strength }}</div>
              </div>
            </div>
            
            <div class="attribute-item">
              <div class="attribute-icon dexterity">敏</div>
              <div class="attribute-info">
                <div class="attribute-name">敏捷</div>
                <div class="attribute-value">{{ character.baseAttributes.dexterity }}</div>
              </div>
            </div>
            
            <div class="attribute-item">
              <div class="attribute-icon intelligence">智</div>
              <div class="attribute-info">
                <div class="attribute-name">智力</div>
                <div class="attribute-value">{{ character.baseAttributes.intelligence }}</div>
              </div>
            </div>
            
            <div class="attribute-item">
              <div class="attribute-icon vitality">体</div>
              <div class="attribute-info">
                <div class="attribute-name">体力</div>
                <div class="attribute-value">{{ character.baseAttributes.vitality }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 衍生属性 -->
        <div class="char-section">
          <h2 class="section-title">衍生属性</h2>
          <div class="derived-grid">
            <!-- 防御属性 -->
            <div class="derived-column">
              <h3 class="column-title">防御</h3>
              <div class="derived-item">
                <div class="derived-name">生命值</div>
                <div class="derived-value">{{ Math.floor(character.derivedAttributes.maxHealth) }}</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">魔法值</div>
                <div class="derived-value">{{ Math.floor(character.derivedAttributes.maxMana) }}</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">能量护盾</div>
                <div class="derived-value">{{ Math.floor(character.derivedAttributes.energyShield) }}</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">护甲</div>
                <div class="derived-value">{{ Math.floor(character.derivedAttributes.armor) }}</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">闪避</div>
                <div class="derived-value">{{ Math.floor(character.derivedAttributes.evasion) }}</div>
              </div>
            </div>
            
            <!-- 攻击属性 -->
            <div class="derived-column">
              <h3 class="column-title">攻击</h3>
              <div class="derived-item">
                <div class="derived-name">物理伤害</div>
                <div class="derived-value">{{ Math.floor(character.derivedAttributes.physicalDamage) }}</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">元素伤害</div>
                <div class="derived-value">{{ Math.floor(character.derivedAttributes.elementalDamage) }}</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">混沌伤害</div>
                <div class="derived-value">{{ Math.floor(character.derivedAttributes.chaosDamage) }}</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">暴击率</div>
                <div class="derived-value">{{ (character.derivedAttributes.criticalChance * 100).toFixed(1) }}%</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">暴击倍率</div>
                <div class="derived-value">{{ character.derivedAttributes.criticalMultiplier.toFixed(2) }}x</div>
              </div>
            </div>
            
            <!-- 其他属性 -->
            <div class="derived-column">
              <h3 class="column-title">其他</h3>
              <div class="derived-item">
                <div class="derived-name">攻击速度</div>
                <div class="derived-value">{{ character.derivedAttributes.attackSpeed.toFixed(2) }}</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">施法速度</div>
                <div class="derived-value">{{ character.derivedAttributes.castSpeed.toFixed(2) }}</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">移动速度</div>
                <div class="derived-value">{{ character.derivedAttributes.movementSpeed.toFixed(2) }}</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">生命恢复</div>
                <div class="derived-value">{{ character.derivedAttributes.lifeRegeneration.toFixed(1) }}/秒</div>
              </div>
              <div class="derived-item">
                <div class="derived-name">魔法恢复</div>
                <div class="derived-value">{{ character.derivedAttributes.manaRegeneration.toFixed(1) }}/秒</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 抗性 -->
        <div class="char-section">
          <h2 class="section-title">抗性</h2>
          <div class="resistances-grid">
            <div class="resistance-item">
              <div class="resistance-icon fire">火</div>
              <div class="resistance-bar">
                <div 
                  class="resistance-fill" 
                  :style="{ width: `${Math.min(100, character.resistances.fireResistance)}%` }"
                ></div>
                <div class="resistance-value">{{ Math.floor(character.resistances.fireResistance) }}%</div>
              </div>
            </div>
            
            <div class="resistance-item">
              <div class="resistance-icon cold">冰</div>
              <div class="resistance-bar">
                <div 
                  class="resistance-fill" 
                  :style="{ width: `${Math.min(100, character.resistances.coldResistance)}%` }"
                ></div>
                <div class="resistance-value">{{ Math.floor(character.resistances.coldResistance) }}%</div>
              </div>
            </div>
            
            <div class="resistance-item">
              <div class="resistance-icon lightning">电</div>
              <div class="resistance-bar">
                <div 
                  class="resistance-fill" 
                  :style="{ width: `${Math.min(100, character.resistances.lightningResistance)}%` }"
                ></div>
                <div class="resistance-value">{{ Math.floor(character.resistances.lightningResistance) }}%</div>
              </div>
            </div>
            
            <div class="resistance-item">
              <div class="resistance-icon chaos">混</div>
              <div class="resistance-bar">
                <div 
                  class="resistance-fill" 
                  :style="{ width: `${Math.min(100, character.resistances.chaosResistance)}%` }"
                ></div>
                <div class="resistance-value">{{ Math.floor(character.resistances.chaosResistance) }}%</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 天赋点 -->
        <div class="char-section">
          <h2 class="section-title">剩余点数</h2>
          <div class="points-grid">
            <div class="point-item">
              <div class="point-name">技能点</div>
              <div class="point-value">{{ character.skillPoints }}</div>
            </div>
            <div class="point-item">
              <div class="point-name">天赋点</div>
              <div class="point-value">{{ character.passivePoints }}</div>
            </div>
            <div class="point-item">
              <div class="point-name">升华点</div>
              <div class="point-value">{{ character.ascendancyPoints }}</div>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="passive-btn" :disabled="character.passivePoints <= 0">
              天赋树
            </button>
            <button class="skills-btn" :disabled="character.skillPoints <= 0">
              技能
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore } from '@/stores/character';
import { useRouter } from 'vue-router';

const characterStore = useCharacterStore();
const router = useRouter();

// 获取当前角色
const character = computed(() => {
  if (!characterStore.currentCharacter) {
    router.push('/characters');
    return null;
  }
  return characterStore.currentCharacter;
});

// 获取职业颜色
function getClassColor(characterClass) {
  const colors = {
    marauder: '#d63031',  // 红色
    duelist: '#0984e3',   // 蓝色
    ranger: '#00b894',    // 绿色
    shadow: '#6c5ce7',    // 紫色
    witch: '#8e44ad',     // 深紫色
    templar: '#fdcb6e',   // 金色
    scion: '#e17055'      // 橙色
  };
  return colors[characterClass] || '#ccc';
}

// 获取职业名称首字母
function getClassNameInitial(characterClass) {
  const names = {
    marauder: '野',
    duelist: '决',
    ranger: '游',
    shadow: '影',
    witch: '巫',
    templar: '圣',
    scion: '贵'
  };
  return names[characterClass] || 'C';
}

// 获取职业名称
function getClassName(characterClass) {
  const classNames = {
    marauder: '野蛮人',
    duelist: '决斗者',
    ranger: '游侠',
    shadow: '暗影',
    witch: '女巫',
    templar: '圣堂武僧',
    scion: '贵族'
  };
  return classNames[characterClass] || characterClass;
}

// 获取升级所需经验
function getRequiredExperience(level) {
  return characterStore.getRequiredExperience(level);
}
</script>

<style scoped>
.game-character {
  @apply max-w-4xl mx-auto;
}

.character-sheet {
  @apply bg-gray-800 rounded-lg overflow-hidden;
}

.char-header {
  @apply flex items-center p-6 bg-gray-700;
}

.char-portrait {
  @apply w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mr-6;
}

.char-info {
  @apply flex-grow;
}

.char-name {
  @apply text-2xl font-bold text-yellow-400 mb-1;
}

.char-class {
  @apply text-lg text-gray-300 mb-1;
}

.char-level {
  @apply text-gray-400 mb-2;
}

.char-exp {
  @apply text-sm text-gray-400;
}

.exp-bar {
  @apply mt-1 h-2 bg-gray-600 rounded overflow-hidden;
}

.exp-fill {
  @apply h-full bg-green-500;
}

.char-sections {
  @apply p-6 space-y-6;
}

.char-section {
  @apply bg-gray-700 rounded-lg p-4;
}

.section-title {
  @apply text-lg font-bold mb-4 text-yellow-300;
}

.attributes-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.attribute-item {
  @apply flex items-center bg-gray-800 p-3 rounded;
}

.attribute-icon {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-3;
}

.attribute-icon.strength {
  @apply bg-red-600;
}

.attribute-icon.dexterity {
  @apply bg-green-600;
}

.attribute-icon.intelligence {
  @apply bg-blue-600;
}

.attribute-icon.vitality {
  @apply bg-yellow-600;
}

.attribute-name {
  @apply text-gray-300 mb-1;
}

.attribute-value {
  @apply text-lg font-bold;
}

.derived-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.derived-column {
  @apply bg-gray-800 p-3 rounded;
}

.column-title {
  @apply font-bold mb-3 pb-2 border-b border-gray-700;
}

.derived-item {
  @apply flex justify-between py-1 border-b border-gray-700 last:border-0;
}

.derived-name {
  @apply text-gray-400;
}

.derived-value {
  @apply font-medium;
}

.resistances-grid {
  @apply space-y-3;
}

.resistance-item {
  @apply flex items-center;
}

.resistance-icon {
  @apply w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3;
}

.resistance-icon.fire {
  @apply bg-red-600;
}

.resistance-icon.cold {
  @apply bg-blue-600;
}

.resistance-icon.lightning {
  @apply bg-yellow-600;
}

.resistance-icon.chaos {
  @apply bg-purple-600;
}

.resistance-bar {
  @apply flex-grow h-8 bg-gray-800 rounded overflow-hidden relative;
}

.resistance-fill {
  @apply h-full bg-opacity-50;
}

.resistance-icon.fire + .resistance-bar .resistance-fill {
  @apply bg-red-600;
}

.resistance-icon.cold + .resistance-bar .resistance-fill {
  @apply bg-blue-600;
}

.resistance-icon.lightning + .resistance-bar .resistance-fill {
  @apply bg-yellow-600;
}

.resistance-icon.chaos + .resistance-bar .resistance-fill {
  @apply bg-purple-600;
}

.resistance-value {
  @apply absolute inset-0 flex items-center px-3 font-medium;
}

.points-grid {
  @apply grid grid-cols-3 gap-4 mb-4;
}

.point-item {
  @apply bg-gray-800 p-3 rounded text-center;
}

.point-name {
  @apply text-gray-400 mb-1;
}

.point-value {
  @apply text-xl font-bold;
}

.action-buttons {
  @apply flex space-x-4 mt-4;
}

.passive-btn, .skills-btn {
  @apply flex-1 py-2 rounded font-medium transition-colors;
}

.passive-btn {
  @apply bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed;
}

.skills-btn {
  @apply bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed;
}
</style> 