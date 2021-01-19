"use strict";

function createHTMLElement(cssSelector, inner, attributes) {
  /* Separates tag from additional componenets.
   * Permitted components, in any order:
   * .classname
   * #ID
   * [attribute] or [attribute=value]
   * Must be without any spaces, permitted characters: A-Za-z0-9_-
   * Example: button#ExportButton.hidden[disabled]
   */
  const regex = /([\w-]+)((?:(?:[#.][\w-]+)|(?:\[[\w-]+(?:=[\w-]*)?\]))+)?/;
  const [_, tag, components] = cssSelector.match(regex);
  const element = document.createElement(tag);

  if (inner != undefined) {
    if (Array.isArray(inner))
      inner.forEach(e => element.appendChild(e));
    else if (typeof inner == "object")
      element.appendChild(inner);
    else
      element.textContent = inner;
  }

  for (let name in attributes) {
    element.setAttribute(name, attributes[name]);
  }

  if (components) {
    const classRegex = /\.[\w-]+/g
    const idRegex = /\#[\w-]+/g
    const attributeRegex = /\[[\w-]+(?:=[\w-]*)?\]/g
    const classes = (components.match(classRegex) || []).map(x => x.slice(1));
    const ids = (components.match(idRegex) || []).map(x => x.slice(1));
    const attributes =
        (components.match(attributeRegex) || []).map(x => x.slice(1, -1));
    for (let className of classes) {
      element.classList.add(className);
    }
    for (let id of ids) {
      element.id = id;
    }
    for (let attribute of attributes) {
      const [name, value] = attribute.split('=');
      element.setAttribute(name, value || '');
    }
  }
  return element;
}

function removeInnerNodes(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
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
        } else {
          resolve();
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
        } else {
          hide(element);
          resolve();
        }
      })();
    }
  });
}

function focus(element) {
  window.setTimeout(() => element.focus(), 0);
}

function binarySearch(min, max, searchFunction) {
  while (min < max) {
    const mid = Math.floor((min + max) / 2);
    if (searchFunction(mid)) {
      max = mid;
    } else {
      min = mid + 1;
    }
  }
  return min;
}

function partitionIntoColumns(heights, amount) {
  function partitionUnder(heights, maxHeight) {
    const columns = [];
    let columnHeight = 0;
    for (let i = 0; i < heights.length; i++) {
      if (columnHeight + heights[i] > maxHeight) {
        columnHeight = 0;
        columns.push(i);
      }
      columnHeight += heights[i];
    }
    columns.push(heights.length);
    return columns;
  }

  function canPartitionUnder(heights, amount, maxHeight) {
    return partitionUnder(heights, maxHeight).length <= amount;
  }

  const maxHeight = heights.reduce((x, y) => Math.max(x, y));
  const totalHeight = heights.reduce((x, y) => x + y);
  const searchFunction = canPartitionUnder.bind(null, heights, amount);
  const target = binarySearch(maxHeight, totalHeight, searchFunction);

  return partitionUnder(heights, target);
}

function spreadAcrossColumns(array, partitioning) {
  const columns = [];
  let start = 0;
  for (let end of partitioning) {
    columns.push(array.slice(start, end));
    start = end;
  }
  return columns;
}


const cssStylesheet = document.styleSheets[0];

const defaultSettings = {
  legend: [
    ['Not Entered', '#FFFFFF'],
    ['Favorite'   , '#6DB5FE'],
    ['Like'       , '#23FD22'],
    ['Okay'       , '#FDFD6B'],
    ['Maybe'      , '#DB6C00'],
    ['No'         , '#920000'],
  ],
  data: "#Bodies\n(General)\n* Skinny\n* Chubby\n* Small breasts\n* Large breasts\n* Small cocks\n* Large cocks\n\n#Clothing\n(Self, Partner)\n* Clothed sex\n* Lingerie\n* Stockings\n* Heels\n* Leather\n* Latex\n* Uniform / costume\n* Cross-dressing\n\n#Groupings\n(General)\n* You and 1 male\n* You and 1 female\n* You and MtF trans\n* You and FtM trans\n* You and 1 male, 1 female\n* You and 2 males\n* You and 2 females\n* Orgy\n\n#General\n(Giving, Receiving)\n* Romance / Affection\n* Handjob / fingering\n* Blowjob\n* Deep throat\n* Swallowing\n* Facials\n* Cunnilingus\n* Face-sitting\n* Edging\n* Teasing\n* JOI, SI\n\n#Ass play\n(Giving, Receiving)\n* Anal toys\n* Anal sex, pegging\n* Rimming\n* Double penetration\n* Anal fisting\n\n#Restrictive\n(Self, Partner)\n* Gag\n* Collar\n* Leash\n* Chastity\n* Bondage (Light)\n* Bondage (Heavy)\n* Encasement\n\n#Toys\n(Self, Partner)\n* Dildos\n* Plugs\n* Vibrators\n* Sounding\n\n#Domination\n(Dominant, Submissive)\n* Dominant / Submissive\n* Domestic servitude\n* Slavery\n* Pet play\n* DD/lg, MD/lb\n* Discipline\n* Begging\n* Forced orgasm\n* Orgasm control\n* Orgasm denial\n* Power exchange\n\n#No consent\n(Aggressor, Target)\n* Non-con / rape\n* Blackmail / coercion\n* Kidnapping\n* Drugs / alcohol\n* Sleep play\n\n#Taboo\n(General)\n* Incest\n* Ageplay\n* Interracial / Raceplay\n* Bestiality\n* Necrophilia\n* Cheating\n* Exhibitionism\n* Voyeurism\n\n#Surrealism\n(Self, Partner)\n* Futanari\n* Furry\n* Vore\n* Transformation\n* Tentacles\n* Monster or Alien\n\n#Fluids\n(General)\n* Blood\n* Watersports\n* Scat\n* Lactation\n* Diapers\n* Cum play\n\n#Degradation\n(Giving, Receiving)\n* Glory hole\n* Name calling\n* Humiliation\n\n#Touch & Stimulation\n(Actor, Subject)\n* Cock/Pussy worship\n* Ass worship\n* Foot play\n* Tickling\n* Sensation play\n* Electro stimulation\n\n#Misc. Fetish\n(Giving, Receiving)\n* Fisting\n* Gangbang\n* Breath play\n* Impregnation\n* Pregnancy\n* Feminization\n* Cuckold / Cuckquean\n\n#Pain\n(Giving, Receiving)\n* Light pain\n* Heavy pain\n* Nipple clamps\n* Clothes pins\n* Caning\n* Flogging\n* Beating\n* Spanking\n* Cock/Pussy slapping\n* Cock/Pussy torture\n* Hot Wax\n* Scratching\n* Biting\n* Cutting",
  username: "Anonymous",
}



class KinklistError extends Error {
  constructor(message) {
    super(message);
    this.name = "KinklistError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KinklistError);
    }
  }
}



class Interface {
  constructor(object) {
    this.object = object;
    this.prefix = '';
  }

  get element() {
    if (!this._element) {
      this._element = this.createElement();
    }
    return this._element;
  }
  set element(element) {
    this._element = element;
  }

  get cssClassName() {
    return this.prefix + toCSSClassName(this.object.name);
  }

  createElement() {return null} // Inherited classes need to define this method.

  refresh() {
    if (this._element) {
      const newElement = this.createElement();
      if (this.element.parentNode) {
        this.element.parentNode.replaceChild(newElement, this.element);
      }
      this.element = newElement;
    }
  }
}
class SelectionOptionInterface extends Interface {
  constructor(selectionOption) {
    super(selectionOption);
    this.prefix = "option-";
  }

  get cssRule() {
    return `.${this.cssClassName} {background-color: ${this.object.color};}`;
  }

  createElement() {
    const tag = `button.circle.${this.cssClassName}` +
                `[title=${this.object.name}]`
    const element = createHTMLElement(tag);
    return element;
  }
}
class SelectionInterface extends Interface {
  constructor(selection) {
    super(selection);
    this.prefix = "selection";
  }

  createElement() {
    const selection = this.object;
    for (let selectionOption of selection.options) {
      selectionOption.interface.element.addEventListener('mousedown', () => {
        if (selection.value == selectionOption) {
          selection.deselect();
        } else {
          selection.updateSelection(selectionOption);
        }
      });
    }
    const selectionOptionElements =
        selection.options.map(selectionOption =>
                              selectionOption.interface.element);
    const element = createHTMLElement("div.selection", selectionOptionElements);
    return element;
  }

  update() {
    this.object.options
        .map(selectionOption => selectionOption.interface.element)
        .forEach((element) => {
      element.classList.remove("selected");
    });
    if (this.object.value) {
      this.object.value.interface.element.classList.add("selected");
    }
  }
}
class KinkInterface extends Interface {
  constructor(kink) {
    super(kink);
    this.prefix = "kink-"
  }

  createElement() {
    const cellElements = [];
    const selections = this.object.selections;
    for (let selection of selections) {
      cellElements.push(createHTMLElement("td", selection.interface.element));
    }
    cellElements.push(createHTMLElement("td", this.object.name));
    const element = createHTMLElement(`tr.kinkrow.${this.cssClassName}`,
                                      cellElements);
    return element;
  }
}
class CategoryInterface extends Interface {
  constructor(category) {
    super(category);
    this.prefix = "cat-";
    this.element = this.createElement();
  }

  get height() {
    return this.calculateHeight();
  }

  createTableElement() {
    const classedTh = (name) => name ? "th.selection-column" : "th";
    const headerCellElements = [...this.object.columnNames, '']
          .map(name => createHTMLElement(classedTh(name), name));
    const theadElement = createHTMLElement("thead", headerCellElements);
    const tbodyElement = createHTMLElement("tbody",
              this.object.kinks.map(kink => kink.interface.element));
    const tableElement = createHTMLElement("table.kinkGroup",
                                           [theadElement, tbodyElement]);
    return tableElement;
  }

  createElement() {
    const tableElement = this.createTableElement();
    const titleElement = createHTMLElement("h2", this.name);
    const divElement =
        createHTMLElement(`div.kinkCategory.${this.cssClassName}}`,
                          [titleElement, tableElement]);
    return divElement;
  }

  calculateHeight(force) {
    let height;
    if (this.element.clientHeight) {
      height = this.element.clientHeight;
    } else if (force) {
      const clone = this.element.cloneNode(true);
      clone.style.visibility = "hidden";
      document.body.append(clone);
      height = clone.clientHeight;
      clone.remove(); 
    } else {
      const margins = 20;
      const h2 = 27;
      const tableRow = 25;
      height = margins + h2 + tableRow * (this.object.kinks.length + 1);
    }
    return height;
  }

  refresh() {
    super.refresh();
    this.calculateHeight();
  }
}
class KinklistInterface extends Interface {
  constructor(kinklist) {
    super(kinklist);
    this.hasCategoriesChanged = false;
    this.element = document.querySelector("#Kinklist");
  }

  createElement() {
    const columnAmount =
          Math.min(4, Math.floor((document.body.scrollWidth - 20) / 400) || 1);
    const categories = this.object.categories;
    const columns = [];
    if (categories.length) {
      const categoryHeights =
            categories.map(category => category.interface.height);
      const partitioning = partitionIntoColumns(categoryHeights, columnAmount);
      columns.push(...spreadAcrossColumns(categories, partitioning));
    }

    const categoryElements = columns.map(column => {
      return column.map(category => category.interface.element);
    });
    const columnElements =
          categoryElements.map(column => createHTMLElement("div", column));
    const element = createHTMLElement("div#Kinklist", columnElements);
    return element;
  }

  appendCSSRuleToStylesheet(rule) {
    cssStylesheet.insertRule(rule, 0);
  }

  updateColors() {
    const legend = this.object.legend
          .map(([name, color]) => new SelectionOption(name, color));
    legend
        .map(option => option.interface.cssRule)
        .forEach(this.appendCSSRuleToStylesheet);
  }

  updateLegend() {
    const selectionOptions = this.object.legend
          .map(option => new SelectionOption(...option));
    const legendOptionElements = selectionOptions.map(option => {
      const legendText = createHTMLElement("span.selection-name", option.name);
      const legendMarker =
          createHTMLElement(`span.circle.${option.interface.cssClassName}`);
      const optionDiv = createHTMLElement("div.selection",
                                          [legendMarker, legendText]);
      return optionDiv;
    });
    const legendElement = document.querySelector(".legend");
    removeInnerNodes(legendElement);
    legendElement.append(...legendOptionElements);
  }
}


class SelectionOption {
  constructor(name, color, selection) {
    this.selection = selection;
    this.name = name;
    this.color = color;
    this.interface = new SelectionOptionInterface(this);
  }

  equals(selectionOption) {
  	return (this.name == selectionOption.name) &&
  				 (this.color == selectionOption.color);
  }
}

class Selection {
  constructor(legend, kink) {
    this.kink = kink;
    this.options = legend
                   .map(option => new SelectionOption(...option, this));
    this._value = null;
    this.interface = new SelectionInterface(this);
  }

  get value() {return this._value};
  set value(value) {
    if (!(this.options.includes(value) || value == null)) {
      throw new KinklistError("Illegal value.");
    }
    this._value = value;
    this.interface.update();
  }
  get apparentValue() {
    return this._value || this.options[0];
  }

  get columnName() {
  	const kink = this.kink;
  	const columnNames = kink.category.columnNames;
  	let columnName = '';
  	if (columnNames.length > 1) {
  		columnName = columnNames[kink.selections.findIndex(x => x == this)];
  	}
  	return columnName;
  }

  updateSelection(value) {
    if (!value instanceof SelectionOption) {
      throw new KinklistError("Value is not SelectionOption.");
    }
  	if (!this.options.includes(value)) {
      throw new KinklistError(`Selection value "${value.name}" out of bounds.`);
    }
    this.value = value;
  }

  deselect() {
    this.value = null;
  }

  equals(selection) {
  	return (this.options.length == selection.options.length) &&
  				 (this.options.every((option, index) =>
  				                     option.equals(selection.options[index])));
  }
}

class Kink {
  constructor(name, category) {
    this.category = category;
    this.name = name;
    //this.description = description;
    this.selections = [];
    this.interface = new KinkInterface(this);
  }

  get columnAmount() {
    if (this.category) {
      return this.category.columnNames.length;
    } else return 0;
  }
  get category() {return this._category};
  set category(value) {
    if (this._category == value) return;
    if (!value) return;
    this._category = value;
    this.update();
  }

  update() {
    const newSelections = [];
    const legend = this.category.kinklist.legend;
    for (let i = 0; i < this.columnAmount; i++) {
      newSelections.push(new Selection(legend, this));
    }
    this.selections = newSelections;
    this.interface.refresh();
  }
}

class Category {
  constructor(name, columnNames, kinks, kinklist) {
    this.kinklist = kinklist;
    this.name = name;
    this.columnNames = columnNames;
    this.kinks = kinks || [];
    this.interface = new CategoryInterface(this);
  }

  get kinks() {return this._kinks};
  set kinks(kinkObjects) {
    this._kinks = kinkObjects;
    this.linkKinks();
  }

  addKink(kink) {
    kink.category = this;
    this.kinks.push(kink);
    this.interface.refresh();
  }
  updateKinks(kinkObjects) {
    this.kinks = kinkObjects;
    this.interface.refresh();
  }
  linkKinks() {
  	for (let kink of this.kinks) {
  		kink.category = this;
  	}
  }
}

class Kinklist {
  constructor(preset) {
    this.categories = [];
    this.kinks = [];
    this.interface = new KinklistInterface(this);
    this.legend = preset.legend;
    this.data = preset.data;
  }

  get data() {return this._data;}
  get legend() {return this._legend};
  set data(value) {
    value = this.sanitizeKinklistSettingsInput(value);
    this._data = value;
    this.parseKinklistSettings(value);
  }
  set legend(value) {
    this._legend = value;
    this.interface.updateColors();
    this.interface.updateLegend();
  }

  get stateString() {
    const encodedSelections = [];
    for (let kink of this.kinks) {
      for (let selection of kink.selections) {
        encodedSelections.push(selection.index);
      }
    }
    return encodedSelections.join('');
  }

  set stateString(kinklistString) {
    const encodedSelections = kinklistString.split('');
    for (let kink of this.kinks) {
      for (let selection of kink.selections) {
        selection.updateSelection(encodedSelections.shift());
      }
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

  removeCategory(...categoriesToRemove) {
    this.categories = this.categories
            .filter(category => !categoriesToRemove.includes(category));
    this.updateKinks();
  }

  flush() {
    for (let kink of this.kinks) {
      for (let selection of kink.selections) {
        selection.deselect();
      }
    }
  }
 
  parseKinklistSettings(inputString) {
    if (!inputString) {
      throw new KinklistError("Input string empty.");
    }
    const regexp = new RegExp(/#(.+)\n\((.+)\)\n((?:\*.+\n?)+)/g);

    let match;
    let categories = [];
    while ((match = regexp.exec(this.data))) {
      const category = {};
      category.name = match[1];
      category.columns = match[2].split(/,\s+/);
      category.kinks = match[3]
          .trim()
          .split('\n')
          .map(kinkString => kinkString.replace(/\*\s*/, ''));
      categories.push(category);
    }

    const newCategories = [];
    const extraCategories = new Set(this.categories);
    const categoryNames = [];
    categories.forEach(categoryData => {
      let {name, columns, kinks} = categoryData;
      categoryNames.push(name);
      kinks = kinks.map(kinkName => 
                        this.kinks.find(kinkObject => 
                                        kinkObject.name == kinkName)
                          || new Kink(kinkName)
                       );
      let existingCategory = this.categories
              .find(category => category.name == name);
      if (existingCategory) {
        existingCategory.updateKinks(kinks);
        extraCategories.delete(existingCategory);
      }
      else
        newCategories.push(new Category(name, columns, kinks, this));
    });
    if (extraCategories) this.removeCategory(...extraCategories);
    if (newCategories) this.appendCategory(...newCategories);
    // Sort categories in order they were specified in the list.
    this.categories =
        categoryNames.map(name => this.categories
                                      .find(category => category.name == name));
    this.interface.refresh();
  }

  sanitizeKinklistSettingsInput(kinklistSettings) {
    let sanitized = kinklistSettings;
    sanitized = sanitized.replace(/ ?\/ ?/g, "​/​"); // Zero-width spaces.
    return sanitized;
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
    this.username = username;
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
    const canvas = createHTMLElement("canvas#KinklistCanvas", null,
                                     {width: width, height: height});
    canvas.height = height;
    canvas.width = width;
    canvas.addEventListener("click", () => {
    	let anchor = document.createElement("a");
    	anchor.href = canvas.toDataURL();
    	anchor.download = this.filename;
    	anchor.click();
    });
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
    // {kinkObject: {selections[]: {apparentValue: {color}}, name} / margin}
    const circle = this.settings.circle;
    for (const selection of drawcall.kinkObject.selections) {
      const circleDrawcall = 
          new Drawcall(drawcall.x, drawcall.y,
                       {color: selection.apparentValue.color});
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
                    * kinklistObject.legend.length
                + this.settings.circle.size;
    let legendY = y + this.settings.circle.size;
    for (let [name, color] of kinklistObject.legend) {
      let legendDrawcall =
          new Drawcall(legendX, legendY,
                       {kinkObject: {
                          selections: [{apparentValue: {color: color}}],
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
    return columns.filter(column => column.length);
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
    const selection = this.selections[this.index];
    console.log(selection);
    const option = selection.options[optionNumber];
  	selection.updateSelection(option);
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
  			     selection.apparentValue.name == "Not Entered");
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
	  			createHTMLElement(`span.circle.${option.interface.cssClassName}`);
	  	const nameElement =
	  			createHTMLElement("span.legend-text", option.name);
	  	const buttonNumberTextElement =
	  			createHTMLElement("span.button-number-text", i);
	  	const bigChoiceDivElement =
	  			createHTMLElement("div.selection-option",
	  			                  [circleElement,
	  			                  	nameElement,
	  			                  	buttonNumberTextElement]);
	  	if (selection.value == option) {
	  		bigChoiceDivElement.classList.add("selected");
	  	}

	  	bigChoiceDivElement.addEventListener("mousedown", () => {
	  		this.select(i);
	  	});

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
    if (selection.value) {
      const selectionCSSClassName =
            selection.value.interface.cssClassName;
    	const newSelectedElement =
    			this.rootElement
              .querySelector(`#CarouselCurrent .${selectionCSSClassName}`)
    					.parentElement;
    	newSelectedElement.classList.add("selected");
    }
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
    const selectionCSSClassName =
          selection.apparentValue.interface.cssClassName;
		const choiceElement =
				createHTMLElement(`span.circle.${selectionCSSClassName}`);
		const categoryElement =
				createHTMLElement("span.category", categoryName);
		const columnElement =
				createHTMLElement("span.column", columnName);
		const kinkElement =
				createHTMLElement("span.kink", kinkName);
		const kinkSimpleDivElement =
				createHTMLElement("div.selection-simple",
				                  [choiceElement,
				                  	categoryElement,
				                  	columnElement,
				                  	kinkElement]);
		return kinkSimpleDivElement;
  }
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
    });

    xhr.addEventListener("timeout", function() {
      console.error("Timeout");
      reject(this);
    });

    xhr.open("POST", "https://api.imgur.com/3/image");
    xhr.setRequestHeader("Authorization", "Client-ID 546c25a59c58ad7");
    xhr.setRequestHeader("Accept", "application/json");

    xhr.send(data);
  });
}



class Preset {
  constructor(displayName, manager, data, legend) {
    this.manager = manager;
    this._displayName = displayName;
    this.initialize(data, legend);
    this.locked = manager.storage.defaults
        .presetDisplayNames.includes(displayName);
  }

  initialize(data, legend) {
    const storage = this.manager.storage;
    this._data = data || storage.retrieve(this.internalPresetDataName);
    this._legend = legend || storage.retrieve(this.internalPresetLegendName);
  }

  checkLock() {
    if (this.locked) {
      const text = `Attempted to modify locked preset "${this.displayName}".`;
      throw new KinklistError(text);
    }
  }

  cleanup() {
    this.manager.storage.remove(this.internalPresetDataName);
    this.manager.storage.remove(this.internalPresetLegendName);
  }

  get displayName() {return this._displayName};
  get data() {return this._data};
  get legend() {return this._legend};
  set displayName(value) {
    this.checkLock();
    this.manager.delete(this);
    this._displayName = value;
    this.manager.add(this);
  }
  set data(value) {
    this.checkLock();
    this._data = value;
    this.manager.save();
  }
  set legend(value) {
    this.checkLock();
    this._legend = value;
    this.manager.save();
  }
  get name() {
    return toCSSClassName(this.displayName);
  }
  get internalPresetDataName() {
    return `--preset-${this.name}`;
  }
  get internalPresetLegendName() {
    return `--legend-${this.name}`;
  }
}

class PresetManager {
  constructor(storageHandler) {
    this.storage = storageHandler;
    this.presets = new Map();
    const presetDisplayNames = this.storage.retrieve("presetDisplayNames");
    presetDisplayNames.forEach(displayName => {
      const preset = new Preset(displayName, this);
      this.presets.set(preset.name, preset);
    });
    this.currentPreset = this.get(this.storage.retrieve("currentPreset"));
    this.selectedPreset = this.currentPreset;
  }

  get presetList() {
    return [].concat(...this.presets.keys());
  }
  get presetDisplayNameList() {
    return [].concat(...this.presets.values()).map(preset =>
                                                   preset.displayName);
  }
  get defaultData() {
    return this.presets.get("default").data;
  }

  get(name) {
    return this.presets.get(name);
  }

  create(displayName, data = '', legend = defaultSettings.legend) {
    const name = toCSSClassName(displayName);
    this.sanitizeInput(name);
    if (this.presets.has(name)) {
      throw new KinklistError(`Preset "${name}" already exists.`);
    }
    const preset = new Preset(displayName, this, data, legend);
    this.presets.set(name, preset);
    this.save();
  }

  add(preset) {
    const name = preset.name;
    this.sanitizeInput(name);
    if (this.presets.has(name)) {
      throw new KinklistError(`Preset "${name}" already exists.`);
    }
    this.presets.set(name, preset);
    this.save();
  }

  rename(preset, newDisplayName) {
    const newName = toCSSClassName(newDisplayName);
    this.sanitizeInput(preset.name);
    this.sanitizeInput(newName);
    if (this.presets.has(newName)) {
      throw new KinklistError(`Preset "${name}" already exists.`);
    }
    this.delete(preset);
    this.create(newDisplayName, preset.data, preset.legend);
    this.select(newName);
  }

  delete(preset) {
    this.sanitizeInput(preset);
    if (this.currentPreset == preset) {
      this.currentPreset = this.get("default");
    }
    if (this.selectedPreset == preset) {
      this.cancel();
    }
    this.presets.delete(preset.name);
    preset.cleanup();
    this.save();
  }

  select(name) {
    if (this.presetList.includes(name)) {
      this.selectedPreset = this.get(name);
    } else {
      const errorMessage = `Attempted to select non-existent preset "${name}".`;
      throw new KinklistError(errorMessage);
    }
    this.save();
  }

  apply() {
    this.currentPreset = this.selectedPreset;
    this.save();
  }
  cancel() {
    this.selectedPreset = this.currentPreset;
  }

  sanitizeInput(input) {
    let name = input instanceof Preset ? input.name : input;
    const defaultPresets = this.storage.defaults.presetList;
    if (defaultPresets.includes(name)) {
      throw new KinklistError(`Cannot modify default preset "${name}".`);
    }
  }

  save() {
    this.storage.store("presetDisplayNames", this.presetDisplayNameList);
    for (let preset of this.presets.values()) {
      this.storage.store(preset.internalPresetDataName, preset.data);
      this.storage.store(preset.internalPresetLegendName, preset.legend);
    }
    this.storage.store("currentPreset", this.currentPreset.name);
  }
}

class StorageHandler {
  constructor() {
    this.defaults = {
      imgurData: {},
      presetDisplayNames: ["Default"],
      //presetList: [/* Generated automatically below. */],
      "--preset-default": defaultSettings.data,
      "--legend-default": defaultSettings.legend,
      currentPreset: "default",
    };
    const presetList = this.defaults.presetDisplayNames
        .map(displayName => toCSSClassName(displayName));
    Object.defineProperty(this.defaults, "presetList", {value: presetList});
    this.initialize();
    return this;
  }

  store(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  retrieve(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  remove(key) {
    localStorage.removeItem(key);
  }

  initialize() {
    try {
      for (let key in this.defaults) {
        if (!this.retrieve(key)) {
          this.store(key, this.defaults[key]);
        }
      }
    } catch (e) {
      console.error(e);
      console.warn("Resetting localStorage.");
      this.reset();
    }
  }

  reset() {
    localStorage.clear();
    this.initialize();
  }

  storeImgurData(data) {
    let imgurData = this.retrieve("imgurData");
    imgurData[data.id] = data.deletehash;
    this.store("imgurData", imgurData);
  }
}

function init() {
  const storageHandler = new StorageHandler();
  const presetManager = new PresetManager(storageHandler);
  const currentPreset = presetManager.currentPreset;
  const kinklist = new Kinklist(currentPreset);



  (function() {
    let lastResize = 0;
    window.addEventListener("resize", () => {
      let currentTime = Date.now();
      lastResize = currentTime;
      setTimeout(() => {
        if (currentTime == lastResize) {
          kinklist.interface.refresh();
        }
      }, 150)
    })
  })();

  const kinklistElement = document.querySelector("#Kinklist");
  const exportButtonElement = document.querySelector(".export-button");
  const exportLinkElement = document.querySelector(".export-link");
  const generateButtonElement = document.querySelector(".generate-button");
  const loadingElement = document.querySelector(".export-loading");
  const presetSettingsButtonElement = document.querySelector("#PresetSettingsButton");
  const presetOverlayElement = document.querySelector("#Presets");
  const presetSelectorElement = document.querySelector("#PresetSelector");
  const presetCreateButtonElement = document.querySelector("#PresetCreate");
  const presetRenameButtonElement = document.querySelector("#PresetRename");
  const presetDuplicateButtonElement = document.querySelector("#PresetDuplicate");
  const presetDeleteButtonElement = document.querySelector("#PresetDelete");
  const presetSaveButtonElement = document.querySelector("#PresetSave");
  const presetSelectButtonElement = document.querySelector("#PresetSelect");
  const presetTextareaElement = document.querySelector("#PresetTextarea");
  const startButtonElement = document.querySelector(".input-button");
  const resetButtonElement = document.querySelector(".reset-button");
  const inputOverlayElement = document.querySelector("#CarouselInput");
  const closeOverlayButtonElements = document.querySelectorAll(".close-overlay");
  const overlayChildrenElements = document.querySelectorAll(".overlay > *");
  const overlayElements = document.querySelectorAll(".overlay");

  presetTextareaElement.value = kinklist.data;

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
        window.prompt("Enter nickname:", defaultSettings.username);
    if (username) {
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
    fadeOut(event.currentTarget);
  }
  
  const presetControlElementList =
      [].concat(...presetOverlayElement
                .querySelectorAll(".preset-background > button"))
        .concat(presetTextareaElement);
  function disablePresetControlElements(disabled = false) {
    for (const element of presetControlElementList) {
      element.disabled = disabled;
    }
  }
  function updatePresetSelector(selectElement = presetSelectorElement) {
    function getOptionsList(filterDisabled = true) {
      let result = new Array(...selectElement.options)
      if (filterDisabled) {
        result = result.filter(option => !option.disabled);
      }
      result = result.map(option => option.value);
      return result;
    }

    const selectOptionsList = getOptionsList();
    const presetList = presetManager.presetList;
    const newPresets =
        presetList.filter(preset => !selectOptionsList.includes(preset));
    const obsoletePresets =
        selectOptionsList.filter(option => !presetList.includes(option));

    for (const presetName of newPresets) {
      const preset = presetManager.get(presetName);
      const option =
          createHTMLElement(`option[value=${preset.name}]`, preset.displayName);
      selectElement.add(option);
    }

    for (const presetName of obsoletePresets) {
      const index = getOptionsList(false).indexOf(presetName);
      selectElement.remove(index);
    }

    const currentPresetIndex = getOptionsList(false)
        .indexOf(presetManager.selectedPreset.name);
    selectElement.selectedIndex = currentPresetIndex;
  }
  function updatePresetTextarea() {
    presetTextareaElement.value = presetManager.selectedPreset.data;
  }
  function updatePresetDisablableElements() {
    const defaultPresets = presetManager.storage.defaults.presetList;
    const selectedPreset = presetManager.selectedPreset.name
    const disableOnDefaultElementList =
        presetOverlayElement.querySelectorAll(".disable-on-default");
    const disabledState = defaultPresets.includes(selectedPreset);
    disablePresetControlElements(false);
    for (const element of disableOnDefaultElementList) {
      element.disabled = disabledState;
    }
  }
  function updatePresetOverlayState() {
    updatePresetTextarea();
    updatePresetSelector();
    updatePresetDisablableElements();
  }
  async function presetSettingsButtonEventHandler() {
    updatePresetOverlayState();
    await fadeIn(presetOverlayElement);
    presetSelectorElement.focus();
  }
  function presetCreateButtonEventHandler() {
    const displayName = window.prompt("Enter new preset name:");
    if (displayName) {
      const {data, legend} = presetManager.get("default");
      presetManager.create(displayName, data, legend);
      const name = toCSSClassName(displayName);
      presetManager.select(name);
      updatePresetOverlayState();
      focus(presetTextareaElement);
    }
  }
  function presetRenameButtonEventHandler() {
    const selectedPreset = presetManager.selectedPreset;
    const displayName = presetManager.selectedPreset.displayName;
    const newDisplayName = window.prompt(`Rename preset "${displayName}":`);
    if (newDisplayName) {
      presetManager.rename(selectedPreset, newDisplayName);
      updatePresetOverlayState();
    }
  }
  function presetDuplicateButtonEventHandler() {
    const displayName = window.prompt("Enter new preset name:");
    if (displayName) {
      const {data, legend} = presetManager.selectedPreset;
      presetManager.create(displayName, data, legend);
      const name = toCSSClassName(displayName);
      presetManager.select(name);
      updatePresetOverlayState();
      focus(presetTextareaElement);
    }
  }
  function presetDeleteButtonEventHandler() {
    presetManager.delete(presetManager.selectedPreset);
    updatePresetOverlayState();
  }
  function presetSaveButtonEventHandler() {
    const newData = presetTextareaElement.value;
    presetManager.selectedPreset.data = newData;
  }
  function presetSelectButtonEventHandler(event) {
    try {
      presetSaveButtonEventHandler();
    } catch (e) {
      if (e.name == "KinklistError") {
        console.error(e);
      } else throw e;
    }
    presetManager.apply();
    const data = presetManager.selectedPreset.data;
    disablePresetControlElements(true);
    kinklist.data = data;
    disablePresetControlElements(false);
    closeOverlayEventHandler(event);
  }
  function presetSelectorElementEventHandler(event) {
    presetManager.select(event.target.value);
    updatePresetOverlayState();
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
  function closeOverlayEventHandler(event) {
    let element = event.currentTarget;
    while (!element.classList.contains("overlay")) {
      element = element.parentElement;
    }
    fadeOut(element);
    document.body.focus();
    closeOverlayPostprocessing(element);
  }
  function closeOverlayPostprocessing(element) {
    switch (element) {
      case presetOverlayElement:
        presetManager.cancel();
        break;
    }
  }

  Object.entries({
    mousedown: [
      [generateButtonElement, generateButtonEventHandler],
      [exportButtonElement, exportButtonEventHandler],
      [startButtonElement, startButtonEventHandler],
      [resetButtonElement, resetButtonEventHandler],
      [closeOverlayButtonElements, closeOverlayEventHandler],
      [overlayElements, closeOverlayEventHandler],
      [overlayChildrenElements, dontPropagate],
      [presetSettingsButtonElement, presetSettingsButtonEventHandler],
      [presetCreateButtonElement, presetCreateButtonEventHandler],
      [presetRenameButtonElement, presetRenameButtonEventHandler],
      [presetDuplicateButtonElement, presetDuplicateButtonEventHandler],
      [presetDeleteButtonElement, presetDeleteButtonEventHandler],
      [presetSaveButtonElement, presetSaveButtonEventHandler],
      [presetSelectButtonElement, presetSelectButtonEventHandler],
    ],
    keydown: [
      [document, keyboardEventHandler],
    ],
    change: [
      [presetSelectorElement, presetSelectorElementEventHandler],
    ],
  }).forEach(([event, elementHandlersArray]) => {
    elementHandlersArray.forEach(([element, handler]) => {
      const attachHandler = (e, h) => e.addEventListener(event, h);
      if (element instanceof NodeList) {
        element.forEach(e => attachHandler(e, handler));
      } else {
        attachHandler(element, handler);
      }
    });
  })
}

function attemptInit() {
  try {
    init();
  } catch (error) {
    console.error(error);
    unhide(document.querySelector("#Error"));
  }
}

if (document.readyState === 'loading') { 
  document.addEventListener('DOMContentLoaded', attemptInit);
} else {
  attemptInit();
}