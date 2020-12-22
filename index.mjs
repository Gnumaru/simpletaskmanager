// LICENSE: This software is licensed under the terms and conditions specified in the LICENSE file.

    let document = window.document;
    let body = document.body;
    let styleSheets = document.styleSheets;
    let localStorage = window.localStorage;

    let websqldb = null;
    let download_anchor = null;
    let upload_input = null;
    let root_div = null;
    let menu_div = null;
    let data_div = null;
    let draft_div = null;
    let data = {
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
        other: null,
    };
    let schema = {
        tasks: [

        ],
    }
    let update_timeouts = {};
    let translations = {};

    let id_container_div_prefix = 'id_container_div_';
    let id_form_div_prefix = 'id_form_div_';
    let id_children_div_prefix = 'id_children_div_';
    let default_table_separator = '\n\n';
    let default_row_separator = '\n';
    let default_column_separator = '\t';
    let default_quote_char = '"';
    let sequences = {};
    // timeout used to save the input data to its task object. instead of saving every keypress, we only save after one second passed since the last keyup event
    let default_sleep_msecs = 500;
    let save_timeout = null;

    // search indexes
    // maps a task int id to all its children task objects
    let task_id_to_children = null;
    // maps a given int id to its task object
    let task_id_to_task = null;

    data.statuses = [
        {
            id: 1,
            name: 'To do',
        }, {
            id: 2,
            name: 'Next',
        }, {
            id: 3,
            name: 'Doing',
        }, {
            id: 4,
            name: 'Done',
        }
    ];

    data.types = [
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

    data.priorities = [
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

    data.roles = [
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

    data.assignees = [
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

    data.tags = [
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

    data.tag_task_rel = [
        {
            id: 1,
            task_id: 0,
            tag_id: 0,
        }
    ];

    data.other = [
        {
            id: 1,
            name: 'draft',
            value: '',
        }
    ]



    let prompt = window.prompt;


    let confirm = window.confirm;


    let log = console.log;


    let identity = (i) => i;


    let new_date = (i) => new Date(i);


    let new_date_ms = (i) => new Date(i).valueOf();


    let logalert = (msg) => {
        log(msg);
        alert(msg);
    }


    let translate = (identifier, language) => {
        return translations[identifier][language] ?? identifier;
    }


    let new_task = (overrides, skip_sequence_increment = false) => {
        let new_id = 0;
        if (!skip_sequence_increment) {
            new_id = ++sequences.tasks;
        }
        let now_ms = Date.now();
        let new_task_obj = {
            // indexes should come before anything else
            // autoincrementing primary key
            id: new_id,
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
            // rendering order in list like views, like table and hierarchical views
            order: 0,

            // dates should be stored as int unix timestamps, like those returned by Date.now() or the (new Date()).valueOf()
            creation_date: now_ms,
            last_update_date: 0,
            start_date: 0,
            due_date: 0,

            // Every key expecting non string values should be put before the 'name' key. Every key expecting string values should be put after 'name' key. Keys should be grouped by javascript type (number, bool, string). this is for organization purposes only
            name: '',
            description: '',
        }

        if (overrides) {
            for (let key in overrides) {
                new_task_obj[key] = overrides[key];
            }
        }

        return new_task_obj;
    }

    let new_register = {
        tasks: new_task,
    };

    let task_compare_by_order = (left_task, right_task) => {
        if (left_task.order > right_task.order) {
            return 1;
        } else if (left_task.order < right_task.order) {
            return -1
        }
        return 1;
    }


    let get_id = (task_obj) => {
        let task_id = task_obj;
        if (typeof task_id == 'object') {
            task_id = task_id.id;
        }
        return task_id;
    }


    let get_task_by_id = (id_int) => {
        return task_id_to_task[id_int] ?? null;
    }


    let is_right_ancestor_of_left = (child_obj, ancestor_obj_id) => {
        if (!child_obj) {
            return false;
        }
        if (child_obj.parent_id == ancestor_obj_id) {
            return true;
        }
        return is_right_ancestor_of_left(get_task_by_id(child_obj.parent_id), ancestor_obj_id);
    }


    let add_task_to_index = (task) => {
        let id = task.id;
        if (id == 99) {
            id = id;
        }
        let parent_id = task.parent_id;
        task_id_to_task[id] = task;

        let children = task_id_to_children[parent_id] ?? [];
        children.push(task);
        task_id_to_children[parent_id] = children;
    }


    let rebuild_indexes = () => {
        task_id_to_children = {};
        task_id_to_task = {}
        for (let task of data.tasks) {
            add_task_to_index(task);
        }
    };


    let replace_tasks = (new_tasks) => {
        data.tasks = new_tasks;
        rebuild_indexes();
    }


    let years_from_now = (years) => {
        let new_date = new Date();
        new_date.setFullYear(new_date.getFullYear() + years);
        return new_date;
    }


    let create_and_add_child = function (parent_element, tag_name, attributes, css_classes, funcs, before_first_child = false) {
        let new_el = document.createElement(tag_name);
        if (before_first_child) {
            parent_element.insertBefore(new_el, parent_element.firstChild);
        } else {
            parent_element.appendChild(new_el);
        }

        if (attributes) {
            for (let key in attributes) {
                try {
                    new_el[key] = attributes[key];
                } catch (e) {
                    log(tag_name + ' does not appear to have a settable property called ' + key);
                    log(e);
                }
            }
        }

        if (css_classes) {
            let cl = new_el.classList;
            for (let css_class of css_classes) {
                cl.add(css_class);
            }
        }

        if (funcs) {
            for (let func of funcs) {
                func(new_el);
            }
        }
        return new_el;
    };


    let decompressFromBase64 = (base64_string) => {
        // the line bellow uses standard javascript api
        // let text = atob(base64_string);

        // the line bellow depends on 'lz-string.js'
        let text = LZString.decompressFromBase64(base64_string);

        return text;
    };


    let compressToBase64 = (text) => {
        // the line bellow uses standard javascript api
        // let base64_string = btoa(text);

        // the line bellow depends on 'lz-string.js'
        let base64_string = LZString.compressToBase64(text);

        return base64_string;
    }


    let create_fake_tasks = (flat) => {
        let tasks = [];
        sequences.tasks = 0;
        let start_id = sequences.tasks;
        // I have tested up to 10000 (ten thousand) fake tasks. the compressed, base64 encoded string weighted about only 160KB. If we assume 100000 (one hundred thousand) fake tasks weigh 1600KB, then it will be safe to assume that saving to the url (wich has 2MB limit on current chrome) will always be possible to virtually any kind or project
        let tasks_to_generate = 100;
        let end_id = start_id + tasks_to_generate;
        if (flat) {
            for (start_id = 0; start_id < end_id; start_id++) {
                tasks.push(new_task({
                    parent_id: 0,
                    name: `My name is ${start_id}`,
                    description: `My name is ${start_id}, son of no one`,
                    description: `I am known as ${start_id + 1}, son of no one`,
                }));
            }

        } else {
            tasks_to_generate /= 2;
            end_id = tasks_to_generate;
            // make a 'pyramid'
            for (; start_id < end_id; start_id++) {
                // let start_id_minus_one = start_id - 1;
                tasks.push(new_task({
                    parent_id: start_id,
                    name: `My name is ${start_id + 1}`,
                    description: `I am known as ${start_id + 1}, son of ${start_id}, son of ${start_id - 1}`,
                }));
            }
            let j = tasks_to_generate;
            for (; j > 0; j--) {
                tasks.push(new_task({
                    parent_id: j,
                    name: `My name is ${start_id + 1}`,
                    description: `I am known as ${start_id + 1}, son of ${j}, son of ${j - 1}`,
                }));
                start_id++;
            }
        }

        return tasks;
    };


    let load_from_url_get_param = () => {
        let get_params = window.location.search
        if (!get_params) {
            log('tried to load from url get request parameter but no data was found')
            return;
        }
        get_params = get_params.substr(1)
        let b64 = get_params.substr(5);
        let tsv = decompressFromBase64(b64);
        parse_multitable_tsv_text(tsv);
        rebuild_indexes();
    };

    let load_from_url_and_rebuild = () => {
        load_from_url_get_param();
        rebuild_data_div();
    };


    let load_fake_tasks = () => {
        replace_tasks(create_fake_tasks(false));
        rebuild_data_div()
    };


    let download_string = (fname, datastring) => {
        if (!download_anchor) {
            download_anchor = create_and_add_child(body, 'a');
            download_anchor.style.display = 'none';
        }
        download_anchor.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(datastring);
        download_anchor.download = fname;
        download_anchor.click();
    }


    let download_json = () => {
        let tasks_str = JSON.stringify(data.tasks);
        download_string('db.json', tasks_str);
    }


    let generate_multitable_tsv_text = (quote_char = default_quote_char, column_separator = default_column_separator) => {
        let str = '';
        for (let table_name in data) {
            str = str + table_name + default_row_separator;
            let rows = data[table_name];
            for (let key in rows[0]) {
                str += key + column_separator;
            }
            str = str.substr(0, str.length - 1) + default_row_separator;

            for (let row of rows) {
                for (let key in row) {
                    // its safer to stringify all the fields beforehand
                    let value = JSON.stringify(row[key]);
                    str += value + column_separator;
                }
                str = str.substr(0, str.length - 1) + default_row_separator;
            }
            str = str.substr(0, str.length - 1) + default_table_separator;
        }
        str = str.substr(0, str.length - default_table_separator.length);

        return str;
    }


    let download_tsv = (quote_char = default_quote_char, column_separator = default_column_separator) => {
        let str = generate_multitable_tsv_text(quote_char, column_separator);
        download_string('db.tsv', str);
    }





    let parse_table_rows = (table_name, rows, column_separator = default_column_separator, quote_char = default_quote_char) => {
        if (!rows || rows.length < 1) {
            return [];
        }
        let head = rows.shift().split(column_separator);
        while (!head) {
            head = rows.shift().split(column_separator);
        }
        let result = [];
        let max = 0;
        for (let row_txt of rows) {
            let trimmed_row = row_txt.trim();
            if (!trimmed_row) {
                // skip any empty lines that may appear in the table text
                continue;
            }
            // let data = Object.assign({}, schema[table_name]);
            let data = {};
            if (table_name == 'tasks') {
                data = new_task(null, false);
            }
            let row_arr = trimmed_row.split(column_separator);
            let count = 0;
            for (let key of head) {
                let val = row_arr[count] ?? '';
                try {
                    val = JSON.parse(val);
                } catch (e) {
                    val = JSON.parse(`"${val}"`);
                }
                data[key] = val;
                count++;
            }
            if ('id' in data && data.id > max) {
                max = data.id;
            }
            result.push(data);
        }
        sequences[table_name] = max;
        return result;
    };


    let parse_tsv_table_text = (table_text, row_separator = default_row_separator, column_separator = default_column_separator, quote_char = default_quote_char) => {
        let trimmed = table_text.trim();
        let rows = trimmed.split(row_separator);
        let table_name = rows.shift().trim();
        while (!table_name) {
            table_name = rows.shift().trim();
        }
        let values = parse_table_rows(table_name, rows, column_separator, quote_char);
        data[table_name] = values;
    }


    let prepare_tsv_text_for_processing = (text) => {
        text = text.trim();
        text = text.replace(/\r\n/g, '\n');
        text = text.replace(/\r/g, '\n');
        text = text.replace(/\t+/g, '\t');
        text = text.replace(/\t\n/g, '\n');
        return text;
    }


    let parse_multitable_tsv_text = (text, table_separator = default_table_separator, row_separator = default_row_separator, column_separator = default_column_separator, quote_char = default_quote_char) => {
        let tables_text_arr = prepare_tsv_text_for_processing(text).split(table_separator);
        sequences = {};
        for (let table_text of tables_text_arr) {
            parse_tsv_table_text(table_text, row_separator, column_separator, quote_char);
        }
        let draft_area = document.getElementById('draft_area_id');
        if (draft_area) {
            draft_area.value = data.other[0].value;
        }
    }


    let upload_input_onchange = () => {
        log('loading file');
        let files = upload_input.files;
        if (!files) {
            return;
        }
        let file = files[0];
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.onload = (evt) => {
            let txt_data = reader.result;
            let tmp = null;
            try {
                data = JSON.parse(txt_data);
                log('sucess loading json');

            } catch (e) {
                parse_multitable_tsv_text(txt_data)
                rebuild_indexes()
                log('sucess loading tsv');
            }
            rebuild_data_div();
            // we need to reset the input so that when selecting the same file the onchage event will be triggered again
            upload_input.value = ''
        };
        reader.readAsBinaryString(file);
    };


    let upload_file = () => {
        if (!upload_input) {
            upload_input = create_and_add_child(body, 'input', { type: 'file' });
            upload_input.style.display = 'none';
            upload_input.onchange = upload_input_onchange;
        }
        upload_input.click();
        // File chooser dialog can only be shown with a user activation.
    }


    let save_to_cookies = () => {
        let expire_date = years_from_now(1000);
        let cookie = ['data=', JSON.stringify(data.tasks), '; domain=', window.location.host.toString().split(':')[0], '; path=/; expires="' + (expire_date.toGMTString()) + '"'].join('');
        document.cookie = cookie;
        log('saved to cookies');
    }


    let save_to_url_get_param = () => {
        let tsv = generate_multitable_tsv_text(default_quote_char, default_column_separator);
        let b64 = compressToBase64(tsv);
        document.URL
        window.history.pushState("", "", `?data=${b64}`);
        log('saved to url');
    }


    let save_to_websql = () => {
        if (!websqldb) {
            websqldb = openDatabase('data', '1.0', '', 5 * 1024 * 1024);
            websqldb.transaction((tx) => {
                tx.executeSql('CREATE TABLE tasks (id unique, name, description);');
            });
        } else {
            websqldb.transaction((tx) => {
                tx.executeSql('DROP TABLE tasks;');
                tx.executeSql('CREATE TABLE tasks (id unique, name, description);');
            });
        }

        let inserts = [];
        for (let task of data.tasks) {
            inserts.push(`INSERT INTO tasks (id, name, description) VALUES (${JSON.stringify(task.id)}, ${JSON.stringify(task.name)}, ${JSON.stringify(task.description)});`)
        }
        websqldb.transaction((tx) => {
            for (let insert of inserts) {
                log(insert);
                tx.executeSql(insert);
            }
        });
    }


    let save_to_cachestorage = (step) => {
        log('a');
        switch (step) {
            case 0:
                log('b');
                caches.open('data')
                    .then((cache) => {
                        log('c');
                        cache.delete('tasks')
                        save_to_cachestorage(1);
                    }).catch((err) => {
                        log('error');
                    });
                return;

            case 1:
                log('d');
                caches.open('data')
                    .then((cache) => {
                        log('e');
                        cache
                            .add("tasks", data.tasks)
                            .then(() => log("tasks saved"))
                            .catch((err) => log(err));
                    }).catch((err) => {
                        log('error');
                    })
        }
    };


    let save_to_indexeddb = (step) => {
        log('save_to_indexeddb step ' + step);
        switch (step) {
            case 0:
                // delete the entire previous database
                let req = indexedDB.deleteDatabase("data");
                req.onsuccess = function () {
                    console.log("Deleted database successfully");
                    // call the next step
                    save_to_indexeddb(1);
                };
                req.onerror = function () {
                    console.log("Couldn't delete database");
                    // call the next step
                    save_to_indexeddb(1);
                };
                req.onblocked = function () {
                    console.log("Couldn't delete database due to the operation being blocked");
                    // call the next step
                    save_to_indexeddb(1);
                    // setTimeout(() => save_to_indexeddb(0), 100);
                };
                return;

            case 1:
                let request = indexedDB.open("data");
                request.onupgradeneeded = (event) => {
                    let db = event.target.result;
                    let objectStore = db.createObjectStore("tasks", { keyPath: "id" });
                    for (let task of data.tasks) {
                        objectStore.add(task);
                    }
                    log('saved to indexeddb');
                }
        }
    }


    let load_from_cookies = () => {
        let result = document.cookie.match(new RegExp(name + '=([^;]+)'));
        if (result) {
            result = JSON.parse(result[1]);
        }
        replace_tasks(result);
        rebuild_data_div();
    }


    let save_to_local_storage = () => {
        let tsv = generate_multitable_tsv_text(default_quote_char, default_column_separator);
        let b64 = compressToBase64(tsv);
        localStorage.setItem("data", b64);
        log('saved to local storage');
    };


    let load_from_local_storage = () => {
        let compressed = localStorage.getItem("data");
        if (!compressed) {
            log('tried to load from local storage but no data was found')
            return;
        }
        let tsv = decompressFromBase64(compressed);
        parse_multitable_tsv_text(tsv);
        rebuild_indexes();
    };

    let load_from_local_storage_and_rebuild_div = () => {
        load_from_local_storage();
        rebuild_data_div;
    }


    let save_to_url_and_local_storage = () => {
        save_to_url_get_param();
        save_to_local_storage();
    }


    let add_child_task = (task_obj, parent_task_id, before) => {
        let new_child_task = new_task({
            parent_id: parent_task_id,
            // name: `child of ${parent_task_id} name`,
            // description: `child of ${parent_task_id} description`,
        });
        for (let key in task_obj) {
            new_child_task[key] = task_obj[key];
        }
        if (before) {
            data.tasks.unshift(new_child_task);

        } else {
            data.tasks.push(new_child_task);
        }

        add_task_to_index(new_child_task);
        return new_child_task;
    };


    let add_child_task_and_div = (parent_div, parent_task) => {
        let new_child_task = add_child_task({}, parent_task.id);
        make_sub_div(new_child_task, parent_div, true);
    };


    let reparent_task = (task_obj, new_parent_id) => {
        if (is_right_ancestor_of_left(get_task_by_id(new_parent_id), task_obj.id)) {
            logalert('ERROR: cannot reparent because current task is ancestor of new parent');
            return;
        }
        task_obj.parent_id = new_parent_id;
        rebuild_indexes();
        rebuild_data_div();
    };


    let reparent_task_prompt = (task) => {
        let new_parent_id = prompt('input the new parent id');
        try {
            new_parent_id = parseInt(new_parent_id.trim());
        } catch (e) {
            log('error parsing result as integer')
            return;
        }
        reparent_task(task, new_parent_id);
    };


    let make_sibling_of_parent = (task) => {
        let parent_id = task.parent_id;
        let parent_task = get_task_by_id(parent_id);
        let grandparent_id = parent_task.parent_id;
        task.parent_id = grandparent_id;
        rebuild_indexes();
        rebuild_data_div();
    };


    let make_child_of_previous = (container, task) => {
        let previous_div = container.previousSibling;
        if (!previous_div) {
            log('there is no previous sibling we can become hild of');
            return
        }

        let previous_task_id = parseInt(previous_div.extra_data.task.id);
        let previous_task_obj = task_id_to_task[previous_task_id];
        let previous_children_div = previous_div.querySelector('div.children');
        container.parentElement.removeChild(container);
        previous_children_div.appendChild(container)
        task.parent_id = previous_task_id;
        rebuild_indexes();
    };


    let hide_show_children = function () {
        // 'this' is the button, first parent is the form_div, second parent is the container_div
        let container_div = this.parentElement.parentElement;
        let children_div = container_div.querySelector('div.children');
        let display = children_div.style.display;
        if (display == 'none') {
            children_div.style.display = 'block';
            this.value = 'hide child tasks';
        } else {
            children_div.style.display = 'none';
            this.value = 'show child tasks';
        }
    }

    let highlight_task = (button, element) => {
        let cl = element.classList;
        if (cl.contains('highlight')) {
            button.value = 'highlight task';
        } else {
            button.value = 'disable highlight';
        }
        cl.toggle('highlight');
    }


    let go_up_on_list = (task_obj) => {
        let container_div = document.getElementById(id_container_div_prefix + task_obj.id);
        let previous_container = container_div.previousSibling;
        if (!previous_container) {
            return
        }
        task_obj.order;
        let parent_child_div = container_div.parentElement; // parentNode
        parent_child_div.removeChild(container_div);
        parent_child_div.insertBefore(container_div, previous_container);

        let other_task = previous_container.extra_data.task;
        let old_order = task_obj.order;
        task_obj.order = other_task.order;
        other_task.order = old_order;
        log(data.tasks);
    }


    let go_down_on_list = (task_obj) => {
        let container_div = document.getElementById(id_container_div_prefix + task_obj.id);
        let next_container = container_div.nextSibling;
        if (!next_container) {
            return
        }
        let next_next_container = next_container.nextSibling;
        if (!next_container) {
            return
        }
        let parent_child_div = container_div.parentElement; // parentNode
        parent_child_div.removeChild(container_div);
        parent_child_div.insertBefore(container_div, next_next_container);

        let other_task = next_container.extra_data.task;
        let old_order = task_obj.order;
        task_obj.order = other_task.order;
        other_task.order = old_order;
        log(data.tasks);
    }


    let count_siblings = (element) => {
        let tag = element.tagName;
        let cnt = 0;
        let previous = element.previousSibling;
        while (previous) {
            if (previous.tagName == tag) {
                cnt++;
            }
            previous = previous.previousSibling;
        }
        return cnt;
    }


    let get_path = (element) => {
        let path = '';
        let parent = element;

        while (parent) {
            let tag = parent.tagName;
            let cnt = count_siblings(parent);
            path = `/${tag}[${cnt}]${path}`;
            parent = parent.parentElement;
        }
        return path;
    };


    let recursive_save_check = (how_much_we_should_wait_ms) => {
        let before = save_timeout;
        let now = Date.now();
        let how_much_time_actually_passed_ms = now - before;
        if (how_much_time_actually_passed_ms >= how_much_we_should_wait_ms) {
            save_to_url_and_local_storage();
            save_timeout = null;
            return;
        }
        let diff = how_much_we_should_wait_ms - how_much_time_actually_passed_ms;
        setTimeout(() => recursive_update_check(diff), diff);
    };


    let save_after_timeout = (sleep_msecs) => {
        let now = Date.now();
        if (!save_timeout) {
            // if there is no timeout running, set the time and call the function
            save_timeout = now;
            setTimeout(() => recursive_save_check(sleep_msecs), sleep_msecs);
        } else {
            // if there is already a timeout running, just reset the time
            save_timeout = now;
        }
    }


    let recursive_update_check = (task_obj, field_name, input_element, how_much_we_should_wait_ms, func) => {
        let id = task_obj.id;
        let before = update_timeouts[id];
        let now = Date.now();
        let how_much_time_actually_passed_ms = now - before;
        if (how_much_time_actually_passed_ms >= how_much_we_should_wait_ms) {
            let old_value = task_obj[field_name];
            let new_value = task_obj[field_name] = func(input_element.value);
            if ('last_update_date' in task_obj) {
                task_obj.last_update_date = Date.now();
            }
            let old_value_subs = old_value;
            if (typeof old_value_subs == 'string' && old_value_subs.length > 10) {
                old_value_subs = String(old_value).substr(0, 10);
                if (String(old_value).length > old_value_subs.length) {
                    old_value_subs += ' ...';
                }
            }
            let new_value_subs = new_value;
            if (typeof new_value_subs == 'string' && new_value_subs.length > 10) {
                new_value_subs = String(new_value).substr(0, 10);
                if (String(new_value).length > new_value_subs.length) {
                    new_value_subs += ' ...';
                }
            }
            log(`task.${field_name} changed from '${old_value_subs}' to '${new_value_subs}'`)
            update_timeouts[id] = null;
            save_after_timeout(default_sleep_msecs);
            return;
        }
        setTimeout(() => recursive_update_check(task_obj, field_name, input_element, how_much_we_should_wait_ms - how_much_time_actually_passed_ms, func), how_much_we_should_wait_ms);
    }


    let update_after_timeout = (task_obj, field_name, input_element, sleep_msecs, func = identity) => {
        let id = task_obj.id;
        let cur_timeout = update_timeouts[id];
        let now = Date.now();
        if (!cur_timeout) {
            // if there is no timeout running, set the time and call the function
            update_timeouts[id] = now;
            setTimeout(() => recursive_update_check(task_obj, field_name, input_element, sleep_msecs, func), sleep_msecs);
        } else {
            // if there is already a timeout running, just reset the time
            update_timeouts[id] = now;
        }
    }

    let delete_task = (div, task_to_delete) => {
        let tasks = data.tasks;
        let index = tasks.indexOf(task_to_delete);
        // removes 1 element starting at index 'index'
        tasks.splice(index, 1)
        // for now lets just rebuild the indexes, its easier than otherwise

        let divpath = get_path(div);
        let parentpath = get_path(div.parentElement)
        log('will now remove ' + divpath + ' from ' + parentpath);
        div.parentElement.removeChild(div);
        rebuild_indexes();
        log('deleted task ' + task_to_delete.id)
    }


    let delete_task_dialog = (div, task) => {
        let do_delete = confirm(`are you sure you want to dele task ${task.id} (name:${task.name}; description:${task.description})?`);
        let cancel_msg = 'no task was deleted';
        if (!do_delete) {
            log(cancel_msg);
            return;
        }

        let children = task_id_to_children[task.id] ?? null;
        if (children && children.length > 0) {
            do_delete = confirm(`task ${task.id} has ${children.length} children. this will also delete them all. are you sure?`);
            if (!do_delete) {
                logalert('no task was deleted');
                return
            }
        }

        delete_task(div, task);

    }


    let add_select_options = (select, options, selected_index) => {
        create_and_add_child(select, 'option', {
            value: 0,
            innerText: '-',
        });
        for (let option of options) {
            create_and_add_child(select, 'option', {
                value: option.id,
                innerText: option.name,
            });
        }
        if (selected_index != 0) {
            let a = 0;
        }
        select.selectedIndex = selected_index;
    }


    let make_sub_div = (task_obj, parent_div, insert_before = false) => {
        let id = task_obj.id;
        log('create card for task ' + id);
        let container_div_id = id_container_div_prefix + id;
        let form_id = id_form_div_prefix + id;
        let container_div = create_and_add_child(parent_div, 'div', {
            id: container_div_id,
            draggable: "true",
            extra_data: { task: task_obj },
        }, null, null, insert_before);

        let classList = container_div.classList;
        classList.add('idented');
        classList.add('container');

        let form_div = create_and_add_child(container_div, 'div');
        classList = form_div.classList;
        classList.add('form');
        classList.add('card');
        classList.add('pad10px');



        /**/let id_span = create_and_add_child(form_div, 'label', { textContent: `Task ${id}` });
        let current_form = create_and_add_child(form_div, 'div', { id: form_id });

        let label_name = create_and_add_child(current_form, 'label', { textContent: 'Name:' });
        let input_name = create_and_add_child(current_form, 'textarea', {
            value: task_obj.name,
            rows: 1, cols: 40,
            onkeyup: function () { update_after_timeout(task_obj, 'name', this, default_sleep_msecs) },
        });

        let label_description = create_and_add_child(current_form, 'label', { textContent: 'Description:' });
        let input_description = create_and_add_child(current_form, 'textarea', {
            value: task_obj.description,
            rows: 2,
            cols: 40,
            onkeyup: function () { update_after_timeout(task_obj, 'description', this, default_sleep_msecs) },
        });

        let label_start_date = create_and_add_child(current_form, 'label', { textContent: 'Start Date:' });
        let input_start_date = create_and_add_child(current_form, 'input', {
            type: 'date',
            value: (new Date(task_obj.start_date)).toISOString().substr(0, 10),
            onchange: function () { update_after_timeout(task_obj, 'start_date', this, default_sleep_msecs, new_date_ms) },
        });

        let label_due_date = create_and_add_child(current_form, 'label', { textContent: 'Due Date:' });
        let input_due_date = create_and_add_child(current_form, 'input', {
            type: 'date',
            value: (new Date(task_obj.due_date)).toISOString().substr(0, 10),
            onchange: function () { update_after_timeout(task_obj, 'due_date', this, default_sleep_msecs, new_date_ms) },
        });

        let label_select_asignee = create_and_add_child(current_form, 'label', { textContent: 'Assignee:' });
        let select_asignee = create_and_add_child(current_form, 'select', {
            onchange: function () { update_after_timeout(task_obj, 'assignee_id', this, default_sleep_msecs, parseInt) },
        });
        add_select_options(select_asignee, data.assignees, task_obj.assignee_id);

        let label_select_role = create_and_add_child(current_form, 'label', { textContent: 'Role:' });
        let select_role = create_and_add_child(current_form, 'select', {
            onchange: function () { update_after_timeout(task_obj, 'role_id', this, default_sleep_msecs, parseInt) },
        });
        add_select_options(select_role, data.roles, task_obj.role_id);

        let label_select_status = create_and_add_child(current_form, 'label', { textContent: 'Status:' });
        let select_status = create_and_add_child(current_form, 'select', {
            onchange: function () { update_after_timeout(task_obj, 'status_id', this, default_sleep_msecs, parseInt) },
        });
        add_select_options(select_status, data.statuses, task_obj.status_id);

        let label_select_type = create_and_add_child(current_form, 'label', { textContent: 'Type:' });
        let select_type = create_and_add_child(current_form, 'select', {
            onchange: function () { update_after_timeout(task_obj, 'type_id', this, default_sleep_msecs, parseInt) },
        });
        add_select_options(select_type, data.types, task_obj.type_id);

        let label_select_priority = create_and_add_child(current_form, 'label', { textContent: 'Priority:' });
        let select_priority = create_and_add_child(current_form, 'select', {
            onchange: function () { update_after_timeout(task_obj, 'priority_id', this, default_sleep_msecs, parseInt) },
        });
        add_select_options(select_priority, data.priorities, task_obj.priority_id);

        // let focus_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'focus task', onclick: () => focus_task(focus_button, container_div) }, ['margin5px']);
        let highlight_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'highlight task', onclick: () => highlight_task(highlight_button, container_div) }, ['margin5px']);
        let hide_show_children_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'hide child tasks', onclick: hide_show_children }, ['margin5px']);
        let add_child_task_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'add child task', onclick: () => add_child_task_and_div(children_div, task_obj) }, ['margin5px']);
        let delete_task_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'delete task', onclick: () => delete_task_dialog(container_div, task_obj) }, ['margin5px']);
        let reparent_task_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'reparent task', onclick: () => reparent_task_prompt(task_obj) }, ['margin5px']);
        let make_sibling_of_parent_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'move left', onclick: () => make_sibling_of_parent(task_obj) }, ['margin5px']);
        let make_child_of_previous_sibling_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'move right', onclick: () => make_child_of_previous(container_div, task_obj) }, ['margin5px']);
        // unimplemented
        let go_up_on_list_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'move up', onclick: () => go_up_on_list(task_obj) }, ['margin5px', 'up']);
        let go_down_on_list_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'move down', onclick: () => go_down_on_list(task_obj) }, ['margin5px']);
        // delete (reparent children to grandparent)
        // delete (with children)


        let children_div = create_and_add_child(container_div, 'div', { id: id_children_div_prefix + id });
        classList = children_div.classList;
        classList.add('children');

        let child_tasks = task_id_to_children[id] ?? []; // tasks.filter((i) => 'parent_id' in i && i.parent_id == task_obj.id);
        let ordered_child_tasks = child_tasks.slice().sort(task_compare_by_order);
        let order = 0;
        for (let child_task of ordered_child_tasks) {
            // fix order while assembling page
            child_task.order = ++order;
            make_sub_div(child_task, children_div)
        }
    };


    let rebuild_data_div = () => {
        data_div.innerHTML = null;

        let root_tasks = task_id_to_children[0]; // tasks.filter((i) => i.parent_id < 1);
        if (!root_tasks) {
            return;
        }

        let ordered_root_tasks = root_tasks.slice().sort(task_compare_by_order);
        let order = 0;
        for (let root_task of ordered_root_tasks) {
            root_task.order = ++order;
            make_sub_div(root_task, data_div)
        }
    }


    let clear_tasks = () => {
        sequences.tasks = 0;
        data.tasks = [];
        rebuild_indexes();
        window.history.pushState('', '', '');
    }


    let clear_tasks_confirm = () => {
        let do_delete = confirm(`are you sure you want to delete all tasks?`);
        if (!do_delete) {
            return;
        }
        clear_tasks();
    }


    let clear_tasks_and_rebuild_data_div = () => {
        clear_tasks_confirm();
        rebuild_data_div();
    }


    let add_root_task = () => {
        add_child_task({}, 0, true);
        rebuild_data_div();
    };


    let toggle_overflow = () => {
        for (let sheet of styleSheets) {
            for (let rule of sheet.cssRules) {
                if (rule.selectorText == '.force_scroll') {
                    let old_overflow = rule.style.overflow;

                    if (old_overflow == 'scroll') {
                        rule.style.overflow = '';
                        rule.style.width = ''

                    } else {
                        rule.style.overflow = 'scroll';
                        // 7680 is the 8k resolution width
                        rule.style.width = '7680px'
                    }

                    return;
                }
            }
        }
    }


    let prevent_tab_from_getting_out = function (e) {
        if (e.key == 'Tab') {
            e.preventDefault();
            var start = this.selectionStart;
            var end = this.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);

            // put caret at right position again
            this.selectionStart = this.selectionEnd = start + 1;
        }
    };


    let rebuild_menu_div = () => {
        if (!root_div) {
            root_div = create_and_add_child(body, 'div', { id: 'id_root_div' });
            root_div.classList.add('force_scroll')
        }

        if (!menu_div) {
            menu_div = create_and_add_child(root_div, 'div', { id: 'id_menu_div' });
        }

        if (!data_div) {
            data_div = create_and_add_child(root_div, 'div', { id: 'id_data_div' });
        }

        if (!draft_div) {
            draft_div = create_and_add_child(root_div, 'div', { id: 'id_draft_div' });
        }

        // let load_from_url_get_param_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from url', onclick: load_from_url_and_rebuild }, ['margin5px']);

        // let load_from_cookies_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from cookies', onclick: load_from_cookies }, ['margin5px']);

        // let load_from_local_storage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from local storage', onclick: load_from_local_storage_and_rebuild_div }, ['margin5px']);

        let add_root_task_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'add root task', onclick: add_root_task }, ['margin5px']);

        let upload_data_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load data file', onclick: upload_file }, ['margin5px']);

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

        let download_tsv_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'download data file', onclick: download_tsv }, ['margin5px']);

        // create_and_add_child(menu_div, 'br');

        let clear_tasks_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'clear tasks', onclick: clear_tasks_and_rebuild_data_div }, ['margin5px']);

        let toggle_overflow_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'toggle css overflow', onclick: toggle_overflow }, ['margin5px']);

        // create_and_add_child(menu_div, 'br');

        // let switch_to_hierarchical_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'hierarchical view', onclick: switch_to_hierarchical_view }, ['margin5px']);

        // let switch_to_hierarchical_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'table view', onclick: switch_to_table_view }, ['margin5px']);

        // let switch_to_kanban_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'kanban view', onclick: switch_to_kanban_view }, ['margin5px']);

        // let switch_to_gantt_view_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'gantt view', onclick: switch_to_gantt_view }, ['margin5px']);

        // add root children

        let url = 'https://gnumaru.github.io/simpletaskmanager/';
        let site_link = create_and_add_child(menu_div, 'a', { href: url, innerText: 'App: ' + url });
        // create_and_add_child(menu_div, 'br');

        create_and_add_child(menu_div, 'span', { innerText: ' ' });

        url = 'https://github.com/Gnumaru/simpletaskmanager';
        let code_link = create_and_add_child(menu_div, 'a', { href: url, innerText: 'Code: ' + url });
        // create_and_add_child(menu_div, 'br');


        let draft_obj = data.other[0];
        let input_name = create_and_add_child(draft_div, 'textarea', {
            id: 'draft_area_id',
            value: draft_obj.value,
            rows: 51, cols: 230,
            style: 'border: 1px solid black',
            onkeyup: function () { update_after_timeout(data.other[0], 'value', this, default_sleep_msecs) },
            onkeydown: prevent_tab_from_getting_out,
        });
    };


    let assemble_page = () => {
        load_from_url_get_param();
        if (!data.tasks) {
            load_from_local_storage();
        }
        if (!data.tasks) {
            clear_tasks();
        }
        rebuild_menu_div();
        rebuild_data_div();
    }


    let main = () => {
        log('MAIN BEGIN');
        assemble_page();
        log('MAIN END');
    }


    main();
