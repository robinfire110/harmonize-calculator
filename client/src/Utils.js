const axios = require('axios');
const { toast } = require("react-toastify");
const ExcelJS = require('exceljs');
const {saveAs} = require('file-saver')

function getBackendURL()
{
    if (process.env.NODE_ENV== "development") return "http://localhost:5000";
    else return "https://harmnize.com/api";
}

//Constant Variables
const maxFinancialNameLength = 50;
const statesList = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY' ];
const clientId = "60061594536-k5ll1e4hv1ft1pliuftsiubpt9ed6lj4.apps.googleusercontent.com";

//Default toast settings
const toastTheme = 'dark';
const toastPosition = 'top-center';
const toastTimeout = 1750;
const toastSuccess = { theme: toastTheme, position: toastPosition, type: "success", autoClose: toastTimeout};
const toastError = { theme: toastTheme, position: toastPosition, type: "error", autoClose: toastTimeout};
const toastInfo = { theme: toastTheme, position: toastPosition, type: "info", autoClose: toastTimeout};

//Data Value Const
const DATA_VALUE = {INT: 0, FLOAT: 1, STRING: 2}

//Format number to currency
function formatCurrency(value) 
{
    if (value && value !== "") return Intl.NumberFormat('en-US', {style: 'currency', currency: "USD"}).format(value);
    return "$0.00";
}

//Convert meters to miles
function metersToMiles(meters) {
    return meters*0.000621371192;
}

//Parse values (returns 0 instead of undefined/NaN for undefined values)
function parseFloatZero(value)
{
    if (value && value != NaN && parseFloat(value)) return parseFloat(value);
    else return 0
}

function parseIntZero(value)
{
    if (value && value != NaN && parseInt(value)) return parseInt(value);
    else return 0
}

//Parse Bool
//Returns 1/0 for true or false.
function parseBool(value)
{
    if (value) return 1;
    return 0;
}

//Auto fit column width (for spreadsheet)
function autoSizeColumn(worksheet)
{
    worksheet.columns.forEach(function (column, i) {
        let maxLength = 0;
        column["eachCell"]({ includeEmpty: true }, function (cell) {
            var columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength ) {
                maxLength = columnLength;
            }
        });
        column.width = maxLength+1;
    });
}

//Returns undefined if string is empty
function parseStringUndefined(value)
{
    if (!value || value == "") return undefined;
    else return value;
}

//Send email
async function sendEmail(to, subject, text=null, html=null)
{
    const data = {};
    data['to'] = to;
    data['subject'] = subject;
    if (text) data['text'] = text;
    if (html) data['html'] = html;
    console.log(`${getBackendURL()}/api/email`);
    await axios.post(`${getBackendURL()}/api/email`, data);
}

//Get fin total
function getTotalFinHours(fin)
{
    let event_num = Math.max(fin.event_num, 1);
    let multiplyGigHours = fin.multiply_hours == 1 ? event_num : 1;
    let multiplyTravel = fin.multiply_travel == 1 ? event_num : 1;
    let multiplyPractice = fin.multiply_practice == 1 ? event_num : 1;
    let multiplyRehearsal = fin.multiply_rehearsal == 1 ? event_num : 1;
    let totalHours = (fin.event_hours*multiplyGigHours) + (fin.practice_hours*multiplyPractice) + (fin.rehearsal_hours*multiplyRehearsal) + (fin.travel_hours*multiplyTravel*fin.trip_num);
    return totalHours;
}

async function saveSpreadsheet(formData)
{
    try 
    {
        //Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.created = new Date();
        workbook.modified = new Date();

        //Create worksheet
        const worksheet = workbook.addWorksheet("Calculator Results");

        //Set Rows
        const rows = [];
        rows.push(worksheet.addRow(["Name", "Date", "Total Wage", "Number of gigs"]));
        rows.push(worksheet.addRow([formData.fin_name, formData.date, parseFloatZero(formData.total_wage), parseIntZero(formData.event_num) == 0 ? 1 : parseIntZero(formData.event_num), "", "Payment", parseFloatZero(formData.total_wage)]));
        rows[1].getCell(3).numFmt = '$#,##0.00'; //Format cell as currency
        rows.push(worksheet.addRow(["", "", "", "", "", "Tax Cut", ""])); //Results row
        rows.push(worksheet.addRow(["Event Hours", "Individual Practice Hours", "Rehearsal Hours", "", "", "Travel Cost", ""]));
        rows.push(worksheet.addRow([parseFloatZero(formData.event_hours), parseFloatZero(formData.practice_hours), parseFloatZero(formData.rehearsal_hours), "", "", "Other Fees", parseFloatZero(formData.fees)]));
        rows.push(worksheet.addRow([""])); //Results row
        rows.push(worksheet.addRow(["Total Mileage", "Travel Hours", "Mileage Covered", "Trip Number", "", "Total Hours", ""]));
        rows.push(worksheet.addRow([parseFloatZero(formData.total_mileage), parseFloatZero(formData.travel_hours), parseFloatZero(formData.mileage_covered), parseIntZero(formData.trip_num), "", "Total Hourly Wage", parseFloatZero(formData.hourly_wage)]));
        rows[7].getCell(3).numFmt = '$#,##0.00'; //Format cell as currency
        rows.push(worksheet.addRow([""])); //Results row
        rows.push(worksheet.addRow(["Gas Price per Gallon", "Vehicle MPG", "Gas Price per Mile", "Additional Travel Costs"]));
        rows.push(worksheet.addRow([parseFloatZero(formData.gas_price), parseFloatZero(formData.mpg), "", parseFloatZero(formData.travel_fees)]));
        rows[10].getCell(1).numFmt = '$#,##0.00'; //Format cell as currency
        rows[10].getCell(3).numFmt = '$#,##0.00'; //Format cell as currency
        rows.push(worksheet.addRow([""])); //Results row
        rows.push(worksheet.addRow(["Tax Percentage (%)", "Other Fees"]));
        rows.push(worksheet.addRow([parseFloatZero(formData.tax), parseFloatZero(formData.fees)]));
        rows[13].getCell(1).numFmt = '0.00##\\%'; //Format cell as currency
        rows[13].getCell(2).numFmt = '$#,##0.00'; //Format cell as currency

        //Bold
        const boldRows = [1, 4, 7, 10, 13];
        boldRows.forEach(row => {
            rows[row-1].font = {bold: true};
        });
        worksheet.getColumn("F").font = {bold: true};
        worksheet.getColumn("G").font = {bold: false};

        //Merge Cells
        worksheet.mergeCells("F1:G1");
        worksheet.getCell('F1').value = 'Results';
        worksheet.getCell('F1').alignment = {horizontal: "center"};
        worksheet.getCell('F1').font = {bold: true};
        worksheet.mergeCells("F10:G10");
        worksheet.getCell('F10').value = 'Options';
        worksheet.getCell('F10').alignment = {horizontal: "center"};
        worksheet.getCell('F10').font = {bold: true};
        
        //Format
        worksheet.getColumn("G").numFmt = '$#,##0.00';
        worksheet.getCell('G7').numFmt = "0.00";

        //Options
        const enabledDataValidation = {
            type: "list",
            allowBlank: false,
            formulae: ['"Enabled,Disabled"']
        }

        //Multiply
        worksheet.getCell("F11").value = "Multiply Pay";
        worksheet.getCell("G11").dataValidation = enabledDataValidation;
        worksheet.getCell("G11").value = formData.multiply_pay == 1 ? "Enabled" : "Disabled";
        worksheet.getCell("F12").value = "Multiply Gig Hours";
        worksheet.getCell("G12").dataValidation = enabledDataValidation;
        worksheet.getCell("G12").value = formData.multiply_hours == 1 ? "Enabled" : "Disabled";
        worksheet.getCell("F13").value = "Multiply Travel";
        worksheet.getCell("G13").dataValidation = enabledDataValidation;
        worksheet.getCell("G13").value = formData.multiply_travel == 1 ? "Enabled" : "Disabled";
        worksheet.getCell("F14").value = "Multiply Practice";
        worksheet.getCell("G14").dataValidation = enabledDataValidation;
        worksheet.getCell("G14").value = formData.multiply_practice == 1 ? "Enabled" : "Disabled";
        worksheet.getCell("F15").value = "Multiply Rehearsal";
        worksheet.getCell("G15").dataValidation = enabledDataValidation;
        worksheet.getCell("G15").value = formData.multiply_rehearsal == 1 ? "Enabled" : "Disabled";
        worksheet.getCell("F16").value = "Multiply Other Fees";
        worksheet.getCell("G16").dataValidation = enabledDataValidation;
        worksheet.getCell("G16").value = formData.multiply_other == 1 ? "Enabled" : "Disabled";

        //Validation
        worksheet.getCell("D2").dataValidation = {
            type: "whole",
            allowBlank: false,
            operator: "greaterThan",
            formulae: [0],
            showErrorMessage: true,
            errorStyle: 'error',
            errorTitle: 'Invalid Value',
            error: "This value must be at least 1"
        }

        //Borders
        worksheet.getCell("F5").border = {bottom: {style: "thin"}};
        worksheet.getCell("G5").border = {bottom: {style: "thin"}};
        worksheet.getCell("F7").border = {bottom: {style: "thin"}};
        worksheet.getCell("G7").border = {bottom: {style: "thin"}};

        //Set formulas
        worksheet.getCell("G2").value = {formula: 'C2*IF(G11="Enabled", D2, 1)'}; //Payment
        worksheet.getCell("G3").value = {formula: 'G2*(0.01*A14)'}; //Tax Cut
        worksheet.getCell("G4").value = {formula: '((A8*D8*(ROUND(C11, 2)-C8))+D11)*IF(G13="Enabled", D2, 1)'}; //Travel Cost
        worksheet.getCell("G5").value = {formula: 'B14*IF(G16="Enabled", D2, 1)'}; //Other Fees 
        worksheet.getCell("G6").value = {formula: 'G2-G3-G4-G5'}; //Total Income
        worksheet.getCell("G7").value = {formula: '=(A5*IF(G12="Enabled", D2, 1))+(B5*IF(G14="Enabled", D2, 1))+(C5*IF(G15="Enabled", D2, 1))+(B8*IF(G13="Enabled", D2, 1)*D8)'}; //Total Hours
        worksheet.getCell("G8").value = {formula: 'IFERROR(G6/G7, 0)'}; //Total Hourly Wage
        worksheet.getCell("C11").value = {formula: 'IFERROR(A11/B11, 0)'}; //Gas Price per Mile

        //Fit Column Width
        autoSizeColumn(worksheet);

        const buf = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buf]), `${formData.fin_name.replace(/ /g,"_")}.xlsx`);
        toast("Calculator data exported", toastSuccess);
    }
    catch(error)
    {
        console.log(error);
        toast("An error occured while exporting. Please ensure all fields are filled out correctly and try again.", toastError);
    }
}

//Save all financials for user
async function saveSpreadsheetAll(data, filename = 'Harmonize_Export')
{
    //Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.created = new Date();
    workbook.modified = new Date();

    //Create worksheet
    const worksheet = workbook.addWorksheet("Calculator Results", {
        views: [{ state: "frozen", ySplit: 1 }]
    });

    //Fomatting
    const moneyColumns = ["C", "J", "L", "O", "Q", "R", "S", "T", "V"];
    moneyColumns.forEach(column => {
        worksheet.getColumn(column).numFmt = '$#,##0.00';
    });
    worksheet.getColumn("P").numFmt = '0.00##\\%'; //Format percent
    worksheet.getColumn("V").font = {bold: true};

    //Set header
    const headerRow = ["Name", "Date", "Total Wage", "# of Gigs", "Event Hours", "Practice Hours", "Rehearsal Hours", "Total Mileage", "Travel Hours", "Gas $/Gallon", "Vehicle MPG", "Gas $/Mile", "Mileage Covered", "Trip Number", "Add. Travel Costs", "Tax %", "Other Fees", "Tax Cut", "Travel Cost", "Total Profit", "Total Hours", "Hourly Wage"]
    worksheet.addRow(headerRow).commit();
    worksheet.getRow(1).font = {bold: true};
    worksheet.getRow(1).numFmt = "";
    worksheet.getCell(`R1`).border = {left: {style: "thin"}};

    //Size columns
    autoSizeColumn(worksheet);
    worksheet.getColumn("A").width = 20; //Name width
    worksheet.getColumn("B").width = 11; //Date width
    worksheet.getColumn("O").width = 10; //Add Travel Costs
    worksheet.getColumn("P").width = 10; //Tax width
    worksheet.getColumn("R").width = 10; //Tax Cut Width

    //Set data
    let rowCount = 1;
    data.forEach(fin => {
        rowCount++;
        var row = worksheet.addRow([fin.fin_name, fin.date, parseFloatZero(fin.total_wage), parseIntZero(fin.event_num) === 0 ? 1 : parseIntZero(fin.event_num), parseFloatZero(fin.event_hours), parseFloatZero(fin.practice_hours), parseFloatZero(fin.rehearsal_hours), parseFloatZero(fin.total_mileage), parseFloatZero(fin.travel_hours), parseFloatZero(fin.gas_price), parseFloatZero(fin.mpg), parseFloatZero(fin.gas_price/fin.mpg), parseFloatZero(fin.mileage_covered), parseIntZero(fin.trip_num), parseFloatZero(fin.travel_fees), parseFloatZero(fin.tax), parseFloatZero(fin.fees), fin.total_wage*(.01*parseFloatZero(fin.tax)), 0, parseFloatZero(fin.gas_price/fin.mpg)*parseFloatZero(fin.total_mileage), 0, parseFloatZero(fin.hourly_wage)]);

        //Get values
        let event_num = Math.max(fin.event_num, 1);
        let multiplyPay = fin.multiply_pay == 1 ? event_num : 1;
        let multiplyTravel = fin.multiply_travel == 1 ? event_num : 1;
        let multiplyOther = fin.multiply_other == 1 ? event_num : 1;
        let tripNum = fin.trip_num;
        let gasPerMile = fin.mpg > 0 ? (fin.gas_price/fin.mpg).toFixed(2) : 0;
        let otherFees = fin.fees * multiplyOther;
        let totalPay = fin.total_wage * multiplyPay;
        let taxCut = totalPay * (fin.tax * .01);
        let travelCosts =((fin.total_mileage*(gasPerMile-fin.mileage_covered)*tripNum)+fin.travel_fees)*multiplyTravel;
        let totalHours = getTotalFinHours(fin);

        //Set Formulas
        worksheet.getCell(`L${rowCount}`).value = {formula: `IFERROR(J${rowCount}/K${rowCount}, 0)`}; //Gas Price Per Mile
        worksheet.getCell(`Q${rowCount}`).value = otherFees; //Other fees
        worksheet.getCell(`R${rowCount}`).value = taxCut; //Tax Cut
        worksheet.getCell(`S${rowCount}`).value = travelCosts; //Travel Costs
        worksheet.getCell(`T${rowCount}`).value = totalPay - taxCut - travelCosts - otherFees; //Total Profits
        worksheet.getCell(`U${rowCount}`).value = totalHours > 0 ? totalHours : 0; //Total Hours
        if (totalHours <= 0) worksheet.getCell(`V${rowCount}`).value = 0; //Hourly Wage
        
        //Border
        worksheet.getCell(`R${rowCount}`).border = {left: {style: "thin"}};
        row.commit();
    });

    //Final sum
    worksheet.getCell(`Q${rowCount+2}`).value = "Total";
    worksheet.getCell(`Q${rowCount+2}`).border = {top: {style: "medium"}};
    const sumRows = ["R", "S", "T", "U", "V"];
    sumRows.forEach(row => {
        var cell = worksheet.getCell(`${row}${rowCount+2}`);
        cell.value = {formula: `SUM(${row}2:${row}${rowCount})`};
        cell.border = {top: {style: "medium"}};
    });
    worksheet.getRow(rowCount+2).font = {bold: true};

    //Save
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `${filename}.xlsx`);
}

module.exports = {DATA_VALUE, formatCurrency, metersToMiles, parseFloatZero, parseIntZero, parseBool, parseStringUndefined, getBackendURL, autoSizeColumn, sendEmail, getTotalFinHours, maxFinancialNameLength, statesList, clientId, toastSuccess, toastError, toastInfo, saveSpreadsheetAll, saveSpreadsheet};