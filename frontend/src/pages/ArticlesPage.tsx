import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDebounce } from "../hooks/useDebounce";
import { fetchWrapper } from "../utils/fetchWrapper";
import { useAuthStore } from "../store/authStore";

interface Article {
  id: number;
  title: string;
  content?: string;
  author: string;
  publishedAt: string;
  tags: string[];
  excerpt?: string;
}

const mockArticles: Article[] = [
  {
    id: 1,
    title: "Introduction to React Hooks",
    content:
      "React Hooks are functions that let you use state and other React features without writing a class. This comprehensive guide covers useState, useEffect, and custom hooks...",
    author: "John Doe",
    publishedAt: "2023-09-15",
    tags: ["react", "hooks", "javascript"],
  },
  {
    id: 2,
    title: "Building REST APIs with Node.js",
    content:
      "Learn how to create robust REST APIs using Node.js and Express. This tutorial covers routing, middleware, database integration, and best practices...",
    author: "Jane Smith",
    publishedAt: "2023-09-20",
    tags: ["nodejs", "express", "api"],
  },
  {
    id: 3,
    title: "TypeScript Best Practices",
    content:
      "TypeScript enhances JavaScript by adding static types. Discover best practices for type definitions, interfaces, generics, and advanced typing techniques...",
    author: "Mike Johnson",
    publishedAt: "2023-09-25",
    tags: ["typescript", "javascript", "types"],
  },
  {
    id: 4,
    title: "CSS Grid vs Flexbox",
    content:
      "Understanding when to use CSS Grid versus Flexbox can make your layouts more efficient. This article compares both layout systems with practical examples...",
    author: "Sarah Wilson",
    publishedAt: "2023-10-01",
    tags: ["css", "layout", "grid", "flexbox"],
  },
  {
    id: 5,
    title: "Database Optimization Techniques",
    content:
      "Improve your database performance with indexing strategies, query optimization, and proper schema design. Learn about SQL optimization and NoSQL best practices...",
    author: "David Brown",
    publishedAt: "2023-10-05",
    tags: ["database", "sql", "optimization"],
  },
];

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const { isAuthenticated } = useAuthStore();

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Load articles from API with localStorage fallback
  const loadArticles = async (searchQuery?: string) => {
    try {
      // Use different loading states for initial load vs search
      if (searchQuery) {
        setSearching(true);
      } else if (articles.length === 0) {
        setLoading(true);
      }

      const endpoint = searchQuery
        ? `/articles?search=${encodeURIComponent(searchQuery)}`
        : "/articles";
      const response = await fetchWrapper.get(endpoint);

      // API returns articles in response.data.articles format
      if (
        response.data &&
        (response.data as any).articles &&
        Array.isArray((response.data as any).articles)
      ) {
        const apiResponse = response.data as {
          articles: Article[];
          total: number;
          searchTerm: string;
        };
        setArticles(apiResponse.articles);
        // Cache successful API response
        localStorage.setItem("articles", JSON.stringify(apiResponse.articles));
        return;
      }
    } catch (error) {
      console.error("API call failed, falling back to localStorage:", error);

      // Only show fallback errors for initial load, not search
      if (!searchQuery) {
        // Fallback to localStorage
        try {
          const cached = localStorage.getItem("articles");
          if (cached) {
            const cachedArticles = JSON.parse(cached);
            setArticles(cachedArticles);
            toast.error("⚠️ API unavailable, showing cached articles");
            return;
          }
        } catch (cacheError) {
          console.error("Error loading from localStorage:", cacheError);
        }

        // Final fallback to mock data
        setArticles(mockArticles);
        localStorage.setItem("articles", JSON.stringify(mockArticles));
        toast.error("⚠️ API unavailable, showing default articles");
      } else {
        // For search errors, just keep existing articles
        console.log("Search failed, keeping existing articles");
      }
    } finally {
      if (searchQuery) {
        setSearching(false);
      } else if (articles.length === 0) {
        setLoading(false);
      }
    }
  };

  // Load article detail from API
  const loadArticleDetail = async (articleId: number) => {
    try {
      setLoadingDetail(true);
      const response = await fetchWrapper.get(`/articles/${articleId}`);

      if (response.data) {
        // Debug: log the response to see what we're getting
        console.log('Article detail API response:', response.data);
        
        // API returns article detail in response.data.article format
        const apiResponse = response.data as { article: Article };
        if (apiResponse.article) {
          console.log('Setting selected article:', apiResponse.article);
          setSelectedArticle(apiResponse.article);
        } else {
          console.log('No article field, trying direct response:', response.data);
          // Fallback if direct response format
          setSelectedArticle(response.data as Article);
        }
        return;
      }
    } catch (error) {
      console.error("Failed to load article detail:", error);
      toast.error("⚠️ Failed to load article details");

      // Fallback to existing article data from list
      const existingArticle = articles.find((a) => a.id === articleId);
      if (existingArticle) {
        console.log('Using fallback article from list:', existingArticle);
        setSelectedArticle(existingArticle);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  // Load articles on component mount
  useEffect(() => {
    loadArticles();
  }, []);

  // Handle search with debounce - only run when debouncedSearchTerm changes and is different from the last search
  useEffect(() => {
    // Skip if this is the initial render with empty search term
    if (debouncedSearchTerm === "" && articles.length === 0) return;

    // Always call API for search (empty search gets all articles)
    loadArticles(debouncedSearchTerm || undefined);
  }, [debouncedSearchTerm]);

  // Create dummy article for testing authentication
  const createDummyArticle = async () => {
    if (!isAuthenticated) {
      toast.error("กรุณา Login ก่อนทำรายการ");
      return;
    }

    setCreating(true);
    try {
      const dummyArticle = {
        title: `Test Article ${Date.now()}`,
        content: `This is a dummy article created for testing authentication. Created at ${new Date().toLocaleString()}`,
        author: "Test User",
        tags: ["test", "auth", "dummy"],
      };

      const response = await fetchWrapper.get(
        `/demo/echo?x=test-auth-${Date.now()}&title=${encodeURIComponent(
          dummyArticle.title
        )}`
      );

      if (response.data) {
        toast.success("✅ สร้าง Dummy Article สำเร็จ! (Echo Response)");

        // เพิ่ม article ใหม่ลง localStorage และ state
        const newArticle: Article = {
          id: Date.now(),
          title: dummyArticle.title,
          content: dummyArticle.content,
          author: dummyArticle.author,
          publishedAt: new Date().toISOString().split("T")[0],
          tags: dummyArticle.tags,
        };

        const updatedArticles = [newArticle, ...articles];
        setArticles(updatedArticles);
        localStorage.setItem("articles", JSON.stringify(updatedArticles));
      }
    } catch (error: any) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        toast.error("🚫 กรุณา Login ก่อนทำรายการ");
      } else {
        toast.error(`❌ เกิดข้อผิดพลาด: ${error.message}`);
      }
      console.error("Create dummy article error:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleArticleClick = (article: Article) => {
    // Use API to get full article details
    loadArticleDetail(article.id);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading articles...</div>
      </div>
    );
  }

  // Detail View
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={handleBackToList}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
          >
            ← Back to Articles
          </button>

          {loadingDetail ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ) : selectedArticle ? (
            <article className="bg-white rounded-lg shadow-md p-8">
              <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedArticle.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>By {selectedArticle.author}</span>
                  <span>
                    Published:{" "}
                    {new Date(selectedArticle.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  )) || <span className="text-sm text-gray-500">No tags</span>}
                </div>
              </header>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {selectedArticle.content ||
                    selectedArticle.excerpt ||
                    "Content not available"}
                </p>
              </div>
            </article>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center text-gray-500">
                Article not found
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Articles</h1>

            {/* Create Dummy Article Button */}
            <button
              onClick={createDummyArticle}
              disabled={creating || !isAuthenticated}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isAuthenticated && !creating
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {creating ? "⏳ Creating..." : "✨ Create Dummy Article"}
            </button>
          </div>

          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-sm text-yellow-800">
              💡 <strong>Authentication Test:</strong> ปุ่ม "Create Dummy
              Article" จะทำงานได้เมื่อ login แล้วเท่านั้น
            </div>
          )}

          {/* Search Input */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            {searching && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
            {searchTerm && !searching && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {debouncedSearchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              {articles.length} result(s) for "{debouncedSearchTerm}"
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {debouncedSearchTerm
                ? "No articles found matching your search."
                : "No articles available."}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article: Article) => (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h2>

                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {article.excerpt || article.content}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags?.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  )) || <span className="text-xs text-gray-500">No tags</span>}
                  {article.tags && article.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{article.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>By {article.author}</span>
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;
