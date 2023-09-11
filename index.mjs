/*
if the console yields the error "localhost/:1 Unchecked runtime.lastError: The message port closed before a response was received.", this has nothing to do with the app, its some misbehaving chrome extension
*/

/**
* @typedef {Object} GTMTaskPartial
* @property {number} [id] int: pk
* @property {number} [parent_id] int: fk to the parent task pk
* @property {number} [assignee_id] int: fk to the assignees pk
* @property {number} [role_id] int: fk to the role pk
* @property {number} [status_id] int: fk to the status pk
* @property {number} [type_id] int: fk to the type pk
* @property {number} [priority_id] int: fk to the priority pk
* @property {number} [order] int: the list order in the tree view
* @property {number} [indent] int: the depth level of the task
* @property {number} [todo_order] int: the intended execution order
* @property {number} [creation_date] int: the unix timestamp of the task creation time
* @property {number} [last_update_date] int: the unix timestamp for the last update time for this task (but not its children)
* @property {number} [start_date] int: the unix timestamp for the intended start date
* @property {number} [due_date] int: the unix timestamp for the expected task term
* @property {boolean} [hidden] if the task subtree is hidden or not. this is not the same as collapsed. hidden tasks are hiden themselves unles a show hidden tasks button is pressed, which make them visible. this is to remove clutter from view
* @property {string} [name] the task name
* @property {string} [description] the task description
*/

/**
* @typedef {Object} GTMTask
* @property {number} id int: pk
* @property {number} parent_id int: fk to the parent task pk
* @property {number} assignee_id int: fk to the assignees pk
* @property {number} role_id int: fk to the role pk
* @property {number} status_id int: fk to the status pk
* @property {number} type_id int: fk to the type pk
* @property {number} priority_id int: fk to the priority pk
* @property {number} order int: the list order in the tree view
* @property {number} indent int: the depth level of the task
* @property {number} todo_order int: the intended execution order
* @property {number} creation_date int: the unix timestamp of the task creation time
* @property {number} last_update_date int: the unix timestamp for the last update time for this task (but not its children)
* @property {number} start_date int: the unix timestamp for the intended start date
* @property {number} due_date int: the unix timestamp for the expected task term
* @property {boolean} hidden if the task subtree is hidden or not. this is not the same as collapsed. hidden tasks are hiden themselves unles a show hidden tasks button is pressed, which make them visible. this is to remove clutter from view
* @property {string} name the task name
* @property {string} description the task description
*/

/**
* @typedef {Object} GTMTaskStatus
* @property {number} id int: pk
* @property {string} name the task status name
*/

/**
* @typedef {Object} GTMTaskType
* @property {number} id int: pk
* @property {string} name the task type name
*/

/**
* @typedef {Object} GTMTaskPriority
* @property {number} id int: pk
* @property {string} name the task priority name
*/

/**
* @typedef {Object} GTMTaskRole
* @property {number} id int: pk
* @property {string} name the task role name
* @property {string} description the task role description
*/

/**
* @typedef {Object} GTMTaskAssignee
* @property {number} id int: pk
* @property {string} name the task assignee name
* @property {string} description the task assignee description
*/

/**
* @typedef {Object} GTMTaskTag
* @property {number} id int: pk
* @property {string} name the task tag name
* @property {string} description the task tag description
*/

/**
* @typedef {Object} GTMTaskTagRel
* @property {number} id int: pk
* @property {number} task_id int: fk to the task pk
* @property {number} tag_id int: fk to the tag pk
*/

/**
* @typedef {Object} GTMConfig
* @property {number} id int: pk
* @property {string} name the config key
* @property {(boolean|number|string)} value the config value
*/

/**
* @typedef {Object} GTMDatabase
* @property {(null|Array<GTMTask>)} tasks tasks table
* @property {(null|Array<GTMTaskStatus>)} statuses statuses table
* @property {(null|Array<GTMTaskType>)} types types table
* @property {(null|Array<GTMTaskPriority>)} priorities priorities table
* @property {(null|Array<GTMTaskRole>)} roles roles table
* @property {(null|Array<GTMTaskAssignee>)} assignees assignees table
* @property {(null|Array<GTMTaskTag>)} tags tags table
* @property {(null|Array<GTMTaskTagRel>)} tag_task_rel association table between tags and tasks
* @property {(null|Array<GTMConfig>)} config app config table
*/

/** @type{Window|globalThis} */
let gglobalThis = globalThis ?? window;
/** @type{History} */
let ghistory = globalThis.history;
/** @type{Document} */
let gdocument = gglobalThis.document;
/** @type{HTMLElement} */
let gbody = document.body;
/** @type{StyleSheetList} */
let gstyleSheets = document.styleSheets;
/** @type{Storage} */
let glocalStorage = gglobalThis.localStorage;

// let gwebsqldb = null;
let gdownload_anchor = null;
let gupload_input = null;
let groot_div = null;
let gmenu_div = null;
let gdata_div = null;
let gdraft_div = null;
/** @type{(undefined|null|Object)}*/
let gconfig = null;
/** @type{GTMDatabase} */
let gdata = {
    // hold the task data itself
    tasks: null,
    // hold the statuses names
    statuses: null,
    // hold the possible task types, like bug fixing or new feature implementation
    types: null,
    // hold the possible task priorities, like low, medium, high or blocking
    priorities: null,
    // hold the roles names
    roles: null,
    // hold the assignees names
    assignees: null,
    // hold the tags names
    tags: null,
    // relation table between task and tags, so that we can assign any number of tags to a task
    tag_task_rel: null,
    // miscelaneous table, holding things like application configuration
    config: null, // was erroneously named as other
};
let gschema = {
    tasks: [

    ],
}
let gupdate_timeouts = {};
let gtranslations = {};

let gid_container_div_prefix = 'id_container_div_';
let gid_form_div_prefix = 'id_form_div_';
let gid_children_div_prefix = 'id_children_div_';
let gid_name_div_prefix = 'id_name_div_';
let gdefault_table_separator = '\n\n';
let gdefault_row_separator = '\n';
let gdefault_column_separator = '\t';
let gdefault_quote_char = '"';
let gsequences = {};
// timeout used to save the input data to its task object. instead of saving every keypress, we only save after one second passed since the last keyup event
let gdefault_sleep_msecs = 500;
let gsave_timeout = null;

// search indexes
// maps a task int id to all its children task objects
let gtask_id_to_children = null;
// maps a given int id to its task object
let gtask_id_to_task = null;
// maps a given int id to its status object
let gStatusIdToStatusObj = {};

gdata.statuses = [
    {
        id: 1,
        name: 'To do',
    }, {
        id: 2,
        name: 'Next',
    }, {
        id: 101,
        name: 'Doing',
    }, {
        id: 201,
        name: 'Done',
    }, {
        id: 202,
        name: 'Canceled',
    }
];

for (let istatus of gdata.statuses) { // build up the status id to status obj lookup table
    gStatusIdToStatusObj[istatus.id] = istatus
}

let getStatusNameById = (pid) => {
    if (pid in gStatusIdToStatusObj) {
        return gStatusIdToStatusObj[pid].name;
    }
    return '';
}

gdata.types = [
    {
        id: 1,
        name: 'New Feature',
    }, {
        id: 2,
        name: 'Improvement',
    }, {
        id: 3,
        name: 'Bug Fixing',
    }, {
        id: 4,
        name: 'Testing',
    }
];

gdata.priorities = [
    {
        id: 1,
        name: 'Low',
    }, {
        id: 2,
        name: 'Medium',
    }, {
        id: 3,
        name: 'High',
    }, {
        id: 4,
        name: 'Blocking',
    }
];

gdata.roles = [
    {
        id: 1,
        name: 'Graphics',
        description: '',
    }, {
        id: 2,
        name: 'Audio',
        description: '',
    }, {
        id: 3,
        name: 'Programming',
        description: '',
    }, {
        id: 4,
        name: 'Assembling',
        description: '',
    }, {
        id: 5,
        name: 'Design',
        description: '',
    }, {
        id: 6,
        name: 'Quality Assurance',
        description: '',
    }, {
        id: 7,
        name: 'Marketing',
        description: '',
    }, {
        id: 8,
        name: 'Management',
        description: '',
    }
];

gdata.assignees = [
    {
        id: 1,
        name: 'Me',
        description: '',
    }, {
        id: 2,
        name: 'The other guy',
        description: '',
    },
];

gdata.tags = [
    {
        id: 1,
        name: 'Easy',
        description: 'mark tasks that are considered having easy dificulty (this has no relation with time, only dificulty)',
    }, {
        id: 2,
        name: 'Medium Dificulty',
        description: 'mark tasks that are considered having medium dificulty (this has no relation with time, only dificulty)',
    }, {
        id: 3,
        name: 'Hard',
        description: 'mark tasks that are considered having hard dificulty (this has no relation with time, only dificulty)',
    }, {
        id: 4,
        name: 'Quick',
        description: 'mark tasks that are considered being quick (this has no relation with dificulty, only time)',
    }, {
        id: 5,
        name: 'Medium duration',
        description: 'mark tasks that are considered having medium duration (this has no relation with dificulty, only time)',
    }, {
        id: 6,
        name: 'Long',
        description: 'mark tasks that are considered to take much time to finish (this has no relation with dificulty, only time)',
    },
];

gdata.tag_task_rel = [
    {
        id: 1,
        task_id: 0,
        tag_id: 0,
    }
];

gdata.config = [
    {
        id: 1,
        name: 'draft',
        value: '',
    },
    {
        id: 2,
        name: 'hide_completed',
        value: false,
    }
]



let prompt = gglobalThis.prompt;


let confirm = gglobalThis.confirm;


let log = console.log;


let assert = console.assert;


let identity = i => i;


let new_date = i => new Date(i);


let new_date_ms = i => new Date(i).valueOf();


let logalert = msg => {
    log(msg);
    alert(msg);
}


// let fnhsluvfloat = (ph, ps, pl, pafl) => {
//     let vhsluv = new gglobalThis.Hsluv();
//     vhsluv.hsluv_h = ph;
//     vhsluv.hsluv_s = ps;
//     vhsluv.hsluv_l = pl;
//     vhsluv.hsluvToRgb();
//     return {
//         r: vhsluv.rgb_r,
//         g: vhsluv.rgb_g,
//         b: vhsluv.rgb_b,
//         a: pafl
//     }
// }


// let fnhsluvint = (ph, ps, pl, pafl) => {
//     let vret = fnhsluvfloat(ph, ps, pl, pafl);
//     vret.r = Math.round(vret.r * 255)
//     vret.g = Math.round(vret.g * 255)
//     vret.b = Math.round(vret.b * 255)
//     vret.a = Math.round(vret.a * 255)
//     return vret;
// }


// let fnhsluvcssrgba = (ph, ps, pl, pafl) => {
//     var vret = fnhsluvfloat(ph, ps, pl, pafl);
//     vret.r = Math.round(vret.r * 255)
//     vret.g = Math.round(vret.g * 255)
//     vret.b = Math.round(vret.b * 255)
//     return vret;
// }

let fnokhslcssrgba = (ph, ps, pl, pafl) => {
    let vrgb = gglobalThis.culori.convertOklabToRgb(
        gglobalThis.culori.convertOkhslToOklab({ mode: 'okhsl', h: ph, s: ps, l: pl })
    );
    vrgb.a = pafl;
    return vrgb
}

let fhslcssrgba = (ph, ps, pl, pafl) => {
    let vrgb = gglobalThis.culori.convertHslToRgb({ mode: 'hsl', h: ph, s: ps, l: pl })
    vrgb.a = pafl;
    return vrgb
}


let translate = (pidentifier, planguage) => {
    // TODO: Implement
    return gtranslations[pidentifier][planguage] ?? pidentifier;
}


let setStyle = (pelement, pobj) => {
    let vs = pelement.style;
    for (let ikey in pobj) {
        vs[ikey] = pobj[ikey];
    }
}



/**
 * @param {(undefined|null|GTMTaskPartial)} poverrides
 * @param {boolean} pskipSequenceIncrement
 * @returns {GTMTask}
 */
let newTask = (poverrides, pskipSequenceIncrement = false) => {
    let vnewId = 0;
    if (!pskipSequenceIncrement) {
        vnewId = ++gsequences.tasks;
    }
    let vnowMs = Date.now();
    let vnewTaskObj = {
        // indexes (primary key and foreign keys) should come before anything else
        // autoincrementing primary key
        id: vnewId,

        // foreign key to the parent task
        parent_id: 0,
        // foreign key to 'assignees'
        assignee_id: 0,
        // foreign key to 'roles'
        role_id: 0,
        // foreign key to 'statuses'
        status_id: 0,
        // foreign key to 'types'
        type_id: 0,
        // foreign key to 'priorities'
        priority_id: 0,
        // rendering order in list like views, like table and hierarchical views. has no relation to the doing order
        order: 0,
        // the indentation level. 0 are root tasks, cannot be < 0. this is overwritten on load, so even if the indent data in the db is corrupt, it gets corrected when building the tree
        indent: 0,
        // the order the task should be done
        todo_order: 0,

        // dates should be stored as int unix timestamps, like those returned by Date.now() or the (new Date()).valueOf()

        // task creation date in seconds (unix timestamp format)
        creation_date: vnowMs,
        // last time the task was updated in seconds (unix timestamp format)
        last_update_date: 0,
        // start date in seconds (unix timestamp format)
        start_date: 0,
        // expected due date in seconds (unix timestamp format)
        due_date: 0,

        // used to temporarily hide tasks to remove clutter from the view
        hidden: false,


        // Every key expecting non string values should be put before the 'name' key. Every key expecting string values should be put after 'name' key. Keys should be grouped by javascript type (number, bool, string). this is for organization purposes only
        // the task name. should be as small as possible, as it will be used in the header
        name: '',
        // the task description. should be as complete as possible
        description: '',
    }

    if (poverrides) {
        for (let ikey in poverrides) {
            vnewTaskObj[ikey] = poverrides[ikey];
        }
    }

    return vnewTaskObj;
}


// let new_register = {
//     tasks: new_task,
// };


let taskCompareByOrder = (pleft_task, pright_task) => {
    if (pleft_task.order > pright_task.order) {
        return 1;
    } else if (pleft_task.order < pright_task.order) {
        return -1
    }
    return 1;
}


let getId = task_obj => {
    let vtask_id = task_obj;
    if (typeof vtask_id == 'object') {
        vtask_id = vtask_id.id;
    }
    return vtask_id;
}


let getTaskById = id_int => {
    return gtask_id_to_task[id_int] ?? null;
}


let isRightAncestorOfLeft = (pchild_obj, pancestor_obj_id) => {
    if (!pchild_obj) {
        return false;
    }
    if (pchild_obj.parent_id == pancestor_obj_id) {
        return true;
    }
    return isRightAncestorOfLeft(getTaskById(pchild_obj.parent_id), pancestor_obj_id);
}


let addTaskToIndex = task => {
    let vid = task.id;
    if (vid == 99) {
        vid = vid;
    }
    let vparent_id = task.parent_id;
    gtask_id_to_task[vid] = task;

    let vchildren = gtask_id_to_children[vparent_id] ?? [];
    vchildren.push(task);
    gtask_id_to_children[vparent_id] = vchildren;
}


let rebuildIndexes = () => {
    if (gdata.tasks == null) {
        return;
    }
    gtask_id_to_children = {};
    gtask_id_to_task = {}
    for (let itask of gdata.tasks) {
        addTaskToIndex(itask);
    }
};


let replaceTasks = new_tasks => {
    gdata.tasks = new_tasks;
    rebuildIndexes();
}


let yearsFromNow = years => {
    let vnew_date = new Date();
    vnew_date.setFullYear(vnew_date.getFullYear() + years);
    return vnew_date;
}


let createAndAddChild = (pparent_element, ptag_name, pattributes, pcss_classes, pfuncs, pbefore_first_child = false) => {
    let vnew_el = document.createElement(ptag_name);
    if (pbefore_first_child) {
        pparent_element.insertBefore(vnew_el, pparent_element.firstChild);
    } else {
        pparent_element.appendChild(vnew_el);
    }

    if (pattributes) {
        for (let ikey in pattributes) {
            if (!(ikey in vnew_el)) {
                log(ptag_name + ' does not appear to have a property called ' + ikey);
            }
            try {
                vnew_el[ikey] = pattributes[ikey];
            } catch (ve) {
                log(ikey + ' does not appear to have a seter on tag ' + ptag_name);
                log(ve);
            }
        }
    }

    if (pcss_classes) {
        let vcl = vnew_el.classList;
        for (let css_class of pcss_classes) {
            vcl.add(css_class);
        }
    }

    if (pfuncs) {
        for (let ifunc of pfuncs) {
            ifunc(vnew_el);
        }
    }
    return vnew_el;
};


let decompressFromBase64 = pbase64_string => {
    // the line bellow uses standard javascript api
    // let vtext = atob(base64_string);

    // the line bellow depends on 'lz-string.js'
    // let vtext = LZString.decompressFromBase64(pbase64_string);

    let vtext;
    if (pbase64_string.includes('/')) {
        vtext = LZString.decompressFromBase64(pbase64_string);
    } else if (pbase64_string.includes('-')) {
        vtext = LZString.decompressFromEncodedURIComponent(pbase64_string);
    }

    return vtext;
};


let compressToBase64 = ptext => {
    // the line bellow uses standard javascript api
    // let base64_string = btoa(text);

    // the line bellow depends on 'lz-string.js'
    // let base64_string = LZString.compressToBase64(ptext); // this uses + and / wich is unsafe in url
    let base64_string = LZString.compressToEncodedURIComponent(ptext); // this uses + and - wich is url safe

    return base64_string;
}


let createFakeTasks = pflat => {
    let vtasks = [];
    gsequences.tasks = 0;
    let vstart_id = gsequences.tasks;
    // I have tested up to 10000 (ten thousand) fake tasks. the compressed, base64 encoded string weighted about only 160KB. If we assume 100000 (one hundred thousand) fake tasks weigh 1600KB, then it will be safe to assume that saving to the url (wich has 2MB limit on current chrome) will always be possible to virtually any kind or project
    let vtasks_to_generate = 100;
    let vend_id = vstart_id + vtasks_to_generate;
    if (pflat) {
        for (vstart_id = 0; vstart_id < vend_id; vstart_id++) {
            vtasks.push(newTask({
                parent_id: 0,
                name: `My name is ${vstart_id}`,
                description: `My name is ${vstart_id}, son of no one`,
                // description: `I am known as ${vstart_id + 1}, son of no one`,
            }));
        }

    } else {
        vtasks_to_generate /= 2;
        vend_id = vtasks_to_generate;
        // make a 'pyramid'
        for (; vstart_id < vend_id; vstart_id++) {
            // let start_id_minus_one = start_id - 1;
            vtasks.push(newTask({
                parent_id: vstart_id,
                name: `My name is ${vstart_id + 1}`,
                description: `I am known as ${vstart_id + 1}, son of ${vstart_id}, son of ${vstart_id - 1}`,
            }));
        }
        let vj = vtasks_to_generate;
        for (; vj > 0; vj--) {
            vtasks.push(newTask({
                parent_id: vj,
                name: `My name is ${vstart_id + 1}`,
                description: `I am known as ${vstart_id + 1}, son of ${vj}, son of ${vj - 1}`,
            }));
            vstart_id++;
        }
    }

    return vtasks;
};


let loadFromUrl = () => {
    let vget_params = gglobalThis.location.search
    if (!vget_params) {
        log('tried to load from url get request parameter but no data was found')
        return false;
    }
    vget_params = vget_params.trim();
    if (!vget_params.startsWith('?data')) {
        return false;
    }
    let b64 = vget_params.substring(6);
    let tsv = decompressFromBase64(b64);
    tsv = tsv.trim();
    if (!tsv) {
        return false;
    }
    parseMultitableTsvText(tsv);
    loadConfig();
    rebuildIndexes();
    log('loaded from url');
    return true;
};


let loadConfig = () => {
    if (gdata.config == null) {
        return;
    }
    gconfig = {};
    let hasDraft = false
    for (let ival of gdata.config) {
        if (ival.name == 'draft') {
            hasDraft = true;
        }
        gconfig[ival.name] = ival;
    }
    if (!hasDraft) {
        return;
    }
    let vdraftArea = /** @type{HTMLTextAreaElement} */(document.getElementById('draft_area_id'));
    if (vdraftArea == null) {
        return;
    }
    vdraftArea.value = gconfig.draft.value;
}


let loadFromUrlAndRebuild = () => {
    loadFromUrl();
    rebuildTasksDiv();
};


let loadFakeTasks = () => {
    replaceTasks(createFakeTasks(false));
    rebuildTasksDiv()
};


let downloadString = (pfname, pdatastring) => {
    if (!gdownload_anchor) {
        gdownload_anchor = createAndAddChild(gbody, 'a');
        gdownload_anchor.style.display = 'none';
    }
    gdownload_anchor.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(pdatastring);
    gdownload_anchor.download = pfname;
    gdownload_anchor.click();
}


let downloadJson = () => {
    let vtasks_str = JSON.stringify(gdata.tasks);
    downloadString('db.json', vtasks_str);
}


let generateMultitableTsvText = (pquote_char = gdefault_quote_char, pcolumn_separator = gdefault_column_separator) => {
    let vstr = '';
    log('________________________________________________________________________________');
    for (let itable_name in gdata) {
        log('begin storing ' + itable_name)
        vstr = vstr + itable_name + gdefault_row_separator;
        let vrows = gdata[itable_name];
        if (vrows == null) {
            continue
        }
        let vrows0 = vrows[0]
        if (vrows0 == null) {
            continue
        }
        for (let ikey in vrows0) { // this is just to collect the column names
            if (startsAndEndsWith(ikey, '_')) {
                continue; // non serialized property, usualy references to dom objects
            }
            vstr += ikey + pcolumn_separator;
        }
        vstr = vstr.substring(0, vstr.length - 1) + gdefault_row_separator;

        for (let irow of vrows) {
            for (let ikey in irow) {
                if (startsAndEndsWith(ikey, '_')) {
                    continue; // non serialized property, usualy references to dom objects
                }
                // its safer to stringify all the fields beforehand, so that strings become encapsulated in double quotes and the quotes itself get escaped, for example
                let vvalue = JSON.stringify(irow[ikey]);
                vstr += vvalue + pcolumn_separator;
            }
            vstr = vstr.substring(0, vstr.length - 1) + gdefault_row_separator;
        }
        vstr = vstr.substring(0, vstr.length - 1) + gdefault_table_separator;
        log('finished storing ' + itable_name)
    }
    vstr = vstr.substring(0, vstr.length - gdefault_table_separator.length);

    return vstr;
}


let downloadTsv = (pquote_char = gdefault_quote_char, pcolumn_separator = gdefault_column_separator) => {
    let vstr = generateMultitableTsvText(pquote_char, pcolumn_separator);
    downloadString('db.mt.tsv', vstr);
}


let parseTableRows = (ptable_name, prows, pcolumn_separator = gdefault_column_separator, pquote_char = gdefault_quote_char) => {
    if (!prows || prows.length < 1) {
        return [];
    }
    let vhead = prows.shift().split(pcolumn_separator);
    while (!vhead) {
        vhead = prows.shift().split(pcolumn_separator);
    }
    let vresult = [];
    let vmax = 0;
    for (let irow_txt of prows) {
        let vtrimmed_row = irow_txt.trim();
        if (!vtrimmed_row) {
            // skip any empty lines that may appear in the table text
            continue;
        }
        // let data = Object.assign({}, schema[table_name]);
        let vdata = {};
        if (ptable_name == 'tasks') {
            vdata = newTask(null, false);
        }
        if (ptable_name == 'config') {
            let a = 0; // breakpoint
        }
        let vrow_arr = vtrimmed_row.split(pcolumn_separator);
        let vcount = 0;
        for (let ikey of vhead) {
            let vval = vrow_arr[vcount] ?? '';
            let a, b, c;
            try {
                if (startsAndEndsWith(vval, '"')) {
                    // substitute backslash scaped double quotes by simple double quotes, because json.encode will turn '"' to '\"', and when the tsv is opened on a spreadsheet editor it will most likely be replaced by '\""'
                    let vl = vval.length;
                    if (vl === 2) {
                        // if this is an empty string, just let json parse parse it directly
                    } else {
                        // log(val);
                        vval = vval.replace(/\\""/g, '\\"');
                        // log(val);
                        if (vl != vval.length) {
                            // log('found');
                        }
                        // if this is a double quotes quoted string, remove escaped double quotes inside the string in case they where inserted by some spreadsheet app like libreoffice or ms office
                        // log(val);
                        vl = vval.length;
                        vval = vval.replace(/""/g, '"');
                        // log(val);
                        if (vl != vval.length) {
                            // log('found');
                        }
                    }
                }
                vval = JSON.parse(vval);
                b = vval;

            } catch (e) {
                log(e);
                try {
                    log(`"${vval}"`)
                    vval = JSON.parse(`"${vval}"`);
                    c = vval;

                } catch (e2) {
                    log('something very wrong happenned');
                    log(e2);
                }
            }
            vdata[ikey] = vval;
            vcount++;
        }
        if ('id' in vdata && typeof vdata.id == 'number' && vdata.id > vmax) {
            vmax = vdata.id;
        }
        vresult.push(vdata);
    }
    gsequences[ptable_name] = vmax;
    return vresult;
};


let parseTsvTableText = (ptable_text, prow_separator = gdefault_row_separator, pcolumn_separator = gdefault_column_separator, pquote_char = gdefault_quote_char) => {
    let vtrimmed = ptable_text.trim();
    let vrows = vtrimmed.split(prow_separator);
    let vtable_name = vrows.shift().trim();
    while (!vtable_name) {
        vtable_name = vrows.shift().trim();
    }
    if (vtable_name == 'other') { // TODO DELETE
        return; // TODO DELETE
    } // TODO DELETE
    let vvalues = parseTableRows(vtable_name, vrows, pcolumn_separator, pquote_char);
    gdata[vtable_name] = vvalues;
}


let prepareTsvTextForProcessing = ptext => {
    ptext = ptext.trim();
    ptext = ptext.replace(/\r\n/g, '\n');
    ptext = ptext.replace(/\r/g, '\n');
    ptext = ptext.replace(/\t+/g, '\t');
    ptext = ptext.replace(/\t\n/g, '\n');
    return ptext;
}


let parseMultitableTsvText = (ptext, ptable_separator = gdefault_table_separator, prow_separator = gdefault_row_separator, pcolumn_separator = gdefault_column_separator, pquote_char = gdefault_quote_char) => {
    let vtables_text_arr = prepareTsvTextForProcessing(ptext).split(ptable_separator);
    gsequences = {};
    for (let vtable_text of vtables_text_arr) {
        parseTsvTableText(vtable_text, prow_separator, pcolumn_separator, pquote_char);
    }
    let vdraftArea = /** @type{HTMLTextAreaElement} */(document.getElementById('draft_area_id'));
    if (vdraftArea == null) {
        return;
    }
    vdraftArea.value = gconfig.draft.value;
}


let uploadInputOnchange = () => {
    log('loading file');
    let vfiles = gupload_input.files;
    if (!vfiles) {
        return;
    }
    let vfile = vfiles[0];
    if (!vfile) {
        return;
    }
    let vreader = new FileReader();
    vreader.onload = evt => {
        /** @type {(string|ArrayBuffer|null)} */
        let vtxt_data = vreader.result;
        let vtmp = null;
        let vsuccess = false;
        if (typeof vtxt_data == 'string') {
            try {
                gdata = JSON.parse(vtxt_data); // allows uploading a json instead of a mttsv
                log('sucess loading json');
                vsuccess = true;

            } catch (e) {
                log('error reading file as json');
                log(e);
            }
        }

        if (!vsuccess) {
            try {
                parseMultitableTsvText(vtxt_data)
                rebuildIndexes()
                log('sucess loading tsv');
                vsuccess = true;

            } catch (e) {
                log('error reading file as mt.tsv');
                log(e);
            }
        }

        if (vsuccess) {
            loadConfig();
            rebuildTasksDiv();
            saveInAllPlaces();

        }
        // we need to reset the input so that when selecting the same file the onchage event will be triggered again
        gupload_input.value = ''
    };
    vreader.readAsText(vfile);
};


let uploadFile = () => {
    if (!gupload_input) {
        gupload_input = createAndAddChild(gbody, 'input', { type: 'file' });
        gupload_input.style.display = 'none';
        gupload_input.onchange = uploadInputOnchange;
    }
    gupload_input.click();
    // File chooser dialog can only be shown with a user activation.
}

let getAllCookieNames = () => {
    let vcookies = gdocument.cookie.split(';');
    let vresult = [];
    for (let i = 0; i < vcookies.length; i++) {
        let vcookie = vcookies[i].trim();
        let veqPos = vcookie.indexOf('=');
        let vname = veqPos > -1 ? vcookie.substring(0, veqPos) : vcookie;
        vresult.push(vname);
    }
    return vresult;
}

let deleteAllCookies = () => {
    for (let iname of getAllCookieNames()) {
        deleteCookie(iname);
    }
}

let deleteCookie = (pname) => {
    gdocument.cookie = pname + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

let getAllCookiesOrdered = () => {
    let vcookies = gdocument.cookie.split(';');
    let vresult = [];
    for (let i = 0; i < vcookies.length; i++) {
        let vcookie = vcookies[i].trim();
        let veqPos = vcookie.indexOf('=');
        let vname = veqPos > -1 ? vcookie.substring(0, veqPos) : vcookie;
        let vval = vcookie.substring(veqPos + 1);
        vresult.push([vname, vval]);
    }
    return vresult;
}

let setCookie = (pname, pval) => {
    gdocument.cookie = pname + '=' + pval
};

let getCookie = (pname) => {
    let vcookies = gdocument.cookie.split(";");
    for (let icookie of vcookies) {
        icookie = icookie.trim();
        let veqPos = icookie.indexOf("=");
        let vname = veqPos > -1 ? icookie.substring(0, veqPos) : icookie;
        if (vname == pname) {
            return icookie.substring(veqPos + 1);
        }
    }
    return null;
};


let saveToCookies = (vb64) => {
    // console.log(getAllCookieNames());
    if (vb64 == null) {
        let vtsv = generateMultitableTsvText(gdefault_quote_char, gdefault_column_separator);
        vb64 = compressToBase64(vtsv);
    }
    let vcount = 0;
    // let a = gdocument.cookie;
    deleteAllCookies();
    while (vb64.length > 4093) { // 4093 == 4097-4 (1 for the '=' char and 3 for the counter wich cannot go past 3 digits)
        // let vpart = vcount + '=' + vb64.substring(0, 4093);//.replaceAll('=', '*')
        // gdocument.cookie = vpart;
        setCookie(vcount, vb64.substring(0, 4093));
        vcount += 1;
        vb64 = vb64.substring(4093);
    }
    if (vb64.length > 0) {
        // let vpart = vcount + '=' + vb64;//.replaceAll('=', '*')
        // gdocument.cookie = vpart;
        setCookie(vcount, vb64);
        vcount += 1;
        vb64 = ''
    }
    // gdocument.cookie = 'expires=' + years_from_now(1000).toGMTString()
    // a = gdocument.cookie;
    // console.log(a);
    // console.log(getAllCookieNames());
    // console.log(getAllCookiesOrdered());

    log('saved to cookies');
}


let saveToUrl = (vb64) => {
    if (vb64 == null) {
        let vtsv = generateMultitableTsvText(gdefault_quote_char, gdefault_column_separator);
        vb64 = compressToBase64(vtsv);
    }
    // document.URL
    ghistory.pushState("", "", `?data=${vb64}`);
    log('saved to url');
}


// let save_to_websql = () => {
//     if (!gwebsqldb) {
//         gwebsqldb = openDatabase('data', '1.0', '', 5 * 1024 * 1024);
//         gwebsqldb.transaction(tx => {
//             tx.executeSql('CREATE TABLE tasks (id unique, name, description);');
//         });
//     } else {
//         gwebsqldb.transaction(tx => {
//             tx.executeSql('DROP TABLE tasks;');
//             tx.executeSql('CREATE TABLE tasks (id unique, name, description);');
//         });
//     }

//     let vinserts = [];
//     for (let itask of gdata.tasks) {
//         vinserts.push(`INSERT INTO tasks (id, name, description) VALUES (${JSON.stringify(itask.id)}, ${JSON.stringify(itask.name)}, ${JSON.stringify(itask.description)});`)
//     }
//     gwebsqldb.transaction(tx => {
//         for (let iinsert of vinserts) {
//             log(iinsert);
//             tx.executeSql(iinsert);
//         }
//     });
// }


// let save_to_cachestorage = pstep => {
//     log('a');
//     switch (pstep) {
//         case 0:
//             log('b');
//             caches.open('db.mt.tsv')
//                 .then(cache => {
//                     log('c');
//                     cache.delete('tasks')
//                     save_to_cachestorage(1);
//                 }).catch(err => {
//                     log('error');
//                 });
//             return;

//         case 1:
//             log('d');
//             caches.open('db.mt.tsv')
//                 .then(cache => {
//                     log('e');
//                     cache
//                         .add("tasks", gdata.tasks)
//                         .then(() => log("tasks saved"))
//                         .catch((err) => log(err));
//                 }).catch(err => {
//                     log('error');
//                 })
//     }
// };


let saveToIndexeddb = pstep => {
    log('save_to_indexeddb step ' + pstep);
    switch (pstep) {
        case 0:
            // delete the entire previous database
            let vreq = indexedDB.deleteDatabase("data");
            vreq.onsuccess = () => {
                console.log("Deleted database successfully");
                // call the next step
                saveToIndexeddb(1);
            };
            vreq.onerror = () => {
                console.log("Couldn't delete database");
                // call the next step
                saveToIndexeddb(1);
            };
            vreq.onblocked = () => {
                console.log("Couldn't delete database due to the operation being blocked");
                // call the next step
                saveToIndexeddb(1);
                // setTimeout(() => save_to_indexeddb(0), 100);
            };
            return;

        case 1:
            let vrequest = indexedDB.open("data");
            vrequest.onupgradeneeded = event => {
                if (event.target == null) {
                    return;
                }
                let vdb = event.target.result;
                let vobjectStore = vdb.createObjectStore("tasks", { keyPath: "id" });
                if (gdata.tasks == null) {
                    return;
                }
                for (let itask of gdata.tasks) {
                    vobjectStore.add(itask);
                }
                log('saved to indexeddb');
            }
    }
}


let loadFromCookies = () => { // cookie cannot store enough data. only 4096 bytes (4KB) per cookie (and 180 cookies per domain on chrome, so 737460 bytes, that is 720KB, not even 1MB)
    let vb64 = ''
    let vcookiesordered = getAllCookiesOrdered();
    for (let ipair of vcookiesordered) {
        /** @type {string} */
        let vstr = ipair[0].trim(); // nao deveria ser possivel comecar ou terminar com espaco em branco. mas play safe nao custa
        if (vstr.length > 0 && !isNaN(Number(vstr))) {
            vb64 += ipair[1];
        }
    }
    if (!vb64) {
        log('tried to load from cookies but no data was found')
        return false;
    }
    let vtsv = decompressFromBase64(vb64);
    vtsv = vtsv.trim();
    if (!vtsv) {
        return false;
    }
    parseMultitableTsvText(vtsv);
    loadConfig();
    rebuildIndexes();
    log('loaded from cookies');
    return true;
}


let saveToLocalStorage = (vb64) => { // local storage has a limit of 5MB on chrome
    if (vb64 == null) {
        let vtsv = generateMultitableTsvText(gdefault_quote_char, gdefault_column_separator);
        vb64 = compressToBase64(vtsv);
    }
    glocalStorage.setItem("data", vb64);
    if ((/** @type{string} */(glocalStorage.getItem("data"))).length != vb64.length) {
        var vmsg = 'local storage was unable to hold database. data is too large'
        assert(false, 'vmsg');
        alert(vmsg);
    }
    log('saved to local storage');
};


let loadFromLocalStorage = () => {
    let vb64 = glocalStorage.getItem("data");
    if (!vb64) {
        log('tried to load from local storage but no data was found')
        return false;
    }
    let vtsv = decompressFromBase64(vb64);
    vtsv = vtsv.trim();
    if (!vtsv) {
        return false;
    }
    parseMultitableTsvText(vtsv);
    loadConfig();
    rebuildIndexes();
    log('loaded from local storage');
    return true;
};


// let load_from_local_storage_and_rebuild_div = () => {
//     load_from_local_storage();
//     rebuild_data_div;
// }


let saveInAllPlaces = () => {
    let vtsv = generateMultitableTsvText(gdefault_quote_char, gdefault_column_separator);
    let vb64 = compressToBase64(vtsv);
    log(`saving data with lenght of ${vb64.length} bytes`);
    saveToUrl(vb64);
    saveToLocalStorage(vb64);
    saveToCookies(vb64);
}

let startsAndEndsWith = (ptxt, psurround) => {
    return ptxt.startsWith(psurround) && ptxt.endsWith(psurround)
}


let addChildTask = (ptaskObj, pparentTaskId, pbefore) => {
    let vnewChildTask = newTask({
        parent_id: pparentTaskId,
        // name: `child of ${parent_task_id} name`,
        // description: `child of ${parent_task_id} description`,
    });
    for (let ikey in ptaskObj) {
        if (startsAndEndsWith(ikey, '_')) {
            continue
        }
        vnewChildTask[ikey] = ptaskObj[ikey];
    }
    if (gdata.tasks != null) {
        if (pbefore) {
            gdata.tasks.unshift(vnewChildTask);

        } else {
            gdata.tasks.push(vnewChildTask);
        }
    }

    addTaskToIndex(vnewChildTask);
    return vnewChildTask;
};


let addChildTaskAndDiv = (pparent_div, pparent_task) => {
    let vnew_child_task = addChildTask({}, pparent_task.id);
    vnew_child_task.indent = pparent_task.indent + 1;
    createTaskContainer(vnew_child_task, pparent_div, true);
};


let reparentTask = (ptask_obj, pnew_parent_id) => {
    if (isRightAncestorOfLeft(getTaskById(pnew_parent_id), ptask_obj.id)) {
        logalert('ERROR: cannot reparent because current task is ancestor of new parent');
        return;
    }
    ptask_obj.parent_id = pnew_parent_id;
    rebuildIndexes();
    rebuildTasksDiv();
};


let reparentTaskPrompt = task => {
    let vnewParentId = prompt('input the new parent id');
    let vnewParentIdInt = vnewParentId == null ? 0 : parseInt(vnewParentId);
    if (vnewParentIdInt < 1) {
        return;
    }
    reparentTask(task, vnewParentIdInt);
};


let makeSiblingOfParent = task => {
    let vparent_id = task.parent_id;
    let vparent_task = getTaskById(vparent_id);
    let vgrandparent_id = vparent_task.parent_id;
    task.parent_id = vgrandparent_id;
    rebuildIndexes();
    rebuildTasksDiv();
};


let makeChildOfPrevious = (pcontainer, ptask) => {
    let vprevious_div = pcontainer.previousSibling;
    if (!vprevious_div) {
        log('there is no previous sibling we can become hild of');
        return
    }

    let vprevious_task_id = parseInt(vprevious_div.extra_data.task.id);
    let vprevious_task_obj = gtask_id_to_task[vprevious_task_id];
    let vprevious_children_div = vprevious_div.querySelector('div.children');
    pcontainer.parentElement.removeChild(pcontainer);
    vprevious_children_div.appendChild(pcontainer)
    ptask.parent_id = vprevious_task_id;
    rebuildIndexes();
};


let toggleHidden = element => {
    if (Array.isArray(element)) {
        for (let iel of element) {
            toggleHidden(iel);
        }
        return;
    }
    let vstyle = element.style;
    let vdisplay = vstyle.display;
    if (vdisplay == 'none') {
        vdisplay = vstyle.display = 'block';
    } else {
        vdisplay = vstyle.display = 'none';
    }
    return vdisplay;
}


/**
 * @param {HTMLDivElement} [pcontainerdiv]
 * @return {undefined}
 */
let hideShowChildren = function (pcontainerdiv) { // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
    /** @type {HTMLButtonElement} */
    let vthis = /** @type {?} */(this);
    if (typeof vthis != 'object') {
        return;
    }
    let vfirstparent = vthis.parentElement;
    let vsecondparent = vfirstparent?.parentElement ?? null;
    let vthirdparent = vsecondparent?.parentElement ?? null;
    /** @type{(undefined|null|HTMLDivElement)} */
    // 'this' is the button, first parent is the form_div, second parent is the container_div
    let vcontainerDiv = (/** @type{(undefined|null|HTMLDivElement)} */ (pcontainerdiv ?? vthirdparent)); // inputbtn > btnsdiv > formdiv > treecontainerdiv
    if (vcontainerDiv == null) {
        return;
    }
    /** @type{(undefined|null|HTMLDivElement)} */
    let vchildrenDiv = vcontainerDiv.querySelector('div.children');
    let vdisplay = vchildrenDiv.style.display;
    if (vdisplay == 'none') {
        vchildrenDiv.style.display = 'block';
        // vthis.value = 'hide child tasks';
        if (vthis) {
            vthis.value = 'collapse';
        }
    } else {
        vchildrenDiv.style.display = 'none';
        // vthis.value = 'show child tasks';
        if (vthis) {
            vthis.value = 'expand';
        }
    }
}


let highlightTask = (pbutton, pelement) => {
    let vcl = pelement.classList;
    if (vcl.contains('highlight')) {
        pbutton.value = 'highlight task';
    } else {
        pbutton.value = 'disable highlight';
    }
    vcl.toggle('highlight');
}


let hideTaskUntilReload = (pdiv) => {
    toggleHidden(pdiv);
}


let goUpOnList = task_obj => {
    let vcontainer_div = document.getElementById(gid_container_div_prefix + task_obj.id);
    let vprevious_container = vcontainer_div.previousSibling;
    if (!vprevious_container) {
        return
    }
    task_obj.order;
    let vparent_child_div = vcontainer_div.parentElement; // parentNode
    vparent_child_div.removeChild(vcontainer_div);
    vparent_child_div.insertBefore(vcontainer_div, vprevious_container);

    let vother_task = vprevious_container.extra_data.task;
    let vold_order = task_obj.order;
    task_obj.order = vother_task.order;
    vother_task.order = vold_order;
    log(gdata.tasks);
}


let goDownOnList = task_obj => {
    let vcontainer_div = document.getElementById(gid_container_div_prefix + task_obj.id);
    let vnext_container = vcontainer_div.nextSibling;
    if (!vnext_container) {
        return
    }
    let vnext_next_container = vnext_container.nextSibling;
    if (!vnext_container) {
        return
    }
    let vparent_child_div = vcontainer_div.parentElement; // parentNode
    vparent_child_div.removeChild(vcontainer_div);
    vparent_child_div.insertBefore(vcontainer_div, vnext_next_container);

    let vother_task = vnext_container.extra_data.task;
    let vold_order = task_obj.order;
    task_obj.order = vother_task.order;
    vother_task.order = vold_order;
    log(gdata.tasks);
}


let countSiblings = element => {
    let vtag = element.tagName;
    let vcnt = 0;
    let vprevious = element.previousSibling;
    while (vprevious) {
        if (vprevious.tagName == vtag) {
            vcnt++;
        }
        vprevious = vprevious.previousSibling;
    }
    return vcnt;
}


let getPath = element => {
    let vpath = '';
    let vparent = element;

    while (vparent) {
        let vtag = vparent.tagName;
        let vcnt = countSiblings(vparent);
        vpath = `/${vtag}[${vcnt}]${vpath}`;
        vparent = vparent.parentElement;
    }
    return vpath;
};


let recursiveSaveCheck = how_much_we_should_wait_ms => {
    let vbefore = gsave_timeout;
    let vnow = Date.now();
    let vhow_much_time_actually_passed_ms = vnow - vbefore;
    if (vhow_much_time_actually_passed_ms >= how_much_we_should_wait_ms) {
        saveInAllPlaces();
        gsave_timeout = null;
        return;
    }
    let diff = how_much_we_should_wait_ms - vhow_much_time_actually_passed_ms;
    setTimeout(() =>
        recursiveUpdateCheck(diff), diff);
};


let saveAfterTimeout = sleep_msecs => {
    let vnow = Date.now();
    if (!gsave_timeout) {
        // if there is no timeout running, set the time and call the function
        gsave_timeout = vnow;
        setTimeout(() =>
            recursiveSaveCheck(sleep_msecs), sleep_msecs);
    } else {
        // if there is already a timeout running, just reset the time
        gsave_timeout = vnow;
    }
}


let recursiveUpdateCheck = (ptask_obj, pfield_name, pinput_element, phow_much_we_should_wait_ms, pgetter_func, pcallbacks) => {
    // if (pinput_element == null) { // if null or undefined
    //     assert(ptask_obj.name == 'draft' && pfield_name == 'value');
    //     return
    // }
    let vid = ptask_obj.id;
    let vbefore = gupdate_timeouts[vid];
    let vnow = Date.now();
    let vhow_much_time_actually_passed_ms = vnow - vbefore;
    if (vhow_much_time_actually_passed_ms >= phow_much_we_should_wait_ms) {
        let vold_value = ptask_obj[pfield_name];
        let vnew_value = ptask_obj[pfield_name] = pgetter_func(pinput_element.value);
        if ('last_update_date' in ptask_obj) {
            ptask_obj.last_update_date = Date.now();
        }
        let vold_value_subs = vold_value;
        if (typeof vold_value_subs == 'string' && vold_value_subs.length > 10) {
            vold_value_subs = String(vold_value).substring(0, 10);
            if (String(vold_value).length > vold_value_subs.length) {
                vold_value_subs += ' ...';
            }
        }
        let vnew_value_subs = vnew_value;
        if (typeof vnew_value_subs == 'string' && vnew_value_subs.length > 10) {
            vnew_value_subs = String(vnew_value).substring(0, 10);
            if (String(vnew_value).length > vnew_value_subs.length) {
                vnew_value_subs += ' ...';
            }
        }
        // log(`task.${pfield_name} changed from '${vold_value_subs}' to '${vnew_value_subs}'`)
        gupdate_timeouts[vid] = null;
        if (pcallbacks) {
            if (Array.isArray(pcallbacks)) {
                for (let icallback of pcallbacks) {
                    icallback();
                }
            } else {
                pcallbacks();
            }
        }
        saveAfterTimeout(gdefault_sleep_msecs);
        return;
    }
    setTimeout(() =>
        recursiveUpdateCheck(ptask_obj, pfield_name, pinput_element, phow_much_we_should_wait_ms - vhow_much_time_actually_passed_ms, pgetter_func, pcallbacks), phow_much_we_should_wait_ms);
}


let updateAfterTimeout = (ptask_obj, pfield_name, pinput_element, psleep_msecs = gdefault_sleep_msecs, pfunc = identity, pcallbacks = null) => {
    let vid = ptask_obj.id;
    let vcur_timeout = gupdate_timeouts[vid];
    let vnow = Date.now();
    if (!vcur_timeout) {
        // if there is no timeout running, set the time and call the function
        gupdate_timeouts[vid] = vnow;
        setTimeout(() =>
            recursiveUpdateCheck(ptask_obj, pfield_name, pinput_element, psleep_msecs, pfunc, pcallbacks), psleep_msecs,);
    } else {
        // if there is already a timeout running, just reset the time
        gupdate_timeouts[vid] = vnow;
    }
}


let deleteTask = (pdiv, ptask_to_delete) => {
    let vtasks = gdata.tasks;
    let vindex = vtasks.indexOf(ptask_to_delete);
    // removes 1 element starting at index 'index'
    vtasks.splice(vindex, 1)
    // for now lets just rebuild the indexes, its easier than otherwise

    let vdivpath = getPath(pdiv);
    let vparentpath = getPath(pdiv.parentElement)
    log('will now remove ' + vdivpath + ' from ' + vparentpath);
    pdiv.parentElement.removeChild(pdiv);
    rebuildIndexes();
    log('deleted task ' + ptask_to_delete.id)
    saveInAllPlaces();
}


let deleteTaskDialog = (pdiv, ptask) => {
    let vdo_delete = confirm(`are you sure you want to dele task ${ptask.id} (name:${ptask.name}; description:${ptask.description})?`);
    let vcancel_msg = 'no task was deleted';
    if (!vdo_delete) {
        log(vcancel_msg);
        return;
    }

    let vchildren = gtask_id_to_children[ptask.id] ?? null;
    if (vchildren && vchildren.length > 0) {
        vdo_delete = confirm(`task ${ptask.id} has ${vchildren.length} children. this will also delete them all. are you sure?`);
        if (!vdo_delete) {
            logalert('no task was deleted');
            return
        }
    }

    deleteTask(pdiv, ptask);
}


let addSelectOptions = (pselect, poptions, pselected_index) => {
    createAndAddChild(pselect, 'option', {
        value: 0,
        innerText: '-',
    });
    for (let ioption of poptions) {
        createAndAddChild(pselect, 'option', {
            value: ioption.id,
            innerText: ioption.name,
        });
    }
    if (pselected_index != 0) {
        let a = 0; // breakpoint
    }
    pselect.selectedIndex = pselected_index;
}


let createTaskContainer = (ptaskObj, pparent_div, pinsert_before = false) => {
    /*
    container div
        current task div
            name div
            current form div
            buttons div
        children div
    */
    let vid = ptaskObj.id;
    let vchild_tasks = gtask_id_to_children[vid] ?? []; // tasks.filter((i) => 'parent_id' in i && i.parent_id == task_obj.id);
    let visleaf = vchild_tasks.length < 1;
    // log('create card for task ' + id);
    let vcontainer_div_id = gid_container_div_prefix + vid;
    let vform_id = gid_form_div_prefix + vid;
    let vcontainer_div = createAndAddChild(pparent_div, 'div', {
        id: vcontainer_div_id,
        draggable: "true",
        extra_data: { task: ptaskObj },
    }, null, null, pinsert_before);
    ptaskObj._taskRootDiv_ = vcontainer_div


    let vclassList = vcontainer_div.classList;
    vclassList.add('idented');
    vclassList.add('container');

    let vcurrent_task_div = createAndAddChild(vcontainer_div, 'div');
    vclassList = vcurrent_task_div.classList;
    vclassList.add('form');
    vclassList.add('card');
    vclassList.add('pad10px');
    // let vbackcolrgba = fnokhslcssrgba(ptask_obj.indent * 29, 100, 80, 0.999);
    // vcurrent_task_div.style.backgroundColor = `rgba(${vbackcolrgba.r}, ${vbackcolrgba.g}, ${vbackcolrgba.b}, ${vbackcolrgba.a})`;
    let vbackcolhsla = { h: ptaskObj.indent * 29, s: 100, l: 50, a: 0.5 }
    if (!visleaf) {
        vbackcolhsla.s *= 0.5;
    }
    vcurrent_task_div.style.backgroundColor = `hsla(${vbackcolhsla.h}, ${vbackcolhsla.s}%, ${vbackcolhsla.l}%, ${vbackcolhsla.a})`;


    let vname_and_menu_div = createAndAddChild(vcurrent_task_div, 'div');
    let vselect = createAndAddChild(vname_and_menu_div, 'select');
    vselect.style.width = '18px';
    vselect.onfocus = function (pe) {
        log('onfocus')
        if (!('extra_data' in this)) {
            this.extra_data = {}
        }
        this.extra_data.valueBefore = this.value;
    }
    vselect.onchange = function (pe) {
        log('onchange')
        if (!('extra_data' in this)) {
            this.extra_data = {}
        }
        // log(`before: ${this.extra_data.valueBefore}`);
        // log(`now: ${this.value}`);
        switch (this.value) {
            case 'reparent': reparentTaskPrompt(ptaskObj); return;
            case 'collapse/expand': hideShowChildren(ptaskObj._taskRootDiv_); return;
            case 'description': alert(ptaskObj.description); return;
        }
        this.blur(); // worst api method name EVER. why not unfocus?
        this.value = '';
    }
    let vop0 = createAndAddChild(vselect, 'option', { textContent: '-' });
    let vopreparent = createAndAddChild(vselect, 'option', { textContent: 'reparent' });
    let vopcolapse = createAndAddChild(vselect, 'option', { textContent: 'collapse/expand' });
    let vopdescription = createAndAddChild(vselect, 'option', { textContent: 'description' });

    let vname_div = createAndAddChild(vname_and_menu_div, 'div');
    vname_div.style.display = 'inline-block';
    let vbuttons_div = createAndAddChild(vcurrent_task_div, 'div'); // buttons before form
    let vcurrent_form = createAndAddChild(vcurrent_task_div, 'div', { id: vform_id });
    vname_div.onclick = () =>
        toggleHidden([vcurrent_form, vbuttons_div]);
    // vname_div.oncontextmenu = function (pe) {
    //     pe.preventDefault();
    //     // TODO: create context menu
    //     // https://www.geeksforgeeks.org/how-to-add-a-custom-right-click-menu-to-a-webpage/
    // }
    toggleHidden([vcurrent_form, vbuttons_div]);




    let vcssclasses = [];
    if (visleaf) {
        vcssclasses.push('bold'); // only leaf tasks are bold for easy diferentiation between groups and actual tasks
    } else {
        vcssclasses.push('gray'); // if task is not a tree leaf, then it should be grayed out to reduce attention
    }




    let vid_span = createAndAddChild(vname_div, 'span', { textContent: `${ptaskObj.indent}-#${vid}: ` }, vcssclasses);
    let vname_span = createAndAddChild(vname_div, 'span', {
        id: gid_name_div_prefix + vid,
        textContent: ptaskObj.name,
    }, vcssclasses);
    let vStatusSpan = createAndAddChild(vname_div, 'span', {
        textContent: ' - ' + getStatusNameById(ptaskObj.status_id)
    }, vcssclasses);


    let vlabel_name = createAndAddChild(vcurrent_form, 'label', { textContent: 'Name:' });
    let vinput_name = createAndAddChild(vcurrent_form, 'textarea', {
        value: ptaskObj.name,
        rows: 1, cols: 40,
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onkeyup: function () {
            updateAfterTimeout(ptaskObj, 'name', this, gdefault_sleep_msecs, identity, () => {
                document.getElementById(gid_name_div_prefix + vid).innerText = ptaskObj.name;
            })
        },
    });

    let vbr0 = createAndAddChild(vcurrent_form, 'br');
    let vlabel_description = createAndAddChild(vcurrent_form, 'label', { textContent: 'Description:' });
    let vinput_description = createAndAddChild(vcurrent_form, 'textarea', {
        value: ptaskObj.description,
        rows: 2,
        cols: 40,
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onkeyup: function () { updateAfterTimeout(ptaskObj, 'description', this, gdefault_sleep_msecs) },
    });

    let vbr1 = createAndAddChild(vcurrent_form, 'br');
    let vlabel_start_date = createAndAddChild(vcurrent_form, 'label', { textContent: 'Start Date:' });
    let vinput_start_date = createAndAddChild(vcurrent_form, 'input', {
        type: 'date',
        value: (new Date(ptaskObj.start_date)).toISOString().substring(0, 10),
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () { updateAfterTimeout(ptaskObj, 'start_date', this, gdefault_sleep_msecs, new_date_ms) },
    });

    let vbr2 = createAndAddChild(vcurrent_form, 'br');
    let vlabel_due_date = createAndAddChild(vcurrent_form, 'label', { textContent: 'Due Date:' });
    let vinput_due_date = createAndAddChild(vcurrent_form, 'input', {
        type: 'date',
        value: (new Date(ptaskObj.due_date)).toISOString().substring(0, 10),
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () { updateAfterTimeout(ptaskObj, 'due_date', this, gdefault_sleep_msecs, new_date_ms) },
    });

    let vbr3 = createAndAddChild(vcurrent_form, 'br');
    let vlabel_select_asignee = createAndAddChild(vcurrent_form, 'label', { textContent: 'Assignee:' });
    let vselect_asignee = createAndAddChild(vcurrent_form, 'select', {
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () { updateAfterTimeout(ptaskObj, 'assignee_id', this, gdefault_sleep_msecs, parseInt) },
    });
    addSelectOptions(vselect_asignee, gdata.assignees, ptaskObj.assignee_id);

    let vbr4 = createAndAddChild(vcurrent_form, 'br');
    let vlabel_select_role = createAndAddChild(vcurrent_form, 'label', { textContent: 'Role:' });
    let vselect_role = createAndAddChild(vcurrent_form, 'select', {
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () { updateAfterTimeout(ptaskObj, 'role_id', this, gdefault_sleep_msecs, parseInt) },
    });
    addSelectOptions(vselect_role, gdata.roles, ptaskObj.role_id);

    let vbr5 = createAndAddChild(vcurrent_form, 'br');
    let vlabel_select_status = createAndAddChild(vcurrent_form, 'label', { textContent: 'Status:' });
    let vselect_status = createAndAddChild(vcurrent_form, 'select', {
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () { updateAfterTimeout(ptaskObj, 'status_id', this, gdefault_sleep_msecs, parseInt) },
    });
    addSelectOptions(vselect_status, gdata.statuses, ptaskObj.status_id);

    let vbr6 = createAndAddChild(vcurrent_form, 'br');
    let vlabel_select_type = createAndAddChild(vcurrent_form, 'label', { textContent: 'Type:' });
    let vselect_type = createAndAddChild(vcurrent_form, 'select', {
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () { updateAfterTimeout(ptaskObj, 'type_id', this, gdefault_sleep_msecs, parseInt) },
    });
    addSelectOptions(vselect_type, gdata.types, ptaskObj.type_id);

    let vbr7 = createAndAddChild(vcurrent_form, 'br');
    let vlabel_select_priority = createAndAddChild(vcurrent_form, 'label', { textContent: 'Priority:' });
    let vselect_priority = createAndAddChild(vcurrent_form, 'select', {
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () { updateAfterTimeout(ptaskObj, 'priority_id', this, gdefault_sleep_msecs, parseInt) },
    });
    addSelectOptions(vselect_priority, gdata.priorities, ptaskObj.priority_id);

    let vbr8 = createAndAddChild(vcurrent_form, 'br');
    let vLabelInputNumberTodoOrder = createAndAddChild(vcurrent_form, 'label', { textContent: 'TODO order:' });
    let vInputNumberTodoOrder = createAndAddChild(vcurrent_form, 'input', {
        type: 'number',
        value: ptaskObj.todo_order,
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () { updateAfterTimeout(ptaskObj, 'todo_order', this, gdefault_sleep_msecs, parseInt) },
    });

    // TODO: hidden checkbox here


    // let focus_button = create_and_add_child(buttons_div, 'input', { type: 'button', value: 'focus task', onclick: () => focus_task(focus_button, container_div) }, ['margin5px']);
    let vhighlight_button = createAndAddChild(vbuttons_div, 'input', {
        type: 'button', value: 'highlight task', onclick: () =>
            highlightTask(vhighlight_button, vcontainer_div)
    }, ['margin5px']);
    let vhidebtn = createAndAddChild(vbuttons_div, 'input', {
        type: 'button', value: 'temporarily hide', onclick: () =>
            hideTaskUntilReload(vcontainer_div)
    }, ['margin5px']);
    let vhide_show_children_button = createAndAddChild(vbuttons_div, 'input', { type: 'button', value: 'collapse', onclick: hideShowChildren }, ['margin5px']);
    let vadd_child_task_button = createAndAddChild(vbuttons_div, 'input', {
        type: 'button', value: 'add child task', onclick: () =>
            addChildTaskAndDiv(vchildren_div, ptaskObj)
    }, ['margin5px']);
    let vdelete_task_button = createAndAddChild(vbuttons_div, 'input', {
        type: 'button', value: 'delete task', onclick: () =>
            deleteTaskDialog(vcontainer_div, ptaskObj)
    }, ['margin5px']);
    let vreparent_task_button = createAndAddChild(vbuttons_div, 'input', {
        type: 'button', value: 'reparent task', onclick: () =>
            reparentTaskPrompt(ptaskObj)
    }, ['margin5px']);
    let vmake_sibling_of_parent_button = createAndAddChild(vbuttons_div, 'input', {
        type: 'button',
        value: 'move left',
        onclick: () =>
            makeSiblingOfParent(ptaskObj),
    });
    // let make_sibling_of_parent_button_img = create_and_add_child(make_sibling_of_parent_button, 'img', {
    //     src: '~up.svg',
    //     width: 16,
    //     height: 16,
    // }, ['margin5px'])
    // set_style(make_sibling_of_parent_button_img, {
    //     transform: 'rotate(-90deg)',
    // })
    // set_style(make_sibling_of_parent_button, {
    //     backgroundColor: 'hsla(270, 100%, 80%, 0.7)',
    //     float: 'none',
    // })
    let vmake_child_of_previous_sibling_button = createAndAddChild(vbuttons_div, 'input', {
        type: 'button', value: 'move right', onclick: () =>
            makeChildOfPrevious(vcontainer_div, ptaskObj)
    }, ['margin5px']);
    // unimplemented
    let vgo_up_on_list_button = createAndAddChild(vbuttons_div, 'input', {
        type: 'button', value: 'move up', onclick: () =>
            goUpOnList(ptaskObj)
    }, ['margin5px', 'up']);
    let vgo_down_on_list_button = createAndAddChild(vbuttons_div, 'input', {
        type: 'button', value: 'move down', onclick: () =>
            goDownOnList(ptaskObj)
    }, ['margin5px']);
    // delete (reparent children to grandparent)
    // delete (with children)


    let vchildren_div = createAndAddChild(vcontainer_div, 'div', { id: gid_children_div_prefix + vid });
    vclassList = vchildren_div.classList;
    vclassList.add('children');


    let vordered_child_tasks = vchild_tasks.slice().sort(taskCompareByOrder);
    let vorder = 0;
    let vhide_completed = gconfig.hide_completed.value;
    for (let ichild_task of vordered_child_tasks) {
        // fix order while assembling page
        ichild_task.order = ++vorder;
        ichild_task.indent = ptaskObj.indent + 1;
        if (vhide_completed && ichild_task.status_id == 4) {
            continue; // skip completed root tasks IF told to do so
        }
        createTaskContainer(ichild_task, vchildren_div)
    }
};


let rebuildTasksDiv = () => {
    gdata_div.innerHTML = null;

    let vroot_tasks = gtask_id_to_children[0]; // tasks.filter((i) => i.parent_id < 1);
    if (!vroot_tasks) {
        return;
    }

    let vordered_root_tasks = vroot_tasks.slice().sort(taskCompareByOrder);
    let vorder = 0;
    let vhide_completed = gconfig.hide_completed.value;
    for (let iroot_task of vordered_root_tasks) {
        iroot_task.order = ++vorder;
        iroot_task.indent = 0;
        if (vhide_completed && iroot_task.status_id == 4) {
            continue; // skip completed root tasks
        }
        createTaskContainer(iroot_task, gdata_div)
    }
}


let clearTasks = () => {
    gsequences.tasks = 0;
    gdata.tasks = [];
    rebuildIndexes();
    loadConfig();
    ghistory.pushState('', '', '');
}


let clear_tasks_confirm = () => {
    let vdo_delete = confirm(`are you sure you want to delete all tasks?`);
    if (!vdo_delete) {
        return;
    }
    clearTasks();
}


let clearTasksAndRebuildDataDiv = () => {
    clear_tasks_confirm();
    rebuildTasksDiv();
}


let add_root_task = () => {
    addChildTask({}, 0, true);
    rebuildTasksDiv();
};


let toggleCssOverflow = () => {
    for (let isheet of gstyleSheets) {
        for (let irule of isheet.cssRules) {
            if (irule.selectorText == '.force_scroll') {
                let vold_overflow = irule.style.overflow;

                if (vold_overflow == 'scroll') {
                    irule.style.overflow = '';
                    irule.style.width = ''

                } else {
                    irule.style.overflow = 'scroll';
                    // 7680 is the 8k resolution width
                    irule.style.width = '7680px'
                }

                return;
            }
        }
    }
}


let preventTabFromGettingOut = function (pe) { // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
    if (pe.key == 'Tab') {
        pe.preventDefault();
        let start = this.selectionStart;
        let end = this.selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);

        // put caret at right position again
        this.selectionStart = this.selectionEnd = start + 1;
    }
};


let showCompletedTasks = (pbutton) => {
    gconfig.hide_completed.value = !gconfig.hide_completed.value; // invert hide completed value
    pbutton.extra_data.hidden = gconfig.hide_completed.value;
    if (gconfig.hide_completed.value) {
        pbutton.value = 'show completed';
    } else {
        pbutton.value = 'hide completed';
    }

    rebuildTasksDiv();
}


let rebuildMenuDiv = () => {
    if (!groot_div) {
        groot_div = createAndAddChild(gbody, 'div', { id: 'id_root_div' });
        groot_div.classList.add('force_scroll')
    }

    if (!gmenu_div) {
        gmenu_div = createAndAddChild(groot_div, 'div', { id: 'id_menu_div' });
    }

    if (!gdata_div) {
        gdata_div = createAndAddChild(groot_div, 'div', { id: 'id_data_div' });
    }

    if (!gdraft_div) {
        gdraft_div = createAndAddChild(groot_div, 'div', { id: 'id_draft_div' });
    }

    // let load_from_url_get_param_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from url', onclick: load_from_url_and_rebuild }, ['margin5px']);

    // let load_from_cookies_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from cookies', onclick: load_from_cookies }, ['margin5px']);

    // let load_from_local_storage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from local storage', onclick: load_from_local_storage_and_rebuild_div }, ['margin5px']);

    let vrebuildTree = createAndAddChild(gmenu_div, 'input', { type: 'button', value: 'rebuild view', onclick: rebuildTasksDiv }, ['margin5px']);

    let vadd_root_task_button = createAndAddChild(gmenu_div, 'input', { type: 'button', value: 'add root task', onclick: add_root_task }, ['margin5px']);

    let vupload_data_button = createAndAddChild(gmenu_div, 'input', { type: 'button', value: 'upload db', onclick: uploadFile }, ['margin5px']);

    // let load_fake_tasks_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'generate fake tasks', onclick: load_fake_tasks }, ['margin5px']);



    // load from indexeddb

    // create_and_add_child(menu_div, 'br');

    // let save_to_url_and_local_storage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save data in browser', onclick: save_to_url_and_local_storage }, ['margin5px']);

    // let save_to_url_get_param_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to url', onclick: save_to_url_get_param }, ['margin5px']);

    // let save_to_websql_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to websql', onclick: save_to_websql });

    // let save_to_cachestorage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to cachestorage', onclick: () => save_to_cachestorage(0) });

    // let save_to_cookies_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to cookies', onclick: save_to_cookies }, ['margin5px']);

    // let save_to_local_storage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to local storage', onclick: save_to_local_storage }, ['margin5px']);

    // let save_to_indexeddb_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to indexeddb', onclick: () => save_to_indexeddb(0) }, ['margin5px']);

    // let download_json_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'download json', onclick: download_json }, ['margin5px']);

    let vdownload_tsv_button = createAndAddChild(gmenu_div, 'input', { type: 'button', value: 'download db', onclick: downloadTsv }, ['margin5px']);

    // create_and_add_child(menu_div, 'br');

    let vclear_tasks_button = createAndAddChild(gmenu_div, 'input', { type: 'button', value: 'clear tasks', onclick: clearTasksAndRebuildDataDiv }, ['margin5px']);

    let vshow_hide_completed_button = createAndAddChild(gmenu_div, 'input', {
        type: 'button', value: 'hide completed', onclick: () =>
            showCompletedTasks(vshow_hide_completed_button), extra_data: { hidden: false }
    }, ['margin5px']);
    vshow_hide_completed_button.extra_data.hidden = false;

    let vtoggle_overflow_button = createAndAddChild(gmenu_div, 'input', { type: 'button', value: 'toggle css overflow', onclick: toggleCssOverflow }, ['margin5px']);





    // create_and_add_child(menu_div, 'br');

    // let switch_to_hierarchical_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'hierarchical view', onclick: switch_to_hierarchical_view }, ['margin5px']);

    // let switch_to_hierarchical_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'table view', onclick: switch_to_table_view }, ['margin5px']);

    // let switch_to_kanban_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'kanban view', onclick: switch_to_kanban_view }, ['margin5px']);

    // let switch_to_gantt_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'gantt view', onclick: switch_to_gantt_view }, ['margin5px']);

    // add root children

    let vurl = 'https://gnumaru.github.io/simpletaskmanager/';
    let vsite_link = createAndAddChild(gmenu_div, 'a', { href: vurl, innerText: 'App: ' + vurl });
    // create_and_add_child(menu_div, 'br');

    createAndAddChild(gmenu_div, 'span', { innerText: ' ' });

    vurl = 'https://github.com/Gnumaru/simpletaskmanager';
    let vcode_link = createAndAddChild(gmenu_div, 'a', { href: vurl, innerText: 'Code: ' + vurl });
    // create_and_add_child(menu_div, 'br');

    let vdraft_obj = gconfig.draft;
    let vinput_name = createAndAddChild(gdraft_div, 'textarea', {
        id: 'draft_area_id',
        value: vdraft_obj.value,
        rows: 51, cols: 230,
        style: 'border: 1px solid black',
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onkeyup: function () { updateAfterTimeout(gconfig.draft, 'value', this, gdefault_sleep_msecs) },
        onkeydown: preventTabFromGettingOut,
    });
};


/**
 * tries to load the data from at least: url, cookies and local storage, in this order. save the data in the places it wasn found
 * @returns {undefined}
 */
let loadData = () => {
    // priority:
    // 1) url
    // 2) cookies
    // 3) local storage
    if (!loadFromUrl()) { // if there was no data in the get parameter, try loading from local storage
        // deleteAllCookies();
        if (!loadFromCookies()) { // if there was no data in the cookies, parameter, try loading from local storage
            if (!loadFromLocalStorage()) { // if there also wasnt data in the local storage, create a new empty data
                clearTasks();
                saveToLocalStorage(); // if cleared tasks, save empty tasks to local storage
            }
            saveToCookies(); // save loaded (or empty) tasks to cookies
        }
        saveToUrl(); // save loaded (or empty) tasks to url
    }
}


/**
 * Builds up the page according to the data stored in the url get param or in the local storage
 * @returns {undefined}
 */
let assemblePage = () => {
    assert(gdata.tasks == null, 'data.tasks should be null here, something is wrong.');
    loadData();
    rebuildMenuDiv();
    rebuildTasksDiv();
}


/**
 * The main function. Assemble the page and return.
 * @returns {Promise<undefined>}
 */
let main = async () => {
    log('MAIN BEGIN');
    assemblePage();
    log('MAIN END');
}

main();
