"use strict";

function createHTMLElement(tag, inner, attributes) {
  const element = document.createElement(tag);
  if (inner != undefined) {
    if (Array.isArray(inner))
      inner.forEach(e => element.appendChild(e));
    else if (typeof inner == "object")
      element.appendChild(inner)
    else
      element.textContent = inner;
  }
  for (let name in attributes)
    element.setAttribute(name, attributes[name]);
  return element;
}

function removeInnerNodes(element) {
  while (element.firstChild)
    element.removeChild(element.firstChild);
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function decapitalize(str) {
  return str[0].toLowerCase() + str.slice(1);
}

function toCSSClassName(str) {
  const className = str
                  .toLowerCase()
                  .match(/[a-z]\w*/g)
                  .map(capitalize)
                  .join('');
  return decapitalize(className);
}



function hide(element) {
  if (element.classList.contains("unhidden")) {
    element.classList.remove("unhidden");
    element.classList.add("hidden");
  } else if (element.classList.contains("visible")) {
    element.classList.remove("visible");
    element.classList.add("invisible");
  } else {
    element.classList.add("hidden");
  }
}

function unhide(element) {
  if (element.classList.contains("hidden")) {
    element.classList.remove("hidden");
    element.classList.add("unhidden");
  } else if (element.classList.contains("invisible")) {
    element.classList.remove("invisible");
    element.classList.add("visible");
  } else {
    element.classList.add("unhidden");
  }
}

function isHidden(element) {
  let result = false;
  result |= element.classList.contains("hidden")
         || element.classList.contains("invisible");
  if (!result) {
    const style = window.getComputedStyle(element);
    result |= style.display == "none"
           || style.opacity == 0
           || style.visibility == "hidden"
  }
  return result;
}

function fadeIn(element) {
  return new Promise((resolve, reject) => {
    if (isHidden(element)) {
      element.style.opacity = 0;
      unhide(element);
      (function fade() {
        let opacity = +element.style.opacity;
        opacity += 0.1;
        if (opacity <= 1){
          element.style.opacity = opacity;
          requestAnimationFrame(fade);
        }
      })();
    }
  });
}

function fadeOut(element) {
  return new Promise((resolve, reject) => {
    if (!isHidden(element)) {
      element.style.opacity = 1;
      (function fade() {
        let opacity = +element.style.opacity;
        opacity -= 0.1;
        if (opacity >= 0) {
          element.style.opacity = opacity;
          requestAnimationFrame(fade);
        }
        else hide(element);
      })();
    }
  })
}


const cssStylesheet = document.styleSheets[0];

const defaultSettings = {
  selectionOptions: [
    ['Not Entered', '#FFFFFF'],
    ['Favorite'   , '#6DB5FE'],
    ['Like'       , '#23FD22'],
    ['Okay'       , '#FDFD6B'],
    ['Maybe'      , '#DB6C00'],
    ['No'         , '#920000'],
  ],
  kinklistText: "#Bodies\n(General)\n* Skinny\n* Chubby\n* Small breasts\n* Large breasts\n* Small cocks\n* Large cocks\n\n#Clothing\n(Self, Partner)\n* Clothed sex\n* Lingerie\n* Stockings\n* Heels\n* Leather\n* Latex\n* Uniform / costume\n* Cross-dressing\n\n#Groupings\n(General)\n* You and 1 male\n* You and 1 female\n* You and MtF trans\n* You and FtM trans\n* You and 1 male, 1 female\n* You and 2 males\n* You and 2 females\n* Orgy\n\n#General\n(Giving, Receiving)\n* Romance / Affection\n* Handjob / fingering\n* Blowjob\n* Deep throat\n* Swallowing\n* Facials\n* Cunnilingus\n* Face-sitting\n* Edging\n* Teasing\n* JOI, SI\n\n#Ass play\n(Giving, Receiving)\n* Anal toys\n* Anal sex, pegging\n* Rimming\n* Double penetration\n* Anal fisting\n\n#Restrictive\n(Self, Partner)\n* Gag\n* Collar\n* Leash\n* Chastity\n* Bondage (Light)\n* Bondage (Heavy)\n* Encasement\n\n#Toys\n(Self, Partner)\n* Dildos\n* Plugs\n* Vibrators\n* Sounding\n\n#Domination\n(Dominant, Submissive)\n* Dominant / Submissive\n* Domestic servitude\n* Slavery\n* Pet play\n* DD/lg, MD/lb\n* Discipline\n* Begging\n* Forced orgasm\n* Orgasm control\n* Orgasm denial\n* Power exchange\n\n#No consent\n(Aggressor, Target)\n* Non-con / rape\n* Blackmail / coercion\n* Kidnapping\n* Drugs / alcohol\n* Sleep play\n\n#Taboo\n(General)\n* Incest\n* Ageplay\n* Interracial / Raceplay\n* Bestiality\n* Necrophilia\n* Cheating\n* Exhibitionism\n* Voyeurism\n\n#Surrealism\n(Self, Partner)\n* Futanari\n* Furry\n* Vore\n* Transformation\n* Tentacles\n* Monster or Alien\n\n#Fluids\n(General)\n* Blood\n* Watersports\n* Scat\n* Lactation\n* Diapers\n* Cum play\n\n#Degradation\n(Giving, Receiving)\n* Glory hole\n* Name calling\n* Humiliation\n\n#Touch & Stimulation\n(Actor, Subject)\n* Cock/Pussy worship\n* Ass worship\n* Foot play\n* Tickling\n* Sensation play\n* Electro stimulation\n\n#Misc. Fetish\n(Giving, Receiving)\n* Fisting\n* Gangbang\n* Breath play\n* Impregnation\n* Pregnancy\n* Feminization\n* Cuckold / Cuckquean\n\n#Pain\n(Giving, Receiving)\n* Light pain\n* Heavy pain\n* Nipple clamps\n* Clothes pins\n* Caning\n* Flogging\n* Beating\n* Spanking\n* Cock/Pussy slapping\n* Cock/Pussy torture\n* Hot Wax\n* Scratching\n* Biting\n* Cutting",
  username: "Anonymous",
}



class SelectionOption {
  constructor(name, color, selection) {
    this.name = name;
    this.color = color;
    this.element = this.createElement();
    this.selection = selection;
  }

  get cssClassName() {
  	return toCSSClassName(this.name);
  }

  createElement() {
    return createHTMLElement('button', null,
        {class: "circle " + this.cssClassName, title: this.name});
  }

  get cssRule() {
    return `.${this.cssClassName} {background-color: ${this.color};}`
  }

  equals(selectionOption) {
  	return (this.name == selectionOption.name) &&
  				 (this.color == selectionOption.color);
  }
}

class Selection {
  constructor(selectionOptions, kink) {
    this.options = selectionOptions.slice()
                   .map(option => new SelectionOption(...option, this));
    this.value = this.options[0];
    this.element = this.createElement();
    this.kink = kink;
  }

  get index() {
    return this.options.findIndex(value => value == this.value);
  }

  get columnName() {
  	const kink = this.kink;
  	const category = kink.category;
  	let columnName = '';
  	if (category.columnNames.length > 1) {
  		columnName = category.columnNames[kink.selections
  																			.findIndex(x => x == this)];
  	}
  	return columnName;
  }

  createElement() {
    const buttonElements = this.options.map(option => option.element);
    for (let i = 0; i < this.options.length; i++) {
      buttonElements[i].addEventListener('mousedown',
          () => {this.updateSelection(this.options[i])})
    }
    const element = createHTMLElement("div", buttonElements,
                                    {class:"selection"})
    return element;
  }

  updateSelection(value) {
    this.clearSelection();
  	if (!isNaN(Number(value))) {
  		if (value < 0 || value >= this.options.length) {
  			console.error("Selection value out of bounds!", value);
  			value = 0;
  		}
  		this.value = this.options[+value];
  	} else {
	    this.value = value || this.value;
  	}
    const option =
    		this.element.querySelector(`.${toCSSClassName(this.value.name)}`);
    option.classList.add("selected");
  }

  clearSelection() {
    this.value = this.options[0];
    this.element.childNodes
                    .forEach(option => option.classList.remove("selected"));
  }

  equals(selection) {
  	return (this.options.length == selection.options.length) &&
  				 (this.options.every((option, index) =>
  				                     option.equals(selection.options[index])));
  }
}

class Kink {
  constructor(name, columnAmount, selectionOptions, category) {
    this.name = name;
    this.cssClassName = `kink-${toCSSClassName(name)}`;
    this.columnAmount = columnAmount || 1;
    //this.description = description;
    this.selections = [];
    for (let i = 0; i < this.columnAmount; i++)
      this.selections.push(new Selection(selectionOptions, this));
    this.element = this.createRowElement();
    this.category = category;
  }

  createRowElement() {
    const cellElements = [];
    for (let i = 0; i < this.columnAmount; i++)
      cellElements.push(createHTMLElement("td", this.selections[i].element));
    cellElements.push(createHTMLElement("td", this.name));
    const element = createHTMLElement("tr", cellElements,
                                    {class: `kink-row ${this.cssClassName}`});
    return element;
  }

  link(category) {
  	this.category = category;
  	return this;
  }
}

class Category {
  constructor(name, columnNames, kinks, kinklist) {
    this.name = name;
    this.columnNames = columnNames;
    this.kinks = kinks || [];
    this.linkKinks();
    this.tableElement = this.createTableElement();
    this.element = this.createDivElement();
    this.height = this.kinks.length ? this.updateHeight() : 0;
    this.kinklist = kinklist;
  }

  createTableElement() {
    const headerCellElements = [...this.columnNames, '']
          .map(name => createHTMLElement("th", name,
                            name ? {class: "selection-column"} : undefined));
    const theadElement = createHTMLElement("thead", headerCellElements);
    const tbodyElement = createHTMLElement("tbody",
                                         this.kinks.map(kink => kink.element));
    const tableElement = createHTMLElement("table",
                                         [theadElement, tbodyElement],
                                         {class: "kinkGroup"});
    return tableElement;
  }

  createDivElement() {
    const titleElement = createHTMLElement("h2", this.name);
    const divElement =
        createHTMLElement("div", [titleElement, this.tableElement],
            {class: `kinkCategory cat-${toCSSClassName(this.name)}`});
    return divElement;
  }

  addKink(kink) {
    this.kinks.push(kink.link(this));
    this.tableElement.querySelector("tbody").append(kink.element);
  }

  updateKinks(kinkObjects) {
    this.kinks = kinkObjects;
    const updatedTable = this.createTableElement();
    this.tableElement.replaceWith(updatedTable);
    this.tableElement = updatedTable;
    this.updateHeight();
  }

  updateHeight(force) {
    let height;
    //if (this.element.clientHeight)
    //  height = this.element.clientHeight;
    if (force) {
      const clone = this.element.cloneNode(true);
      clone.style.visibility = "hidden";
      document.body.append(clone);
      height = clone.clientHeight;
      clone.remove(); 
    } else {
      const margins = 20;
      const h2 = 27;
      const tableRow = 25;
      height = margins + h2 + tableRow * (this.kinks.length + 1);
    }
    this.height = height;
    return height;
  }

  get kinks() {
  	return this._kinks;
  }

  set kinks(kinkObjects) {
  	this._kinks = kinkObjects;
  	this.linkKinks();
  }

  linkKinks() {
  	for (let kink of this.kinks) {
  		kink.category = this;
  	}
  }
}

class Kinklist {
  constructor(settings) {
    this.categories = [];
    this.columns = [];
    this.kinks = [];
    this.columnHeights = [];
    this.hasCategoriesChanged = false;
    this.settings = settings || defaultSettings;
    this.parseKinklistSettings();
  }

  get localStorageString() {
    const encodedSelections = [];
    for (let kink of this.kinks) {
      for (let selection of kink.selections) {
        encodedSelections.push(selection.index);
      }
    }
    return encodedSelections.join('');
  }

  set localStorageString(kinklistString) {
    const encodedSelections = kinklistString.split('');
    for (let kink of this.kinks) {
      for (let selection of kink.selections) {
        selection.updateSelection(encodedSelections.shift());
      }
    }
  }

  updateColumns() {
    const columnAmount =
        Math.min(4, Math.floor((document.body.scrollWidth - 20) / 400) || 1);

    // Category elements' margins overlap, being accounted twice. This
    // correction value mitigates that discrepancy.
    const overlapCorrection = -10;

    const columns = [];
    const columnHeights = [];
    for (let i = 0; i < columnAmount; i++) columns.push([]);

    this.categories.forEach(category => category.updateHeight());

    const totalHeight = this.categories
                            .reduce((pv, category) => pv + category.height, 0);
    const goalColumnHeight = totalHeight / columnAmount;

    let columnIndex = 0;
    let currentColumnHeight = 0;
    for (let i = 0; i < this.categories.length; i++) {
      const category = this.categories[i];
      columns[columnIndex].push(category);
      currentColumnHeight += category.height + overlapCorrection;
      if ((currentColumnHeight + category.height / 2) > goalColumnHeight) {
        columnHeights[columnIndex] = currentColumnHeight;
        columnIndex++;
        currentColumnHeight = 0;
      }
    }
    if (columnIndex < columnAmount)
      columnHeights[columnAmount - 1] = currentColumnHeight;
    this.columns = columns;

    if (this.hasCategoriesChanged ||
        this.columns.length != columnAmount ||
        !columnHeights.every((height, index) =>
                             height == this.columnHeights[index])
       ) {
      const categoryElements =
          this.columns.map(column => 
                           column.map(category => category.element));
      const columnElements =
            categoryElements.map(column => createHTMLElement("div", column));
      const inputListElement = document.querySelector("#Kinklist");
      removeInnerNodes(inputListElement);
      inputListElement.append(...columnElements);
      this.hasCategoriesChanged = false;
    }
  }

  updateKinks() {
    this.kinks = [].concat(...this.categories.map(category => category.kinks));
  }

  appendCategory(...categories) {
    for (let category of categories) {
      this.categories.push(category);
    }
    this.updateKinks();
  }

  addCategory(...categories) {
    this.appendCategory(...categories);
    this.hasCategoriesChanged = true;
  }

  removeCategory(...categoriesToRemove) {
    this.categories = this.categories
            .filter(category => !categoriesToRemove.includes(category));
    this.updateKinks();
    this.hasCategoriesChanged = true;
  }

  flush() {
    for (let kink of this.kinks) {
      for (let selection of kink.selections) {
        selection.clearSelection();
      }
    }
  }
 
  parseKinklistSettings(inputString) {
    this.settings.kinklistText = inputString || this.settings.kinklistText;
    const regexp = new RegExp(/#(.+)\n\((.+)\)\n((?:\*.+\n?)+)/g);
    let match;
    let matches = [];

    while ((match = regexp.exec(this.settings.kinklistText)) != null) {
      match[2] = match[2].split(/,\s+/);
      match[3] = match[3]
                    .trim()
                    .split('\n')
                    .map(kinkString => kinkString.replace(/\*\s*/, ''));
      match.shift();
      matches.push(match);
    }

    const newCategories = [];
    const extraCategories = new Set(this.categories.slice());
    const categoryNames = [];
    matches.forEach(match => {
      let [newCategoryName, columns, kinks] = match;
      categoryNames.push(newCategoryName);
      let existingCategory = this.categories
              .find(category => category.name == newCategoryName);
      kinks = kinks.map(kinkName => 
                        this.kinks.find(kinkObject => 
                                        kinkObject.name == kinkName)
                          || new Kink(kinkName, columns.length,
                                      this.settings.selectionOptions)
                       );
      if (existingCategory) {
        existingCategory.updateKinks(kinks);
        extraCategories.delete(existingCategory);
      }
      else
        newCategories.push(new Category(newCategoryName, columns, kinks, this));
    })
    if (extraCategories) this.removeCategory(...extraCategories);
    if (newCategories) this.appendCategory(...newCategories);
    // Sort categories in order they were specified in the file.
    this.categories =
        categoryNames.map(name => this.categories
                                      .find(category => category.name == name));
    this.updateColumns();
  }
}

class Font {
  constructor(fontString) {
    const match = /(?:(\w+)\s+)?(\d+)px\s+(\w+)/.exec(fontString);
    [this.value, this.style, this.size, this.font] = match;
    this.size = +this.size;
  }
}

class Drawcall {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    for (const key in data) {
      if (key != 'x' && key != 'y') this[key] = data[key];
    }
  }
}

class KinklistCanvasDrawerCircleSettings {
  constructor(circleObject) {
    for (const key in circleObject) {
      this[key] = circleObject[key];
    }
  }

  get size() {
    return this.radius + this.margin + this.border.width;
  }
}

class KinklistCanvasDrawer {
  constructor(kinklistObject, username) {
    this.kinklist = kinklistObject;
    this.username = username || kinklistObject.settings.username;
    this.settings = {
      margins: {
        // Global.
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,

        // Vertical spacing between:
        // Kinklist title and categories
        title: 10,
        // Category title and subtitle
        subtitle: 3,
        // Kinks
        kink: 2,
        // Category title and first kink
        categoryTitle: 10,
        // Categories
        category: 10,

        // Horizontal spacing between:
        // Legend elements
        legend: 3,
        // Selection circle and kink name
        kinkText: 5,
      },
      column: {
        amount: 6,
        width: 250,
      },
      legend: {
        width: 120,
      },
      canvas: {
        width: 1520,
        //height: 1200,
        backgroundColor: "#FFFFFF",
      },
      circle: new KinklistCanvasDrawerCircleSettings({
        radius: 8,
        color: "#FFFFFF",
        margin: 1,
        border: {
          width: 1,
          color: "#0000007F",
        },
      }),
      text: {
        legend: new Font("bold 13px Arial"),
        title: new Font("bold 24px Arial"),
        categoryTitle: new Font("bold 12px Arial"),
        categorySubtitle: new Font("italic 12px Arial"),
        kinkTitle: new Font("12px Arial"),

        color: "#000000",
        align: "start",
        baseline: "middle",
      },
    }

    this.canvas = this.createCanvas();
    this.context = this.createContext(this.canvas);
  }

  get filename() {
  	return `Kinklist (${this.username}).png`;
  }

  createCanvas(height = this.settings.canvas.height,
               width = this.settings.canvas.width) {
    const canvas = createHTMLElement("canvas", null,
                                     {width: width, height: height,
                                      id: "KinklistCanvas"});
    canvas.height = height;
    canvas.width = width;
    canvas.addEventListener("click", () => {
    	let anchor = document.createElement("a");
    	anchor.href = canvas.toDataURL();
    	anchor.download = this.filename;
    	anchor.click();
    })
    return canvas;
  }
  createContext(canvas = this.canvas) {
    const context = canvas.getContext('2d');
    context.fillStyle = this.settings.canvas.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return context;
  }

  drawDebug(drawcall, context = this.context) {
    const debugDrawcall =
        new Drawcall(drawcall.x, drawcall.y,
                     {color:"#FF0000", radius:2, border:{width:0}});
    this.drawCircle(debugDrawcall, context);
  }

  drawText(drawcall, context = this.context) {
    //{text, font / color, align, baseline, debug}
    const text = this.settings.text;
    context.fillStyle = drawcall.color || text.color;
    context.textAlign = drawcall.align || text.align;
    context.textBaseline = drawcall.baseline || text.baseline;
    context.font = drawcall.font.value;
    context.fillText(drawcall.text, drawcall.x, drawcall.y);
    if (drawcall.debug) {
      this.drawDebug(drawcall, this.context);
      context.beginPath();
      context.moveTo(drawcall.x, drawcall.y);
      context.lineTo(drawcall.x + context.measureText(text).width, drawcall.y);
      context.strokeStyle = "#FF0000";
      context.borderWidth = 1;
      context.stroke();
      console.log(context.measureText(text));
    }
  }
  drawCircle(drawcall, context = this.context) {
    // {color / radius, border: {width, color}, debug}
    context.beginPath();
    const x = drawcall.x;
    const y = drawcall.y;
    const circle = this.settings.circle;
    const border = drawcall.border || circle.border;
    const borderWidth = border.width;
    const borderColor = border.color;
    // By default border is drawn in the middle of a circumference,
    // so we need to extend the radius to make the border face outwards.
    const radius = (drawcall.radius || circle.radius) + borderWidth / 2;
    const color = drawcall.color || circle.color;

    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = borderColor;
    context.lineWidth = borderWidth;
    context.stroke();
    if (drawcall.debug) this.drawDebug(drawcall, this.context);
  }

  drawKink(drawcall, context = this.context) {
    // {kinkObject: {selections[], name} / margin}
    const circle = this.settings.circle;
    for (const selection of drawcall.kinkObject.selections) {
      const circleDrawcall = 
          new Drawcall(drawcall.x, drawcall.y, {color: selection.value.color});
      this.drawCircle(circleDrawcall, context);
      drawcall.x += circle.size * 2;
    }
    drawcall.x -= circle.size;
    // Avoiding nullish coalescing (??) for backwards compatibility with iOS.
    drawcall.x += Number.isFinite(drawcall.margin)
                  ? drawcall.margin : this.settings.margins.kinkText;
    drawcall.y -= this.settings.text.kinkTitle.size / 2;
    const textDrawcall =
        new Drawcall(drawcall.x, drawcall.y, 
                     {text: drawcall.kinkObject.name,
                      font: drawcall.font || this.settings.text.kinkTitle,
                      baseline: "top"});
    this.drawText(textDrawcall, context);
  }

  drawCategory(drawcall, context = this.context) {
    // {categoryObject}
    const font = this.settings.text;
    const circle = this.settings.circle;
    const kinkHeight = Math.max(2 * circle.size, font.kinkTitle.size);
    const categoryTitleDrawcall =
        new Drawcall(drawcall.x, drawcall.y,
                     {text: drawcall.categoryObject.name,
                      font: font.categoryTitle});
    this.drawText(categoryTitleDrawcall, context);
    const subtitleExists = drawcall.categoryObject.columnNames.length > 1;
    if (subtitleExists) {
      drawcall.y += font.categoryTitle.size / 2;
      drawcall.y += font.categorySubtitle.size / 2;
      drawcall.y += this.settings.margins.subtitle;
      const categorySubtitleDrawcall =
          new Drawcall(drawcall.x, drawcall.y,
                       {text: drawcall.categoryObject.columnNames.join(', '),
                        font: font.categorySubtitle});
      this.drawText(categorySubtitleDrawcall, context);
    }
    drawcall.x += circle.size;
    drawcall.y += (font.categoryTitle.size + font.kinkTitle.size) / 2;
    drawcall.y += this.settings.margins.categoryTitle;
    for (const kinkObject of drawcall.categoryObject.kinks) {
      const kinkDrawcall =
          new Drawcall(drawcall.x, drawcall.y, {kinkObject: kinkObject});
      this.drawKink(kinkDrawcall, context);
      drawcall.y += kinkHeight + this.settings.margins.kink;
    }
  }

  drawKinklist(kinklistObject = this.kinklist, context = this.context) {
    const margins = this.settings.margins;
    const font = this.settings.text;
    const columns =
        this.spreadCategoriesAcrossColumns(kinklistObject.categories);
    const columnHeights =
        columns.map(column => column.map(category =>
                               this.calculateCategoryHeight
                               .bind(this)(category))
                          .reduce((x, y) => (x + y + margins.category)));
    const canvasHeight = Math.max(...columnHeights)
                       + margins.top
                       + margins.bottom
                       + margins.title
                       + font.title.size;
    context.canvas.height = canvasHeight;

    context.fillStyle = "white";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    let x = margins.left;
    let y = margins.top;

    let titleDrawcall =
        new Drawcall(x, y, {text: `Kinklist (${this.username})`,
                            font: font.title,
                            baseline: "top"});
    this.drawText(titleDrawcall, context);

    let legendX = this.settings.canvas.width
                - margins.right
                - this.settings.legend.width
                    * kinklistObject.settings.selectionOptions.length
                + this.settings.circle.size;
    let legendY = y + this.settings.circle.size;
    for (let [name, color] of kinklistObject.settings.selectionOptions) {
      let legendDrawcall =
          new Drawcall(legendX, legendY,
                       {kinkObject: {
                          selections: [{value: {color: color}}],
                          name: name,
                        },
                        font: font.legend,
                        margin: margins.legend,
                       });
      this.drawKink(legendDrawcall, context);
      legendX += this.settings.legend.width;
    }

    x += this.settings.circle.size;
    y += this.settings.circle.size + font.title.size + margins.title;
    for (const column of columns) {
      let [categoryX, categoryY] = [x, y];
      for (let category of column) {
        let categoryDrawcall =
            new Drawcall(categoryX, categoryY, {categoryObject: category});
        this.drawCategory(categoryDrawcall, context);
        categoryY += this.calculateCategoryHeight(category);
        categoryY += margins.category;
      }
      x += this.settings.column.width;
    }
  }

  calculateCategoryHeight(category) {
    let categoryHeight = 0;
    const margins = this.settings.margins;
    const font = this.settings.text;
    const circle = this.settings.circle;
    categoryHeight += font.categoryTitle.size;
    if (category.columnNames.length > 1) {
      categoryHeight += font.categorySubtitle.size + margins.subtitle;
    }
    categoryHeight += margins.categoryTitle;
    const kinkHeight = Math.max(2 * circle.size, font.kinkTitle.size);
    categoryHeight += (kinkHeight + margins.kink) * category.kinks.length;
    // Last kink doesn't require a margin below it.
    categoryHeight -= margins.kink;
    return categoryHeight;
  }
  spreadCategoriesAcrossColumns(categories, categoryHeights = []) {
    if (!categoryHeights.length) {
      categoryHeights = categories.map(this.calculateCategoryHeight.bind(this));
    }
    const columns = [];
    for (let i = 0; i < this.settings.column.amount; i++) {
      columns.push([]);
    }
    const margins = this.settings.margins;
    const totalHeight = categoryHeights.reduce((x, y) => x + y);
    const averageHeight = totalHeight / this.settings.column.amount;
    const columnHeights = columns.map(_ => 0);
    let columnIndex = 0;
    columns[0].push(categories[0]);
    for (let i = 1; i < categories.length; i++) {
      if ((columnHeights[columnIndex] + categoryHeights[i] / 2) > averageHeight
          && columnIndex + 1 < this.settings.column.amount) {
        columnIndex++;
      }
      columns[columnIndex].push(categories[i]);
      columnHeights[columnIndex] += categoryHeights[i];
    }
    return columns;
  }
}



class Carousel {
  constructor(kinklistObject, carouselElement) {
    this.kinklist = kinklistObject;
    this.rootElement = carouselElement
                       || document.querySelector("#CarouselInput");
    this.initialize(); // this.selections, this.index;
  }

  get selection() {
  	return this.selections[this.index];
  }
  get enabled() {
    return this.rootElement.classList.contains("unhidden");
  }
  set enabled(value) {
    value ? unhide(this.rootElement) : hide(this.rootElement);
  }

  moveIndexForward(amount = 1) {
  	this.previousSelection = this.selection;
    this.index = this.nextIndex(amount);
    this.update();
  }

  moveIndexBackward(amount = 1) {
  	this.previousSelection = this.selection;
    this.index = this.previousIndex(amount);
    this.update();
  }

  nextIndex(amount = 1) {
  	return (this.index + amount) % this.selections.length;
  }

  previousIndex(amount = 1) {
    return (this.index - amount + this.selections.length) %
    				this.selections.length;
  }

  select(optionNumber) {
  	this.selections[this.index].updateSelection(optionNumber);
  	this.moveIndexForward();
  }

  update() {
  	this.updateSurroundingInputElements();
  	if (!this.selection.equals(this.previousSelection)) {
  		this.updateInputValues(this.selection);
  	}
  	this.updateInputCurrentElementState();
  }

  refresh() {
  	this.selections =
  			[].concat(...this.kinklist.kinks.map(kink => kink.selections));
  	const oldIndex = this.index || 0;
  	this.index =
  			this.selections.findIndex(selection =>
  			                          selection.value.name == "Not Entered");
  	if (this.index == -1) this.index = oldIndex;
  	this.previousSelection = this.selection;
  }

  initialize() {
  	this.refresh();
  	this.updateInputValues(this.selection);
  	this.update();
  }

  createInputValues(selection) {
  	const bigChoiceDivElements = [];
  	for (let i = 0; i < selection.options.length; i++) {
  		const option = selection.options[i];
	  	const circleElement =
	  			createHTMLElement("span", '',
	  			                  {class: `circle ${option.cssClassName}`});
	  	const nameElement =
	  			createHTMLElement("span", option.name, {class: "legend-text"});
	  	const buttonNumberTextElement =
	  			createHTMLElement("span", i, {class: "button-number-text"});
	  	const bigChoiceDivElement =
	  			createHTMLElement("div",
	  			                  [circleElement,
	  			                  	nameElement,
	  			                  	buttonNumberTextElement],
	  			                  {class: "selection-option"});
	  	if (selection.value == option) {
	  		bigChoiceDivElement.classList.add("selected");
	  	}

	  	bigChoiceDivElement.addEventListener("mousedown", () => {
	  		this.select(i);
	  	})

	  	bigChoiceDivElements.push(bigChoiceDivElement);
  	}
  	return bigChoiceDivElements;
  }

  updateInputValues(selection) {
  	const inputValuesElement =
        this.rootElement.querySelector("#CarouselValues");
  	removeInnerNodes(inputValuesElement);
  	inputValuesElement.append(...this.createInputValues(selection));
  }

  updateInputCurrentElementState(selection = this.selection) {
  	const kink = selection.kink;
  	const category = kink.category;
  	this.rootElement.querySelector("#CarouselCategory").textContent =
  			category.name;
  	this.rootElement.querySelector("#CarouselKink").textContent = kink.name;
  	this.rootElement.querySelector("#CarouselColumn")
        .textContent = selection.columnName;
  	const selectedElement = this.rootElement.querySelector(".selected");
  	if (selectedElement) selectedElement.classList.remove("selected");
  	const newSelectedElement =
  			this.rootElement
            .querySelector(`#CarouselCurrent .${selection.value.cssClassName}`)
  					.parentElement;
  	newSelectedElement.classList.add("selected");
  }

  updateInputPreviousElement() {
  	const kinkSimpleDivElements = [];
  	for (let i = 3; i > 0; i--) {
  		const selection = this.selections[this.previousIndex(i)];
  		const kinkSimpleDivElement = this.createKinkSimpleDivElement(selection);
			kinkSimpleDivElement.addEventListener("mousedown", () => {
				this.moveIndexBackward(i);
			});
  		kinkSimpleDivElements.push(kinkSimpleDivElement);
  	}
  	const inputPreviousElement =
        this.rootElement.querySelector("#CarouselPrevious");
  	removeInnerNodes(inputPreviousElement);
  	inputPreviousElement.append(...kinkSimpleDivElements);
  }

  updateInputNextElement() {
  	const kinkSimpleDivElements = [];
  	for (let i = 1; i <= 3; i++) {
  		const selection = this.selections[this.nextIndex(i)];
  		const kinkSimpleDivElement = this.createKinkSimpleDivElement(selection);
			kinkSimpleDivElement.addEventListener("mousedown", () => {
				this.moveIndexForward(i);
			});
  		kinkSimpleDivElements.push(kinkSimpleDivElement);
  	}
  	const inputNextElement = this.rootElement.querySelector("#CarouselNext");
  	removeInnerNodes(inputNextElement);
  	inputNextElement.append(...kinkSimpleDivElements);
  }

  updateSurroundingInputElements() {
  	this.updateInputPreviousElement();
  	this.updateInputNextElement();
  }

  createKinkSimpleDivElement(selection) {
		const categoryName = selection.kink.category.name;
		const columnName = selection.columnName;
		const kinkName = selection.kink.name;
		const choiceElement =
				createHTMLElement("span", '', 
				                  {class: `circle ${selection.value.cssClassName}`});
		const categoryElement =
				createHTMLElement("span", categoryName, {class: "category"});
		const columnElement =
				createHTMLElement("span", columnName, {class: "column"});
		const kinkElement =
				createHTMLElement("span", kinkName, {class: "kink"});
		const kinkSimpleDivElement =
				createHTMLElement("div",
				                  [choiceElement,
				                  	categoryElement,
				                  	columnElement,
				                  	kinkElement],
				                  {class: "selection-simple"});
		return kinkSimpleDivElement;
  }
}



function appendCSSRuleToStylesheet(rule) {
  cssStylesheet.insertRule(rule, cssStylesheet.cssRules.length)
}

function generateLegend(selectionOptions) {
  const legendOptionElements = selectionOptions.map(option => {
    const legendText = createHTMLElement("span", option.name,
                                       {class: "selection-name"});
    const legendMarker =
        createHTMLElement("span", null,
                          {
                            "class":
                              `circle ${toCSSClassName(option.name)}`,
                            "data-color": option.color
                          });
    const optionDiv = createHTMLElement("div", [legendMarker, legendText],
                                        {class: "selection"});
    return optionDiv;
  });
  const legendElement = document.querySelector(".legend");
  removeInnerNodes(legendElement);
  legendElement.append(...legendOptionElements);
}

function generateSelectionOptionCSS(selectionOptions) {
  selectionOptions.forEach(option => appendCSSRuleToStylesheet(option.cssRule));
}

function uploadToImgur(blob, filename) {
  return new Promise((resolve, reject) => {
    const data = new FormData();
    data.append("image", blob);
    data.append("type", "file");
    data.append("name", filename);

    const xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function() {
      resolve(JSON.parse(this.responseText));
    });

    xhr.addEventListener("error", function() {
      console.error("Error");
      reject(this);
    })

    xhr.addEventListener("timeout", function() {
      console.error("Timeout");
      reject(this);
    })

    xhr.open("POST", "https://api.imgur.com/3/image");
    xhr.setRequestHeader("Authorization", "Client-ID 546c25a59c58ad7");
    xhr.setRequestHeader("Accept", "application/json");

    xhr.send(data);
  });
}

class StorageHandler {
  constructor(kinklist) {
    this.kinklist = kinklist;
    this.initialize();
    return this;
  }

  initialize() {
    const defaults = {
      imgurData: '{}',
    };
    for (let key in defaults) {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, defaults[key]);
      }
    }
  }

  reset() {
    localStorage.clear();
    this.initialize();
  }

  storeImgurData(data) {
    let imgurData = JSON.parse(localStorage.getItem("imgurData"));
    imgurData[data.id] = data.deletehash;
    localStorage.setItem("imgurData", JSON.stringify(imgurData));
  }
}

function init() {
  const kinklist = new Kinklist();
  const storageHandler = new StorageHandler(kinklist);
  
  const selectionOptionObjects = kinklist.settings
      .selectionOptions.map(option => new SelectionOption(...option));
  generateLegend(selectionOptionObjects);
  generateSelectionOptionCSS(selectionOptionObjects);
  appendCSSRuleToStylesheet("#KinklistCanvas{border:solid 1px black; width: 100%;}");



  (function() {
    let lastResize = 0;
    window.addEventListener("resize", () => {
      let currentTime = Date.now();
      lastResize = currentTime;
      setTimeout(() => {
        if (currentTime == lastResize) {
          kinklist.updateColumns();
        }
      }, 150)
    })
  })()

  const kinklistElement = document.querySelector("#Kinklist");
  const exportButtonElement = document.querySelector(".export-button");
  const exportLinkElement = document.querySelector(".export-link");
  const generateButtonElement = document.querySelector(".generate-button");
  const loadingElement = document.querySelector(".export-loading");
  const settingsButtonElement = document.querySelector(".settings-button");
  const settingsOverlayElement = document.querySelector("#SettingsInput");
  const settingsConfirmButtonElement = document.querySelector("#SettingsConfirmButton");
  const settingsTextareaElement = document.querySelector("#SettingsKinklistText");
  const startButtonElement = document.querySelector(".input-button");
  const resetButtonElement = document.querySelector(".reset-button");
  const inputOverlayElement = document.querySelector("#CarouselInput");
  const closeOverlayButtonElements = document.querySelectorAll(".close-overlay");
  const overlayChildrenElements = document.querySelectorAll(".overlay > *");

  settingsTextareaElement.value = kinklist.settings.kinklistText;

  // Shared variables for following event handlers.
  let kinklistCanvasDrawer;
  let carousel;

  async function exportButtonEventHandler() {
    if (kinklistCanvasDrawer) {
      hide(exportLinkElement);
      unhide(loadingElement);
      const blob = await new Promise((res, rej) => {
        kinklistCanvasDrawer.canvas.toBlob(blob => res(blob));
      });
      const filename = kinklistCanvasDrawer.filename;
      uploadToImgur(blob, filename)
        .then(result => {
          console.log(result);
          hide(loadingElement);
          exportLinkElement.value = result.data.link;
          unhide(exportLinkElement);
          storageHandler.storeImgurData(result.data);
        })
        .catch(error => {
          console.error(error);
          hide(loadingElement);
        });
    }
  }
  function generateButtonEventHandler() {
    const username =
        window.prompt("Enter nickname:", kinklist.settings.username);
    if (username) {
      kinklist.settings.username = username;
      kinklistCanvasDrawer = new KinklistCanvasDrawer(kinklist, username);
      kinklistCanvasDrawer.drawKinklist();
      const canvasElement = document.querySelector("#KinklistCanvas");
      if (canvasElement) {
        canvasElement.replaceWith(kinklistCanvasDrawer.canvas);
      } else {
        kinklistElement.before(kinklistCanvasDrawer.canvas);
      }
      if (!exportButtonElement.style.display) {
        fadeIn(exportButtonElement, "inline-block");
      }
    } 
  }
  function fadeInEventHandler(event) {
    fadeIn(event.currentTarget);
  }
  function fadeOutEventHandler(event) {
    fadeOut(event.currentTarget)
  }
  function settingsButtonEventHandler() {
    fadeIn(settingsOverlayElement)
  }
  function settingsConfirmButtonEventHandler() {
    settingsConfirmButtonElement.disabled = true;
    kinklist.parseKinklistSettings(settingsTextareaElement.value);
    fadeOut(settingsOverlayElement)
    settingsConfirmButtonElement.disabled = false;
  }
  function startButtonEventHandler() {
    if (!carousel) {
      carousel = new Carousel(kinklist);
    } else {
      carousel.refresh();
      carousel.update();
    }
    fadeIn(inputOverlayElement);
  }
  function keyboardEventHandler(pressed) {
    if (carousel && carousel.enabled && Number.isInteger(+pressed.key)
        && pressed.key < carousel.selection.options.length) {
      carousel.select(+pressed.key);
    }
  }
  function dontPropagate(e) {
    e.stopPropagation();
  }
  function resetButtonEventHandler() {
    kinklist.flush();
    const kinklistCanvasElement = document.querySelector("#KinklistCanvas");
    if (kinklistCanvasElement) {
      kinklistCanvasElement.remove();
    }
    exportLinkElement.value = '';
    fadeOut(exportLinkElement);
    fadeOut(exportButtonElement);
  }

  [
   [generateButtonElement, generateButtonEventHandler],
   [exportButtonElement, exportButtonEventHandler],
   [settingsButtonElement, settingsButtonEventHandler],
   [settingsOverlayElement, fadeOutEventHandler],
   [settingsConfirmButtonElement, settingsConfirmButtonEventHandler],
   [startButtonElement, startButtonEventHandler],
   [inputOverlayElement, fadeOutEventHandler],
   [resetButtonElement, resetButtonEventHandler],
   [closeOverlayButtonElements, fadeOutEventHandler],
   [overlayChildrenElements, dontPropagate],
  ].forEach(([element, handler]) => {
    const attachHandler = (e, h) => e.addEventListener("mousedown", h);
    if (element instanceof NodeList) {
      element.forEach(e => attachHandler(e, handler));
    } else {
      attachHandler(element, handler);
    }
  });
  document.addEventListener("keydown", keyboardEventHandler);
}

if (document.readyState === 'loading') { 
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}