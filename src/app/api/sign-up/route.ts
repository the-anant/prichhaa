import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import bcrypt from "bcryptjs";
import { sendVreificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await req.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }
    const existingUserByEmail = await UserModel.findOne({ email });
    // verify code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: `User already exit whit with this email go to login`,
          },
          { status: 400 }
        );
      } else {
        const hasPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hasPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      const hasPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username,
        email,
        password: hasPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isAcceptingMessage: true,
        isVerified: false,
        message: [],
      });
      await newUser.save();
    }
    // send verirfication email
    const emailResponse = await sendVreificationEmail(
      email,
      username,
      verifyCode
    );
    console.log(emailResponse);
    if (emailResponse.success) {
      return Response.json(
        {
          success: true,
          message: `user register successfully. Please veryfy your email `,
        },
        { status: 500 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: `some errror during sendign verification email error message${emailResponse.message}`,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.log("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: "error registering user",
      },
      { status: 500 }
    );
  }
}
