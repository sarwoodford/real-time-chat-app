const express = require("express");
const expressWs = require("express-ws");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");

const PORT = 3000;
//TODO: Replace with the URI pointing to your own MongoDB setup
const MONGO_URI = "mongodb://localhost:27017/keyin_test";
const app = express();
const SALT_ROUNDS = 10;
expressWs(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "chat-app-secret",
    resave: false,
    saveUninitialized: true,
  })
);

let connectedClients = [];
let numberOfConnectedUsers = 0;

//Note: These are (probably) not all the required routes, but are a decent starting point for the routes you'll probably need

app.get("/", async (request, response) => {
  if (request.session.user) {
    return response.redirect("/authenticated");
  }

  // Get the number of users connected to the chat

  response.render("index", { numberOfConnectedUsers: connectedClients.length });
});

app.get("/login", async (request, response) => {
  if (request.session.user) {
    return response.redirect("/authenticated");
  }
  response.render("login", { errorMessage: null });
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  console.log(request.body);
  console.log("Username:", username + " Password: " + password);

  try {
    const user = await User.findOne({ username });
    console.log("User Object: " + user);
    if (!user) {
      return response.render("login", {
        errorMessage: "Invalid Login Credentials. User not found.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return response.render("login", {
        errorMessage: "Invalid Login Credentials.",
      });
    }

    if (user.banned) {
      return response.render("login", {
        errorMessage: "You have been banned, sucka.",
      });
    }

    request.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    console.log("User.role: " + user.role);
    console.log("Username.role: " + username.role);
    console.log("User.session.role: " + request.session.user.role);
    console.log("Session: " + request.session.user);

    return response.redirect("/authenticated");
  } catch (error) {
    console.error("Error Loggin In. Please Retry", error);
    return response.render("login", {
      errorMessage: "Error Loggin In. Please Retry.",
    });
  }
});

app.get("/signup", async (request, response) => {
  return response.render("signup", { errorMessage: null });
});

app.post("/signup", async (request, response) => {
  const { username, password } = request.body;
  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return response.render("signup", {
        errorMessage: "Username already taken.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the new user and save it to the database
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // Redirect the user to the login page
    return response.redirect("/login");
  } catch (error) {
    console.error("Error signing up:", error);
    return response.render("signup", {
      errorMessage: "Registration was unsuccessful. Please try again.",
    });
  }
});

app.get("/authenticated", async (request, response) => {
  if (!request.session.user) {
    return response.redirect("/login");
  }

  return response.render("index/authenticated", { user: request.session.user });
});

app.get("/profile", async (request, response) => {
  if (!request.session.user) {
    return response.redirect("/login");
  }

  const user = await User.findById(request.session.user.id);
  return response.render("profile", { user });
});

app.get("/admin-dashboard", async (request, response) => {
  if (!request.session.user) {
    return response.redirect("/login");
  }

  if (request.session.user.role !== "admin") {
    console.log(request.session.user.role);
    return response.redirect("/authenticated");
  }

  const users = await User.find({});
  return response.render("admin-dashboard", {
    user: request.session.user,
    users: users,
  });
});

app.get("/ban/:id", async (request, response) => {
  if (!request.session.user || request.session.user.role !== "admin") {
    return response.redirect("/login");
  }

  try {
    await User.findByIdAndUpdate(request.params.id, { banned: true });
    return response.redirect("/admin-dashboard");
  } catch (error) {
    console.error("Error banning user:", error);
    return response.status(500).send("Server Error");
  }
});

app.get("/unban/:id", async (request, response) => {
  if (!request.session.user || request.session.user.role !== "admin") {
    return response.redirect("/login");
  }

  try {
    await User.findByIdAndUpdate(request.params.id, { banned: false });
    return response.redirect("/admin-dashboard");
  } catch (error) {
    console.error("Error unbanning user:", error);
    return response.status(500).send("Server Error");
  }
});

app.get("/delete/:id", async (request, response) => {
  if (!request.session.user || request.session.user.role !== "admin") {
    return response.redirect("/login");
  }

  try {
    await User.findByIdAndDelete(request.params.id);
    return response.redirect("/admin-dashboard");
  } catch (error) {
    console.error("Error deleting user:", error);
    return response.status(500).send("Server Error");
  }
});

app.get("/logout", (request, response) => {
  request.session.destroy((err) => {
    if (err) {
      console.log("Error Loggin Out.", err);
      return response.status(500).send("Server Error");
    }

    console.log("Logged Out Successfully.");

    return response.redirect("/");
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    )
  )
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  banned: { type: Boolean, default: false },
  joinDate: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  sender: { type: String, required: true },
  timeSent: { type: Date, default: Date.now },
});

const User = mongoose.model("user", userSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = { User, Message };

async function seedUsers() {
  try {
    const userCount = await User.countDocuments();

    const adminPassword = await bcrypt.hash("admin123", SALT_ROUNDS);
    const regUserPassword = await bcrypt.hash("user123", SALT_ROUNDS);

    if (userCount === 0) {
      await User.insertMany([
        {
          username: "admin_user",
          password: adminPassword,
          role: "admin",
          banned: false,
          joinDate: new Date(),
        },
        {
          username: "regular_user",
          password: regUserPassword,
          role: "user",
          banned: false,
          joinDate: new Date(),
        },
        {
          username: "banned_user",
          password: regUserPassword,
          role: "user",
          banned: true,
          joinDate: new Date(),
        },
      ]);
      console.log("Seeded users collection.");
    }
  } catch (err) {
    console.error("Error seeding users collection:", err);
  }
}

seedUsers();

app.ws("/ws", (socket, request) => {
  // Log when a new user connects to the WebSocket
  console.log("New WebSocket connection established");

  // Log the username of the connected user, if they are not logged in, "guest" is used
  // Will adjust to not even allow guest users to connect and redirect them back to login
  const username = request.session.user
    ? request.session.user.username
    : "Guest";
  console.log(`${username} connected`);

  // Add the new user to the connectedClients array in an object that contains the socket and the username
  connectedClients.push({ socket, username });

  // Update the list of online users
  updateOnlineUsers();

  // Notify users when another user connects
  connectedClients.forEach((client) => {
    if (client.socket !== socket) {
      client.socket.send(
        JSON.stringify({
          type: "notification",
          subtype: "user-connection",
          username: username,
        })
      );
    }
  });

  // Handle incoming messages from the client
  socket.on("message", async (rawMessage) => {
    let message;
    try {
      message = JSON.parse(rawMessage);
    } catch (error) {
      console.error("Error parsing message:", error);
      return;
    }
    const { sender, message: content } = message;

    console.log("Received message:", sender, content, message.type);

    if (message.type === "message") {
      // Save message to database
      const newMessage = new Message({ message: content, sender });
      await newMessage.save();
      console.log("Message saved to database");

      // Send the message to all connected clients
      connectedClients.forEach((client) => {
        client.socket.send(
          JSON.stringify({
            type: "message",
            username: sender,
            message: content,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })
        );
      });
    }

    // if (message.type === "join") {
    //   const { username } = message;

    //   // If the user isn't already in the connectedClients array, add them
    //   if (!connectedClients.some((client) => client.username === username)) {
    //     connectedClients.push({ socket, username });

    //     // Increment the number of connected users
    //     numberOfConnectedUsers++;
    //   }
    // }
  });

  // Handle WebSocket connection closing
  socket.on("close", () => {
    console.log(`${username} disconnected`);

    // Remove the user from the connectedClients array
    connectedClients = connectedClients.filter(
      (client) => client.socket !== socket
    );

    // Update the list of online users
    updateOnlineUsers();

    // Decrement the number of connected users
    // numberOfConnectedUsers--;

    // Notify the remaining users about the disconnection
    connectedClients.forEach((client) => {
      client.socket.send(
        JSON.stringify({
          type: "notification",
          subtype: "user-disconnection",
          username: username,
        })
      );
    });
  });

  function updateOnlineUsers() {
    const userList = connectedClients.map((client) => client.username);
    connectedClients.forEach((client) => {
      client.socket.send(
        JSON.stringify({
          type: "user-list-update",
          userList: userList,
        })
      );
    });
  }

  // Handle WebSocket errors
  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

/**
 * Handles a client disconnecting from the chat server
 *
 * This function isn't necessary and should be deleted if unused. But it's left as a hint to how you might want
 * to handle the disconnection of clients
 *
 * @param {string} username The username of the client who disconnected
 */
function onClientDisconnected(username) {}

/**
 * Handles a new client connecting to the chat server
 *
 * This function isn't necessary and should be deleted if unused. But it's left as a hint to how you might want
 * to handle the connection of clients
 *
 * @param {WebSocket} newSocket The socket the client has opened with the server
 * @param {string} username The username of the user who connected
 */
function onNewClientConnected(newSocket, username) {}

/**
 * Handles a new chat message being sent from a client
 *
 * This function isn't necessary and should be deleted if unused. But it's left as a hint to how you might want
 * to handle new messages
 *
 * @param {string} message The message being sent
 * @param {string} username The username of the user who sent the message
 * @param {strng} id The ID of the user who sent the message
 */
async function onNewMessage(message, username, id) {}
