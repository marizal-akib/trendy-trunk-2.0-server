const express = require('express');
const cors = require('cors')
const app = express();
const dotenv = require("dotenv")
const port = process.env.PORT || 5000;



dotenv.config()
app.use(cors());
app.use(express.json());

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${user}:${pass}@cluster0.ak4rw.mongodb.net/?retryWrites=true&w=majority`;

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

    const brandCollection = client.db('brandDB').collection('products');
    const subCollection = client.db('brandDB').collection('subs')
    const cartCollection = client.db('brandDB').collection('carts')
    const userCollection = client.db("brandDB").collection('user')


    app.get('/products', async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await brandCollection.findOne(query)
      res.send(result);
    })

    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateProduct = req.body;
      const product = {
        $set: {
          image: updateProduct.image,
          description: updateProduct.description,
          name: updateProduct.name,
          brand_Name: updateProduct.brand_Name,
          type: updateProduct.type,
          price: updateProduct.price,
          rating: updateProduct.rating

        }
      }

      const result = await brandCollection.updateOne(filter, product, options);
      res.send(result);

    })



    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await brandCollection.insertOne(newProduct);
      res.send(result);
    })
    // newsletter api
    app.get('/subs', async (req, res) => {

      const result = await subCollection.find().toArray();
      res.send(result);
    })
    // user api
    app.get('/user', async (req, res) => {
      const cursor = userCollection.find();
      const user = await cursor.toArray();
      res.send(user)
    })
    userCollection.createIndex({ email: 1 }, { unique: true });

    app.post('/user', async (req, res) => {
      const user = req.body;
      console.log(user);
      try {
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        if (error.code === 11000) {
          res.status(400).send('Duplicate entry found. Please provide a unique value.');
        } else {
          res.status(500).send('Internal server error');
        }
      }
    });




    app.put('/user', async (req, res) => {
      const user = req.body;
      console.log(user.email);
      const filter = { email: user.email }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          password: user.password,

        }

      }
      const result = await userCollection.updateOne(filter, updateDoc, options)
      res.send(result);
    })

    // cart

    app.patch('/user', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email }
      const options = { upsert: true };
      const updateDoc = {
        $push: {
          cartProduct: user.cartProduct
        }

      }
      const result = await userCollection.updateOne(filter, updateDoc, options)
      res.send(result);
    })



    app.put('/user/cart', async (req, res) => {
      const cart = req.body;
      console.log(cart.itemToBuy);
      const filter = { email: cart.email }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          cartProduct: cart.itemToBuy

        }

      }
      const result = await userCollection.updateOne(filter, updateDoc)
      res.send(result);
    })


// cart Collection
app.post('/carts', async (req, res) => {
  const item = req.body;
  console.log(item);
  const result = await cartCollection.insertOne(item);
  res.send(result);
})

app.get('/carts', async (req, res) => {
  const email = req.query.email; 
  const query = { email: email };
  const result = await cartCollection.find(query).toArray();
  res.send(result);
})

app.delete('/carts/:id', async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = await cartCollection.deleteOne(query);
  res.send(result);
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
  res.send("TT Shop is running");

})

app.listen(port, () => {
  console.log(`TT server is on port ${port}`)
})