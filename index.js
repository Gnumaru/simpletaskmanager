/*
LICENSE: This software is licensed under the MIT license

This source file is purposefully not minified or obfuscated in any way. Instead of clonning the github repo, You should be able to save this page and edit it directly.
*/
(() => {
    let document = window.document;
    let body = document.body;
    let localStorage = window.localStorage;

    let websqldb = null;
    let download_anchor = null;
    let upload_input = null;
    let root_div = null;
    let menu_div = null;
    let data_div = null;
    let data = {
        tasks: null,
        notes: null,
    };
    let update_timeouts = {};

    let id_container_div_prefix = 'id_container_div_';
    let id_form_div_prefix = 'id_form_div_';
    let id_children_div_prefix = 'id_children_div_';
    let default_table_separator = '\r';
    let default_row_separator = '\n';
    let default_column_separator = '\t';
    let default_quote_char = '"';
    let max_id = 0;
    // timeout used to save the input data to its task object. instead of saving every keypress, we only save after one second passed since the last keyup event
    let default_sleep_msecs = 1000;

    // search indexes
    // maps a task int id to all its children task objects
    let task_id_to_children = null;
    // maps a given int id to its task object
    let task_id_to_task = null;

    let prompt = window.prompt;
    let log = console.log;





    let logalert = (msg) => {
        log(msg);
        alert(msg);
    }


    let new_task = (overrides) => {
        let new_task = {
            id: 0,
            parent_id: 0,

            // dates should be stored as int unix timestamps, like those returned by Date.now() or the (new Date()).valueOf()
            creation_date: Date.now(),
            // start_date:'',
            // end_date:'',

            // every key expecting non string values should be put before the 'name' key
            // every key expecting string values should be put after 'name' key
            name: '',
            description: '',

        }
        for (let key in overrides) {
            new_task[key] = overrides[key];
        }
        return new_task;
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
                new_el[key] = attributes[key];
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


    let create_fake_tasks = () => {
        let tasks = [];
        let i = 1;
        let max = 100; // this will create a total of 198 tasks
        for (; i < max; i++) {
            let i_minus_one = i - 1;
            tasks.push(new_task({
                id: i,
                parent_id: i_minus_one,
                name: `child of ${i_minus_one} name`,
                description: `child of ${i_minus_one} description`,
            }));
        }
        let j = max - 2;
        for (; j > 0; j--) {
            i++;
            let i_minus_one = i - 1;
            tasks.push(new_task({
                id: i,
                parent_id: j,
                name: `other child of ${j} name`,
                description: `other child of ${j} description`,
            }));
        }
        return tasks;
    };


    let load_from_url_get_param = () => {
        let get_params = window.location.search
        if (!get_params) {
            return;
        }
        get_params = get_params.substr(1)
        let b64 = get_params.substr(5);
        let tsv = decompressFromBase64(b64);
        replace_tasks(tsv_text_parse(tsv));
    };

    let load_from_url_and_rebuild = () => {
        load_from_url_get_param();
        rebuild_data_div();
    };


    let load_fake_tasks = () => {
        replace_tasks(create_fake_tasks());
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


    let generate_tasks_tsv_string = (quote_char = default_quote_char, column_separator = default_column_separator) => {
        let str = '';
        for (let key in data.tasks[0]) {
            str += key + column_separator;
        }
        str = str.substr(0, str.length - 1) + default_row_separator;

        for (let row of data.tasks) {
            for (let key in row) {
                // its safer to stringify all the fields beforehand
                let value = JSON.stringify(row[key]);
                str += value + column_separator;
            }
            str = str.substr(0, str.length - 1) + default_row_separator;
        }
        return str;
    }


    let download_tsv = (quote_char = default_quote_char, column_separator = default_column_separator) => {
        let str = generate_tasks_tsv_string(quote_char, column_separator);
        download_string('db.tsv', str);
    }


    let tsv_text_parse = (text, row_separator = default_row_separator, column_separator = default_column_separator, pdefault_quote_char = default_quote_char) => {
        let trimmed = text.trim();
        let rows = trimmed.split(row_separator);
        let head = rows.shift().split(column_separator);
        let result = [];
        for (let row_txt of rows) {
            let trimmed_row = row_txt.trim();
            if (!trimmed_row) {
                // skip empty lines in the file
                continue;
            }
            let data = {};
            let row_arr = trimmed_row.split(column_separator);
            let count = 0;
            for (let key of head) {
                let val = row_arr[count];
                val = JSON.parse(val)
                data[key] = val;
                count++;
            }
            result.push(data);
        }
        return result;
    };


    let upload_input_onchange = () => {
        let files = upload_input.files;
        if (!files) {
            return;
        }
        let file = files[0];
        if (!file) {
            return;
        }
        log(file);
        let reader = new FileReader();
        reader.onload = (evt) => {
            let txt_data = reader.result;
            let tmp = null;
            try {
                replace_tasks(JSON.parse(txt_data));
                log('sucess loading json');
                log(data.tasks);

            } catch (e) {
                replace_tasks(tsv_text_parse(txt_data));
                log('sucess loading tsv');
                log(data.tasks);
            }
            rebuild_data_div();
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
    }


    let save_to_cookies = () => {
        let expire_date = years_from_now(1000);
        let cookie = ['data=', JSON.stringify(data.tasks), '; domain=', window.location.host.toString().split(':')[0], '; path=/; expires="' + (expire_date.toGMTString()) + '"'].join('');
        document.cookie = cookie;
        log('saved to cookies');
    }


    let save_to_url_get_param = () => {
        let tsv = generate_tasks_tsv_string(default_quote_char, default_column_separator);
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
        localStorage.setItem("data", JSON.stringify(data.tasks));
        log('saved to local storage');
    };


    let load_from_local_storage = () => {
        replace_tasks(JSON.parse(localStorage.getItem("data")));
        rebuild_data_div()
    };


    let add_child_task = (parent_div, parent_task) => {
        let parent_id = parent_task.id;
        let new_child_task = new_task({
            id: ++max_id,
            parent_id: parent_id,
            name: `child of ${parent_id} name`,
            description: `child of ${parent_id} description`,
        });
        data.tasks.push(new_child_task);
        add_task_to_index(new_child_task);
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

    let focus_task = (button, element) => {
        let cl = element.classList;
        if (cl.contains('focus')) {
            button.value = 'focus task';
        } else {
            button.value = 'unfocus task';
        }
        cl.toggle('focus');
    }


    let go_up_on_list = (task_obj) => {
        let container_div = document.getElementById(id_container_div_prefix + task_obj.id);
        let previous_container = container_div.previousSibling;
        if (!previous_container) {
            return
        }
        let parent_child_div = container_div.parentElement; // parentNode
        parent_child_div.removeChild(container_div);
        parent_child_div.insertBefore(container_div, previous_container);
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


    let recursive_update_check = (task_obj, field_name, input_element, how_much_we_should_wait_ms) => {
        let id = task_obj.id;
        let before = update_timeouts[id];
        let now = Date.now();
        let how_much_time_actually_passed_ms = now - before;
        if (how_much_time_actually_passed_ms >= how_much_we_should_wait_ms) {
            let old_value = task_obj[field_name];
            let new_value = task_obj[field_name] = input_element.value;
            log(`task.'${field_name}' changed from '${old_value}' to '${new_value}'`)
            update_timeouts[id] = null;
            return;
        }
        setTimeout((diff) => recursive_update_check(task_obj, field_name, input_element, how_much_we_should_wait_ms - how_much_time_actually_passed_ms), how_much_we_should_wait_ms);
    }


    let update_after_timeout = (task_obj, field_name, input_element, sleep_msecs) => {
        log(get_path(input_element));
        let id = task_obj.id;
        let cur_timeout = update_timeouts[id];
        let now = Date.now();
        if (!cur_timeout) {
            // if there is no timeout running, set the time and call the function
            update_timeouts[id] = now;
            setTimeout(() => recursive_update_check(task_obj, field_name, input_element, sleep_msecs), sleep_msecs);
        } else {
            // if there is already a timeout running, just reset the time
            update_timeouts[id] = now;
        }
    }


    let make_sub_div = (task_obj, parent_div, insert_before = false) => {
        let id = task_obj.id;
        log('create card for task ' + id);
        if (id > max_id) {
            max_id = id;
        }
        let container_div_id = id_container_div_prefix + id;
        let form_id = id_form_div_prefix + id;
        let container_div = create_and_add_child(parent_div, 'div', {
            id: container_div_id,
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
        // let input_name = create_and_add_child(current_form, 'input', { type: 'text', value: task_obj.name });
        let input_name = create_and_add_child(current_form, 'textarea', {
            type: 'text',
            value: task_obj.name,
            rows: 1, cols: 40,
            onkeyup: function () { update_after_timeout(task_obj, 'name', this, default_sleep_msecs) },
        });

        let label_description = create_and_add_child(current_form, 'label', { textContent: 'Description:' });
        let input_description = create_and_add_child(current_form, 'textarea', {
            type: 'text',
            value: task_obj.description,
            rows: 1,
            cols: 40,
            onkeyup: function () { update_after_timeout(task_obj, 'description', this, default_sleep_msecs) },
        });

        let focus_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'focus task', onclick: () => focus_task(focus_button, container_div) }, ['margin5px']);
        let hide_show_children_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'hide child tasks', onclick: hide_show_children }, ['margin5px']);
        let add_child_task_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'add child task', onclick: () => add_child_task(children_div, task_obj) }, ['margin5px']);
        let reparent_task_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'reparent task', onclick: () => reparent_task_prompt(task_obj) }, ['margin5px']);
        let make_sibling_of_parent_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'make sibling of parent', onclick: () => make_sibling_of_parent(task_obj) }, ['margin5px']);
        // unimplemented
        let go_up_on_list_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'go up on list', onclick: () => go_up_on_list(task_obj) }, ['margin5px']);
        let go_down_on_list_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'go down on list', onclick: () => go_down_on_list(task_obj) }, ['margin5px']);
        // delete (reparent children to grandparent)
        // delete (with children)


        let children_div = create_and_add_child(container_div, 'div', { id: id_children_div_prefix + id });
        classList = children_div.classList;
        classList.add('children');

        let child_tasks = task_id_to_children[id] ?? []; // tasks.filter((i) => 'parent_id' in i && i.parent_id == task_obj.id);
        for (let child_task of child_tasks) {
            make_sub_div(child_task, children_div)
        }
    };


    let rebuild_data_div = () => {
        data_div.innerHTML = null;

        let root_tasks = task_id_to_children[0]; // tasks.filter((i) => i.parent_id < 1);

        for (let root_task of root_tasks) {
            make_sub_div(root_task, data_div)
        }
    }


    let clear_tasks = () => {
        replace_tasks(
            [new_task({
                id: 1,
                parent_id: 0,
                name: 'root task name',
                description: 'root task description',
            })]);
    }


    let clear_tasks_and_rebuild_data_div = () => {
        clear_tasks();
        rebuild_data_div();
    }


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

        let load_from_url_get_param_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from url', onclick: load_from_url_and_rebuild }, ['margin5px']);

        let load_from_cookies_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from cookies', onclick: load_from_cookies }, ['margin5px']);

        let load_from_local_storage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from local storage', onclick: load_from_local_storage }, ['margin5px']);

        let upload_data_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'upload .json/.tsv', onclick: upload_file }, ['margin5px']);

        let load_fake_tasks_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'generate fake tasks', onclick: load_fake_tasks }, ['margin5px']);

        let clear_tasks_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'clear tasks', onclick: clear_tasks_and_rebuild_data_div }, ['margin5px']);

        // load from indexeddb

        let buttons_separator = create_and_add_child(menu_div, 'br');

        let save_to_url_get_param_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to url', onclick: save_to_url_get_param }, ['margin5px']);

        // let save_to_websql_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to websql', onclick: save_to_websql });

        // let save_to_cachestorage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to cachestorage', onclick: () => save_to_cachestorage(0) });

        let save_to_cookies_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to cookies', onclick: save_to_cookies }, ['margin5px']);

        let save_to_local_storage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to local storage', onclick: save_to_local_storage }, ['margin5px']);

        let save_to_indexeddb_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to indexeddb', onclick: () => save_to_indexeddb(0) }, ['margin5px']);

        let download_json_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'download json', onclick: download_json }, ['margin5px']);

        let download_tsv_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'download tsv', onclick: download_tsv }, ['margin5px']);

        /**/create_and_add_child(root_div, 'span', { textContent: 'id_root_div' }, null, null, true);
    };


    let assemble_page = () => {
        load_from_url_get_param();
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
})();
