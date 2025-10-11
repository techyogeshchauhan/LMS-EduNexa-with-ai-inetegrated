import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getAuthToken } from '../../utils/tokenHelper';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  onComplete?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getVideoUrl = () => {
    // Video streaming doesn't use query params, uses Authorization header
    return `http://localhost:5000/api/videos/stream/${videoId}`;
  };

  // Set up video with auth header and progress tracking
  useEffect(() => {
    if (videoRef.current) {
      const token = getAuthToken();
      if (token) {
        // For video streaming with auth, we need to use fetch and blob
        const loadVideo = async () => {
          try {
            const response = await fetch(getVideoUrl(), {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const blob = await response.blob();
              const videoUrl = URL.createObjectURL(blob);
              if (videoRef.current) {
                videoRef.current.src = videoUrl;
              }
            }
          } catch (error) {
            console.error('Failed to load video:', error);
          }
        };
        loadVideo();
      }
    }
  }, [videoId]);

  // Track video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        await fetch(`http://localhost:5000/api/progress/video/${videoId}/watch-time`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            watch_time: watchTime,
            total_duration: duration
          })
        });
      } catch (error) {
        console.error('Failed to update watch progress:', error);
      }
    };

    const handleTimeUpdate = () => {
      setWatchTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      updateProgress();
      if (onComplete) {
        onComplete();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    // Update progress every 10 seconds
    const progressInterval = setInterval(updateProgress, 10000);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      clearInterval(progressInterval);
      // Final progress update when component unmounts
      updateProgress();
    };
  }, [videoId, watchTime, duration, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-5xl mx-4">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-black">
            <video
              ref={videoRef}
              controls
              autoPlay
              className="w-full"
              style={{ maxHeight: '70vh' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};
