const form = document.querySelector("#form-input");
const input = document.querySelector("#input");
const list = document.querySelector(".tasks-list");
const filterOptions = document.querySelectorAll(".list-item");

let todoItems = [];
let completedItems = [];

const setLocalStorage = function () {
  localStorage.setItem("todoItems", JSON.stringify(todoItems));
  localStorage.setItem("completedItems", JSON.stringify(completedItems));
};

const getItemsLocalStorage = function () {
  const tasks = localStorage.getItem("todoItems");
  const completedTasks = localStorage.getItem("completedItems");
  todoItems = tasks ? JSON.parse(tasks) : [];
  completedItems = completedTasks ? JSON.parse(completedTasks) : [];
  renderList("all");
};

const renderList = function (filter) {
  list.innerHTML = "";
  let itemsToRender = [];
  if (filter === "all") {
    itemsToRender = [...todoItems, ...completedItems];
  } else if (filter === "todo") {
    itemsToRender = todoItems;
  } else if (filter === "completed") {
    itemsToRender = completedItems;
  }

  if (itemsToRender.length > 0) {
    itemsToRender.forEach((item, index) => {
      const isCompleted = completedItems.includes(item);
      let liTag = `
      <li class="tasks-list-item ${isCompleted ? "completed" : "todo"}">
        <span contenteditable="false">${item.name}</span>
        <div class="icons">
          <i class="fa-regular fa-square-check completedIcon" data-index="${index}" data-filter="${filter}"></i>
          <i class="fa-regular fa-pen-to-square editIcon" data-index="${index}" data-filter="${filter}"></i>
          <i class="fa-solid fa-trash-can deleteIcon" data-index="${index}" data-filter="${filter}"></i>
        </div>
      </li>`;
      list.insertAdjacentHTML("beforeend", liTag);
    });
  } else {
    list.innerHTML = "<p>No tasks available.</p>";
  }
};

const deleteTask = function (index, filter) {
  if (filter === "all") {
    if (index < todoItems.length) {
      todoItems.splice(index, 1);
    } else {
      completedItems.splice(index - todoItems.length, 1);
    }
  } else if (filter === "todo") {
    todoItems.splice(index, 1);
  } else if (filter === "completed") {
    completedItems.splice(index, 1);
  }
  setLocalStorage();
  renderList(filter);
};

const completeTask = function (index, filter) {
  if (filter === "todo") {
    const completedTask = todoItems.splice(index, 1)[0];
    completedItems.push(completedTask);
  } else if (filter === "all") {
    if (index < todoItems.length) {
      const completedTask = todoItems.splice(index, 1)[0];
      completedItems.push(completedTask);
    } else {
      const idx = index - todoItems.length;
      const todoTask = completedItems.splice(idx, 1)[0];
      todoItems.push(todoTask);
    }
  }
  setLocalStorage();
  renderList(filter);
};

const editTask = function (index, filter) {
  const taskItem = list.querySelectorAll(".tasks-list-item")[index];
  const taskSpan = taskItem.querySelector("span");

  if (taskSpan.contentEditable === "true") {
    taskSpan.contentEditable = "false";
    if (filter === "todo") {
      todoItems[index].name = taskSpan.innerText;
    } else if (filter === "completed") {
      completedItems[index].name = taskSpan.innerText;
    } else if (filter === "all") {
      if (index < todoItems.length) {
        todoItems[index].name = taskSpan.innerText;
      } else {
        completedItems[index - todoItems.length].name = taskSpan.innerText;
      }
    }
    setLocalStorage();
  } else {
    taskSpan.contentEditable = "true";
    taskSpan.focus();
  }
};

const handleKeyPress = function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    const taskItem = event.target.closest(".tasks-list-item");
    const index = Array.from(list.querySelectorAll(".tasks-list-item")).indexOf(
      taskItem
    );
    const filter = taskItem
      .querySelector(".completedIcon")
      .getAttribute("data-filter");
    editTask(index, filter);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const itemName = input.value.trim();
    if (itemName.length === 0) {
      alert("Please enter a task!");
    } else {
      const itemObj = {
        name: itemName,
        isDone: false,
        addedAt: new Date().getTime(),
      };
      todoItems.push(itemObj);
      setLocalStorage();
      renderList("all");
      input.value = "";
    }
  });

  list.addEventListener("click", (event) => {
    const index = event.target.getAttribute("data-index");
    const filter = event.target.getAttribute("data-filter");
    if (event.target.classList.contains("deleteIcon")) {
      deleteTask(index, filter);
    } else if (event.target.classList.contains("completedIcon")) {
      completeTask(index, filter);
    } else if (event.target.classList.contains("editIcon")) {
      editTask(index, filter);
    }
  });

  list.addEventListener("keydown", handleKeyPress);

  filterOptions.forEach((option) => {
    option.addEventListener("click", (event) => {
      filterOptions.forEach((opt) =>
        opt.querySelector("a").classList.remove("active")
      );
      event.target.classList.add("active");
      renderList(event.currentTarget.getAttribute("data-type"));
    });
  });

  getItemsLocalStorage();
});
