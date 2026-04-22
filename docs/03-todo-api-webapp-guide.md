# Todo API 웹앱 개발 가이드

## 이 문서의 목적

이 문서는 Todo API를 사용해서 웹앱을 만드는 전체 흐름을 초보자 기준으로 설명합니다.  
단순히 API 주소만 나열하는 것이 아니라, "무엇부터 만들고", "어떤 순서로 연결하고", "DOM을 어떻게 바꾸는지"까지 설명합니다.

---

## 가장 먼저 꼭 알아야 하는 것

### 1. `ws-283fc1`은 예시입니다

API 문서에 보이는 `ws-283fc1`은 선생님이 사용하는 예시 slug입니다.  
학생은 반드시 **본인에게 발급된 slug**를 사용해야 합니다.

예를 들어 본인 slug가 `ws-abcd12`라면 아래처럼 바뀌어야 합니다.

```text
https://api.fullstackfamily.com/api/edu/ws-abcd12/todos
```

즉, 아래 주소를 그대로 복붙하면 안 됩니다.

```text
https://api.fullstackfamily.com/api/edu/ws-283fc1/todos
```

이 부분을 가장 많이 실수합니다.

---

### 2. 로그인을 해야 Todo를 등록할 수 있습니다

Todo API는 보호된 API입니다.  
즉, 회원가입 또는 로그인 과정을 거쳐서 토큰을 받아야 합니다.

순서

1. 회원가입 `POST /auth/signup`
2. 로그인 `POST /auth/login`
3. 응답으로 받은 `token` 저장
4. 이후 Todo API 호출 시 `Authorization` 헤더에 토큰 포함

즉, Todo 기능부터 바로 만들면 안 되고, 로그인 흐름을 먼저 잡는 것이 안전합니다.

---

### 3. Authorization 헤더가 필요합니다

이 API는 보호된 API입니다.  
즉, 요청할 때 아래 형식의 헤더가 필요합니다.

```text
Authorization: Bearer 본인_토큰
```

토큰이 없거나 잘못되면 요청이 실패할 수 있습니다.

---

### 4. Tailwind 중심으로 화면을 만듭니다

이 프로젝트는 CSS를 많이 쓰는 방향보다, Tailwind로 UI를 구성하는 방향이 좋습니다.

원칙

- 레이아웃, 색상, 간격, 폰트, 테두리: Tailwind 우선
- CSS 파일: 최소한만 사용

---

## 먼저 완성해야 할 화면

Todo 앱은 아래 영역이 있으면 구현이 쉬워집니다.

1. 회원가입 폼
2. 로그인 폼
3. 로그인 사용자 정보 영역
4. Todo 생성 폼
5. Todo 목록 영역
6. 빈 목록 메시지 영역
7. 에러 메시지 영역
8. 필터 영역

추천 HTML 구조 예시

```html
<section id="auth-section">
  <form id="signup-form">
    <input id="signup-username" name="username" type="text" />
    <input id="signup-password" name="password" type="password" />
    <input id="signup-nickname" name="nickname" type="text" />
    <button type="submit">회원가입</button>
  </form>

  <form id="login-form">
    <input id="login-username" name="username" type="text" />
    <input id="login-password" name="password" type="password" />
    <button type="submit">로그인</button>
  </form>
</section>

<section id="user-section">
  <p id="user-info"></p>
</section>

<form id="todo-form">
  <input id="title" name="title" type="text" />
  <textarea id="description" name="description"></textarea>
  <select id="priority" name="priority">
    <option value="LOW">낮음</option>
    <option value="MEDIUM">보통</option>
    <option value="HIGH">높음</option>
  </select>
  <input id="dueDate" name="dueDate" type="date" />
  <button type="submit">추가</button>
</form>

<section>
  <div id="filters"></div>
  <p id="error-message" class="hidden"></p>
  <p id="empty-message">등록된 할 일이 없습니다.</p>
  <ul id="todo-list"></ul>
</section>
```

---

## 추천 개발 순서

초보자는 순서가 매우 중요합니다.  
처음부터 수정, 필터, 예쁜 UI를 한 번에 하려고 하면 거의 항상 꼬입니다.

아래 순서대로 만드세요.

### 1단계. 정적인 HTML 구조 먼저 만들기

아직 API 연결하지 말고 아래를 먼저 만듭니다.

- 회원가입 폼
- 로그인 폼
- 로그인 사용자 정보 영역
- 제목
- 생성 폼
- Todo 목록 `ul`
- 빈 상태 메시지

이 단계 목표는 "화면 뼈대 완성"입니다.

---

### 2단계. DOM 요소 선택하기

JS에서 자주 쓸 요소를 먼저 변수로 잡습니다.

```js
const signupForm = document.querySelector("#signup-form");
const signupUsernameInput = document.querySelector("#signup-username");
const signupPasswordInput = document.querySelector("#signup-password");
const signupNicknameInput = document.querySelector("#signup-nickname");
const loginForm = document.querySelector("#login-form");
const loginUsernameInput = document.querySelector("#login-username");
const loginPasswordInput = document.querySelector("#login-password");
const userInfo = document.querySelector("#user-info");
const form = document.querySelector("#todo-form");
const titleInput = document.querySelector("#title");
const descriptionInput = document.querySelector("#description");
const prioritySelect = document.querySelector("#priority");
const dueDateInput = document.querySelector("#dueDate");
const todoList = document.querySelector("#todo-list");
const emptyMessage = document.querySelector("#empty-message");
const errorMessage = document.querySelector("#error-message");
```

왜 먼저 하냐면, 이후 모든 기능이 이 요소들을 기준으로 움직이기 때문입니다.

---

### 3단계. API 호출 함수 만들기

`fetch` 코드를 한 곳에 모읍니다.

예시

```js
const BASE_URL = "https://api.fullstackfamily.com/api/edu";
const WORKSPACE_SLUG = "본인-slug";

async function request(path, options = {}) {
  const token = localStorage.getItem("todo-token");

  const response = await fetch(`${BASE_URL}/${WORKSPACE_SLUG}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error("API 요청에 실패했습니다.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
```

주의

- 로그인 전 API와 로그인 후 API를 구분해야 합니다.
- 로그인 전에는 `Authorization` 헤더가 없어야 하는 요청도 있습니다.
- Todo API나 `auth/me` 요청에는 토큰이 필요합니다.

조금 더 안전하게 하려면 아래처럼 작성할 수 있습니다.

```js
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
    throw new Error("API 요청에 실패했습니다.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
```

이제 이 `request`를 이용해서 CRUD 함수를 만듭니다.

---

## 로그인 관련 API 호출 방법

### 1. 회원가입 `POST /auth/signup`

```js
async function signup(userData) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}
```

보내는 데이터 예시

```js
{
  username: "testuser01",
  password: "pass1234",
  nickname: "테스트유저"
}
```

검사 포인트

- username: 4~20자 영문/숫자
- password: 4~20자
- nickname: 2~20자

---

### 2. 로그인 `POST /auth/login`

```js
async function login(loginData) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(loginData),
  });
}
```

로그인 성공 응답 예시

```js
{
  token: "JWT 토큰",
  user: {
    id: 1,
    username: "testuser01",
    nickname: "테스트유저",
    createdAt: "2025-01-15T10:30:00"
  }
}
```

로그인에 성공하면 꼭 해야 할 일

1. `token` 저장
2. 사용자 정보 저장 또는 표시
3. Todo 목록 로드

예시

```js
const result = await login({
  username: "testuser01",
  password: "pass1234",
});

localStorage.setItem("todo-token", result.token);
```

---

### 3. 내 정보 조회 `GET /auth/me`

```js
async function getMe() {
  return request("/auth/me", {
    method: "GET",
  });
}
```

이 API는 어디에 쓰면 좋나요?

- 새로고침 후 로그인 상태 확인
- 토큰이 유효한지 확인
- 화면 상단에 사용자 닉네임 표시

예시

```js
async function checkAuth() {
  const token = localStorage.getItem("todo-token");

  if (!token) {
    return null;
  }

  try {
    const user = await getMe();
    userInfo.textContent = `${user.nickname}님 반갑습니다.`;
    return user;
  } catch (error) {
    localStorage.removeItem("todo-token");
    return null;
  }
}
```

---

## API별 호출 방법

### 1. 목록 조회 `GET /todos`

```js
async function getTodos() {
  return request("/todos", {
    method: "GET",
  });
}
```

필터가 필요하면 쿼리스트링을 붙입니다.

```js
async function getTodosByFilter({ completed, priority }) {
  const searchParams = new URLSearchParams();

  if (completed !== "") {
    searchParams.set("completed", completed);
  }

  if (priority !== "") {
    searchParams.set("priority", priority);
  }

  const query = searchParams.toString();
  const path = query ? `/todos?${query}` : "/todos";

  return request(path, {
    method: "GET",
  });
}
```

---

### 2. 생성 `POST /todos`

```js
async function createTodo(todoData) {
  return request("/todos", {
    method: "POST",
    body: JSON.stringify(todoData),
  });
}
```

보내는 데이터 예시

```js
{
  title: "장보기",
  description: "우유와 빵 사기",
  priority: "MEDIUM",
  dueDate: "2026-04-20"
}
```

---

### 3. 수정 `PUT /todos/{id}`

```js
async function updateTodo(id, todoData) {
  return request(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(todoData),
  });
}
```

주의

- 수정 시 `id`가 필요합니다.
- 어떤 항목을 수정하는지 명확하게 알아야 합니다.

---

### 4. 완료 토글 `PATCH /todos/{id}/toggle`

```js
async function toggleTodo(id) {
  return request(`/todos/${id}/toggle`, {
    method: "PATCH",
  });
}
```

이 기능은 체크박스나 완료 버튼과 연결하면 좋습니다.

---

### 5. 삭제 `DELETE /todos/{id}`

```js
async function deleteTodo(id) {
  return request(`/todos/${id}`, {
    method: "DELETE",
  });
}
```

삭제는 응답이 `204 No Content`일 수 있으므로, 응답 바디가 없다는 점을 기억해야 합니다.

---

## DOM 렌더링은 어떻게 해야 하나요?

초보자가 가장 많이 어려워하는 부분이 여기입니다.  
핵심은 "데이터를 받아서 화면을 매번 다시 그린다"입니다.

예시 Todo 데이터

```js
{
  id: 1,
  title: "React 공부하기",
  description: "useState, useEffect 학습",
  completed: false,
  priority: "HIGH",
  dueDate: "2025-01-20"
}
```

### 가장 단순한 렌더링 함수

```js
function renderTodos(todos) {
  todoList.innerHTML = "";

  if (todos.length === 0) {
    emptyMessage.classList.remove("hidden");
    return;
  }

  emptyMessage.classList.add("hidden");

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "rounded-xl bg-stone-100 p-4";

    item.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <p class="text-lg font-semibold text-stone-900">${todo.title}</p>
          <p class="text-sm text-stone-600">${todo.description ?? ""}</p>
          <p class="text-xs text-stone-500">우선순위: ${todo.priority}</p>
        </div>
        <div class="flex gap-2">
          <button data-id="${todo.id}" data-action="toggle" class="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white">
            ${todo.completed ? "완료취소" : "완료"}
          </button>
          <button data-id="${todo.id}" data-action="delete" class="rounded-md bg-rose-500 px-3 py-2 text-sm font-medium text-white">
            삭제
          </button>
        </div>
      </div>
    `;

    todoList.append(item);
  });
}
```

이 함수의 역할은 하나입니다.

- 전달받은 `todos` 배열을 화면에 표시한다.

이 함수 안에서 API를 호출하지 않는 것이 중요합니다.

---

## 페이지가 시작될 때 해야 할 일

페이지가 열리면 먼저 로그인 상태를 확인해야 합니다.  
로그인된 상태라면 그 다음 Todo 목록을 불러옵니다.

```js
async function init() {
  const user = await checkAuth();

  if (user) {
    await loadTodos();
  }
}
```

---

## 회원가입 폼 제출 흐름

1. 기본 제출 막기
2. username, password, nickname 읽기
3. 길이와 형식 검사
4. 회원가입 API 호출
5. 성공 시 로그인 폼으로 유도

예시

```js
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = signupUsernameInput.value.trim();
  const password = signupPasswordInput.value.trim();
  const nickname = signupNicknameInput.value.trim();

  if (!username || !password || !nickname) {
    showError("회원가입 항목을 모두 입력해 주세요.");
    return;
  }

  try {
    await signup({ username, password, nickname });
    showSuccess("회원가입이 완료되었습니다. 이제 로그인해 주세요.");
    signupForm.reset();
  } catch (error) {
    showError(error.message);
  }
});
```

---

## 로그인 폼 제출 흐름

1. 기본 제출 막기
2. username, password 읽기
3. 로그인 API 호출
4. 토큰 저장
5. 사용자 정보 표시
6. Todo 목록 불러오기

예시

```js
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!username || !password) {
    showError("아이디와 비밀번호를 입력해 주세요.");
    return;
  }

  try {
    const result = await login({ username, password });
    localStorage.setItem("todo-token", result.token);
    userInfo.textContent = `${result.user.nickname}님 반갑습니다.`;
    loginForm.reset();
    await loadTodos();
  } catch (error) {
    showError(error.message);
  }
});
```

---

## 로그아웃도 같이 생각하세요

로그아웃 API가 따로 없어도, 학습용 앱에서는 로컬에 저장한 토큰을 지우는 방식으로 처리할 수 있습니다.

```js
function logout() {
  localStorage.removeItem("todo-token");
  userInfo.textContent = "";
  todoList.innerHTML = "";
  emptyMessage.classList.remove("hidden");
}
```

---

## Todo 목록 로드 흐름

로그인 성공 후, 또는 새로고침 후 로그인 상태가 확인되면 Todo 목록을 불러옵니다.

```js
async function loadTodos() {
  try {
    const todos = await getTodos();
    renderTodos(todos);
  } catch (error) {
    showError(error.message);
  }
}
```

그리고 처음 시작 시 실행합니다.

```js
loadTodos();
```

---

## 폼 제출 시 Todo 생성 흐름

폼 제출은 아래 순서로 처리하면 됩니다.

1. 기본 제출 막기
2. 입력값 읽기
3. 유효성 검사
4. POST 요청 보내기
5. 목록 다시 조회
6. 입력값 초기화

예시

```js
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value;

  if (!title) {
    showError("제목은 반드시 입력해야 합니다.");
    return;
  }

  try {
    hideError();

    await createTodo({
      title,
      description,
      priority,
      dueDate: dueDate || null,
    });

    form.reset();
    await loadTodos();
  } catch (error) {
    showError(error.message);
  }
});
```

---

## 완료 토글과 삭제는 어떻게 연결하나요?

Todo 항목이 여러 개이므로 각 버튼에 직접 이벤트를 하나씩 붙이기보다, 목록 전체에 이벤트를 하나 붙이는 방식이 편합니다.  
이것을 이벤트 위임이라고 합니다.

```js
todoList.addEventListener("click", async (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  try {
    hideError();

    if (action === "toggle") {
      await toggleTodo(id);
    }

    if (action === "delete") {
      await deleteTodo(id);
    }

    await loadTodos();
  } catch (error) {
    showError(error.message);
  }
});
```

왜 좋은가?

- 버튼이 몇 개가 생기든 코드가 단순합니다.
- 동적으로 생성된 Todo에도 동작합니다.

---

## 수정 기능은 어떻게 접근하면 좋나요?

수정은 초보자에게 조금 어렵기 때문에 아래 둘 중 하나를 추천합니다.

### 방법 1. 간단한 프롬프트 사용

학습용으로는 빠르게 시도할 수 있습니다.  
하지만 실제 서비스 UI로는 추천하지 않습니다.

### 방법 2. 수정용 폼을 따로 두기

더 권장되는 방법입니다.

흐름

1. 수정 버튼 클릭
2. 해당 Todo 정보를 폼에 채움
3. 현재 수정 중인 `id`를 저장
4. 제출 시 `POST`가 아니라 `PUT` 호출

예시 상태 변수

```js
let editingTodoId = null;
```

이 변수가 `null`이면 생성 모드, 숫자면 수정 모드라고 이해할 수 있습니다.

---

## 에러 메시지는 꼭 보여주세요

API 요청은 언제든 실패할 수 있습니다.  
그래서 화면에 에러를 보여주는 함수가 필요합니다.

```js
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function hideError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}
```

---

## 추천 상태 관리 방식

처음에는 아주 단순하게 시작하세요.

```js
const state = {
  todos: [],
  filters: {
    completed: "",
    priority: "",
  },
  editingTodoId: null,
};
```

이렇게 두면 나중에 필터나 수정 기능을 붙일 때 덜 헷갈립니다.

---

## 추천 파일 분리 예시

```text
src/
  main.js
  style.css
  api/
    todoApi.js
  dom/
    elements.js
    renderTodos.js
  state/
    todoState.js
```

꼭 이 구조여야 하는 것은 아니지만, 한 파일에 모든 것을 몰아넣는 것보다는 훨씬 낫습니다.

---

## 구현 체크리스트

아래 순서대로 하나씩 완료해 보세요.

1. 본인 slug와 토큰 확인
2. 회원가입 폼과 로그인 폼 HTML 완성
3. DOM 요소 선택
4. `signup()` 구현
5. `login()` 구현
6. 로그인 성공 시 토큰 저장
7. `getMe()` 구현
8. 새로고침 시 로그인 상태 확인
9. `getTodos()` 구현
10. 첫 화면에서 목록 렌더링
11. `createTodo()` 구현
12. 폼 제출 연결
13. `toggleTodo()` 구현
14. 완료 버튼 연결
15. `deleteTodo()` 구현
16. 삭제 버튼 연결
17. `updateTodo()` 구현
18. 수정 기능 연결
19. 필터 UI 연결
20. 에러 메시지와 빈 상태 처리

---

## 마지막 조언

Todo 앱은 작아 보여도 초보자에게는 꽤 많은 개념이 한 번에 들어옵니다.

- 회원가입과 로그인
- API 호출
- 비동기 처리
- DOM 선택
- DOM 렌더링
- 이벤트 처리
- 상태 관리
- UI 구조화

그래서 가장 중요한 것은 "한 번에 다 하려 하지 않는 것"입니다.

아래 한 줄을 기억하면 좋습니다.

1. 먼저 로그인 흐름을 만든다.
2. 그 다음 Todo 화면 뼈대를 만든다.
3. 그 다음 데이터를 가져온다.
4. 그 다음 화면에 그린다.
5. 그 다음 버튼과 폼을 연결한다.

이 순서대로 가면 훨씬 덜 꼬입니다.
