import express from 'express';

// ToDo: for localhost only
const testRoutePing = express.Router();

testRoutePing.get('/api/generics/api/info/ping', async(req, res) => {
    await setTimeout(() => res.sendStatus(200), 600);
});

export default testRoutePing;
