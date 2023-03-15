const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zcenc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri)
async function run(){
    try{
        const appointmentOptionCollection = client.db('doctorsPortal').collection('appointmentOptions');
        const bookingCollection = client.db('doctorsPortal').collection('bookings');
        
        // Use Aggregate to query multiple collection and then merge data
        app.get('/appointmentOptions', async(req, res) => {
            const date = req.query.date;
            const query = {}
            const options = await appointmentOptionCollection.find(query).toArray();
            const bookingQuery = {appointmentDate: date}
            const alreadyBooked = await bookingCollection.find(bookingQuery).toArray();
            // Code carefully
            options.forEach(option => {
                const optionBooked = alreadyBooked.filter(book => book.treatment === option.name)
                const bookedSlots = optionBooked.map(book => book.slot);
                console.log(option.name, bookedSlots);
            })
            res.send(options)
        });
        
        
        /**
         * API Naming Conventions
         * bookings
         * app.get('/bookings')
         * app.get('/bookings/:id')
         * app.post('/booking')
         * app.patch('bookings/:id')
         * app.delete('bookings/:id')
         * **/

        app.post('/bookings', async(req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result)
        })
    }
    finally{

    }
}
run().catch(console.dir);


app.get('/', async(req, res) => {
    res.send('Doctors portal server is running.')
});

app.listen(port, () => console.log(`Doctors Portal is running on ${port}`));