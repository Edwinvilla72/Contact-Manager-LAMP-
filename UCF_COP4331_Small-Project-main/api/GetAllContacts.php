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
    sendObjectAsJson(["results" => null, "error" => $err]);
    exit();
}


// get userId from either GET request query
$userID = isset($_GET["userId"]) ? intval($_GET["userId"]) : null;
$search = isset($_GET["search"]) ? $_GET["search"] : "";

// validate that userId exists
if (!$userID) {
    returnWithError("User ID is required");    
}

// connect to the database
require_once __DIR__ . "/db_connector.php";

// Check connection
if ($conn->connect_error) {
    returnWithError("Database connection failed: " . $conn->connect_error);
}

//otherwise, perform logic
else {    
    if ($search && !empty($search)) {
        // Create search pattern for partial matching
        $searchLike = "%" . $search . "%";
        // Prepare sql        
        $stmt = $conn->prepare("SELECT `ID`, `FirstName`, `LastName`, `Phone`, `Email`, `DateCreated` 
                                FROM `contacts` 
                                WHERE `UserID` = ? AND 
                                      ( `FirstName` LIKE ? OR 
                                        `LastName` LIKE ? OR 
                                        `Phone` LIKE ? OR 
                                        `Email` LIKE ? OR 
                                        CONCAT(`FirstName`, ' ', `LastName`) LIKE ? )");
        $stmt->bind_param("isssss", $userID, $searchLike, $searchLike, $searchLike, $searchLike, $searchLike);
    } else {
        // No search term provided: retrieve all contacts for the user
        $stmt = $conn->prepare("SELECT `ID`, `FirstName`, `LastName`, `Phone`, `Email`, `DateCreated` 
                                FROM `contacts` 
                                WHERE `UserID` = ?");
        $stmt->bind_param("i", $userID);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    // fetch all contacts
    $contacts = [];
    while ($row = $result->fetch_assoc()) {
        $contacts[] = [            
            "contactId" => $row["ID"],
            "firstName" => $row["FirstName"],
            "lastName" => $row["LastName"],
            "phoneNumber" => $row["Phone"],
            "email" => $row["Email"],
            "dateCreated" => $row["DateCreated"]
        ];
    }

    // return contacts or an empty array
    sendObjectAsJson(["results" => $contacts, "error" => null]);
}
// close connection
$stmt->close();
$conn->close();

?>
