const moneyP = document.querySelector("#moneyP");
const zaniacButton = document.querySelector("#zaniacButton");

const totalIncome = document.querySelector("#totalIncome");
const topEarnerP = document.querySelector("#topEarner");
const bgdiv = document.querySelector("#bgdiv");

const autoSaveCheckBox = document.getElementById(
"autoSave");


// right number is how many times the page refreshes per second
const UPDATE_INTERVAL = 1000 / 10; 

var dollars = 0;

var upgrade = function (name, startPrice, divID, buttonID, moneyPerSecond) {
    this.name = name;
    this.amount = 0;
    this.price = startPrice;
    this.price_multiplier =  1.4;
    this.moneyPerSecond = moneyPerSecond;

    this.button = document.createElement("button");
    this.button.className = "upgrade";
    this.button.id = buttonID;

    this.button.upgrade = this;

    document.getElementById(divID).appendChild(this.button);

    this.button.onclick = function () {
        if (dollars >= this.upgrade.price) {
            dollars -= this.upgrade.price;
            this.upgrade.amount += 1;
            this.upgrade.price *= this.upgrade.price_multiplier;
            this.upgrade.updateText();
            upgradeUpdate();
        }
    };

    this.updateText = function () {
        let text = this.name;
        text += "<br>Price: $" + this.price.toLocaleString('en',{maximumFractionDigits:2});
        text += "<br>Amount: " + this.amount;

        if(this.moneyPerSecond) {
            text += "<br>Income per Second (each): $" + this.moneyPerSecond.toLocaleString('en',{maximumFractionDigits:2});
            text += "<br>Total Income from Upgrade: $" + 
                    (this.moneyPerSecond * this.amount).toLocaleString('en',{maximumFractionDigits:2});
        }

        this.button.innerHTML = text;
    }
    this.updateText();

    this.saveData = function(){
        let save = {}
        save[this.name] = 
            {
            amount: this.amount,
            price: this.price
            };
        return save;
    };
};

// create upgrades here
const clickPower = new upgrade("Click Power", 10, "mygrid", "clickPower");
const passiveIncome = new upgrade("Passive Income", 100, "mygrid", "passiveIncome");
const clickFarm = new upgrade("Click Farm", 100, "mygrid", "clickFarm", 1);
const clickFactory = new upgrade("Click Factory", 800, "mygrid","clickFactory", 5);
const clickCity= new upgrade("Click City", 3500, "mygrid", "clickCity", 20);
const clickContinent = new upgrade("Click Continent", 15000, "mygrid", 
"clickContinent", 50);
const clickMoon = new upgrade("Click Moon", 100000, "mygrid", 
"clickMoon", 200);
const clickPlanet = new upgrade("Click Planet", 1e6, "mygrid", 
"clickPlanet", 500);
const clickStar = new upgrade("Click Star", 1e7, "mygrid", 
"clickStar", 3000);
const clickGalaxy = new upgrade("Click Galaxy", 1e8, "mygrid", 
"clickGalaxy", 15000);
const clickUniverse = new upgrade("Click Universe", 1e9, "mygrid", 
"clickUniverse", 1e5);

// place all autoclicker upgrades in an iterable
const autoClickers = [clickFarm, clickFactory, clickCity, clickContinent, clickMoon, clickPlanet, clickStar, clickGalaxy, clickUniverse];

// upgrades iterable has all autoclickers plus other buttons
const upgrades = autoClickers.slice();
upgrades.push(clickPower);
upgrades.push(passiveIncome);


zaniacButton.onclick = function() { 
    dollars += 1 + clickPower.amount; 
};


// Passive Income
passiveIncome.price_multiplier = 2;
passiveIncome.updateText = function(){
    let text = "<label>" + this.name;
    text += "</label><label id='smol'><br>(Make money while away)</label><label>";
    text += "<br>Price (+5%) : $" + this.price.toLocaleString('en',{maximumFractionDigits:2}) + "</label>";

    text +=`<br><progress value="${this.amount}"" max="20"></progress>`;
    text += "<br><label>" + this.amount*5 + "%</label>";
    this.button.innerHTML = text;
}
var tempDollars = 0;
var idleStartTime = Infinity;
function incomePerSecond () {
    let income = 0;
    autoClickers.forEach(function(upgrade){
        income += upgrade.amount * upgrade.moneyPerSecond;
    });
    return income;
}
function earnPassiveIncome () {
    let income = incomePerSecond();
    let idleTime = (new Date().getTime()) - idleStartTime;
    tempDollars += income * passiveIncome.amount*5e-5 * idleTime;
    // only applies if it's a bonus
    if (tempDollars>dollars){
        dollars = tempDollars;
    }
    // reset temp values to prevent problems
    tempDollars = 0;
    idleStartTime = Infinity;
}
window.addEventListener("focus", earnPassiveIncome);
window.addEventListener("blur", function(){
    tempDollars = dollars;
    idleStartTime = new Date().getTime();
});


setInterval(function() {
    let income = 0;
    autoClickers.forEach( function(e) {
        dollars += e.amount * e.moneyPerSecond / 1000 * UPDATE_INTERVAL;
        income += e.amount * e.moneyPerSecond;
    });
    moneyP.innerHTML = "<b>$" + dollars.toLocaleString('en',{maximumFractionDigits:2}) + "</b>";
    totalIncome.innerHTML = "Total Income per Second: $" + income.toLocaleString('en',{maximumFractionDigits:2});
    
}, UPDATE_INTERVAL);


function save() {
    let saveData = {"dollars": dollars};
    upgrades.forEach(function(upgrade) {
        saveData[upgrade.name] = {
            amount: upgrade.amount,
            price: upgrade.price
        }
    });
    saveData["autoSave"] = autoSaveCheckBox.checked;
    saveData["timeStamp"] = new Date().getTime();
    localStorage.setItem("clickerSave", JSON.stringify(saveData));
};
document.getElementById("save").onclick = save;
document.getElementById("clear").onclick = function () {
    localStorage.removeItem("clickerSave");
}


function upgradeUpdate() {
    let topEarner = topEarnerCheck();
    if (topEarner === null){
        return;
    }
    topEarnerP.innerText = `Current Top Income Generator: ${topEarner.name}`;


    bgdiv.style.backgroundImage = getComputedStyle(topEarner.button).backgroundImage;
}

function topEarnerCheck() {
    let topEarner = null;

    autoClickers.forEach(function(upgrade) {
        if(upgrade.amount > 0){
            if (topEarner === null){
                topEarner = upgrade;
            } else if (upgrade.amount * upgrade.moneyPerSecond >
                       topEarner.amount * topEarner.moneyPerSecond){
                topEarner = upgrade;
            }
        }
    });
    return topEarner;
}

function load() {
    if (!localStorage.clickerSave) {
        return;
    }
    let saveData = JSON.parse(localStorage.clickerSave);
    dollars = saveData.dollars;
    upgrades.forEach(function (upgrade){
        if (upgrade.name in saveData) {
            upgrade.amount = saveData[upgrade.name]["amount"];
            upgrade.price = saveData[upgrade.name]["price"];
            upgrade.updateText();
        }
    });

    if("autoSave" in saveData) {
        autoSaveCheckBox.checked = saveData["autoSave"];
    }

    if("timeStamp" in saveData) {
        tempDollars = dollars;
        idleStartTime = saveData["timeStamp"];
        earnPassiveIncome();
    }

    document.body.onload = upgradeUpdate;
};
load();

//autosave
setInterval( function () {
    if(autoSaveCheckBox.checked){
        save();
    }
}, 180000);



