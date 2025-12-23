// app/actions/get-users.ts
"use server";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function getUsers() {
  await connectToDatabase();
  const users = await User.find({})
    .select('name email image')
    .sort({ name: 1 })
    .lean();
  
  return users.map(user => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
  }));
}
