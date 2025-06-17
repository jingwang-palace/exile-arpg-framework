// 模拟 Phaser
global.Phaser = {
  GameObjects: {
    Container: class Container {
      constructor() {}
      setDepth() {}
      setScrollFactor() {}
      setVisible() {}
    },
    Text: class Text {
      constructor() {}
      setPosition() {}
      setAlpha() {}
      setScale() {}
      setData() {}
      getData() {}
      destroy() {}
    }
  },
  Time: {
    TimerEvent: class TimerEvent {
      constructor() {}
    }
  }
};

// 模拟 EventBus
jest.mock('../core/EventBus', () => ({
  EventBus: {
    getInstance: jest.fn(() => ({
      on: jest.fn(),
      emit: jest.fn(),
      off: jest.fn()
    }))
  }
})); 