<?php

// Edwin Villanueva - API1

// enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

// function to get JSON input
function getRequestInfo() {
    return json_decode(file_get_contents('php://input'), true);
}

// function to send JSON response
function sendObjectAsJson($obj) {
    echo json_encode($obj);
    exit();
}

// function to return error response
function returnWithError($err) {
    sendObjectAsJson(["success" => false, "error" => $err]);
}

// function to return success response
function returnSuccess() {
    sendObjectAsJson(["success" => true, "error" => null]);
}

// get data from JSON request
$inData = getRequestInfo();

// check if JSON decoding failed
if (!$inData) {
    returnWithError("invalid JSON input received.");
}

// extract variables safely
$contactId = isset($inData["contactId"]) ? intval($inData["contactId"]) : null;
$userID = isset($inData["userId"]) ? intval($inData["userId"]) : null;

// ensure both values are present
if (!$contactId || !$userID) {
    returnWithError("contact ID and user ID are required.");
}

// connect to the database
require_once __DIR__ . "/db_connector.php";

// check connection
if ($conn->connect_error) {
    returnWithError("database connection failed: " . $conn->connect_error);
}

// prepare statement
$stmt = $conn->prepare("DELETE FROM contacts WHERE ID = ? AND UserID = ?");
if (!$stmt) {
    returnWithError("sql prepare failed: " . $conn->error);
}
else {
    // bind parameters
    $stmt->bind_param("ii", $contactId, $userID);

    // execute statement
    if (!$stmt->execute()) {
        returnWithError("database error: " . $stmt->error);
    }

    // check if any rows were affected
    if ($stmt->affected_rows === 0) {
        returnWithError("no matching contact found or already deleted.");
    }

    // close the statement and connection
    $stmt->close();
    $conn->close();

    // return success response
    returnSuccess();
}

?>
