import { FPT_API_KEY } from '../configs/configs';
import { API_ENDPOINT_URL } from '../utils/constant';
import MongoDB from '../utils/mongo';

export async function createVoice(message: string, mediaId: string, gender: string) {
  try {
    const response = await fetch('https://api.fpt.ai/hmi/tts/v5', {
      method: 'POST',
      headers: {
        'api-key': FPT_API_KEY,
        voice: gender === 'Nam' ? 'minhquang' : 'linhsan',
        'Cache-Control': 'no-cache',
        callback_url: `${API_ENDPOINT_URL}/tts/callback?mediaId=${mediaId}`,
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

export async function createVoiceCallback(mediaId: string, mediaLink: string) {
  const db = new MongoDB().getDatabase('localdb');
  const collection = db.collection('Response');

  try {
    const result = await collection.updateOne({"mediaId": mediaId},{
      "$set": {
        "messageLink": mediaLink
      }
    });
    if(result.modifiedCount > 0) {
      return {
        success: true,
        mediaId,
        mediaLink
      };
    }
    return {
      success: false,
      mediaId,
      mediaLink
    };
  } catch (err) {
    console.error('Error while creating voice callback:', err);
  }
}
