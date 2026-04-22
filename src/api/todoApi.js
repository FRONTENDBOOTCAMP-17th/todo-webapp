const BASE_URL = "https://api.fullstackfamily.com/api/edu";
const WORKSPACE_SLUG = "ws-d1f1d3";

async function request(path, options = {}) {
  const token = localStorage.getItem("todo-token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/${WORKSPACE_SLUG}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "API 요청에 실패했습니다.");
  }

  if (response.status === 204) {
    return null;
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export async function signup(userData) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function login(loginData) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(loginData),
  });
}

export async function getMe() {
  return request("/auth/me", { method: "GET" });
}

export async function getTodos({ completed = "", priority = "" } = {}) {
  const params = new URLSearchParams();
  if (completed !== "") params.set("completed", completed);
  if (priority !== "") params.set("priority", priority);
  const query = params.toString();
  return request(query ? `/todos?${query}` : "/todos", { method: "GET" });
}

export async function createTodo(todoData) {
  return request("/todos", {
    method: "POST",
    body: JSON.stringify(todoData),
  });
}

export async function updateTodo(id, todoData) {
  return request(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(todoData),
  });
}

export async function toggleTodo(id) {
  return request(`/todos/${id}/toggle`, { method: "PATCH" });
}

export async function deleteTodo(id) {
  return request(`/todos/${id}`, { method: "DELETE" });
}
