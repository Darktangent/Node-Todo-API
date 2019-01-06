let mongoose=require("mongoose")
let User= new mongoose.model("User",{
    email:{
        type:String,
        required:true,
        trim:true,
        minlength:1
    }
    
    })
    module.export={
        User:User
    }