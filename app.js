/*
1. UI module
    get input values
    add the new item to the UI
    update the UI
2. DATA module
    add the new item to our data structure
    calculate budget
3. controller module
    add event handler
*/

/*******************
* Procedure

1. set up click event listener
2. reading input data
3. creating initialization function
4. creating income and expense function constructors
5. adding a new item to budget controller
6. adding a new item to the UI
7. clearing input fields
8. updating the budget: controller
9. updating the budget: budget controller
10. updating the budget: UI controller
11. delete event listener using event delegation
12. deleting an item from budget Controller
13. deleting an item from the UI
14. update percentages: controller
15. update percentages: budget controller
16. update percentages: UI controller
17. format budget number: string manipulation
18. display current month and year
19. using change event improve UX

*/

var budgetController = (function() {
    var Expense = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calculatePercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function() {
        return this.percentage;  
    };
    var Income = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    var calculateTotal = function(type) {
        var sum;
        sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type]=sum;
    }
    
    
    return {
        addItem: function(type, description, value) {
            var newItem,ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            } else {
                ID = 0;
            }
            if (type === 'inc') {
                newItem = new Income(ID, description,value);
            } else if (type === 'exp') {
                newItem = new Expense(ID, description,value);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        calculateBudget: function() {
            var totalIncome, totalExpenses;
            calculateTotal('inc');
            calculateTotal('exp');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        deleteItem: function(type, id) {
            var ids,index;
            ids = data.allItems[type].map(function(cur) {
                return cur.id; 
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index,1);
            }
            console.log(data);
        },
        calculatePercentage: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calculatePercentage(data.totals.inc); 
            });
        },
        getPercentage: function() {
            var allPerc;
            allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        }
        
    };
})();

var UICtroller = (function() {
    var DOMstrings = {
        inputBtn: '.add__btn',
        inputDes: '.add__description',
        inputValue: '.add__value',
        inputType: '.add__type',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i],i);
        }  
    };
    
    var formatNumber = function(num,type) {
        var num, Split, int, dec, sign;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3) {
            int = int.substr(0,int.length-3) +','+int.substr(int.length-3,3);
        }
        sign = type === 'exp' ? '-' : '+';
        return sign + ' '+int+'.'+dec;
    }
    
    return {
        getDOMstrings: function() {
            return DOMstrings;
        },
        
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDes).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, ele;
            if (type === 'inc') {
                ele = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                ele = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // insert the HTML into DOM
            document.querySelector(ele).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteListItem: function(itemID) {
            var ele;
            ele = document.getElementById(itemID);
            ele.parentNode.removeChild(ele);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDes+','+DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(cur, index, array) {
                cur.value = ""; 
            });
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+'%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        displayPercentage: function(percentages) {
            var fields;
            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            nodeListForEach(fields,function(cur, index) {
                if (percentages[index] > 0) {
                    cur.textContent = percentages[index]+'%';
                } else {
                    cur.textContent = '---';
                }
            });
        },
        displayMonth: function() {
            var now, month, months, year;
            now = new Date();
            months = ['January','Febuary','March','April','May','June','July','August','September','October','November','December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+ year;
        },
        changedType: function() {
            var fields;
            fields = document.querySelectorAll(
                DOMstrings.inputType+','+
                DOMstrings.inputDes+','+
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
    };
})();

var controller = (function(budgetCtrl, UICtrl) {
    
    
    var setupListener = function() {
         var DOM = UICtrl.getDOMstrings(); document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    };
    var updateBudget = function() {
        var budget;
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentage = function() {
        var percentages;
        // 1. calculate the percentage
        budgetCtrl.calculatePercentage();
        // 2. read the percentage from the budget controller
        percentages = budgetCtrl.getPercentage();
        // 3. update the UI with the new percentage
        UICtrl.displayPercentage(percentages);
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        // 1. get the field input data
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type,input.description, input.value);
            // 3. add the item to the UI
            UICtrl.addListItem(newItem,input.type);
            // 4. clear the fields
            UICtrl.clearFields();
            
            // 5. update budget
            updateBudget();
            updatePercentage();
        }
        
    };
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 1. delete the item from the data
            budgetCtrl.deleteItem(type, ID);
            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. update and show the new budget
            updateBudget();
            updatePercentage();
        }
    };
    
    return {
        init: function() {
            UICtrl.displayMonth();
            updateBudget();
            setupListener();
        }
    };
})(budgetController,UICtroller);

controller.init();