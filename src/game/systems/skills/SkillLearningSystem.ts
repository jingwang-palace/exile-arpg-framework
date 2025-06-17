export class SkillLearningSystem {
  constructor(skillManager: any, scene: any) {
    console.log('SkillLearningSystem created (minimal version)');
  }
  
  setPlayerLevel(level: number) {
    // 简化实现
  }
  
  learnSkill(skillId: string) {
    // 简化实现
    return true;
  }
  
  getAvailableSkillPoints() {
    return 0;
  }
  
  getAvailableSkills() {
    return [];
  }
  
  gainSkillExperience(skillId: string, amount: number) {
    // 简化实现
  }
} 