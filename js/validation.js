function getValidationLogin(login) {
    if (!login || login.trim().length == 0) return "Login is required!"        
    if (login.length < 3) return "Login must be at least 3 characters long!";
    if (login.length >= 30) return "Login is too long!";
    return null;
}

function getValidationFirstName(firstName) {
    if (!firstName || firstName.trim().length == 0) return "First name is required!"        
    if (firstName.length < 3) return "First name must be at least 3 characters long!";
    if (firstName.length >= 30) return "First name is too long!";
    return null;
}

function getValidationLastName(lastName) {
    if (!lastName || lastName.trim().length == 0) return "Last name is required!"        
    if (lastName.length < 3) return "Last name must be at least 3 characters long!";
    if (lastName.length >= 30) return "Last name is too long!";
    return null;
}

function getValidationPhoneNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber.trim().length === 0) return "Phone number is required!";
    if (!/^\d+$/.test(phoneNumber)) return "Phone number must contain only digits!";
    if (phoneNumber.length < 10 || phoneNumber.length > 15) return "Phone number must be between 10 and 15 digits!";
    return null;
}

function getValidationEmail(email) {
    if (!email || email.trim().length === 0) return "Email is required!";
    if (email.length < 5) return "Email must be at least 5 characters long!";
    if (email.length > 50) return "Email is too long!";
    return null;
}

function getValidationPassword(password) {
    if (!password || password.length == 0) return "Password is required!";
    if (password.length < 4) return "Password must be at least 4 characters long!";
    if (password.length >= 30) return "Password is too long!";
    return null;
}

function getLoginValidationError(login, password) {
    const loginError = getValidationLogin(login);
    if (loginError) return loginError;    

    const passwordError = getValidationPassword(password);
    if (passwordError) return passwordError;
  
    return null;
}

function getSignupValidationError(login, password, passwordConfirm) {
    const loginError = getValidationLogin(login);
    if (loginError) return loginError;

    const passwordError = getValidationPassword(password);
    if (passwordError) return passwordError;

    if (password !== passwordConfirm) return "Passwords don't match!";    
    return null;
}

function getAddContactValidationError(firstName, lastName, phoneNumber, email) {
    const firstNameError = getValidationFirstName(firstName);
    if (firstNameError) return firstNameError;

    const lastNameError = getValidationLastName(lastName);
    if (lastNameError) return lastNameError;

    const phoneError = getValidationPhoneNumber(phoneNumber);
    if (phoneError) return phoneError;

    // Email is optional, but if provided, validate it
    if (email && email.trim().length > 0) {
        const emailError = getValidationEmail(email);
        if (emailError) return emailError;
    }

    return null; // No validation errors
}

function getUpdateContactValidationError(firstName, lastName, phoneNumber, email) {
    return getAddContactValidationError(firstName, lastName, phoneNumber, email);
}

function showErrorMessage(message, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = message;
    container.hidden = false;    
}

function hideErrorMessage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    container.hidden = true;   
}

function showSpinner(spinnerId) {  
    const spinner = document.getElementById(spinnerId);
    if (!spinner) return;    
    spinner.classList.add("d-flex");    
    spinner.classList.remove("d-none");    
      
}

function hideSpinner(spinnerId) {
    const spinner = document.getElementById(spinnerId);
    if (!spinner) return;           
    spinner.classList.remove("d-flex");    
    spinner.classList.add("d-none");  
}
