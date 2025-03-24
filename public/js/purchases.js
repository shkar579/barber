document.addEventListener('DOMContentLoaded', () => {
    // Safe element selection
    const addPurchaseDetailBtn = document.getElementById('addPurchaseDetailBtn');
    const addEditPurchaseDetailBtn = document.getElementById('addEditPurchaseDetailBtn');
    const purchaseDetailsContainer = document.getElementById('purchaseDetailsContainer');
    const editPurchaseDetailsContainer = document.getElementById('editPurchaseDetailsContainer');
    const savePurchaseBtn = document.getElementById('savePurchaseBtn');
    const updatePurchaseBtn = document.getElementById('updatePurchaseBtn');
    const addPurchaseForm = document.getElementById('addPurchaseForm');
    const editPurchaseForm = document.getElementById('editPurchaseForm');
    const purchasesTableBody = document.getElementById('purchasesTableBody');

    // Safe Modal Initialization
    let editPurchaseModal = null;
    const editPurchaseModalElement = document.getElementById('editPurchaseModal');
    if (editPurchaseModalElement) {
        editPurchaseModal = new bootstrap.Modal(editPurchaseModalElement, {
            keyboard: true,
            backdrop: true
        });
    }

    let detailIndex = 1;
    let editDetailIndex = 1;

    // Safety check for add purchase detail button
    if (addPurchaseDetailBtn) {
        addPurchaseDetailBtn.addEventListener('click', () => {
            const newDetailRow = document.createElement('div');
            newDetailRow.classList.add('purchase-detail', 'row', 'mb-3');
            newDetailRow.innerHTML = `
                <div class="col-md-4">
                    <label>Product</label>
                    <select class="form-control product-select" name="details[${detailIndex}][product_id]">
                        ${Array.from(document.querySelectorAll('.product-select')[0].options)
                    .map(option => `<option value="${option.value}">${option.text}</option>`)
                    .join('')}
                    </select>
                </div>
                <div class="col-md-2">
                    <label>Quantity</label>
                    <input type="number" class="form-control" name="details[${detailIndex}][quantity]" required>
                </div>
                <div class="col-md-2">
                    <label>Cost</label>
                    <input type="number" class="form-control" name="details[${detailIndex}][cost]" required>
                </div>
                <div class="col-md-2">
                    <label>Discount</label>
                    <input type="number" class="form-control" name="details[${detailIndex}][discount]" value="0">
                </div>
                <div class="col-md-2">
                    <label>Expiry Date</label>
                    <input type="date" class="form-control" name="details[${detailIndex}][expiry_date]">
                </div>
                <div class="col-md-1">
                    <label>&nbsp;</label>
                    <button type="button" class="btn btn-danger remove-detail-btn">Remove</button>
                </div>
            `;

            newDetailRow.querySelector('.remove-detail-btn').addEventListener('click', (e) => {
                e.target.closest('.purchase-detail').remove();
            });

            purchaseDetailsContainer.appendChild(newDetailRow);
            detailIndex++;
        });
    }

    // Safety check for add edit purchase detail button
    if (addEditPurchaseDetailBtn) {
        addEditPurchaseDetailBtn.addEventListener('click', () => {
            const newDetailRow = document.createElement('div');
            newDetailRow.classList.add('purchase-detail', 'row', 'mb-3');
            newDetailRow.innerHTML = `
                <div class="col-md-4">
                    <label>Product</label>
                    <select class="form-control product-select" name="details[${editDetailIndex}][product_id]">
                        ${Array.from(document.querySelectorAll('.product-select')[0].options)
                    .map(option => `<option value="${option.value}">${option.text}</option>`)
                    .join('')}
                    </select>
                </div>
                <div class="col-md-2">
                    <label>Quantity</label>
                    <input type="number" class="form-control" name="details[${editDetailIndex}][quantity]" required>
                </div>
                <div class="col-md-2">
                    <label>Cost</label>
                    <input type="number" class="form-control" name="details[${editDetailIndex}][cost]" required>
                </div>
                <div class="col-md-2">
                    <label>Discount</label>
                    <input type="number" class="form-control" name="details[${editDetailIndex}][discount]" value="0">
                </div>
                <div class="col-md-2">
                    <label>Expiry Date</label>
                    <input type="date" class="form-control" name="details[${editDetailIndex}][expiry_date]">
                </div>
                <div class="col-md-1">
                    <label>&nbsp;</label>
                    <button type="button" class="btn btn-danger remove-detail-btn">Remove</button>
                </div>
            `;

            newDetailRow.querySelector('.remove-detail-btn').addEventListener('click', (e) => {
                e.target.closest('.purchase-detail').remove();
            });

            editPurchaseDetailsContainer.appendChild(newDetailRow);
            editDetailIndex++;
        });
    }

    // Safety checks for event listeners
    if (purchasesTableBody) {
        purchasesTableBody.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('.delete-purchase');
            const editBtn = e.target.closest('.edit-purchase');

            if (deleteBtn) {
                const purchaseRow = deleteBtn.closest('tr');
                const purchaseId = purchaseRow.dataset.id;

                if (confirm('Are you sure you want to delete this purchase?')) {
                    try {
                        const response = await fetch(`/purchases/${purchaseId}`, {
                            method: 'DELETE'
                        });

                        const result = await response.json();

                        if (response.ok) {
                            purchaseRow.remove();
                            alert('Purchase deleted successfully');
                        } else {
                            throw new Error(result.error || 'Failed to delete purchase');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert(error.message);
                    }
                }
            }

            if (editBtn) {
                const purchaseRow = editBtn.closest('tr');
                const purchaseId = purchaseRow.dataset.id;

                try {
                    const response = await fetch(`/purchases/${purchaseId}`);
                    const purchaseDetails = await response.json();

                    // Check if modal exists before populating
                    if (editPurchaseForm && editPurchaseModal) {
                        document.getElementById('editPurchaseId').value = purchaseId;
                        editPurchaseForm.querySelector('[name="total_amount"]').value = purchaseDetails[0].total_amount;
                        editPurchaseForm.querySelector('[name="payment_method"]').value = purchaseDetails[0].payment_method;
                        editPurchaseForm.querySelector('[name="status"]').value = purchaseDetails[0].status;
                        editPurchaseForm.querySelector('[name="notes"]').value = purchaseDetails[0].notes;

                        // Clear existing details
                        editPurchaseDetailsContainer.innerHTML = '';
                        editDetailIndex = 0;

                        // Populate purchase details logic remains the same
                        purchaseDetails.forEach((detail, index) => {
                            const newDetailRow = document.createElement('div');
                            newDetailRow.classList.add('purchase-detail', 'row', 'mb-3');
                            newDetailRow.innerHTML = `
                                <div class="col-md-4">
                                    <label>Product</label>
                                    <select class="form-control product-select" name="details[${index}][product_id]">
                                        ${Array.from(document.querySelectorAll('.product-select')[0].options)
                                    .map(option => `<option value="${option.value}" ${option.value == detail.product_id ? 'selected' : ''}>${option.text}</option>`)
                                    .join('')}
                                    </select>
                                </div>
                                <!-- Rest of the detail row remains the same -->
                            `;

                            editPurchaseDetailsContainer.appendChild(newDetailRow);
                            editDetailIndex = index + 1;
                        });

                        // Show the edit modal
                        editPurchaseModal.show();
                    }
                } catch (error) {
                    console.error('Error fetching purchase details:', error);
                    alert('Failed to fetch purchase details');
                }
            }
        });
    }

    // Save Purchase functionality
    if (savePurchaseBtn) {
        savePurchaseBtn.addEventListener('click', async () => {
            const formData = new FormData(addPurchaseForm);
            const purchaseData = {
                total_amount: formData.get('total_amount'),
                payment_method: formData.get('payment_method'),
                status: formData.get('status'),
                notes: formData.get('notes'),
                details: []
            };

            // Collect purchase details
            document.querySelectorAll('.purchase-detail').forEach((detailRow, index) => {
                const detail = {
                    product_id: detailRow.querySelector(`[name="details[${index}][product_id]"]`).value,
                    quantity: detailRow.querySelector(`[name="details[${index}][quantity]"]`).value,
                    cost: detailRow.querySelector(`[name="details[${index}][cost]"]`).value,
                    discount: detailRow.querySelector(`[name="details[${index}][discount]"]`).value,
                    expiry_date: detailRow.querySelector(`[name="details[${index}][expiry_date]"]`).value
                };
                purchaseData.details.push(detail);
            });

            try {
                const response = await fetch('/purchases', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(purchaseData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Purchase created successfully');
                    location.reload(); // Reload to see the new purchase
                } else {
                    throw new Error(result.error || 'Failed to create purchase');
                }
            } catch (error) {
                console.error('Error:', error);
                alert(error.message);
            }
        });
    }

    // Update Purchase functionality
    if (updatePurchaseBtn) {
        updatePurchaseBtn.addEventListener('click', async () => {
            const formData = new FormData(editPurchaseForm);
            const purchaseData = {
                purchase_id: formData.get('purchase_id'),
                total_amount: formData.get('total_amount'),
                payment_method: formData.get('payment_method'),
                status: formData.get('status'),
                notes: formData.get('notes'),
                details: []
            };

            // Collect purchase details
            document.querySelectorAll('#editPurchaseDetailsContainer .purchase-detail').forEach((detailRow, index) => {
                const detail = {
                    product_id: detailRow.querySelector(`[name="details[${index}][product_id]"]`).value,
                    quantity: detailRow.querySelector(`[name="details[${index}][quantity]"]`).value,
                    cost: detailRow.querySelector(`[name="details[${index}][cost]"]`).value,
                    discount: detailRow.querySelector(`[name="details[${index}][discount]"]`).value,
                    expiry_date: detailRow.querySelector(`[name="details[${index}][expiry_date]"]`).value
                };
                purchaseData.details.push(detail);
            });

            try {
                const response = await fetch(`/purchases/${purchaseData.purchase_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(purchaseData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Purchase updated successfully');
                    location.reload(); // Reload to see the updated purchase
                } else {
                    throw new Error(result.error || 'Failed to update purchase');
                }
            } catch (error) {
                console.error('Error:', error);
                alert(error.message);
            }
        });
    }
});