require('./config/config.js');
let {mongoose}=require("./db/mongoose");
let {ObjectID}=require("mongodb");
let {Todo}=require("./models/todo");
let {User}=require("./models/user");
let express= require("express");
// const {SHA256}=require("crypto-js");
let bodyParser=require("body-parser");
const jwt=require("jsonwebtoken")
let {authenticate}=require('./middleware/authenticate')
const bcrypt = require("bcryptjs");
//jwt.sign jwt.verify

const _=require('lodash');
const port=process.env.PORT || 3000;
let app=express();
app.use(bodyParser.json());
app.post("/todos",(req,res)=>{
    let todo=new Todo({
        text:req.body.text
    })
    todo.save().then((doc)=>{
        res.status(200).send(doc)
    },(e)=>{
        res.status(400).send(e)
    })
});
app.get("/todos",(req,res)=>{

    Todo.find().then((todos)=>{
        res.send({todos})
    },(e)=>{
        res.status(400).send(e);
    });

});
app.get('/todos/:id',(req,res)=>{
    let id=req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send()
    }
    Todo.findById(id).then((todo)=>{
        if(todo){
            res.send({todo})
        }else{
          return  res.status(404).send()
        }
    }).catch((e)=>{
        res.status(400).send()
    })
})
app.delete("/todos/:id",(req,res)=>{

    let id=req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then((todo)=>{
        if(!todo){
            return res.status(404).send()
        }
        res.status(200).send({todo});
    }).catch((e)=>{
        res.status(400).send()
    })
})

app.patch("/todos/:id",(req,res)=>{

    let id=req.params.id;
    let body=_.pick(req.body,['text','completed']);
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    if(_.isBoolean(body.completed)&& body.completed){
        body.completedAt=new Date().getTime();
    }else{
        body.completed=false;
        body.completedAt=null;
    }
    Todo.findByIdAndUpdate(id,{$set:body},{new:true}).then((todo)=>{
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo:todo})
    }).catch((e)=>{res.status(400).send()})
})

//post users
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
  
    user.save().then((user) => {
    //   res.send(user);
   return user.generateAuthToken()
    }).then((token)=>{
        res.header('x-auth',token).send(user)
    }).catch((e) => {
      res.status(400).send(e);
    })
  });

  

app.get("/users/me",authenticate,(req,res)=>{
    // let token=req.header('x-auth');
    // User.findByToken(token).then((user)=>{
    //     if(!user){
    //         return Promise.reject();
    //     }
    //     res.send(user);
    // }).catch((e)=>{
    //     res.status(401).send()
    // })

    res.send(req.user)
})
//post /users/login(email,password)

app.post("/users/login",(req,res)=>{
  let body=_.pick(req.body,['email','password'])

  User.findByCredentials(body.email,body.password).then((user)=>{
return user.generateAuthToken().then((token)=>{
    res.header("x-auth",token).send(user)
})
  }).catch((e)=>{
    res.status(400).send();
  })  
})
app.delete("/users/me/token",authenticate,(req,res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send();
    })
})

app.listen(port,()=>{
    console.log(`Started on port ${port}`)
})

module.exports={app}