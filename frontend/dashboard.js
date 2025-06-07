document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  document.getElementById("userName").textContent = user.name;

  // Role-based access
  if (user.role !== "admin") {
    document.getElementById("productTab").style.display = "none";
    document.getElementById("reportTab").style.display = "none";
  }

  fetchProducts();

  if (user.role === "admin") {
    fetchSalesData();
  }
});

// Logout
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// Fetch products
function fetchProducts() {
  fetch("http://localhost:3000/api/products")
    .then((res) => res.json())
    .then((products) => {
      updateProductTable(products);
      updateProductDropdown(products);
    })
    .catch((err) => console.error("Failed to load products:", err));
}

// Update product table
function updateProductTable(products) {
  const tbody = document.getElementById("productTable");
  tbody.innerHTML = "";

  products.forEach((product, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${product.name}</td>
      <td>₹${product.price}</td>
      <td>${product.stock}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Update product dropdown
function updateProductDropdown(products) {
  const select = document.getElementById("productSelect");
  select.innerHTML = `<option value="">Select Product</option>`;

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.name;
    option.textContent = `${product.name} - ₹${product.price}`;
    select.appendChild(option);
  });
}

// Add product
document.getElementById("productForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("productName").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const stock = parseInt(document.getElementById("productStock").value);

  fetch("http://localhost:3000/api/products/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, stock }),
  })
    .then(() => fetchProducts())
    .catch((err) => console.error("Add product error:", err));
});

// Delete product
function deleteProduct(id) {
  fetch(`http://localhost:3000/api/products/${id}`, {
    method: "DELETE",
  })
    .then(() => fetchProducts())
    .catch((err) => console.error("Delete product error:", err));
}

// Cart
let cart = [];

function addToCart() {
  const productName = document.getElementById("productSelect").value;
  if (!productName) {
    alert("Please select a product");
    return;
  }

  fetch("http://localhost:3000/api/products")
    .then((res) => res.json())
    .then((products) => {
      const product = products.find((p) => p.name === productName);
      if (!product) {
        alert("Product not found");
        return;
      }

      const existing = cart.find((item) => item.name === product.name);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          return alert("Not enough stock available");
        }
        existing.quantity += 1;
      } else {
        if (product.stock < 1) {
          return alert("Out of stock");
        }
        cart.push({ ...product, quantity: 1 });
      }

      updateCartTable();
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
      alert("Failed to fetch product data");
    });
}

function updateCartTable() {
  const tbody = document.getElementById("cartTable");
  tbody.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>₹${item.price}</td>
      <td>${item.quantity}</td>
      <td>₹${itemTotal}</td>
      <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">X</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalPrice").textContent = total;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartTable();
}

// Invoice generation
function generateInvoice() {
  if (cart.length === 0) return alert("Cart is empty!");

  const invoice = {
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };

  fetch("http://localhost:3000/api/billing/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoice),
  })
    .then((res) => res.json())
    .then((data) => {
      alert("Invoice generated successfully!");
      generatePDFInvoice(invoice);
      cart.length = 0;
      updateCartTable();
      if (localStorage.getItem("userRole") === "admin") fetchSalesData();
    })
    .catch((err) => console.error("Invoice error:", err));
}

function generatePDFInvoice(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Grocery Store Invoice", 20, 20);
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleString()}`, 20, 30);

  let y = 40;
  doc.text("Product", 20, y);
  doc.text("Qty", 90, y);
  doc.text("Price", 120, y);
  doc.text("Total", 160, y);
  y += 10;

  data.items.forEach(item => {
    doc.text(item.name, 20, y);
    doc.text(item.quantity.toString(), 90, y);
    doc.text(`₹${item.price}`, 120, y);
    doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 160, y);
    y += 10;
  });

  doc.setFontSize(14);
  doc.text(`Grand Total: ₹${data.total.toFixed(2)}`, 20, y + 10);

  doc.save("invoice.pdf");
}


// Fetch sales data
function fetchSalesData() {
  fetch("http://localhost:3000/api/reports")
    .then((res) => res.json())
    .then((sales) => updateSalesTable(sales))
    .catch((err) => console.error("Sales fetch error:", err));
}

function updateSalesTable(sales) {
  const tbody = document.getElementById("salesTable");
  tbody.innerHTML = "";

  sales.forEach((s) => {
    const itemStr = s.items.map((i) => `${i.name} (x${i.quantity})`).join(", ");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(s.timestamp).toLocaleString()}</td>
      <td>${itemStr}</td>
      <td>₹${s.total}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Export CSV
function exportSalesCSV() {
  fetch("http://localhost:3000/api/reports")
    .then((res) => res.json())
    .then((sales) => {
      let csv = "Date & Time,Items,Total\n";
      sales.forEach((s) => {
        const itemStr = s.items.map((i) => `${i.name} (x${i.quantity})`).join(" | ");
        csv += `"${new Date(s.timestamp).toLocaleString()}","${itemStr}",₹${s.total}\n`;
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sales_report.csv";
      a.click();
    });
}

// Export PDF
function exportSalesPDF() {
  fetch("http://localhost:3000/api/reports")
    .then((res) => res.json())
    .then((sales) => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Sales Report", 14, 10);
      let y = 20;

      sales.forEach((s, idx) => {
        const itemStr = s.items.map((i) => `${i.name}(x${i.quantity})`).join(", ");
        doc.text(`${idx + 1}. ${new Date(s.timestamp).toLocaleString()}`, 14, y);
        y += 6;
        doc.text(`Items: ${itemStr}`, 14, y);
        y += 6;
        doc.text(`Total: ₹${s.total}`, 14, y);
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      doc.save("sales_report.pdf");
    });
}
