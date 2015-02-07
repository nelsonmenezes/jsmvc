'use strict';

var cE = document.createElement.bind(document);
var cT = document.createTextNode.bind(document);
var cF = document.createDocumentFragment.bind(document);


// -----------------------------------------------------------------------------


function mvc(model, view, controller) {

    var component = Object.create(mvc);

    // TODO: register component with model; model updates should make registered
    // components re-render

    component.model = model;
    component.view = view;
    component.controller = controller;

    return component;
}

mvc.render = function(domEl, append) {

    this.domEl = domEl ? domEl : this.domEl;

    $(this.domEl).off();

    if (!append) {

        this.domEl.innerHTML = '';
    }

    this.domEl.appendChild(this.view(this.model));

    var controls = this.controller();

    for (var selector in controls) {

        var control = controls[selector];

        if ($.isPlainObject(control)) {

            for (var ev in control) {

                $(this.domEl).on(ev, selector, { model: this.model, view: this.view }, control[ev]);
            }
        }
        else {

            $(this.domEl).on(selector, { model: this.model, view: this.view }, control);
        }
    }

    return this.domEl;
};

mvc.modelChange = function(modifierFunc) {

    modifierFunc(this.model);
    this.render(this.domEl);
};

mvc.child = function(component) {
    var c = component.render(document.createElement('div'), true);
    // var c = component.render(cF(), true);
    return c;
};

mvc.modelFromAttr = function(modelKey, attrName) {

    attrName = attrName || modelKey;

    return function(ev) {

        this.modelChange(function(model) { model[modelKey] = ev.target[attrName] })
    }.bind(this);
};

mvc.nullController = function() {

    return {};
};


// -----------------------------------------------------------------------------


var peopleListModel = {
    items: [
        'Ann',
        'Bob',
        'Charlie',
        'Dave',
    ],
    title: 'People'
};


var listView = function(model) {

    var frag = cF();

    var h1 = cE('h1');
    h1.appendChild(cT(model.title));

    var ul = cE('ul');

    model.items.map(function(item) {

        var li = cE('li');
        li.appendChild(cT(item));
        ul.appendChild(li);
    });

    frag.appendChild(h1);
    frag.appendChild(ul);

    return frag;
};


var listController = function(model, view) {

    var component = this;

    return {

        'button': {

            click: function(ev) {

                component.modelChange(function(model) {

                    model.items.push('New item');
                });

                ev.stopPropagation();
            }
        },

        click: function(ev) {

            console.log('Clicked');
        }
    }
};


// -----------------------------------------------------------------------------


var task1Model = {

    name: 'Task 1',
    description: 'Do stuff'
};

var task2Model = {

    name: 'Task 2',
    description: 'Do more stuff'
};

var taskController = function(model, view) {

    var component = this;

    return {
        
        '[data-change-description]': {

            click: function(ev) {

                component.modelChange(function(model) {

                    model.description += ' and more stuff';
                })
            }
        }
    };
};

var taskView = function(model) {

    var frag = cF();

    var h2 = cE('h2');
    h2.appendChild(cT(model.name));

    var p = cE('p');
    p.appendChild(cT(model.description));

    var button = cE('button');
    button.setAttribute('data-change-description', 'data-change-description');
    button.appendChild(cT('Add more stuff'));

    frag.appendChild(h2);
    frag.appendChild(p);
    frag.appendChild(button);

    return frag;
};


// -----------------------------------------------------------------------------


var scheduleModel = {

    today: '6/2/15',

    tasks: [

        mvc(task1Model, taskView, taskController),
        mvc(task2Model, taskView, taskController)
    ]
};

var scheduleController = function(model, view) {

    return {

        click: function(ev) { console.log(ev); }
    };
};

var scheduleView = function(model) {

    var frag = cF();

    var h1 = cE('h1');
    h1.appendChild(cT('Schedule for ' + model.today));

    var tasks = cF();

    model.tasks.map(function(task) { tasks.appendChild(mvc.child(task)); });

    frag.appendChild(h1);
    frag.appendChild(tasks);

    return frag;
};


// -----------------------------------------------------------------------------


var rgbController = function(model, view) {

    var component = this;

    return {

        'input[type="range"]': {

            change: function(ev) {

                var input = this;

                component.modelChange(function(model) {

                    model[input.getAttribute('name')] = input.value;
                });
            }
        }
    }
};

var rgbView = function(model) {

    var frag = cF();

    var preview = cE('div');
    preview.setAttribute('style', 'width: 100px; height: 100px; background-color: rgb(' + model.r + ', ' + model.g + ', ' + model.b + ');');

    frag.appendChild(preview);

    ['r', 'g', 'b'].map(function(color) {

        var input = cE('input');
        input.setAttribute('type', 'range');
        input.setAttribute('min', 0);
        input.setAttribute('max', 255);
        input.setAttribute('name', color);
        input.setAttribute('value', model[color]);
        frag.appendChild(input);
    });

    return frag;
};


// -----------------------------------------------------------------------------


var textFormattingModel = {

    rgb1: mvc({ r: 200, g: 128, b: 100 }, rgbView, rgbController),
    rgb2: mvc({ r: 64, g: 32, b: 64 }, rgbView, rgbController),
    bold: false,
    size: 16
};

var textFormattingController = function(model, view) {

    var component = this;

    return {

        'input[name="size"]': {

            change: this.modelFromAttr('size', 'value')
        },

        'input[name="bold"]': {

            change: this.modelFromAttr('bold', 'checked')
        }
    }
};

var textFormattingView = function(model) {

    var rgb1 = model.rgb1.model;
    var rgb2 = model.rgb2.model;

    var frag = cF();

    var h2 = cE('h2');
    h2.appendChild(cT('Text formatting'));

    var input = cE('input');
    input.setAttribute('type', 'range');
    input.setAttribute('min', 10);
    input.setAttribute('max', 72);
    input.setAttribute('name', 'size');
    input.setAttribute('value', model.size);

    var check = cE('input');
    check.setAttribute('type', 'checkbox');
    check.setAttribute('name', 'bold');

    if (model.bold) {

        check.setAttribute('checked', 'checked');
    }

    frag.appendChild(h2);
    frag.appendChild(input);
    frag.appendChild(check);
    frag.appendChild(mvc.child(model.rgb1));
    frag.appendChild(mvc.child(model.rgb2));

    return frag;
};

var textSampleView = function(model) {
    console.log(model.size)
    var rgb1 = model.rgb1.model;
    var rgb2 = model.rgb2.model;

    var frag = cF();

    var h2 = cE('h2');
    h2.appendChild(cT('Example'));

    var p = cE('p');
    p.setAttribute('style', 'font-size: ' + model.size + 'px; font-weight: ' + (model.bold ? 'bold' : 'normal') + '; color: rgb(' + rgb1.r + ', ' + rgb1.g + ', ' + rgb1.b + '); background-color: rgb(' + rgb2.r + ', ' + rgb2.g + ', ' + rgb2.b + ');');
    p.appendChild(cT('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Hoc sic expositum dissimile est superiori. Nos paucis ad haec additis finem faciamus aliquando; Quae similitudo in genere etiam humano apparet. Est, ut dicis, inquit; Duo Reges: constructio interrete. Illi enim inter se dissentiunt. Quamquam te quidem video minime esse deterritum. His similes sunt omnes, qui virtuti student levantur vitiis, levantur erroribus, nisi forte censes Ti. Ita similis erit ei finis boni, atque antea fuerat, neque idem tamen; Ne discipulum abducam, times. Potius ergo illa dicantur: turpe esse, viri non esse debilitari dolore, frangi, succumbere. Quid in isto egregio tuo officio et tanta fide-sic enim existimo-ad corpus refers? Et si turpitudinem fugimus in statu et motu corporis, quid est cur pulchritudinem non sequamur? Quarum ambarum rerum cum medicinam pollicetur, luxuriae licentiam pollicetur.'));

    frag.appendChild(h2);
    frag.appendChild(p);

    return frag;
};

var appModel =  {

    textFormatter: mvc(textFormattingModel, textFormattingView, textFormattingController),
    textSample: mvc(textFormattingModel, textSampleView, mvc.nullController)
};

var appView = function(model) {

    var frag = cF();

    var h1 = cE('h1');
    h1.appendChild(cT('App'));

    frag.appendChild(h1);
    frag.appendChild(mvc.child(model.textFormatter));
    frag.appendChild(mvc.child(model.textSample));

    return frag;
};


// -----------------------------------------------------------------------------



//var peopleList = mvc(peopleListModel, listView, listController);
//peopleList.render(document.body);

//var schedule = mvc(scheduleModel, scheduleView, scheduleController);
//schedule.render(document.body);

//var colorPicker = mvc(rgbModel, rgbView, rgbController);
//colorPicker.render(document.body);

var app = mvc(appModel, appView, mvc.nullController);
app.render(document.body);

