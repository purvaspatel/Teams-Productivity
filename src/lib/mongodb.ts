import mongoose from 'mongoose';

const MONGO_DB_URI=process.env.MONGO_DB_URI  as string;

if (!MONGO_DB_URI){
    throw new Error('Mongo DB url not found');
}

let cached = (global as any).mongoose || {conn : null, promise : null};

export async function connectToDatabase(){
    if (cached.conn) return cached.conn;


    if(!cached.promise){
        cached.promise=mongoose.connect(MONGO_DB_URI,{
            dbName: 'to-do-app',
            bufferCommands: false,
        }).then((mongoose)=>{
            console.log('Connected to MongoDB');
        });

        cached.conn=await cached.promise;
        return cached.conn;

    }
}