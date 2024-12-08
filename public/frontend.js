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
      console.log("onNewMessageReceived called");
    } else if (eventData.type === "notification") {
      // If the message type is a notification, alert the user with its contents
      alert(eventData.message);
    }

    console.log("Received message:", eventData);
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

console.log("frontend.js loaded");

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
  //   `<strong>${username}</strong> [${timestamp}]: ${message}`;
  chatMessages.appendChild(messageElement);

  console.log(
    "OnNewMessageReceived called with:",
    username,
    timestamp,
    message
  );
}

// Optional: Function for handling a user connecting (if needed)
function onUserConnected(username) {
  console.log(`${username} has connected.`);
  // Optionally, update UI to show the user has connected
}

// Optional: Function for handling a user disconnecting (if needed)
function onUserDisconnected(username) {
  console.log(`${username} has disconnected.`);
  // Optionally, update UI to show the user has disconnected
}
