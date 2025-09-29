import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string || randomUUID();
    
    // แนบ requestId ไปกับ request object
    (req as any).id = requestId;
    
    // ส่ง request ID กลับใน response header
    res.setHeader('x-request-id', requestId);
    
    // Log รูปแบบที่กำหนด: [<id>] <method> <url> - ใช้ console.log เพื่อให้แน่ใจว่าเห็น
    console.log(`[${requestId}] ${req.method} ${req.originalUrl}`);
    
    next();
  }
}