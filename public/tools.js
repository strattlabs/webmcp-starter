// WebMCP Starter — registering page features as agent-callable tools.
//
// The pattern: keep your app logic UI-agnostic, then register thin WebMCP tools
// that call the same logic a human's clicks would. An agent and a person drive
// the identical underlying actions.
//
// API reference (verify against the current origin trial — it is evolving):
// https://developer.chrome.com/docs/ai/webmcp/imperative-api

/** @typedef {{ id: number, task: string, done: boolean }} Todo */

/** @type {Todo[]} */
const todos = [];
let nextId = 1;

const listEl = /** @type {HTMLUListElement} */ (document.getElementById('todo-list'));
const formEl = /** @type {HTMLFormElement} */ (document.getElementById('add-form'));
const inputEl = /** @type {HTMLInputElement} */ (document.getElementById('todo-input'));

// --- Domain logic (UI-agnostic) ---------------------------------------------

/** @param {string} task */
function addTodo(task) {
  const trimmed = task.trim();
  if (trimmed === '') throw new Error('Task must not be empty.');
  const todo = { id: nextId++, task: trimmed, done: false };
  todos.push(todo);
  render();
  return todo;
}

/** @param {number} id */
function completeTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) throw new Error(`No to-do with id ${id}.`);
  todo.done = true;
  render();
  return todo;
}

function render() {
  listEl.replaceChildren(
    ...todos.map((t) => {
      const li = document.createElement('li');
      li.dataset.id = String(t.id);
      li.classList.toggle('done', t.done);

      const label = document.createElement('span');
      label.textContent = `#${t.id} ${t.task}`;
      li.append(label);

      if (!t.done) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Done';
        btn.addEventListener('click', () => completeTodo(t.id));
        li.append(btn);
      }
      return li;
    }),
  );
}

// --- Human UI ----------------------------------------------------------------

formEl.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    addTodo(inputEl.value);
    inputEl.value = '';
    inputEl.focus();
  } catch {
    // Native required-field validation already guards the empty case.
  }
});

// --- WebMCP tool registration ------------------------------------------------

// `document.modelContext` is current; `navigator.modelContext` was the earlier
// surface (deprecated in Chrome 150). Feature-detect both so the page still
// works cleanly when WebMCP is unavailable.
const modelContext = document.modelContext ?? navigator.modelContext;
const statusEl = document.getElementById('webmcp-status');

if (modelContext && typeof modelContext.registerTool === 'function') {
  modelContext.registerTool({
    name: 'add_todo',
    description: 'Add a new task to the to-do list.',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'The task text, e.g. "Buy milk".' },
      },
      required: ['task'],
    },
    annotations: { readOnlyHint: false },
    // The handler returns a short string describing what happened, which the
    // agent relays to its principal.
    execute: async ({ task }) => {
      const todo = addTodo(task);
      return `Added to-do #${todo.id}: ${todo.task}`;
    },
  });

  modelContext.registerTool({
    name: 'list_todos',
    description: 'List all to-do items and whether each is done.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      if (todos.length === 0) return 'The to-do list is empty.';
      return todos.map((t) => `#${t.id} [${t.done ? 'x' : ' '}] ${t.task}`).join('\n');
    },
  });

  modelContext.registerTool({
    name: 'complete_todo',
    description: 'Mark a to-do item as done by its id.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'number', description: 'The id shown as "#<id>".' } },
      required: ['id'],
    },
    annotations: { readOnlyHint: false },
    execute: async ({ id }) => {
      const todo = completeTodo(id);
      return `Completed to-do #${todo.id}: ${todo.task}`;
    },
  });

  if (statusEl) {
    statusEl.textContent = 'WebMCP detected — 3 tools registered (add_todo, list_todos, complete_todo).';
    statusEl.classList.add('ok');
  }
} else if (statusEl) {
  statusEl.textContent =
    'WebMCP not available in this browser. Enable the Chrome origin trial (see README) to expose the tools. The list still works normally.';
  statusEl.classList.add('warn');
}

// Seed one item so the page isn't empty on first load.
addTodo('Try the add_todo tool from an agent');
