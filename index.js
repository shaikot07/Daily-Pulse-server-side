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




            // user relataded api 
            app.get('/users', async (req, res) => {
                  const result = await userCollection.find().toArray();
                  res.send(result)
            });

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
            app.patch('/users/admin/:id',  async (req, res) => {
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
            app.get('/article', async (req, res) => {
                  const email = req.query.email;
                  const query = { email: email }
                  const result = await articleCollection.find(query).toArray();
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





            // Send a ping to confirm a successful connection
            await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
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