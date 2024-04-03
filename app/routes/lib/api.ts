import { connectToMongoDB, getMongoDB } from "~/models/mongodb";

export async function getUser(type: string, value: string): Promise<IUser> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    const result = (await collection.findOne({ [type]: value })) as unknown as IUser;
    return result;
}

export async function createUser(user: IUser): Promise<IUser> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    const result = (await collection.insertOne(user)) as unknown as IUser;
    return result;
}

export async function updateUser(id: string, user:any): Promise<IUser> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    await collection.updateOne({ id }, { $set: user });
    const result = collection.findOne({ id }) as unknown as IUser;
    return result;
}

export async function deleteUser(id: string): Promise<IUser> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    const result = (await collection.deleteOne({ id })) as unknown as IUser;
    return result;
}

export async function getAllUsers(): Promise<IUser[]> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    const result = (await collection.find({}, {projection: {password: 0, equipped:0}}).toArray()) as unknown as IUser[];
    return result;
}
