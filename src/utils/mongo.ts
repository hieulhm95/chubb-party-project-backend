import { MongoClient } from "mongodb";

export default class MongoDB {
    private static instance: MongoClient;

    constructor(dbUrl?: string){
        if (MongoDB.instance == undefined) {
            if(!dbUrl) {
                throw new Error("Init mongodb instance first with dbUrl");
            }
            
            MongoDB.instance = new MongoClient(dbUrl);
        }

    }

    getDatabase(dbName: string) {
        if(MongoDB.instance) return MongoDB.instance.db(dbName);

        throw new Error("Init mongodb instance first");
    }
}