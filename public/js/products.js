document.addEventListener("DOMContentLoaded", () => {
    const rowsPerPage = 5;
    let currentPage = 1;

    // Elements
    const searchInput = document.getElementById("searchInput");
    const tableBody = document.querySelector("#dataTable tbody");
    const pageInfo = document.getElementById("pageInfo");
    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");
    const selectAllCheckbox = document.getElementById("selectAll");
    const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
    const exportBtn = document.getElementById("exportBtn");
    const addRowBtn = document.getElementById("addRowBtn");
    const rowFormModal = document.getElementById("rowFormModal");
    const viewProductModal = document.getElementById("viewProductModal");
    const modalTitle = document.getElementById("modalTitle");
    const rowForm = document.getElementById("rowForm");
    const productDetails = document.getElementById("productDetails");

    // Initialize table rows for pagination
    let tableRows = Array.from(tableBody.querySelectorAll("tr"));

    const updatePagination = () => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        tableRows.forEach((row, index) => {
            row.style.display = index >= start && index < end ? "" : "none";
        });

        pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(tableRows.length / rowsPerPage)}`;
    };

    // Pagination logic
    prevPage.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });

    nextPage.addEventListener("click", () => {
        if (currentPage < Math.ceil(tableRows.length / rowsPerPage)) {
            currentPage++;
            updatePagination();
        }
    });

    // Select/Deselect All
    selectAllCheckbox.addEventListener("change", () => {
        document.querySelectorAll(".selectRow").forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });

    // Delete Selected Rows
    deleteSelectedBtn.addEventListener("click", async () => {
        const selectedIds = Array.from(document.querySelectorAll(".selectRow:checked"))
            .map(checkbox => checkbox.dataset.id);

        if (selectedIds.length > 0) {
            const confirmation = confirm("دڵنیایت لەوەی ئەتەوێت بیسڕیەوە?");
            if (confirmation) {
                try {
                    const response = await fetch("/admin/deleteProducts", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ ids: selectedIds }),
                    });

                    if (response.ok) {
                        location.reload(); // Reload the table after deletion
                    } else {
                        alert("Failed to delete products.");
                    }
                } catch (error) {
                    console.error("Error deleting products:", error);
                    alert("An error occurred while deleting products.");
                }
            }
        } else {
            alert("Please select products to delete.");
        }
    });

    // Export to Excel
    exportBtn.addEventListener("click", () => {
        window.location.href = "/admin/exportProducts"; // Trigger Excel export
    });

    // Search Filter
    searchInput.addEventListener("input", () => {
        const filter = searchInput.value.toLowerCase();

        tableRows = Array.from(tableBody.querySelectorAll("tr"));

        tableRows.forEach((row) => {
            const rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(filter) ? "" : "none";
        });

        // Update pagination after filtering
        tableRows = Array.from(tableBody.querySelectorAll("tr")).filter(
            (row) => row.style.display !== "none"
        );
        currentPage = 1; // Reset to first page
        updatePagination();
    });

    // Open Add Product Modal
    addRowBtn.addEventListener("click", () => {
        modalTitle.textContent = "زیادکردنی بەرهەم";
        rowForm.reset();
        document.getElementById("productId").value = "";
        rowFormModal.style.display = "block";
    });

    // Close Modal Buttons
    document.querySelectorAll(".close-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            rowFormModal.style.display = "none";
            viewProductModal.style.display = "none";
        });
    });

    // Handle Edit Button Clicks
    document.querySelectorAll(".editBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const productId = btn.dataset.id;
            try {
                const response = await fetch(`/admin/getProduct/${productId}`);
                if (response.ok) {
                    const product = await response.json();

                    // Populate form with product data
                    document.getElementById("productId").value = product.id;
                    document.getElementById("title").value = product.title;
                    document.getElementById("cost").value = product.cost;
                    document.getElementById("price").value = product.price;
                    document.getElementById("description").value = product.description || "";
                    document.getElementById("category").value = product.category_id;
                    document.getElementById("stock").value = product.stock;
                    document.getElementById("expiry_date").value = product.expiry_date || "";
                    document.getElementById("popular").value = product.popular ? "1" : "0";
                    document.getElementById("is_new").value = product.is_new ? "1" : "0";
                    document.getElementById("date_added").value = product.date_added || "";

                    modalTitle.textContent = "دەستکاریکردنی بەرهەم";
                    rowFormModal.style.display = "block";
                } else {
                    alert("Failed to retrieve product details.");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                alert("An error occurred while fetching product details.");
            }
        });
    });

    // Handle View Button Clicks
    document.querySelectorAll(".viewBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const productId = btn.dataset.id;
            try {
                const response = await fetch(`/admin/getProduct/${productId}`);
                if (response.ok) {
                    const product = await response.json();

                    // Create product details HTML
                    productDetails.innerHTML = `
                        <div class="product-details">
                            <div class="detail-item">
                                <strong>ئایدی:</strong> ${product.id}
                            </div>
                            <div class="detail-item">
                                <strong>ناونیشان:</strong> ${product.title}
                            </div>
                            <div class="detail-item">
                                <strong>نرخی کڕین:</strong> ${product.cost}
                            </div>
                            <div class="detail-item">
                                <strong>نرخ:</strong> ${product.price}
                            </div>
                            <div class="detail-item">
                                <strong>وەسف:</strong> ${product.description || "بێ وەسف"}
                            </div>
                            <div class="detail-item">
                                <strong>جۆر:</strong> ${product.category_name}
                            </div>
                            <div class="detail-item">
                                <strong>بەردەست:</strong> ${product.stock}
                            </div>
                            <div class="detail-item">
                                <strong>بەرواری بەسەرچوون:</strong> ${product.expiry_date || "نادیار"}
                            </div>
                            <div class="detail-item">
                                <strong>ناسراو:</strong> ${product.popular ? 'بەڵێ' : 'نەخێر'}
                            </div>
                            <div class="detail-item">
                                <strong>نوێ:</strong> ${product.is_new ? 'بەڵێ' : 'نەخێر'}
                            </div>
                            <div class="detail-item">
                                <strong>بەرواری زیادکراو:</strong> ${product.date_added || "نادیار"}
                            </div>
                            ${product.image ? `
                            <div class="detail-item">
                                <strong>وێنە:</strong><br>
                                <img src="${product.image}" alt="${product.title}" style="max-width: 300px; margin-top: 10px;">
                            </div>` : `
                            <div class="detail-item">
                                <strong>وێنە:</strong> بێ وێنە
                            </div>`}
                        </div>
                    `;

                    viewProductModal.style.display = "block";
                } else {
                    alert("Failed to retrieve product details.");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                alert("An error occurred while fetching product details.");
            }
        });
    });

    // Handle Form Submission
    rowForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(rowForm);
        const productId = document.getElementById("productId").value;
        const url = productId ? `/admin/updateProduct/${productId}` : "/admin/addProduct";

        try {
            const response = await fetch(url, {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                rowFormModal.style.display = "none";
                location.reload(); // Reload to show updated data
            } else {
                alert("Failed to save product data.");
            }
        } catch (error) {
            console.error("Error saving product:", error);
            alert("An error occurred while saving product data.");
        }
    });

    // Initialize Pagination
    updatePagination();
});