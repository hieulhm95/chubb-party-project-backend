import { NextFunction, Request, Response } from 'express';
import * as generateServices from '../services/generate.services';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

ffmpeg.getAvailableCodecs((err, codecs) => {
  if (err) {
    console.error('Error fetching codecs:', err);
    return;
  }

  console.log('Available codecs:');
  console.log(codecs.aac);
  console.log(codecs.libmp3lame);
});

// Check available formats
ffmpeg.getAvailableFormats((err, formats) => {
  if (err) {
    console.error('Error fetching formats:', err);
    return;
  }

  console.log('Available formats:');
  console.log(formats.m4a);
  console.log(formats.mp3);
});

export async function getResponses(req: Request, res: Response, next: NextFunction) {
  try {
    const response = await generateServices.getResponses();
    return res.json(response);
  } catch (err) {
    console.error(`Error while GET responses`, (err as any).message);
    next(err);
  }
}

export async function getFile(req: Request, res: Response) {
  const mediaId = req.params.mediaId as string;
  if (!mediaId) {
    res.status(404).send('Media not found');
  }

  const result = await generateServices.getFile(mediaId);
  if (result == null) {
    return res.status(404).send('Media not found');
  }

  res.setHeader('Content-Type', result.mimeType as string);

  result.content.pipe(res);
}

const MAPPING_FORMAT = {
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/x-flac': 'flac',
  'audio/aac': 'aac',
  'audio/webm': 'webm',
};

export async function getResponse(req: Request, res: Response) {
  const mediaId = req.params.mediaId as string;
  if (!mediaId) {
    res.status(404).send('Media not found');
  }

  const result = await generateServices.getResponse(mediaId);
  if (result == null) {
    return res.status(404).send('Media not found');
  }

  return res.status(200).json(result);
}
export async function getFileWithExtension(req: Request, res: Response) {
  let mediaId = req.params.mediaId as string;
  if (!mediaId) {
    res.status(404).send('Media not found');
  }

  const mediaLinkSegment = mediaId.split('.');
  mediaLinkSegment.splice(1, mediaLinkSegment.length - 1);

  mediaId = mediaLinkSegment.join('.');
  const result = await generateServices.getFile(mediaId);
  if (result == null) {
    return res.status(404).send('Media not found');
  }

  if (result.mimeType == 'audio/mp3' || result.mimeType == 'audio/mpeg') {
    result.content.pipe(res);
  } else {
    const mp3Writer = fs.createWriteStream(mediaId + '.m4a');
    result.content.pipe(mp3Writer, { end: true });
    result.content.once('close', () => {
      mp3Writer.end();
      mp3Writer.close();
      ffmpeg(mediaId + '.m4a')
        .toFormat('mp3')
        .audioCodec('libmp3lame')
        .save(mediaId + '.mp3')
        .once('end', () => {
          fs.createReadStream(mediaId + '.mp3').pipe(res);
        });
    });
  }
}
