import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, RotateCcw, Mic, MicOff, Sparkles, BookOpen, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { shareItem } from "@/utils/shareUtils";
import divineOm from "@/assets/divine-om.jpg";

interface Achievement {
  id: string;
  target: number;
  completed: boolean;
  date: string;
}

interface Mantra {
  id: string;
  title: string;
  sanskrit_text: string;
  transliteration: string | null;
  translation: string | null;
  benefits: string | null;
  deity: string | null;
  category: string | null;
  audio_url: string | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}

const MantraChanting = () => {
  const [target, setTarget] = useState(108);
  const [count, setCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mantras, setMantras] = useState<Mantra[]>([]);
  const [selectedMantra, setSelectedMantra] = useState<Mantra | null>(null);
  const [mantraDialogOpen, setMantraDialogOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRepeatCount, setAudioRepeatCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites('mantra', user?.id);

  useEffect(() => {
    fetchMantras();
  }, []);

  // Audio playback tracking
  useEffect(() => {
    if (selectedMantra?.audio_url && audioRef.current) {
      const audio = audioRef.current;
      
      const handleEnded = () => {
        if (audioRepeatCount < target - 1) {
          // Increment counter and replay
          setAudioRepeatCount(prev => prev + 1);
          setCount(prev => {
            const newCount = prev + 1;
            if (newCount === target) {
              handleCompletion();
              setIsPlaying(false);
            } else {
              // Replay audio
              audio.currentTime = 0;
              audio.play().catch(err => console.error('Audio play error:', err));
            }
            return newCount;
          });
        } else {
          // Completed all repetitions
          setCount(target);
          handleCompletion();
          setIsPlaying(false);
        }
      };

      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [selectedMantra, audioRepeatCount, target, count]);

  const toggleAudioPlayback = () => {
    if (!selectedMantra?.audio_url) {
      toast({
        title: "No Audio Available",
        description: "This mantra doesn't have audio attached",
        variant: "destructive"
      });
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error('Audio play error:', err);
            toast({
              title: "Audio Error",
              description: "Failed to play audio. Please try again.",
              variant: "destructive"
            });
          });
      }
    }
  };

  const fetchMantras = async () => {
    const { data, error } = await supabase
      .from('mantras')
      .select('*')
      .order('title');

    if (!error && data) {
      setMantras(data);
    }
  };

  const presetTargets = [9, 108, 1008];

  useEffect(() => {
    const storedAchievements = localStorage.getItem('mantra-achievements');
    if (storedAchievements) {
      setAchievements(JSON.parse(storedAchievements));
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        const mantraKeywords = ['om', 'aum', 'namah', 'hare', 'krishna', 'rama', 'shiva', 'ganesha'];
        const hasMantraWord = mantraKeywords.some(keyword => transcript.includes(keyword));
        
        if (hasMantraWord && count < target) {
          setCount(prev => {
            const newCount = prev + 1;
            if (newCount === target) {
              handleCompletion();
            }
            return newCount;
          });
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [count, target]);

  const handleCompletion = () => {
    setIsCompleted(true);
    setShowConfetti(true);
    setIsListening(false);
    playOmSound();
    
    const newAchievement: Achievement = {
      id: Date.now().toString(),
      target,
      completed: true,
      date: new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
    
    const updatedAchievements = [...achievements, newAchievement];
    setAchievements(updatedAchievements);
    localStorage.setItem('mantra-achievements', JSON.stringify(updatedAchievements));
    
    toast({
      title: "🕉️ Mantra Completed!",
      description: `You've successfully chanted ${target} mantras. OM!`,
    });

    setTimeout(() => setShowConfetti(false), 5000);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const playOmSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const resetCounter = () => {
    setCount(0);
    setAudioRepeatCount(0);
    setIsCompleted(false);
    setShowConfetti(false);
    setIsListening(false);
    setIsPlaying(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const manualIncrement = () => {
    if (count < target) {
      setCount(prev => {
        const newCount = prev + 1;
        if (newCount === target) {
          handleCompletion();
        }
        return newCount;
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={divineOm} alt="Divine Om" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-primary/10 to-secondary/20" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-sacred opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-gradient-mystic opacity-20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-temple opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="confetti-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="confetti-piece" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${3 + Math.random() * 2}s` }} />
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 p-4">
        <Button variant="sacred" size="lg" className="fixed left-4 top-24 z-50 shadow-divine" onClick={() => setMantraDialogOpen(true)}>
          <BookOpen className="w-5 h-5 mr-2" />
          Mantras
        </Button>

        <Dialog open={mantraDialogOpen} onOpenChange={setMantraDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-sacred bg-clip-text text-transparent">🕉️ Sacred Mantras</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                {mantras
                  .sort((a, b) => {
                    const aFav = isFavorite(a.id);
                    const bFav = isFavorite(b.id);
                    if (aFav && !bFav) return -1;
                    if (!aFav && bFav) return 1;
                    return 0;
                  })
                  .map((mantra) => (
                    <Card key={mantra.id} className="cursor-pointer hover:shadow-divine transition-divine relative" onClick={() => { setSelectedMantra(mantra); setMantraDialogOpen(false); }}>
                      <div className="absolute top-2 right-2 flex gap-1 z-10">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(mantra.id);
                          }}
                        >
                          <Heart className={`h-3 w-3 ${isFavorite(mantra.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareItem(mantra.title, mantra.translation || mantra.sanskrit_text, window.location.href);
                          }}
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-1 pr-16">{mantra.title}</h3>
                        {mantra.deity && <Badge variant="secondary" className="mb-2">{mantra.deity}</Badge>}
                        <p className="text-sm text-muted-foreground line-clamp-2">{mantra.translation || mantra.sanskrit_text}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {selectedMantra && (
          <Dialog open={!!selectedMantra} onOpenChange={() => setSelectedMantra(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-sacred bg-clip-text text-transparent">{selectedMantra.title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 pr-4">
                  <div className="space-y-4">
                    <div><h4 className="font-semibold text-primary mb-2">Sanskrit:</h4><p className="text-xl font-sanskrit leading-relaxed">{selectedMantra.sanskrit_text}</p></div>
                    {selectedMantra.transliteration && <div><h4 className="font-semibold text-primary mb-2">Transliteration:</h4><p className="text-lg">{selectedMantra.transliteration}</p></div>}
                    {selectedMantra.translation && <div><h4 className="font-semibold text-primary mb-2">Translation:</h4><p className="text-muted-foreground">{selectedMantra.translation}</p></div>}
                    {selectedMantra.benefits && <div><h4 className="font-semibold text-primary mb-2">Benefits:</h4><p className="text-muted-foreground">{selectedMantra.benefits}</p></div>}
                  </div>

                  <Card className="shadow-divine border-primary/20">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-primary mb-4 text-center">Chanting Counter</h4>
                      
                      {/* Audio Player */}
                      {selectedMantra.audio_url && (
                        <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                          <audio 
                            ref={audioRef}
                            src={selectedMantra.audio_url}
                            preload="auto"
                          />
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Audio Mantra</span>
                            <Badge variant="secondary">
                              {audioRepeatCount + 1} / {target}
                            </Badge>
                          </div>
                          <Button 
                            onClick={toggleAudioPlayback}
                            variant={isPlaying ? "destructive" : "default"}
                            className="w-full"
                            disabled={isCompleted}
                          >
                            {isPlaying ? (
                              <><Pause className="h-4 w-4 mr-2" />Pause Audio</>
                            ) : (
                              <><Play className="h-4 w-4 mr-2" />Play Audio Mantra</>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            Audio will automatically repeat {target} times
                          </p>
                        </div>
                      )}
                      
                      <div className="text-center space-y-4">
                        <div className={`text-6xl font-bold ${isCompleted ? 'text-primary' : 'bg-gradient-sacred bg-clip-text text-transparent'}`}>{count}</div>
                        <div className="text-xl font-semibold text-muted-foreground">/ {target}</div>
                        {isCompleted && <Badge className="text-lg px-4 py-2 bg-gradient-sacred text-white">🎉 Completed! 🎉</Badge>}
                        <div className="flex justify-center gap-3 flex-wrap pt-4">
                          <Button onClick={toggleListening} variant={isListening ? "destructive" : "sacred"} size="lg" disabled={isCompleted || isPlaying}>{isListening ? <><MicOff className="h-5 w-5 mr-2" />Stop</> : <><Mic className="h-5 w-5 mr-2" />Voice Chant</>}</Button>
                          <Button onClick={manualIncrement} variant="divine" size="lg" disabled={isCompleted || count >= target || isPlaying}>+1 Manual</Button>
                          <Button onClick={resetCounter} variant="outline" size="lg"><RotateCcw className="h-5 w-5 mr-2" />Reset</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use Voice Chant to count your spoken mantras, or Manual counter for mala beads
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}

        <div className="space-y-8">
          <div className="text-center space-y-4 pt-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-sacred rounded-full shadow-divine mb-4 animate-pulse"><Sparkles className="w-10 h-10 text-white" /></div>
            <h1 className="text-5xl font-bold bg-gradient-sacred bg-clip-text text-transparent">Mantra Chanting</h1>
            <p className="text-lg text-muted-foreground">Chant your sacred mantras with AI-powered counting</p>
          </div>

          <Card className="shadow-divine border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-center text-2xl bg-gradient-sacred bg-clip-text text-transparent">🪷 Set Your Sacred Target</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-2 flex-wrap">{presetTargets.map((preset) => <Button key={preset} variant={target === preset ? "default" : "outline"} onClick={() => setTarget(preset)} disabled={isListening} className="min-w-[80px]">{preset}</Button>)}</div>
              <div className="flex flex-col items-center gap-3"><Input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} disabled={isListening} className="w-40 text-center text-lg font-semibold" min="1" max="10000" /></div>
            </CardContent>
          </Card>

          <Card className={`shadow-divine border-primary/20 bg-card/80 backdrop-blur-sm ${isCompleted ? 'bg-gradient-sacred border-accent shadow-glow' : ''}`}>
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div><div className={`text-9xl font-bold ${isCompleted ? 'text-white drop-shadow-glow' : 'bg-gradient-sacred bg-clip-text text-transparent'}`}>{count}</div><div className={`text-3xl font-semibold mt-4 ${isCompleted ? 'text-white/90' : 'text-muted-foreground'}`}>/ {target}</div></div>
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button onClick={toggleListening} variant={isListening ? "destructive" : "sacred"} size="lg" disabled={isCompleted || isPlaying}>{isListening ? <><MicOff className="h-5 w-5 mr-2" />Stop Voice</> : <><Mic className="h-5 w-5 mr-2" />Voice Chant</>}</Button>
                  {selectedMantra?.audio_url && (
                    <Button onClick={toggleAudioPlayback} variant={isPlaying ? "destructive" : "default"} size="lg" disabled={isCompleted || isListening}>
                      {isPlaying ? <><Pause className="h-4 w-4 mr-2" />Pause Audio</> : <><Play className="h-4 w-4 mr-2" />Play Audio</>}
                    </Button>
                  )}
                  <Button onClick={manualIncrement} variant="divine" size="lg" disabled={isCompleted || count >= target || isPlaying || isListening}>+1 Manual</Button>
                  <Button onClick={resetCounter} variant="outline" size="lg"><RotateCcw className="h-5 w-5 mr-2" />Reset</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {achievements.length > 0 && (
            <Card className="shadow-divine border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardHeader><CardTitle className="text-center text-2xl bg-gradient-sacred bg-clip-text text-transparent">🏆 Sacred Achievements</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">{achievements.slice(-15).reverse().map((achievement) => <div key={achievement.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg border border-muted"><div><div className="font-bold text-lg">{achievement.target.toLocaleString()} Mantras</div><div className="text-sm text-muted-foreground">📅 {achievement.date}</div></div><Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">✓ Completed</Badge></div>)}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <style>{`.confetti-container{position:relative;width:100%;height:100%}.confetti-piece{position:absolute;width:10px;height:10px;background:linear-gradient(45deg,#ff6b6b,#4ecdc4,#45b7d1,#96ceb4,#ffeaa7);animation:confetti-fall linear infinite}@keyframes confetti-fall{0%{transform:translateY(-100vh) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  );
};

export default MantraChanting;
