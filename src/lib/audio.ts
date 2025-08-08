// Audio notification system for LifeBalance app
import { logger } from './logger';
export class AudioNotifications {
  private static instance: AudioNotifications;
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.5;

  private constructor() {
    this.loadSettings();
    this.initializeAudio();
  }

  public static getInstance(): AudioNotifications {
    if (!AudioNotifications.instance) {
      AudioNotifications.instance = new AudioNotifications();
    }
    return AudioNotifications.instance;
  }

  private loadSettings(): void {
    try {
      const settings = localStorage.getItem('lifebalance-audio-settings');
      if (settings) {
        const { isEnabled, volume } = JSON.parse(settings);
        this.isEnabled = isEnabled ?? true;
        this.volume = volume ?? 0.5;
      }
    } catch (error) {
      logger.warn('Error loading audio settings from localStorage', { error });
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('lifebalance-audio-settings', JSON.stringify({
        isEnabled: this.isEnabled,
        volume: this.volume
      }));
    } catch (error) {
      logger.warn('Error saving audio settings to localStorage', { error });
    }
  }

  private initializeAudio(): void {
    try {
      this.audio = new Audio('/notification-sound.wav');
      this.audio.volume = this.volume;
      this.audio.preload = 'none'; // Cambiar a 'none' para evitar bloqueos
      
      // Manejar errores de carga de audio sin bloquear la app
      this.audio.addEventListener('error', (e) => {
        logger.warn('Audio file could not be loaded, disabling audio notifications', { error: e });
        this.isEnabled = false;
      });
    } catch (error) {
      logger.warn('Error initializing audio system', { error });
      this.isEnabled = false;
    }
  }

  public async playNotification(type: 'timer' | 'reminder' | 'task' | 'general' = 'general'): Promise<void> {
    if (!this.isEnabled || !this.audio) {
      return;
    }

    try {
      // Reset audio to beginning
      this.audio.currentTime = 0;
      this.audio.volume = this.volume;

      // Play different patterns based on type
      switch (type) {
        case 'timer':
          // Single long beep for timer completion
          const playPromise = this.audio.play();
          if (playPromise) playPromise.catch(() => {}); // Silenciar errores
          break;
        
        case 'reminder':
          // Two short beeps for reminders
          const playPromise1 = this.audio.play();
          if (playPromise1) playPromise1.catch(() => {});
          setTimeout(() => {
            if (this.audio) {
              this.audio.currentTime = 0;
              const playPromise2 = this.audio.play();
              if (playPromise2) playPromise2.catch(() => {});
            }
          }, 200);
          break;
        
        case 'task':
          // Three quick beeps for task notifications
          for (let i = 0; i < 3; i++) {
            if (this.audio) {
              this.audio.currentTime = 0;
              const playPromise = this.audio.play();
              if (playPromise) playPromise.catch(() => {});
              if (i < 2) await this.delay(100);
            }
          }
          break;
        
        default:
          // Single beep for general notifications
          const defaultPlay = this.audio.play();
          if (defaultPlay) defaultPlay.catch(() => {});
      }
    } catch (error) {
      logger.warn('Error playing notification sound', { error });
      // Deshabilitar audio si hay errores persistentes
      this.isEnabled = false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.saveSettings();
  }

  public isNotificationsEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    this.saveSettings();
  }

  public getVolume(): number {
    return this.volume;
  }

  // Test sound functionality
  public async testSound(): Promise<void> {
    const wasEnabled = this.isEnabled;
    this.isEnabled = true;
    await this.playNotification('general');
    this.isEnabled = wasEnabled;
  }

  // Request permission for audio (useful for some browsers)
  public async requestPermission(): Promise<boolean> {
    try {
      if (this.audio) {
        // Try to play and immediately pause to test permission
        const playPromise = this.audio.play();
        if (playPromise) {
          await playPromise;
          this.audio.pause();
          this.audio.currentTime = 0;
        }
        return true;
      }
    } catch (error) {
      logger.warn('Audio permission not granted by user', { error });
    }
    return false;
  }
}

// Convenience functions for easy use throughout the app
export const audioNotifications = AudioNotifications.getInstance();

export const playTimerSound = () => audioNotifications.playNotification('timer');
export const playReminderSound = () => audioNotifications.playNotification('reminder');
export const playTaskSound = () => audioNotifications.playNotification('task');
export const playGeneralSound = () => audioNotifications.playNotification('general');