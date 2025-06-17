import { Equipment, EquipmentBase, ItemQuality, Mod, ModType } from '@/types/item'
import { MOD_POOLS } from "@/config/equipment/mods"

export class EquipmentService {
  // 生成装备
  generateEquipment(
    base: EquipmentBase,
    itemLevel: number,
    quality: ItemQuality
  ): Equipment {
    const equipment: Equipment = {
      id: crypto.randomUUID(),
      name: `equipment.baseTypes.${base.type.toLowerCase()}.${base.slot.toLowerCase()}`,
      description: '',
      type: base.type,
      slot: base.slot,
      quality: 0, // 初始品质
      itemLevel,
      level: Math.max(1, Math.floor(itemLevel * 0.8)),
      stackable: false,
      maxStack: 1,
      sellPrice: this.calculateSellPrice(itemLevel, quality),
      icon: this.getEquipmentIcon(base.type, base.slot),
      attributes: this.rollBaseAttributes(base.baseAttributes),
      implicitMods: [],
      explicitMods: [],
      isIdentified: quality === ItemQuality.COMMON
    }

    // 添加词缀
    if (base.implicitMods) {
      equipment.implicitMods = this.rollImplicitMods(base.implicitMods)
    }

    if (quality !== ItemQuality.COMMON) {
      equipment.explicitMods = this.rollExplicitMods(
        quality,
        itemLevel,
        base.type
      )
    }

    return equipment
  }

  // 计算装备总属性
  calculateTotalAttributes(equipment: Equipment): { [key: string]: number } {
    const total: { [key: string]: number } = { ...equipment.attributes }

    // 计算品质加成
    const qualityMultiplier = 1 + equipment.quality * 0.01

    // 计算所有词缀
    const allMods = [...equipment.implicitMods, ...equipment.explicitMods]
    allMods.forEach(mod => {
      Object.entries(mod.attributes).forEach(([attr, value]) => {
        total[attr] = (total[attr] || 0) + value[0]
      })
    })

    // 应用品质加成到基础属性
    Object.keys(equipment.attributes).forEach(attr => {
      total[attr] = Math.floor(total[attr] * qualityMultiplier)
    })

    return total
  }

  // 提高装备品质
  improveQuality(equipment: Equipment, amount: number): boolean {
    if (equipment.quality >= 20) return false
    equipment.quality = Math.min(20, equipment.quality + amount)
    return true
  }

  // 其他私有辅助方法...
  private rollBaseAttributes(baseAttributes: { [key: string]: [number, number] }) {
    const result: { [key: string]: number } = {}
    Object.entries(baseAttributes).forEach(([attr, [min, max]]) => {
      result[attr] = Math.floor(Math.random() * (max - min + 1) + min)
    })
    return result
  }

  private rollImplicitMods(mods: Mod[]): Mod[] {
    // 实现词缀随机
    return mods.map(mod => ({
      ...mod,
      values: Object.values(mod.attributes).map(([min, max]) => 
        Math.floor(Math.random() * (max - min + 1) + min)
      )
    }))
  }

  private rollExplicitMods(quality: ItemQuality, itemLevel: number, type: ItemType): Mod[] {
    // 根据品质决定词缀数量
    const modCount = this.getModCount(quality)
    // 实现词缀池选择和随机
    return []
  }
} 