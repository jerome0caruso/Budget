
const budgetController = (function () { //---------///{{{Module}}}///------//

    const Expense = function (id, description, value) { //Constructor used to create expenses later or by user
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {  //calculates percentages 
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function () { //Just returns the new percentage
        return this.percentage;
    }

    const Income = function (id, description, value) { //Constructor used to create income later or by user
        this.id = id;
        this.description = description;
        this.value = value;
    };
    const calculateTotal = function (type) { // sums up all the exp and inc into a sum variable/ grabs from the data array below
        let sum = 0;
        data.allItems[type].forEach(num => {
            sum += num.value;
        })
        data.totals[type] = sum; //run from the calculateBudget Fn
    };

    const data = { // adds data from users input. the main arrays that get push to... and clear from
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0, // income - expenses from totals
        percentage: -1, //no values then no percentage
    };
    // returns !!!
    return {
        addItem: function (type, des, val) {
            let newItem, ID; //vars

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // creates unique Id's from last postion(arrays length - 1)
            } else {
                ID = 0; // can't start from empty array so must at least start from 0 not -1
            } //determine type input from user
            if (type === "exp") {
                newItem = new Expense(ID, des, val); //creates an expense from user input
            } else if (type === "inc") {
                newItem = new Income(ID, des, val); //creates an Income from user input
            }
            data.allItems[type].push(newItem); //pushes each value(exp or inc) to the data Object above
            return newItem; //return the new element to the cntrolAddListItem function 
        },

        calculateBudget: function () { //run from above/ returns the actual values/sum and makes them a global method
            calculateTotal('exp'); //saved in data.totals
            calculateTotal("inc");

            data.budget = data.totals.inc - data.totals.exp //retieves and calc/percentage data from the arrays
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); //figures rounded percentage
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function () {
            data.allItems.exp.forEach(current => current.calcPercentage(data.totals.inc)) //calculates all percentages in array 

        },
        getPercentage: function () {
            let allPercentages = data.allItems.exp.map(item => item.getPercentage()) //grabs returned percentage from method of 
            return allPercentages;                                                   //prototype of Expense   

        },

        getBudget: function () { //passes the totals, percentages to the UI display budget
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        deleteItem: function (type, id) { //takes a type inc or exp and unique id deleted
            let ids = data.allItems[type].map(item => {
                console.log(item)
                // creates an array from all items entered either in inc or exp
                return item.id;    // so that you can find the index of the Id(fromArray not the parameters) called to be deleted.
            })

            let index = ids.indexOf(id); // grabs the index 
            if (index !== -1) {
                data.allItems[type].splice(index, 1); //and deletes
            }
        },

        testing: function () {
            console.log(data);
        },
    };
})();



const UIController = (function () {      //---------///{{{Module}}}///------//

    const DOMstrings = { // (strings).class names stored in an object
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    const formatNumber = function (num, type) { //updates the percentage for each item added in the UI
        let numSplit, int, dec;
        num = Math.abs(num).toFixed(2); //rounds the number with two decimal places
        numSplit = num.split(".");//split the cents off number
        int = numSplit[0];//grabs the first number

        if (int.length > 6) {
            int = `${int.substr(0, int.length - 6)},${int.substr(int.length - 6)}`; //adds the , for every 6 numbers//Added for fun
        }
        if (int.length > 3) {
            int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3)}`; //adds the , for every 3 numbers
        }
        dec = numSplit[1];

        return `${(type === "exp" ? "-" : "+")}${int}.${dec}`

    }
    const nodeListForEach = function (list, callback) { // placed here for mulitple use// Now forEach works on nodeLists   
        for (let i = 0; i < list.length; i++) {           // but I'm going with video and trying to learn different ways. This is with first class funtions
            callback(list[i], i);
        }
    }
    //return!!
    return {  //------return this large object so the methods are accessible in the global scope/ //easy way to return 
        //three vars at same time.This time from the UI, put into an object

        getInput: function () { //grabs inc or exp; text/description; value/amount 
            return {
                type: document.querySelector(DOMstrings.inputType).value, // income or expense
                description: document.querySelector(DOMstrings.inputDescription).value, //description box
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //amount box, are all passed to controller in an Object. converts string(first input) to int
            };
        },
        addListItem: function (obj, type) { // adding the created exp or inc  to the DOM/UI
            let element, html, newHtml;

            if (type === "inc") {  // InnerHTML 
                element = DOMstrings.incomeContainer; //Creates the UI income container income
                html = '<div class="item clearfix" id = "inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === "exp") {
                element = DOMstrings.expenseContainer;//Creates the UI expenses container expenses
                html = '<div class="item clearfix" id = "exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">0%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >'
            }
            newHtml = html.replace("%id%", obj.id);// replacing the values in the innerHtml with the acutally obj values.
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type)); //

            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);//inserts exp or inc(element) container as the last item in UI list
        },                                                  //postion (after all content), html to insert 

        deleteListItem: function (selectorID) { // deletes item. Had to grab element then get its parent to delete child(iteself)...
            let element = document.getElementById(selectorID); //grabs the ex.income-id
            element.parentNode.removeChild(element);
        },

        clearFields: function () { //clears the description and value fields after input
            let fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`);//grabs the two input fields (text and value)
            //fieldsArr = Array.prototype.slice.call(fields); forEach now works with nodeList so I don't think I need to use Array* Adjustment differs from video
            fields.forEach(inputFields => inputFields.value = "");//clears the fields after "enter"
            fields[0].focus();//resets the focus to the descrition field
        },

        displayBudget: function (obj) { //called by update budget with an object of budget:, total, percentage//Updates top part of UI
            let type;
            obj.budget >= 0 ? type = "inc" : type = "exp"; //from getBudget fn // setting type 
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
            if (obj.percentage > 0) { //if negative/exp first don't display -1%
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%"; //adds  % or --- after percentage
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentages: function (percentage) {
            let fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);//each percentage in a nodelist
            //end---
            // const nodeListForEach = function (list, callback) { //this then pushes each item added by user and the index to the callback Fn 
            //   for (let i = 0; i < list.length; i++) {        //which is current equal to list[i] and index = i.  
            //     callback(list[i], i);
            //   }
            // }                                                   //start---
            nodeListForEach(fields, function (current, index) { //This calls the fn with two parameters; a node list and a callback FN
                if (percentage[index] > 0) {                      //with two arguments. They(args) get assigned in the Fn being called and then filtered
                    current.textContent = percentage[index] + "%"; // in this fn to add either add a % sign or --- to the actual percentage being updated
                } else {
                    captureEvents.textContent = "---";
                }
            })
        },

        displayMonth: function () { //updates the Date on top of UI
            let now, year, month, months
            now = new Date();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${year}`;
        },

        changedType: function () { //Changes the focus colors
            const fields = document.querySelectorAll(`
      ${DOMstrings.inputType},
      ${DOMstrings.inputDescription},
      ${DOMstrings.inputValue}`
            );
            nodeListForEach(fields, function (current) { //input fields (red/green)
                current.classList.toggle("red-focus");
            })
            document.querySelector(DOMstrings.inputButton).classList.toggle("red"); //button
        },

        getDOMstrings: function () { // makes a public variable to be called by the controller function for our strings(.class)names
            return DOMstrings;
        },
    }
})();


const controller = (function (budgetController, UIController) {   //---------///{{{Module}}}///------//

    const setupEventListeners = function () { //runs and setups eventlisteners at start
        const DOM = UIController.getDOMstrings(); // passing the .class names from DOMstrings var(in case they ever change in the html file.)
        //add Item eventlisteners
        document
            .querySelector(DOM.inputButton)
            .addEventListener("click", ctrlAddItem); //On click

        document.addEventListener("keypress", function (event) { // On Enter Keypress
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        // Delete item eventlisteners / 
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem); //grabbing the entire container from html<div> grabs exp and inc in one through event bubbling
        document.querySelector(DOM.inputType).addEventListener("change", UIController.changedType) //changes/border color for exp or inc 
    };

    const ctrlAddItem = function () {//Get filled in input data
        const input = UIController.getInput(); //object of UI value's(+ or -, description, $amount)

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {//Checks the UI inputs, No value 0, NAN or empty des. string

            let newItem = budgetController.addItem(input.type, input.description, input.value); //UI inputs are then stored in the budgetController for storage and calculations
            UIController.addListItem(newItem, input.type);//calls function from the UIController with the //Type object : id, descip, value then type(exp/inc)
            UIController.clearFields(); //clears the two inputs
            updateBudget();
            updatePercentages();
        }
    };

    const ctrlDeleteItem = function (event) { // grabs event from click or return 
        let itemID, splitID, type, ID; //event.target grabs the exact item clicked/enter on in the container div
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id //traversing the dom from the delete button to grab the
        if (itemID) {                                                        //container div #id as they are created.
            splitID = itemID.split("-"); // splits the unqiue ID's given to each inc or exp item and the type(inc/exp)
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetController.deleteItem(type, ID); // calls the delete method with inc or exp and the unique ID assigned in cntrlAddItem Fn above
            UIController.deleteListItem(itemID); // deletes item/s from UI
            updateBudget(); //updates budget  + percentage every input
            updatePercentages();

        }
    }
    const updateBudget = function () { // called each time an item is entered.  Grabs all of the costs and percentages
        budgetController.calculateBudget();      // does the math for inc or exp budget: data.budget,
        const budget = budgetController.getBudget(); //grabs totals and percentages
        UIController.displayBudget(budget); //passes to the UI
    }

    const updatePercentages = function () { // from budget controller, Calculate percentage and update UI
        budgetController.calculatePercentage();//
        let percentage = budgetController.getPercentage(); ////returned percentages stored in array
        UIController.displayPercentages(percentage);
    }

    return {
        init: function () {
            setupEventListeners(); // runs the event listeners right away, starts the app
            UIController.displayMonth(); //updates month and year 
            UIController.displayBudget({
                budget: 0,  //clears out all the fields
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };
})(budgetController, UIController); // Two other modules

controller.init(); //Has access to outside because it is returned by controller function that is run first
