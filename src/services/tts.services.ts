import { FPT_API_KEY } from '../configs/configs';
import { API_ENDPOINT_URL } from '../utils/constant';
import mime from 'mime-types';
import MongoDB from '../utils/mongo';
import { insertLog } from './log.services';
import { logger } from '../utils/logger';
import { FormResponse } from '../types/response';

export async function createVoice(message: string, mediaId: string, gender: string) {
  try {
    const response = await fetch('https://api.fpt.ai/hmi/tts/v5', {
      method: 'POST',
      headers: {
        'api-key': FPT_API_KEY,
        voice: gender === 'Anh' ? 'minhquangace' : 'linhsanace',
        'Cache-Control': 'no-cache',
        callback_url: `${API_ENDPOINT_URL}/tts/callback?mediaId=${mediaId}`,
      },
      body: message,
    });
    if (!response.ok) {
      await insertLog({
        message: 'Error while creating voice HTTP error! Status: ${response.status}`',
        error: null,
        type: 'tts',
        data: JSON.stringify({ message, mediaId, gender }),
      });
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    await insertLog({
      message: 'Error while creating voice',
      error: err,
      type: 'tts',
      data: JSON.stringify({ message, mediaId, gender }),
    });
    logger.error('Error while creating voice:', err);
  }
}

export async function createVoiceCallback(mediaId: string, mediaLink: string) {
  const db = new MongoDB().getDatabase('localdb');
  const collection = db.collection('Response');

  try {
    const mimeType = mime.lookup(mediaLink);

    const result = await collection.updateOne(
      { mediaId: mediaId },
      {
        $set: {
          messageLink: mediaLink,
          mimeType: mimeType,
        },
      }
    );
    if (result.modifiedCount > 0) {
      return {
        success: true,
        mediaId,
        mediaLink,
      };
    }
    return {
      success: false,
      mediaId,
      mediaLink,
    };
  } catch (err) {
    logger.error('Error while creating voice callback:', err);
    await insertLog({
      message: 'Error while creating voice callback:',
      error: err,
      type: 'tts',
      data: JSON.stringify({ mediaId, mediaLink }),
    });
  }
}

async function findDataByEmail(email: string) {
  try {
    const db = new MongoDB().getDatabase('localdb');
    const collection = db.collection('Response');
    const result = await collection.findOne<FormResponse>({ receiverEmail: email });
    return result;
  } catch (err) {
    logger.error('Error while finding data by email:', err);
    await insertLog({
      message: 'Error while finding data by email:',
      error: err,
      type: 'tts',
      data: JSON.stringify({ email }),
    });
    return null;
  }
}

export async function createVoices(emails: string[]) {
  const success = [];
  for (const email of emails) {
    const data = await findDataByEmail(email);
    if (data == null) {
      continue;
    }
    await createVoice(data.message, data.mediaId, data.gender);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Throttle by 3 second
    success.push(email);
  }
  return { message: 'Success', success };
}
