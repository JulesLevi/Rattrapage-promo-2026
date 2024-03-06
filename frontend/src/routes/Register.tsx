import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import "../App.css";
import axios from "axios";

const RegistrationPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleRegistration = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(
      `Username: ${username}, Email: ${email}, Password: ${password}`
    );
    axios.post("http://localhost:8080/api/register", {
      email,
      password,
      displayName: username,
    }).then((response) => {
      console.log(response);
      if (response.status === 201) {
        window.location.href = "/login";
      }
    });
  };

  return (
    <form className="login-form" onSubmit={handleRegistration}>
      <h1>Registration</h1>
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
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
      <Button type="submit">Sign In</Button>
      <Button onClick={() => {
        window.location.href = "/login";
      }}>Login</Button>
    </form>
  );
};

export default RegistrationPage;
