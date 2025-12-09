import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Video as VideoIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  enabled: boolean;
}

export default function VideoRecorder({
  onRecordingComplete,
  isRecording,
  onStartRecording,
  onStopRecording,
  enabled
}: VideoRecorderProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (enabled) {
      requestCameraAccess();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [enabled]);

  const requestCameraAccess = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      toast.success('Camera access granted!');
    } catch (error: any) {
      console.error('Camera access error:', error);
      let errorMsg = 'Camera access denied. ';
      
      if (error.name === 'NotAllowedError') {
        errorMsg += 'Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'No camera detected.';
      } else if (error.name === 'NotReadableError') {
        errorMsg += 'Camera is being used by another application.';
      }
      
      toast.error(errorMsg, { duration: 8000 });
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setHasPermission(false);
  };

  const startRecording = () => {
    if (!stream) {
      toast.error('Camera not available');
      return;
    }

    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingComplete(blob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      onStartRecording();
      toast.success('Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      onStopRecording();
      toast.success('Recording stopped');
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
        {hasPermission ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
            />
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full" />
                <span className="text-sm font-medium">Recording</span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <CameraOff className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Camera not accessible</p>
              <button
                onClick={requestCameraAccess}
                className="btn-secondary mt-4"
              >
                <Camera className="w-4 h-4 mr-2" />
                Enable Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {hasPermission && (
        <div className="flex gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="btn-primary flex items-center gap-2 flex-1"
            >
              <VideoIcon className="w-5 h-5" />
              Start Video Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="btn-secondary flex items-center gap-2 flex-1"
            >
              <div className="w-5 h-5 bg-red-600 rounded" />
              Stop Recording
            </button>
          )}
        </div>
      )}

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
