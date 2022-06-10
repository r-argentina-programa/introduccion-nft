import { Asset, Keypair, Operation, Server, TransactionBuilder } from "stellar-sdk";

const server = new Server("https://horizon-testnet.stellar.org");
const fee = await server.fetchBaseFee();

const keyPair = Keypair.fromSecret("SBGYSDTTOW3I6M54ZI4R5TWKDSCLG53E4ZVKEKQOGE2EECDV3PVXH5YI");

const issuerKeyPair = Keypair.random();
const distributorKeyPair = Keypair.random();

const tx = new TransactionBuilder(await server.loadAccount("GB7JFHPEITQ3VARPW3KHLTX6MNBZQ3OUEU6KKQ625CP7TTT62AZOQBJJ"), {
    fee: fee.toString(),
    networkPassphrase: 'Test SDF Network ; September 2015'
})
    .addOperation(Operation.createAccount({
        destination: issuerKeyPair.publicKey(),
        startingBalance: "5"
    }))
    .addOperation(Operation.createAccount({
        destination: distributorKeyPair.publicKey(),
        startingBalance: "5"
    }))
    .addOperation(Operation.manageData({
        name: "ipfshash",
        value: "bafkreicogslm3rjlmjjmim3uooxzrecm4kzcs2mut5vxcsr36bhotqwzsi",
        source: issuerKeyPair.publicKey()
    }))
    .addOperation(Operation.changeTrust({
        asset: new Asset("MINFT", issuerKeyPair.publicKey()),
        source: distributorKeyPair.publicKey()
    }))
    .addOperation(Operation.payment({
        amount: "0.0000001",
        asset: new Asset("MINFT", issuerKeyPair.publicKey()),
        destination: distributorKeyPair.publicKey(),
        source: issuerKeyPair.publicKey()
    }))
    .addOperation(Operation.setOptions({
        source: issuerKeyPair.publicKey(),
        masterWeight: 0
    }))
    .setTimeout(30)
    .build();

tx.sign(keyPair);
tx.sign(distributorKeyPair);
tx.sign(issuerKeyPair);

try {
    const response = await server.submitTransaction(tx);
    console.log(response.id);
    console.log(issuerKeyPair.publicKey())
    console.log(distributorKeyPair.publicKey())

    const account = await server.loadAccount(issuerKeyPair.publicKey());
    console.log(Buffer.from(account.data_attr['ipfshash'], 'base64').toString('utf8'))

} catch (e) {
    console.error(e);
    console.error(e.response.data.extras);
}

const expectedFailingTransaction = new TransactionBuilder(await server.loadAccount("GB7JFHPEITQ3VARPW3KHLTX6MNBZQ3OUEU6KKQ625CP7TTT62AZOQBJJ"), {
    fee: fee.toString(),
    networkPassphrase: 'Test SDF Network ; September 2015'
}).addOperation(Operation.payment({
    amount: "0.0000001",
    asset: new Asset("MINFT", issuerKeyPair.publicKey()),
    destination: distributorKeyPair.publicKey(),
    source: issuerKeyPair.publicKey()
})).setTimeout(30).build();

expectedFailingTransaction.sign(issuerKeyPair);

try {
    await server.submitTransaction(expectedFailingTransaction)
} catch (e) {
    console.error(e);
    console.error(e.response.data.extras);
}

