import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Req,
  Logger,
  UsePipes,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { Request } from "express";
import { DemoService } from "./demo.service";
import { getCache, setCache } from "../common/cache";

@ApiTags("Demo")
@Controller("demo")
export class DemoController {
  private readonly logger = new Logger("DemoController");

  constructor(private readonly demoService: DemoService) {}

  @Get("echo")
  @ApiOperation({ summary: "Echo endpoint with request ID" })
  @ApiQuery({ name: "x", required: false, description: "Echo parameter" })
  @ApiResponse({
    status: 200,
    description: "Returns request ID and echo parameter",
    schema: {
      type: "object",
      properties: {
        requestId: { type: "string" },
        x: { type: "string" },
      },
    },
  })
  echo(@Query("x") x: string, @Req() req: Request & { id: string }) {
    // ดึง request ID จาก middleware
    const requestId = req.id;

    return {
      requestId,
      x: x || null,
    };
  }

  @Get("error")
  @ApiOperation({ summary: "Test error endpoint with request ID logging" })
  @ApiResponse({
    status: 500,
    description: "Forces an internal server error for testing",
  })
  error(@Req() req: Request & { id: string }) {
    const requestId = req.id;

    // Log error พร้อม request ID - ใช้ console.error เพื่อให้แน่ใจว่าเห็น
    console.error(`[${requestId}] Error endpoint called - forcing 500 error`);

    // โยน error
    throw new HttpException(
      {
        message: "Forced error for testing",
        requestId,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  @Get("random")
  @ApiOperation({ summary: "Random value with TTL cache and hit counter" })
  @ApiQuery({ name: "q", required: false, description: "Cache key parameter" })
  @ApiResponse({
    status: 200,
    description: "Returns cached or fresh random value with hit counter",
    schema: {
      type: "object",
      properties: {
        q: { type: "string" },
        value: { type: "number" },
        hits: { type: "number" },
      },
    },
  })
  random(@Query("q") q: string = "") {
    const cacheKey = `rnd:${q}`;

    // ตรวจสอบ cache ก่อน
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }

    // ถ้าไม่มีใน cache ให้เรียก service (จะเพิ่ม hits)
    const fresh = this.demoService.compute(q);

    // เก็บผลลัพธ์ใน cache ด้วย TTL 60 วินาที
    setCache(cacheKey, fresh, 60000);

    return fresh;
  }

  @Get("items")
  @UsePipes() // ปิด validation pipes
  @ApiOperation({ summary: "Paginated items with query validation" })
  @ApiQuery({
    name: "offset",
    required: false,
    type: "number",
    description: "Items to skip",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: "number",
    description: "Items to return",
  })
  @ApiQuery({
    name: "sort",
    required: false,
    enum: ["asc", "desc"],
    description: "Sort order",
  })
  @ApiResponse({
    status: 200,
    description: "Returns paginated list of items with metadata",
    schema: {
      type: "object",
      properties: {
        requestId: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number" },
              name: { type: "string" },
              value: { type: "number" },
            },
          },
        },
        pagination: {
          type: "object",
          properties: {
            offset: { type: "number" },
            limit: { type: "number" },
            total: { type: "number" },
            hasMore: { type: "boolean" },
          },
        },
      },
    },
  })
  getItems(@Req() req: Request & { id: string }, @Query() query: any) {
    const requestId = req.id;

    // Parse and validate parameters with defaults
    const offset = query.offset
      ? Math.max(0, parseInt(query.offset, 10) || 0)
      : 0;
    const limit = query.limit
      ? Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10))
      : 10;
    const sort = query.sort === "desc" ? "desc" : "asc";

    console.log(
      `[${requestId}] GET /demo/items - offset: ${offset}, limit: ${limit}, sort: ${sort}`
    );

    // สร้างข้อมูลตัวอย่าง (ในความเป็นจริงจะมาจาก database)
    const allItems = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000) + 1,
    }));

    // เรียงลำดับตาม sort parameter
    const sortedItems = [...allItems].sort((a, b) => {
      return sort === "desc" ? b.id - a.id : a.id - b.id;
    });

    // Apply pagination
    const paginatedItems = sortedItems.slice(offset, offset + limit);
    const total = sortedItems.length;
    const hasMore = offset + limit < total;

    return {
      requestId,
      items: paginatedItems,
      pagination: {
        offset,
        limit,
        total,
        hasMore,
      },
    };
  }

  @Get('test-pagination')
  @ApiOperation({ summary: 'Simple pagination test without validation' })
  testPagination(@Req() req: any) {
    const requestId = req.id;
    const { offset = 0, limit = 10, sort = 'asc' } = req.query;
    
    console.log(`[${requestId}] GET /demo/test-pagination - offset: ${offset}, limit: ${limit}, sort: ${sort}`);
    
    // Parse parameters safely
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const sortOrder = (sort === 'desc') ? 'desc' : 'asc';

    // สร้างข้อมูลตัวอย่าง
    const allItems = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000) + 1
    }));

    // เรียงลำดับ
    const sortedItems = [...allItems].sort((a, b) => {
      return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
    });

    // Apply pagination
    const paginatedItems = sortedItems.slice(parsedOffset, parsedOffset + parsedLimit);
    const total = sortedItems.length;
    const hasMore = parsedOffset + parsedLimit < total;

    return {
      requestId,
      items: paginatedItems,
      pagination: {
        offset: parsedOffset,
        limit: parsedLimit,
        total,
        hasMore
      }
    };
  }
}
