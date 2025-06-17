export class CharacterAttributes {
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
  private attributePoints: number;

  constructor(config: {
    strength?: number;
    dexterity?: number;
    intelligence?: number;
    vitality?: number;
  } = {}) {
    this.strength = config.strength || 10;
    this.dexterity = config.dexterity || 10;
    this.intelligence = config.intelligence || 10;
    this.vitality = config.vitality || 10;
    this.attributePoints = 0;
  }

  addAttributePoints(points: number): void {
    this.attributePoints += points;
  }

  addAttributePoint(attribute: keyof CharacterAttributes, amount: number): void {
    if (this.attributePoints < amount) {
      throw new Error('属性点不足');
    }
    this[attribute] += amount;
    this.attributePoints -= amount;
  }

  getAttributePoints(): number {
    return this.attributePoints;
  }
} 