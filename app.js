document.addEventListener("DOMContentLoaded", () => {
  const qrInput = document.getElementById("qrInput");
  const nameInput = document.getElementById("nameInput");
  const printButton = document.getElementById("printButton");
  const printCButton = document.getElementById("printCButton");
  const errMsgLabel = document.getElementById("errMsg");
  const apiKey = "AIzaSyDR_nU82c3AiRczmE6H5MjuKWQaHAfZZp4";
  const sheetId = "168iifOQrElMOl4b-iMAemMHzdRx0DbLNLdUW7aTVRE0";
  let attendees = {};

  // Fetch Google Sheets data
  fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      const rows = data.values;
      // Assume first row contains headers
      const headers = rows[0];
      const codeIndex = headers.indexOf("Code");
      const nameIndex = headers.indexOf("Name");
      rows.slice(1).forEach((row) => {
        attendees[row[codeIndex]] = row[nameIndex];
      });
    })
    .catch((err) => console.error(err));

  qrInput.addEventListener("input", () => {
    const code = qrInput.value.trim();
    if (!code.includes(",")) {
      if (attendees[code]) {
        nameInput.value = attendees[code];
      } else {
        nameInput.value = "Guest";
      }
    } else {
      const extractedCode = code.split(",")[0];
      if (attendees[extractedCode]) {
        nameInput.value = attendees[extractedCode];
      } else if (extractedCode) {
        let temp = code.split(",").slice(1).join();
        if (temp.includes(",")) {
          temp = temp.replace(",", " ");
        }
        nameInput.value = temp;
      } else {
        nameInput.value = "Guest";
      }
    }
  });

  printButton.addEventListener("click", () => {
    if (nameInput.value && nameInput.value !== "Guest") {
      printLabel(nameInput.value);
      clearInputs();
    } else {
      //alert('Please scan a valid QR code');
      printLabel(nameInput.value);
      clearInputs();
      ShowAlert("Please scan a valid QR code");
    }
  });

  function ShowAlert(alrt) {
    errMsgLabel.classList.add("wrng");
    errMsgLabel.textContent = alrt;
    setTimeout(() => {
      errMsgLabel.classList.remove("wrng");
      errMsgLabel.textContent = "Registration System";
    }, 4000);
  }

  printCButton.addEventListener("click", () => {
    printLabel(nameInput.value);
    clearInputs();
    updateSheet();
  });

  function printLabel(name) {
    // Printing functionality here
    const labelContent = `
            <html>
            <head>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .label {
                        font-size: 16px;
                        font-weight: bold;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="label">${name}</div>
            </body>
            </html>
        `;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(labelContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  }

  function clearInputs() {
    qrInput.value = "";
    nameInput.value = "";
    qrInput.focus();
  }
});

function updateSheet() {
  const code = qrInput.value.trim();
  const now = new Date().toLocaleString();
  const sheets = google.sheets({ version: "v4", auth });

  sheets.spreadsheets.values.append(
    {
      spreadsheetId: sheetId,
      range: "Sheet1",
      valueInputOption: "RAW",
      resource: {
        values: [[code, now]],
      },
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      console.log(
        "Timestamp added to the sheet:",
        res.data.updates.updatedRange
      );
    }
  );
}
