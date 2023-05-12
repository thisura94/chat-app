require('dotenv').config();
console.log(process.env)
const express = require('express');
const app = express();

const Configuration = require('openai').Configuration;
const OpenAIApi = require('openai').OpenAIApi;
const configuration = new Configuration({
    organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });**/


// const Schema = mongoose.Schema;
// const responseSchema = new Schema({
//     prompt: { type: String },
//     status: { type: String },
//     created: { type: Number },
//     message: { type: String },
//     total_tokens: { type: Number }
// });
// const Response = mongoose.model("Response", responseSchema);

const createAndSaveResponse = (apiResponse) => {
    return apiResponse.save()
        .then((savedData) => {
            return savedData;
        })
        .catch((err) => {
            console.error(err);
            throw err;
    });
};


const generateResponse = async ( parcel ) => {
    let res = '';

    const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {role: 'user', content: parcel},
        ]
    });

    // res = completion.data.choices[0].message;
    return completion;
};


app.use(express.static('public'));
app.use(express.json());


app.get('/info', (req, res) => {
    res.status(200).json({info: 'This is a Chat Microservice built using the OpenAI API `createChatCompletion`'});
});


app.post('/inputMsg', async (req, res) => {
    const { parcel } = req.body;
    console.log(parcel);
    if (!parcel) {
        return res.status(400).send({ status: 'failed'});
    }
    const response = await generateResponse(parcel);
    const apiResponse = new Response({
        prompt: parcel,
        status: 'recieved',
        created: response.data.created,
        message: response.data.choices[0].message.content,
        total_tokens: response.data.usage.total_tokens
    });
    console.log(apiResponse);
    createAndSaveResponse(apiResponse);
    res.status(200).send(apiResponse);
});


app.listen(process.env.PORT || 3000);
console.log(`App listening at http://localhost:${process.env.PORT || 3000}`);

module.exports = app;