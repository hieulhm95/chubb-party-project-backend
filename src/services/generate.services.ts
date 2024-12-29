import { MAPPING_RULES } from '../configs/configs';
import { FormResponse } from '../types/response';
import { getAllRowsWithCells, getFile as getFileService } from '../utils/googleApis';
import { mappingDataList } from '../utils/utils';
import { v4 } from 'uuid';
import { InsertOneModel, UpdateOneModel, ObjectId, Document } from 'mongodb';
import MongoDB from '../utils/mongo';

export async function getResponses() {
  const rows = await getAllRowsWithCells(0);

  const data = mappingDataList<FormResponse>(rows, MAPPING_RULES);
  const length = data.length;

  const db = new MongoDB().getDatabase('localdb');
  const operations: ({ insertOne: InsertOneModel } | { updateOne: UpdateOneModel })[] = [];

  const collection = db.collection('Response');

  for (let i = 0; i < length; i++) {
    const response = data[i];

    const email = response.email;
    const receiverEmail = response.receiverEmail;

    const existedResponse = await collection.findOne<Partial<FormResponse>>(
      {
        email: email,
        receiverEmail: receiverEmail,
      },
      {
        projection: {
          _id: 1,
          updatedCount: 1,
        },
      }
    );

    console.log(existedResponse);

    if (!existedResponse) {
      response.mediaId = v4();
      response._id = new ObjectId();
      if (response.filename) {
        const url = new URL(response.filename);
        const id = url.searchParams.get('id');
        if (id) response.fileId = id;
      }
      operations.push({
        insertOne: {
          document: response,
        },
      });
    } else {
      const partialResponse = {} as Partial<FormResponse>;
      if (existedResponse.updatedCount == 3) {
        continue;
      }
      if (response.filename) {
        partialResponse.filename = response.filename;
        const url = new URL(response.filename);
        const id = url.searchParams.get('id');
        if (id) partialResponse.fileId = id;
      }
      operations.push({
        updateOne: {
          filter: { _id: existedResponse._id },
          update: {
            $set: {
              updatedCount: existedResponse.updatedCount ? existedResponse.updatedCount + 1 : 1,
              ...partialResponse,
            },
          },
        },
      });
    }
  }

  const bulkWriteResponse =
    operations.length == 0
      ? { insertedCount: 0, modifiedCount: 0 }
      : await collection.bulkWrite(operations);

  return {
    insertedCount: bulkWriteResponse.insertedCount,
    updatedCount: bulkWriteResponse.modifiedCount,
  };
}

export async function getFile(mediaId: string) {
  const db = new MongoDB().getDatabase('localdb');

  const collection = db.collection('Response');

  const formResponse = await collection.findOne<FormResponse>({ mediaId: mediaId });

  if (formResponse == null) return null;

  const fileId = formResponse.fileId;

  return getFileService(fileId);
}

export async function getResponse(mediaId: string) {
  const db = new MongoDB().getDatabase('localdb');

  const collection = db.collection('Response');

  const formResponse = await collection.findOne<FormResponse>({ mediaId: mediaId });

  if (formResponse == null) return null;

  return formResponse;
}
