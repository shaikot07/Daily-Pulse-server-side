const express = require('express');
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;



// middleWare 
app.use(cors());
app.use(express.json());

// dailypulse
// tN9Da0b11ltUqM3j

console.log(process.env.DB_PASS);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.loifkbc.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb+srv://<username>:<password>@cluster0.loifkbc.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
      serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
      }
});

async function run() {
      try {
            // Connect the client to the server	(optional starting in v4.7)
            // await client.connect();
            // start operation 

            const userCollection = client.db('dailypulseDB').collection('users');
            const articleCollection = client.db('dailypulseDB').collection('article');
            const publisherleCollection = client.db('dailypulseDB').collection('publisher');





            // jwt related api 
            app.post('/jwt', async (req, res) => {
                  const user = req.body;
                  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
                  res.send({ token })
            })

            // middlewares 
            const verifyToken = (req, res, next) => {
                  console.log('inside verify token', req.headers.authorization);
                  if (!req.headers.authorization) {
                        return res.status(401).send({ message: 'unauthorized access' });
                  }
                  const token = req.headers.authorization.split(' ')[1];
                  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                        if (err) {
                              return res.status(401).send({ message: 'unauthorized access' })
                        }
                        req.decoded = decoded;
                        next();
                  })
            }

            // use verify admin after verifyToken
            const verifyAdmin = async (req, res, next) => {
                  const email = req.decoded.email;
                  const query = { email: email };
                  const user = await userCollection.findOne(query);
                  const isAdmin = user?.role === 'admin';
                  if (!isAdmin) {
                        return res.status(403).send({ message: 'forbidden access' });
                  }
                  next();
            }

            // user relataded api 
            app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
                  const result = await userCollection.find().toArray();
                  res.send(result)
            });

            // admin check kore dekhbe j admin ki na 
            app.get('/users/admin/:email', verifyToken, async (req, res) => {
                  const email = req.params.email;

                  if (email !== req.decoded.email) {
                        return res.status(403).send({ message: 'forbidden access' })
                  }

                  const query = { email: email };
                  const user = await userCollection.findOne(query);
                  let admin = false;
                  if (user) {
                        admin = user?.role === 'admin';
                  }
                  res.send({ admin });
            })


            app.post('/users', async (req, res) => {
                  const user = req.body;
                  // insert email if user  doseno't exists 
                  const query = { email: user.email }
                  const existingUser = await userCollection.findOne(query);
                  if (existingUser) {
                        return res.send({ message: 'User already exists', insertedId: null })
                  }
                  const result = await userCollection.insertOne(user);
                  res.send(result);
            })

            // adddmin bana nor jonno fild update 
            app.patch('/users/admin/:id', verifyToken, async (req, res) => {
                  const id = req.params.id;
                  const filter = { _id: new ObjectId(id) };
                  const updatedDoc = {
                        $set: {
                              role: 'admin'
                        }
                  }
                  const result = await userCollection.updateOne(filter, updatedDoc);
                  res.send(result)
            })


            // article related  api 
            app.get('/article', async (req, res) => {
                  const result = await articleCollection.find().toArray();
                  res.send(result)
            })
            app.post('/article', async (req, res) => {
                  const item = req.body;
                  const result = await articleCollection.insertOne(item);
                  res.send(result)
            });
            // get data by email 
            app.get('/article/user', async (req, res) => {
                  const email = req.query.email;
                  // console.log("its a my card", email);
                  const query = { articleAuthorEmail: email }
                  const result = await articleCollection.find(query).toArray();
                  console.log(result);
                  res.send(result)
            });

            // updateed korar kj  api 
            app.patch('/article/:id', async (req, res) => {
                  const item = req.body;
                  const id = req.params.id;
                  const filter = { _id: new ObjectId(id) }
                  const updatedDoc = {
                        $set: {
                              title: item.title,
                              publisher: item.publisher,
                              description: item.description,
                              articleAuthorName: item.articleAuthorName,
                              articleAuthorEmail: item.articleAuthorEmail,
                              postedDate: item.postedDate,
                              image: item.image
                        }
                  }

                  const result = await articleCollection.updateOne(filter, updatedDoc)
                  res.send(result);
            })

            //  delete one article by id 
            app.delete('/article/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: new ObjectId(id) }
                  const result = await articleCollection.deleteOne(query);
                  res.send(result)
            })
            // publisher related api 

            app.get('/publisher', async (req, res) => {
                  const result = await publisherleCollection.find().toArray();
                  res.send(result)
            })
            // added publisher by ADMIN 
            app.post('/publisher', async (req, res) => {
                  const item = req.body;
                  const result = await publisherleCollection.insertOne(item);
                  res.send(result)
            });




            // Send a ping to confirm a successful connection
            // await client.db("admin").command({ ping: 1 });
            // console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } finally {
            // Ensures that the client will close when you finish/error
            // await client.close();
      }
}
run().catch(console.dir);



app.get('/', (req, res) => {
      res.send('simple CRUD BOSS is RUNNINg')
});

app.listen(port, () => {
      console.log(`simple CRUD BOSS is Running on Port,${port}`);
})