import character from './character'
import common from './common'
import errors from './errors'
import game from './game'
import monsters from './monsters'
import areas from './areas'
import quests from './quests'
import items from './items'
import battle from './battle'
import inventory from './inventory'
import equipment from './equipment'
import attributes from './attributes'
import itemTypes from './itemTypes'
import effects from './effects'
import loot from '@/configs/loot'

export default {
  common,
  character,
  errors,
  game,
  monsters,
  areas,
  quests,
  items,
  battle,
  loot,
  inventory,
  equipment,
  attributes,
  itemTypes,
  effects,
  
  item: {
    sellPrice: '售价: {price} 金币',
    level: '等级 {level}'
  }
} 