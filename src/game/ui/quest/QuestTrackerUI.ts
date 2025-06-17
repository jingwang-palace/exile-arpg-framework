import { IQuest } from '../../../core/interfaces/IQuest';

export class QuestTrackerUI {
  private container: HTMLElement;
  private activeQuests: Map<string, HTMLElement>;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'quest-tracker';
    this.container.style.cssText = `
      position: fixed;
      right: 20px;
      top: 20px;
      width: 300px;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #666;
      border-radius: 4px;
      color: #fff;
      font-family: Arial, sans-serif;
      padding: 10px;
    `;

    this.activeQuests = new Map();
    document.body.appendChild(this.container);
  }

  public show(): void {
    this.container.style.display = 'block';
  }

  public hide(): void {
    this.container.style.display = 'none';
  }

  public updateQuest(quest: IQuest): void {
    if (quest.status !== 'IN_PROGRESS') {
      this.removeQuest(quest.id);
      return;
    }

    let questElement = this.activeQuests.get(quest.id);
    if (!questElement) {
      questElement = this.createQuestElement(quest);
      this.activeQuests.set(quest.id, questElement);
      this.container.appendChild(questElement);
    } else {
      this.updateQuestElement(questElement, quest);
    }
  }

  public removeQuest(questId: string): void {
    const element = this.activeQuests.get(questId);
    if (element) {
      element.remove();
      this.activeQuests.delete(questId);
    }
  }

  private createQuestElement(quest: IQuest): HTMLElement {
    const element = document.createElement('div');
    element.className = 'tracked-quest';
    element.style.cssText = `
      margin: 5px 0;
      padding: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    `;

    this.updateQuestElement(element, quest);
    return element;
  }

  private updateQuestElement(element: HTMLElement, quest: IQuest): void {
    element.innerHTML = `
      <div class="quest-name" style="font-weight: bold; margin-bottom: 5px;">
        ${quest.name}
      </div>
      <div class="quest-objectives">
        ${quest.objectives.map(obj => `
          <div class="objective ${obj.isCompleted ? 'completed' : ''}" style="margin: 3px 0;">
            <span class="objective-text">${obj.description}</span>
            <span class="objective-progress" style="float: right; color: #888;">
              ${obj.currentAmount}/${obj.requiredAmount}
            </span>
          </div>
        `).join('')}
      </div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .objective.completed {
        color: #4CAF50;
      }
      .objective.completed .objective-progress {
        color: #4CAF50 !important;
      }
    `;
    element.appendChild(style);
  }
} 