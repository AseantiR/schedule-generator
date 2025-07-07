const associates = [
  "Aseanti", "Fredrick", "Anna R", "Anna G", "Dora",
  "Kendrick", "Chris", "Cathy", "Cathy.", "Angel", "Erik",
  "Backup 1", "Backup 2"
];

const workAreas = {
  phase1: [
    "E & F Dock",
    "G Dock",
    "H Dock",
    "1581 & Chases",
    "171 (Cycle Count)",
    "Profiler"
  ],
  phase2: [
    "A & B Dock",
    "C Dock",
    "D Dock",
    "1581",
    "Chases",
    "171 (Cycle Count)",
    "Profiler"
  ]
};

const associatesList = document.getElementById("associatesList");
const phase1List = document.getElementById("phase1List");
const phase2List = document.getElementById("phase2List");
const randomAssignBtn = document.getElementById("randomAssignBtn");
let draggedItem = null;

function isCathy(name) {
  return name.toLowerCase() === "cathy" || name.toLowerCase() === "cathy.";
}

function createAssociateItem(name) {
  const li = document.createElement("li");
  li.className = "associate-item";
  li.draggable = true;
  li.textContent = name;
  li.classList.add("associate-name");

  // Add checkmark span (hidden initially)
  const checkmark = document.createElement("span");
  checkmark.className = "assigned-checkmark";
  checkmark.textContent = " ✔";
  checkmark.style.color = "green";
  checkmark.style.fontWeight = "bold";
  checkmark.style.display = "none";
  li.appendChild(checkmark);

  li.addEventListener("dragstart", () => {
    draggedItem = li;
    li.classList.add("dragging");
  });

  li.addEventListener("dragend", () => {
    draggedItem = null;
    li.classList.remove("dragging");
  });

  return li;
}

function createWorkAreaItem(areaName) {
  const li = document.createElement("li");
  li.className = "workarea-item";

  const spanArea = document.createElement("span");
  spanArea.className = "workarea-name";
  spanArea.textContent = areaName;

  // Container for multiple assigned associates
  const assignedContainer = document.createElement("div");
  assignedContainer.className = "assigned-container";

  li.appendChild(spanArea);
  li.appendChild(assignedContainer);

  li.addEventListener("dragover", (e) => {
    e.preventDefault();
    li.style.backgroundColor = "#dbeafe";
  });

  li.addEventListener("dragleave", () => {
    li.style.backgroundColor = "";
  });

  li.addEventListener("drop", () => {
    li.style.backgroundColor = "";
    if (draggedItem) {
      const name = draggedItem.textContent;

      // Cathy restriction: only assign Cathy(s) to Profiler
      if (isCathy(name) && !areaName.toLowerCase().includes("profiler")) {
        alert(`${name} can only be assigned to Profiler.`);
        return;
      }

      // Check if already assigned here
      const assignedNames = [...assignedContainer.children].map(child => child.querySelector(".assigned-name").textContent);
      if (assignedNames.includes(name)) {
        alert(`${name} is already assigned here.`);
        return;
      }

      // Remove from other work areas (but DO NOT remove from associates list)
      removeAssociateFromWorkAreas(name);

      // Create assigned associate element with remove button
      const assignedAssociate = document.createElement("div");
      assignedAssociate.className = "assigned-associate-item";

      const assignedName = document.createElement("span");
      assignedName.className = "assigned-name";
      assignedName.textContent = name;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "❌";
      removeBtn.className = "remove-btn";
      removeBtn.addEventListener("click", () => {
        assignedContainer.removeChild(assignedAssociate);
        updateCheckmarks();
      });

      assignedAssociate.appendChild(assignedName);
      assignedAssociate.appendChild(removeBtn);

      assignedContainer.appendChild(assignedAssociate);

      updateCheckmarks();
    }
  });

  return li;
}

// Remove assigned associate from all work areas, but NOT from associates list
function removeAssociateFromWorkAreas(name) {
  [phase1List, phase2List].forEach(list => {
    [...list.children].forEach(workLi => {
      const assignedContainer = workLi.querySelector(".assigned-container");
      if (!assignedContainer) return;

      [...assignedContainer.children].forEach(assignedDiv => {
        const assignedName = assignedDiv.querySelector(".assigned-name").textContent;
        if (assignedName === name) {
          assignedContainer.removeChild(assignedDiv);
        }
      });
    });
  });
}

function addAssociateToList(name) {
  // We always keep associates list fully populated — only create if missing
  const exists = [...associatesList.children].some(li => li.firstChild.textContent === name);
  if (!exists) {
    associatesList.appendChild(createAssociateItem(name));
  }
  updateCheckmarks();
}

function updateCheckmarks() {
  // Gather all assigned associate names from work areas
  let assignedNamesSet = new Set();

  [phase1List, phase2List].forEach(list => {
    [...list.children].forEach(workLi => {
      const assignedContainer = workLi.querySelector(".assigned-container");
      if (!assignedContainer) return;
      [...assignedContainer.children].forEach(assignedDiv => {
        const assignedName = assignedDiv.querySelector(".assigned-name").textContent;
        assignedNamesSet.add(assignedName);
      });
    });
  });

  // Update checkmarks in associates list
  [...associatesList.children].forEach(li => {
    const name = li.firstChild.textContent;
    const checkmark = li.querySelector(".assigned-checkmark");
    if (assignedNamesSet.has(name)) {
      checkmark.style.display = "inline";
    } else {
      checkmark.style.display = "none";
    }
  });
}

function init() {
  // Populate associates list (all associates, all the time)
  associatesList.innerHTML = "";
  associates.forEach(name => {
    associatesList.appendChild(createAssociateItem(name));
  });

  workAreas.phase1.forEach(area => {
    phase1List.appendChild(createWorkAreaItem(area));
  });

  workAreas.phase2.forEach(area => {
    phase2List.appendChild(createWorkAreaItem(area));
  });

  associatesList.addEventListener("dragover", (e) => {
    e.preventDefault();
    associatesList.style.backgroundColor = "#d1eaff";
  });

  associatesList.addEventListener("dragleave", () => {
    associatesList.style.backgroundColor = "";
  });

  associatesList.addEventListener("drop", () => {
    associatesList.style.backgroundColor = "";
    if (draggedItem) {
      const name = draggedItem.textContent;
      // Only remove from work areas, NOT associates list
      removeAssociateFromWorkAreas(name);
      updateCheckmarks();
    }
  });

  updateCheckmarks();
}

function randomAssign() {
  // Clear all assigned associates in work areas
  [phase1List, phase2List].forEach(list => {
    [...list.children].forEach(workLi => {
      const assignedContainer = workLi.querySelector(".assigned-container");
      if (assignedContainer) {
        assignedContainer.innerHTML = "";
      }
    });
  });

  // Note: associates list stays fully populated and unchanged!

  // Prepare assignable associates excluding backups for random assign
  const nonBackupAssociates = associates.filter(name => !name.toLowerCase().startsWith("backup"));

  const allWorkAreas = [...phase1List.children, ...phase2List.children];

  // Collect Profiler areas for Cathy(s)
  let profilerAreas = allWorkAreas.filter(areaLi =>
    areaLi.querySelector(".workarea-name").textContent.toLowerCase().includes("profiler")
  );

  let assignedProfilerIndex = 0;
  let assignedOtherIndex = 0;

  for (let i = 0; i < nonBackupAssociates.length; i++) {
    const name = nonBackupAssociates[i];

    if (isCathy(name)) {
      // Assign Cathy only to Profiler if any spots left
      if (assignedProfilerIndex < profilerAreas.length) {
        const workLi = profilerAreas[assignedProfilerIndex];
        const assignedContainer = workLi.querySelector(".assigned-container");

        const assignedAssociate = document.createElement("div");
        assignedAssociate.className = "assigned-associate-item";

        const assignedName = document.createElement("span");
        assignedName.className = "assigned-name";
        assignedName.textContent = name;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "❌";
        removeBtn.className = "remove-btn";
        removeBtn.addEventListener("click", () => {
          assignedContainer.removeChild(assignedAssociate);
          updateCheckmarks();
        });

        assignedAssociate.appendChild(assignedName);
        assignedAssociate.appendChild(removeBtn);

        assignedContainer.appendChild(assignedAssociate);
        updateCheckmarks();

        assignedProfilerIndex++;
      }
      // If no profiler spots left, Cathy won’t be assigned randomly
    } else {
      // Assign non-Cathy associates to non-profiler areas only
      const nonProfilerAreas = allWorkAreas.filter(areaLi =>
        !areaLi.querySelector(".workarea-name").textContent.toLowerCase().includes("profiler")
      );

      if (assignedOtherIndex < nonProfilerAreas.length) {
        const workLi = nonProfilerAreas[assignedOtherIndex];
        const assignedContainer = workLi.querySelector(".assigned-container");

        const assignedAssociate = document.createElement("div");
        assignedAssociate.className = "assigned-associate-item";

        const assignedName = document.createElement("span");
        assignedName.className = "assigned-name";
        assignedName.textContent = name;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "❌";
        removeBtn.className = "remove-btn";
        removeBtn.addEventListener("click", () => {
          assignedContainer.removeChild(assignedAssociate);
          updateCheckmarks();
        });

        assignedAssociate.appendChild(assignedName);
        assignedAssociate.appendChild(removeBtn);

        assignedContainer.appendChild(assignedAssociate);
        updateCheckmarks();

        assignedOtherIndex++;
      }
      // If no spots left, associate won’t be assigned randomly
    }
  }
}

randomAssignBtn.addEventListener("click", randomAssign);
window.onload = init;
const resetBtn = document.getElementById("resetBtn");

function resetSchedule() {
  // Clear all assigned associates in all work areas
  [phase1List, phase2List].forEach(list => {
    [...list.children].forEach(workLi => {
      const assignedContainer = workLi.querySelector(".assigned-container");
      if (assignedContainer) {
        assignedContainer.innerHTML = "";
      }
    });
  });

  // Reset associates list to include ALL associates (no checkmarks)
  associatesList.innerHTML = "";
  associates.forEach(name => {
    associatesList.appendChild(createAssociateItem(name));
  });

  updateCheckmarks();
}

resetBtn.addEventListener("click", resetSchedule);
