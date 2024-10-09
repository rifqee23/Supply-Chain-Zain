const express = require('express')
const app = express()
const port = 3000

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const authController = require("./auth/auth.controller");
const productController = require("./product/product.controller");

app.use("/api/auth", authController);
app.use("/api/products", productController);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})