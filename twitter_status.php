<?php
session_start();
$bearer_token = $_SESSION['twitter_access_token'] ?? null;

if (!$bearer_token) {
    echo json_encode(["error" => "User not logged in"]);
    exit;
}

$twitter_user_id = "1611031952337043457"; // ID Twitter Doger Portal
$tweet_id = "1879860843652984927"; // ID tweet yang harus di-retweet

$headers = ["Authorization: Bearer $bearer_token"];

// Cek follow
$url_follow = "https://api.twitter.com/2/users/me/following?target_user_id=$twitter_user_id";
$ch = curl_init($url_follow);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response_follow = json_decode(curl_exec($ch), true);
curl_close($ch);
$is_following = isset($response_follow['data']);

// Cek retweet
$url_retweet = "https://api.twitter.com/2/users/me/retweeted_tweets?tweet_id=$tweet_id";
$ch = curl_init($url_retweet);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response_retweet = json_decode(curl_exec($ch), true);
curl_close($ch);
$has_retweeted = isset($response_retweet['data']);

// Kirim respons ke JS
echo json_encode([
    "username" => $_SESSION['twitter_username'] ?? "",
    "is_following" => $is_following,
    "has_retweeted" => $has_retweeted
]);
?>
