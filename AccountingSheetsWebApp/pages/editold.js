document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("data-form");
    const mainTableBody = document.querySelector("#data-table tbody");
    const additionalTableBody = document.querySelector("#additional-table tbody");
    const sumDisplay = document.getElementById("sum-display");
    const grandBalanceDisplay = document.getElementById("grand-balance-display");

    // Retrieve the data of the selected object from local storage
    let currentSheetForEdit = localStorage.getItem("currentSheetForEdit");
    if (currentSheetForEdit) {
        let sheetData = JSON.parse(currentSheetForEdit);
        // Set the title of the current sheet dynamically
        const currentSheetTitle = document.getElementById("current-sheet-title");
        currentSheetTitle.textContent = sheetData.title || "Title Here";
        
        console.log(sheetData);
        
        // Populate the main table with the data of the selected object
        sheetData.mainTable.forEach(rowData => {
            createMainTableRow(rowData);
        });

        // Populate the additional table with the data of the selected object
        sheetData.additionalTable.forEach(rowData => {
            createAdditionalTableRow(rowData);
        });
    }
    
    // Function to calculate the sum of all deltas
    function calculateSumOfDeltas() {
        const allRows = mainTableBody.querySelectorAll("tr");
        let sum = 0;
        allRows.forEach(row => {
            const column5Value = parseFloat(row.querySelector("td:nth-child(5)").textContent);
            const column6Value = parseFloat(row.querySelector("td:nth-child(6)").textContent);
            const column7Value = parseFloat(row.querySelector("td:nth-child(7)").textContent);
            if (!isNaN(column5Value) && !isNaN(column6Value) && !isNaN(column7Value)) {
                const delta = Math.abs(column5Value - column6Value) * column7Value;
                sum += delta;
            }
        });
        return sum;
    }

    // Function to calculate the sum of the two numbers in the additional table
    function calculateSumOfAdditionalTable() {
        const allRows = additionalTableBody.querySelectorAll("tr");
        let sum = 0;
        allRows.forEach(row => {
            const column1Value = parseFloat(row.querySelector("td:nth-child(1)").textContent);
            const column2Value = parseFloat(row.querySelector("td:nth-child(2)").textContent);
            if (!isNaN(column1Value)) {
                sum += column1Value;
            }
            if (!isNaN(column2Value)) {
                sum += column2Value;
            }
        });
        return sum;
    }

    // Function to update the sum display
    function updateSumDisplay() {
        const sumOfDeltas = calculateSumOfDeltas();
        sumDisplay.textContent = `${sumOfDeltas}`;
        updateGrandBalanceDisplay(sumOfDeltas);
    }

    // Function to update the grand balance display
    function updateGrandBalanceDisplay(sumOfDeltas) {
        const sumOfAdditionalTable = calculateSumOfAdditionalTable();
        const grandBalance = sumOfDeltas + sumOfAdditionalTable;
        grandBalanceDisplay.textContent = `${grandBalance}`;
    }

    // Function to create a row in the main table
    function createMainTableRow(data) {
        const newRow = document.createElement("tr");
        
        // Loop through the data to create table cells, skipping the 8th column
        data.forEach((value, index) => {
            if (index !== 7) {
                const cell = document.createElement("td");
                cell.textContent = value;
                newRow.appendChild(cell);
            }
        });

        // Create a cell for buttons in column 8
        const buttonCell = document.createElement("td");

        // Create an "Edit" button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("edit-btn");
        buttonCell.appendChild(editButton);

        // Create a "Delete" button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-btn");
        buttonCell.appendChild(deleteButton);

        newRow.appendChild(buttonCell);

        // Append the new row to the main table
        mainTableBody.appendChild(newRow);

        // Update the sum display
        updateSumDisplay();
    }

    // Function to handle the "Edit" button click event
function handleEditButtonClick(event) {
    const row = event.target.parentElement.parentElement;
    const cells = row.querySelectorAll("td");

    if (event.target.textContent === "Edit") {
        // Replace text content with input fields for editing
        cells.forEach((cell, index) => {
            if (index < cells.length - 1) { // Excluding the last cell (buttons)
                const input = document.createElement("input");
                input.type = "text";
                input.value = cell.textContent;
                cell.textContent = "";
                cell.appendChild(input);
            }
        });

        event.target.textContent = "Save";
    } else {
        // Update cell values with input field values
        let isValid = true;
        cells.forEach((cell, index) => {
            if (index < cells.length - 1) { // Excluding the last cell (buttons)
                const inputValue = cell.querySelector("input").value.trim();
                cell.textContent = inputValue || ""; // Set empty string if inputValue is null
                if (![0, 1, 2, 3, 6].includes(index)) { // Check if not in required columns
                    return;
                }
                if (!inputValue) {
                    isValid = false;
                    return;
                }
            }
        });

        if (isValid) {
            event.target.textContent = "Edit";
        } else {
            event.target.textContent = "Save";
            event.target.disabled = true;
        }

        // Update the sum display
        updateSumDisplay();
    }
}

    // Function to handle the delete button click event
    function handleDeleteButtonClick(event) {
        const row = event.target.parentElement.parentElement;
        const confirmDelete = confirm("Are you sure you want to delete this row?");
        if (confirmDelete) {
            row.remove();
            updateSumDisplay();
        }
    }

    // Function to create a row in the additional table
    function createAdditionalTableRow(data) {
        const inputFields = additionalTableBody.querySelectorAll("input[type='text']");
        if (inputFields.length >= 2) {
            inputFields[0].value = data[0]; // Pre-type the value into the first input field
            inputFields[1].value = data[1]; // Pre-type the value into the second input field
        }

        // Update the grand balance display
        updateGrandBalanceDisplay(calculateSumOfDeltas());
    }

    // Event listener for form submission
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        const rowData = [];
        
        // Extract form data
        for (const value of formData.values()) {
            rowData.push(value);
        }

        // Create a new row in the main table with the form data
        createMainTableRow(rowData);

        // Reset the form
        form.reset();
        form.querySelector("input").focus();
    });

    // Event delegation for edit and delete button clicks (for the main table)
    mainTableBody.addEventListener("click", function(event) {
        if (event.target.classList.contains("edit-btn")) {
            handleEditButtonClick(event);
        } else if (event.target.classList.contains("delete-btn")) {
            handleDeleteButtonClick(event);
        }
    });

    // Event delegation for input changes (for the main table)
    mainTableBody.addEventListener("input", function(event) {
        if (event.target.tagName === "INPUT") {
            const row = event.target.parentElement.parentElement;
            const cells = row.querySelectorAll("td");
            const saveButton = row.querySelector(".edit-btn");

            let requiredFieldsFilled = true;
            const requiredColumns = [0, 1, 2, 3, 6];

            requiredColumns.forEach(index => {
                const cellValue = cells[index].querySelector("input").value.trim();
                if (!cellValue) {
                    requiredFieldsFilled = false;
                    return;
                }
            });

            if (requiredFieldsFilled) {
                saveButton.disabled = false;
            } else {
                saveButton.disabled = true;
            }
        }
    });

    // Event delegation for edit and delete button clicks (for the additional table)
    additionalTableBody.addEventListener("click", function(event) {
        if (event.target.classList.contains("edit-btn")) {
            handleEditButtonClick(event);
        } else if (event.target.classList.contains("delete-btn")) {
            handleDeleteButtonClick(event);
        }
    });

    // Event delegation for input changes (for the additional table)
    additionalTableBody.addEventListener("input", function(event) {
        if (event.target.tagName === "INPUT") {
            const row = event.target.parentElement.parentElement;
            const cells = row.querySelectorAll("td");
            const saveButton = row.querySelector(".edit-btn");

            let allFieldsFilled = true;
            cells.forEach((cell, index) => {
                if (index < cells.length - 1) { // Excluding the last cell (buttons)
                    const inputValue = cell.querySelector("input").value.trim();
                    if (!inputValue) {
                        allFieldsFilled = false;
                        return;
                    }
                }
            });

            if (allFieldsFilled) {
                saveButton.disabled = false;
            } else {
                saveButton.disabled = true;
            }

            // Update the grand balance display
            updateGrandBalanceDisplay(calculateSumOfDeltas());
        }
    });

    // Function to serialize tables data
    function serializeTables() {
        let currentSheetForEdit = localStorage.getItem("currentSheetForEdit");
        let sheetData = JSON.parse(currentSheetForEdit);
        const title = sheetData.title;
        const serializedData = {
            title: title,
            mainTable: [],
            additionalTable: [],
            totalSales: sumDisplay.textContent || "", // Include Total Instant Sales
            grandBalance: grandBalanceDisplay.textContent || "" // Include Grand Balance
        };

        // Serialize main table
        const mainRows = mainTableBody.querySelectorAll("tr");
        mainRows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll("td");
            cells.forEach(cell => {
                rowData.push(cell.textContent.trim());
            });
            serializedData.mainTable.push(rowData);
        });

        // Serialize additional table
        const additionalRows = additionalTableBody.querySelectorAll("tr");
        additionalRows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll("td");
            cells.forEach(cell => {
                rowData.push(cell.textContent.trim());
            });
            serializedData.additionalTable.push(rowData);
        });

        return serializedData;
    }

    const saveButton = document.getElementById("save-button");

   // Event listener for the "Save Data" button
saveButton.addEventListener("click", function() {
    // Check if any button in the main table or additional table has the text "Save"
    const mainSaveButtons = mainTableBody.querySelectorAll(".edit-btn");
    const additionalSaveButtons = additionalTableBody.querySelectorAll(".edit-btn");
    const mainRowCount = mainTableBody.querySelectorAll("tr").length;
    const anyUnsavedChanges = Array.from(mainSaveButtons).some(button => button.textContent === "Save") ||
                              Array.from(additionalSaveButtons).some(button => button.textContent === "Save");

    if (anyUnsavedChanges || (mainRowCount < 1)) {
        // Prompt the user to finish all unsaved changes
        alert("Save all unsaved changes and/or have atleast 1 row in main table.");
        return;
    }
    else {
    // If there are no unsaved changes, proceed with the saving process
    // Serialize the tables
    const serializedData = serializeTables();
    console.log(serializedData);

    // Retrieve saved data from local storage
    let savedData = JSON.parse(localStorage.getItem("savedData")) || {}; // Initialize as empty object
    savedData.sheets = savedData.sheets || []; // Initialize sheets array if not present

    // Find the index of the originally selected sheet in savedData
    const index = savedData.sheets.findIndex(savedSheet => savedSheet.title === serializedData.title);


    if (index !== -1) {
        // Replace the existing entry with the new data
        savedData.sheets[index] = serializedData;
        if (!savedData.sheets[index].title.includes("[E]")) {
            savedData.sheets[index].title = serializedData.title + " [E]";
        }
        // Update savedData in local storage
        localStorage.setItem("savedData", JSON.stringify(savedData));
    }
    // Redirect to display.html to view the newly updated entry
    localStorage.setItem("currentSheet", JSON.stringify(serializedData));
    window.location.href = "display.html";
}});
});
