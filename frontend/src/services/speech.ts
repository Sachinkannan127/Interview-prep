export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private recognitionRestartTimeout: any = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Try webkitSpeechRecognition first (Chrome/Edge)
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition!.continuous = true;
      this.recognition!.interimResults = true;
      this.recognition!.lang = 'en-US';
      console.log('Speech recognition initialized (webkit)');
    } else if ('SpeechRecognition' in window) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      console.log('Speech recognition initialized (standard)');
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  startListening(onResult: (transcript: string, isFinal: boolean) => void, onError?: (error: any) => void) {
    if (!this.recognition) {
      const errorMsg = 'Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    if (this.isListening) {
      console.log('Already listening');
      return;
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const transcript = lastResult[0].transcript;
      onResult(transcript, lastResult.isFinal);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      
      // Handle specific errors
      if (event.error === 'no-speech') {
        console.log('No speech detected, continuing to listen...');
        // Don't stop listening for no-speech errors
        return;
      } else if (event.error === 'audio-capture') {
        const msg = 'Microphone not accessible. Please check permissions.';
        if (onError) onError(msg);
        this.isListening = false;
      } else if (event.error === 'not-allowed') {
        const msg = 'Microphone permission denied. Please enable it in browser settings.';
        if (onError) onError(msg);
        this.isListening = false;
      } else if (event.error === 'network') {
        const msg = 'Network error. Please check your internet connection.';
        if (onError) onError(msg);
        this.isListening = false;
      } else {
        if (onError) onError(event.error);
        this.isListening = false;
      }
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      // Auto-restart if still supposed to be listening (for continuous mode)
      if (this.isListening) {
        console.log('Restarting speech recognition...');
        this.recognitionRestartTimeout = setTimeout(() => {
          if (this.isListening && this.recognition) {
            try {
              this.recognition.start();
            } catch (e) {
              console.error('Failed to restart recognition:', e);
              this.isListening = false;
            }
          }
        }, 100);
      }
    };

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      if (onError) onError(error);
    }
  }

  stopListening() {
    if (this.recognitionRestartTimeout) {
      clearTimeout(this.recognitionRestartTimeout);
      this.recognitionRestartTimeout = null;
    }
    
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
        console.log('Speech recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }

  speak(text: string, onEnd?: () => void) {
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    this.synthesis.cancel();
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  isSupported(): boolean {
    return this.recognition !== null && 'speechSynthesis' in window;
  }
}

export const speechService = new SpeechService();
