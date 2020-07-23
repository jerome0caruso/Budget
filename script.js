
const budgetController = (function () { 

  const Expense = function (id, description, value) { 
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) { 
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1
    }
  }

  Expense.prototype.getPercentage = function () { 
    return this.percentage;
  }

  const Income = function (id, description, value) { 
    this.id = id;
    this.description = description;
    this.value = value;
  };
  const calculateTotal = function (type) { 
    let sum = 0;
    data.allItems[type].forEach(num => {
      sum += num.value;
    })
    data.totals[type] = sum; 
  };

  const data = { 
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0, 
    percentage: -1, 
  };
  
  return {
    addItem: function (type, des, val) {
      let newItem, ID; 

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0; 
      } 
      if (type === "exp") {
        newItem = new Expense(ID, des, val); 
      } else if (type === "inc") {
        newItem = new Income(ID, des, val); 
      }
      data.allItems[type].push(newItem); 
      return newItem; 
    },

    calculateBudget: function () {
      calculateTotal('exp'); 
      calculateTotal("inc");

      data.budget = data.totals.inc - data.totals.exp
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentage: function () {
      data.allItems.exp.forEach(current => current.calcPercentage(data.totals.inc)) 

    },
    getPercentage: function () {
      let allPercentages = data.allItems.exp.map(item => item.getPercentage()) 
      return allPercentages;                                                    

    },

    getBudget: function () { 
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    deleteItem: function (type, id) { 
      let ids = data.allItems[type].map(item => {
        return item.id; 
      })

      let index = ids.indexOf(id); 
      if (index !== -1) {
        data.allItems[type].splice(index, 1); 
      }
    },

    testing: function () {
      console.log(data);
    },
  };
})();



const UIController = (function () {     

  const DOMstrings = {
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

  const formatNumber = function (num, type) { 
    let numSplit, int, dec;
    num = Math.abs(num).toFixed(2); 
    numSplit = num.split(".");
    int = numSplit[0];

    if (int.length > 6) {
      int = `${int.substr(0, int.length - 6)},${int.substr(int.length - 6)}`;  
    }
    if (int.length > 3) {
      int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3)}`; 
    }
    dec = numSplit[1];

    return `${(type === "exp" ? "-" : "+")}${int}.${dec}`

  }
  const nodeListForEach = function (list, callback) { 
    for (let i = 0; i < list.length; i++) {           
      callback(list[i], i);
    }
  }
 
  return { 

    getInput: function () { 
      return {
        type: document.querySelector(DOMstrings.inputType).value, 
        description: document.querySelector(DOMstrings.inputDescription).value, 
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
      };
    },
    addListItem: function (obj, type) { 
      let element, html, newHtml;

      if (type === "inc") {  
        element = DOMstrings.incomeContainer; 
        html = '<div class="item clearfix" id = "inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === "exp") {
        element = DOMstrings.expenseContainer;
        html = '<div class="item clearfix" id = "exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">0%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >'
      }
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type)); 

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },                                                  

    deleteListItem: function (selectorID) {  
      let element = document.getElementById(selectorID); 
      element.parentNode.removeChild(element);
    },

    clearFields: function () { 
      let fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`);
      fields.forEach(inputFields => inputFields.value = "");
      fields[0].focus();
    },

    displayBudget: function (obj) { 
      let type;
      obj.budget >= 0 ? type = "inc" : type = "exp"; 
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) { 
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";  
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentage) {
      let fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
                                                  
      nodeListForEach(fields, function (current, index) { 
        if (percentage[index] > 0) {                       
          current.textContent = percentage[index] + "%"; 
        } else {
          captureEvents.textContent = "---";
        }
      })
    },

    displayMonth: function () { 
      let now, year, month, months
      now = new Date();
      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${year}`;
    },

    changedType: function () { 
      const fields = document.querySelectorAll(`
      ${DOMstrings.inputType},
      ${DOMstrings.inputDescription},
      ${DOMstrings.inputValue}`
      );
      nodeListForEach(fields, function (current) { 
        current.classList.toggle("red-focus");
      })
      document.querySelector(DOMstrings.inputButton).classList.toggle("red"); 
    },

    getDOMstrings: function () { 
      return DOMstrings;
    },
  }
})();


const controller = (function (budgetController, UIController) {   

  const setupEventListeners = function () { 
    const DOM = UIController.getDOMstrings(); 
    document
      .querySelector(DOM.inputButton)
      .addEventListener("click", ctrlAddItem); 

    document.addEventListener("keypress", function (event) { 
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);  
    document.querySelector(DOM.inputType).addEventListener("change", UIController.changedType) 
  };

  const ctrlAddItem = function () {
    const input = UIController.getInput(); 

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

      let newItem = budgetController.addItem(input.type, input.description, input.value);  
      UIController.addListItem(newItem, input.type);
      UIController.clearFields(); 
      updateBudget();
      updatePercentages();
    }
  };

  const ctrlDeleteItem = function (event) { 
    let itemID, splitID, type, ID; 
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id 
    if (itemID) {                                                       
      splitID = itemID.split("-"); 
      type = splitID[0];
      ID = parseInt(splitID[1]);
      budgetController.deleteItem(type, ID); 
      UIController.deleteListItem(itemID); 
      updateBudget(); 
      updatePercentages();

    }
  }
  const updateBudget = function () { 
    budgetController.calculateBudget();      
    const budget = budgetController.getBudget(); 
    UIController.displayBudget(budget); 
  }

  const updatePercentages = function () { 
    budgetController.calculatePercentage();
    let percentage = budgetController.getPercentage(); 
    UIController.displayPercentages(percentage);
  }

  return {
    init: function () {
      setupEventListeners(); 
      UIController.displayMonth(); 
      UIController.displayBudget({
        budget: 0,  
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
    }
  };
})(budgetController, UIController); 

controller.init();
