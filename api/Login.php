<?php

// Edwin Villanueva - API1

// enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

// get JSON input
function getRequestInfo() {
    return json_decode(file_get_contents('php://input'), true);
}

// send JSON response
function sendObjectAsJson($obj) {
    header('Content-Type: application/json');
    echo json_encode($obj);
    exit();
}

function returnData($userId, $err) {
    sendObjectAsJson(["userId" => $userId, "error" => $err]);
}

function returnSuccess($userId) {
    returnData($userId, null);
}

function returnWithError($err) {
    returnData(null, $err);
}

// store user input data
$inData = getRequestInfo();

// define values from user input
$login = $inData["login"] ?? null;
$password = $inData["password"] ?? null;

// if either fields are missing, return error
if (!$login || !$password) {
    returnWithError("Missing required fields: login and password");
}

// load db connection
require_once __DIR__ . "/db_connector.php";

// Check connection
if ($conn->connect_error) {
    returnWithError("Database connection failed: " . $conn->connect_error);
}

// if connection is successful, find user in the database
$stmt = $conn->prepare("SELECT ID FROM users WHERE Login = ? AND Password = ?");
$stmt->bind_param("ss", $login, $password);
$stmt->execute();
$result = $stmt->get_result();

// check if the returned password matches the one the user sent in
if ($row = $result->fetch_assoc()) {
    returnSuccess($row["ID"]);
} else {
    returnWithError("Login or password is incorrect!");
}

// close connections
$stmt->close();
$conn->close();

?>
