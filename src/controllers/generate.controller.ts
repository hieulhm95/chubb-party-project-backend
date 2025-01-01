import { NextFunction, Request, Response } from 'express';
import * as generateServices from '../services/generate.services';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import fsPromise from "fs/promises";
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { logger } from '../utils/logger';
import { MEDIA_DIR } from '../configs/configs';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

ffmpeg.getAvailableCodecs((err, codecs) => {
  if (err) {
    logger.error('Error fetching codecs:', err);
    return;
  }

  logger.info('Available codecs:');
  logger.info(codecs.aac);
  logger.info(codecs.libmp3lame);
});

// Check available formats
ffmpeg.getAvailableFormats((err, formats) => {
  if (err) {
    logger.error('Error fetching formats:', err);
    return;
  }

  logger.info('Available formats:');
  logger.info(formats.m4a);
  logger.info(formats.mp3);
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

  const mediaDir = path.join(process.cwd(), MEDIA_DIR);

  const mediaLinkSegment = mediaId.split('.');
  mediaLinkSegment.splice(1, mediaLinkSegment.length - 1);

  mediaId = mediaLinkSegment.join('.');
  const destFile = path.join(mediaDir, mediaId + ".mp3");

  
  try {
    const destFileInfo = await fsPromise.stat(destFile);
    if(destFileInfo.isFile()) {
      res.setHeader('Content-Type', "audio/mp3");
      return fs.createReadStream(destFile).pipe(res);
    }
  }
  catch(_) {}

  const result = await generateServices.getFile(mediaId);
  if (result == null) {
    return res.status(404).send('Media not found');
  }

  if (result.mimeType == 'audio/mp3' || result.mimeType == 'audio/mpeg') {
    res.setHeader('Content-Type', "audio/mp3");
    result.content.pipe(res);
  } else {
    const extension  = (MAPPING_FORMAT as any)[result.mimeType as string];
    if (!extension) return res.status(404).send("Meida not found");
    
    const sourceFile = path.join(mediaDir, mediaId + "." + extension);
    const mp3Writer = fs.createWriteStream(sourceFile);
    let isError = false;
    result.content.pipe(mp3Writer, { end: true });
    result.content.once('close', () => {
      mp3Writer.end();
      mp3Writer.close();
      if(!isError) {
        ffmpeg(sourceFile)
        .toFormat('mp3')
        .audioCodec('libmp3lame')
        .save(destFile)
        .once('end', () => {
          fs.stat(sourceFile, (err) => {
            if(!err) {
              fs.unlink(sourceFile, (_) => {});
            }
          });
          res.setHeader('Content-Type', "audio/mp3");
          fs.createReadStream(destFile).pipe(res);
        })
        .once("error", (err) => {
          if(!isError) {
            isError = true;
            logger.error(err);
            res.status(404).send("Media not found");
          }
        });
      }
    }).once("error", (err) => {
      if(!isError) {
        isError = true;
        logger.error(err);
        res.status(404).send("Media not found");
      }
    })
  }
}
