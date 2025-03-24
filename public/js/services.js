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
                await fetch("/admin/Deleteservice", {
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
        window.location.href = "/admin/Exportservices"; // Trigger Excel export
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

