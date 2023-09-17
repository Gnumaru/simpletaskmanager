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
* @property {boolean} [collapsed] if the task children are visible or not
* @property {string} [name] the task name
* @property {string} [description] the task description
* @property {HTMLDivElement} [_taskRootDiv_] the root div of the task
* @property {HTMLDivElement} [_taskChildrenDiv_] the div holding all root divs for the children tasks
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
* @property {boolean} collapsed if the task children are visible or not
* @property {string} name the task name
* @property {string} description the task description
* @property {HTMLDivElement} _taskRootDiv_ the root div of the task
* @property {HTMLDivElement} _taskChildrenDiv_ the div holding all root divs for the children tasks
*/

/**
* @typedef {Object} GTMTaskNote
* @property {number} id int: pk
* @property {string} text the note text
*/

/**
* @typedef {Object} GTMTaskStatus
* @property {number} id int: pk
* @property {string} name the task status name
* @property {string} description description of the status type
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
* @property {string} unique_name the config key
* @property {(boolean|number|string)} value the config value
*/

/**
* @typedef {Object} GTMDatabase
* @property {(null|Array<GTMTask>)} tasks tasks table
* @property {(null|Array<GTMTaskNote>)} task_notes task notes table
* @property {(null|Array<GTMTaskStatus>)} statuses statuses table
* @property {(null|Array<GTMTaskType>)} types types table
* @property {(null|Array<GTMTaskPriority>)} priorities priorities table
* @property {(null|Array<GTMTaskRole>)} roles roles table
* @property {(null|Array<GTMTaskAssignee>)} assignees assignees table
* @property {(null|Array<GTMTaskTag>)} tags tags table
* @property {(null|Array<GTMTaskTagRel>)} tag_task_rel association table between tags and tasks
* @property {(null|Array<GTMConfig>)} config app config table
*/

let gsavecount = 0;

/** @type{Window|globalThis} */
const gglobalThis = globalThis ?? window;
/** @type{History} */
let ghistory = globalThis.history;
/** @type{Document} */
let gdocument = gglobalThis.document;
/** @type{HTMLElement} */
let gbody = gdocument.body;
/** @type{StyleSheetList} */
let gstyleSheets = gdocument.styleSheets;
/** @type{Storage} */
let glocalStorage = gglobalThis.localStorage;

let gdownload_anchor = null;
let gupload_input = null;
let grootDiv = null;
let gupperMenuDiv = null;
let gtaskTreeViewDiv = null;
let gdraftTxtAreaDiv = null;
/** @type{(undefined|null|Object)}*/
// let gConfig = null;
/** @type{GTMDatabase} */
let gDatabase = {
    // hold the task data itself
    tasks: [],
    // hold comments on tasks
    task_notes: [],
    // hold the statuses names
    statuses: [],
    // hold the possible task types, like bug fixing or new feature implementation
    types: [],
    // hold the possible task priorities, like low, medium, high or blocking
    priorities: [],
    // hold the roles names
    roles: [],
    // hold the assignees names
    assignees: [],
    // hold the tags names
    tags: [],
    // relation table between task and tags, so that we can assign any number of tags to a task
    tag_task_rel: [],
    // miscelaneous table, holding things like application configuration
    config: [], // was erroneously named as other
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
let gDefaultRowSeparator = '\n';
let gDefaultColumnSeparator = '\t';
let gDefaultQuoteChar = '"';
let gsequences = {};
// timeout used to save the input data to its task object. instead of saving every keypress, we only save after one second passed since the last keyup event
let gdefaultSleepMsecs = 500;
let gsave_timeout = null;

// search indexes
// maps a task int id to all its children task objects
let gtaskIdToChildren = null;
// // maps a given int id to its task object
// let gtaskIdToTask = null;
// // maps a given int id to its status object
// let gStatusIdToStatusObj = {};

gDatabase.task_notes = [
    {
        id: 1,
        text: 'dummy note',
    }
]

gDatabase.statuses = [
    {
        id: 1,
        name: 'To do',
        description: 'Default status, waiting in the line to be worked uppon, without promise of being the next',
    }, {
        id: 2,
        name: 'Next',
        description: 'The task (or its children) are intended to be the next task(s) to work on',
    }, {
        id: 101,
        name: 'Doing',
        description: 'The task (or its children) is being worked uppon right now',
    }, {
        id: 201,
        name: 'Done',
        description: 'The task was completed as intended',
    }, {
        id: 202,
        name: 'Canceled',
        description: 'The task was intended to be done but for some reason was abandoned. Tasks registered by mistake are usually deleted (removed from the db), not canceled',
    }, {
        id: 203,
        name: 'Done After',
        description: 'The task was registered retroactively, after the thing was implemented',
    }
];

const isTodoStatusEquivalent = pId => {
    return pId >= 1 && pId <= 100;
}
const isDoingStatusEquivalent = pId => {
    return pId >= 101 && pId <= 200;
}
const isDoneStatusEquivalent = pId => {
    return pId >= 201; //  && pId <= 300;
}

// for (let istatus of gDatabase.statuses) { // build up the status id to status obj lookup table
//     gDatabase.statuses.indexByUniqueIntegerId[istatus.id] = istatus
// }

const isOfType = (pObj, pClassName) => {
    return (typeof pObj == 'object') && `[object ${pClassName}]` == ('' + pObj);
}

const getStatusNameById = (pid) => {
    if (gDatabase.statuses == null) {
        return '';
    }
    // @ts-ignore indexByUniqueIntegerId was added to the arrays
    const vindexByUniqueIntegerId = gDatabase.statuses.indexByUniqueIntegerId;
    if (pid in vindexByUniqueIntegerId) {
        return vindexByUniqueIntegerId[pid].name;
    }
    return '';
}

gDatabase.types = [
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

gDatabase.priorities = [
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

gDatabase.roles = [
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

gDatabase.assignees = [
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

gDatabase.tags = [
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

gDatabase.tag_task_rel = [
    {
        id: 1,
        task_id: 0,
        tag_id: 0,
    }
];

gDatabase.config = [
    {
        id: 1,
        unique_name: 'draft',
        value: '',
    },
    {
        id: 2,
        unique_name: 'hide_completed',
        value: true,
    }
]

const rebuildReverseIndexes = () => {
    for (const iTableName in gDatabase) { // refaz os indices reversos de id numerico
        const vTable = gDatabase[iTableName];
        const vColNames = Object.keys(vTable);
        const vHasUniqueNameColumn = vColNames.includes('unique_name')

        const vIndexByUniqueIntegerId = {};
        vTable.indexByUniqueIntegerId = vIndexByUniqueIntegerId; // vamos guardar no proprio array um indice reverso por id

        const vIndexByUniqueStringName = {};
        vTable.indexByUniqueStringName = vIndexByUniqueStringName; // vamos guardar no proprio array um indice reverso por id
        for (const iRow of vTable) {
            if ('id' in iRow) {
                vIndexByUniqueIntegerId[iRow.id] = iRow; // every table HAS to have an unique integer id column. we COULD just assume its existence here
            } else {
                log('id should be mandatory for all tables, but this object does not have it')
            }
            if ('unique_name' in iRow) {
                vIndexByUniqueStringName[iRow.unique_name] = iRow; // every table OPTIONALLY may have an unique string name column
            } else if (vHasUniqueNameColumn) {
                log('this table has a unique_name columne but this object does not have it')
            }
        }
    }
}
rebuildReverseIndexes();




const prompt = gglobalThis.prompt;


const confirm = gglobalThis.confirm;


const log = console.log;


const assert = console.assert;


const identity = i => i;


const new_date = i => new Date(i);


const new_date_ms = i => new Date(i).valueOf();


const logalert = msg => {
    log(msg);
    alert(msg);
}


// const fnhsluvfloat = (ph, ps, pl, pafl) => {
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

const fnokhslcssrgba = (ph, ps, pl, pafl) => {
    let vrgb = gglobalThis.culori.convertOklabToRgb(
        gglobalThis.culori.convertOkhslToOklab({ mode: 'okhsl', h: ph, s: ps, l: pl })
    );
    vrgb.a = pafl;
    return vrgb
}

const fhslcssrgba = (ph, ps, pl, pafl) => {
    let vrgb = gglobalThis.culori.convertHslToRgb({ mode: 'hsl', h: ph, s: ps, l: pl })
    vrgb.a = pafl;
    return vrgb
}


const translate = (pidentifier, planguage) => {
    // TODO: Implement
    return gtranslations[pidentifier][planguage] ?? pidentifier;
}


const setStyle = (pelement, pobj) => {
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
const newTask = (poverrides, pskipSequenceIncrement = false) => {
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
        // used to temporarily collapse the task subtree, to remove clutter from the view
        collapsed: false,



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


const taskCompareByOrder = (pleft_task, pright_task) => {
    if (pleft_task.order > pright_task.order) {
        return 1;
    } else if (pleft_task.order < pright_task.order) {
        return -1
    }
    return 1;
}


const getId = task_obj => {
    let vtask_id = task_obj;
    if (typeof vtask_id == 'object') {
        vtask_id = vtask_id.id;
    }
    return vtask_id;
}


const getTaskById = id_int => {
    return gDatabase.tasks.indexByUniqueIntegerId[id_int] ?? null;
}


const isRightAncestorOfLeft = (pchild_obj, pancestor_obj_id) => {
    if (!pchild_obj) {
        return false;
    }
    if (pchild_obj.parent_id == pancestor_obj_id) {
        return true;
    }
    return isRightAncestorOfLeft(getTaskById(pchild_obj.parent_id), pancestor_obj_id);
}


const rebuildParentTaskToChildTaskIndex = pTask => {
    let vId = pTask.id;
    // if (vId == 99) {
    //     vId = vId; // breakpoint
    // }
    let vParentId = pTask.parent_id;
    // gDatabase.tasks.indexByUniqueIntegerId[vId] = pTask;

    let vChildren = gtaskIdToChildren[vParentId] ?? [];
    vChildren.push(pTask);
    gtaskIdToChildren[vParentId] = vChildren;
}


const rebuildIndexes = () => {
    // if (gDatabase.tasks == null) {
    //     return;
    // }
    gtaskIdToChildren = {};
    // gDatabase.tasks.indexByUniqueIntegerId = {}
    rebuildReverseIndexes();
    // for (const ipropname in gDatabase) { // refaz os indices reversos de id numerico
    //     const vtable = gDatabase[ipropname];
    //     const vindexByUniqueIntegerId = {};
    //     vtable.indexByUniqueIntegerId = vindexByUniqueIntegerId; // vamos guardar no proprio array um indice reverso por id
    //     for (const irow of vtable) {
    //         vindexByUniqueIntegerId[irow.id] = irow;
    //     }
    // }
    if (gDatabase.tasks == null) {
        return;
    }
    for (let itask of gDatabase.tasks) {
        rebuildParentTaskToChildTaskIndex(itask);
    }
};


const replaceTasks = new_tasks => {
    gDatabase.tasks = new_tasks;
    rebuildIndexes();
}


const yearsFromNow = years => {
    let vnew_date = new Date();
    vnew_date.setFullYear(vnew_date.getFullYear() + years);
    return vnew_date;
}


const createAndAddChild = (pparent_element, ptag_name, pattributes, pcss_classes, pfuncs, pbefore_first_child = false) => {
    let vnew_el = gdocument.createElement(ptag_name);
    if (pbefore_first_child) {
        pparent_element.insertBefore(vnew_el, pparent_element.firstChild);
    } else {
        pparent_element.appendChild(vnew_el);
    }

    if (pattributes) {
        for (let ikey in pattributes) {
            if (!(ikey in vnew_el) && ikey != 'extra_data') {
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


const decompressFromBase64 = pbase64_string => {
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


const compressToBase64 = ptext => {
    // the line bellow uses standard javascript api
    // let base64_string = btoa(text);

    // the line bellow depends on 'lz-string.js'
    // let base64_string = LZString.compressToBase64(ptext); // this uses + and / wich is unsafe in url
    let base64_string = LZString.compressToEncodedURIComponent(ptext); // this uses + and - wich is url safe

    return base64_string;
}


const createFakeTasks = pflat => {
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


const loadFromUrl = () => {
    let vget_params = gglobalThis.location.search
    if (!vget_params) {
        log('tried to load from url get request parameter but no data was found')
        return false;
    }
    vget_params = vget_params.trim();
    // if (!vget_params.startsWith('&data')) {
    if (!vget_params.includes('&data=')) {
        return false;
    }
    let b64 = vget_params.substring(vget_params.indexOf('=', vget_params.indexOf('&data=')) + 1);
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


const loadConfig = () => {
    if (gDatabase.config == null) {
        return;
    }
    // gConfig = {};
    let hasDraft = hasConfig('draft')
    // for (let ival of gDatabase.config) {
    //     if (ival.name == 'draft') {
    //         hasDraft = true;
    //     }
    //     // gConfig[ival.name] = ival;
    // }
    if (!hasDraft) {
        return;
    }
    let vdraftArea = /** @type{HTMLTextAreaElement} */(gdocument.getElementById('draft_area_id'));
    if (vdraftArea == null) {
        return;
    }
    vdraftArea.value = getConfig('draft');
}

const hasConfig = (pUniqueName) => {
    return pUniqueName in gDatabase.config.indexByUniqueStringName;
}


const getConfigObj = (pUniqueName) => {
    const vIdx = gDatabase.config.indexByUniqueStringName;
    if (pUniqueName in vIdx) {
        return vIdx[pUniqueName];
    }
    return null;
}

const getConfig = (pUniqueName, pDefault = null, pForceCreate = false) => {
    const vIdx = gDatabase.config.indexByUniqueStringName;
    if (pUniqueName in vIdx) {
        return vIdx[pUniqueName].value;
    } else {
        if (pForceCreate) {
            const vNew = {
                id: 0,
                unique_name: pUniqueName,
                value: pDefault,
            }
            vIdx[pUniqueName] = vNew;
            gDatabase.config.push(vNew)
        }
        return pDefault;
    }
}

const setConfig = (pUniqueName, pValue = null) => {
    const vIdx = gDatabase.config.indexByUniqueStringName;
    if (pUniqueName in vIdx) {
        vIdx[pUniqueName].value = pValue;
    } else {
        const vNew = {
            id: 0,
            unique_name: pUniqueName,
            value: pValue,
        }
        vIdx[pUniqueName] = vNew;
        gDatabase.config.push(vNew)
    }
    return pValue;
}


const loadFromUrlAndRebuild = () => {
    loadFromUrl();
    rebuildTaskTreeViewDiv();
};


const loadFakeTasks = () => {
    replaceTasks(createFakeTasks(false));
    rebuildTaskTreeViewDiv()
};


const downloadString = (pfname, pdatastring) => {
    if (!gdownload_anchor) {
        gdownload_anchor = createAndAddChild(gbody, 'a');
        gdownload_anchor.style.display = 'none';
    }
    gdownload_anchor.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(pdatastring);
    gdownload_anchor.download = pfname;
    gdownload_anchor.click();
}


const downloadJson = () => {
    let vtasks_str = JSON.stringify(gDatabase.tasks);
    downloadString('db.json', vtasks_str);
}


const generateMultitableTsvText = (pQuoteChar = gDefaultQuoteChar, pColumnSeparator = gDefaultColumnSeparator) => {
    let vStr = '';
    log('________________________________________________________________________________');
    for (let iTableName in gDatabase) {
        // log('begin storing ' + itable_name)
        vStr = vStr + iTableName + gDefaultRowSeparator;
        let vRows = gDatabase[iTableName];
        if (vRows == null || vRows.length < 1) {
            continue
        }
        let vrows0 = vRows[0]
        if (vrows0 == null) {
            continue
        }
        for (let ikey in vrows0) { // this is just to collect the column names
            if (startsAndEndsWith(ikey, '_')) {
                continue; // non serialized property, usualy references to dom objects
            }
            vStr += ikey + pColumnSeparator;
        }
        vStr = vStr.substring(0, vStr.length - 1) + gDefaultRowSeparator;

        for (let irow of vRows) {
            for (let ikey in irow) {
                if (startsAndEndsWith(ikey, '_')) {
                    continue; // non serialized property, usualy references to dom objects
                }
                // its safer to stringify all the fields beforehand, so that strings become encapsulated in double quotes and the quotes itself get escaped, for example
                let vOldVal = irow[ikey];
                let vModifiedOldVal = vOldVal
                if (typeof vModifiedOldVal == 'string') {
                    vModifiedOldVal = vModifiedOldVal.trim();
                    if (vModifiedOldVal == 'true' || vModifiedOldVal == 'false') {
                        vModifiedOldVal = Boolean(vModifiedOldVal);
                    } else {
                        let vNum = parseFloat(vModifiedOldVal);
                        if ('' + vNum == vModifiedOldVal) {
                            vModifiedOldVal = vNum; // only for strings that seem numbers, if the string seems like a numeric string, convert it to number before json.stringify
                        }
                    }
                }
                let vNewVal = JSON.stringify(vModifiedOldVal);
                vStr += vNewVal + pColumnSeparator;
            }
            vStr = vStr.substring(0, vStr.length - 1) + gDefaultRowSeparator;
        }
        vStr = vStr.substring(0, vStr.length - 1) + gdefault_table_separator;
        log('finished storing ' + iTableName)
    }
    vStr = vStr.substring(0, vStr.length - gdefault_table_separator.length);

    return vStr;
}


const downloadTsv = (pquote_char = gDefaultQuoteChar, pcolumn_separator = gDefaultColumnSeparator) => {
    let vstr = generateMultitableTsvText(pquote_char, pcolumn_separator);
    downloadString('db.mt.tsv', vstr);
}


const parseTableRows = (pTableName, pRows, pColumnSeparator = gDefaultColumnSeparator, pQuoteChar = gDefaultQuoteChar) => {
    if (!pRows || pRows.length < 1) {
        return [];
    }
    let vHead = pRows.shift().split(pColumnSeparator);
    while (!vHead) {
        vHead = pRows.shift().split(pColumnSeparator);
    }
    let vResult = [];
    let vMax = 0;
    for (let iRowTxt of pRows) {
        let vTrimmedRow = iRowTxt.trim();
        if (!vTrimmedRow) {
            // skip any empty lines that may appear in the table text
            continue;
        }
        // let data = Object.assign({}, schema[table_name]);
        let vData = {};
        if (pTableName == 'tasks') {
            vData = newTask(null, false);
        }
        if (pTableName == 'config') {
            let a = 0; // breakpoint
        }
        let vRowArr = vTrimmedRow.split(pColumnSeparator);
        let vCount = 0;
        for (let iKey of vHead) {
            let vVal = vRowArr[vCount] ?? '';
            // if (iKey == 'id' && typeof vVal == 'string' && vVal.startsWith('\"')) { // deleteme
            if (typeof vVal == 'string' && vVal.startsWith('"\\')) { // deleteme
                // temporarily skip corrupt data
                continue; // deleteme
            } // deleteme
            let vNewVal = vVal;
            let a, b, c;
            try {
                if (startsAndEndsWith(vNewVal, '"')) {
                    // substitute backslash scaped double quotes by simple double quotes, because json.encode will turn '"' to '\"', and when the tsv is opened on a spreadsheet editor it will most likely be replaced by '\""'
                    let vl = vNewVal.length;
                    if (vl === 2) {
                        // if this is an empty string literarl (that is, just two double quotes, ""), just let json parse parse it directly
                    } else {
                        // log(val);
                        vNewVal = vNewVal.replace(/\\""/g, '\\"');
                        // log(val);
                        if (vl != vNewVal.length) {
                            // log('found');
                        }
                        // if this is a double quotes quoted string, remove escaped double quotes inside the string in case they where inserted by some spreadsheet app like libreoffice or ms office
                        // log(val);
                        vl = vNewVal.length;
                        vNewVal = vNewVal.replace(/""/g, '"');
                        // log(val);
                        if (vl != vNewVal.length) {
                            // log('found');
                        }
                    }
                }
                try {
                    vNewVal = JSON.parse(vNewVal);
                } catch (e) {
                    log(e);
                }
                // b = vNewVal; // BREAKPOINT

            } catch (e) {
                log(e);
                try {
                    log(`"${vNewVal}"`)
                    vNewVal = JSON.parse(`"${vNewVal}"`);
                    // c = vVal; // breakpoint

                } catch (e2) {
                    log('something very wrong happenned');
                    log(e2);
                }
            }
            vData[iKey] = vNewVal;
            vCount++;
        }
        if ('id' in vData && typeof vData.id == 'number' && vData.id > vMax) {
            vMax = vData.id;
        }
        if (Object.keys(vData).length < 1) {
            continue; // skip empty objects
        }
        vResult.push(vData);
    }
    gsequences[pTableName] = vMax;
    return vResult;
};


const parseTsvTableText = (pTableText, pRowSeparator = gDefaultRowSeparator, pColumnSeparator = gDefaultColumnSeparator, pQuoteChar = gDefaultQuoteChar) => {
    let vTrimmed = pTableText.trim();
    let vRows = vTrimmed.split(pRowSeparator);
    let vTableName = vRows.shift().trim();
    while (!vTableName) {
        vTableName = vRows.shift().trim();
    }
    if (vTableName == 'config') { // TODO DELETE
        let a = 0; // breakpoint TODO DELETE
    } // TODO DELETE
    let vValues = parseTableRows(vTableName, vRows, pColumnSeparator, pQuoteChar);
    if (!(vTableName in gDatabase)) {
        gDatabase[vTableName] = vValues; // substitui um obj por outro
    } else {
        const byId = {}
        for (const vOldObj of gDatabase[vTableName]) {
            byId[vOldObj.id] = vOldObj;
        }
        for (const vNewObj of vValues) {
            if (vNewObj.id in byId) { // if found, replace
                const vOldObj = byId[vNewObj.id];
                for (const iKey in vNewObj) {
                    vOldObj[iKey] = vNewObj[iKey];
                }
            } else { // if not found, push
                gDatabase[vTableName].push(vNewObj);
            }
        }
    }
}


const prepareTsvTextForProcessing = ptext => {
    ptext = ptext.trim();
    ptext = ptext.replace(/\r\n/g, '\n');
    ptext = ptext.replace(/\r/g, '\n');
    ptext = ptext.replace(/\t+/g, '\t');
    ptext = ptext.replace(/\t\n/g, '\n');
    return ptext;
}


const parseMultitableTsvText = (ptext, ptable_separator = gdefault_table_separator, prow_separator = gDefaultRowSeparator, pcolumn_separator = gDefaultColumnSeparator, pquote_char = gDefaultQuoteChar) => {
    let vtables_text_arr = prepareTsvTextForProcessing(ptext).split(ptable_separator);
    gsequences = {};
    for (let vtable_text of vtables_text_arr) {
        parseTsvTableText(vtable_text, prow_separator, pcolumn_separator, pquote_char);
    }
    let vdraftArea = /** @type{HTMLTextAreaElement} */(gdocument.getElementById('draft_area_id'));
    if (vdraftArea == null) {
        return;
    }
    vdraftArea.value = getConfig('draft');// gConfig.draft.value;
}


const uploadInputOnchange = () => {
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
                gDatabase = JSON.parse(vtxt_data); // allows uploading a json instead of a mttsv
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
                log(gDatabase.config[0]);
                rebuildIndexes();
                log(gDatabase.config[0]);
                log('sucess loading tsv');
                vsuccess = true;

            } catch (e) {
                log('error reading file as mt.tsv');
                log(e);
            }
        }

        if (vsuccess) {
            rebuildReverseIndexes();
            loadConfig();
            rebuildTaskTreeViewDiv();
            saveInAllPlaces();

        }
        // we need to reset the input so that when selecting the same file the onchage event will be triggered again
        gupload_input.value = ''
    };
    vreader.readAsText(vfile);
};


const uploadFile = () => {
    if (!gupload_input) {
        gupload_input = createAndAddChild(gbody, 'input', { type: 'file' });
        gupload_input.style.display = 'none';
        gupload_input.onchange = uploadInputOnchange;
    }
    gupload_input.click();
    // File chooser dialog can only be shown with a user activation, that's why whe HAVE to create an input type file and use the click() method
}

const getAllCookieNames = () => {
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

const deleteAllCookies = () => {
    for (let iname of getAllCookieNames()) {
        deleteCookie(iname);
    }
}

const deleteCookie = (pname) => {
    gdocument.cookie = pname + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

const getAllCookiesOrdered = () => {
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

const setCookie = (pname, pval) => {
    gdocument.cookie = pname + '=' + pval
};

const getCookie = (pname) => {
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


const saveToCookies = (vb64) => {
    // console.log(getAllCookieNames());
    if (vb64 == null) {
        let vtsv = generateMultitableTsvText(gDefaultQuoteChar, gDefaultColumnSeparator);
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


const saveToUrl = (vb64) => {
    if (vb64 == null) {
        let vtsv = generateMultitableTsvText(gDefaultQuoteChar, gDefaultColumnSeparator);
        vb64 = compressToBase64(vtsv);
    }
    // document.URL
    gsavecount++;
    ghistory.pushState("", "", `?a=${gsavecount}&data=${vb64}`);
    log('saved to url');
}




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


const saveToIndexeddb = pstep => {
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
                if (gDatabase.tasks == null) {
                    return;
                }
                for (let itask of gDatabase.tasks) {
                    vobjectStore.add(itask);
                }
                log('saved to indexeddb');
            }
    }
}


const loadFromCookies = () => { // cookie cannot store enough data. only 4093 bytes (4KB) per cookie (and 180 cookies per domain on chrome, so 736740 bytes, that is 719KB, not even 1MB
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


const saveToLocalStorage = (vb64) => { // local storage has a limit of 5MB on chrome
    if (vb64 == null) {
        let vtsv = generateMultitableTsvText(gDefaultQuoteChar, gDefaultColumnSeparator);
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


const loadFromLocalStorage = () => {
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


// const load_from_local_storage_and_rebuild_div = () => {
//     load_from_local_storage();
//     rebuild_data_div;
// }

const collapseUncolapseAll = () => {
    const vNewColapseStateBool = !gDatabase.tasks[0].collapsed
    for (const iTaskObj of gDatabase.tasks) {
        iTaskObj.collapsed = vNewColapseStateBool;
        updateChildrenVisibility(iTaskObj);
    }
}


const saveInAllPlaces = () => {
    let vtsv = generateMultitableTsvText(gDefaultQuoteChar, gDefaultColumnSeparator);
    let vb64 = compressToBase64(vtsv);
    log(`saving data with lenght of ${vb64.length} bytes`);
    saveToUrl(vb64);
    saveToLocalStorage(vb64);
    saveToCookies(vb64);
}

const startsAndEndsWith = (ptxt, psurround) => {
    return ptxt.startsWith(psurround) && ptxt.endsWith(psurround)
}


const addChildTask = (ptaskObj, pparentTaskId, pbefore) => {
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
    if (gDatabase.tasks != null) {
        if (pbefore) {
            gDatabase.tasks.unshift(vnewChildTask);

        } else {
            gDatabase.tasks.push(vnewChildTask);
        }
    }

    rebuildParentTaskToChildTaskIndex(vnewChildTask);
    return vnewChildTask;
};


const addChildTaskAndDiv = (pparent_div, pparent_task) => {
    let vnew_child_task = addChildTask({}, pparent_task.id);
    vnew_child_task.indent = pparent_task.indent + 1;
    createTaskContainer(vnew_child_task, pparent_div, true);
};


const reparentTask = (ptask_obj, pnew_parent_id) => {
    if (isRightAncestorOfLeft(getTaskById(pnew_parent_id), ptask_obj.id)) {
        logalert('ERROR: cannot reparent because current task is ancestor of new parent');
        return;
    }
    ptask_obj.parent_id = pnew_parent_id;
    rebuildIndexes();
    rebuildTaskTreeViewDiv();
};


const reparentTaskPrompt = task => {
    let vnewParentId = prompt('input the new parent id');
    let vnewParentIdInt = vnewParentId == null ? 0 : parseInt(vnewParentId);
    if (vnewParentIdInt < 1) {
        return;
    }
    reparentTask(task, vnewParentIdInt);
};


const makeSiblingOfParent = task => {
    let vparent_id = task.parent_id;
    let vparent_task = getTaskById(vparent_id);
    let vgrandparent_id = vparent_task.parent_id;
    task.parent_id = vgrandparent_id;
    rebuildIndexes();
    rebuildTaskTreeViewDiv();
};


const makeChildOfPrevious = (pcontainer, ptask) => {
    let vprevious_div = pcontainer.previousSibling;
    if (!vprevious_div) {
        log('there is no previous sibling we can become hild of');
        return
    }

    let vprevious_task_id = parseInt(vprevious_div.extra_data.task.id);
    let vprevious_task_obj = gDatabase.tasks.indexByUniqueIntegerId[vprevious_task_id];
    let vprevious_children_div = vprevious_div.querySelector('div.children');
    pcontainer.parentElement.removeChild(pcontainer);
    vprevious_children_div.appendChild(pcontainer)
    ptask.parent_id = vprevious_task_id;
    rebuildIndexes();
};


const toggleHidden = element => {
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
 * @param {GTMTask} pTaskObj
 */
const updateChildrenVisibility = (pTaskObj) => {
    pTaskObj._taskChildrenDiv_.style.display = pTaskObj.collapsed ? 'none' : 'block';
}


/**
 * @param {GTMTask} pTaskObj
 */
const toggleChildrenVisibility = (pTaskObj) => {
    pTaskObj.collapsed = !pTaskObj.collapsed;
    updateChildrenVisibility(pTaskObj);
}

// const hideShowChildren = function (pcontainerdiv) { // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
//     /** @type {HTMLButtonElement} */
//     let vthis = /** @type {?} */(this);
//     const vtypeofthis = typeof vthis;
//     if (vtypeofthis != 'object' && vtypeofthis != 'undefined') {
//         return;
//     }
//     let vfirstparent = vthis?.parentElement;
//     let vsecondparent = vfirstparent?.parentElement ?? null;
//     let vthirdparent = vsecondparent?.parentElement ?? null;
//     /** @type{(undefined|null|HTMLDivElement)} */
//     // 'this' is the button, first parent is the form_div, second parent is the container_div
//     let vcontainerDiv = (/** @type{(undefined|null|HTMLDivElement)} */ (pcontainerdiv ?? vthirdparent)); // inputbtn > btnsdiv > formdiv > treecontainerdiv
//     if (vcontainerDiv == null) {
//         return;
//     }
//     /** @type{(undefined|null|HTMLDivElement)} */
//     let vchildrenDiv = vcontainerDiv.querySelector('div.children');
//     let vdisplay = vchildrenDiv.style.display;
//     if (vdisplay == 'none') {
//         vchildrenDiv.style.display = 'block';
//         // vthis.value = 'hide child tasks';
//         if (vthis) {
//             vthis.value = 'collapse';
//         }
//     } else {
//         vchildrenDiv.style.display = 'none';
//         // vthis.value = 'show child tasks';
//         if (vthis) {
//             vthis.value = 'expand';
//         }
//     }
// }


const highlightTask = (pbutton, pelement) => {
    let vcl = pelement.classList;
    if (vcl.contains('highlight')) {
        pbutton.value = 'highlight task';
    } else {
        pbutton.value = 'disable highlight';
    }
    vcl.toggle('highlight');
}


const hideTaskUntilReload = (pdiv) => {
    toggleHidden(pdiv);
}


const goUpOnList = task_obj => {
    let vcontainer_div = gdocument.getElementById(gid_container_div_prefix + task_obj.id);
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
    log(gDatabase.tasks);
}


const goDownOnList = task_obj => {
    let vcontainer_div = gdocument.getElementById(gid_container_div_prefix + task_obj.id);
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
    log(gDatabase.tasks);
}


const countSiblings = element => {
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


const getPath = element => {
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


const recursiveSaveCheck = how_much_we_should_wait_ms => {
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


const saveAfterTimeout = sleep_msecs => {
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


const recursiveUpdateCheck = (ptaskObj, pfieldName, pinputElement, phowMuchWeShouldWaitMs, pgetterFunc, pcallbacks) => {
    // if (pinput_element == null) { // if null or undefined
    //     assert(ptask_obj.name == 'draft' && pfield_name == 'value');
    //     return
    // }
    let vid = ptaskObj.id;
    let vbefore = gupdate_timeouts[vid];
    let vnow = Date.now();
    let vhow_much_time_actually_passed_ms = vnow - vbefore;
    if (vhow_much_time_actually_passed_ms >= phowMuchWeShouldWaitMs) {
        let vold_value = ptaskObj[pfieldName];
        let vnew_value = ptaskObj[pfieldName] = pgetterFunc(pinputElement.value);
        if (pfieldName == 'value' && ptaskObj.id == 1 && vold_value === vnew_value) {
            return; // especificamente no caso
        }
        if ('last_update_date' in ptaskObj) {
            ptaskObj.last_update_date = Date.now();
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
        saveAfterTimeout(gdefaultSleepMsecs);
        return;
    }
    setTimeout(() =>
        recursiveUpdateCheck(ptaskObj, pfieldName, pinputElement, phowMuchWeShouldWaitMs - vhow_much_time_actually_passed_ms, pgetterFunc, pcallbacks), phowMuchWeShouldWaitMs);
}


const updateAfterTimeout = (ptaskObj, pfieldName, pinputElement, psleepMsecs = gdefaultSleepMsecs, pfunc = identity, pcallbacks = null) => {
    let vid = ptaskObj.id;
    let vcur_timeout = gupdate_timeouts[vid];
    let vnow = Date.now();
    if (!vcur_timeout) {
        // if there is no timeout running, set the time and call the function
        gupdate_timeouts[vid] = vnow;
        setTimeout(() =>
            recursiveUpdateCheck(ptaskObj, pfieldName, pinputElement, psleepMsecs, pfunc, pcallbacks), psleepMsecs,);
    } else {
        // if there is already a timeout running, just reset the time
        gupdate_timeouts[vid] = vnow;
    }
}


const deleteTask = (pdiv, ptask_to_delete) => {
    let vtasks = gDatabase.tasks;
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


const deleteTaskDialog = (pdiv, ptask) => {
    let vdo_delete = confirm(`are you sure you want to dele task ${ptask.id} (name:${ptask.name}; description:${ptask.description})?`);
    let vcancel_msg = 'no task was deleted';
    if (!vdo_delete) {
        log(vcancel_msg);
        return;
    }

    let vchildren = gtaskIdToChildren[ptask.id] ?? null;
    if (vchildren && vchildren.length > 0) {
        vdo_delete = confirm(`task ${ptask.id} has ${vchildren.length} children. this will also delete them all. are you sure?`);
        if (!vdo_delete) {
            logalert('no task was deleted');
            return
        }
    }

    deleteTask(pdiv, ptask);
}


const addSelectOptions = (pselect, poptions, pSelectedValue) => {
    createAndAddChild(pselect, 'option', {
        value: 0,
        innerText: '-',
    });
    let vidx = 0;

    for (let ioption of poptions) {
        createAndAddChild(pselect, 'option', {
            value: ioption.id,
            innerText: ioption.name,
        });
        if (pSelectedValue == ioption.id) {
            pselect.selectedIndex = vidx;
        }
        vidx++;
    }
    // if (pSelectedValue != 0) {
    //     let a = 0; // breakpoint
    // }
    pselect.value = pSelectedValue;
}


const createTaskContainer = (pTaskObj, ptaskTreeViewDivOrChildTasksDiv, pinsertBefore = false) => {
    /*
    container div
        current task div
            name div
            current form div
            buttons div
        children div
    */
    const vTaskId = pTaskObj.id;
    let vchild_tasks = gtaskIdToChildren[vTaskId] ?? []; // tasks.filter((i) => 'parent_id' in i && i.parent_id == task_obj.id);
    let visleaf = vchild_tasks.length < 1;
    // log('create card for task ' + id);
    let vcontainer_div_id = gid_container_div_prefix + vTaskId;
    let vform_id = gid_form_div_prefix + vTaskId;
    let vRootTaskDiv = createAndAddChild(ptaskTreeViewDivOrChildTasksDiv, 'div', {
        id: vcontainer_div_id,
        draggable: "true",
        extra_data: { task: pTaskObj },
    }, null, null, pinsertBefore);
    pTaskObj._taskRootDiv_ = vRootTaskDiv


    let vclassList = vRootTaskDiv.classList;
    vclassList.add('idented');
    vclassList.add('container');
    vclassList.add('parentAndChildrenContainer');

    let vcurrent_task_div = createAndAddChild(vRootTaskDiv, 'div');
    vclassList = vcurrent_task_div.classList;
    vclassList.add('form');
    vclassList.add('card');
    vclassList.add('pad10px');
    // let vbackcolrgba = fnokhslcssrgba(ptask_obj.indent * 29, 100, 80, 0.999);
    // vcurrent_task_div.style.backgroundColor = `rgba(${vbackcolrgba.r}, ${vbackcolrgba.g}, ${vbackcolrgba.b}, ${vbackcolrgba.a})`;
    let vbackcolhsla = { h: pTaskObj.indent * 29, s: 100, l: 50, a: 0.5 }
    if (!visleaf) {
        vbackcolhsla.s *= 0.5;
    }
    let vIsCompleted = isDoneStatusEquivalent(pTaskObj.status_id);
    if (vIsCompleted) {
        vbackcolhsla.l = 80;
        vbackcolhsla.s = 0.0;
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
            case 'reparent': reparentTaskPrompt(pTaskObj); break; // DO NOT RETURN
            case 'collapse/expand': {
                toggleChildrenVisibility(pTaskObj);
                // saveInAllPlaces();
                break;
            } // DO NOT RETURN
            case 'description': alert(pTaskObj.description); break; // DO NOT RETURN
        }
        this.value = '';
        this.blur(); // worst api method name EVER. why not unfocus?
    }
    let vop0 = createAndAddChild(vselect, 'option', { textContent: '-' });
    let vopreparent = createAndAddChild(vselect, 'option', { textContent: 'reparent' });
    let vopcolapse = createAndAddChild(vselect, 'option', { textContent: 'collapse/expand' });
    let vopdescription = createAndAddChild(vselect, 'option', { textContent: 'description' });

    let vNameDiv = createAndAddChild(vname_and_menu_div, 'div');
    vNameDiv.style.display = 'inline-block';
    let vButtonsDiv = createAndAddChild(vcurrent_task_div, 'div'); // buttons before form
    let vCurrentForm = createAndAddChild(vcurrent_task_div, 'div', { id: vform_id });
    vNameDiv.onclick = () =>
        toggleHidden([vCurrentForm, vButtonsDiv]);
    // vname_div.oncontextmenu = function (pe) {
    //     pe.preventDefault();
    //     // TODO: create context menu
    //     // https://www.geeksforgeeks.org/how-to-add-a-custom-right-click-menu-to-a-webpage/
    // }
    toggleHidden([vCurrentForm, vButtonsDiv]);




    let vcssclasses = [];
    if (vIsCompleted) {
        vcssclasses.push('gray'); // completed tasks are always gray regardless of being leafs or not
    } else if (visleaf) {
        vcssclasses.push('bold'); // only leaf tasks are bold for easy diferentiation between groups and actual tasks
    } else {
        vcssclasses.push('gray'); // if task is not a tree leaf, then it should be grayed out to reduce attention
    }




    let vidSpan = createAndAddChild(vNameDiv, 'span', { textContent: `${pTaskObj.indent}-#${vTaskId}: ` }, vcssclasses);
    let vnameSpan = createAndAddChild(vNameDiv, 'span', {
        id: gid_name_div_prefix + vTaskId,
        textContent: pTaskObj.name,
    }, vcssclasses);
    let vStatusSpan = createAndAddChild(vNameDiv, 'span', {
        textContent: ' - ' + getStatusNameById(pTaskObj.status_id)
    }, vcssclasses);


    let vlabel_name = createAndAddChild(vCurrentForm, 'label', { textContent: 'Name:' });
    let vinput_name = createAndAddChild(vCurrentForm, 'textarea', {
        value: pTaskObj.name,
        rows: 1, cols: 40,
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onkeyup: function (pEvt) {
            if (isOfType(pEvt, 'KeyboardEvent') && pEvt.code == 'Escape') {
                toggleHidden([vCurrentForm, vButtonsDiv]);
            }
            updateAfterTimeout(pTaskObj, 'name', this, gdefaultSleepMsecs, identity, () => {
                gdocument.getElementById(gid_name_div_prefix + vTaskId).innerText = pTaskObj.name;
            })
        },
    });
    let vbr0 = createAndAddChild(vCurrentForm, 'br');

    let vLabelDescription = createAndAddChild(vCurrentForm, 'label', { textContent: 'Description:' });
    let vInputDescription = createAndAddChild(vCurrentForm, 'textarea', {
        value: pTaskObj.description,
        rows: 4,
        cols: 80,
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onkeyup: pEvt => {
            if (isOfType(pEvt, 'KeyboardEvent') && pEvt.code == 'Escape') {
                toggleHidden([vCurrentForm, vButtonsDiv]);
            } else {
                updateAfterTimeout(pTaskObj, 'description', vInputDescription, gdefaultSleepMsecs)
            }
        },
    });
    let vbr1 = createAndAddChild(vCurrentForm, 'br');

    let vlabel_start_date = createAndAddChild(vCurrentForm, 'label', { textContent: 'Start Date:' });
    let vinput_start_date = createAndAddChild(vCurrentForm, 'input', {
        type: 'date',
        value: (new Date(pTaskObj.start_date)).toISOString().substring(0, 10),
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () {
            updateAfterTimeout(pTaskObj, 'start_date', this, gdefaultSleepMsecs, new_date_ms)
        },
    });
    let vbr2 = createAndAddChild(vCurrentForm, 'br');

    let vlabel_due_date = createAndAddChild(vCurrentForm, 'label', { textContent: 'Due Date:' });
    let vinput_due_date = createAndAddChild(vCurrentForm, 'input', {
        type: 'date',
        value: (new Date(pTaskObj.due_date)).toISOString().substring(0, 10),
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () {
            updateAfterTimeout(pTaskObj, 'due_date', this, gdefaultSleepMsecs, new_date_ms)
        },
    });
    let vbr3 = createAndAddChild(vCurrentForm, 'br');

    let vlabel_select_asignee = createAndAddChild(vCurrentForm, 'label', { textContent: 'Assignee:' });
    let vselect_asignee = createAndAddChild(vCurrentForm, 'select', {
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () {
            updateAfterTimeout(pTaskObj, 'assignee_id', this, gdefaultSleepMsecs, parseInt)
        },
    });
    addSelectOptions(vselect_asignee, gDatabase.assignees, pTaskObj.assignee_id);
    let vbr4 = createAndAddChild(vCurrentForm, 'br');

    let vlabel_select_role = createAndAddChild(vCurrentForm, 'label', { textContent: 'Role:' });
    let vselect_role = createAndAddChild(vCurrentForm, 'select', {
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () {
            updateAfterTimeout(pTaskObj, 'role_id', this, gdefaultSleepMsecs, parseInt)
        },
    });
    addSelectOptions(vselect_role, gDatabase.roles, pTaskObj.role_id);
    let vbr5 = createAndAddChild(vCurrentForm, 'br');

    const vlabel_select_status = createAndAddChild(vCurrentForm, 'label', { textContent: 'Status:' });
    const vselectStatus = createAndAddChild(vCurrentForm, 'select', {
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () {
            const vnewStatusId = parseInt(vselectStatus.value);
            if (isDoingStatusEquivalent(vnewStatusId)) { // status id between 101 and 200 is the group of 'doing' status. that is, when a task is doing, set a border
                vRootTaskDiv.style.borderColor = 'red';
            } else if (vnewStatusId == 2) { // next is yellow
                vRootTaskDiv.style.borderColor = 'orange';
            } else { // otherwise, no border
                vRootTaskDiv.style.borderColor = '#00000000'; // full transparency
            }
            vStatusSpan.textContent = ' - ' + getStatusNameById(vnewStatusId);
            updateAfterTimeout(pTaskObj, 'status_id', this, gdefaultSleepMsecs, parseInt)
        },
    });
    addSelectOptions(vselectStatus, gDatabase.statuses, pTaskObj.status_id);
    const curStatusId = parseInt(vselectStatus.value);
    if (vTaskId == 106) {
        let a = 0;
    }
    if (isDoingStatusEquivalent(curStatusId)) {
        vRootTaskDiv.style.borderColor = 'red';
    } else if (curStatusId == 2) { // next is yellow
        vRootTaskDiv.style.borderColor = 'orange';
    } else { // otherwise, with transparent border (we use transparent border instead of removing the border in order to not mess up the layout that happens when putting and removing the border)
        vRootTaskDiv.style.borderColor = '#00000000'; // full transparency
    }
    let vbr6 = createAndAddChild(vCurrentForm, 'br');

    let vlabel_select_type = createAndAddChild(vCurrentForm, 'label', { textContent: 'Type:' });
    let vselect_type = createAndAddChild(vCurrentForm, 'select', {
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () {
            updateAfterTimeout(pTaskObj, 'type_id', this, gdefaultSleepMsecs, parseInt)
        },
    });
    addSelectOptions(vselect_type, gDatabase.types, pTaskObj.type_id);
    let vbr7 = createAndAddChild(vCurrentForm, 'br');

    let vlabel_select_priority = createAndAddChild(vCurrentForm, 'label', { textContent: 'Priority:' });
    let vselect_priority = createAndAddChild(vCurrentForm, 'select', {
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () {
            updateAfterTimeout(pTaskObj, 'priority_id', this, gdefaultSleepMsecs, parseInt)
        },
    });
    addSelectOptions(vselect_priority, gDatabase.priorities, pTaskObj.priority_id);
    let vbr8 = createAndAddChild(vCurrentForm, 'br');

    let vLabelInputNumberTodoOrder = createAndAddChild(vCurrentForm, 'label', { textContent: 'TODO order:' });
    let vInputNumberTodoOrder = createAndAddChild(vCurrentForm, 'input', {
        type: 'number',
        value: pTaskObj.todo_order,
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onchange: function () {
            updateAfterTimeout(pTaskObj, 'todo_order', this, gdefaultSleepMsecs, parseInt)
        },
    });

    // TODO: hidden checkbox here


    // let focus_button = create_and_add_child(buttons_div, 'input', { type: 'button', value: 'focus task', onclick: () => focus_task(focus_button, container_div) }, ['margin5px']);
    let vhighlight_button = createAndAddChild(vButtonsDiv, 'input', {
        type: 'button', value: 'highlight task', onclick: () =>
            highlightTask(vhighlight_button, vRootTaskDiv)
    }, ['margin5px']);
    let vhidebtn = createAndAddChild(vButtonsDiv, 'input', {
        type: 'button', value: 'temporarily hide', onclick: () =>
            hideTaskUntilReload(vRootTaskDiv)
    }, ['margin5px']);
    let vhide_show_children_button = createAndAddChild(vButtonsDiv, 'input', {
        type: 'button', value: 'collapse', onclick: () => {
            toggleChildrenVisibility(pTaskObj);
            // saveInAllPlaces();
        }
    }, ['margin5px']);
    let vadd_child_task_button = createAndAddChild(vButtonsDiv, 'input', {
        type: 'button', value: 'add child task', onclick: () =>
            addChildTaskAndDiv(vChildrenDiv, pTaskObj)
    }, ['margin5px']);
    let vdelete_task_button = createAndAddChild(vButtonsDiv, 'input', {
        type: 'button', value: 'delete task', onclick: () =>
            deleteTaskDialog(vRootTaskDiv, pTaskObj)
    }, ['margin5px']);
    let vreparent_task_button = createAndAddChild(vButtonsDiv, 'input', {
        type: 'button', value: 'reparent task', onclick: () =>
            reparentTaskPrompt(pTaskObj)
    }, ['margin5px']);
    let vmake_sibling_of_parent_button = createAndAddChild(vButtonsDiv, 'input', {
        type: 'button',
        value: 'move left',
        onclick: () =>
            makeSiblingOfParent(pTaskObj),
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
    let vmake_child_of_previous_sibling_button = createAndAddChild(vButtonsDiv, 'input', {
        type: 'button', value: 'move right', onclick: () =>
            makeChildOfPrevious(vRootTaskDiv, pTaskObj)
    }, ['margin5px']);
    // unimplemented
    let vgo_up_on_list_button = createAndAddChild(vButtonsDiv, 'input', {
        type: 'button', value: 'move up', onclick: () =>
            goUpOnList(pTaskObj)
    }, ['margin5px', 'up']);
    let vgo_down_on_list_button = createAndAddChild(vButtonsDiv, 'input', {
        type: 'button', value: 'move down', onclick: () =>
            goDownOnList(pTaskObj)
    }, ['margin5px']);
    // delete (reparent children to grandparent)
    // delete (with children)


    let vChildrenDiv = createAndAddChild(vRootTaskDiv, 'div', { id: gid_children_div_prefix + vTaskId });
    vclassList = vChildrenDiv.classList;
    vclassList.add('children');
    pTaskObj._taskChildrenDiv_ = vChildrenDiv


    let vordered_child_tasks = vchild_tasks.slice().sort(taskCompareByOrder);
    let vorder = 0;
    let vhide_completed = getConfig('hide_completed');// gConfig.hide_completed.value;
    for (let ichild_task of vordered_child_tasks) {
        // fix order while assembling page
        ichild_task.order = ++vorder;
        ichild_task.indent = pTaskObj.indent + 1;
        if (vhide_completed && isDoneStatusEquivalent(ichild_task.status_id)) {
            continue; // skip completed root tasks IF told to do so
        }
        createTaskContainer(ichild_task, vChildrenDiv)
    }
    if (pTaskObj.id == 1) {
        let a = 0;
    }
    updateChildrenVisibility(pTaskObj);
};


const rebuildTaskTreeViewDiv = () => {
    gtaskTreeViewDiv.innerHTML = null;

    // pega todas as tasks filhas da '0'. como 0 nao eh um id valido, isso significa pegar todas as tasks raiz (so as raiz tem id invalido, igual a 0)
    let vrootTasks = gtaskIdToChildren[0]; // tasks.filter((i) => i.parent_id < 1);
    if (!vrootTasks) {
        return;
    }

    let vordered_root_tasks = vrootTasks.slice().sort(taskCompareByOrder);
    let vorder = 0;
    let vhide_completed = getConfig('hide_completed');// gConfig.hide_completed.value;
    for (let iroot_task of vordered_root_tasks) {
        iroot_task.order = ++vorder;
        iroot_task.indent = 0;
        if (vhide_completed && isDoneStatusEquivalent(iroot_task.status_id)) {
            continue; // skip completed root tasks
        }
        createTaskContainer(iroot_task, gtaskTreeViewDiv)
    }
}


const clearTasks = () => {
    gsequences.tasks = 0;
    gDatabase.tasks = [];
    rebuildIndexes();
    loadConfig();
    ghistory.pushState('', '', '');
}


const clear_tasks_confirm = () => {
    let vdo_delete = confirm(`are you sure you want to delete all tasks?`);
    if (!vdo_delete) {
        return;
    }
    clearTasks();
}


const clearTasksAndRebuildDataDiv = () => {
    clear_tasks_confirm();
    rebuildTaskTreeViewDiv();
}


const addRootTask = () => {
    addChildTask({}, 0, true);
    rebuildTaskTreeViewDiv();
};


const toggleCssOverflow = () => {
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


const preventTabFromGettingOut = function (pe) { // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
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


const showCompletedTasks = (pbutton) => {
    // gConfig.hide_completed.value = !gConfig.hide_completed.value; // invert hide completed value
    pbutton.extra_data.hidden = setConfig('hide_completed', !getConfig('hide_completed'));//gConfig.hide_completed.value;
    if (getConfig('hide_completed')) {
        pbutton.value = 'show completed';
    } else {
        pbutton.value = 'hide completed';
    }

    rebuildTaskTreeViewDiv();
}


const rebuildRootDiv = () => {
    if (!grootDiv) {
        grootDiv = createAndAddChild(gbody, 'div', { id: 'id_root_div' });
        grootDiv.classList.add('force_scroll')
    }

    if (!gupperMenuDiv) {
        gupperMenuDiv = createAndAddChild(grootDiv, 'div', { id: 'id_menu_div' });
    }

    if (!gtaskTreeViewDiv) {
        gtaskTreeViewDiv = createAndAddChild(grootDiv, 'div', { id: 'id_data_div' });
    }

    if (!gdraftTxtAreaDiv) {
        gdraftTxtAreaDiv = createAndAddChild(grootDiv, 'div', { id: 'id_draft_div' });
    }

    // let load_from_url_get_param_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from url', onclick: load_from_url_and_rebuild }, ['margin5px']);

    // let load_from_cookies_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from cookies', onclick: load_from_cookies }, ['margin5px']);

    // let load_from_local_storage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from local storage', onclick: load_from_local_storage_and_rebuild_div }, ['margin5px']);

    let vCollapseUncollapseAllBtn = createAndAddChild(gupperMenuDiv, 'input', { type: 'button', value: 'Collapse All', title: 'collapse or uncollapse all tasks', onclick: collapseUncolapseAll }, ['margin5px']);

    let vSaveBtn = createAndAddChild(gupperMenuDiv, 'input', { type: 'button', value: 'save', title: 'Data is saved automatically when changing properties in the task form fields or the draft area. you only need to manually save if you want to save the folding information (I decided it was not needed to save after every fold/unfold)', onclick: saveInAllPlaces }, ['margin5px']);

    let vRebuildTreeBtn = createAndAddChild(gupperMenuDiv, 'input', { type: 'button', value: 'rebuild view', title: 'throws away the entire task tree view and rebuild it from scratch. should be useless when the app is fully functional', onclick: rebuildTaskTreeViewDiv }, ['margin5px']);

    let vAddRootTaskBtn = createAndAddChild(gupperMenuDiv, 'input', { type: 'button', value: 'add root task', title: 'adds a task with no parent, it will become a sibling of the current existing root tasks', onclick: addRootTask }, ['margin5px']);

    let vUploadDataBtn = createAndAddChild(gupperMenuDiv, 'input', { type: 'button', value: 'upload db', title: 'replace all the app data for anoter uploaded file (tsv or json)', onclick: uploadFile }, ['margin5px']);

    // let load_fake_tasks_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'generate fake tasks', onclick: load_fake_tasks }, ['margin5px']);



    // load from indexeddb

    // create_and_add_child(menu_div, 'br');

    // let save_to_url_and_local_storage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save data in browser', onclick: save_to_url_and_local_storage }, ['margin5px']);

    // let save_to_url_get_param_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to url', onclick: save_to_url_get_param }, ['margin5px']);

    // let save_to_cachestorage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to cachestorage', onclick: () => save_to_cachestorage(0) });

    // let save_to_cookies_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to cookies', onclick: save_to_cookies }, ['margin5px']);

    // let save_to_local_storage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to local storage', onclick: save_to_local_storage }, ['margin5px']);

    // let save_to_indexeddb_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to indexeddb', onclick: () => save_to_indexeddb(0) }, ['margin5px']);

    // let download_json_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'download json', onclick: download_json }, ['margin5px']);

    let vDownloadTsvBtn = createAndAddChild(gupperMenuDiv, 'input', { type: 'button', value: 'download db', title: 'will download the entire app data as a multitable tsv file.', onclick: downloadTsv }, ['margin5px']);

    // create_and_add_child(menu_div, 'br');

    let vClearTasksBtn = createAndAddChild(gupperMenuDiv, 'input', { type: 'button', value: 'clear tasks', title: 'delete all tasks and start from scratch. will not delete any other data, only the tasks.', onclick: clearTasksAndRebuildDataDiv }, ['margin5px']);


    let vShowHideCompletedButton = createAndAddChild(gupperMenuDiv, 'input', {
        type: 'button', title: 'hide or show completed tasks (tasks with status equivalent of completed, like "done" or "canceled")', value: (getConfig('hide_completed') ? 'show completed' : 'hide completed'), onclick: () =>
            showCompletedTasks(vShowHideCompletedButton), extra_data: { hidden: false }
    }, ['margin5px']);
    vShowHideCompletedButton.extra_data.hidden = false;

    let vToggleOverflowBtn = createAndAddChild(gupperMenuDiv, 'input', { type: 'button', value: 'toggle css overflow', title: 'toggle the horizontal css overflow. this lets you resize the page horizontally without affecting the page layout', onclick: toggleCssOverflow }, ['margin5px']);





    // create_and_add_child(menu_div, 'br');

    // let switch_to_hierarchical_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'hierarchical view', onclick: switch_to_hierarchical_view }, ['margin5px']);

    // let switch_to_hierarchical_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'table view', onclick: switch_to_table_view }, ['margin5px']);

    // let switch_to_kanban_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'kanban view', onclick: switch_to_kanban_view }, ['margin5px']);

    // let switch_to_gantt_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'gantt view', onclick: switch_to_gantt_view }, ['margin5px']);

    // add root children

    let vUrl = 'https://gnumaru.github.io/simpletaskmanager/';
    let vPageLink = createAndAddChild(gupperMenuDiv, 'a', { href: vUrl, title: 'click here to access this app as a github page', innerText: 'App: ' + vUrl });
    // create_and_add_child(menu_div, 'br');

    createAndAddChild(gupperMenuDiv, 'span', { innerText: ' ' });

    vUrl = 'https://github.com/Gnumaru/simpletaskmanager';
    let vCodeLink = createAndAddChild(gupperMenuDiv, 'a', { href: vUrl, title: 'click here to view the source on github', innerText: 'Code: ' + vUrl });
    // create_and_add_child(menu_div, 'br');

    let vdraftObj = getConfigObj('draft');//gConfig.draft;
    let vinputDraft = createAndAddChild(gdraftTxtAreaDiv, 'textarea', {
        id: 'draft_area_id',
        value: vdraftObj.value,
        rows: 51, cols: 230,
        style: 'border: 1px solid black',
        // MUST BE function. CANNOT BE lambda. we need the "this" keyword here
        onkeyup: function () {
            updateAfterTimeout(getConfigObj('draft'), 'value', this, gdefaultSleepMsecs)
        },
        onkeydown: preventTabFromGettingOut,
    });
    for (const i of new Array(20)) {
        createAndAddChild(grootDiv, 'br');
    }
};


/**
 * tries to load the data from at least: url, cookies and local storage, in this order. save the data in the places it wasn found
 * @returns {undefined}
 */
const loadData = () => {
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
const assemblePage = () => {
    // assert(gDatabase.tasks == null, 'data.tasks should be null here, something is wrong.');
    assert(gDatabase.tasks != null && gDatabase.tasks.length < 1, 'data.tasks should be empty here, something is wrong.');
    loadData();
    rebuildRootDiv();
    rebuildTaskTreeViewDiv();
}


/**
 * The main function. Assemble the page and return.
 * @returns {Promise<undefined>}
 */
const main = async () => {
    log('MAIN BEGIN');
    assemblePage();
    log('MAIN END');
}

main();
