import { connectToMongoDB, getMongoDB } from "~/models/mongodb";

export async function getUser(type: string, value: string): Promise<User> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    const result = (await collection.findOne({ [type]: value })) as unknown as User;
    return result;
}

export async function createUser(user: User): Promise<User> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    const result = (await collection.insertOne(user)) as unknown as User;
    return result;
}

export async function updateUser(id: string, user:any): Promise<User> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    await collection.updateOne({ id }, { $set: user });
    const result = collection.findOne({ id }) as unknown as User;
    return result;
}

export async function deleteUser(id: string): Promise<User> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    const result = (await collection.deleteOne({ id })) as unknown as User;
    return result;
}

export async function getAllUsers(): Promise<User[]> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    const result = (await collection.find({}).toArray()) as unknown as User[];
    return result;
}
