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
        column.width = maxLength;
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
    const moneyColumns = ["C", "J", "L", "P", "Q", "R", "S", "U"];
    moneyColumns.forEach(column => {
        worksheet.getColumn(column).numFmt = '$#,##0.00';
    });
    worksheet.getColumn("O").numFmt = '0.00##\\%'; //Format percent
    worksheet.getColumn("U").font = {bold: true};

    //Set header
    const headerRow = ["Name", "Date", "Total Wage", "# of Gigs", "Event Hours", "Practice Hours", "Rehearsal Hours", "Total Mileage", "Travel Hours", "Gas $/Gallon", "Vehicle MPG", "Gas $/Mile", "Mileage Covered", "Trip Type", "Tax %", "Other Fees", "Tax Cut", "Travel Cost", "Total Profit", "Total Hours", "Hourly Wage"]
    worksheet.addRow(headerRow).commit();
    worksheet.getRow(1).font = {bold: true};
    worksheet.getRow(1).numFmt = "";
    worksheet.getCell(`Q1`).border = {left: {style: "thin"}};

    //Size columns
    autoSizeColumn(worksheet);
    worksheet.getColumn("A").width = 20; //Name width
    worksheet.getColumn("B").width = 11; //Date width
    worksheet.getColumn("O").width = 10; //Tax width
    worksheet.getColumn("Q").width = 10; //Tax Cut Width

    //Set data
    let rowCount = 1;
    data.forEach(fin => {
        rowCount++;
        var row = worksheet.addRow([fin.fin_name, fin.date, parseFloatZero(fin.total_wage), parseIntZero(fin.event_num) === 0 ? 1 : parseIntZero(fin.event_num), parseFloatZero(fin.event_hours), parseFloatZero(fin.practice_hours), parseFloatZero(fin.rehearsal_hours), parseFloatZero(fin.total_mileage), parseFloatZero(fin.travel_hours), parseFloatZero(fin.gas_price), parseFloatZero(fin.mpg), parseFloatZero(fin.gas_price/fin.mpg), parseFloatZero(fin.mileage_covered), parseIntZero(fin.trip_num), parseFloatZero(fin.tax), parseFloatZero(fin.fees), fin.total_wage*(.01*parseFloatZero(fin.tax)), 0, parseFloatZero(fin.gas_price/fin.mpg)*parseFloatZero(fin.total_mileage), 0, parseFloatZero(fin.hourly_wage)]);

        //Get values
        let event_num = Math.max(fin.event_num, 1);
        let multiplyPay = fin.multiply_pay == 1 ? event_num : 1;
        let multiplyGigHours = fin.multiply_hours == 1 ? event_num : 1;
        let multiplyTravel = fin.multiply_travel == 1 ? event_num : 1;
        let multiplyPractice = fin.multiply_practice == 1 ? event_num : 1;
        let multiplyRehearsal = fin.multiply_rehearsal == 1 ? event_num : 1;
        let multiplyOther = fin.multiply_other == 1 ? event_num : 1;
        let tripNum = fin.trip_num;
        let gasPerMile = fin.mpg > 0 ? (fin.gas_price/fin.mpg).toFixed(2) : 0;
        let otherFees = fin.fees * multiplyOther;
        let totalPay = fin.total_wage * multiplyPay;
        let taxCut = totalPay * (fin.tax * .01);
        let travelCosts = fin.total_mileage*(gasPerMile-fin.mileage_covered)*multiplyTravel*tripNum;
        let totalHours = getTotalFinHours(fin);

        //Set Formulas
        worksheet.getCell(`L${rowCount}`).value = {formula: `IFERROR(J${rowCount}/K${rowCount}, 0)`}; //Gas Price Per Mile
        worksheet.getCell(`P${rowCount}`).value = otherFees; //Other fees
        worksheet.getCell(`Q${rowCount}`).value = taxCut; //Tax Cut
        worksheet.getCell(`R${rowCount}`).value = travelCosts; //Travel Costs
        worksheet.getCell(`S${rowCount}`).value = totalPay - taxCut - travelCosts - otherFees; //Total Profits
        worksheet.getCell(`T${rowCount}`).value = totalHours > 0 ? totalHours : 0; //Total Hours
        if (totalHours <= 0) worksheet.getCell(`U${rowCount}`).value = 0; //Hourly Wage
        
        //worksheet.getCell(`L${rowCount}`).value = {formula: `IFERROR(J${rowCount}/K${rowCount}, 0)`}; //Gas Price Per Mile
        //worksheet.getCell(`P${rowCount}`).value = {formula: `(C${rowCount}*D${rowCount})*(0.01*N${rowCount})`}; //Tax Cut
        //worksheet.getCell(`Q${rowCount}`).value = {formula: `H${rowCount}*(L${rowCount}-M${rowCount})`}; //Travel Costs
        //worksheet.getCell(`R${rowCount}`).value = {formula: `((E${rowCount}*D${rowCount})+F${rowCount}+G${rowCount}+I${rowCount})`}; //Total Hours
        //worksheet.getCell(`S${rowCount}`).value = {formula: `IFERROR(((C${rowCount}*D${rowCount})-O${rowCount}-P${rowCount}-Q${rowCount})/R${rowCount}, 0)`}; //Total Hourly Wage

        //Border
        worksheet.getCell(`Q${rowCount}`).border = {left: {style: "thin"}};
        row.commit();
    });

    //Final sum
    worksheet.getCell(`P${rowCount+2}`).value = "Total";
    worksheet.getCell(`P${rowCount+2}`).border = {top: {style: "medium"}};
    const sumRows = ["Q", "R", "S", "T", "U"];
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

module.exports = {formatCurrency, metersToMiles, parseFloatZero, parseIntZero, parseBool, parseStringUndefined, getBackendURL, autoSizeColumn, sendEmail, getTotalFinHours, maxFinancialNameLength, statesList, clientId, toastSuccess, toastError, toastInfo, saveSpreadsheetAll};