import MongoDB from '../utils/mongo';

interface Log {
  message: string;
  type: string;
  data: string;
  error: any;
}

export async function insertLog(logInfo: Log) {
  try {
    const db = new MongoDB().getDatabase('localdb');
    const collection = db.collection('Log');
    await collection.insertOne({
      message: logInfo.message,
      error: logInfo.error,
      type: logInfo.type,
      data: logInfo.data,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error while inserting log:', error);
    throw error;
  }
}
