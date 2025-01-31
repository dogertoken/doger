<?php
session_start();

$client_id = "UzZYOEJsQ1U2MG9xeDlJb2FnOUE6MTpjaQ";
$redirect_uri = "https://doger.my/twitter_callback.php";

header("Location: https://twitter.com/i/oauth2/authorize?response_type=code&client_id=$client_id&redirect_uri=$redirect_uri&scope=tweet.read%20users.read%20follows.read%20offline.access&state=random_string&code_challenge=challenge&code_challenge_method=plain");
exit;
