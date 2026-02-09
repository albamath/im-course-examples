// get the #table-container div
let container = document.getElementById("table-container");

// create h1 element 
const h1 = document.createElement("h1");

// add h1 to container
container.appendChild(h1);

/*//hello world example
let text = document.createTextNode("Hello world!");

// add text to h1
h1.appendChild(text);
*/




//single line comment

/*
multi-line comment
*/

const MIN_BASE = 2

const MAX_BASE = 36;

const NUM_TABLES = 3;

const rowsPerTable = Math.floor(MAX_BASE / NUM_TABLES);

function createTables(num) {
    for (let i = 0; i < NUM_TABLES; ++i) {
        // create the table tag and append it to the #table-container
        let table = document.createElement("table");
        table.setAttribute("class", "bases-table");
        container.appendChild(table);

        //create the thead and append it to the table
        let thead = document.createElement("thead");
        table.appendChild(thead);
        let row = document.createElement("tr");
        thead.appendChild(row);
        let headCell1 = document.createElement("th");
        headCell1.appendChild(document.createTextNode("Base"));
        row.appendChild(headCell1);
        let headCell2 = document.createElement("th");
        headCell2.appendChild(document.createTextNode("Number"));
        row.appendChild(headCell2);

        //create a tbody tag and append it to the table
        let tbody = document.createElement("tbody");
        table.appendChild(tbody);
        for (let j = 0; j < rowsPerTable; ++j) {
            let base = MIN_BASE + j + i * rowsPerTable;

            if (base > MAX_BASE) break;

            //create a <tr> element and add it to the table body
            row = document.createElement("tr");
            tbody.appendChild(row);

            //cell displaying the base
            let baseCell = document.createElement("td");
            baseCell.appendChild(document.createTextNode(base));
            row.appendChild(baseCell);

            //cell displaying the number in the base
            let resultCell = document.createElement("td");
            resultCell.appendChild(document.createTextNode(num.toString(base)));
            row.appendChild(resultCell);

            console.log(base);
        }
    }
}

createTables(100);

/**
 *  Number input
 */
let inputElt = document.getElementById("number-input");

//wire up the input //the event listener can listen for change or input or others
inputElt.addEventListener("change", (e) => {
    //get value of input as number
    let value = parseInt(inputElt.value);

    //destroy previous tables
    /*container.innerHTML = ""; //quick and dirty way*/
    container.replaceChildren();

    //recreate tables
    createTables(value);
})

