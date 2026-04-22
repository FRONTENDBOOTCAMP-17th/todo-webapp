import "./style.css";
import { signup, login, getMe, getTodos, createTodo, updateTodo, toggleTodo, deleteTodo } from "./api/todoApi.js";
import { state } from "./state/todoState.js";
import { renderTodos } from "./dom/renderTodos.js";
import {
  authSection,
  signupForm, signupUsernameInput, signupPasswordInput, signupNicknameInput,
  loginForm, loginUsernameInput, loginPasswordInput,
  userSection, userInfo, logoutBtn,
  todoFormSection, todoForm, titleInput, descriptionInput, prioritySelect, dueDateInput, todoSubmitBtn, todoCancelBtn,
  todoListSection, todoList,
  errorMessage, successMessage,
  filterCompleted, filterPriority,
} from "./dom/elements.js";

// --- UI 헬퍼 ---

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  successMessage.classList.add("hidden");
}

function hideError() {
  errorMessage.classList.add("hidden");
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.remove("hidden");
  errorMessage.classList.add("hidden");
  setTimeout(() => successMessage.classList.add("hidden"), 3000);
}

function showLoggedIn(nickname) {
  authSection.classList.add("hidden");
  userInfo.textContent = `${nickname}님 반갑습니다.`;
  userSection.classList.remove("hidden");
  userSection.classList.add("flex");
  todoFormSection.classList.remove("hidden");
  todoFormSection.classList.add("flex");
  todoListSection.classList.remove("hidden");
  todoListSection.classList.add("flex");
}

function showLoggedOut() {
  authSection.classList.remove("hidden");
  userSection.classList.add("hidden");
  userSection.classList.remove("flex");
  todoFormSection.classList.add("hidden");
  todoFormSection.classList.remove("flex");
  todoListSection.classList.add("hidden");
  todoListSection.classList.remove("flex");
  todoList.innerHTML = "";
}

function resetTodoForm() {
  todoForm.reset();
  state.editingTodoId = null;
  todoSubmitBtn.querySelector("img").src = "/src/svg/plus-white.svg";
  todoCancelBtn.classList.add("hidden");
  hideError();
}

// --- 인증 ---

async function checkAuth() {
  const token = localStorage.getItem("todo-token");
  if (!token) return null;

  try {
    const user = await getMe();
    showLoggedIn(user.nickname);
    return user;
  } catch {
    localStorage.removeItem("todo-token");
    return null;
  }
}

// --- Todo 로드 ---

async function loadTodos() {
  try {
    const todos = await getTodos(state.filters);
    state.todos = todos;
    renderTodos(todos);
  } catch (error) {
    showError(error.message);
  }
}

// --- 회원가입 ---

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const username = signupUsernameInput.value.trim();
  const password = signupPasswordInput.value.trim();
  const nickname = signupNicknameInput.value.trim();

  if (!username || !password || !nickname) {
    showError("회원가입 항목을 모두 입력해 주세요.");
    return;
  }

  try {
    await signup({ username, password, nickname });
    showSuccess("회원가입 완료! 로그인해 주세요.");
    signupForm.reset();
  } catch (error) {
    showError(error.message);
  }
});

// --- 로그인 ---

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!username || !password) {
    showError("아이디와 비밀번호를 입력해 주세요.");
    return;
  }

  try {
    const result = await login({ username, password });
    localStorage.setItem("todo-token", result.token);
    const user = await getMe();
    showLoggedIn(user.nickname);
    loginForm.reset();
    await loadTodos();
  } catch (error) {
    showError(error.message);
  }
});

// --- 로그아웃 ---

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("todo-token");
  showLoggedOut();
  resetTodoForm();
});

// --- Todo 생성 / 수정 ---

todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value || null;

  if (!title) {
    showError("제목을 입력해 주세요.");
    return;
  }

  try {
    if (state.editingTodoId !== null) {
      await updateTodo(state.editingTodoId, { title, description, priority, dueDate });
      showSuccess("할 일이 수정되었습니다.");
    } else {
      await createTodo({ title, description, priority, dueDate });
    }

    resetTodoForm();
    await loadTodos();
  } catch (error) {
    showError(error.message);
  }
});

todoCancelBtn.addEventListener("click", () => resetTodoForm());

// --- 완료 토글 / 수정 / 삭제 (이벤트 위임) ---

todoList.addEventListener("click", async (e) => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  hideError();

  try {
    if (action === "toggle") {
      await toggleTodo(id);
      await loadTodos();
    }

    if (action === "delete") {
      await deleteTodo(id);
      await loadTodos();
    }

    if (action === "edit") {
      const todo = state.todos.find((t) => t.id === id);
      if (!todo) return;

      state.editingTodoId = id;
      titleInput.value = todo.title;
      descriptionInput.value = todo.description ?? "";
      prioritySelect.value = todo.priority;
      dueDateInput.value = todo.dueDate ?? "";
      todoSubmitBtn.querySelector("img").src = "/src/svg/edit.svg";
      todoCancelBtn.classList.remove("hidden");
      todoFormSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (error) {
    showError(error.message);
  }
});

// --- 필터 ---

filterCompleted.addEventListener("change", async () => {
  state.filters.completed = filterCompleted.value;
  await loadTodos();
});

filterPriority.addEventListener("change", async () => {
  state.filters.priority = filterPriority.value;
  await loadTodos();
});

// --- 초기화 ---

async function init() {
  const user = await checkAuth();
  if (user) {
    await loadTodos();
  }
}

init();
