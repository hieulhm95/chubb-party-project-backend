import { ObjectId } from "mongodb";

export interface FormResponse {
    _id: ObjectId;
    timestamp: string;
    
    name: string;
    email: string;
    department: string;

    receiverName: string;
    receiverEmail: string;
    receiverDepartment: string;
    
    allowedToUseAudio: string;

    gender: string;
    filename: string;
    message: string;

    mediaId: string;
    fileId: string;

    updatedCount: number;
}