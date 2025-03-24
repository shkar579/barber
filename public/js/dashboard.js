document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const checkboxes = document.querySelectorAll(".serviceCheckbox");
    const customerPayment = document.getElementById("customerPayment");
    const totalPriceElement = document.getElementById("totalPrice");
    const moneyReceivedElement = document.getElementById("moneyRceived");
    const barberIncomeElement = document.getElementById("barberIncome");
    const employerIncomeElement = document.getElementById("employerIncome");
    const form = document.getElementById("serviceForm");
    const barberSelect = document.getElementById("barber_name");
    const submitButton = document.getElementById("submitButton");
    const errorElement = document.getElementById("form-error");

    // Configuration
    const config = {
        barberShare: 0.55,  // 55% to barber
        employerShare: 0.45, // 45% to employer
        debounceDelay: 300,  // ms delay for debouncing input
        animationSpeed: 200  // ms for animations
    };

    // State
    const state = {
        totalPrice: parseFloat(totalPriceElement.textContent) || 0,
        payment: parseFloat(customerPayment.value) || 0,
        services: new Set(),
        isEditing: !!document.querySelector('input[name="id"]'),
        editId: document.querySelector('input[name="id"]')?.value || null,
        formHasChanges: false
    };

    // Initialize service selections based on checked boxes
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            state.services.add(checkbox.value);
        }
    });

    // Utility Functions
    function formatCurrency(value) {
        return parseFloat(value).toFixed(2);
    }

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function animateValueChange(element) {
        element.classList.add('highlight');
        setTimeout(() => element.classList.remove('highlight'), config.animationSpeed);
    }

    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }

    function toggleLoadingState(isLoading) {
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.textContent;
            submitButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> چاوەڕێبە...';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.dataset.originalText || 'زیادکردن';
        }
    }

    function showSuccessNotification(action) {
        // Create notification element if it doesn't exist
        let notificationEl = document.getElementById('success-notification');
        if (!notificationEl) {
            notificationEl = document.createElement('div');
            notificationEl.id = 'success-notification';
            notificationEl.className = 'notification success';
            document.body.appendChild(notificationEl);
        }

        notificationEl.textContent = `بەسەرکەوتووی ${action} کرا`;
        notificationEl.style.display = 'block';

        // Animate in
        setTimeout(() => {
            notificationEl.style.opacity = '1';
            notificationEl.style.transform = 'translateY(0)';
        }, 10);

        // Auto-hide after 1.5 seconds
        setTimeout(() => {
            notificationEl.style.opacity = '0';
            notificationEl.style.transform = 'translateY(-20px)';
        }, 1500);
    }

    // Calculate Functions
    function calculateTotalPrice() {
        let total = 0;
        state.services.clear();

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                total += parseFloat(checkbox.dataset.price);
                state.services.add(checkbox.value);
            }
        });

        state.totalPrice = total;
        totalPriceElement.textContent = formatCurrency(total);
        animateValueChange(totalPriceElement);

        // Update income calculations when total changes
        calculateTotals();

        state.formHasChanges = true;
    }

    function calculateTotals() {
        const { totalPrice, payment } = state;
        const { barberShare, employerShare } = config;

        // Calculate distributions based on payment amount
        let barberIncome, employerIncome;

        if (payment < totalPrice) {
            // Partial payment scenario
            barberIncome = payment * barberShare;
            employerIncome = totalPrice * employerShare;
        } else {
            // Full or excess payment scenario
            barberIncome = (totalPrice * barberShare) + (payment - totalPrice);
            employerIncome = totalPrice * employerShare;
        }

        // Update UI with calculated values
        moneyReceivedElement.textContent = formatCurrency(payment);
        barberIncomeElement.textContent = formatCurrency(barberIncome);
        employerIncomeElement.textContent = formatCurrency(employerIncome);

        // Highlight values that have changed
        animateValueChange(moneyReceivedElement);
        animateValueChange(barberIncomeElement);
        animateValueChange(employerIncomeElement);
    }

    function handlePaymentInput() {
        state.payment = parseFloat(customerPayment.value) || 0;
        calculateTotals();
        state.formHasChanges = true;
    }

    // Validation function
    function validateForm() {
        const barberId = barberSelect.value;
        const totalChecked = Array.from(checkboxes).filter(cb => cb.checked).length;

        if (!barberId) {
            showError('تکایە دەلاکێک هەڵبژێرە');
            return false;
        }

        if (totalChecked === 0) {
            showError('تکایە لانیکەم یەک خزمەتگوزاری هەڵبژێرە');
            return false;
        }

        if (state.payment <= 0) {
            showError('تکایە بڕی پارە داخڵ بکە');
            return false;
        }

        return true;
    }

    // Form submission handler
    async function handleSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Get selected service IDs
            const selectedServices = Array.from(state.services).map(id => parseInt(id));

            // Create the data payload object
            const data = {
                id: state.editId,
                barber_name: barberSelect.value,  // Changed from barber_id
                total_price: state.totalPrice,
                moneyRceived: parseFloat(moneyReceivedElement.textContent),  // Changed from money_received
                barberIncome: parseFloat(barberIncomeElement.textContent),  // Changed from barber_income
                employerIncome: parseFloat(employerIncomeElement.textContent),  // Changed from employer_income
                services: selectedServices,
                date: new Date().toISOString().split('T')[0]
            };

            console.log("Sending data:", data);

            // Show loading indicator
            toggleLoadingState(true);

            // Submit data to server
            const response = await fetch("/admin/addOrUpdateService", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Server error: ' + response.status);
            }

            // Try to parse JSON response
            try {
                const result = await response.json();
                console.log("Server response:", result);
            } catch (e) {
                console.log('Response was not JSON, continuing');
            }

            // Show success message
            showSuccessNotification(state.isEditing ? 'نوێکردنەوە' : 'زیادکردن');

            // Reset form or redirect
            setTimeout(() => {
                window.location.href = '/admin/services';
            }, 1000);

        } catch (error) {
            console.error("Error submitting form:", error);
            showError('کێشەیەک ڕوویدا، تکایە دووبارە هەوڵبدەوە');
            toggleLoadingState(false);
        }
    }

    // Event Listeners
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", calculateTotalPrice);
    });

    customerPayment.addEventListener("input", debounce(handlePaymentInput, config.debounceDelay));

    form.addEventListener("submit", handleSubmit);

    barberSelect.addEventListener("change", () => {
        state.formHasChanges = true;
    });

    // Setup beforeunload handler for unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (state.formHasChanges) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });

    // Initial calculations if we're in edit mode
    if (state.isEditing) {
        calculateTotalPrice();
    }
});