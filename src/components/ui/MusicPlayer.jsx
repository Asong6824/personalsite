"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

/**
 * 音乐播放器组件
 * @param {Object} props
 * @param {Array} props.playlist - 播放列表，每个项目包含 { title, artist, src }
 * @param {string} props.className - 额外的CSS类名
 */
export function MusicPlayer({ playlist = [], className = '' }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentTrackIndex < playlist.length - 1) {
        setCurrentTrackIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentTrackIndex(0);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, playlist.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!playlist.length || !currentTrack) {
    return null;
  }

  return (
    <div className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 shadow-sm ${className}`}>
      {currentTrack.src && (
        <audio
          ref={audioRef}
          src={currentTrack.src}
          preload="metadata"
        />
      )}
      
      {/* 歌曲信息 */}
      <div className="mb-3">
        <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
          {currentTrack.title}
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
          {currentTrack.artist}
        </p>
      </div>

      {/* 进度条 */}
      <div className="mb-3">
        <div 
          className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-150"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentTrackIndex === 0}
            className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentTrackIndex === playlist.length - 1}
            className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* 音量控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              if (newVolume > 0 && isMuted) {
                setIsMuted(false);
              }
            }}
            className="w-16 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* 播放列表指示器 */}
      {playlist.length > 1 && (
        <div className="flex justify-center gap-1 mt-3">
          {playlist.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTrackIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentTrackIndex
                  ? 'bg-blue-500'
                  : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 默认播放列表示例
export const defaultPlaylist = [
  {
    title: "轻音乐 - 森林晨曲",
    artist: "自然之声",
    src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
  },
  {
    title: "轻音乐 - 海浪声", 
    artist: "自然之声",
    src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
  }
];

// 创建一个自定义播放列表的辅助函数
export const createPlaylist = (musicUrls) => {
  return musicUrls.map((url, index) => ({
    title: `背景音乐 ${index + 1}`,
    artist: "博客配乐",
    src: url
  }));
};

// 从文章frontmatter中获取音乐的辅助函数
export const getPlaylistFromPost = (frontmatter) => {
  if (frontmatter.music) {
    if (Array.isArray(frontmatter.music)) {
      return createPlaylist(frontmatter.music);
    } else if (typeof frontmatter.music === 'string') {
      return createPlaylist([frontmatter.music]);
    }
  }
  return defaultPlaylist;
};