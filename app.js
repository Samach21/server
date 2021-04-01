const express = require('express');
const fs = require('fs');
const { reset } = require('nodemon');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.send('oktest');
})
/**
 * body: {
 *  username: string,
 *  password: string
 * }
 */
app.post('/register', (req, res) => {
    const account = req.body;
    const readAccounts = readDatabase('accounts');

    let isDuplicate = false;
    for (const readAccount of readAccounts) {
        if (account.username == readAccount.username) {
            isDuplicate = true;
        }
    }

    if (isDuplicate) {
        res.status(401).send("duplicate account");
        return;
    }

    readAccounts.push(account);
    const savedAccounts = writeDatabase('accounts', readAccounts);
    res.send(savedAccounts);
})

app.post('/login', (req, res) => {
    const account = req.body;
    const readAccounts = readDatabase('accounts');

    const readAccount = readAccounts.find((readAccount) => readAccount.username === account.username);

    if (!readAccount) res.status(404).send(false);

    let result = readAccount.password === account.password ? true : false;

    if (result) {
        res.status(201).send(true)
    } else {
        res.status(401).send(false);
    }


})

/**
 * query : {
 *  page: string -> number of page.
 * }
 */
app.get('/store', (req, res) => {
    const page = Number.parseInt(req.query.page);
    // reverse to make record arrange from new one to old one.
    const readProducts = readDatabase('products').reverse();
    // 10 products per page.
    const productsInPage = readProducts.slice(page * 10, page * 10 + 10);

    res.status(200).send(productsInPage);
}

)

/**
 * body: {
 *  productName: string,
 *  price: number
 * }
 */
app.post('/store', (req, res) => {
    const product = req.body;

    const readProducts = readDatabase('products');
    // generate incremental id
    product['id'] = readProducts[readProducts.length - 1].id + 1;

    readProducts.push(product);
    const savedProducts = writeDatabase('products', readProducts);

    res.status(201).send(savedProducts);
})

app.delete('/store/:id', (req, res) => {
    const deleteProductId = Number.parseInt(req.params.id);

    const readProducts = readDatabase('products');

    const saveProducts = readProducts.filter((product) => product.id !== deleteProductId);

    const savedProducts = writeDatabase('products', saveProducts);

    res.status(200).send(savedProducts);
})

function readDatabase(filename) {
    const readBuffer = fs.readFileSync(filename + '.json');
    const readAccounts = JSON.parse(readBuffer);
    return readAccounts
}

function writeDatabase(filename, data) {
    const saveData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filename + '.json', saveData);
    return saveData;
}


app.listen(3001, () => {
    console.log("listening at port 3001...");
})