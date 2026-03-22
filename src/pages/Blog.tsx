import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("blog_posts").select("*").eq("is_published", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-primary mb-2">Bhakthas Blog</h1>
        <p className="text-muted-foreground mb-8">Spiritual insights, temple guides, and cultural wisdom</p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !blogPosts?.length ? (
          <p className="text-center text-muted-foreground py-12">No blog posts yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post: any) => (
              <Card key={post.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedPost(post)}>
                <CardHeader>
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                  ) : (
                    <div className="w-full h-48 bg-primary/10 rounded-lg mb-4 flex items-center justify-center text-5xl">📝</div>
                  )}
                  {post.category && <Badge variant="secondary" className="w-fit mb-2">{post.category}</Badge>}
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          {selectedPost?.image_url && <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-64 object-cover rounded-lg" />}
          {selectedPost?.category && <Badge variant="secondary" className="w-fit">{selectedPost.category}</Badge>}
          <p className="text-sm text-muted-foreground">
            {selectedPost && new Date(selectedPost.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">{selectedPost?.content}</div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Blog;
