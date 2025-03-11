// Saving the userId in localStorage for upcoming requests

const localStorageSessionKey = "session";

function sessionLogin(userId) {
    if (!userId) return;

    const newSession = {
        "userId": userId
    }

    localStorage.setItem(localStorageSessionKey, JSON.stringify(newSession));
    console.log("Logged in!");
    console.log(retrieveSession());
}

function sessionLogout() {    
    localStorage.removeItem(localStorageSessionKey);
}

function retrieveSession() {    
    const session = localStorage.getItem(localStorageSessionKey);
    if (!session) return null;
    return JSON.parse(session);
}

function isLoggedIn() {
    return retrieveSession() != null;
}