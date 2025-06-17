export class Vector2D {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  static one(): Vector2D {
    return new Vector2D(1, 1);
  }

  static up(): Vector2D {
    return new Vector2D(0, -1);
  }

  static down(): Vector2D {
    return new Vector2D(0, 1);
  }

  static left(): Vector2D {
    return new Vector2D(-1, 0);
  }

  static right(): Vector2D {
    return new Vector2D(1, 0);
  }

  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  divide(scalar: number): Vector2D {
    if (scalar === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector2D();
    }
    return this.divide(mag);
  }

  dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector2D): number {
    return this.x * v.y - this.y * v.x;
  }

  distance(v: Vector2D): number {
    return this.subtract(v).magnitude();
  }

  equals(v: Vector2D): boolean {
    return this.x === v.x && this.y === v.y;
  }

  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
} 