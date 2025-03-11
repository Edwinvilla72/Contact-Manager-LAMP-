<?php
// Daniel Armas API 2

require_once("db_connector.php");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

$response = []; // Initialize response array

try
{ 
    // Read JSON data from the request
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate JSON input
    if (!is_array($data))
    {
        throw new Exception("Invalid JSON input");
    }

    // Extracting variables from the request
    $firstName = trim($data["firstName"] ?? "");
    $lastName = trim($data["lastName"] ?? "");
    $phoneNumber = trim($data["phoneNumber"] ?? "");
    $email = isset($data["email"]) ? trim($data["email"]) : null; // Ensure null if not provided
    $userID = trim($data["userId"] ?? "");

    // Validate required fields
    if (empty($firstName) || empty($lastName) || empty($phoneNumber) || !$userID) {
        throw new Exception("Missing required fields");
    }

    // Validate email format if provided
    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }

    // Validate phone number format (digits only, 10-15 characters)
    if (!preg_match("/^\d{10,15}$/", $phoneNumber)) {
        throw new Exception("Invalid phone number format");
    }

    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO contacts (FirstName, LastName, Phone, Email, UserID) VALUES (?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Database error: " . $conn->error);
    }

    // Bind parameters, ensuring email is set to NULL if not provided
    $stmt->bind_param("sssss", $firstName, $lastName, $phoneNumber, $email, $userID);

    // Execute statement
    if (!$stmt->execute()) {
        throw new Exception("Database error: " . $stmt->error);
    }

    // Get the ID of the newly created contact
    $newContactId = $stmt->insert_id;

    // Success response
    $response = [                
        "contactId" => $newContactId,
        "error" => null
    ];

    $stmt->close();
}
catch(Exception $e)
{
    $response["contactId"] = null;
    $response["error"] = $e->getMessage();
}

// Return JSON response
echo json_encode($response);
?>
