document.getElementById('add_date_button').addEventListener('click', function() {
    const datePicker = document.getElementById('exclude_date_picker');
    const dateValue = datePicker.value;

    if (dateValue) {
        const excludedDatesList = document.getElementById('excluded_dates_list');
        
        // Create a new list item for the excluded date
        const listItem = document.createElement('li');
        listItem.textContent = dateValue;

        // Add a remove button for each date
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = function() {
            excludedDatesList.removeChild(listItem);
        };
        
        listItem.appendChild(removeButton);
        excludedDatesList.appendChild(listItem);
        
        // Clear the date picker
        datePicker.value = '';
    } else {
        alert('Please select a date to exclude.');
    }
});

// Handle form submission
document.getElementById("invoiceForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const year = parseInt(document.getElementById("year").value);
    const month = parseInt(document.getElementById("month").value);
    const pricePerTea = parseFloat(document.getElementById("price_per_tea").value);
    
    const excludeDates = [];
    const excludedItems = document.querySelectorAll('#excluded_dates_list li');
    excludedItems.forEach(item => {
        excludeDates.push(new Date(item.textContent));
    });

    const dates = getDatesInMonth(year, month, excludeDates);
    const invoiceHTML = generateInvoiceHTML(year, month, pricePerTea, dates);

    const outputDiv = document.getElementById("invoiceOutput");
    outputDiv.innerHTML = invoiceHTML;
    outputDiv.style.display = 'block';
});

function getDatesInMonth(year, month, excludeDates) {
    const dates = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);
        const isSunday = currentDate.getDay() === 0; // Sunday is 0
        const isExcluded = excludeDates.some(date => date.toDateString() === currentDate.toDateString());

        if (!isSunday && !isExcluded) {
            dates.push(currentDate);
        }
    }

    return dates;
}

function generateInvoiceHTML(year, month, pricePerTea, dates) {
    const quantityPerDay = 40;
    let totalAmount = 0;

    let html = `<h2>Invoice for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}</h2>`;
    html += `<table><tr><th>S.NO</th><th>Date</th><th>Quantity</th><th>Price</th><th>Amount</th></tr>`;

    dates.forEach((saleDate, index) => {
        const amount = quantityPerDay * pricePerTea;
        totalAmount += amount;
        html += `<tr>
            <td>${index + 1}</td>
            <td>${saleDate.toLocaleDateString()}</td>
            <td>${quantityPerDay}</td>
            <td>₹ ${pricePerTea.toFixed(2)}</td>
            <td>₹ ${amount.toFixed(2)}</td>
        </tr>`;
    });

    html += `<tr><td colspan="4" style="text-align:right;"><strong>Total Amount</strong></td>
              <td><strong>₹ ${totalAmount.toFixed(2)}</strong></td></tr>`;
    html += `<tr><td colspan="5">Amount in Words: ${convertAmountToWords(totalAmount)}</td></tr>`;
    html += `<tr><td colspan="5" style="text-align:center;">****Cheque in Favour of K. Yasin****</td></tr>`;
    html += `</table>`;

    return html;
}

function convertAmountToWords(amount) {
    const unitsMapping = [
        'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 
        'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 
        'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 
        'Eighteen', 'Nineteen'
    ];
    const tensMapping = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 
        'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    if (amount === 0) return "Zero Rupees Only";

    let words = '';
    let crore = Math.floor(amount / 10000000);
    let lakh = Math.floor((amount % 10000000) / 100000);
    let thousand = Math.floor((amount % 100000) / 1000);
    let hundred = Math.floor((amount % 1000) / 100);
    let lastTwoDigits = amount % 100;

    if (crore > 0) {
        words += unitsMapping[crore] + " Crore ";
    }
    if (lakh > 0) {
        words += unitsMapping[lakh] + " Lakh ";
    }
    if (thousand > 0) {
        words += unitsMapping[thousand] + " Thousand ";
    }
    if (hundred > 0) {
        words += unitsMapping[hundred] + " Hundred ";
    }
    if (lastTwoDigits > 0) {
        if (lastTwoDigits < 20) {
            words += unitsMapping[lastTwoDigits];
        } else {
            words += tensMapping[Math.floor(lastTwoDigits / 10)];
            if (lastTwoDigits % 10 > 0) {
                words += " " + unitsMapping[lastTwoDigits % 10];
            }
        }
    }

    return words.trim() + " Rupees Only";
}
