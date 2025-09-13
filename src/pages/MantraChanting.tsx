import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  target: number;
  completed: boolean;
  date: string;
}

// Speech Recognition types
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
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const presetTargets = [9, 108, 1008];

  useEffect(() => {
    // Load achievements from localStorage
    const storedAchievements = localStorage.getItem('mantra-achievements');
    if (storedAchievements) {
      setAchievements(JSON.parse(storedAchievements));
    }

    // Setup speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        // Check for common mantra words
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
    
    // Play OM sound (using Web Audio API for OM chant)
    playOmSound();
    
    // Save achievement
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

    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const playOmSound = () => {
    try {
      // Create a simple OM sound using Web Audio API
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
    setIsCompleted(false);
    setShowConfetti(false);
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="confetti-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-sacred bg-clip-text text-transparent">
            🕉️ Mantra Chanting
          </h1>
          <p className="text-muted-foreground">
            Chant your mantras with AI-powered counting
          </p>
        </div>

        {/* Target Selection */}
        <Card className="shadow-sacred">
          <CardHeader>
            <CardTitle className="text-center">Set Your Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-2 flex-wrap">
              {presetTargets.map((preset) => (
                <Button
                  key={preset}
                  variant={target === preset ? "default" : "outline"}
                  onClick={() => setTarget(preset)}
                  disabled={isListening}
                  className="min-w-[80px]"
                >
                  {preset}
                </Button>
              ))}
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="text-sm text-muted-foreground">Or set custom target:</div>
              <Input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                disabled={isListening}
                className="w-40 text-center text-lg font-semibold"
                min="1"
                max="10000"
                placeholder="Enter count..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Counter Display */}
        <Card className={`shadow-divine transition-all duration-500 ${
          isCompleted ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300' : ''
        }`}>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className={`text-8xl font-bold transition-all duration-500 ${
                  isCompleted ? 'text-green-600' : 'bg-gradient-sacred bg-clip-text text-transparent'
                }`}>
                  {count}
                </div>
                <div className="text-2xl text-muted-foreground mt-2">
                  / {target}
                </div>
                {isCompleted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="secondary" className="text-lg px-4 py-2 bg-green-100 text-green-800">
                      🎉 COMPLETED! 🎉
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "default"}
                  size="lg"
                  disabled={isCompleted}
                  className="min-w-[120px]"
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-5 w-5 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Start
                    </>
                  )}
                </Button>

                <Button
                  onClick={manualIncrement}
                  variant="outline"
                  size="lg"
                  disabled={isCompleted || count >= target}
                >
                  +1 Manual
                </Button>

                <Button
                  onClick={resetCounter}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </div>

              {isListening && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <div className="animate-pulse">🎤</div>
                  <span className="text-sm">Listening for mantras...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements Panel - Enhanced with Date/Time */}
        {achievements.length > 0 && (
          <Card className="shadow-sacred">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                🏆 Recent Achievements
                <Badge variant="secondary" className="ml-2">
                  {achievements.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {achievements.slice(-15).reverse().map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-muted/30 to-muted/50 rounded-lg border border-muted hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-sacred rounded-full flex items-center justify-center shadow-md">
                          <span className="text-xl">🕉️</span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="font-bold text-lg text-foreground">
                          {achievement.target.toLocaleString()} Mantras
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          📅 {achievement.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        ✓ Completed
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        #{achievements.length - index}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {achievements.length > 15 && (
                <div className="text-center mt-4 text-sm text-muted-foreground">
                  Showing latest 15 of {achievements.length} achievements
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <style>{`
        .confetti-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
          animation: confetti-fall linear infinite;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default MantraChanting;