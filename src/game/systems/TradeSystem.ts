import { EventEmitter } from '../../utils/EventEmitter';
import { ItemSystem } from './ItemSystem';
import { BaseItem, ItemStack } from '../../types/item';
import { CurrencyType } from '../../types/currency';

interface TradeOffer {
  items: ItemStack[];
  currency: Map<CurrencyType, number>;
}

interface TradeSession {
  id: string;
  initiator: string;
  target: string;
  initiatorOffer: TradeOffer;
  targetOffer: TradeOffer;
  initiatorAccepted: boolean;
  targetAccepted: boolean;
  status: TradeStatus;
  timestamp: number;
}

enum TradeStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class TradeSystem extends EventEmitter {
  private itemSystem: ItemSystem;
  private activeSessions: Map<string, TradeSession> = new Map();
  
  constructor(itemSystem: ItemSystem) {
    super();
    this.itemSystem = itemSystem;
  }
  
  // 发起交易请求
  public initiateTrade(initiatorId: string, targetId: string): string {
    const sessionId = this.generateSessionId();
    
    const session: TradeSession = {
      id: sessionId,
      initiator: initiatorId,
      target: targetId,
      initiatorOffer: {
        items: [],
        currency: new Map()
      },
      targetOffer: {
        items: [],
        currency: new Map()
      },
      initiatorAccepted: false,
      targetAccepted: false,
      status: TradeStatus.PENDING,
      timestamp: Date.now()
    };
    
    this.activeSessions.set(sessionId, session);
    this.emit('tradeInitiated', { sessionId, initiatorId, targetId });
    
    return sessionId;
  }
  
  // 添加物品到交易
  public addItemToTrade(sessionId: string, playerId: string, item: BaseItem, quantity: number): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    if (session.status !== TradeStatus.PENDING) return false;
    
    // 重置接受状态
    if (playerId === session.initiator) {
      session.initiatorAccepted = false;
    } else if (playerId === session.target) {
      session.targetAccepted = false;
    } else {
      return false;
    }
    
    // 检查物品是否可交易
    if (!item.isTradeable) return false;
    
    // 检查玩家是否有足够的物品
    if (!this.itemSystem.hasItem(item.id, quantity)) return false;
    
    // 添加到交易
    const offer = playerId === session.initiator ? session.initiatorOffer : session.targetOffer;
    const existingStack = offer.items.find(stack => stack.item.id === item.id);
    
    if (existingStack) {
      existingStack.quantity += quantity;
    } else {
      offer.items.push({
        item,
        quantity,
        quality: item.type === 'EQUIPMENT' ? 0 : undefined,
        durability: item.type === 'EQUIPMENT' ? 100 : undefined,
        maxDurability: item.type === 'EQUIPMENT' ? 100 : undefined
      });
    }
    
    this.emit('tradeUpdated', { sessionId, playerId });
    return true;
  }
  
  // 添加通货到交易
  public addCurrencyToTrade(sessionId: string, playerId: string, type: CurrencyType, amount: number): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    if (session.status !== TradeStatus.PENDING) return false;
    
    // 重置接受状态
    if (playerId === session.initiator) {
      session.initiatorAccepted = false;
    } else if (playerId === session.target) {
      session.targetAccepted = false;
    } else {
      return false;
    }
    
    // 检查玩家是否有足够的通货
    if (!this.itemSystem.hasItem(type, amount)) return false;
    
    // 添加到交易
    const offer = playerId === session.initiator ? session.initiatorOffer : session.targetOffer;
    const currentAmount = offer.currency.get(type) || 0;
    offer.currency.set(type, currentAmount + amount);
    
    this.emit('tradeUpdated', { sessionId, playerId });
    return true;
  }
  
  // 移除交易中的物品
  public removeItemFromTrade(sessionId: string, playerId: string, itemId: string, quantity: number): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    if (session.status !== TradeStatus.PENDING) return false;
    
    // 重置接受状态
    if (playerId === session.initiator) {
      session.initiatorAccepted = false;
    } else if (playerId === session.target) {
      session.targetAccepted = false;
    } else {
      return false;
    }
    
    // 从交易中移除
    const offer = playerId === session.initiator ? session.initiatorOffer : session.targetOffer;
    const itemIndex = offer.items.findIndex(stack => stack.item.id === itemId);
    
    if (itemIndex === -1) return false;
    
    const stack = offer.items[itemIndex];
    if (stack.quantity <= quantity) {
      offer.items.splice(itemIndex, 1);
    } else {
      stack.quantity -= quantity;
    }
    
    this.emit('tradeUpdated', { sessionId, playerId });
    return true;
  }
  
  // 移除交易中的通货
  public removeCurrencyFromTrade(sessionId: string, playerId: string, type: CurrencyType, amount: number): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    if (session.status !== TradeStatus.PENDING) return false;
    
    // 重置接受状态
    if (playerId === session.initiator) {
      session.initiatorAccepted = false;
    } else if (playerId === session.target) {
      session.targetAccepted = false;
    } else {
      return false;
    }
    
    // 从交易中移除
    const offer = playerId === session.initiator ? session.initiatorOffer : session.targetOffer;
    const currentAmount = offer.currency.get(type) || 0;
    
    if (currentAmount < amount) return false;
    
    if (currentAmount === amount) {
      offer.currency.delete(type);
    } else {
      offer.currency.set(type, currentAmount - amount);
    }
    
    this.emit('tradeUpdated', { sessionId, playerId });
    return true;
  }
  
  // 接受交易
  public acceptTrade(sessionId: string, playerId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    if (session.status !== TradeStatus.PENDING) return false;
    
    if (playerId === session.initiator) {
      session.initiatorAccepted = true;
    } else if (playerId === session.target) {
      session.targetAccepted = true;
    } else {
      return false;
    }
    
    // 检查是否双方都接受了
    if (session.initiatorAccepted && session.targetAccepted) {
      this.completeTrade(sessionId);
    }
    
    this.emit('tradeUpdated', { sessionId, playerId });
    return true;
  }
  
  // 取消交易
  public cancelTrade(sessionId: string, playerId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    if (session.status !== TradeStatus.PENDING) return false;
    
    if (playerId !== session.initiator && playerId !== session.target) return false;
    
    session.status = TradeStatus.CANCELLED;
    this.emit('tradeCancelled', { sessionId, playerId });
    
    return true;
  }
  
  // 完成交易
  private completeTrade(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    
    if (session.status !== TradeStatus.PENDING) return false;
    if (!session.initiatorAccepted || !session.targetAccepted) return false;
    
    // 检查双方物品是否足够
    if (!this.validateTradeItems(session)) return false;
    
    // 执行交易
    this.executeTrade(session);
    
    session.status = TradeStatus.COMPLETED;
    this.emit('tradeCompleted', { sessionId });
    
    return true;
  }
  
  // 验证交易物品
  private validateTradeItems(session: TradeSession): boolean {
    // 验证发起者物品
    for (const stack of session.initiatorOffer.items) {
      if (!this.itemSystem.hasItem(stack.item.id, stack.quantity)) {
        return false;
      }
    }
    
    // 验证目标物品
    for (const stack of session.targetOffer.items) {
      if (!this.itemSystem.hasItem(stack.item.id, stack.quantity)) {
        return false;
      }
    }
    
    // 验证通货
    for (const [type, amount] of session.initiatorOffer.currency) {
      if (!this.itemSystem.hasItem(type, amount)) {
        return false;
      }
    }
    
    for (const [type, amount] of session.targetOffer.currency) {
      if (!this.itemSystem.hasItem(type, amount)) {
        return false;
      }
    }
    
    return true;
  }
  
  // 执行交易
  private executeTrade(session: TradeSession): void {
    // 移除发起者物品
    for (const stack of session.initiatorOffer.items) {
      this.itemSystem.removeItem(stack.item.id, stack.quantity);
    }
    
    // 移除目标物品
    for (const stack of session.targetOffer.items) {
      this.itemSystem.removeItem(stack.item.id, stack.quantity);
    }
    
    // 移除通货
    for (const [type, amount] of session.initiatorOffer.currency) {
      this.itemSystem.removeItem(type, amount);
    }
    
    for (const [type, amount] of session.targetOffer.currency) {
      this.itemSystem.removeItem(type, amount);
    }
    
    // 添加物品到目标
    for (const stack of session.initiatorOffer.items) {
      this.itemSystem.addItem(stack.item, stack.quantity);
    }
    
    // 添加物品到发起者
    for (const stack of session.targetOffer.items) {
      this.itemSystem.addItem(stack.item, stack.quantity);
    }
    
    // 添加通货
    for (const [type, amount] of session.initiatorOffer.currency) {
      this.itemSystem.addItem(type, amount);
    }
    
    for (const [type, amount] of session.targetOffer.currency) {
      this.itemSystem.addItem(type, amount);
    }
  }
  
  // 获取交易会话
  private getSession(sessionId: string): TradeSession | undefined {
    return this.activeSessions.get(sessionId);
  }
  
  // 生成会话ID
  private generateSessionId(): string {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // 清理过期会话
  public cleanupSessions(): void {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5分钟超时
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.timestamp > timeout) {
        session.status = TradeStatus.CANCELLED;
        this.emit('tradeCancelled', { sessionId, reason: 'timeout' });
        this.activeSessions.delete(sessionId);
      }
    }
  }
} 