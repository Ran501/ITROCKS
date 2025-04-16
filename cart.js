document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart if it doesn't exist in localStorage
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    // Update cart summary on page load
    updateCartSummary();

    // Add click event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.card');
            const title = card.querySelector('.card-title').textContent;
            const price = parseFloat(this.getAttribute('data-price'));
            const imageSrc = card.querySelector('img').src;
            
            addItemToCart(title, price, imageSrc);
        });
    });
});

// Function to add an item to the cart
function addItemToCart(title, price, imageSrc) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.title === title);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            title: title,
            price: price,
            image: imageSrc,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();
    
    // Show confirmation message
    showToast(`${title} added to cart!`);
}

// Function to update the cart summary display
function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    let totalItems = 0;
    
    cart.forEach(item => {
        totalItems += item.quantity;
    });
    
    // Update the cart icon notification
    const cartIcon = document.getElementById('cart_icon');
    if (totalItems > 0) {
        // Create or update the notification badge
        let badge = cartIcon.querySelector('.cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            cartIcon.appendChild(badge);
        }
        badge.textContent = totalItems;
    } else {
        // Remove the notification badge if cart is empty
        const badge = cartIcon.querySelector('.cart-badge');
        if (badge) {
            badge.remove();
        }
    }
}

// Function to show the cart items list
function showitemlist() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    // Create modal for cart items
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Your Cart</h2>
            <div class="cart-items-container"></div>
            <div class="cart-total">
                <p>Total Items: <span id="modal-total-items">0</span></p>
                <p>Total Price: Nu.<span id="modal-total-price">0</span></p>
                <button class="checkout-btn" onclick="proceedToCheckout()">Proceed to Checkout</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const itemsContainer = modal.querySelector('.cart-items-container');
    let totalItems = 0;
    let totalPrice = 0;
    
    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="item-details">
                <h3>${item.title}</h3>
                <p>Nu.${item.price.toFixed(2)} x ${item.quantity}</p>
                <p>Subtotal: Nu.${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div class="item-actions">
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
                <button onclick="removeItem(${index})">Remove</button>
            </div>
        `;
        itemsContainer.appendChild(itemElement);
        
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
    });
    
    document.getElementById('modal-total-items').textContent = totalItems;
    document.getElementById('modal-total-price').textContent = totalPrice.toFixed(2);
    
    // Add styles for the modal
    const style = document.createElement('style');
    style.textContent = `
        .cart-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .close-modal {
            float: right;
            font-size: 24px;
            cursor: pointer;
        }
        
        .cart-items-container {
            margin: 20px 0;
        }
        
        .cart-item {
            display: flex;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        
        .cart-item img {
            width: 80px;
            height: 80px;
            object-fit: contain;
            margin-right: 15px;
        }
        
        .item-details {
            flex: 1;
        }
        
        .item-actions {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .item-actions button {
            margin: 2px;
            padding: 2px 8px;
            cursor: pointer;
        }
        
        .cart-total {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
        }
        
        .checkout-btn {
            background-color: #e31b23;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
        }
        
        .checkout-btn:hover {
            background-color: #c41219;
        }
        
        /* Cart badge styles */
        .cart-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: red;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #cart_icon {
            position: relative;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
}

// Function to change item quantity
function changeQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();
    
    // Refresh the cart modal
    const modal = document.querySelector('.cart-modal');
    if (modal) {
        modal.remove();
        showitemlist();
    }
}

// Function to remove an item from cart
function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary();
    
    // Refresh the cart modal
    const modal = document.querySelector('.cart-modal');
    if (modal) {
        if (cart.length === 0) {
            modal.remove();
            showToast('Your cart is now empty!');
        } else {
            modal.remove();
            showitemlist();
        }
    }
}

// Function to proceed to checkout
function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }

    // Show confirmation message
    showToast('Finished checking out! Thank you for your purchase.');
    
    // Clear the cart
    localStorage.setItem('cart', JSON.stringify([]));
    
    // Update cart UI (removes red badge)
    updateCartSummary();
    
    // Close the modal
    const modal = document.querySelector('.cart-modal');
    if (modal) {
        modal.remove();
    }
}

// Function to show toast messages
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Add styles for the toast
    const style = document.createElement('style');
    style.textContent = `
        .toast-message {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        }
        
        @keyframes fadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove the toast after animation
    setTimeout(() => {
        toast.remove();
        style.remove();
    }, 3000);
}