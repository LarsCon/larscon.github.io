document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("ticketTableForm");
    const ticketTableBody = document.querySelector("#ticketTable tbody");

    // Function to create a row in the ticket table
    function createTicketTableRow(data) {
        const newRow = document.createElement("tr");
        
        // Loop through the data to create table cells
        data.forEach((value, index) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            newRow.appendChild(cell);
        });

        // Create a cell for buttons in column 6
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

        // Append the new row to the ticket table
        ticketTableBody.appendChild(newRow);
    }

    // Function to handle the edit button click event
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
                    if (index === 4) { // Allow numbers including decimals for the "Price" field
                        input.addEventListener("keypress", function(e) {
                            if (!(e.key === '.' || (e.key >= '0' && e.key <= '9'))) {
                                e.preventDefault();
                            }
                        });
                    } else if (index !== 1) { // Allow only numbers for columns other than "Game Name" and decimals for "Price"
                        input.addEventListener("keypress", function(e) {
                            if (isNaN(e.key)) {
                                e.preventDefault();
                            }
                        });
                    }
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
                    if (![0, 1, 2, 3, 4].includes(index)) { // Check if not in required columns
                        return;
                    }
                    if (!inputValue) {
                        isValid = false;
                    }
                }
            });

            // Update the save button's disabled state based on validity
            const saveButton = event.target;
            saveButton.disabled = !isValid;

            if (isValid) {
                event.target.textContent = "Edit";
            } else {
                event.target.textContent = "Save";
            }
        }
    }

    // Function to handle the delete button click event
    function handleDeleteButtonClick(event) {
        const row = event.target.parentElement.parentElement;
        const confirmDelete = confirm("Are you sure you want to delete this row?");
        if (confirmDelete) {
            row.remove();
        }
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

        // Create a new row in the ticket table with the form data
        createTicketTableRow(rowData);

        // Reset the form
        form.reset();
        form.querySelector("input").focus();
    });

    // Event delegation for edit and delete button clicks (for the ticket table)
    ticketTableBody.addEventListener("click", function(event) {
        if (event.target.classList.contains("edit-btn")) {
            handleEditButtonClick(event);
        } else if (event.target.classList.contains("delete-btn")) {
            handleDeleteButtonClick(event);
        }
    });

    // Event delegation for input changes (for the ticket table)
    ticketTableBody.addEventListener("input", function(event) {
        if (event.target.tagName === "INPUT") {
            const row = event.target.parentElement.parentElement;
            const cells = row.querySelectorAll("td");
            const saveButton = row.querySelector(".edit-btn");

            let requiredFieldsFilled = true;
            const requiredColumns = [0, 1, 2, 3, 4]; // Columns 1, 2, 3, 4, and 5

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

    // Function to serialize the table data
    function serializeTicketTable() {
        const serializedData = {
            tickets: []
        };

        // Serialize ticket table rows
        const ticketRows = ticketTableBody.querySelectorAll("tr");
        ticketRows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll("td");
            cells.forEach((cell, index) => {
                // Skip the last column ("edit/delete")
                if (index < cells.length - 1) {
                    rowData.push(cell.textContent.trim());
                }
            });
            serializedData.tickets.push(rowData);
        });

        return serializedData;
    }

    // Event listener for the "Save" button
    const saveButton = document.getElementById("saveBin");
    saveButton.addEventListener("click", function() {
        // Check if any row still has a save button
        const unsavedChanges = Array.from(ticketTableBody.querySelectorAll(".edit-btn")).some(button => button.textContent === "Save");

        if (unsavedChanges) {
            // Alert the user to finish all unsaved changes
            alert("Please save all changes before proceeding.");
            return;
        }

        // Serialize the ticket table
        const serializedTicketTable = serializeTicketTable();

        // Save serialized data to local storage
        localStorage.setItem("currentBin", JSON.stringify(serializedTicketTable));

        // Redirect back to index.html
        window.location.href = "../index.html";
    });

    const savedData = localStorage.getItem("currentBin");
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        parsedData.tickets.forEach(rowData => {
            createTicketTableRow(rowData);
        });
    }
});
