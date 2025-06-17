import { EquipmentSlot, EquipmentQuality } from '../../types/equipment';
import { IAttributeModifier } from './IAttributeModifier';

export interface IEquipment {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  quality: EquipmentQuality;
  levelRequirement: number;
  modifiers: IAttributeModifier[];
  value: number;
} 