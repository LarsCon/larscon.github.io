document.addEventListener("DOMContentLoaded", function() {
    const summaryTable = document.getElementById("summary-table");
    
    // Retrieve saved data from local storage
    let savedData = localStorage.getItem("savedData");
    if (savedData) {
        let parsedData = JSON.parse(savedData);
        // Log all items in localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`Key: ${key}, Value: ${value}`);
        }

        // Function to delete a row and its associated object
        function deleteRowAndObject(index) {
            parsedData.sheets.splice(index, 1); // Remove the object from the array
            localStorage.setItem("savedData", JSON.stringify(parsedData)); // Update local storage

            // Remove the corresponding row from the table
            summaryTable.deleteRow(index + 1); // Add 1 to account for the header row
            location.reload();
        }

        // Function to handle the "View" button click event
        function handleViewButtonClick(index) {
            const sheet = parsedData.sheets[index];
            localStorage.setItem("currentSheet", JSON.stringify(sheet)); // Store the current sheet in local storage
            window.location.href = "pages/display.html"; // Redirect to display.html
        }

        // Function to handle the "Edit" button click event
        function handleEditButtonClick(index) {
            const sheet = parsedData.sheets[index];
            localStorage.setItem("currentSheetForEdit", JSON.stringify(sheet)); // Store the clicked entry's data in local storage
            window.location.href = "pages/editold.html"; // Redirect to edit.html
        }

        // Iterate over each saved object and create a row in the table in reverse order
        for (let index = parsedData.sheets.length - 1; index >= 0; index--) {
            const sheet = parsedData.sheets[index];
            const title = sheet.title;
            const newRow = summaryTable.insertRow();

            // Title cell
            const titleCell = newRow.insertCell(0);
            titleCell.textContent = title;

            // Actions cell
            const actionsCell = newRow.insertCell(1);
            
            // Create view icon
            const viewIcon = document.createElement("img");
            viewIcon.src = "pics/view.png"; // Path to view.png in the "pics" folder
            viewIcon.title = "View";
            viewIcon.classList.add("summaryIcon");
            viewIcon.addEventListener("click", function() {
                handleViewButtonClick(index);
            });

            // Create edit icon
            const editIcon = document.createElement("img");
            editIcon.src = "pics/edit.png"; // Path to edit.png in the "pics" folder
            editIcon.title = "Edit";
            editIcon.classList.add("summaryIcon");
            editIcon.addEventListener("click", function() {
                handleEditButtonClick(index);
            });

            // Create delete icon
            const deleteIcon = document.createElement("img");
            deleteIcon.src = "pics/delete.png"; // Path to delete.png in the "pics" folder
            deleteIcon.title = "Delete";
            deleteIcon.classList.add("summaryIcon");
            deleteIcon.addEventListener("click", function() {
                const confirmDelete = confirm("Are you sure you want to delete this sheet?");
                if (confirmDelete) {
                    deleteRowAndObject(index);
                }
            });

            actionsCell.appendChild(viewIcon);
            actionsCell.appendChild(editIcon);
            actionsCell.appendChild(deleteIcon);
        }

    }
});