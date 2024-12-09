// Setup WebSocket connection
function setupWebSocket() {
  // Create a new WebSocket connection
  const webSocket = new WebSocket("ws://localhost:3000/ws");

  // Console log when the WebSocket connection is opened
  webSocket.addEventListener("open", () => {
    console.log("WebSocket connection opened");
  });

  // Message event listener to handle incoming messages from the server
  webSocket.addEventListener("message", (event) => {
    // Parse the incoming message as JSON
    const eventData = JSON.parse(event.data);

    if (eventData.type === "message") {
      // If the message type is a chat ("message"), call the onNewMessageReceived function
      onNewMessageReceived(
        eventData.username,
        eventData.timestamp,
        eventData.message
      );
    } else if (eventData.type === "notification") {
      // If the message type is a notification, alert the user with its contents
      console.log("Notification received:", eventData);
      if (eventData.subtype === "user-disconnection") {
        onUserDisconnected(eventData.username);
      } else if (eventData.subtype === "user-connection") {
        onUserConnected(eventData.username);
      }
    } else if (eventData.type === "user-list-update") {
      console.log("Updated online users list:", eventData.userList);
      updateUserList(eventData.userList);
    }
  });

  // Event listener for WebSocket debugging and error handling
  webSocket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event);
  });

  // If the WebSocket connection is closed, attempt to reconnect after 5 seconds
  webSocket.addEventListener("close", () => {
    console.log("WebSocket connection closed, attempting to reconnect...");
    setTimeout(setupWebSocket, 5000);
  });

  return webSocket;
}

// Initialize WebSocket connection
let webSocket = setupWebSocket();

// Function to update the list of online users
function updateUserList(userList) {
  const onlineUsers = document.querySelector("#online-user-list");
  onlineUsers.innerHTML = ""; // Clear the current list

  // Append each online user to the list
  userList.forEach((username) => {
    const onlineUserElement = document.createElement("li");
    onlineUserElement.textContent = username;
    onlineUsers.appendChild(onlineUserElement);
  });
}

// Function to handle sending a message to the server
function onMessageSent(event) {
  event.preventDefault();
  const messageInput = document.querySelector("#message-input");
  const message = messageInput.value;

  console.log("Sending message:", message);

  // Get the username from the invisible input field
  const username = document.getElementById("username").value;
  if (!username || !message) return; // Prevent user from sending empty messages

  // Send the message object to the WebSocket server
  webSocket.send(
    JSON.stringify({
      type: "message",
      sender: username,
      message: message,
    })
  );

  // Clear the input field after message is sent
  messageInput.value = "";
}

// Event listener to handle chat form submission
document.getElementById("chat-form").addEventListener("submit", onMessageSent);

// Function to handle receiving a new message from the server and appending it to the chat
function onNewMessageReceived(username, timestamp, message) {
  const chatMessages = document.querySelector("#chat-messages");
  const messageElement = document.createElement("div");
  messageElement.innerHTML = `<div class="message-info"> <strong>${username}</strong> • <span class="time-stamp">${timestamp}</span>: </div> <div class = "message-content">${message}</div>`;
  // Different style to display the message
  // `<strong>${username}</strong> [${timestamp}]: ${message}`;
  chatMessages.appendChild(messageElement);
}

// Function for handling a user connecting
function onUserConnected(username) {
  // Append a notification to the chat
  const chatMessages = document.querySelector("#chat-messages");
  const messageElement = document.createElement("div");
  messageElement.innerHTML = `<div class="notification-text"><em>${username} has joined the chat.</em></div>`;
  chatMessages.appendChild(messageElement);
}

// Function for handling a user disconnecting
function onUserDisconnected(username) {
  // Append a notification to the chat
  const chatMessages = document.querySelector("#chat-messages");
  const messageElement = document.createElement("div");
  messageElement.innerHTML = `<div class="notification-text"><em>${username} has left the chat.</em></div>`;
  chatMessages.appendChild(messageElement);
}
