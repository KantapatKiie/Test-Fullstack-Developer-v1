import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody } from '@nestjs/swagger';

// In-memory store สำหรับเก็บผลลัพธ์ของ Idempotency-Key
const paymentsStore = new Map<string, any>();

interface CreatePaymentDto {
  amount: number;
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  
  @Post()
  @ApiOperation({ summary: 'Create payment with idempotency support' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Unique key to prevent duplicate payments',
    required: true,
    schema: { type: 'string' }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 100 }
      },
      required: ['amount']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully or existing payment returned',
    schema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string' },
        amount: { type: 'number' },
        status: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Missing Idempotency-Key header'
  })
  create(
    @Body() body: CreatePaymentDto,
    @Headers('idempotency-key') idempotencyKey: string
  ) {
    // ตรวจสอบว่ามี Idempotency-Key หรือไม่
    if (!idempotencyKey) {
      throw new BadRequestException({
        error: 'Missing Idempotency-Key',
        message: 'Idempotency-Key header is required'
      });
    }

    // ถ้ามี key เดิมในระบบแล้ว ให้คืนผลลัพธ์เดิม
    if (paymentsStore.has(idempotencyKey)) {
      return paymentsStore.get(idempotencyKey);
    }

    // สร้าง payment ใหม่
    const result = {
      paymentId: Math.random().toString(36).slice(2), // สร้าง payment ID แบบสุ่ม
      amount: body?.amount ?? 0,
      status: 'success',
      timestamp: new Date().toISOString(),
      idempotencyKey
    };

    // เก็บผลลัพธ์ไว้ใน store
    paymentsStore.set(idempotencyKey, result);

    return result;
  }

  // Helper endpoint เพื่อดู store ทั้งหมด (สำหรับ debugging)
  @ApiOperation({ summary: 'Get all stored payments (debug only)' })
  @ApiResponse({
    status: 200,
    description: 'All stored payments',
    schema: {
      type: 'object',
      additionalProperties: true
    }
  })
  @Post('debug/all')
  getAllStoredPayments() {
    const allPayments: Record<string, any> = {};
    paymentsStore.forEach((value, key) => {
      allPayments[key] = value;
    });
    return {
      count: paymentsStore.size,
      payments: allPayments
    };
  }

  // Helper endpoint เพื่อล้าง store (สำหรับ testing)
  @ApiOperation({ summary: 'Clear all stored payments (debug only)' })
  @Post('debug/clear')
  clearAllPayments() {
    const count = paymentsStore.size;
    paymentsStore.clear();
    return { 
      message: `Cleared ${count} stored payments`,
      count 
    };
  }
}