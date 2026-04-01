let currentData = [];
let currentHeaders = [];
let currentFileName = "";

// Cache per table
let tableCache = {};

// DOM elements
const tableContainer = document.getElementById("tableContainer");
const searchInput = document.getElementById("searchInput");
const currentTableLabel = document.getElementById("currentTable");

//
// 🔄 LOAD TABLE
//
async function loadTable(file) {
  currentFileName = file;

  document.getElementById("csvFileInput").value = "";
  searchInput.value = "";

  if (tableCache[file]) {
    currentHeaders = tableCache[file].headers;
    currentData = tableCache[file].data;
    renderTable();
    return;
  }

  const response = await fetch(file);
  if (!response.ok) {
    alert("Failed to load " + file);
    return;
  }

  const text = await response.text();
  const rows = text.trim().split("\n");

  currentHeaders = rows[0].split(",");
  currentData = rows.slice(1).map(r => r.split(","));

  updateCache();
  renderTable();
}

//
// 💾 CACHE
//
function updateCache() {
  if (currentFileName) {
    tableCache[currentFileName] = {
      headers: currentHeaders,
      data: currentData
    };
  }
}

//
// 🧱 RENDER TABLE
//
function renderTable(filteredData = null) {
  tableContainer.innerHTML = "";

  currentTableLabel.innerText = currentFileName
    ? "Editing: " + currentFileName
    : "No table loaded";

  currentTableLabel.style.color = "#F7AB55";

  const dataToRender = filteredData || currentData;

  if (!currentHeaders.length) return;

  let table = document.createElement("table");

  // HEADER
  let thead = document.createElement("thead");
  let headerRow = document.createElement("tr");

  currentHeaders.forEach((h, i) => {
    let th = document.createElement("th");
    th.innerText = i === 0 ? h + " (PK)" : h;
    headerRow.appendChild(th);
  });

  let delTh = document.createElement("th");
  delTh.innerText = "Delete";
  headerRow.appendChild(delTh);

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // BODY
  let tbody = document.createElement("tbody");

  dataToRender.forEach((row) => {
    let tr = document.createElement("tr");

    row.forEach((cell, colIndex) => {
      let td = document.createElement("td");

      td.contentEditable = colIndex !== 0;
      td.innerText = cell;

      td.oninput = () => {
        // 🔥 Find real row via PK
        let pk = row[0];
        let realIndex = currentData.findIndex(r => r[0] === pk);

        if (realIndex !== -1) {
          currentData[realIndex][colIndex] = td.innerText;
          updateCache();
        }
      };

      tr.appendChild(td);
    });

    // DELETE BUTTON (🔥 FIXED)
    let actionTd = document.createElement("td");

    let delBtn = document.createElement("button");
    delBtn.innerText = "Remove";
    delBtn.classList.add("delete-btn");

    delBtn.onclick = () => {
      deleteRowByPK(row[0]); // 🔥 USE PRIMARY KEY
    };

    actionTd.appendChild(delBtn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableContainer.appendChild(table);

  // ADD ROW BUTTON
  const addBtn = document.createElement("button");
  addBtn.innerText = "+ Add Row";
  addBtn.classList.add("add-btn");
  addBtn.onclick = addRow;

  tableContainer.appendChild(document.createElement("br"));
  tableContainer.appendChild(addBtn);
}

//
// ❌ DELETE USING PRIMARY KEY (🔥 FIX)
//
function deleteRowByPK(pk) {
  const index = currentData.findIndex(row => row[0] === pk);

  if (index !== -1) {
    currentData.splice(index, 1);
    updateCache();
    renderTable();
  }
}

//
// ➕ ADD ROW
//
function addRow() {
  let newRow = currentHeaders.map(() => "");

  if (currentData.length > 0) {
    let lastId = parseInt(currentData[currentData.length - 1][0]) || 0;
    newRow[0] = (lastId + 1).toString();
  } else {
    newRow[0] = "1";
  }

  currentData.push(newRow);
  updateCache();
  renderTable();
}

//
// 💾 DOWNLOAD CSV
//
function downloadCSV() {
  if (!currentFileName) {
    alert("No table loaded!");
    return;
  }

  let csv = currentHeaders.join(",") + "\n";
  currentData.forEach(r => csv += r.join(",") + "\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = currentFileName;
  a.click();
}

//
// 📂 IMPORT CSV
//
function importCSV() {
  const fileInput = document.getElementById("csvFileInput");

  if (!fileInput.files.length) {
    alert("Choose a CSV first.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const rows = e.target.result.trim().split("\n");

    currentHeaders = rows[0].split(",");
    currentData = rows.slice(1).map(r => r.split(","));

    updateCache();
    renderTable();

    alert("CSV imported successfully!");
  };

  reader.readAsText(file);
}

//
// 🔍 SEARCH (works with PK system now)
//
searchInput.oninput = function() {
  const val = searchInput.value.toLowerCase();

  const filtered = currentData.filter(row =>
    row.some(cell => cell.toLowerCase().includes(val))
  );

  renderTable(filtered);
};

//
// 🫧 BUBBLES
//
function createBubbles() {
  const container = document.querySelector(".bubbles");

  for (let i = 0; i < 20; i++) {
    const bubble = document.createElement("img");
    bubble.src = "assets/bubble.png";

    bubble.style.left = Math.random() * 100 + "vw";
    bubble.style.animationDuration = (5 + Math.random() * 10) + "s";
    bubble.style.width = (20 + Math.random() * 40) + "px";

    container.appendChild(bubble);
  }
}

window.onload = () => {
  createBubbles();
};