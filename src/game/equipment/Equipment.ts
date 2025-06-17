import { EquipmentSlot } from './EquipmentSlot';
import { AttributeType, ModifierType } from '../../types/equipment';

export interface EquipmentAttributes {
  damage?: number;
  health?: number;
  armor?: number;
  attackSpeed?: number;
  criticalChance?: number;
  criticalDamage?: number;
}

export interface EquipmentConfig {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  quality: string;
  levelRequirement: number;
  modifiers: {
    type: ModifierType;
    attribute: AttributeType;
    value: number;
  }[];
  value: number;
}

export class Equipment {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  quality: string;
  levelRequirement: number;
  modifiers: {
    type: ModifierType;
    attribute: AttributeType;
    value: number;
  }[];
  value: number;
  level: number;

  constructor(config: EquipmentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.slot = config.slot;
    this.quality = config.quality;
    this.levelRequirement = config.levelRequirement;
    this.modifiers = config.modifiers;
    this.value = config.value;
    this.level = 1;
  }

  get attributes(): EquipmentAttributes {
    const attrs: EquipmentAttributes = {};
    for (const modifier of this.modifiers) {
      if (modifier.type === ModifierType.FLAT) {
        attrs[modifier.attribute] = (attrs[modifier.attribute] || 0) + modifier.value;
      }
    }
    return attrs;
  }
} 