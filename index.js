// No imports needed; jsPDF will be available globally

document.getElementById('add_date_button').addEventListener('click', function() {
    const datePicker = document.getElementById('exclude_date_picker');
    const dateValue = datePicker.value;

    if (dateValue) {
        const excludedDatesList = document.getElementById('excluded_dates_list');

        const listItem = document.createElement('li');
        listItem.textContent = dateValue;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = function() {
            excludedDatesList.removeChild(listItem);
        };

        listItem.appendChild(removeButton);
        excludedDatesList.appendChild(listItem);

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
    const quantityPerDay = parseInt(document.getElementById("quantity_per_day").value);

    const excludeDates = [];
    const excludedItems = document.querySelectorAll('#excluded_dates_list li');
    excludedItems.forEach(item => {
        excludeDates.push(new Date(item.textContent));
    });

    const dates = getDatesInMonth(year, month, excludeDates);
    const invoiceHTML = generateInvoiceHTML(year, month, pricePerTea, dates, quantityPerDay);

    const outputDiv = document.getElementById("invoiceOutput");
    outputDiv.innerHTML = invoiceHTML;
    outputDiv.style.display = 'block';

    // Enable the download button
    document.getElementById('downloadButton').style.display = 'block';
});

// Function to get valid dates in the month
function getDatesInMonth(year, month, excludeDates) {
    const dates = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);
        const isSunday = currentDate.getDay() === 0; // Sunday check
        const isExcluded = excludeDates.some(date => date.toDateString() === currentDate.toDateString());

        if (!isSunday && !isExcluded) {
            dates.push(currentDate);
        }
    }

    return dates;
}

// Function to generate HTML for the invoice
function generateInvoiceHTML(year, month, pricePerTea, dates, quantityPerDay) {
    let totalAmount = 0;

    let html = `<h2>Bill for the month of ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}</h2>`;
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
    html += `<tr><td colspan="5" style="text-align:center;">****Cheque in favour of K. Yasin****</td></tr>`;
    html += `</table>`;

    return html;
}

// Function to convert amount to words
function convertAmountToWords(amount) {
    const words = [];
    const numbers = {
        1: 'One',
        2: 'Two',
        3: 'Three',
        4: 'Four',
        5: 'Five',
        6: 'Six',
        7: 'Seven',
        8: 'Eight',
        9: 'Nine',
        10: 'Ten',
        11: 'Eleven',
        12: 'Twelve',
        13: 'Thirteen',
        14: 'Fourteen',
        15: 'Fifteen',
        16: 'Sixteen',
        17: 'Seventeen',
        18: 'Eighteen',
        19: 'Nineteen',
        20: 'Twenty',
        30: 'Thirty',
        40: 'Forty',
        50: 'Fifty',
        60: 'Sixty',
        70: 'Seventy',
        80: 'Eighty',
        90: 'Ninety',
    };

    if (amount < 0) {
        words.push('Minus');
        amount = -amount;
    }

    if (amount < 20) {
        words.push(numbers[amount]);
    } else if (amount < 100) {
        words.push(numbers[Math.floor(amount / 10) * 10]);
        if (amount % 10 !== 0) {
            words.push(numbers[amount % 10]);
        }
    } else if (amount < 1000) {
        words.push(numbers[Math.floor(amount / 100)]);
        words.push('Hundred');
        if (amount % 100 !== 0) {
            words.push('and');
            words.push(convertAmountToWords(amount % 100));
        }
    } else if (amount < 100000) {
        words.push(convertAmountToWords(Math.floor(amount / 1000)));
        words.push('Thousand');
        if (amount % 1000 !== 0) {
            words.push(convertAmountToWords(amount % 1000));
        }
    } else if (amount < 10000000) {
        words.push(convertAmountToWords(Math.floor(amount / 100000)));
        words.push('Lakh');
        if (amount % 100000 !== 0) {
            words.push(convertAmountToWords(amount % 100000));
        }
    } else {
        words.push(convertAmountToWords(Math.floor(amount / 10000000)));
        words.push('Crore');
        if (amount % 10000000 !== 0) {
            words.push(convertAmountToWords(amount % 10000000));
        }
    }

    return words.join(' ');
}

// Generate PDF
// Generate PDF
document.getElementById('downloadButton').addEventListener('click', function() {
    const year = parseInt(document.getElementById("year").value);
    const month = parseInt(document.getElementById("month").value);
    const pricePerTea = parseFloat(document.getElementById("price_per_tea").value);
    const quantityPerDay = parseInt(document.getElementById("quantity_per_day").value);

    const excludeDates = [];
    const excludedItems = document.querySelectorAll('#excluded_dates_list li');
    excludedItems.forEach(item => {
        excludeDates.push(new Date(item.textContent));
    });

    const dates = getDatesInMonth(year, month, excludeDates);
    const totalAmount = quantityPerDay * pricePerTea * dates.length;

    const doc = new window.jspdf.jsPDF(); // Use window.jspdf.jsPDF()

    // Add Header and Footer Images
    const headerImage = 'https://raw.githubusercontent.com/MohdAwf/KF_TeaPoint/main/header.png';
    doc.addImage(headerImage, 'PNG', 10, 10, 190, 30); // Adjust position and size as needed
    doc.text(`Bill for the month of ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`, 10, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 60);

    // Prepare data for the table
    const tableData = dates.map((saleDate, index) => {
        const amount = quantityPerDay * pricePerTea;
        return [
            (index + 1).toString(),
            saleDate.toLocaleDateString(),
            quantityPerDay.toString(),
            `₹ ${pricePerTea.toFixed(2)}`,
            `₹ ${amount.toFixed(2)}`
        ];
    });

    // Use autoTable to add the table to the PDF
    window.autoTable(doc, {
        head: [['S.NO', 'Date', 'Quantity', 'Price', 'Amount']],
        body: tableData,
    });

    // Add total amount
    doc.text(`Total Amount: ₹ ${totalAmount.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Invoice_${year}_${month}.pdf`);
});
