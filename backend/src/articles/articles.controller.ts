import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  tags: string[];
  excerpt: string;
}

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  private articles: Article[] = [
    {
      id: 1,
      title: "Introduction to React Hooks",
      content: "React Hooks are functions that let you use state and other React features without writing a class. This comprehensive guide covers useState, useEffect, and custom hooks. useState is the most basic hook that allows you to add state to functional components. useEffect lets you perform side effects in function components, replacing lifecycle methods like componentDidMount and componentWillUnmount. Custom hooks enable you to extract component logic into reusable functions that can be shared across multiple components.",
      author: "John Doe",
      publishedAt: "2023-09-15",
      tags: ["react", "hooks", "javascript", "frontend"],
      excerpt: "A comprehensive guide to React Hooks covering useState, useEffect, and custom hooks for modern React development."
    },
    {
      id: 2,
      title: "Building REST APIs with Node.js",
      content: "Learn how to create robust REST APIs using Node.js and Express. This tutorial covers routing, middleware, database integration, and best practices. We'll start with setting up a basic Express server, then move on to creating routes for different HTTP methods. Middleware functions are essential for handling authentication, logging, and error handling. Database integration using ORMs like Sequelize or TypeORM makes data management much easier.",
      author: "Jane Smith",
      publishedAt: "2023-09-20",
      tags: ["nodejs", "express", "api", "backend"],
      excerpt: "Complete tutorial on creating robust REST APIs with Node.js, Express, middleware, and database integration."
    },
    {
      id: 3,
      title: "TypeScript Best Practices",
      content: "TypeScript enhances JavaScript by adding static types. Discover best practices for type definitions, interfaces, generics, and advanced typing techniques. Start with basic type annotations for variables and function parameters. Interfaces help define the shape of objects and can be extended for more complex scenarios. Generics provide type safety while maintaining flexibility. Advanced types like conditional types and mapped types enable powerful type transformations.",
      author: "Mike Johnson",
      publishedAt: "2023-09-25",
      tags: ["typescript", "javascript", "types", "development"],
      excerpt: "Essential TypeScript best practices including interfaces, generics, and advanced typing techniques."
    },
    {
      id: 4,
      title: "CSS Grid vs Flexbox",
      content: "Understanding when to use CSS Grid versus Flexbox can make your layouts more efficient. This article compares both layout systems with practical examples. Flexbox is designed for one-dimensional layouts, perfect for navigation bars, button groups, and centering content. CSS Grid excels at two-dimensional layouts, ideal for page layouts, card grids, and complex responsive designs. Often, the best approach is to use both together.",
      author: "Sarah Wilson",
      publishedAt: "2023-10-01",
      tags: ["css", "layout", "grid", "flexbox", "frontend"],
      excerpt: "Comprehensive comparison of CSS Grid and Flexbox with practical examples and use cases."
    },
    {
      id: 5,
      title: "Database Optimization Techniques",
      content: "Improve your database performance with indexing strategies, query optimization, and proper schema design. Learn about SQL optimization and NoSQL best practices. Proper indexing can dramatically improve query performance, but over-indexing can slow down writes. Query optimization involves analyzing execution plans and rewriting inefficient queries. Schema design should consider normalization vs denormalization tradeoffs based on your application's read/write patterns.",
      author: "David Brown",
      publishedAt: "2023-10-05",
      tags: ["database", "sql", "optimization", "performance", "backend"],
      excerpt: "Essential database optimization techniques covering indexing, query optimization, and schema design."
    },
    {
      id: 6,
      title: "Modern JavaScript ES2024 Features",
      content: "Explore the latest JavaScript features introduced in ES2024. This includes new array methods, improved async operations, and enhanced object manipulation. The new array methods like groupBy() and toReversed() provide more functional programming options. Promise.withResolvers() offers better control over promise creation. The pipeline operator (when available) will revolutionize function composition.",
      author: "Alex Chen",
      publishedAt: "2024-01-15",
      tags: ["javascript", "es2024", "features", "frontend"],
      excerpt: "Latest JavaScript ES2024 features including new array methods and async improvements."
    },
    {
      id: 7,
      title: "Microservices Architecture Patterns",
      content: "Learn essential patterns for building scalable microservices. This guide covers service discovery, API gateways, circuit breakers, and distributed data management. Service discovery helps services find and communicate with each other dynamically. API gateways provide a single entry point and handle cross-cutting concerns. Circuit breakers prevent cascade failures by failing fast when downstream services are unavailable.",
      author: "Lisa Rodriguez",
      publishedAt: "2024-02-10",
      tags: ["microservices", "architecture", "patterns", "scalability", "backend"],
      excerpt: "Essential microservices patterns for building scalable distributed systems."
    },
    {
      id: 8,
      title: "React Performance Optimization",
      content: "Optimize your React applications for better performance. Learn about memoization, code splitting, lazy loading, and the React Profiler. React.memo prevents unnecessary re-renders of functional components. useMemo and useCallback memoize expensive computations and function references. Code splitting with React.lazy and Suspense reduces initial bundle size. The React Profiler helps identify performance bottlenecks.",
      author: "Tom Anderson",
      publishedAt: "2024-03-05",
      tags: ["react", "performance", "optimization", "frontend"],
      excerpt: "Complete guide to React performance optimization techniques and best practices."
    }
  ];

    @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new article' })
  @ApiBody({
    description: 'Article data',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        author: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } }
      },
      required: ['title', 'content', 'author']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Article created successfully',
    schema: {
      type: 'object',
      properties: {
        requestId: { type: 'string' },
        article: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            content: { type: 'string' },
            author: { type: 'string' },
            publishedAt: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            excerpt: { type: 'string' }
          }
        },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        error: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createArticle(
    @Body() articleData: { title: string; content: string; author: string; tags?: string[] },
    @Req() req: Request & { id: string }
  ) {
    const requestId = req.id;

    console.log(`[${requestId}] POST /articles - Creating new article:`, articleData);

    // Validate required fields
    if (!articleData.title || !articleData.content || !articleData.author) {
      throw new HttpException({
        requestId,
        error: 'Bad request',
        message: 'Title, content, and author are required'
      }, HttpStatus.BAD_REQUEST);
    }

    // Generate new ID (in real app, this would be handled by database)
    const newId = Math.max(...this.articles.map(a => a.id), 0) + 1;

    // Create excerpt from content (first 150 characters)
    const excerpt = articleData.content.length > 150
      ? articleData.content.substring(0, 150) + '...'
      : articleData.content;

    // Create new article
    const newArticle: Article = {
      id: newId,
      title: articleData.title,
      content: articleData.content,
      author: articleData.author,
      publishedAt: new Date().toISOString().split('T')[0],
      tags: articleData.tags || [],
      excerpt
    };

    // Add to articles array
    this.articles.unshift(newArticle); // Add to beginning

    console.log(`[${requestId}] Created article with ID ${newId}`);

    return {
      requestId,
      article: newArticle,
      message: 'Article created successfully'
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles with optional search' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for article titles and content' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of articles matching search criteria',
    schema: {
      type: 'object',
      properties: {
        requestId: { type: 'string' },
        articles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              excerpt: { type: 'string' },
              author: { type: 'string' },
              publishedAt: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        total: { type: 'number' },
        searchTerm: { type: 'string' }
      }
    }
  })
  getArticles(@Query('search') search: string = '', @Req() req: Request & { id: string }) {
    const requestId = req.id;

    console.log(`[${requestId}] GET /articles - search: "${search}"`);

    let filteredArticles = this.articles;

    // Apply search filter
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filteredArticles = this.articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.author.toLowerCase().includes(searchTerm) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Return list format (no full content)
    const articleList = filteredArticles.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      author: article.author,
      publishedAt: article.publishedAt,
      tags: article.tags
    }));

    return {
      requestId,
      articles: articleList,
      total: articleList.length,
      searchTerm: search
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({ name: 'id', description: 'Article ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Returns article details',
    schema: {
      type: 'object',
      properties: {
        requestId: { type: 'string' },
        article: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            content: { type: 'string' },
            author: { type: 'string' },
            publishedAt: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            excerpt: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  getArticleById(@Param('id') id: string, @Req() req: Request & { id: string }) {
    const requestId = req.id;
    const articleId = parseInt(id, 10);

    console.log(`[${requestId}] GET /articles/${articleId}`);

    const article = this.articles.find(a => a.id === articleId);

    if (!article) {
      return {
        requestId,
        error: 'Article not found',
        message: `Article with ID ${articleId} does not exist`
      };
    }

    return {
      requestId,
      article
    };
  }
}