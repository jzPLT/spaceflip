import { NativeModules, DeviceEventEmitter } from 'react-native';

interface AlexaVoiceModule {
  initializeVoiceService(): Promise<boolean>;
  registerVoiceCommands(commands: string[]): Promise<boolean>;
  startListening(): Promise<boolean>;
  stopListening(): Promise<boolean>;
}

const { AlexaVoice } = NativeModules as { AlexaVoice: AlexaVoiceModule };

export interface VoiceCommand {
  command: string;
  action: () => void;
}

export class AlexaVoiceService {
  private static commands: Map<string, () => void> = new Map();
  private static initialized = false;

  static async initialize(): Promise<boolean> {
    try {
      if (!AlexaVoice) {
        console.log('Alexa Voice Service not available - using mock implementation');
        this.setupMockVoiceCommands();
        return true;
      }
      
      const success = await AlexaVoice.initializeVoiceService();
      if (success) {
        this.setupVoiceEventListener();
        this.initialized = true;
      }
      return success;
    } catch (error) {
      console.error('Alexa Voice Service initialization failed:', error);
      return false;
    }
  }

  static registerCommands(commands: VoiceCommand[]): void {
    commands.forEach(({ command, action }) => {
      this.commands.set(command.toLowerCase(), action);
    });

    if (AlexaVoice && this.initialized) {
      const commandList = commands.map(cmd => cmd.command);
      AlexaVoice.registerVoiceCommands(commandList);
    }
  }

  static async startListening(): Promise<boolean> {
    try {
      if (!AlexaVoice) return true;
      return await AlexaVoice.startListening();
    } catch (error) {
      console.error('Failed to start voice listening:', error);
      return false;
    }
  }

  static async stopListening(): Promise<boolean> {
    try {
      if (!AlexaVoice) return true;
      return await AlexaVoice.stopListening();
    } catch (error) {
      console.error('Failed to stop voice listening:', error);
      return false;
    }
  }

  private static setupVoiceEventListener(): void {
    DeviceEventEmitter.addListener('AlexaVoiceCommand', (event) => {
      const { command } = event;
      const action = this.commands.get(command.toLowerCase());
      if (action) {
        console.log('Executing voice command:', command);
        action();
      } else {
        console.log('Unknown voice command:', command);
      }
    });
  }

  private static setupMockVoiceCommands(): void {
    // Mock implementation for development
    console.log('Mock Alexa Voice Service initialized');
    
    // Simulate voice command after 5 seconds for testing
    setTimeout(() => {
      const mockCommand = 'pause game';
      const action = this.commands.get(mockCommand);
      if (action) {
        console.log('Mock voice command triggered:', mockCommand);
        action();
      }
    }, 5000);
  }
}
