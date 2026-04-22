import { todoList, emptyMessage } from "./elements.js";

const PRIORITY_COLOR = { HIGH: "#f87171", MEDIUM: "#fbbf24", LOW: "#34d399" };

export function renderTodos(todos) {
  todoList.innerHTML = "";

  if (todos.length === 0) {
    emptyMessage.classList.remove("hidden");
    return;
  }

  emptyMessage.classList.add("hidden");

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = `flex items-center justify-between bg-neutral-800 rounded-2xl px-4 py-3 gap-3 ${todo.completed ? "opacity-50" : ""}`;

    const priorityDot = `<span style="color:${PRIORITY_COLOR[todo.priority] ?? "#aaa"}" class="text-xs">●</span>`;

    item.innerHTML = `
      <button data-id="${todo.id}" data-action="toggle"
        class="shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-700 transition-colors">
        <img src="/src/svg/check.svg" alt="완료"
          class="w-5 h-5 transition-opacity ${todo.completed ? "opacity-100" : "opacity-30"}" />
      </button>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate ${todo.completed ? "line-through text-neutral-500" : "text-white"}">
          ${escapeHtml(todo.title)}
        </p>
        ${todo.description ? `<p class="text-xs text-neutral-500 truncate mt-0.5">${escapeHtml(todo.description)}</p>` : ""}
        <div class="flex items-center gap-2 mt-0.5">
          ${priorityDot}
          ${todo.dueDate ? `<span class="text-xs text-neutral-600">${todo.dueDate}</span>` : ""}
        </div>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <button data-id="${todo.id}" data-action="edit"
          class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-700 transition-colors">
          <img src="/src/svg/edit.svg" alt="수정" class="w-4 h-4" />
        </button>
        <button data-id="${todo.id}" data-action="delete"
          class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-700 transition-colors">
          <img src="/src/svg/delete.svg" alt="삭제" class="w-4 h-4" />
        </button>
      </div>
    `;

    todoList.append(item);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
