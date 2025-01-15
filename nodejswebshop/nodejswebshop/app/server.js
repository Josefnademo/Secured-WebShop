const express = require("express");


const app = express();
const userRoute = require('./routes/User');
app.use('/user', userRoute);



// Démarrage du serveur
app.listen(8080, () => {
    console.log('Server running on port 8080');
});