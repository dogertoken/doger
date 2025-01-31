<?php
session_start();

$client_id = "UzZYOEJsQ1U2MG9xeDlJb2FnOUE6MTpjaQ";
$client_secret = "qRiPK42JBPYBji1hytAWlTQhe4GXWu88u9_M2sX_GoSri2SFis";
$redirect_uri = "https://doger.my/twitter_callback.php";

if (isset($_GET['code'])) {
    $code = $_GET['code'];

    $token_url = "https://api.twitter.com/2/oauth2/token";
    $data = [
        "client_id" => $client_id,
        "client_secret" => $client_secret,
        "code" => $code,
        "grant_type" => "authorization_code",
        "redirect_uri" => $redirect_uri,
        "code_verifier" => "challenge"
    ];

    $ch = curl_init($token_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    $response = curl_exec($ch);
    curl_close($ch);

    $response_data = json_decode($response, true);
    if (isset($response_data['access_token'])) {
        $_SESSION['twitter_access_token'] = $response_data['access_token'];
        $_SESSION['twitter_username'] = $response_data['screen_name'];
        header("Location: index.html");
    } else {
        echo "Error: " . json_encode($response_data);
    }
}
?>
