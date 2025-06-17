import { AttributeType } from '../../types/equipment';

export interface IAttributeModifier {
  type: AttributeType;
  value: number;
  isPercentage: boolean;
  requirement?: {
    type: AttributeType;
    value: number;
  };
} 