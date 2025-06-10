const express = require('express');
const cors = require('cors');
require('dotenv').config()
console.log(process.env.API_KEY_GEMINI) // remove this after you've confirmed it is working



const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h2>Welcome to the App.js Server!</h2>');
    }
);

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: 'o input esta vasio' });
    }
    try{



    } catch (error) {
        
    }
    res.json({
        message: 'Data received successfully',
        data: req.body
    });
    }
);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    }
);