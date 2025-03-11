<?php
//Connect to database
require_once("db_connector.php");
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

// requesting data
function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

//read json data
$data = getRequestInfo();


//sanitize input data
$userId = isset($data["userId"]) ? trim($data["userId"]) : null;
$contactId = isset($data["contactId"]) ? trim($data["contactId"]) : null;
$firstName = isset($data["firstName"]) ? trim($data["firstName"]) : null;
$lastName = isset($data["lastName"]) ? trim($data["lastName"]) : null;
$phoneNumber = isset($data["phoneNumber"]) ? trim($data["phoneNumber"]) : null;
$email = isset($data["email"]) ? trim($data["email"]) : null;


if (empty($firstName) || empty($lastName) || empty($phoneNumber) || !$userId || !$contactId) {
    throw new Exception("Missing required fields");
}

//prepare SQL query
$stmt = $conn->prepare("UPDATE contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE UserID=? AND ID=?");
$stmt->bind_param("ssssii", $firstName, $lastName, $phoneNumber, $email, $userId, $contactId);

// bind parameters dynamically

if (!$stmt->execute())
{
    echo json_encode(["error" => "Failed to update contact: " . $stmt->error]);
}
else 
{
    // Check if any row was updated
    if ($stmt->affected_rows > 0)
    {
        echo json_encode(["success" => true, "message" => "Contact updated successfully"]);
    }
    else
    {
        echo json_encode(["error" => "No contact found with the provided ID or no changes made"]);
    }
}

// Close the statement and connection
$stmt->close();
$conn->close();

?>
