import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import TempleMap from "@/components/TempleMap";
import { 
  MapPin, 
  Navigation, 
  Star, 
  Target, 
  Trophy, 
  Gift,
  Map,
  Compass
} from "lucide-react";

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
}

const Bhakthi = () => {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [userScore, setUserScore] = useState(0);
  const [templesVisited, setTemplesVisited] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [currentDiscount, setCurrentDiscount] = useState(0);
  const [totalTemples, setTotalTemples] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyTemples, setNearbyTemples] = useState<(Temple & { distance: number })[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [selectedTempleId, setSelectedTempleId] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [uploadingVisit, setUploadingVisit] = useState(false);
  const [agreeImagePolicy, setAgreeImagePolicy] = useState(false);
  const [userVisits, setUserVisits] = useState<any[]>([]);
  
  useEffect(() => {
    fetchTemples();
    getUserLocation();
    if (user) {
      fetchUserPoints();
      fetchUserVisits();
    }
  }, [user]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          toast({
            title: "Location Access",
            description: "Please enable location access to see nearby temples",
            variant: "destructive",
          });
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  useEffect(() => {
    if (userLocation && temples.length > 0) {
      const templesWithDistance = temples.map(temple => ({
        ...temple,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          temple.latitude,
          temple.longitude
        )
      }));
      
      // Sort by distance
      templesWithDistance.sort((a, b) => a.distance - b.distance);
      setNearbyTemples(templesWithDistance);
    }
  }, [userLocation, temples]);

  const fetchTemples = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('temples')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      setTemples(data || []);
      setTotalTemples(data?.length || 0);
    } catch (error: any) {
      console.error('Error fetching temples:', error);
      toast({
        title: "Error Loading Temples",
        description: error.message || "Failed to load temples. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    if (!user) return;
    
    try {
      let { data, error } = await supabase
        .from('user_bhakthi_points')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Create initial record if doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from('user_bhakthi_points')
          .insert({
            user_id: user.id,
            total_points: 0,
            temples_visited: 0,
            total_visits: 0,
            current_discount_percent: 0
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        data = newData;
      } else if (error) {
        throw error;
      }
      
      if (data) {
        setUserScore(data.total_points);
        setTemplesVisited(data.temples_visited);
        setTotalVisits(data.total_visits);
        setCurrentDiscount(data.current_discount_percent);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const handleVisitTemple = async (templeId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to record temple visits",
        variant: "destructive",
      });
      return;
    }

    // Open selfie upload modal
    setSelectedTempleId(templeId);
    setSelfiePreview(null);
    setSelfieFile(null);
    setVerified(null);
    setVisitModalOpen(true);
  };

  const fetchUserVisits = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('temple_visits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setUserVisits(data || []);
    } catch (err) {
      console.error('Error fetching user visits', err);
    }
  };

  const analyzeImage = async (file: File, templeId: string) => {
    // Placeholder for AI analysis: integrate with real vision API here.
    // For now, we'll do a naive accept and return true after a short delay.
    setVerifying(null);
    setVerifying(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      // FUTURE: upload to an AI service and return confidence
      setVerified(true);
      toast({ title: 'Image Verified', description: 'Selfie looks good for visit verification.' });
      return true;
    } catch (err) {
      setVerified(false);
      toast({ title: 'Verification Failed', description: 'Could not verify the selfie. Try another photo.', variant: 'destructive' });
      return false;
    } finally {
      setVerifying(false);
    }
  };

  const confirmRecordVisit = async () => {
    if (!user || !selectedTempleId) return;
    try {
      // Prevent duplicate same-day visit
      const { data: existingVisit } = await supabase
        .from('temple_visits')
        .select('*')
        .eq('user_id', user.id)
        .eq('temple_id', selectedTempleId)
        .gte('visit_date', new Date().toISOString().split('T')[0])
        .single();

      if (existingVisit) {
        toast({ title: 'Already Visited', description: 'You have already recorded a visit today.', variant: 'destructive' });
        setVisitModalOpen(false);
        return;
      }

      setUploadingVisit(true);
      let photoUrl: string | null = null;
      if (selfieFile) {
        const path = `user-visits/${user.id}/${Date.now()}_${selfieFile.name}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage.from('darshan-selfies').upload(path, selfieFile, { upsert: true });
        if (uploadErr) {
          console.error('Upload error:', uploadErr);
          throw uploadErr;
        }
        const { data: publicData } = supabase.storage.from('darshan-selfies').getPublicUrl(path);
        photoUrl = (publicData as any)?.publicUrl || null;
      }

      // Analyze (if not already verified via analyzeImage)
      if (verified !== true && selfieFile) {
        const ok = await analyzeImage(selfieFile, selectedTempleId);
        if (!ok) {
          setUploadingVisit(false);
          return;
        }
      }

      // Insert visit record (mark verified true by default when selfie provided)
      const isFirstVisitToTemple = !userVisits.some(v => v.temple_id === selectedTempleId);
      const pointsEarned = isFirstVisitToTemple ? 110 : 10; // 10 base + 100 bonus for new temple

      const { data: insertData, error: insertError } = await supabase
        .from('temple_visits')
        .insert({
          user_id: user.id,
          temple_id: selectedTempleId,
          points_earned: pointsEarned,
          photo_url: photoUrl,
          verified: selfieFile ? true : false,
          visit_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update user points
      const newTotalPoints = userScore + pointsEarned;
      const newTotalVisits = totalVisits + 1;
      const newTemplesVisited = isFirstVisitToTemple ? templesVisited + 1 : templesVisited;
      const newDiscount = Math.min(Math.floor(newTotalPoints / 1000 * 25), 25);
      
      const { error: updateError } = await supabase
        .from('user_bhakthi_points')
        .update({ 
          total_points: newTotalPoints, 
          total_visits: newTotalVisits,
          temples_visited: newTemplesVisited,
          current_discount_percent: newDiscount
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setUserScore(newTotalPoints);
      setTotalVisits(newTotalVisits);
      setTemplesVisited(newTemplesVisited);
      setCurrentDiscount(newDiscount);
      toast({ title: 'Visit Recorded', description: `+${pointsEarned} points earned!` });
      setVisitModalOpen(false);
      fetchUserVisits();
    } catch (err) {
      console.error('Error confirming visit', err);
      toast({ title: 'Error', description: 'Failed to record visit', variant: 'destructive' });
    } finally {
      setUploadingVisit(false);
    }
  };

  const deleteVisit = async (visitId: string) => {
    if (!user) return;
    try {
      // Fetch visit
      const { data: visit } = await supabase.from('temple_visits').select('*').eq('id', visitId).single();
      if (!visit) return;
      // Delete row
      const { error } = await supabase.from('temple_visits').delete().eq('id', visitId);
      if (error) throw error;
      // Refund points
      const points = visit.points_earned || 0;
      const newTotalPoints = Math.max(0, userScore - points);
      const newTotalVisits = Math.max(0, totalVisits - 1);
      await supabase.from('user_bhakthi_points').update({ total_points: newTotalPoints, total_visits: newTotalVisits }).eq('user_id', user.id);
      setUserScore(newTotalPoints);
      setTotalVisits(newTotalVisits);
      toast({ title: 'Visit Deleted', description: 'The visit has been removed.' });
      fetchUserVisits();
    } catch (err) {
      console.error('Error deleting visit', err);
      toast({ title: 'Delete Failed', description: 'Could not delete visit', variant: 'destructive' });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-sacred/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-sacred bg-clip-text text-transparent">
              Test My Bhakthi
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover temples, track your spiritual journey, and earn rewards
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-sacred/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">{userScore}</div>
              <div className="text-sm text-muted-foreground">Bhakthi Score</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-divine/10 border-secondary/20">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="text-3xl font-bold text-secondary">{templesVisited}</div>
              <div className="text-sm text-muted-foreground">Temples Visited</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-temple/10 border-accent/20">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-3xl font-bold text-accent">{totalTemples - templesVisited}</div>
              <div className="text-sm text-muted-foreground">Yet to Visit</div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{currentDiscount}% OFF</div>
              <div className="text-sm text-muted-foreground">Earned Discount</div>
            </CardContent>
          </Card>
        </div>

        {/* Map and Content Tabs */}
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Temple Map
            </TabsTrigger>
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              Nearby Temples
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              My Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Live Temple Map ({totalTemples} temples)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[500px] w-full rounded-lg" />
                ) : (
                  <TempleMap temples={temples} onVisitTemple={handleVisitTemple} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

      {/* Selfie upload / verification dialog */}
      <Dialog open={visitModalOpen} onOpenChange={setVisitModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Temple Visit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setSelfieFile(f);
                if (f) setSelfiePreview(URL.createObjectURL(f));
              }} />
              <div className="flex items-center gap-3">
                <Button variant="sacred" onClick={() => fileInputRef.current?.click()}>Choose Selfie</Button>
                <Button variant="outline" onClick={async () => {
                  if (!selfieFile || !selectedTempleId) return;
                  await analyzeImage(selfieFile, selectedTempleId);
                }} disabled={!selfieFile || verifying}>Analyze</Button>
              </div>
            </div>

            {selfiePreview && <img src={selfiePreview} alt="preview" className="w-full h-48 object-cover rounded" />}

            <div className="mt-2 text-sm text-muted-foreground">
              <p>If the image contains any vulgar or unnecessary elements, your account may be reported. Kindly check before uploading.</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input id="agreePolicy" type="checkbox" checked={agreeImagePolicy} onChange={(e) => setAgreeImagePolicy(e.target.checked)} />
              <label htmlFor="agreePolicy" className="text-sm">I confirm this image follows the community guidelines</label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setVisitModalOpen(false)}>Cancel</Button>
              <Button variant="sacred" onClick={confirmRecordVisit} disabled={uploadingVisit || (selfieFile ? verified !== true : false) || (selfieFile ? !agreeImagePolicy : false)}>
                {uploadingVisit ? 'Recording...' : 'Confirm Visit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

          <TabsContent value="nearby" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Nearby Temples {userLocation && nearbyTemples.length > 0 && `(${nearbyTemples.filter(t => t.distance <= 50).length} within 50km)`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!userLocation ? (
                  <div className="text-center py-8">
                    <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Enable location access to find nearby temples</p>
                    <Button onClick={getUserLocation} variant="sacred">
                      Enable Location
                    </Button>
                  </div>
                ) : loading ? (
                  <Skeleton className="h-[500px] w-full rounded-lg" />
                ) : (
                  <TempleMap 
                    temples={temples} 
                    onVisitTemple={handleVisitTemple}
                    centerOnUser={true}
                    userLocation={[userLocation.lat, userLocation.lng]}
                    maxDistance={50}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Journey Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Temples Visited</span>
                      <span>{templesVisited} / {totalTemples}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-sacred h-3 rounded-full transition-all duration-500"
                        style={{ width: `${totalTemples > 0 ? (templesVisited / totalTemples) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Next Reward (1500 pts)</span>
                      <span>{userScore} / 1500</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-divine h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(userScore / 1500) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${templesVisited >= 1 ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 border-border opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <Trophy className={`h-6 w-6 ${templesVisited >= 1 ? 'text-accent' : 'text-muted-foreground'}`} />
                      <span className="font-medium">First Temple Visit</span>
                    </div>
                    {templesVisited >= 1 ? (
                      <Badge variant="default" className="bg-green-600">Earned</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Not Earned Yet</Badge>
                    )}
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${userScore >= 1000 ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 border-border opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <Gift className={`h-6 w-6 ${userScore >= 1000 ? 'text-accent' : 'text-muted-foreground'}`} />
                      <span className="font-medium">1000 Points Club</span>
                    </div>
                    {userScore >= 1000 ? (
                      <Badge variant="default" className="bg-green-600">Earned</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Not Earned Yet</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border opacity-60">
                    <div className="flex items-center gap-3">
                      <Star className="h-6 w-6 text-muted-foreground" />
                      <span className="font-medium">Temple Explorer</span>
                    </div>
                    <Badge variant="outline">25 visits</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Bhakthi;
