
//Sign up Spinner
$(".signupBtn").on("click", () => {
    $('.signupBtn').html('<span class="spinner-border spinner-border-sm mr-2 loading" role="status" aria-hidden="true"></span>Signing in...');
    // $(".signupBtn").text("Signing in..");

    setTimeout(() => {
        $('.signupBtn').html('Sign up');
    }, 200);
});

//Lofin spinner
$(".loginBtn").on("click", () => {
    $('.loginBtn').html('<span class="spinner-border spinner-border-sm mr-2 loading" role="status" aria-hidden="true"></span>Logging in...');
    // $(".signupBtn").text("Signing in..");

    setTimeout(() => {
        $('.loginBtn').html('Login');
    }, 200);
});


//Alert that query is submitted successfully
$(".contactBtn").click(() => {
    $(".showAlert").css("display", "block");
    setTimeout(() => {
        window.location = "/contact";
    }, 3000);
});

