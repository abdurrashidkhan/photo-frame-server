const express = require("express");
require('dotenv').config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());




// verify token
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).send({ messages: 'UnAuthorization' });
  }
  const token = auth.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ messages: 'Forbidden access' })
    }
    req.decoded = decoded;
    next()
  })
}



app.get('/', (req, res) => {
  res.send('DB connected')
})

// 

// Replace the uri string with your MongoDB deployment's connection string.
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lqf9l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const postCollection = client.db('photoFrame').collection('post');
    const likeCollection = client.db('photoFrame').collection('like');

    app.get('/post', async (req, res) => {
      const result = await postCollection.find().toArray();
      res.send(result);
    })
    // 
    
    // insert post 
    app.post('/post', async (req, res) => {
      const postData = req.body;
      const result = await postCollection.insertOne(postData);
      res.send(result);
    })
    app.post('/post/like', async (req, res) => {
      const postData = req.body;
      const result = await likeCollection.insertOne(postData);
      res.send(result);
    })
    // checking like 
    app.get('/post/like/:id', async (req, res) => {
      const id = req.params.id;
      const query = {postId: id};
      const result = await likeCollection.findOne(query);
      res.send(result);
    })


    app.get('/post/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await postCollection.findOne(query);
      res.send(result);
    })
    // 
    // app.put('/post/:email', async(req , res)=>{
    //   const email = req.params.email;
    //   const updatePost = req.body;
    //   console.log(updatePost)
    //   const filter = { email:email };
    //   const updateDoc = {
    //     $set:{
    //       like:true
    //     }
    //   }
    //   const result = await postCollection.updateOne(filter , updateDoc );
    //   res.send(result)
    // })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`localhost ${port}`)
})