document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const productsContainer = document.getElementById('products-container');
    const cartIcon = document.getElementById('cart-icon');
    const cartBadge = document.getElementById('cart-badge');
    const cartContainer = document.getElementById('cart-container');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const globalDiscountInput = document.getElementById('global-discount');
    const customerPaymentInput = document.getElementById('customer-payment');
    const changeDueElement = document.getElementById('change-due');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const availabilityFilter = document.getElementById('availability-filter');
    const sortFilter = document.getElementById('sort-filter');
    const searchFilter = document.getElementById('search-filter');

    // Cart State
    let cart = [];

    // Helper Functions
    function formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }

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

        document.getElementById('toast-container').appendChild(toast);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);

        // Close button listener
        toast.querySelector('.close-toast').addEventListener('click', () => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        });
    }

    // Add to Cart
    function addToCart(event) {
        const productId = event.currentTarget.getAttribute('data-id');

        fetch(`/add-to-cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        })
            .then(response => response.text())
            .then(message => {
                showToast('success', 'Added to Cart', message);
                updateCart();
            })
            .catch(error => {
                showToast('error', 'Error', 'Failed to add product to cart.');
                console.error(error);
            });
    }

    // Update Cart
    function updateCart() {
        fetch('/get-cart')
            .then(response => response.json())
            .then(data => {
                cart = data;
                renderCart();
            })
            .catch(error => {
                console.error('Error fetching cart:', error);
            });
    }

    // Render Cart
    function renderCart() {
        cartItems.innerHTML = '';

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <button class="continue-shopping" id="continue-shopping">Continue Shopping</button>
                </div>
            `;

            document.getElementById('continue-shopping').addEventListener('click', closeCart);
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-meta">
                            <div class="cart-item-price">${formatCurrency(item.price)}</div>
                            <div class="cart-item-expiry">Valid until ${new Date(item.expiry_date).toLocaleDateString()}</div>
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

                cartItems.appendChild(cartItem);
            });

            // Add event listeners to quantity buttons
            document.querySelectorAll('.decrease-quantity').forEach(button => {
                button.addEventListener('click', event => {
                    const productId = event.currentTarget.getAttribute('data-id');
                    updateQuantity(productId, -1);
                });
            });

            document.querySelectorAll('.increase-quantity').forEach(button => {
                button.addEventListener('click', event => {
                    const productId = event.currentTarget.getAttribute('data-id');
                    updateQuantity(productId, 1);
                });
            });

            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', event => {
                    const productId = event.currentTarget.getAttribute('data-id');
                    removeFromCart(productId);
                });
            });
        }

        // Update cart total
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discount = parseFloat(globalDiscountInput.value) || 0;
        const total = subtotal - subtotal * (discount / 100);
        const customerPayment = parseFloat(customerPaymentInput.value) || 0;
        const changeDue = customerPayment - total;

        cartTotal.textContent = formatCurrency(total);
        changeDueElement.textContent = formatCurrency(changeDue >= 0 ? changeDue : 0);
    }

    // Update Quantity
    function updateQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (!item) return;

        const newQuantity = item.quantity + change;

        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        fetch(`/update-cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, quantity: newQuantity }),
        })
            .then(response => response.text())
            .then(message => {
                showToast('success', 'Cart Updated', message);
                updateCart();
            })
            .catch(error => {
                showToast('error', 'Error', 'Failed to update cart.');
                console.error(error);
            });
    }

    // Remove from Cart
    function removeFromCart(productId) {
        fetch(`/remove-from-cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        })
            .then(response => response.text())
            .then(message => {
                showToast('warning', 'Item Removed', message);
                updateCart();
            })
            .catch(error => {
                showToast('error', 'Error', 'Failed to remove item from cart.');
                console.error(error);
            });
    }

    // Checkout
    function checkout() {
        if (cart.length === 0) {
            showToast('warning', 'Empty Cart', 'Your cart is empty. Add some items before checkout.');
            return;
        }

        const total = parseFloat(cartTotal.textContent.replace('$', ''));
        const customerPayment = parseFloat(customerPaymentInput.value) || 0;

        if (customerPayment < total) {
            showToast('warning', 'Insufficient Payment', 'The payment amount is less than the total. Please adjust the payment.');
            return;
        }

        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart, customerId: 1, paymentMethod: 'Cash', notes: 'Checkout completed' }),
        })
            .then(response => response.text())
            .then(message => {
                showToast('success', 'Checkout Successful', message);
                cart = [];
                updateCart();
                closeCart();
            })
            .catch(error => {
                showToast('error', 'Error', 'Failed to complete checkout.');
                console.error(error);
            });
    }

    // Open Cart
    function openCart() {
        cartContainer.classList.add('active');
        document.getElementById('cart-overlay').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Close Cart
    function closeCart() {
        cartContainer.classList.remove('active');
        document.getElementById('cart-overlay').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Event Listeners
    cartIcon.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', checkout);
    globalDiscountInput.addEventListener('input', updateCart);
    customerPaymentInput.addEventListener('input', updateCart);

    // Initialize
    updateCart();
});