import React, { useEffect, useState, useRef } from "react";
import { X, Play, Pause, Volume2, RotateCcw, AlertTriangle, Video, Music, BookOpen, Clock } from "lucide-react";
import { RuleBook } from "../types";
import { motion } from "motion/react";

interface RuleBookDetailModalProps {
  bookId: string;
  onClose: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function RuleBookDetailModal({ bookId, onClose, showToast }: RuleBookDetailModalProps) {
  const [book, setBook] = useState<RuleBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch details
    setLoading(true);
    fetch(`/api/method/rule_management.rule_management.api.get_rule_book_detail?rule_book=${encodeURIComponent(bookId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.data) {
          setBook(data.data);
        } else {
          showToast(data.message || "Failed to load rule book details.", "error");
        }
      })
      .catch((err) => {
        showToast("Error connecting to server.", "error");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bookId]);

  // Audio actions
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        showToast("Cannot play audio file. Check URL or connection.", "error");
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 180); // Fallback standard length if NaN
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const value = parseFloat(e.target.value);
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const value = parseFloat(e.target.value);
    audioRef.current.volume = value;
    setVolume(value);
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  // Helper to extract YouTube ID
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const youtubeId = book ? getYouTubeId(book.youtube_url) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl rounded-2xl border border-gold/20 bg-[#141414] shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]"
      >
        {/* Header banner */}
        <div className="p-6 border-b border-gold/10 flex items-center justify-between bg-gradient-to-r from-[#1a1a1a] to-[#121212] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-gold" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-gold font-bold">Rule Book Details</span>
              <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                {loading ? "Loading..." : book?.book_title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-premium-light hover:bg-gold/10 text-gray-400 hover:text-gold border border-gray-800 hover:border-gold/30 flex items-center justify-center transition-all duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-gold/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-gold animate-spin"></div>
              </div>
              <p className="text-gray-400 text-sm font-mono tracking-widest uppercase">Syncing rules...</p>
            </div>
          ) : book ? (
            <>
              {/* Media Block (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* YouTube Video Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gold">
                    <Video className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-wider">Video Guide</span>
                  </div>
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-gold/15 bg-black relative">
                    {youtubeId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title="YouTube video player"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <AlertTriangle className="w-8 h-8 text-gray-500 mb-2" />
                        <p className="text-xs text-gray-400 font-mono">No video training attached.</p>
                        {book.youtube_url && (
                          <a
                            href={book.youtube_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 text-xs text-gold underline hover:text-gold-light"
                          >
                            Watch External Link
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Audio Block */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gold">
                      <Music className="w-4 h-4" />
                      <span className="text-sm font-bold uppercase tracking-wider">Audio Briefing</span>
                    </div>
                    
                    {/* Audio Engine */}
                    {book.audio_url ? (
                      <div className="p-4 rounded-xl border border-gold/15 bg-[#1a1a1a]/80 space-y-4">
                        <audio
                          ref={audioRef}
                          src={book.audio_url}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleLoadedMetadata}
                          preload="metadata"
                        />
                        
                        {/* Audio Controls */}
                        <div className="flex items-center justify-between gap-4">
                          <button
                            onClick={togglePlay}
                            className="w-12 h-12 rounded-full bg-gold hover:bg-gold-light text-black flex items-center justify-center transition-all duration-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.3)] active:scale-95"
                          >
                            {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black translate-x-0.5" />}
                          </button>

                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-gray-400">
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max={duration || 100}
                              step="0.1"
                              value={currentTime}
                              onChange={handleSeek}
                              className="w-full accent-gold bg-premium-light h-1 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Extra controls (Reset & volume) */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
                          <button
                            onClick={restartAudio}
                            className="text-gray-400 hover:text-gold flex items-center gap-1.5 text-xs transition-colors duration-200"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="font-mono">Restart</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <Volume2 className="w-3.5 h-3.5 text-gray-400" />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="w-16 accent-gold h-1 bg-premium-light rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 p-6 rounded-xl border border-dashed border-gray-800 flex flex-col items-center justify-center text-center">
                        <Music className="w-6 h-6 text-gray-600 mb-2" />
                        <p className="text-xs text-gray-400 font-mono">No audio handbook recorded.</p>
                      </div>
                    )}
                  </div>

                  {/* Metadata banner inside */}
                  <div className="p-3 bg-gold/5 rounded-lg border border-gold/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      <span className="text-[11px] font-mono text-gray-300">Category: {book.rule_category}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider bg-gold/10 text-gold px-2 py-0.5 rounded font-bold border border-gold/20">
                      Active Guide
                    </span>
                  </div>
                </div>
              </div>

              {/* Rules List Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gold">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-wider">Numbered Rules Index</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{book.rules.length} total clauses</span>
                </div>

                <div className="space-y-3">
                  {book.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="group flex gap-4 p-4 rounded-xl border border-gold/10 bg-[#161616]/90 hover:border-gold/30 transition-all duration-300 shadow-md"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gold/5 border border-gold/20 flex items-center justify-center text-gold font-mono font-bold text-sm shrink-0 group-hover:bg-gold group-hover:text-black transition-all duration-300 shadow-inner">
                        {idx + 1}
                      </div>
                      <div className="flex-1 flex items-center">
                        <p className="text-sm text-gray-200 leading-relaxed font-sans">{rule}</p>
                      </div>
                    </div>
                  ))}

                  {book.rules.length === 0 && (
                    <div className="p-8 text-center rounded-xl border border-dashed border-gray-800">
                      <AlertTriangle className="w-8 h-8 text-gold mx-auto mb-2" />
                      <p className="text-sm text-gray-400 font-mono">No rules clauses added to this book yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-300 font-bold">Rule Book could not be located.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
