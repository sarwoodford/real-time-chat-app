const { request } = require("express");

const webSocket = new WebSocket("ws://localhost:3000/ws");

webSocket.addEventListener("message", (event) => {
  const eventData = JSON.parse(event.data);

  if (eventData.type === "message") {
    onNewMessageReceived(
      eventData.username,
      eventData.timestamp,
      eventData.message
    );
  } else if (eventData.type === "notification") {
    alert(eventData.message);
  }
});

/**
 * Handles updating the chat user list when a new user connects
 *
 * This function isn't necessary and should be deleted if unused. But it's left as a hint to how you might want
 * to handle users connecting
 *
 * @param {string} username The username of the user who joined the chat
 */
function onUserConnected(username) {}

/**
 * Handles updating the chat list when a user disconnects from the chat
 *
 * This function isn't necessary and should be deleted if unused. But it's left as a hint to how you might want
 * to handle users disconnecting
 *
 * @param {string} username The username of the user who left the chat
 */
function onUserDisconnected(username) {}

/**
 * Handles updating the chat when a new message is receieved
 *
 * This function isn't necessary and should be deleted if unused. But it's left as a hint to how you might want
 * to handle new messages arriving
 *
 * @param {string} username The username of the user who sent the message
 * @param {string} timestamp When the message was sent
 * @param {string} message The message that was sent
 */
function onNewMessageReceived(username, timestamp, message) {
  const chatWidget = document.querySelector(".chat-widget");
  const messageElement = document.createElement("div");
  messageElement.innerHTML = `<strong>${username}</strong> [${timestamp}]: ${message}`;
  chatWidget.appendChild(messageElement);
}

/**
 * Handles sending a message to the server when the user sends a new message
 * @param {FormDataEvent} event The form submission event containing the message information
 */
function onMessageSent(event) {
  //Note: This code might not work, but it's left as a bit of a hint as to what you might want to do when handling
  //      new messages. It assumes that user's are sending messages using a <form> with a <button> clicked to
  //      do the submissions.
  event.preventDefault();
  const messageInput = document.querySelector("#message-input"); // Assume you have an input field for the message
  const message = messageInput.value;

  // Send message to the server
  webSocket.send(
    JSON.stringify({
      type: "message",
      sender: request.session.username,
      message: message,
    })
  );

  messageInput.value = "";
}

//Note: This code might not work, but it's left as a bit of a hint as to what you might want to do trying to setup
//      adding new messages
document
  .getElementById("message-form")
  .addEventListener("submit", onMessageSent);
