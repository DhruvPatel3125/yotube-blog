const {createHmac,randomBytes} =  require("crypto");
const { Schema ,model} = require("mongoose");
const { userInfo } = require("os");
const { createTokenForUser } = require("../services/authentication");
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/avt.png",
      required: false,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save',function(next){
    const user = this;

    if(!user.isModified("password")){
        return next();
    }
    const salt = randomBytes(16).toString();
    const hashPassword = createHmac("sha256", salt).update(user.password).digest("hex");

    this.salt = salt;
    this.password = hashPassword;
    next();
})

userSchema.statics.matchPasswordAndGenerateToken = async function(email,password){
    const user = await this.findOne({email});
    if(!user) throw new Error("User not found");
    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256",salt).update(password).digest("hex");
    if(userProvidedHash !== hashedPassword) throw new Error("Invalid password");
    
    const token = createTokenForUser(user);
    return token;
    console.log(token)
};
const User = model("user",userSchema)

module.exports = User;
// 19:33