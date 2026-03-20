import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { MapPin, Star, ArrowLeft, Youtube, BookOpen } from "lucide-react";

interface Temple {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
  rating: number;
  points: number;
  image_url: string | null;
  video_url: string | null;
}

const getYouTubeEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  
  return null;
};

const TempleDetail = () => {
  const { templeId } = useParams();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (templeId) {
      fetchTempleDetail();
    }
  }, [templeId]);

  const fetchTempleDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('temples')
        .select('*')
        .eq('id', templeId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Temple not found",
          description: "The requested temple could not be found",
          variant: "destructive",
        });
        return;
      }
      
      setTemple(data);
      // Attempt to read override setting from `temple_settings` table (optional)
      try {
        const { data: settingData, error: settingError } = await (supabase as any)
          .from('temple_settings')
          .select('video_enabled')
          .eq('temple_id', templeId)
          .maybeSingle();

        if (!settingError && settingData && typeof (settingData as any).video_enabled === 'boolean') {
          setVideoEnabled((settingData as any).video_enabled);
        } else {
          setVideoEnabled(Boolean(data.video_url));
        }
      } catch {
        setVideoEnabled(Boolean(data.video_url));
      }
    } catch (error) {
      console.error('Error fetching temple:', error);
      toast({
        title: "Error",
        description: "Failed to load temple details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-12 w-48 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Temple not found</h2>
          <Link to="/knowledge-hub">
            <Button variant="sacred">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/knowledge-hub">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Hub
          </Button>
        </Link>

        {/* Temple Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-sacred bg-clip-text text-transparent mb-4">
            {temple.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{temple.city}, {temple.state}</span>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {temple.rating}
            </Badge>
            <Badge variant="outline">+{temple.points} points</Badge>
          </div>
          {temple.address && (
            <p className="text-sm text-muted-foreground mt-2">{temple.address}</p>
          )}
        </div>

        {/* Temple Image */}
        {temple.image_url && (
          <Card className="mb-8 overflow-hidden">
            <img
              src={temple.image_url}
              alt={temple.name}
              className="w-full h-96 object-cover"
            />
          </Card>
        )}

        {/* YouTube Video Section */}
        {temple.video_url && videoEnabled ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                Temple Video Tour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={getYouTubeEmbedUrl(temple.video_url) || undefined}
                  title={`${temple.name} Video Tour`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Admin video controls: upload and enable/disable */}
        {isAdmin && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                Manage Temple Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input ref={fileRef} type="file" accept="video/*" className="hidden" id="video-upload" />
                  <Button variant="sacred" onClick={() => fileRef.current?.click()}>Choose Video</Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const input = fileRef.current;
                      if (!input || !input.files || input.files.length === 0) {
                        toast({ title: 'No file selected', description: 'Please choose a video file first', variant: 'destructive' });
                        return;
                      }
                      const file = input.files[0];
                      if (!temple) return;
                      setUploading(true);
                      try {
                        const filePath = `temple-videos/${temple.id}/${Date.now()}_${file.name}`;
                        const { data: uploadData, error: uploadError } = await supabase.storage.from('temple-videos').upload(filePath, file, { upsert: true });
                        if (uploadError) {
                          throw uploadError;
                        }

                        const { data: publicData } = supabase.storage.from('temple-videos').getPublicUrl(filePath);
                        const publicUrl = publicData.publicUrl;

                        const { data: updateData, error: updateError } = await supabase
                          .from('temples')
                          .update({ video_url: publicUrl })
                          .eq('id', temple.id)
                          .select()
                          .maybeSingle();

                        if (updateError) throw updateError;
                        setTemple(updateData as any);
                        setVideoEnabled(true);
                        toast({ title: 'Upload Successful', description: 'Video uploaded and linked to temple' });
                      } catch (err: any) {
                        console.error('Upload error', err);
                        toast({ title: 'Upload Failed', description: err.message || String(err), variant: 'destructive' });
                      } finally {
                        setUploading(false);
                      }
                    }}
                    disabled={uploading}
                  >
                    Upload & Link
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm">Video Space Enabled</span>
                  <Switch
                    checked={videoEnabled}
                    onCheckedChange={async (val) => {
                      setVideoEnabled(!!val);
                      if (!temple) return;
                      // Try to persist to `temple_settings` table; if table missing, fallback to warning
                      try {
                        const { data: upsertData, error: upsertError } = await (supabase as any)
                          .from('temple_settings')
                          .upsert({ temple_id: temple.id, video_enabled: !!val }, { onConflict: 'temple_id' });

                        if (upsertError) {
                          // Table likely doesn't exist — notify admin
                          toast({ title: 'Toggle Saved Locally', description: 'Create `temple_settings` table to persist this setting. Falling back to local UI only.', variant: 'destructive' });
                        } else {
                          toast({ title: 'Setting Updated', description: `Video space ${val ? 'enabled' : 'disabled'}` });
                        }
                      } catch (err) {
                        toast({ title: 'Toggle Failed', description: 'Could not persist setting. Ensure `temple_settings` table exists.', variant: 'destructive' });
                      }
                    }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  When disabled, the video area will be hidden from users. Uploading a video will automatically enable the space.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Temple Blog/Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              About {temple.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none dark:prose-invert">
            {temple.description ? (
              <div className="whitespace-pre-wrap">{temple.description}</div>
            ) : (
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {temple.name} is a revered temple located in {temple.city}, {temple.state}. 
                  This sacred place holds immense spiritual significance and attracts devotees from all over the country.
                </p>
                <p>
                  The temple is known for its beautiful architecture and serene atmosphere, 
                  making it an ideal destination for spiritual seekers and pilgrims alike.
                </p>
                <p className="italic">
                  Detailed information and historical context will be added soon.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map Location */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">
                Coordinates: {temple.latitude.toFixed(6)}, {temple.longitude.toFixed(6)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TempleDetail;
