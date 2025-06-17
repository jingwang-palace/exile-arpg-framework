const character = {
  "title": "角色系统",
  "create": "创建角色",
  "list": "角色列表",
  "name": "角色名称",
  "level": "Lv.{level}",
  "experience": "{current}/{next}",
  "selectClass": "选择你的命运之路",
  "selected": "已选择",
  "recommended": "推荐",
  "createButton": "开启你的冒险之旅",
  "createNew": "创建新角色",
  "createFirst": "创建你的第一个角色",
  "noCharacters": "你还没有创建任何角色",
  
  "errors": {
    "nameTooShort": "角色名称至少需要2个字符",
    "nameExists": "角色名称已存在",
    "createFailed": "创建角色失败"
  },

  "attributes": {
    "title": "基础属性",
    "strength": "力量",
    "dexterity": "敏捷",
    "intelligence": "智力",
    "vitality": "体力",
    "points": "可用属性点: {points}"
  },

  "derived": {
    "title": "衍生属性",
    "health": "生命值",
    "maxHealth": "最大生命值",
    "mana": "魔力值",
    "maxMana": "最大魔力值",
    "healthRegen": "生命回复",
    "manaRegen": "魔力回复",
    "physicalDamage": "物理伤害",
    "spellDamage": "法术伤害",
    "attack": "攻击力",
    "magicAttack": "魔法攻击",
    "defense": "防御力",
    "magicDefense": "魔法防御",
    "attackSpeed": "攻击速度",
    "castSpeed": "施法速度",
    "moveSpeed": "移动速度",
    "criticalChance": "暴击率",
    "criticalMultiplier": "暴击伤害",
    "dodgeChance": "闪避率",
    "lifeSteal": "生命偷取",
    "manaSteal": "魔力偷取",
    "lifeOnHit": "击中回复生命",
    "manaOnHit": "击中回复魔力",
    "fireAttack": "火焰伤害",
    "iceAttack": "冰霜伤害",
    "lightningAttack": "闪电伤害",
    "poisonAttack": "毒素伤害",
    "fireResist": "火焰抗性",
    "iceResist": "冰霜抗性",
    "lightningResist": "闪电抗性",
    "poisonResist": "毒素抗性",
    "expBonus": "经验加成",
    "goldFind": "金币获取",
    "magicFind": "魔法发现"
  },

  "classes": {
    "warrior": {
      "name": "战士",
      "description": "擅长近战物理输出，拥有强大的生存能力",
      "strengths": [
        "高生命值和防御",
        "强力的近战伤害",
        "优秀的物理减伤"
      ],
      "skills": {
        "heavyStrike": "重击",
        "whirlwind": "旋风斩"
      }
    },
    "ranger": {
      "name": "游侠",
      "description": "远程物理输出专家，擅长持续输出",
      "strengths": [
        "精准的远程攻击",
        "高额的持续伤害",
        "灵活的走位能力"
      ],
      "skills": {
        "quickShot": "快速射击",
        "multipleArrow": "多重箭矢"
      }
    },
    "mage": {
      "name": "法师",
      "description": "强大的法术输出者，掌握元素魔法",
      "strengths": [
        "强大的法术伤害",
        "范围攻击技能",
        "元素伤害加成"
      ],
      "skills": {
        "fireball": "火球术",
        "frostNova": "寒冰新星"
      }
    },
    "assassin": {
      "name": "刺客",
      "description": "致命的暴击专家，擅长快速解决目标",
      "strengths": [
        "极高的暴击倍率",
        "优秀的攻击速度",
        "高额的暴击率"
      ],
      "skills": {
        "backstab": "背刺",
        "shadowStrike": "暗影打击"
      }
    },
    "templar": {
      "name": "圣堂武士",
      "description": "力量与魔法的结合，擅长近战法术",
      "strengths": [
        "平衡的属性成长",
        "物理魔法双修",
        "优秀的生存能力"
      ],
      "skills": {
        "holyStrike": "圣光打击",
        "purifyingFlame": "净化之焰"
      }
    }
  },

  "storage": {
    "mode": {
      "title": "存储模式",
      "local": "本地",
      "chain": "链上"
    },
    "export": "导出存档",
    "import": "导入存档",
    "errors": {
      "importFailed": "导入存档失败",
      "invalidSave": "无效的存档文件"
    }
  }
}

export default character 