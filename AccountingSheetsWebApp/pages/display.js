document.addEventListener("DOMContentLoaded", function() {
    // Retrieve saved data from local storage
    const currentSheet = localStorage.getItem("currentSheet"); // Get the clicked entry's data
    if (currentSheet) {
        const parsedSheet = JSON.parse(currentSheet);

        // Set the title of the main table dynamically
        const mainTableTitle = document.getElementById("main-table-title");
        mainTableTitle.textContent = parsedSheet.title || "Main Table";

        // Function to populate main table with the clicked entry's data
        function populateMainTable(parsedSheet) {
            const mainTableBody = document.querySelector("#main-table tbody");
            parsedSheet.mainTable.forEach(rowData => {
                const newRow = document.createElement("tr");
                for (let i = 0; i < rowData.length - 1; i++) { // Exclude the last column
                    const cell = document.createElement("td");
                    cell.textContent = rowData[i];
                    newRow.appendChild(cell);
                }
                mainTableBody.appendChild(newRow);
            });
        }
        
        // Function to populate additional table with the clicked entry's data
        function populateAdditionalTable(parsedSheet) {
            const additionalTableBody = document.querySelector("#additional-table tbody");
            parsedSheet.additionalTable.forEach(rowData => {
                const newRow = document.createElement("tr");
                for (let i = 0; i < rowData.length - 1; i++) { // Exclude the last column
                    const cell = document.createElement("td");
                    cell.textContent = rowData[i];
                    newRow.appendChild(cell);
                }
                additionalTableBody.appendChild(newRow);
            });
        }

        // Function to display summary from the clicked entry's data
        function displaySummary(parsedSheet) {
            const totalSalesDisplay = document.getElementById("total-sales");
            const grandBalanceDisplay = document.getElementById("grand-balance");
            
            totalSalesDisplay.textContent = parsedSheet.totalSales || "";
            grandBalanceDisplay.textContent = parsedSheet.grandBalance || "";
            
            // Add console log to check parsed data
            console.log(parsedSheet);
        }

        // Call functions to populate tables and display summary
        populateMainTable(parsedSheet);
        populateAdditionalTable(parsedSheet);
        displaySummary(parsedSheet);
    }
});
