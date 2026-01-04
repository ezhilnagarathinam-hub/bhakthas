import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

const Blog = () => {
  const blogPosts = [
    {
      title: "The Significance of Temple Visits in Hindu Culture",
      excerpt: "Discover why visiting temples is an integral part of Hindu spiritual practice and how it benefits the mind, body, and soul.",
      date: "January 1, 2026",
      category: "Spirituality",
      image: "🕉️"
    },
    {
      title: "Top 10 Ancient Temples in South India",
      excerpt: "Explore the architectural marvels and spiritual significance of the most revered temples in South India.",
      date: "December 28, 2025",
      category: "Travel",
      image: "🛕"
    },
    {
      title: "Benefits of Daily Mantra Chanting",
      excerpt: "Learn how regular mantra chanting can improve your mental clarity, reduce stress, and enhance spiritual growth.",
      date: "December 20, 2025",
      category: "Wellness",
      image: "🧘"
    },
    {
      title: "Understanding Darshan: More Than Just a Visit",
      excerpt: "What does it truly mean to receive darshan? Explore the deeper meaning behind this sacred practice.",
      date: "December 15, 2025",
      category: "Knowledge",
      image: "👁️"
    },
    {
      title: "Preparing for Your Temple Visit: A Complete Guide",
      excerpt: "Everything you need to know before visiting a temple - dress code, rituals, offerings, and etiquette.",
      date: "December 10, 2025",
      category: "Guide",
      image: "📖"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-primary mb-2">Bhakthas Blog</h1>
        <p className="text-muted-foreground mb-8">Spiritual insights, temple guides, and cultural wisdom</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-5xl mb-4">{post.image}</div>
                <Badge variant="secondary" className="w-fit mb-2">{post.category}</Badge>
                <CardTitle className="text-lg">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
