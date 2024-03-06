import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import "../App.css";
import axios from "axios";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!username || !password) {
      return;
    }
    console.log(`Username: ${username}, Password: ${password}`);
    axios
      .post(
        "http://localhost:8080/api/login",
        {
          password,
          displayName: username,
        },
        { withCredentials: true }
      )
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          window.location.href = "/dashboard";
        }
      });
  };

  const handleSignIn = () => {};

  const handleGoogleLogin = () => {
    axios
      .get("http://localhost:8080/api/auth/google", {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        withCredentials: true,
      })
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          console.log("Redirecting to Google");
          window.location.href = response.data;
        }
      });
  };

  return (
    <form className="login-form" onSubmit={handleLogin}>
      <h1>Connection</h1>
      <div>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit">Login</Button>
      <Button onClick={handleGoogleLogin}>Login with Google</Button>
      <Button onClick={handleSignIn}>Sign In</Button>
    </form>
  );
};

export default LoginPage;
