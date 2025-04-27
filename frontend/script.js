let modeBtn = document.querySelector("#mode");
let heading = document.querySelector(".heading");
let currMode = "light";
let products = [];
let cart = [];

modeBtn.addEventListener("click", () => {
    if(currMode === "light"){
        currMode = "dark";
        document.body.style.backgroundColor = "black";
        heading.style.color = "white";
        modeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }else{
        currMode = "light";
        document.body.style.backgroundColor = "white";
        heading.style.color = "black";
        modeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
});

// Adding the product
document.getElementById("productForm").addEventListener("submit", function(event){
    event.preventDefault();

    let name = document.getElementById("productName").value;
    let price = parseFloat(document.getElementById("productPrice").value);
    let stock = parseInt(document.getElementById('productStock').value);

    let product = { name, price, stock};
    products.push(product);
    updateProductTable();
    updateProductDropdown();
});

function updateProductTable(){
    let table = document.getElementById("productTable");
    table.innerHTML="";
    products.forEach((product, index) => {
    table.innerHTML += `
        <tr>
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${index})">Delete</button>
            </td>
        </tr>
        `;
    });
}

//updateing the product dropdown
function updateProductDropdown(){
    let dropdown = document.getElementById("productSelect");
    dropdown.innerHTML = `<option value="">Select Product</option>`;
    products.forEach((product, index) => {
        dropdown.innerHTML += `<option value="${index}">${product.name} - ${product.price}</option>`;
    });
}

//Deleteing the product 
function deleteProduct(index){
    products.splice(index, 1);
    updateProductTable();
    updateProductDropdown();
}

//Adding to cart 
function addToCart(){
    let productIndex = document.getElementById("productSelect").value;
    if(productIndex === "") return;

    let product = products[productIndex];
    if(product.stock <= 0){
        alert("Out of Stock!");
        return;
    }

    let cartItem = cart.find(item => item.name === product.name);
    if (cartItem){
        cartItem.quantity++;
    }else{
        cart.push({name : product.name, price: product.price, quantity: 1});
    }

    product.stock--;
    updateCartTable();
    updateProductTable();
}

// updatint the cart table
function updateCartTable() {
    let table = document.getElementById("cartTable");
    table.innerHTML ="";
    let total = 0;

    cart.forEach((item,index) => {
        let itemTotal = item.price *item.quantity;
        total += itemTotal;

        table.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.quantity}</td>
                <td>${itemTotal}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Remove</button>
                </td>
            </tr>
            `;
    });
    document.getElementById("totalPrice").innerText = total;
}

// removing from cart
function removeFromCart(index){
    let item = cart[index];
    let product = products.find(p => p.name === item.name);
    product.stock += item.quantity;

    cart.splice(index, 1);
    updateCartTable();
    updateProductTable();
}

function generateInvoice(){
    if(cart.length === 0){
        alert("Cart is Empty");
        return;
    }

    let invoice = "Invoice:\n";
    cart.forEach(item => {
        invoice += `${item.name} - ${item.price} x ${item.quantity} = ${item.price * item.quantity}\n`;
    });

    invoice += `\nTotal: ${document.getElementById("totalPrice").innerText}`;
    alert(invoice);

    cart = [];
    updateCartTable();
}
