interface DisplayTime {
  minTens: number;
  minOnes: number;
  secTens: number;
  secOnes: number;
}

interface InputTime {
  minutes: number;
  seconds: number;
}

export default class FlipClock3D {
  private currentDisplay: DisplayTime = { minTens: 0, minOnes: 0, secTens: 0, secOnes: 0 };
  private minTensFlip: Element;
  private minOnesFlip: Element;
  private secTensFlip: Element;
  private secOnesFlip: Element;

  constructor(clockContainer: Element) {
    this.minTensFlip = clockContainer.querySelector(".flip[data-unit=\"min-tens\"]")!;
    this.minOnesFlip = clockContainer.querySelector(".flip[data-unit=\"min-ones\"]")!;
    this.secTensFlip = clockContainer.querySelector(".flip[data-unit=\"sec-tens\"]")!;
    this.secOnesFlip = clockContainer.querySelector(".flip[data-unit=\"sec-ones\"]")!;

    this.update({ minutes: 0, seconds: 0 });
  }

  public update(time: InputTime) {
    // 精 InputTime 转换为 DisplayTime
    const timeInSeconds = time.minutes * 60 + time.seconds;
    const minTens = Math.floor(timeInSeconds / 600) % 10;
    const minOnes = Math.floor(timeInSeconds / 60) % 10;
    const secTens = Math.floor((timeInSeconds % 60) / 10);
    const secOnes = timeInSeconds % 10;

    if (minTens !== this.currentDisplay.minTens) {
      this.flip(this.minTensFlip, String(minTens));
    }
    if (minOnes !== this.currentDisplay.minOnes) {
      this.flip(this.minOnesFlip, String(minOnes));
    }
    if (secTens !== this.currentDisplay.secTens) {
      this.flip(this.secTensFlip, String(secTens));
    }
    if (secOnes !== this.currentDisplay.secOnes) {
      this.flip(this.secOnesFlip, String(secOnes));
    }

    this.currentDisplay = { minTens, minOnes, secTens, secOnes };
  }

  private flip(flipEl: Element, text: string) {
    const active: HTMLLIElement | null = flipEl.querySelector(".flip-item.active");

    if (!active) {
      // 首次播放：激活下一个元素
      const first: HTMLLIElement = flipEl.querySelector(".flip-item")!;
      const next: HTMLLIElement = first.nextElementSibling as HTMLLIElement;
      this.updateInnText(next, text);
      this.updateClasses(first, next, flipEl);
    } else if (!active.nextElementSibling) {
      // 没有下一个元素：循环回到第一个
      const first: HTMLLIElement = flipEl.querySelector(".flip-item")!;
      this.updateInnText(first, text);
      this.updateClasses(active, first, flipEl);
    } else {
      // 激活下一个
      const next: HTMLLIElement = active.nextElementSibling as HTMLLIElement;
      this.updateInnText(next, text);
      this.updateClasses(active, next, flipEl);
    }
  }

  private updateInnText(element: HTMLLIElement, text: string) {
    element.querySelectorAll(".inn").forEach((el: Element) => el.textContent = text);
  }

  private updateClasses(current: HTMLLIElement | null, next: HTMLLIElement, flipEl: Element): void {
    flipEl.querySelectorAll(".flip-item").forEach((li: Element) => li.classList.remove("before"));
    if (current) {
      current.classList.add("before");
      current.classList.remove("active");
    }
    next.classList.add("active");
  }
}
