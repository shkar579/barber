// document.addEventListener('DOMContentLoaded', function () {
//     // ---------- Initialize State ----------
//     let cart = [];
//     let currentFilters = {
//         category: "all",
//         priceRange: "all",
//         availability: "all",
//         sort: "default",
//         search: ""
//     };

//     // ---------- DOM Elements ----------
//     const productsContainer = document.getElementById('products-container');
//     const cartContainer = document.getElementById('cart-container');
//     const cartOverlay = document.getElementById('cart-overlay');
//     const cartIcon = document.getElementById('cart-icon');
//     const closeCartBtn = document.getElementById('close-cart');
//     const cartBadge = document.getElementById('cart-badge');
//     const cartItems = document.getElementById('cart-items');
//     const cartTotal = document.getElementById('cart-total');
//     const checkoutBtn = document.getElementById('checkout-btn');
//     const toastContainer = document.getElementById('toast-container');
//     const applyFiltersBtn = document.getElementById('apply-filters');
//     const resetFiltersBtn = document.getElementById('reset-filters');
//     const categoryFilter = document.getElementById('category-filter');
//     const priceFilter = document.getElementById('price-filter');
//     const availabilityFilter = document.getElementById('availability-filter');
//     const sortFilter = document.getElementById('sort-filter');
//     const searchFilter = document.getElementById('search-filter');
//     const globalDiscountInput = document.getElementById('global-discount');
//     const customerPaymentInput = document.getElementById('customer-payment');
//     const changeDueElement = document.getElementById('change-due');

//     // ---------- Helper Functions ----------
//     function formatCurrency(amount) {
//         return 'IQD' + parseFloat(amount).toFixed(2);
//     }

//     function getStockStatus(product) {
//         if (product.stock <= 0) return 'نەماوە';
//         if (product.stock < 10) return 'کەم ماوە';
//         return 'بەردەستە';
//     }

//     function getStockLabel(product) {
//         if (product.stock <= 0) return 'نەماوە';
//         if (product.stock < 10) return 'کەم ماوە';
//         return 'بەردەستە';
//     }

//     function isExpired(expiryDate) {
//         return new Date(expiryDate) < new Date();
//     }

//     function getDaysUntilExpiry(expiryDate) {
//         const today = new Date();
//         const expiry = new Date(expiryDate);
//         const diffTime = expiry - today;
//         return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     }

//     // ---------- Toast Notifications ----------
//     function showToast(type, title, message) {
//         const toast = document.createElement('div');
//         toast.className = `toast ${type}`;
//         toast.innerHTML = `
//             <div class="toast-icon">
//                 <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
//             </div>
//             <div class="toast-content">
//                 <div class="toast-title">${title}</div>
//                 <div class="toast-message">${message}</div>
//             </div>
//             <button class="close-toast">&times;</button>
//         `;

//         toastContainer.appendChild(toast);

//         // Auto remove after 3 seconds
//         setTimeout(() => {
//             toast.style.animation = 'slideOut 0.3s ease forwards';
//             setTimeout(() => {
//                 // Fix: Check if toast is still a child of toastContainer
//                 if (toast.parentNode === toastContainer) {
//                     toastContainer.removeChild(toast);
//                 }
//             }, 300);
//         }, 3000);

//         // Close button listener
//         toast.querySelector('.close-toast').addEventListener('click', () => {
//             toast.style.animation = 'slideOut 0.3s ease forwards';
//             setTimeout(() => {
//                 // Fix: Check if toast is still a child of toastContainer
//                 if (toast.parentNode === toastContainer) {
//                     toastContainer.removeChild(toast);
//                 }
//             }, 300);
//         });
//     }

//     // ---------- Fetch and Render Products ----------
//     function fetchProducts() {
//         // Convert price range to min-max
//         let priceMin, priceMax;
//         if (currentFilters.priceRange !== 'all') {
//             const priceRange = currentFilters.priceRange.split('-');
//             priceMin = priceRange[0];
//             priceMax = priceRange[1];
//         }

//         // Build query string
//         const queryParams = new URLSearchParams({
//             category: currentFilters.category,
//             priceMin: priceMin || '',
//             priceMax: priceMax || '',
//             availability: currentFilters.availability,
//             sort: currentFilters.sort,
//             search: currentFilters.search
//         });

//         fetch(`/api/products?${queryParams.toString()}`)
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     renderProducts(data.products);
//                 } else {
//                     showToast('error', 'Error', data.message);
//                 }
//             })
//             .catch(error => {
//                 console.error('Error fetching products:', error);
//                 showToast('error', 'Error', 'Failed to fetch products. Please try again.');
//             });
//     }

//     function renderProducts(products) {
//         productsContainer.innerHTML = '';

//         if (products.length === 0) {
//             productsContainer.innerHTML = `
//                 <div class="no-results">
//                     <i class="fas fa-search"></i>
//                     <h3>هیچ بەرهەمێک نەدۆزرایەوە</h3>
//                     <p>هەوڵبە بۆ ڕێکخستنی پێوەرەکانی گەڕانت یان فلتەرەکانت</p>
//                      <button class="filter-button" id="clear-all-filters">سڕینەوەی هەموو فلتەرەکان</button>
//                 </div>
//             `;

//             document.getElementById('clear-all-filters').addEventListener('click', () => {
//                 resetFilters();
//             });

//             return;
//         }

//         products.forEach(product => {
//             const stockStatus = getStockStatus(product);
//             const stockLabel = getStockLabel(product);
//             const isProductExpired = isExpired(product.expiry_date);
//             const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
//             const isExpiryWarning = daysUntilExpiry < 10 && daysUntilExpiry > 0;

//             const productCard = document.createElement('div');
//             productCard.className = 'product-card';
//             productCard.innerHTML = `
//     <div class="product-image-container">
//         ${product.isNew ? `<span class="product-badge new">نوێ</span>` : ''}
//         ${stockStatus === 'low-stock' ? `<span class="product-badge low-stock">کەم ماوە</span>` : ''}
//         ${isProductExpired ? `<span class="product-badge expired">بەسەرچووە</span>` : ''}
//         <img src="${product.image}" alt="${product.title}" class="product-image">
//     </div>
//     <div class="product-content">
//         <div class="product-category">${product.category_name}</div>
//         <h3 class="product-title">${product.title}</h3>
//         <div class="product-meta">
//             <div style="color: #72A07E;" class="product-price">${formatCurrency(product.price)}</div>
//             <div class="product-stock ${stockStatus}">${stockLabel}</div>
//         </div>
//         <div class="product-description">${product.description}</div>
//         <div class="product-footer">
//             <div class="product-expiry ${isExpiryWarning ? 'expiry-warning' : ''}">
//                 ${isProductExpired ? 'بەسەرچووە' : isExpiryWarning ? `بەسەرئەچێت لەماوەیڕ${daysUntilExpiry}  ڕۆژی تر`: `بەرواری بەسەرچوون ${new Date(product.expiry_date).toLocaleDateString()}`}
//             </div>
//             <button style="background-color: #72A07E;" class="add-to-cart-btn" data-id="${product.id}" ${stockStatus === 'نەماوە' || isProductExpired ? 'disabled' : ''}>
//                 <i class="fas fa-shopping-cart"></i> زیادکردن
//             </button>
//         </div>
//     </div>
// `;

//             productsContainer.appendChild(productCard);
//         });

//         // Add event listeners to 'Add to Cart' buttons
//         document.querySelectorAll('.add-to-cart-btn').forEach(button => {
//             button.addEventListener('click', addToCart);
//         });
//     }

//     // ---------- Filter Products ----------
//     function applyFilters() {
//         // Update the currentFilters object with the current values
//         currentFilters = {
//             category: categoryFilter.value,
//             priceRange: priceFilter.value,
//             availability: availabilityFilter.value,
//             sort: sortFilter.value,
//             search: searchFilter.value
//         };

//         fetchProducts();
//     }

//     function resetFilters() {
//         categoryFilter.value = 'all';
//         priceFilter.value = 'all';
//         availabilityFilter.value = 'all';
//         sortFilter.value = 'default';
//         searchFilter.value = '';

//         currentFilters = {
//             category: 'all',
//             priceRange: 'all',
//             availability: 'all',
//             sort: 'default',
//             search: ''
//         };

//         fetchProducts();
//     }

//     // ---------- Cart Management ----------
//     function addToCart(event) {
//         const productId = event.currentTarget.getAttribute('data-id');

//         fetch(`/api/products/${productId}`)
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     const product = data.product;

//                     // Check if product is already in cart
//                     const existingItem = cart.find(item => String(item.id) === String(product.id));

//                     if (existingItem) {
//                         // Check if there's enough stock
//                         if (existingItem.quantity >= product.stock) {
//                             showToast('warning', 'Stock Limit Reached', `ببورە ${product.stock} دانە بەردەستە `);
//                             return;
//                         }

//                         existingItem.quantity += 1;
//                         showToast('success', 'Item Updated', `دووبارە زیادکرا بۆ ناو سەبەتەکەت ${product.title}`);
//                     } else {
//                         cart.push({
//                             id: product.id,
//                             title: product.title,
//                             price: product.price,
//                             image: product.image,
//                             expiry_date: product.expiry_date,
//                             quantity: 1
//                         });
//                         showToast('success', 'Item Added', `زیادکرا بۆ ناو سەبەتەکەت ${product.title}`);
//                     }

//                     updateCart();
//                 } else {
//                     showToast('error', 'Error', data.message);
//                 }
//             })
//             .catch(error => {
//                 console.error('Error fetching product:', error);
//                 showToast('error', 'Error', 'Failed to add product to cart. Please try again.');
//             });
//     }

//     function removeFromCart(productId) {
//         // Fix: Convert both to the same type (strings) for comparison
//         cart = cart.filter(item => String(item.id) !== String(productId));
//         updateCart();
//         showToast('warning', 'Item Removed', 'Item has been removed from your cart.');
//     }

//     function updateQuantity(productId, change) {
//         // Fix: Convert to string for consistent comparison
//         const cartItem = cart.find(item => String(item.id) === String(productId));

//         fetch(`/api/products/${productId}`)
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     const product = data.product;

//                     if (!cartItem) return;

//                     const newQuantity = cartItem.quantity + change;

//                     if (newQuantity <= 0) {
//                         removeFromCart(productId);
//                         return;
//                     }

//                     if (newQuantity > product.stock) {
//                         showToast('warning', 'Stock Limit Reached', `ببورە ${product.stock} دانە بەردەستە `);
//                         return;
//                     }

//                     cartItem.quantity = newQuantity;
//                     updateCart();
//                 } else {
//                     showToast('error', 'Error', data.message);
//                 }
//             })
//             .catch(error => {
//                 console.error('Error fetching product:', error);
//                 showToast('error', 'Error', 'Failed to update cart. Please try again.');
//             });
//     }

//     function updateCart() {
//         // Update cart badge
//         const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//         cartBadge.textContent = totalItems;

//         // Update cart items
//         cartItems.innerHTML = '';

//         if (cart.length === 0) {
//             cartItems.innerHTML = `
//             <div class="empty-cart">
//                 <i class="fas fa-shopping-cart"></i>
//                 <p>سەبەتەکەت بەتاڵە</p>
//                 <button style="background-color: #72A07E;" class="continue-shopping" id="continue-shopping">بەردەوامبوون لە بازاڕکردن</button>
//             </div>
//         `;

//             document.getElementById('continue-shopping').addEventListener('click', () => {
//                 closeCart();
//             });
//         } else {
//             cart.forEach(item => {
//                 const isProductExpired = isExpired(item.expiry_date);
//                 const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date);
//                 const isExpiryWarning = daysUntilExpiry < 10 && daysUntilExpiry > 0;

//                 const cartItemElement = document.createElement('div');
//                 cartItemElement.className = 'cart-item';
//                 cartItemElement.innerHTML = `
//                 <img src="${item.image}" alt="${item.title}" class="cart-item-image">
//                 <div class="cart-item-details">
//                     <div class="cart-item-title">${item.title}</div>
//                     <div class="cart-item-meta">
//                         <div style="color: #72A07E;" class="cart-item-price">${formatCurrency(item.price)}</div>
//                         <div class="cart-item-expiry ${isExpiryWarning ? 'expiry-warning' : ''}">
//                             ${isProductExpired ? 'بەسەرچووە' : isExpiryWarning ? `بەسەرئەچێت لەماوەیڕ${daysUntilExpiry}  ڕۆژی تر` : `بەرواری بەسەرچوون ${new Date(item.expiry_date).toLocaleDateString()}`}
//                         </div>
//                     </div>
//                     <div class="cart-item-quantity">
//                         <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
//                         <span class="quantity-value">${item.quantity}</span>
//                         <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
//                         <button class="remove-item" data-id="${item.id}">
//                             <i class="fas fa-trash-alt"></i>
//                         </button>
//                     </div>
//                 </div>
//             `;

//                 cartItems.appendChild(cartItemElement);
//             });

//             // Add event listeners to cart item buttons
//             document.querySelectorAll('.decrease-quantity').forEach(button => {
//                 button.addEventListener('click', event => {
//                     const id = event.currentTarget.getAttribute('data-id');
//                     updateQuantity(id, -1);
//                 });
//             });

//             document.querySelectorAll('.increase-quantity').forEach(button => {
//                 button.addEventListener('click', event => {
//                     const id = event.currentTarget.getAttribute('data-id');
//                     updateQuantity(id, 1);
//                 });
//             });

//             document.querySelectorAll('.remove-item').forEach(button => {
//                 button.addEventListener('click', event => {
//                     const id = event.currentTarget.getAttribute('data-id');
//                     removeFromCart(id);
//                 });
//             });
//         }

//         // Update cart summary
//         const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//         const discount = parseFloat(globalDiscountInput.value) || 0;
//         const total = subtotal - (subtotal * (discount / 100));
//         const customerPayment = parseFloat(customerPaymentInput.value) || 0;
//         const changeDue = customerPayment - total;

//         cartTotal.textContent = formatCurrency(total);
//         changeDueElement.textContent = formatCurrency(changeDue >= 0 ? changeDue : 0);
//     }

//     function openCart() {
//         cartContainer.classList.add('active');
//         cartOverlay.style.display = 'block';
//         document.body.style.overflow = 'hidden';
//     }

//     function closeCart() {
//         cartContainer.classList.remove('active');
//         cartOverlay.style.display = 'none';
//         document.body.style.overflow = 'auto';
//     }

//     // ---------- Checkout ----------
//     function checkout() {
//         if (cart.length === 0) {
//             showToast('', 'سەبەتەکەت بەتاڵە');
//             return;
//         }

//         const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//         const discount = parseFloat(globalDiscountInput.value) || 0;
//         const total = subtotal - (subtotal * (discount / 100));
//         const customerPayment = parseFloat(customerPaymentInput.value) || 0;

//         if (customerPayment < total) {
//             showToast('', 'بڕی بازاڕکردن زیاترە لە بڕی پارەدان تکایە چاکی بکە');
//             return;
//         }

//         // Prepare data for API call
//         const checkoutData = {
//             items: cart,
//             totalAmount: total,
//             customerPayment: customerPayment,
//             discount: discount
//         };

//         // Make the API call to process the order
//         showToast('success', 'Processing Order', 'Please wait while we process your order...');

//         fetch('/api/checkout', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(checkoutData)
//         })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     cart = [];
//                     updateCart();
//                     closeCart();
//                     showToast('success', 'Order Placed', `Thank you for your purchase! Change due: ${formatCurrency(data.changeDue)}`);
//                     location.reload();
//                 } else {
//                     showToast('error', 'Checkout Error', data.message);
//                 }
//             })
//             .catch(error => {
//                 console.error('Error during checkout:', error);
//                 showToast('error', 'Checkout Error', 'Failed to process your order. Please try again.');
//             });
//     }

//     // ---------- Event Listeners ----------
//     cartIcon.addEventListener('click', openCart);
//     closeCartBtn.addEventListener('click', closeCart);
//     cartOverlay.addEventListener('click', closeCart);
//     checkoutBtn.addEventListener('click', checkout);
//     applyFiltersBtn.addEventListener('click', applyFilters);
//     resetFiltersBtn.addEventListener('click', resetFilters);
//     globalDiscountInput.addEventListener('input', updateCart);
//     customerPaymentInput.addEventListener('input', updateCart);
//     searchFilter.addEventListener('keyup', event => {
//         if (event.key === 'Enter') {
//             applyFilters();
//         }
//     });

//     // Initialize
//     fetchProducts();
//     updateCart();
// });

// document.addEventListener('DOMContentLoaded', function () {
//     // ---------- Initialize State ----------
//     let cart = [];
//     let currentFilters = {
//         category: "all",
//         priceRange: "all",
//         availability: "all",
//         sort: "default",
//         search: ""
//     };

//     // ---------- DOM Elements ----------
//     const productsContainer = document.getElementById('products-container');
//     const cartContainer = document.getElementById('cart-container');
//     const cartOverlay = document.getElementById('cart-overlay');
//     const cartIcon = document.getElementById('cart-icon');
//     const closeCartBtn = document.getElementById('close-cart');
//     const cartBadge = document.getElementById('cart-badge');
//     const cartItems = document.getElementById('cart-items');
//     const cartTotal = document.getElementById('cart-total');
//     const checkoutBtn = document.getElementById('checkout-btn');
//     const toastContainer = document.getElementById('toast-container');
//     const applyFiltersBtn = document.getElementById('apply-filters');
//     const resetFiltersBtn = document.getElementById('reset-filters');
//     const categoryFilter = document.getElementById('category-filter');
//     const priceFilter = document.getElementById('price-filter');
//     const availabilityFilter = document.getElementById('availability-filter');
//     const sortFilter = document.getElementById('sort-filter');
//     const searchFilter = document.getElementById('search-filter');
//     const customerPaymentInput = document.getElementById('customer-payment');
//     const changeDueElement = document.getElementById('change-due');

//     // ---------- Helper Functions ----------
//     function formatCurrency(amount) {
//         return 'IQD' + parseFloat(amount).toFixed(2);
//     }

//     function getStockStatus(product) {
//         if (product.stock <= 0) return 'نەماوە';
//         if (product.stock < 10) return 'کەم ماوە';
//         return 'بەردەستە';
//     }

//     function getStockLabel(product) {
//         if (product.stock <= 0) return 'نەماوە';
//         if (product.stock < 10) return 'کەم ماوە';
//         return 'بەردەستە';
//     }

//     function isExpired(expiryDate) {
//         return new Date(expiryDate) < new Date();
//     }

//     function getDaysUntilExpiry(expiryDate) {
//         const today = new Date();
//         const expiry = new Date(expiryDate);
//         const diffTime = expiry - today;
//         return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     }

//     // ---------- Toast Notifications ----------
//     function showToast(type, title, message) {
//         const toast = document.createElement('div');
//         toast.className = `toast ${type}`;
//         toast.innerHTML = `
//             <div class="toast-icon">
//                 <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
//             </div>
//             <div class="toast-content">
//                 <div class="toast-title">${title}</div>
//                 <div class="toast-message">${message}</div>
//             </div>
//             <button class="close-toast">&times;</button>
//         `;

//         toastContainer.appendChild(toast);

//         // Auto remove after 3 seconds
//         setTimeout(() => {
//             toast.style.animation = 'slideOut 0.3s ease forwards';
//             setTimeout(() => {
//                 // Fix: Check if toast is still a child of toastContainer
//                 if (toast.parentNode === toastContainer) {
//                     toastContainer.removeChild(toast);
//                 }
//             }, 300);
//         }, 3000);

//         // Close button listener
//         toast.querySelector('.close-toast').addEventListener('click', () => {
//             toast.style.animation = 'slideOut 0.3s ease forwards';
//             setTimeout(() => {
//                 // Fix: Check if toast is still a child of toastContainer
//                 if (toast.parentNode === toastContainer) {
//                     toastContainer.removeChild(toast);
//                 }
//             }, 300);
//         });
//     }

//     // ---------- Fetch and Render Products ----------
//     function fetchProducts() {
//         // Convert price range to min-max
//         let priceMin, priceMax;
//         if (currentFilters.priceRange !== 'all') {
//             const priceRange = currentFilters.priceRange.split('-');
//             priceMin = priceRange[0];
//             priceMax = priceRange[1];
//         }

//         // Build query string
//         const queryParams = new URLSearchParams({
//             category: currentFilters.category,
//             priceMin: priceMin || '',
//             priceMax: priceMax || '',
//             availability: currentFilters.availability,
//             sort: currentFilters.sort,
//             search: currentFilters.search
//         });

//         fetch(`/api/products?${queryParams.toString()}`)
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     renderProducts(data.products);
//                 } else {
//                     showToast('error', 'Error', data.message);
//                 }
//             })
//             .catch(error => {
//                 console.error('Error fetching products:', error);
//                 showToast('error', 'Error', 'Failed to fetch products. Please try again.');
//             });
//     }

//     function renderProducts(products) {
//         productsContainer.innerHTML = '';

//         if (products.length === 0) {
//             productsContainer.innerHTML = `
//                 <div class="no-results">
//                     <i class="fas fa-search"></i>
//                     <h3>هیچ بەرهەمێک نەدۆزرایەوە</h3>
//                     <p>هەوڵبە بۆ ڕێکخستنی پێوەرەکانی گەڕانت یان فلتەرەکانت</p>
//                      <button class="filter-button" id="clear-all-filters">سڕینەوەی هەموو فلتەرەکان</button>
//                 </div>
//             `;

//             document.getElementById('clear-all-filters').addEventListener('click', () => {
//                 resetFilters();
//             });

//             return;
//         }

//         products.forEach(product => {
//             const stockStatus = getStockStatus(product);
//             const stockLabel = getStockLabel(product);
//             const isProductExpired = isExpired(product.expiry_date);
//             const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
//             const isExpiryWarning = daysUntilExpiry < 10 && daysUntilExpiry > 0;

//             const productCard = document.createElement('div');
//             productCard.className = 'product-card';
//             productCard.innerHTML = `
//     <div class="product-image-container">
//         ${product.isNew ? `<span class="product-badge new">نوێ</span>` : ''}
//         ${stockStatus === 'low-stock' ? `<span class="product-badge low-stock">کەم ماوە</span>` : ''}
//         ${isProductExpired ? `<span class="product-badge expired">بەسەرچووە</span>` : ''}
//         <img src="${product.image}" alt="${product.title}" class="product-image">
//     </div>
//     <div class="product-content">
//         <div class="product-category">${product.category_name}</div>
//         <h3 class="product-title">${product.title}</h3>
//         <div class="product-meta">
//             <div style="color: #72A07E;" class="product-price">${formatCurrency(product.price)}</div>
//             <div class="product-stock ${stockStatus}">${stockLabel}</div>
//         </div>
//         <div class="product-description">${product.description}</div>
//         <div class="product-footer">
//             <div class="product-expiry ${isExpiryWarning ? 'expiry-warning' : ''}">
//                 ${isProductExpired ? 'بەسەرچووە' : isExpiryWarning ? `بەسەرئەچێت لەماوەیڕ${daysUntilExpiry}  ڕۆژی تر` : `بەرواری بەسەرچوون ${new Date(product.expiry_date).toLocaleDateString()}`}
//             </div>
//             <button style="background-color: #72A07E;" class="add-to-cart-btn" data-id="${product.id}" ${stockStatus === 'نەماوە' || isProductExpired ? 'disabled' : ''}>
//                 <i class="fas fa-shopping-cart"></i> زیادکردن
//             </button>
//         </div>
//     </div>
// `;

//             productsContainer.appendChild(productCard);
//         });

//         // Add event listeners to 'Add to Cart' buttons
//         document.querySelectorAll('.add-to-cart-btn').forEach(button => {
//             button.addEventListener('click', addToCart);
//         });
//     }

//     // ---------- Filter Products ----------
//     function applyFilters() {
//         // Update the currentFilters object with the current values
//         currentFilters = {
//             category: categoryFilter.value,
//             priceRange: priceFilter.value,
//             availability: availabilityFilter.value,
//             sort: sortFilter.value,
//             search: searchFilter.value
//         };

//         fetchProducts();
//     }

//     function resetFilters() {
//         categoryFilter.value = 'all';
//         priceFilter.value = 'all';
//         availabilityFilter.value = 'all';
//         sortFilter.value = 'default';
//         searchFilter.value = '';

//         currentFilters = {
//             category: 'all',
//             priceRange: 'all',
//             availability: 'all',
//             sort: 'default',
//             search: ''
//         };

//         fetchProducts();
//     }

//     // ---------- Cart Management ----------
//     function addToCart(event) {
//         const productId = event.currentTarget.getAttribute('data-id');

//         fetch(`/api/products/${productId}`)
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     const product = data.product;

//                     // Check if product is already in cart
//                     const existingItem = cart.find(item => String(item.id) === String(product.id));

//                     if (existingItem) {
//                         // Check if there's enough stock
//                         if (existingItem.quantity >= product.stock) {
//                             showToast('warning', 'Stock Limit Reached', `ببورە ${product.stock} دانە بەردەستە `);
//                             return;
//                         }

//                         existingItem.quantity += 1;
//                         showToast('success', 'Item Updated', `دووبارە زیادکرا بۆ ناو سەبەتەکەت ${product.title}`);
//                     } else {
//                         cart.push({
//                             id: product.id,
//                             title: product.title,
//                             price: product.price,
//                             image: product.image,
//                             expiry_date: product.expiry_date,
//                             quantity: 1,
//                             discount: 0 // Initialize discount to 0
//                         });
//                         showToast('success', 'Item Added', `زیادکرا بۆ ناو سەبەتەکەت ${product.title}`);
//                     }

//                     updateCart();
//                 } else {
//                     showToast('error', 'Error', data.message);
//                 }
//             })
//             .catch(error => {
//                 console.error('Error fetching product:', error);
//                 showToast('error', 'Error', 'Failed to add product to cart. Please try again.');
//             });
//     }

//     function removeFromCart(productId) {
//         // Fix: Convert both to the same type (strings) for comparison
//         cart = cart.filter(item => String(item.id) !== String(productId));
//         updateCart();
//         showToast('warning', 'Item Removed', 'Item has been removed from your cart.');
//     }

//     function updateQuantity(productId, change) {
//         // Fix: Convert to string for consistent comparison
//         const cartItem = cart.find(item => String(item.id) === String(productId));

//         fetch(`/api/products/${productId}`)
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     const product = data.product;

//                     if (!cartItem) return;

//                     const newQuantity = cartItem.quantity + change;

//                     if (newQuantity <= 0) {
//                         removeFromCart(productId);
//                         return;
//                     }

//                     if (newQuantity > product.stock) {
//                         showToast('warning', 'Stock Limit Reached', `ببورە ${product.stock} دانە بەردەستە `);
//                         return;
//                     }

//                     cartItem.quantity = newQuantity;
//                     updateCart();
//                 } else {
//                     showToast('error', 'Error', data.message);
//                 }
//             })
//             .catch(error => {
//                 console.error('Error fetching product:', error);
//                 showToast('error', 'Error', 'Failed to update cart. Please try again.');
//             });
//     }

//     function updateItemDiscount(productId, discount) {
//         // Find the item and update its discount
//         const cartItem = cart.find(item => String(item.id) === String(productId));
//         if (cartItem) {
//             // Ensure discount is not greater than the item price
//             discount = Math.min(parseFloat(discount) || 0, cartItem.price);
//             cartItem.discount = discount;
//             updateCart();
//         }
//     }

//     function updateCart() {
//         // Update cart badge
//         const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//         cartBadge.textContent = totalItems;

//         // Update cart items
//         cartItems.innerHTML = '';

//         if (cart.length === 0) {
//             cartItems.innerHTML = `
//             <div class="empty-cart">
//                 <i class="fas fa-shopping-cart"></i>
//                 <p>سەبەتەکەت بەتاڵە</p>
//                 <button style="background-color: #72A07E;" class="continue-shopping" id="continue-shopping">بەردەوامبوون لە بازاڕکردن</button>
//             </div>
//         `;

//             document.getElementById('continue-shopping').addEventListener('click', () => {
//                 closeCart();
//             });
//         } else {
//             cart.forEach(item => {
//                 const isProductExpired = isExpired(item.expiry_date);
//                 const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date);
//                 const isExpiryWarning = daysUntilExpiry < 10 && daysUntilExpiry > 0;

//                 // Calculate the discounted price
//                 const discountedPrice = item.price - (item.discount || 0);
//                 const itemTotal = discountedPrice * item.quantity;

//                 const cartItemElement = document.createElement('div');
//                 cartItemElement.className = 'cart-item';
//                 cartItemElement.innerHTML = `
//                 <img src="${item.image}" alt="${item.title}" class="cart-item-image">
//                 <div class="cart-item-details">
//                     <div class="cart-item-title">${item.title}</div>
//                     <div class="cart-item-meta">
//                         <div style="color: #72A07E;" class="cart-item-price">
//                             ${formatCurrency(item.price)}
//                             ${item.discount > 0 ? `<span class="discounted-price"> → ${formatCurrency(discountedPrice)}</span>` : ''}
//                         </div>
//                         <div class="cart-item-expiry ${isExpiryWarning ? 'expiry-warning' : ''}">
//                             ${isProductExpired ? 'بەسەرچووە' : isExpiryWarning ? `بەسەرئەچێت لەماوەیڕ${daysUntilExpiry}  ڕۆژی تر` : `بەرواری بەسەرچوون ${new Date(item.expiry_date).toLocaleDateString()}`}
//                         </div>
//                     </div>
//                     <div class="cart-item-controls">
//                         <div class="cart-item-quantity">
//                             <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
//                             <span class="quantity-value">${item.quantity}</span>
//                             <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
//                         </div>
//                         <div class="cart-item-discount">
//                             <label>Discount/Item:</label>
//                             <input type="number" class="item-discount-input" data-id="${item.id}" value="${item.discount || 0}" min="0" max="${item.price}">
//                         </div>
//                         <div class="cart-item-total">
//                             Total: ${formatCurrency(itemTotal)}
//                         </div>
//                         <button class="remove-item" data-id="${item.id}">
//                             <i class="fas fa-trash-alt"></i>
//                         </button>
//                     </div>
//                 </div>
//             `;

//                 cartItems.appendChild(cartItemElement);
//             });

//             // Add event listeners to cart item buttons
//             document.querySelectorAll('.decrease-quantity').forEach(button => {
//                 button.addEventListener('click', event => {
//                     const id = event.currentTarget.getAttribute('data-id');
//                     updateQuantity(id, -1);
//                 });
//             });

//             document.querySelectorAll('.increase-quantity').forEach(button => {
//                 button.addEventListener('click', event => {
//                     const id = event.currentTarget.getAttribute('data-id');
//                     updateQuantity(id, 1);
//                 });
//             });

//             document.querySelectorAll('.item-discount-input').forEach(input => {
//                 input.addEventListener('change', event => {
//                     const id = event.currentTarget.getAttribute('data-id');
//                     const discountValue = event.currentTarget.value;
//                     updateItemDiscount(id, discountValue);
//                 });
//             });

//             document.querySelectorAll('.remove-item').forEach(button => {
//                 button.addEventListener('click', event => {
//                     const id = event.currentTarget.getAttribute('data-id');
//                     removeFromCart(id);
//                 });
//             });
//         }

//         // Update cart summary - calculate total with per-item discounts
//         const total = cart.reduce((sum, item) => {
//             const discountedPrice = item.price - (item.discount || 0);
//             return sum + (discountedPrice * item.quantity);
//         }, 0);

//         const customerPayment = parseFloat(customerPaymentInput.value) || 0;
//         const changeDue = customerPayment - total;

//         cartTotal.textContent = formatCurrency(total);
//         changeDueElement.textContent = formatCurrency(changeDue >= 0 ? changeDue : 0);
//     }

//     function openCart() {
//         cartContainer.classList.add('active');
//         cartOverlay.style.display = 'block';
//         document.body.style.overflow = 'hidden';
//     }

//     function closeCart() {
//         cartContainer.classList.remove('active');
//         cartOverlay.style.display = 'none';
//         document.body.style.overflow = 'auto';
//     }

//     // ---------- Checkout ----------
//     function checkout() {
//         if (cart.length === 0) {
//             showToast('', 'سەبەتەکەت بەتاڵە');
//             return;
//         }

//         // Calculate total with per-item discounts
//         const total = cart.reduce((sum, item) => {
//             const discountedPrice = item.price - (item.discount || 0);
//             return sum + (discountedPrice * item.quantity);
//         }, 0);

//         const customerPayment = parseFloat(customerPaymentInput.value) || 0;

//         if (customerPayment < total) {
//             showToast('', 'بڕی بازاڕکردن زیاترە لە بڕی پارەدان تکایە چاکی بکە');
//             return;
//         }

//         // Prepare data for API call
//         const checkoutData = {
//             items: cart,
//             totalAmount: total,
//             customerPayment: customerPayment
//         };

//         // Make the API call to process the order
//         showToast('success', 'Processing Order', 'Please wait while we process your order...');

//         fetch('/api/checkout', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(checkoutData)
//         })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     cart = [];
//                     updateCart();
//                     closeCart();
//                     showToast('success', 'Order Placed', `Thank you for your purchase! Change due: ${formatCurrency(data.changeDue)}`);
//                     location.reload();
//                 } else {
//                     showToast('error', 'Checkout Error', data.message);
//                 }
//             })
//             .catch(error => {
//                 console.error('Error during checkout:', error);
//                 showToast('error', 'Checkout Error', 'Failed to process your order. Please try again.');
//             });
//     }

//     // ---------- Event Listeners ----------
//     cartIcon.addEventListener('click', openCart);
//     closeCartBtn.addEventListener('click', closeCart);
//     cartOverlay.addEventListener('click', closeCart);
//     checkoutBtn.addEventListener('click', checkout);
//     applyFiltersBtn.addEventListener('click', applyFilters);
//     resetFiltersBtn.addEventListener('click', resetFilters);
//     customerPaymentInput.addEventListener('input', updateCart);
//     searchFilter.addEventListener('keyup', event => {
//         if (event.key === 'Enter') {
//             applyFilters();
//         }
//     });

//     // Initialize
//     fetchProducts();
//     updateCart();
// });

document.addEventListener('DOMContentLoaded', function () {
    // ---------- Initialize State ----------
    let cart = [];
    let currentFilters = {
        category: "all",
        priceRange: "all",
        availability: "all",
        sort: "default",
        search: ""
    };

    // ---------- DOM Elements ----------
    const productsContainer = document.getElementById('products-container');
    const cartContainer = document.getElementById('cart-container');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartIcon = document.getElementById('cart-icon');
    const closeCartBtn = document.getElementById('close-cart');
    const cartBadge = document.getElementById('cart-badge');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const toastContainer = document.getElementById('toast-container');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const availabilityFilter = document.getElementById('availability-filter');
    const sortFilter = document.getElementById('sort-filter');
    const searchFilter = document.getElementById('search-filter');
    const globalDiscountInput = document.getElementById('global-discount');
    const customerPaymentInput = document.getElementById('customer-payment');
    const changeDueElement = document.getElementById('change-due');

    // ---------- Helper Functions ----------
    function formatCurrency(amount) {
        return 'IQD' + parseFloat(amount).toFixed(2);
    }

    function getStockStatus(product) {
        if (product.stock <= 0) return 'نەماوە';
        if (product.stock < 10) return 'کەم ماوە';
        return 'بەردەستە';
    }

    function getStockLabel(product) {
        if (product.stock <= 0) return 'نەماوە';
        if (product.stock < 10) return 'کەم ماوە';
        return 'بەردەستە';
    }

    function isExpired(expiryDate) {
        return new Date(expiryDate) < new Date();
    }

    function getDaysUntilExpiry(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // ---------- Toast Notifications ----------
    function showToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="close-toast">&times;</button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                // Fix: Check if toast is still a child of toastContainer
                if (toast.parentNode === toastContainer) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 3000);

        // Close button listener
        toast.querySelector('.close-toast').addEventListener('click', () => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                // Fix: Check if toast is still a child of toastContainer
                if (toast.parentNode === toastContainer) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        });
    }

    // ---------- Fetch and Render Products ----------
    function fetchProducts() {
        // Convert price range to min-max
        let priceMin, priceMax;
        if (currentFilters.priceRange !== 'all') {
            const priceRange = currentFilters.priceRange.split('-');
            priceMin = priceRange[0];
            priceMax = priceRange[1];
        }

        // Build query string
        const queryParams = new URLSearchParams({
            category: currentFilters.category,
            priceMin: priceMin || '',
            priceMax: priceMax || '',
            availability: currentFilters.availability,
            sort: currentFilters.sort,
            search: currentFilters.search
        });

        fetch(`/api/products?${queryParams.toString()}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderProducts(data.products);
                } else {
                    showToast('error', 'Error', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                showToast('error', 'Error', 'Failed to fetch products. Please try again.');
            });
    }

    function renderProducts(products) {
        productsContainer.innerHTML = '';

        if (products.length === 0) {
            productsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>هیچ بەرهەمێک نەدۆزرایەوە</h3>
                    <p>هەوڵبە بۆ ڕێکخستنی پێوەرەکانی گەڕانت یان فلتەرەکانت</p>
                     <button class="filter-button" id="clear-all-filters">سڕینەوەی هەموو فلتەرەکان</button>
                </div>
            `;

            document.getElementById('clear-all-filters').addEventListener('click', () => {
                resetFilters();
            });

            return;
        }

        products.forEach(product => {
            const stockStatus = getStockStatus(product);
            const stockLabel = getStockLabel(product);
            const isProductExpired = isExpired(product.expiry_date);
            const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
            const isExpiryWarning = daysUntilExpiry < 10 && daysUntilExpiry > 0;

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
    <div class="product-image-container">
        ${product.isNew ? `<span class="product-badge new">نوێ</span>` : ''}
        ${stockStatus === 'low-stock' ? `<span class="product-badge low-stock">کەم ماوە</span>` : ''}
        ${isProductExpired ? `<span class="product-badge expired">بەسەرچووە</span>` : ''}
        <img src="${product.image}" alt="${product.title}" class="product-image">
    </div>
    <div class="product-content">
        <div class="product-category">${product.category_name}</div>
        <h3 class="product-title">${product.title}</h3>
        <div class="product-meta">
            <div style="color: #72A07E;" class="product-price">${formatCurrency(product.price)}</div>
            <div class="product-stock ${stockStatus}">${stockLabel}</div>
        </div>
        <div class="product-description">${product.description}</div>
        <div class="product-footer">
            <div class="product-expiry ${isExpiryWarning ? 'expiry-warning' : ''}">
                ${isProductExpired ? 'بەسەرچووە' : isExpiryWarning ? `بەسەرئەچێت لەماوەیڕ${daysUntilExpiry}  ڕۆژی تر` : `بەرواری بەسەرچوون ${new Date(product.expiry_date).toLocaleDateString()}`}
            </div>
            <button style="background-color: #72A07E;" class="add-to-cart-btn" data-id="${product.id}" ${stockStatus === 'نەماوە' || isProductExpired ? 'disabled' : ''}>
                <i class="fas fa-shopping-cart"></i> زیادکردن
            </button>
        </div>
    </div>
`;

            productsContainer.appendChild(productCard);
        });

        // Add event listeners to 'Add to Cart' buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }

    // ---------- Filter Products ----------
    function applyFilters() {
        // Update the currentFilters object with the current values
        currentFilters = {
            category: categoryFilter.value,
            priceRange: priceFilter.value,
            availability: availabilityFilter.value,
            sort: sortFilter.value,
            search: searchFilter.value
        };

        fetchProducts();
    }

    function resetFilters() {
        categoryFilter.value = 'all';
        priceFilter.value = 'all';
        availabilityFilter.value = 'all';
        sortFilter.value = 'default';
        searchFilter.value = '';

        currentFilters = {
            category: 'all',
            priceRange: 'all',
            availability: 'all',
            sort: 'default',
            search: ''
        };

        fetchProducts();
    }

    // ---------- Cart Management ----------
    function addToCart(event) {
        const productId = event.currentTarget.getAttribute('data-id');

        fetch(`/api/products/${productId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const product = data.product;

                    // Check if product is already in cart
                    const existingItem = cart.find(item => String(item.id) === String(product.id));

                    if (existingItem) {
                        // Check if there's enough stock
                        if (existingItem.quantity >= product.stock) {
                            showToast('warning', 'Stock Limit Reached', `ببورە ${product.stock} دانە بەردەستە `);
                            return;
                        }

                        existingItem.quantity += 1;
                        showToast('success', 'Item Updated', `دووبارە زیادکرا بۆ ناو سەبەتەکەت ${product.title}`);
                    } else {
                        cart.push({
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            image: product.image,
                            expiry_date: product.expiry_date,
                            quantity: 1
                        });
                        showToast('success', 'Item Added', `زیادکرا بۆ ناو سەبەتەکەت ${product.title}`);
                    }

                    updateCart();
                } else {
                    showToast('error', 'Error', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching product:', error);
                showToast('error', 'Error', 'Failed to add product to cart. Please try again.');
            });
    }

    function removeFromCart(productId) {
        // Fix: Convert both to the same type (strings) for comparison
        cart = cart.filter(item => String(item.id) !== String(productId));
        updateCart();
        showToast('warning', 'Item Removed', 'Item has been removed from your cart.');
    }

    function updateQuantity(productId, change) {
        // Fix: Convert to string for consistent comparison
        const cartItem = cart.find(item => String(item.id) === String(productId));

        fetch(`/api/products/${productId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const product = data.product;

                    if (!cartItem) return;

                    const newQuantity = cartItem.quantity + change;

                    if (newQuantity <= 0) {
                        removeFromCart(productId);
                        return;
                    }

                    if (newQuantity > product.stock) {
                        showToast('warning', 'Stock Limit Reached', `ببورە ${product.stock} دانە بەردەستە `);
                        return;
                    }

                    cartItem.quantity = newQuantity;
                    updateCart();
                } else {
                    showToast('error', 'Error', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching product:', error);
                showToast('error', 'Error', 'Failed to update cart. Please try again.');
            });
    }

    function updateCart() {
        // Update cart badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;

        // Update cart items
        cartItems.innerHTML = '';

        if (cart.length === 0) {
            cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>سەبەتەکەت بەتاڵە</p>
                <button style="background-color: #72A07E;" class="continue-shopping" id="continue-shopping">بەردەوامبوون لە بازاڕکردن</button>
            </div>
        `;

            document.getElementById('continue-shopping').addEventListener('click', () => {
                closeCart();
            });
        } else {
            cart.forEach(item => {
                const isProductExpired = isExpired(item.expiry_date);
                const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date);
                const isExpiryWarning = daysUntilExpiry < 10 && daysUntilExpiry > 0;

                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-meta">
                        <div style="color: #72A07E;" class="cart-item-price">${formatCurrency(item.price)}</div>
                        <div class="cart-item-expiry ${isExpiryWarning ? 'expiry-warning' : ''}">
                            ${isProductExpired ? 'بەسەرچووە' : isExpiryWarning ? `بەسەرئەچێت لەماوەیڕ${daysUntilExpiry}  ڕۆژی تر` : `بەرواری بەسەرچوون ${new Date(item.expiry_date).toLocaleDateString()}`}
                        </div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;

                cartItems.appendChild(cartItemElement);
            });

            // Add event listeners to cart item buttons
            document.querySelectorAll('.decrease-quantity').forEach(button => {
                button.addEventListener('click', event => {
                    const id = event.currentTarget.getAttribute('data-id');
                    updateQuantity(id, -1);
                });
            });

            document.querySelectorAll('.increase-quantity').forEach(button => {
                button.addEventListener('click', event => {
                    const id = event.currentTarget.getAttribute('data-id');
                    updateQuantity(id, 1);
                });
            });

            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', event => {
                    const id = event.currentTarget.getAttribute('data-id');
                    removeFromCart(id);
                });
            });
        }

        // Update cart summary
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = parseFloat(globalDiscountInput.value) || 0;
        const total = subtotal - discount; // Changed from percentage to flat amount
        const customerPayment = parseFloat(customerPaymentInput.value) || 0;
        const changeDue = customerPayment - total;

        cartTotal.textContent = formatCurrency(total);
        changeDueElement.textContent = formatCurrency(changeDue >= 0 ? changeDue : 0);
    }

    function openCart() {
        cartContainer.classList.add('active');
        cartOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartContainer.classList.remove('active');
        cartOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // ---------- Checkout ----------
    function checkout() {
        if (cart.length === 0) {
            showToast('', 'سەبەتەکەت بەتاڵە');
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = parseFloat(globalDiscountInput.value) || 0;
        const total = subtotal - discount; // Changed from percentage to flat amount
        const customerPayment = parseFloat(customerPaymentInput.value) || 0;

        if (customerPayment < total) {
            showToast('', 'بڕی بازاڕکردن زیاترە لە بڕی پارەدان تکایە چاکی بکە');
            return;
        }

        // Prepare data for API call
        const checkoutData = {
            items: cart,
            totalAmount: total,
            customerPayment: customerPayment,
            discount: discount // Now this is the flat amount
        };

        // Make the API call to process the order
        showToast('success', 'Processing Order', 'Please wait while we process your order...');

        fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(checkoutData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cart = [];
                    updateCart();
                    closeCart();
                    showToast('success', 'Order Placed', `Thank you for your purchase! Change due: ${formatCurrency(data.changeDue)}`);
                    location.reload();
                } else {
                    showToast('error', 'Checkout Error', data.message);
                }
            })
            .catch(error => {
                console.error('Error during checkout:', error);
                showToast('error', 'Checkout Error', 'Failed to process your order. Please try again.');
            });
    }

    // ---------- Event Listeners ----------
    cartIcon.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', checkout);
    applyFiltersBtn.addEventListener('click', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    globalDiscountInput.addEventListener('input', updateCart);
    customerPaymentInput.addEventListener('input', updateCart);
    searchFilter.addEventListener('keyup', event => {
        if (event.key === 'Enter') {
            applyFilters();
        }
    });

    // Initialize
    fetchProducts();
    updateCart();
});
