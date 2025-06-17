import { IQuest } from '../../../core/interfaces/IQuest';
import { QuestStatus, QuestDifficulty } from '../../systems/quest/types';

export class QuestLogUI {
  private container: HTMLElement;
  private questList: HTMLElement;
  private questDetails: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'quest-log';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 800px;
      height: 600px;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #666;
      border-radius: 8px;
      display: none;
      flex-direction: column;
      color: #fff;
      font-family: Arial, sans-serif;
    `;

    this.questList = document.createElement('div');
    this.questList.className = 'quest-list';
    this.questList.style.cssText = `
      width: 300px;
      height: 100%;
      border-right: 1px solid #666;
      overflow-y: auto;
      padding: 10px;
    `;

    this.questDetails = document.createElement('div');
    this.questDetails.className = 'quest-details';
    this.questDetails.style.cssText = `
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    `;

    this.container.appendChild(this.questList);
    this.container.appendChild(this.questDetails);
    document.body.appendChild(this.container);
  }

  public show(): void {
    this.container.style.display = 'flex';
  }

  public hide(): void {
    this.container.style.display = 'none';
  }

  public updateQuestList(quests: IQuest[]): void {
    this.questList.innerHTML = '';
    quests.forEach(quest => {
      const questElement = this.createQuestElement(quest);
      this.questList.appendChild(questElement);
    });
  }

  public showQuestDetails(quest: IQuest): void {
    this.questDetails.innerHTML = `
      <h2>${quest.name}</h2>
      <p class="quest-description">${quest.description}</p>
      <div class="quest-info">
        <p>等级要求: ${quest.level}</p>
        <p>难度: ${this.getDifficultyText(quest.difficulty)}</p>
        <p>状态: ${this.getStatusText(quest.status)}</p>
      </div>
      <div class="quest-objectives">
        <h3>目标</h3>
        ${quest.objectives.map(obj => `
          <div class="objective ${obj.isCompleted ? 'completed' : ''}">
            <span class="objective-text">${obj.description}</span>
            <span class="objective-progress">${obj.currentAmount}/${obj.requiredAmount}</span>
          </div>
        `).join('')}
      </div>
      <div class="quest-rewards">
        <h3>奖励</h3>
        ${quest.rewards.map(reward => `
          <div class="reward ${reward.isClaimed ? 'claimed' : ''}">
            <span class="reward-text">${reward.description}</span>
            <span class="reward-amount">x${reward.amount}</span>
          </div>
        `).join('')}
      </div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .quest-description {
        color: #ccc;
        margin: 10px 0;
      }
      .quest-info {
        margin: 15px 0;
        color: #aaa;
      }
      .objective, .reward {
        margin: 5px 0;
        padding: 5px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }
      .objective.completed {
        color: #4CAF50;
      }
      .reward.claimed {
        color: #FFC107;
      }
      .objective-progress, .reward-amount {
        float: right;
        color: #888;
      }
    `;
    this.questDetails.appendChild(style);
  }

  private createQuestElement(quest: IQuest): HTMLElement {
    const element = document.createElement('div');
    element.className = `quest-item ${quest.status.toLowerCase()}`;
    element.style.cssText = `
      padding: 10px;
      margin: 5px 0;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      cursor: pointer;
    `;

    element.innerHTML = `
      <div class="quest-name">${quest.name}</div>
      <div class="quest-status">${this.getStatusText(quest.status)}</div>
    `;

    element.addEventListener('click', () => this.showQuestDetails(quest));

    return element;
  }

  private getStatusText(status: QuestStatus): string {
    const statusMap = {
      [QuestStatus.NOT_STARTED]: '未开始',
      [QuestStatus.IN_PROGRESS]: '进行中',
      [QuestStatus.COMPLETED]: '已完成',
      [QuestStatus.FAILED]: '失败',
      [QuestStatus.ABANDONED]: '已放弃'
    };
    return statusMap[status] || status;
  }

  private getDifficultyText(difficulty: QuestDifficulty): string {
    const difficultyMap = {
      [QuestDifficulty.EASY]: '简单',
      [QuestDifficulty.NORMAL]: '普通',
      [QuestDifficulty.HARD]: '困难',
      [QuestDifficulty.EXPERT]: '专家',
      [QuestDifficulty.MASTER]: '大师'
    };
    return difficultyMap[difficulty] || difficulty;
  }
} 