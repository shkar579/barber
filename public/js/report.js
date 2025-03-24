document.addEventListener('DOMContentLoaded', function () {

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize date inputs with current date if not set
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = new Date().toISOString().split('T')[0];
        }
    });

    // Chart initialization logic (if chart containers exist)
    const salesChartContainer = document.getElementById('salesChart');
    if (salesChartContainer) {
        const ctx = salesChartContainer.getContext('2d');
        // Chart initialization will be handled in specific report views
    }

    // Print button functionality
    const printButtons = document.querySelectorAll('.print-report');
    printButtons.forEach(button => {
        button.addEventListener('click', function () {
            window.print();
        });
    });

    // Export to CSV functionality
    const exportButtons = document.querySelectorAll('.export-csv');
    exportButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tableId = this.getAttribute('data-table');
            const table = document.getElementById(tableId);
            if (table) {
                exportTableToCSV(table, 'report.csv');
            }
        });
    });

    // Function to export table to CSV
    // Function to export table to CSV
    function exportTableToCSV(table, filename) {
        const rows = table.querySelectorAll('tr');
        const csv = [];

        for (let i = 0; i < rows.length; i++) {
            const row = [], cols = rows[i].querySelectorAll('td, th');

            for (let j = 0; j < cols.length; j++) {
                // Get the text and escape any quotes
                let text = cols[j].innerText;
                text = text.replace(/"/g, '""');
                // Add the data to the row with quotes around it
                row.push('"' + text + '"');
            }

            csv.push(row.join(','));
        }

        // Download the CSV file
        const csvString = csv.join('\n');
        const a = document.createElement('a');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }

})
