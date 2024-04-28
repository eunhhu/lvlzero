import { ObjectId } from "mongodb";
import { connectToMongoDB, getMongoDB } from "~/models/mongodb";

export async function getUser(type: string, value: string): Promise<IUser> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    let res = type == "username" ? {'$regex': value, '$options': 'i'} : value;
    const result = (await collection.findOne({ [type]: res })) as unknown as IUser;
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
    const result = await collection.findOne({ id }) as unknown as IUser;
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

export async function getAllDB(): Promise<IDB> {
    await connectToMongoDB();
    const db = getMongoDB();
    const userCol = db.collection("users");
    const users = (await userCol.find({}).toArray()) as unknown as IUser[];
    const unitCol = db.collection("units");
    const units = (await unitCol.find({}).toArray()) as unknown as IUnit[];
    const enemyCol = db.collection("enemies");
    const enemies = (await enemyCol.find({}).toArray()) as unknown as IEnemy[];
    const levelCol = db.collection("levels");
    const levels = (await levelCol.find({}).toArray()) as unknown as ILevel[];
    const moduleCol = db.collection("modules");
    const modules = (await moduleCol.find({}).toArray()) as unknown as IModule[];
    const clanCol = db.collection("clans");
    const clans = (await clanCol.find({}).toArray()) as unknown as IClan[];
    return {users, units, enemies, levels, modules, clans};
}

export async function deleteOne(col: string, id: string): Promise<any> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection(col);
    const result = (await collection.deleteOne({ _id:new ObjectId(id) })) as unknown as any;
    return result;
}

export async function getOne(col: string, id: string): Promise<any> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection(col);
    const result = (await collection.findOne({ _id:new ObjectId(id) })) as unknown as any;
    return result;
}

export async function getBy(col: string, obj: any): Promise<any> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection(col)
    const result = (await collection.findOne(obj)) as unknown as any;
    return result;
}

export async function updateOne(col: string, id: string, obj:any): Promise<any> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection(col);
    await collection.updateOne({ _id:new ObjectId(id) }, {$set: obj});
    const result = await collection.findOne({ _id:new ObjectId(id) }) as unknown as any;
    return result;
}

export async function updateBy(col: string, obj: any, newObj:any): Promise<any> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection(col);
    await collection.updateOne(obj, {$set: newObj});
    const result = await collection.findOne(obj) as unknown as any;
    return result;
}

export async function createOne(col: string, obj: any): Promise<any> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection(col);
    const result = (await collection.insertOne(obj)) as unknown as any;
    return result;
}

export async function modifyAll(col: string, obj: any): Promise<any> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection(col);
    await collection.updateMany({}, {$set: obj});
    const result = await collection.find({}).toArray() as unknown as any;
    return result;
}

export async function modifyFilter(col: string, obj:any, obj2: any): Promise<any> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection(col);
    await collection.updateMany(obj, {$set: obj2});
    const result = await collection.find({}).toArray() as unknown as any;
    return result;
}

export async function getAll(col: string): Promise<any> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection(col);
    const result = await collection.find({}).toArray() as unknown as any;
    return result;
}

export async function getMembers(clanId: string): Promise<any> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    const result = await collection.find({clan: clanId}).toArray() as unknown as any;
    return result;
}

export async function getPendings(clanId: string): Promise<any> {
    await connectToMongoDB();
    const db = getMongoDB();
    const collection = db.collection("users");
    const clan:IClan = await db.collection("clans").findOne({id: clanId}, {projection: {icon:0}}) as unknown as IClan;
    const result:IUser[] = await collection.find({id: {$in: clan.pending}}).toArray() as unknown as IUser[];
    return result;
}
