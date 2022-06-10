import { Asset, Keypair, Operation, Server, TransactionBuilder } from "stellar-sdk";

async function init() {
    const server = new Server("https://horizon-testnet.stellar.org");

    const fee = await server.fetchBaseFee();

    const tx = new TransactionBuilder(await server.loadAccount("GC2FYDXGZKVYJXTJ7U2EK4YI6YKVCSHFZQHL24VM5K7V2S3F62FKAJPS"), {
        fee: fee.toString(),
        networkPassphrase: 'Test SDF Network ; September 2015'
    }).addOperation(Operation.payment({
        amount: "1",
        asset: Asset.native(),
        destination: "GC2FYDXGZKVYJXTJ7U2EK4YI6YKVCSHFZQHL24VM5K7V2S3F62FKAJPS",
    }))
        .setTimeout(30)
        .build();

    const keyPair = Keypair.fromSecret("SBFOJVJHCKYKICNRCM5E65LTL7AAFJEERSRV6ZC3MMZUOCW2JWEFAA7E");
    tx.sign(keyPair);

    try {
        const response = await server.submitTransaction(tx);
        console.log(response.id);
    } catch (e) {
        console.error(e);
    }
}

init().then(console.log);