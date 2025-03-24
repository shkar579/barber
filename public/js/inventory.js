document.addEventListener('DOMContentLoaded', () => {
    const editButtons = document.querySelectorAll('.edit-btn');
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));

    // Edit Modal Population
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const inventoryId = button.getAttribute('data-id');
            const productId = button.getAttribute('data-product');
            const quantity = button.getAttribute('data-quantity');
            const location = button.getAttribute('data-location');

            document.getElementById('editInventoryId').value = inventoryId;
            document.getElementById('editProductId').value = productId;
            document.getElementById('editQuantity').value = quantity;
            document.getElementById('editLocation').value = location || '';

            editModal.show();
        });
    });

    // Optional: Form Validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (event) => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    editButtons.forEach(button => {
        button.addEventListener('click', function () {
            document.getElementById('editInventoryId').value = this.dataset.id;
            document.getElementById('editProductId').value = this.dataset.product;
            document.getElementById('editQuantity').value = this.dataset.quantity;
            document.getElementById('editLocation').value = this.dataset.location || '';
            editModal.show();
        });
    });

    // New search functionality
    const searchInput = document.getElementById('productSearchInput');
    const inventoryTable = document.getElementById('inventoryTable');
    const tableRows = inventoryTable.querySelectorAll('tbody tr');

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase().trim();

        tableRows.forEach(row => {
            const productName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();

            if (productName.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});