const express = require("express");
const session = require("express-session");
const axios = require("axios");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
const port = 8080;

// Replace these with your actual credentials
const GOOGLE_CLIENT_ID =
  "1089921255421-gt3pbaqt2kvc1puc7hovn865frjp8h34.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const GITHUB_CLIENT_ID = "27bbaa8ed6c116c6869d";
const GITHUB_CLIENT_SECRET = "e9299c47b60b33280a9ac1ab1d194c79c0f9643d";
const WEATHER_API_KEY = "4ef0d22b5b9a45d8a9b164226240602";

// SQLite database setup
const db = new sqlite3.Database("users.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, displayName TEXT, accessToken TEXT)"
  );
});

// Configure session management
app.use(
  session({
    secret: "loldashboard2026",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: false, httpOnly: true },
  })
);
const corsOptions = {
  origin: "http://localhost:8081",
  credentials: true,
  optionSuccessStatus: 200,
  methods: ["POST", "GET", "PUT", "DELETE", "HEAD", "OPTIONS"]
};
app.use(cors(corsOptions));
app.use(express.json()); // Enable JSON parsing for request bodies

// Express routes
app.get("/api/", (req, res) => {
  res.send("Welcome to the Express app!");
});

// Google OAuth routes
app.get("/api/auth/google", (req, res) => {
  const redirectUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:8080/api/auth/google/callback&response_type=code&scope=email`;
  res.send(redirectUrl);
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  const tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    null,
    {
      params: {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: "http://localhost:8080/api/auth/google/callback",
        grant_type: "authorization_code",
      },
    }
  );

  const { access_token, id_token } = tokenResponse.data;

  const userInfoResponse = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const user = {
    id: userInfoResponse.data.sub,
    displayName: userInfoResponse.data.name,
    email: userInfoResponse.data.email,
    accessToken: access_token,
  };

  // Store user data in SQLite database
  db.run(
    "INSERT OR REPLACE INTO users (id, email, displayName, accessToken) VALUES (?, ?, ?, ?)",
    [user.id, user.email, user.displayName, user.accessToken]
  );

  res.redirect("http://localhost:8081/dashboard");
});

// GitHub OAuth routes
app.get("/api/auth/github", (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user repo`;
  res.send(redirectUrl);
});

app.get("/api/auth/github/callback", async (req, res) => {
  const { code } = req.query;

  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    null,
    {
      params: {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      headers: {
        Accept: "application/json",
      },
    }
  );

  const { access_token } = tokenResponse.data;

  // add access_token to all user
  db.run(
    "UPDATE users SET accessToken = ?",
    [access_token]
  );

  console.log(access_token);

  res.redirect("http://localhost:8081/dashboard");
});

app.get("/api/github/get-repos-number", async (req, res) => {
  const user = await getUserById(req.session.userId);
  if (user) {
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${user.accessToken}`,
      },
    });
    res.json({ repos: response.data.public_repos });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.get("/api/github/get-repos-private-number", async (req, res) => {
  const user = await getUserById(req.session.userId);
  if (user) {
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${user.accessToken}`,
      },
    });
    res.json({ repos: response.data.total_private_repos });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.get("/api/github/get-repos", async (req, res) => {
  const user = await getUserById(req.session.userId);
  if (user) {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${user.accessToken}`,
      },
    });
    res.json(response.data);
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/api/github/get-issue", async (req, res) => {
  const user = await getUserById(req.session.userId);
  if (user) {
    const response = await axios.get(`https://api.github.com/repos/JulesLevi/${req.body.repo}/issues`, {
      headers: {
        Authorization: `token ${user.accessToken}`,
      },
    });
    res.json(response.data);
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.get("/api/user/has-access-token", (req, res) => {
  if (req.session.userId) {
    db.get("SELECT * FROM users WHERE id = ?", [req.session.userId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      if (row) {
        res.json({ hasAccessToken: row.accessToken !== null });
      } else {
        res.json({ hasAccessToken: false });
      }
    });
  } else {
    res.json({ hasAccessToken: false });
  }
});

app.post("/api/weather", async (req, res) => {
  const { q } = req.body;
  const response = await axios.get(
    `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${q}`
  );
  res.json(response.data);
});

// Email/password registration route
app.post("/api/register", async (req, res) => {
  const { email, password, displayName } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if the email is already registered
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a unique ID for the user
  const userId = uuidv4();

  // Store user data in SQLite database
  db.run(
    "INSERT INTO users (id, email, password, displayName) VALUES (?, ?, ?, ?)",
    [userId, email, hashedPassword, displayName],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error registering user" });
      }

      res.status(201).json({ message: "User registered successfully" });
    }
  );
});

// Email/password login route
app.post("/api/login", async (req, res) => {
  const { displayName, password } = req.body;

  if (!displayName || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Retrieve user from the database based on email
  const user = await getUserByDisplayName(displayName);

  if (!user) {
    return res.status(401).json({ error: "Invalid displayName or password" });
  }

  // Compare hashed password
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid displayName or password" });
  }

  // Log the user in
  req.session.userId = user.id;
  res.json({ message: "Login successful" });
});

// Logout route
app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/api/");
});

// Helper function to retrieve user by email from the database
function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function getUserByDisplayName(displayName) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE displayName = ?",
      [displayName],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
}

function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
