const { response } = require("express");

if ("serviceWorker" in navigator) {
  console.log("Service worker navigated.");
  window.addEventListener("load", function(){
    navigator.serviceWorker.register("/service-worker.js")
    .then(function(register){
      console.log(register);
      console.log("Service Worker was registered.");
    }).catch(function(error){
      console.log(error);
    });
  });
};

let transactions = [];
let myChart;

fetch("/api/transaction")
.then(response => {
    return response.json();

  })
  .then(data => {
    readDatabase();
    if (data.lenth > 0) {
    // save db data on global variable
    transactions = data;
    populateTotal();
    populateTable();
    populateChart();
    return data;
    } else {
      $('#clear-all-data').hide();
    }
  })
  .catch(err => {
    //Failed to fetch data. Run readDatabase(); function.
    readDatabase();
  });

function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
      data: {
        labels,
        datasets: [{
            label: "Total Over Time",
            fill: true,
            backgroundColor: "#6666ff",
            data
        }]
    }
  });
  $('#clear-all-data').show();
}

function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();

  // also send to server
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    if (data.errors) {
      errorEl.textContent = "Missing Information";
    }
    else {
      // clear form
      nameEl.value = "";
      amountEl.value = "";
    }
  })
  .catch(err => {
    // fetch failed, so save in indexed db
    saveRecord(transaction);

    // clear form
    nameEl.value = "";
    amountEl.value = "";
  });
}

document.querySelector("#add-btn").onclick = function() {
  event.preventDefault();
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
  event.preventDefault();
  sendTransaction(false);
};

async function clearData() {
  const clearData = confirm("WARNING: Are you sure you want to delete all budget data?!?");

  //If user presses ok.
  if (clearData) {
    $('#clear-all-transactions').hide();

  try {
    const deleted = await fetch("/api/deleteAll", {
      method: "DELETE"
    });
    res.json(deleted);
  } catch (err) {
    clearData();
  }
  }
}