export class Size {
  width: number;
  height: number;

  constructor(width: number = 0, height: number = 0) {
    this.width = width;
    this.height = height;
  }

  static zero(): Size {
    return new Size(0, 0);
  }

  static one(): Size {
    return new Size(1, 1);
  }

  static square(size: number): Size {
    return new Size(size, size);
  }

  add(s: Size): Size {
    return new Size(this.width + s.width, this.height + s.height);
  }

  subtract(s: Size): Size {
    return new Size(this.width - s.width, this.height - s.height);
  }

  multiply(scalar: number): Size {
    return new Size(this.width * scalar, this.height * scalar);
  }

  divide(scalar: number): Size {
    if (scalar === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Size(this.width / scalar, this.height / scalar);
  }

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }

  aspectRatio(): number {
    if (this.height === 0) {
      throw new Error('Cannot calculate aspect ratio with zero height');
    }
    return this.width / this.height;
  }

  equals(s: Size): boolean {
    return this.width === s.width && this.height === s.height;
  }

  clone(): Size {
    return new Size(this.width, this.height);
  }

  toString(): string {
    return `${this.width}x${this.height}`;
  }
} 