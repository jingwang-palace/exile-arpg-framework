// 技能释放事件
export class SkillCastEvent extends Event {
  public readonly skillId: string;
  public readonly skillLevel: number;
  public readonly sourceX: number;
  public readonly sourceY: number;
  public readonly targetX: number;
  public readonly targetY: number;
  
  constructor(
    skillId: string,
    skillLevel: number,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
  ) {
    super('skillcast');
    this.skillId = skillId;
    this.skillLevel = skillLevel;
    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.targetX = targetX;
    this.targetY = targetY;
  }
}

// 技能命中事件
export class SkillHitEvent extends Event {
  public readonly skillId: string;
  public readonly targetId: string;
  public readonly damage: number;
  public readonly element: string;
  
  constructor(
    skillId: string,
    targetId: string,
    damage: number,
    element: string
  ) {
    super('skillhit');
    this.skillId = skillId;
    this.targetId = targetId;
    this.damage = damage;
    this.element = element;
  }
}

// 技能效果结束事件
export class SkillEffectEndEvent extends Event {
  public readonly skillId: string;
  public readonly effectId: string;
  
  constructor(skillId: string, effectId: string) {
    super('skilleffectend');
    this.skillId = skillId;
    this.effectId = effectId;
  }
}

// 技能学习事件
export class SkillLearnEvent extends Event {
  public readonly skillId: string;
  public readonly skillLevel: number;
  
  constructor(skillId: string, skillLevel: number) {
    super('skilllearn');
    this.skillId = skillId;
    this.skillLevel = skillLevel;
  }
}

// 技能升级事件
export class SkillUpgradeEvent extends Event {
  public readonly skillId: string;
  public readonly oldLevel: number;
  public readonly newLevel: number;
  
  constructor(skillId: string, oldLevel: number, newLevel: number) {
    super('skillupgrade');
    this.skillId = skillId;
    this.oldLevel = oldLevel;
    this.newLevel = newLevel;
  }
} 