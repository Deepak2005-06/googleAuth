function LoginButton() {
  return (
    <a href="http://localhost:5000/auth/google">
      <button className="google-btn btn btn-light btn-lg">
        <img src="https://www.google.com/favicon.ico" alt="Google Icon" className="google-icon me-2" />
        Sign in with Google
      </button>
    </a>
  );
}

export default LoginButton;
