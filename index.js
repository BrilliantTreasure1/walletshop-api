const exprees = require("express");
const app = exprees();
app.use(exprees.json());

app.use('/users' , require('./routes/user'));
app.use('/products' , require('./routes/products'));
app.use('/orders' , require('./routes/orders'));

app.listen(3000 , ()=> {
    console.log("app listen to the port 3000")
});
