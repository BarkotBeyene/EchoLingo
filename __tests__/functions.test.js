import { speak, navigate, sound } from '../functions';
import * as TTS from 'expo-speech';
import { Audio } from 'expo-av';

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({
        sound: {
          setVolumeAsync: jest.fn(),
          playAsync: jest.fn(),
        }
      })),
    }
  }
}));

describe('speak', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls TTS.speak with default language when no tags present', () => {
    speak('Jake');
    expect(TTS.stop).toHaveBeenCalled();
    expect(TTS.speak).toHaveBeenCalledWith('Jake', { language: 'en-US' });
  });

  it('calls TTS.speak with correct language when a tag is present', () => {
    speak('<spanish>Hola');
    expect(TTS.stop).toHaveBeenCalled();
    
    expect(TTS.speak).toHaveBeenCalledWith('Hola', expect.objectContaining({
      language: 'es-ES',
    }));
  });
});

describe('navigate', () => {
  it('calls TTS.stop and navigates to the given screen', () => {
    const mockNavigation = { navigate: jest.fn() };
    navigate(mockNavigation, 'Home');
    expect(TTS.stop).toHaveBeenCalled();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
  });
});

describe('sound', () => {
  it('does nothing if isSound is false', async () => {
    await sound({}, false);
    expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
  });

  it('plays sound with volume if isSound is true', async () => {
    await sound({}, true);
    expect(Audio.Sound.createAsync).toHaveBeenCalled();
  });
});
