<?php

// Edwin Villanueva API1 

// enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

// send JSON response
function sendObjectAsJson($obj) {
    header('Content-Type: application/json');
    echo json_encode($obj);
    exit();
}

// return error response
function returnWithError($err) {
    sendObjectAsJson(["data" => null, "error" => $err]);
    exit();
}


// get userId from either GET request query
$userID = isset($_GET["userId"]) ? intval($_GET["userId"]) : null;
$contactID = isset($_GET["contactId"]) ? intval($_GET["contactId"]) : null;

// validate that userId exists
if (!$userID) {
    returnWithError("User ID is required");    
}
// validate contactId
if (!$contactID) {
    returnWithError("Contact ID is required");    
}

// connect to the database
require_once __DIR__ . "/db_connector.php";

// Check connection
if ($conn->connect_error) {
    returnWithError("Database connection failed: " . $conn->connect_error);
}

//otherwise, perform logic
else {
    // prepare the statement
    $stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email, DateCreated FROM contacts WHERE UserID = ? AND ID = ?");
    $stmt->bind_param("ii", $userID ,$contactID);
    $stmt->execute();
    $result = $stmt->get_result();

    // fetch the contact
    if ($row = $result->fetch_assoc()) {
        $contact = [
            "contactId" => $row["ID"],
            "firstName" => $row["FirstName"],
            "lastName" => $row["LastName"],
            "phoneNumber" => $row["Phone"],
            "email" => $row["Email"],
            "dateCreated" => "DateCreated"
        ];
        sendObjectAsJson(["data" => $contact, "error" => null]);
    } else {
        returnWithError("No contact found for this user.");
    }
}

// close connection
$stmt->close();
$conn->close();

?>
