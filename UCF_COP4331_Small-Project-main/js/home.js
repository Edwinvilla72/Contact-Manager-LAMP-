// API Calls Module
const loginUser = async (login, password) => {
    const response = await fetch("/api/Login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            "login": login, 
            "password": password 
        }),
    });

    if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
    }

    return await response.json();
};

const signupUser = async (login, password) => {

    const response = await fetch("/api/Register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "login": login,
            "password": password,
        }),
    });

    if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
    }

    return await response.json(); 
};


const redirectToContacts = () => {
    window.location.href = '/contacts.html';
};

// Event Handlers
const handleLogin = async (event) => {
    event.preventDefault();

    const modal = document.getElementById("SigninModal");

    let login = modal.querySelector("#SigninModalLogin").value;
    let password = modal.querySelector("#SigninModalPassword").value;

    const validationError = getLoginValidationError(login, password);
    if (validationError) {
        showErrorMessage(validationError, "SigninModalError");
        return;   
    }

    login = login.trim(); //trim login

    showSpinner("signinModalSpinner");
    const buttonTextElement = document.getElementById("signinModalButtonText");
    const originalButtonText = buttonTextElement.innerHTML;
    buttonTextElement.innerHTML = "Logging in...";
    modal.querySelectorAll("button").forEach(button => button.disabled = true);

    try {        
        const data = await loginUser(login, password);

        if (data.userId && data.error == null) {            
            sessionLogin(data.userId);
            redirectToContacts();
            return;
        } else if (data.error) {
            showErrorMessage(data.error, "SigninModalError");
        } 
    } catch (error) {
        console.error("Login Error:", error);
        showErrorMessage(error, "SigninModalError");
    }

    hideSpinner("signinModalSpinner");
    buttonTextElement.innerHTML = originalButtonText;
    modal.querySelectorAll("button").forEach(button => button.disabled = false);
};

const handleSignup = async (event) => {
    event.preventDefault();

    const modal = document.getElementById("SignupModal");

    let login = document.getElementById("SignupModalLogin").value;
    let password = document.getElementById("SignupModalPassword").value;
    let passwordConfirm = document.getElementById("SignupModalPasswordConfirm").value;

    const validationError = getSignupValidationError(login, password, passwordConfirm);
    if (validationError) {
        showErrorMessage(validationError, "SignupModalError");
        return;   
    }
    
    login = login.trim(); //trim login

    showSpinner("signupModalSpinner");
    const buttonTextElement = document.getElementById("signupModalButtonText");
    const originalButtonText = buttonTextElement.innerHTML;
    buttonTextElement.innerHTML = "Creating Account...";
    modal.querySelectorAll("button").forEach(button => button.disabled = true);


    try {
        const data = await signupUser(login, password);

        if (data.userId && data.error == null) {
            sessionLogin(data.userId);
            redirectToContacts();
            return;
        } else if (data.error) {
            showErrorMessage(data.error, "SignupModalError");
        }
    } catch (error) {
        console.error("Signup Error:", error);
        showErrorMessage(error.message, "SignupModalError");
    }

    hideSpinner("signupModalSpinner");
    buttonTextElement.innerHTML = originalButtonText;
    modal.querySelectorAll("button").forEach(button => button.disabled = false);
};

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    const signinModal = document.getElementById("SigninModal");
    const signupModal = document.getElementById("SignupModal");

    const signinModalForm = signinModal.querySelector("form");
    const signupModalForm = signupModal.querySelector("form");

    signinModalForm.addEventListener("submit", handleLogin);
    signupModalForm.addEventListener("submit", handleSignup);

    //add listener on button "#BtnSignup" to
    signinModal.querySelector("#BtnSignup").addEventListener("click", function(){
        signinModal.hidden = true;
        signupModal.hidden = false;   

        signupModalForm.reset(); 
        hideErrorMessage("SignupModalError");
    });

    signupModal.querySelector("#BtnSignin").addEventListener("click", function(){
        signinModal.hidden = false;
        signupModal.hidden = true;    

        signinModalForm.reset(); 
        hideErrorMessage("SigninModalError");
    });
});
