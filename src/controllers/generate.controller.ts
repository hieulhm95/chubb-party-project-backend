import { NextFunction, Request, Response } from 'express';
import * as generateServices from '../services/generate.services';
import mime from "mime-types";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function getResponses(req: Request, res: Response, next: NextFunction) {
  try {
    const response = await generateServices.getResponses();
    return res.json(response);
  } catch (err) {
    console.error(`Error while GET responses`, (err as any).message);
    next(err);
  }
}

export async function getFile(req: Request, res: Response){
  const mediaId = req.params.mediaId as string;
  if(!mediaId) {
    res.status(404).send("Media not found");
  }

  const result = await generateServices.getFile(mediaId);
  if(result == null) {
    return res.status(404).send("Media not found");
  }

  res.setHeader("Content-Type", result.mimeType as string);

  result.content.pipe(res);
}

const MAPPING_FORMAT = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/x-flac": "flac",
  "audio/aac": "aac",
  "audio/webm": "webm"
}

export async function getResponse(req: Request, res: Response){
  const mediaId = req.params.mediaId as string;
  if(!mediaId) {
    res.status(404).send("Media not found");
  }

  const result = await generateServices.getResponse(mediaId);
  if(result == null) {
    return res.status(404).send("Media not found");
  }

  return res.status(200).json(result);
}

export async function getFileWithExtension(req: Request, res: Response){
  let mediaId = req.params.mediaId as string;
  if(!mediaId) {
    res.status(404).send("Media not found");
  }

  const mediaLinkSegment = mediaId.split(".");
  mediaLinkSegment.splice(1, mediaLinkSegment.length - 1);

  mediaId = mediaLinkSegment.join(".")
  const result = await generateServices.getFile(mediaId);
  if(result == null) {
    return res.status(404).send("Media not found");
  }

  res.setHeader("Content-Type", "audio/mp3");

  if(result.mimeType == "audio/mp3" || ) {
    result.content.pipe(res);
  }
  else {
    const stream = ffmpeg(result.content);
    const inputFormat = (MAPPING_FORMAT as any)[result.mimeType as string] as string;
    if(inputFormat) stream.inputFormat(inputFormat)

    stream.toFormat("mp3")
    .pipe(res, {end: true})
  }
}