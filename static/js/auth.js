document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('password_confirm');
    const passwordMatchText = document.getElementById('passwordMatch');
    const submitBtn = document.getElementById('submitBtn');

    if (registerForm) {
        // Real-time password confirmation check
        if (passwordConfirm) {
            passwordConfirm.addEventListener('input', function() {
                if (password.value !== passwordConfirm.value) {
                    passwordMatchText.textContent = 'Passwords do not match!';
                    passwordMatchText.style.display = 'block';
                    submitBtn.disabled = true;
                } else {
                    passwordMatchText.textContent = '';
                    passwordMatchText.style.display = 'none';
                    submitBtn.disabled = false;
                }
            });
        }

        registerForm.addEventListener('submit', function(e) {
            const username = document.getElementById('username').value;
            
            if (username.length < 3) {
                e.preventDefault();
                alert('Username must be at least 3 characters long!');
            }

            if (password.value.length < 8) {
                e.preventDefault();
                alert('Password must be at least 8 characters long!');
            }

            if (password.value !== passwordConfirm.value) {
                e.preventDefault();
                alert('Passwords do not match!');
            }
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!username || !password) {
                e.preventDefault();
                alert('Please fill in all fields!');
            }
        });
    }
});
