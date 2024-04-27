import mongoose,{Schema,Document} from "mongoose";




export interface User{
    username:string;
    email:string;
    password:string;
    verifyCode:string;
    verifyCodeExpiry:Date;
    
    isVerified:boolean,
}

const UserSchema:Schema<User>=new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match:[/.+\@.+\..+/,'Please Provide a valid email'],
    },
    password:{
        type:String,
        required:true,
    },
    verifyCode:{
        type:String,
        required:true
    },
    verifyCodeExpiry:{
        type:Date,
        required:true,    
    },
    isVerified:{
        type:Boolean,
        default:false
    },
   
    
})

const UserModel=(mongoose.models.User as mongoose.Model<User>)||(mongoose.model<User>("User",UserSchema))

export default UserModel;