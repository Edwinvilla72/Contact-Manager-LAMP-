// API Calls Module
const fetchContacts = async (searchQuery) => {
    const session = retrieveSession();    
    if (!session || !session.userId) {
        window.location.href = "/";
        return;
    }

    try {                
        let url = `/api/GetAllContacts.php?userId=${session.userId}`;
        if (searchQuery && searchQuery.length > 0) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        const response = await fetch(url);


        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();                  

        if (data.error) {
            throw new Error(data.error || "Unknown error");
        }

        return data.results;
    } catch (error) {
        console.error("Error fetching contacts:", error);
        throw error;
    }
};

function getAvatarColor(contactName) {        
    const colors = [
        "#ee675c", //red,
        "#fa903e", //orange,
        "#fcc934", //yellow,
        "#5bb974", //green
        "#4ecde6", //blue
        "#af5cf7", //purple
        "#ff63b8", //pink
    ]

    // Fowler–Noll–Vo (FNV-1a) hashing with better distribution
    let hash = 997525853; // Large prime
    for (let i = 0; i < contactName.length; i++) {
        hash ^= contactName.charCodeAt(i);
        hash *= 16777619;
    }

    // Ensure hash is always positive and evenly distributed
    hash = (hash >>> 0) % colors.length;

    return colors[hash];
}


function formatPhoneNumber(phoneNumber) {
    // Remove the country code (+1) if present
    let cleaned = phoneNumber.replace(/^(\+1)/, "");

    // Ensure it only contains digits
    cleaned = cleaned.replace(/\D/g, "");

    // Format as XXX-XXX-XXXX
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else {
        return phoneNumber; // Return original if format doesn't match
    }
}

function formatTimestamp(timestamp) {
    // Convert the input string into a Date object
    const date = new Date(timestamp);

    // Extract month, day, and year
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    // Format as MM/dd/yyyy
    return `${month}/${day}/${year}`;
}

// took from stackoverflow
function highlightText(text, searchQuery) {
    if (!text || !searchQuery || searchQuery.trim() === '') {
      return text;
    }
    
    // Escape special regex characters from the search query
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create a regex pattern that allows an optional hyphen between each character
    const pattern = escapedQuery.split('').join('-?');
    
    // Create a global, case-insensitive regex with the pattern
    const regex = new RegExp(`(${pattern})`, 'gi');
    
    // Replace each match with the highlighted span
    return text.replace(regex, `<span class="searchHighlight">$1</span>`);
  }

// UI Update Module
const renderContacts = (contacts, searchQuery) => {
    const tableLayout = document.getElementById("contacts-table-layout");
    const tableBody = document.getElementById("contacts-table-body");
    const noContactsMessage = document.getElementById("no-contacts-message");
    
    const noSearchResultsFound = document.getElementById("no-search-results-message");
    noSearchResultsFound.hidden = true;

    // Clear the table before rendering new contacts
    tableBody.innerHTML = '';

    //hide/add container with " No Contacts Message"
    if (contacts.length === 0) {        
        if (!searchQuery) {
            tableLayout.classList.add("d-none");
            noContactsMessage.hidden = false;
        } else {
            noSearchResultsFound.hidden = false;
        }
        return;
    } 
    tableLayout.classList.remove("d-none");
    noContactsMessage.hidden = true;
    

    //buttons
    const updateButton = '<button type="button" class="btn-update btn text-contacts"><i class="fa fa-gear" aria-hidden="true"></i></button>';
    const deleteButton = '<button type="button" class="btn-delete btn text-danger"><i class="fa fa-trash" aria-hidden="true"></i></button>';

    //loop over contacts to create table rows
    contacts.forEach((contact, index) => {
        const row = document.createElement("tr");        

        //set data attribute for the contact id
        row.setAttribute("data-contact-id", contact.contactId);

        let name = contact.firstName + " " + contact.lastName;
        let initials = "";
        if (contact.firstName && contact.lastName) {
            initials = (contact.firstName[0] + contact.lastName[0]).toUpperCase();
        }

        let highlightedName = highlightText(name, searchQuery);
        let phoneNumber = highlightText(formatPhoneNumber(contact.phoneNumber), searchQuery);
        let email = highlightText(contact.email, searchQuery);

        const avatarAndName = 
        `<div class="d-flex align-items-center">
            <div class="avatar me-2" style="background-color: ${getAvatarColor(name)}!important">
                ${initials}
            </div>
            ${highlightedName}
        </div>`;

        //that speak for itself
        row.innerHTML = `
            <td scope="row">${index + 1}</td>
            <td>${avatarAndName}</td>
            <td>${phoneNumber}</td>
            <td>${email ? `<a href="mailto:${contact.email}">${email}</a>` : ""}</td>
            <td>${contact.dateCreated ? formatTimestamp(contact.dateCreated) : ""}</td>
            <td><div class="d-flex">${updateButton}${deleteButton}</div></td>            
        `;
        //inject generated html to the table element
        tableBody.appendChild(row);
    });
};

// API Calls Module
const addContact = async (firstName, lastName, phoneNumber, email) => {
    const session = retrieveSession();    
    if (!session || !session.userId) {
        window.location.href = "/";
        return;
    }

    const response = await fetch("/api/CreateContact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            "userId": session.userId, 
            "firstName": firstName, 
            "lastName": lastName, 
            "phoneNumber": phoneNumber, 
            "email": email,
        }),
    });

    if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
    }

    return await response.json();
};

// API call for updating a contact
const updateContact = async (contactId, firstName, lastName, phoneNumber, email) => {
    const session = retrieveSession();
    if (!session || !session.userId) {
        window.location.href = "/";
        return;
    }

    const response = await fetch("/api/EditContact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: session.userId,
            contactId: contactId,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            email: email,
        }),
    });

    if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
    }

    return await response.json();
};

const deleteContact = async (contactId) => {
    const session = retrieveSession();    
    if (!session || !session.userId) {
        window.location.href = "/";
        return;
    }

    const response = await fetch("/api/DeleteContact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            "userId": session.userId, 
            "contactId": contactId
        }),
    });

    if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
    }

    return await response.json();
};

// Event Handlers
const loadContacts = async (isShowSpinner) => {    
    if (isShowSpinner) showSpinner("contactTableSpinner");

    try {              
        //await new Promise(resolve => setTimeout(resolve, 1000)); //for testing
        const searchQuery = getSearchQuery();
        const contacts = await fetchContacts(searchQuery);
        window.contactsList = contacts; //save
        renderContacts(contacts, searchQuery);
        hideSpinner("contactTableSpinner");
        return true;
    } catch (error) {
        showErrorMessage("<b>Failed to load contacts</b><br>\n" + error, "ShowContactsError");        
    }

    hideSpinner("contactTableSpinner");
    return false;
};


const handleAddContact = async (firstName, lastName, phoneNumber, email) => {
    try {
        //await new Promise(resolve => setTimeout(resolve, 1000)); //for testing
        const data = await addContact(firstName, lastName, phoneNumber, email);
        
        if (data.contactId && !data.error) {
            return data.contactId;
        } else if (data.error) {
            showErrorMessage(data.error, "AddModalError");        
        }
    } catch (error) {
        console.error("Add Contact Error:", error);
        showErrorMessage("An error occurred. Please try again.", "AddModalError");
    }
    return -1;
};

const handleUpdateContact = async (contactId, firstName, lastName, phoneNumber, email) => {
    try {
        const data = await updateContact(contactId, firstName, lastName, phoneNumber, email);

        if (data.success) {
            return true;
        } else if (data.error) {
            showErrorMessage(data.error, "UpdateModalError");
        }
    } catch (error) {
        console.error("Update Contact Error:", error);
        showErrorMessage("An error occurred. Please try again.", "UpdateModalError");
    }
    return false;
};

const handleDeleteContact = async (contactId) => {
    try {        
        const data = await deleteContact(contactId);
        
        if (data.success) {
            return true;
        } else if (data.error) {
            showErrorMessage(data.error, "ConfirmDeleteModalError");        
        }
    } catch (error) {
        console.error("Delete Contact Error:", error);
        showErrorMessage("An error occurred. Please try again.", "ConfirmDeleteModalError");
    }    
    return false;
};

// Variable to store the contact id to delete
let selectedContactId = null;

// Event Listeners
const initializeEventListeners = () => {
    document.addEventListener("DOMContentLoaded", function() {        
        loadContacts(true);
    });     

    // Event delegation for delete buttons
    document.addEventListener("click", function(event) {
        const deleteButton = event.target.closest(".btn-delete");
        if (deleteButton) {
            // Get the corresponding table row
            const row = deleteButton.closest("tr");
            selectedContactId = row.getAttribute("data-contact-id");
            
            // Show the delete confirmation modal
            const deleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
            deleteModal.show();
        }
    });    

    document.addEventListener("click", function(event) {
        const updateButton = event.target.closest(".btn-update");        
        if (updateButton) {
            // Get the corresponding table row and contact id
            const row = updateButton.closest("tr");
            const contactId = row.getAttribute("data-contact-id");
                        
            // Find the full contact data from the global contactsList (set in renderContacts)
            const contact = window.contactsList
                ? window.contactsList.find(c => c.contactId == contactId)
                : null;
    
            if (contact) {
                selectedUpdateContactId = contactId;
                // Populate the update modal with current contact details
                let modal = document.querySelector("#updateModal");
                modal.querySelector("#update-first-name").value = contact.firstName;
                modal.querySelector("#update-last-name").value = contact.lastName;
                modal.querySelector("#update-phone-number").value = contact.phoneNumber;
                modal.querySelector("#update-email").value = contact.email || "";

                hideErrorMessage("UpdateModalError");
    
                // Show the update modal
                const updateModal = new bootstrap.Modal(document.getElementById("updateModal"));
                updateModal.show();
            }
        }
    });
};



// Initialize all event listeners
initializeEventListeners();


document.getElementById("logout").addEventListener("click", function() {
    sessionLogout();
    window.location.href = "/";
});

document.querySelector("#addModal form").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Select only inside #addModal to avoid conflicts
    let modal = document.querySelector("#addModal");    
    
    let firstName = modal.querySelector("#first-name").value.trim();
    let lastName = modal.querySelector("#last-name").value.trim();
    let phoneNumber = modal.querySelector("#phone-number").value.trim();
    let email = modal.querySelector("#email").value ?? null;
    if (!email || email.length == 0) email = null;

    const validationError = getAddContactValidationError(firstName, lastName, phoneNumber, email);
    if (validationError) {
        showErrorMessage(validationError, "AddModalError");
        return;   
    }

    //show loading
    showSpinner("addModalSpinner");
    const buttonTextElement = document.getElementById("addModalAddButtonText");
    const originalButtonText = buttonTextElement.innerHTML;
    buttonTextElement.innerHTML = "Adding...";
    modal.querySelectorAll("button").forEach(button => button.disabled = true);


    //execure query "add"
    const insertedContactId = await handleAddContact(firstName, lastName, phoneNumber, email);
    const isSuccess = insertedContactId != -1;

    //execute query "load"
    await loadContacts(false);

    //hide loading
    hideSpinner("addModalSpinner");
    buttonTextElement.innerHTML = originalButtonText;
    modal.querySelectorAll("button").forEach(button => button.disabled = false);

    if (isSuccess) {
        hideErrorMessage("AddModalError");
        this.reset();

        // Hide the delete confirmation modal
        const addModalElement = document.getElementById("addModal");
        const addModal = bootstrap.Modal.getInstance(addModalElement);
        if (addModal) addModal.hide();
    }
});

document.querySelector("#updateModal form").addEventListener("submit", async function(event) {
    event.preventDefault();

    let modal = document.querySelector("#updateModal");

    let firstName = modal.querySelector("#update-first-name").value.trim();
    let lastName = modal.querySelector("#update-last-name").value.trim();
    let phoneNumber = modal.querySelector("#update-phone-number").value.trim();
    let email = modal.querySelector("#update-email").value ?? null;
    if (!email || email.length === 0) email = null;

    // Validate inputs
    const validationError = getUpdateContactValidationError(firstName, lastName, phoneNumber, email);
    if (validationError) { 
        showErrorMessage(validationError, "UpdateModalError"); 
        return; 
    }

    // Show loading state
    showSpinner("updateModalSpinner");
    const buttonTextElement = document.getElementById("updateModalUpdateButtonText");
    const originalButtonText = buttonTextElement.innerHTML;
    buttonTextElement.innerHTML = "Updating...";
    modal.querySelectorAll("button").forEach(button => button.disabled = true);

    // Execute update    
    const isSuccess = await handleUpdateContact(selectedUpdateContactId, firstName, lastName, phoneNumber, email);

    // Reload the contacts list
    await loadContacts(false);

    // Hide loading state and re-enable buttons
    hideSpinner("updateModalSpinner");
    buttonTextElement.innerHTML = originalButtonText;
    modal.querySelectorAll("button").forEach(button => button.disabled = false);

    if (isSuccess) {
        hideErrorMessage("UpdateModalError");
        this.reset();

        // Hide the update modal
        const updateModalElement = document.getElementById("updateModal");
        const updateModalInstance = bootstrap.Modal.getInstance(updateModalElement);
        if (updateModalInstance) updateModalInstance.hide();
    }
});

document.getElementById("confirmDeleteButton").addEventListener("click", async function () {
    if (!selectedContactId) return;

    let modal = document.querySelector("#confirmDeleteModal"); 

    // Show loading state for delete button    
    showSpinner("deleteModalSpinner");
    const buttonTextElement = document.getElementById("deleteModalButtonText");
    const originalButtonText = buttonTextElement.innerHTML;
    buttonTextElement.innerHTML = "Deleting...";
    modal.querySelectorAll("button").forEach(button => button.disabled = true);

    //execute query "delete"    
    const isSuccess = await handleDeleteContact(selectedContactId);      

    //execute query "load"
    await loadContacts(false);

    // Hide loading state, clear error messages, and reset the modal
    hideSpinner("deleteModalSpinner");   
    buttonTextElement.innerHTML = originalButtonText;     
    modal.querySelectorAll("button").forEach(button => button.disabled = false);

    // Hide the delete confirmation modal
    if (isSuccess) {
        hideErrorMessage("ConfirmDeleteModalError");

        const deleteModalElement = document.getElementById("confirmDeleteModal");
        const deleteModal = bootstrap.Modal.getInstance(deleteModalElement);
        if (deleteModal) deleteModal.hide();

        // Clear the stored contact id
        selectedContactId = null;
    }
});

function getSearchQuery() {
    const form = document.querySelector("#searchForm form");
    if (!form) return null;
    const searchInput = form.querySelector("input");
    if (!searchInput) return null;    
    const searchQuery = searchInput.value;
    if (!searchQuery || searchQuery.length == 0) return null;
    return searchQuery;
}

async function handleSearchInput() {
    const form = document.querySelector("#searchForm form");
    const searchButton = form.querySelector("button");
    if (!searchButton) return null;

    // Show loading
    showSpinner("searchModalSpinner");
    const buttonTextElement = searchButton.querySelector("span");
    buttonTextElement.innerHTML = "Searching...";
    searchButton.disabled = true;
    
    const isSuccess = await loadContacts(false);    

    // Hide loading
    hideSpinner("searchModalSpinner");
    buttonTextElement.innerHTML = "Search";
    searchButton.disabled = false;
}

document.querySelector("#searchForm form").addEventListener("submit", async function(event) {
    event.preventDefault();        

    await handleSearchInput();
});



let debounceTimer;
document.querySelector("#searchForm form input").addEventListener("input", function (event) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    handleSearchInput();
  }, 200);
});
  
