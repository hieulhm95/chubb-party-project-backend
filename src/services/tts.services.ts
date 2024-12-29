import { FPT_API_KEY } from '../configs/configs';

export async function createVoice(message: string) {
  try {
    const response = await fetch('https://api.fpt.ai/hmi/tts/v5', {
      method: 'POST',
      headers: {
        'api-key': FPT_API_KEY,
        voice: 'banmai',
        'Cache-Control': 'no-cache',
      },
      body: message,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error while creating voice:', err);
  }
}

async function saveVoiceToFile(message: string, fileName: string) {}

async function createVoiceCallback(message: string, callback: Function) {
  //   try {
  //     const response = await createVoice(message);
  //     const buffer = await response.buffer();
  //     callback(buffer);
  //   } catch (err) {
  //     console.error('Error while creating voice callback:', err);
  //   }
}
