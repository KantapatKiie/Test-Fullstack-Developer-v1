import { Injectable } from '@nestjs/common';

@Injectable()
export class DemoService {
  private hits = 0;

  compute(q: string): { q: string; value: number; hits: number } {
    this.hits++; // เพิ่มจำนวนครั้งที่ service ถูกเรียก
    
    return {
      q,
      value: Math.random(),
      hits: this.hits
    };
  }

  getHits(): number {
    return this.hits;
  }

  resetHits(): void {
    this.hits = 0;
  }
}