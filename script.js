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



function fadeIn(element) {
  element.style.opacity = 0;
  element.style.display = "block";
  (function fade() {
    let opacity = +element.style.opacity;
    opacity += 0.1;
    if (!(opacity > 1)){
      element.style.opacity = opacity;
      requestAnimationFrame(fade);
    }
  })();
}

function fadeOut(element) {
  element.style.opacity = 1;
  (function fade() {
    let opacity = +element.style.opacity;
    opacity -= 0.1;
    if (!(opacity < 0)) {
      element.style.opacity = opacity;
      requestAnimationFrame(fade);
    }
    else
      element.style.display = "none";
  })();
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
        {class: "choice " + this.cssClassName, title: this.name});
  }

  get cssRule() {
    return `.choice.${this.cssClassName} {background-color: ${this.color};}`
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

  createElement() {
    const buttonElements = this.options.map(option => option.element);
    for (let i = 0; i < this.options.length; i++) {
      buttonElements[i].addEventListener('mousedown',
          () => {this.updateSelection(this.options[i])})
    }
    const element = createHTMLElement("div", buttonElements,
                                    {class:"choices choice-target"})
    return element;
  }

  updateSelection(value) {
    this.value = value || this.value;
    this.element.childNodes
                    .forEach(option => {option.classList.remove("selected")});
    const option =
    		this.element.querySelector(`.${toCSSClassName(this.value.name)}`);
    option.classList.add("selected");
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
                                    {class: `kinkRow ${this.cssClassName}`});
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
                            name ? {class: "choicesCol"} : undefined));
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
      clone.classList.add("hidden");
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

  updateColumns() {
    const columnAmount =
        Math.min(4, Math.floor((document.body.scrollWidth - 20) / 400) || 1);

    const columnClassNames = ["col100", "col50", "col33", "col25"];
    const columnClassName = columnClassNames[columnAmount - 1];
    //Category elements' margins overlap, being accounted twice. This
    //correction value mitigates that discrepancy.
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
            categoryElements.map(column => createHTMLElement("div", column, 
                                            {class: "col " + columnClassName}));
      const inputListElement = document.querySelector("#InputList");
      removeInnerNodes(inputListElement);
      inputListElement.append(...columnElements);
      this.hasCategoriesChanged = false;
    }
  }

  appendCategory(...categories) {
    for (let category of categories) {
      this.categories.push(category);
      const newKinks =
      		category.kinks.filter(kink => !this.kinks.includes(kink));
      this.kinks.push(...newKinks); 
    }
  }

  addCategory(...categories) {
    this.appendCategory(...categories);
    this.hasCategoriesChanged = true;
  }

  removeCategory(...categoriesToRemove) {
    this.categories = this.categories
            .filter(category => !categoriesToRemove.includes(category));
    this.kinks = [].concat(...this.categories.map(category => category.kinks));
    this.hasCategoriesChanged = true;
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

  createCanvas(height = this.settings.canvas.height,
               width = this.settings.canvas.width) {
    const canvas = createHTMLElement("canvas", null,
                                     {width: width, height: height});
    canvas.height = height;
    canvas.width = width;
    canvas.addEventListener("click", () => {
    	let anchor = document.createElement("a");
    	anchor.href = canvas.toDataURL();
    	anchor.download = `Kinklist (${this.username}).png`;
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
                       || document.querySelector("#InputOverlay .widthWrapper");
    this
  }

  refresh() {
    
  }
}



function appendCSSRuleToStylesheet(rule) {
  cssStylesheet.insertRule(rule, cssStylesheet.cssRules.length)
}

function generateLegend(selectionOptions) {
  const legendOptionElements = selectionOptions.map(option => {
    const legendText = createHTMLElement('span', option.name,
                                       {class: "legend-text"});
    const legendMarker =
        createHTMLElement('span', null,
                          {
                            "class": `choice ${toCSSClassName(option.name)}`,
                            "data-color": option.color
                          });
    const optionDiv = createHTMLElement('div', [legendMarker, legendText]);
    return optionDiv;
  })
  const legendElement = document.querySelector('.legend');
  legendElement.append(...legendOptionElements);
}

function generateSelectionOptionCSS(selectionOptions) {
  selectionOptions.forEach(option => appendCSSRuleToStylesheet(option.cssRule));
}



function init() {
  const kinklist = new Kinklist();
  
  const selectionOptionObjects = kinklist.settings
      .selectionOptions.map(option => new SelectionOption(...option));
  generateLegend(selectionOptionObjects);
  generateSelectionOptionCSS(selectionOptionObjects);
  appendCSSRuleToStylesheet("canvas{border:solid 1px black");



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

  const exportElement = document.getElementById("Export");
  const editToggleElement = document.getElementById("Edit");
  const editOverlayElement = document.getElementById("EditOverlay");
  const editOKButtonElement = document.getElementById("KinksOK");
  const editTextareaElement = document.getElementById("Kinks");

  editTextareaElement.value = kinklist.settings.kinklistText;

  exportElement.addEventListener("mousedown", () => {
    const username =
    		window.prompt("Enter nickname:", kinklist.settings.username);
    if (username) {
    	kinklist.settings.username = username;
      const kinklistCanvasDrawer = new KinklistCanvasDrawer(kinklist, username);
      kinklistCanvasDrawer.drawKinklist();
      const inputListElement = document.querySelector("#InputList");
      if (document.querySelector("canvas")) {
        document.querySelector("canvas")
        		.replaceWith(kinklistCanvasDrawer.canvas);
      } else {
        inputListElement.before(kinklistCanvasDrawer.canvas);
      }
    }
  });
  editToggleElement.addEventListener("mousedown", () => {
    fadeIn(editOverlayElement)
  });
  editOverlayElement.addEventListener("mousedown", () => {
    fadeOut(editOverlayElement)
  });
  editOKButtonElement.addEventListener("mousedown", () => {
    editOKButtonElement.disabled = true;
    kinklist.parseKinklistSettings(editTextareaElement.value);
    fadeOut(editOverlayElement)
    editOKButtonElement.disabled = false;
  });
  (() => {
    const startButtonElement = document.getElementById("StartBtn");
    const inputOverlayElement = document.getElementById("InputOverlay");
    const closePopupButtonElement = document.querySelector(".closePopup");
    const carousel = new Carousel(kinklist);

    startButtonElement.addEventListener("mousedown", () => {
      carousel.refresh();
      fadeIn(inputOverlayElement);
    });
    inputOverlayElement.addEventListener("mousedown", () => {
      fadeOut(inputOverlayElement);
    });
    closePopupButtonElement.addEventListener("mousedown", () => {
      fadeOut(inputOverlayElement);
    });
  })()

  document.querySelectorAll(".overlay > *")
      .forEach(element => element.addEventListener("mousedown",
                                                   (e) => e.stopPropagation()
                                                  ));
}

if (document.readyState === 'loading') { 
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}