document.addEventListener("DOMContentLoaded", () => {
    const rowsPerPage = 5;
    let currentPage = 1;

    // Elements
    const searchInput = document.getElementById("searchInput");
    const tableBody = document.querySelector("#dataTable tbody");
    const pageInfo = document.getElementById("pageInfo");
    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");
    const addRowBtn = document.getElementById("addRowBtn");
    const selectAllCheckbox = document.getElementById("selectAll");
    const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
    // const deleteBtn = document.querySelector(".deleteBtn");
    const exportBtn = document.getElementById("exportBtn");


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

    const modal = document.getElementById("rowFormModal");
    const closeBtn = document.querySelector(".close-btn");
    const rowForm = document.getElementById("rowForm");
    const modalTitle = document.getElementById("modalTitle");

    // Add Button Click Handler
    document.getElementById("addRowBtn").addEventListener("click", () => {
        modalTitle.textContent = "زیادکردن";
        rowForm.reset(); // Clear the form
        document.getElementById("rowId").value = ""; // Clear row ID for new entry
        modal.style.display = "block";
    });

    // Edit Button Click Handler (Event Delegation)

    let editBtns = document.querySelectorAll(".editBtn");
    editBtns.forEach(editBtn => {
        editBtn.addEventListener("click", (e) => {
            const rowId = editBtn.attributes[1].textContent // Get the row ID
            modalTitle.textContent = "نوێکردنەوە";
            modal.style.display = "block";

            // Fetch row details and populate the form
            fetch(`/admin/Detailexpense/${rowId}`)
                .then((response) => response.json())
                .then((data) => {
                    document.getElementById("rowId").value = data.Id;
                    document.getElementById("category").value = data.Category_id;
                    document.getElementById("amount").value = data.Amount;
                    document.getElementById("expense_date").value = data.Expense_date;
                    document.getElementById("description").value = data.Description;
                })
                .catch((err) => console.error("Error fetching row details:", err));
        });
    })


    // Form Submit Handler
    rowForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const rowId = document.getElementById("rowId").value;
        const formData = {
            category: document.getElementById("category").value,
            amount: document.getElementById("amount").value,
            expense_date: document.getElementById("expense_date").value,
            description: document.getElementById("description").value,
        };

        const method = rowId ? "PUT" : "POST"; // PUT for edit, POST for add
        const url = rowId ? `/admin/Editexpense/${rowId}` : "/admin/Addexpense";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert(rowId ? "بەسەرکەوتووی نوێکرایەوە!" : "بەسەرکوتووی زیادکرا");
                modal.style.display = "none";
                location.reload(); // Reload the table
            } else {
                alert("Failed to save row.");
            }
        } catch (error) {
            console.error("Error saving row:", error);
        }
    });

    // Close Modal
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
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
                await fetch("/admin/deleteexpense", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: selectedIds }),
                });
                location.reload();
                // if (response.ok) {
                //     location.reload(); // Reload the table after deletion
                // } else {
                //     alert("Failed to delete rows.");
                // }
            }
        }
    });


    // Export to Excel
    exportBtn.addEventListener("click", () => {
        window.location.href = "/admin/exportexpense"; // Trigger Excel export
    });

    // Search Filter
    searchInput.addEventListener("input", () => {
        const filter = searchInput.value.toLowerCase();

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

    // Initialize Pagination
    updatePagination();
});

