// import { cookies } from "next/headers";
// import jwt from "jsonwebtoken";
// import { connectToDatabase } from "./mongodb";
// import User from "./models/user";

// // Type definition for decoded JWT
// type JwtPayload = {
//   userId: string;
//   email: string;
//   username: string;
// }

// // Get current user from JWT token
// export async function getCurrentUser() {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("token")?.value;

//     if (!token) {
//       return null;
//     }

//     // Verify and decode the token
//     const decoded = jwt.verify(
//       token, 
//       process.env.JWT_SECRET as string
//     ) as JwtPayload;

//     // Connect to database and fetch user (excluding password)
//     await connectToDatabase();
//     const user = await User.findById(decoded.userId).select("-password");

//     if (!user) {
//       return null;
//     }

//     // Return user data
//     return {
//       _id: user._id.toString(),
//       username: user.username,
//       email: user.email,
//       avatar: user.avatar || "",
//       createdAt: user.createdAt
//     };
//   } catch (error) {
//     console.error("Auth error:", error);
//     return null;
//   }
// }