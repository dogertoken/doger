<?php
header("Content-Type: application/json");

// Masukkan Bearer Token Twitter API kamu di sini
$bearer_token = "YOUR_TWITTER_BEARER_TOKEN";
$target_twitter_id = "TARGET_TWITTER_ID"; // ID akun Twitter yang harus difollow
$tweet_id = "TWEET_ID"; // ID tweet yang harus di-retweet

// Fungsi untuk mengambil data dari Twitter API
function getTwitterData($endpoint, $params = []) {
    global $bearer_token;
    
    $url = "https://api.twitter.com/2/" . $endpoint . "?" . http_build_query($params);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $bearer_token"
    ]);
    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

// Periksa apakah pengguna mengirim permintaan dengan username
if (isset($_GET['username'])) {
    $username = $_GET['username'];

    // Ambil ID pengguna berdasarkan username
    $user_data = getTwitterData("users/by/username/$username");
    if (!isset($user_data['data']['id'])) {
        echo json_encode(["error" => "User not found"]);
        exit;
    }

    $user_id = $user_data['data']['id'];

    // Periksa apakah user sudah follow akun target
    $following_data = getTwitterData("users/$user_id/following", ["max_results" => 1000]);
    $is_following = false;

    if (isset($following_data['data'])) {
        foreach ($following_data['data'] as $follow) {
            if ($follow['id'] === $target_twitter_id) {
                $is_following = true;
                break;
            }
        }
    }

    // Periksa apakah user sudah retweet tweet tertentu
    $retweeted_data = getTwitterData("tweets/$tweet_id/retweeted_by");
    $has_retweeted = false;

    if (isset($retweeted_data['data'])) {
        foreach ($retweeted_data['data'] as $retweeter) {
            if ($retweeter['id'] === $user_id) {
                $has_retweeted = true;
                break;
            }
        }
    }

    // Respon JSON
    echo json_encode([
        "username" => $username,
        "is_following" => $is_following,
        "has_retweeted" => $has_retweeted
    ]);
}
?>
