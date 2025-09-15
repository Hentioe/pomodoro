interface Time {
  minuteTen: number;
  minuteOne: number;
  secondTen: number;
  secondOne: number;
}

interface DigitElements {
  [key: string]: HTMLElement;
}

export default class FlipClock {
  private currentTime: Time;
  private digitElements: DigitElements;

  constructor() {
    this.currentTime = {
      minuteTen: 0,
      minuteOne: 0,
      secondTen: 0,
      secondOne: 0,
    };

    this.digitElements = {
      "minute-ten": document.getElementById("minute-ten")!,
      "minute-one": document.getElementById("minute-one")!,
      "second-ten": document.getElementById("second-ten")!,
      "second-one": document.getElementById("second-one")!,
    };
  }

  private flipDigit(elementId: string, newValue: number): void {
    const container: HTMLElement = this.digitElements[elementId];
    const display: HTMLElement = container.querySelector(".digit-display")!;

    // 立即更新底层显示为新数字
    display.textContent = newValue.toString();
  }

  public updateTime(minutes: number, seconds: number): void {
    const newTime: Time = {
      minuteTen: Math.floor(minutes / 10),
      minuteOne: minutes % 10,
      secondTen: Math.floor(seconds / 10),
      secondOne: seconds % 10,
    };

    // 只翻转发生变化的数字
    Object.keys(newTime).forEach((key: string) => {
      if (newTime[key as keyof Time] !== this.currentTime[key as keyof Time]) {
        const elementId: string = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        this.flipDigit(elementId, newTime[key as keyof Time]);
      }
    });

    this.currentTime = newTime;
  }
}
