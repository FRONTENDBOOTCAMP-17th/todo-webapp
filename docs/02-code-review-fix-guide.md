# 코드리뷰 해결 가이드

## 이 문서의 목적

이 문서는 코드리뷰에서 나온 내용을 "그래서 실제로 어떻게 고치면 되는가?" 관점에서 설명합니다.  
초보 개발자 기준으로, 너무 많은 것을 한 번에 바꾸지 않고 단계적으로 개선하는 방법에 집중합니다.

---

## 가장 먼저 세울 원칙

### 1. HTML, Tailwind, JavaScript의 역할을 나눕니다

- HTML: 화면의 구조를 만듭니다.
- Tailwind: 화면 모양을 만듭니다.
- JavaScript: 데이터를 가져오고, 이벤트를 처리하고, 화면을 바꿉니다.

이 세 역할이 섞이기 시작하면 코드가 금방 복잡해집니다.

---

### 2. CSS는 정말 필요한 만큼만 씁니다

이 프로젝트에서는 CSS를 아예 안 쓰라는 뜻이 아닙니다.  
하지만 대부분의 스타일은 Tailwind로 해결하고, CSS는 공통 레이아웃이나 아주 제한적인 부분만 맡기는 것이 좋습니다.

좋은 예

- `body`의 기본 배경색
- 전체 페이지 정렬
- 정말 여러 곳에서 반복되는 공통 규칙

피해야 하는 예

- 버튼 스타일을 전부 CSS 클래스로 다시 만드는 것
- 카드 스타일을 전부 CSS 파일에 옮기는 것
- Tailwind로 충분히 가능한 것을 굳이 CSS로 작성하는 것

---

## 추천 폴더 구조

처음부터 너무 복잡하게 나눌 필요는 없지만, 최소한 아래 정도는 추천합니다.

```text
src/
  main.js
  style.css
  api/
    todoApi.js
  dom/
    elements.js
    renderTodos.js
  utils/
    formatDate.js
```

설명

- `main.js`: 앱 시작점. 초기 실행, 이벤트 연결
- `api/todoApi.js`: Todo API 요청만 담당
- `dom/elements.js`: 자주 쓰는 DOM 요소를 한 곳에서 관리
- `dom/renderTodos.js`: Todo 목록을 화면에 그리는 역할
- `utils/formatDate.js`: 날짜 표시처럼 작은 공통 함수

이렇게 나누면 응집도는 높아지고 결합도는 낮아집니다.

---

## HTML은 이렇게 바꾸는 것이 좋습니다

현재는 입력창 하나만 있지만, API 스펙상 제목, 설명, 우선순위, 마감일을 다룰 수 있습니다.  
처음부터 너무 완벽할 필요는 없지만, 최소한 확장 가능한 구조로 만드는 것이 중요합니다.

추천 예시

```html
<div id="app" class="mx-auto min-h-screen max-w-3xl px-4 py-10">
  <section class="rounded-2xl bg-stone-700 p-6 shadow-lg">
    <h1 class="text-3xl font-bold text-white">Todo List</h1>

    <form id="todo-form" class="mt-6 grid gap-4">
      <div class="grid gap-2">
        <label for="title" class="text-sm font-medium text-stone-100">제목</label>
        <input id="title" name="title" type="text" class="rounded-lg bg-white px-3 py-2" />
      </div>

      <div class="grid gap-2">
        <label for="description" class="text-sm font-medium text-stone-100">설명</label>
        <textarea id="description" name="description" class="rounded-lg bg-white px-3 py-2"></textarea>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="grid gap-2">
          <label for="priority" class="text-sm font-medium text-stone-100">우선순위</label>
          <select id="priority" name="priority" class="rounded-lg bg-white px-3 py-2">
            <option value="LOW">낮음</option>
            <option value="MEDIUM" selected>보통</option>
            <option value="HIGH">높음</option>
          </select>
        </div>

        <div class="grid gap-2">
          <label for="dueDate" class="text-sm font-medium text-stone-100">마감일</label>
          <input id="dueDate" name="dueDate" type="date" class="rounded-lg bg-white px-3 py-2" />
        </div>
      </div>

      <button type="submit" class="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-stone-950">
        할 일 추가
      </button>
    </form>

    <p id="error-message" class="mt-4 hidden text-sm text-red-300"></p>
    <p id="empty-message" class="mt-4 text-sm text-stone-300">등록된 할 일이 없습니다.</p>

    <ul id="todo-list" class="mt-6 grid gap-3"></ul>
  </section>

  <template id="todo-item-template">
    <li class="rounded-xl bg-stone-100 p-4">
      Todo 항목
    </li>
  </template>
</div>
```

핵심 포인트

- 목록을 담는 `ul`은 한 번만 만듭니다.
- 반복되는 항목은 `template` 안의 `li`로 만듭니다.
- 메시지 영역을 미리 만들어 두면 JS가 단순해집니다.

---

## JavaScript는 이렇게 나누면 좋습니다

### 1. `api/todoApi.js`

여기에는 `fetch`만 둡니다.

예시

```js
const BASE_URL = "https://api.fullstackfamily.com/api/edu";
const WORKSPACE_SLUG = "여기에-본인-slug";
const TOKEN = "여기에-본인-토큰";

function request(path, options = {}) {
  return fetch(`${BASE_URL}/${WORKSPACE_SLUG}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...options.headers,
    },
  });
}

export async function getTodos() {
  const response = await request("/todos");
  if (!response.ok) {
    throw new Error("할 일 목록을 불러오지 못했습니다.");
  }
  return response.json();
}
```

중요한 이유

- API 주소가 한 파일에만 모입니다.
- 나중에 주소나 토큰 처리 방식이 바뀌어도 수정 범위가 줄어듭니다.

---

### 2. `dom/elements.js`

DOM 요소를 한 번에 모읍니다.

```js
export const elements = {
  form: document.querySelector("#todo-form"),
  titleInput: document.querySelector("#title"),
  descriptionInput: document.querySelector("#description"),
  prioritySelect: document.querySelector("#priority"),
  dueDateInput: document.querySelector("#dueDate"),
  todoList: document.querySelector("#todo-list"),
  emptyMessage: document.querySelector("#empty-message"),
  errorMessage: document.querySelector("#error-message"),
  itemTemplate: document.querySelector("#todo-item-template"),
};
```

좋은 점

- `document.querySelector`가 여기저기 흩어지지 않습니다.
- 요소 이름이 분명해집니다.

---

### 3. `dom/renderTodos.js`

렌더링만 담당하게 만드세요.

```js
import { elements } from "./elements";

export function renderTodos(todos) {
  elements.todoList.innerHTML = "";

  if (todos.length === 0) {
    elements.emptyMessage.classList.remove("hidden");
    return;
  }

  elements.emptyMessage.classList.add("hidden");

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "rounded-xl bg-stone-100 p-4";
    item.textContent = todo.title;
    elements.todoList.append(item);
  });
}
```

핵심

- 이 파일은 "그리기"만 알아야 합니다.
- API 호출까지 알면 책임이 섞입니다.

---

### 4. `main.js`

`main.js`는 전체 흐름만 관리합니다.

예시 흐름

```js
import "./style.css";
import { getTodos } from "./api/todoApi";
import { elements } from "./dom/elements";
import { renderTodos } from "./dom/renderTodos";

async function loadTodos() {
  const todos = await getTodos();
  renderTodos(todos);
}

function bindEvents() {
  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    // 생성 API 호출
    // 다시 목록 조회
  });
}

async function init() {
  bindEvents();
  await loadTodos();
}

init();
```

핵심

- 시작 파일은 흐름만 관리합니다.
- 세부 구현은 다른 파일에 맡깁니다.

---

## 초보자가 특히 자주 하는 실수

### 1. `main.js` 한 파일에 모든 것을 넣는 실수

처음에는 편해 보여도 기능이 늘수록 가장 빨리 무너집니다.

### 2. HTML 문자열을 여러 함수에서 중복해서 만드는 실수

렌더링 규칙은 한 곳에 모아야 합니다.

### 3. API 주소를 여러 파일에 복붙하는 실수

`todoApi.js` 같은 파일 한 곳에 모으세요.

### 4. 성공/실패 처리를 안 하는 실수

`fetch`는 요청이 실패할 수 있습니다.  
`response.ok` 확인과 에러 메시지 표시가 꼭 필요합니다.

### 5. Tailwind 대신 CSS로 다시 돌아가는 실수

조금만 복잡해져도 CSS 파일에 다 몰아넣고 싶어질 수 있습니다.  
하지만 이 프로젝트 목표가 Tailwind 활용이라면, 먼저 Tailwind로 해결할 수 있는지 생각해야 합니다.

---

## 실제 개선 순서 추천

1. 로그인/회원가입 화면 구조 정리
2. `elements.js` 만들기
3. `authApi.js` 만들기
4. 로그인 성공 시 토큰 저장 흐름 만들기
5. `todoApi.js` 만들기
6. `renderTodos.js` 만들기
7. 페이지 로드 시 `auth/me` 확인
8. 로그인 상태라면 목록 조회
9. 폼 제출 시 Todo 생성
10. 완료 토글 기능 추가
11. 삭제 기능 추가
12. 수정 기능 추가
13. 필터 기능 추가

이 순서를 추천하는 이유는, 한 번에 너무 많은 문제를 풀지 않게 해주기 때문입니다.

---

## 최종 목표

아래처럼 되면 좋은 구조입니다.

- HTML은 읽기 쉽다.
- Tailwind 클래스만 봐도 대략 어떤 UI인지 알 수 있다.
- CSS는 매우 적다.
- API 코드는 한곳에 있다.
- 렌더링 코드는 한곳에 있다.
- `main.js`는 전체 흐름만 관리한다.

이 상태가 되면 응집도는 올라가고, 결합도는 내려갑니다.
