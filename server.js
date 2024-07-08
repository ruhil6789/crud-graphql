
const gRPC = require('@grpc/grpc-js');
const protoLoader = require("@grpc/proto-loader");

const packageDef = protoLoader.loadSync("product.proto", {});
const gRPCObject = gRPC.loadPackageDefinition(packageDef);
//  console.log(gRPCObject,"=========================")
const productPackage = gRPCObject.product;

const products = [];

// function createProduct(call, callback) {}
function createProduct(call, callback) {
    const data = call.request;

    const newProductData = { ...data, id: products.length + 1 };

    products.push(newProductData);

    return callback(null, newProductData);
}
// function readProduct(call, callback) { }
function readProduct(call, callback) {
    const productId = call.request.id;
    const selectedProduct = products.find(product => product.id === productId);

    if (selectedProduct) {
        return callback(null, selectedProduct);
    } else {
        callback({
            code: gRPC.status.NOT_FOUND,
            details: "Could not find a product with the specified ID"
        });
    }
}
// function readProducts(call, callback) { }
function readProducts(call, callback) {
    console.log(products,"products")
    return callback(null, { products });
}
// function updateProduct(call, callback) { }

function updateProduct(call, callback) {
    const productInfo = call.request;

    const productIndex = products.findIndex(product => product.id === productInfo.id);


    if (!productIndex) {
        return callback({
            code: gRPC.status.NOT_FOUND,
            details: "Could not find a product with the specified ID to update"
        });
    }

    const selectedProduct = products[productIndex];

    const updatedProduct = {
        id: selectedProduct.id,
        name: productInfo.name ?? selectedProduct.name,
        description: productInfo.description ?? selectedProduct.description,
        price: productInfo.price ?? selectedProduct.price,
        category: productInfo.category ?? selectedProduct.category,
    }

    products.splice(productIndex, 1, updatedProduct);

    return callback(null, updatedProduct);
}
// function deleteProduct(call, callback) { }


function deleteProduct(call, callback) {
    const productId = call.request.id;
    const productIndex = products.findIndex(product => product.id === productId);
    if (!productIndex) {
        return callback({
            code: gRPC.status.NOT_FOUND,
            details: "Could not find a product with the specified ID to delete"
        });
    }

    products.splice(productIndex, 1);

    return callback(null, { deleted: true });
}

const server = new gRPC.Server();
server.addService(productPackage.Product.service, {
    createProduct,
    readProduct,
    readProducts,
    updateProduct,
    deleteProduct,
});

server.bindAsync("0.0.0.0:4000", gRPC.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Server bind failed:', err);
        return;
    }
    console.log(`Server bound on port: ${port}`);
    // server.()
});