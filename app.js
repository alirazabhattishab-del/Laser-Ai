const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const resetButton = document.getElementById("resetButton");
const template = document.getElementById("messageTemplate");

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function formatAssistantText(text) {
  const lines = text.split("\n");
  const parts = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) {
      return;
    }
    parts.push(`<ul>${listItems.map((item) => `<li>${item}</li>`).join("")}</ul>`);
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      listItems.push(formatInlineMarkdown(trimmed.replace(/^[-*]\s+/, "")));
      continue;
    }

    flushList();
    parts.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
  }

  flushList();
  return parts.join("");
}

function autoResize() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 220)}px`;
}

function appendMessage(role, text, extraClass = "") {
  const fragment = template.content.cloneNode(true);
  const message = fragment.querySelector(".message");
  const bubble = fragment.querySelector(".bubble");

  message.classList.add(role);
  if (extraClass) {
    message.classList.add(extraClass);
  }
  if (role === "assistant" && text) {
    bubble.innerHTML = formatAssistantText(text);
  } else {
    bubble.textContent = text;
  }
  messages.appendChild(fragment);
  messages.scrollTop = messages.scrollHeight;
  return messages.lastElementChild;
}

async function sendMessage(message) {
  const pending = appendMessage("assistant", "", "pending");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    pending.remove();

    if (!response.ok) {
      appendMessage("assistant", data.error || "Something went wrong.");
      return;
    }

    appendMessage("assistant", data.reply);
  } catch (error) {
    pending.remove();
    appendMessage("assistant", "The server could not be reached. Start the Python web server and try again.");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) {
    return;
  }

  appendMessage("user", message);
  input.value = "";
  autoResize();
  await sendMessage(message);
});

input.addEventListener("input", autoResize);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

resetButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/reset", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      appendMessage("assistant", data.error || "Could not reset the conversation.");
      return;
    }

    messages.innerHTML = "";
    appendMessage("assistant", "Fresh chat started. What would you like help with?");
  } catch (error) {
    appendMessage("assistant", "Could not reset the conversation because the server is unavailable.");
  }
});

autoResize();
