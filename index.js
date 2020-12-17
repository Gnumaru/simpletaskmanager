// LICENSE: This software is licensed under the MIT license
/*
This source file is purposefully not minified or obfuscated in any way. Instead of clonning the github repo, You should be able to save this page and edit it directly.
*/
(() => {
    let document = window.document;
    let body = document.body;
    let localStorage = window.localStorage;

    let odd_row = true;
    let download_anchor = null;
    let upload_input = null;
    let root_div = null;
    let menu_div = null;
    let data_div = null;
    let tasks = null;
    let row_separator = '\n';
    let column_separator = ',';
    let quote_char = '"';
    let max_id = 0;

    // class Task {
    //     id = 0;
    //     parent_id = 0;
    //     name = '';
    //     description = '';

    //     constructor(data) {
    //         for (let key in data) {
    //             this[key] = data[key];
    //         }
    //     }
    // }


    let print = (i) => {
        console.log(i);
    }


    let new_task = (overrides) => {
        let new_task = {
            id: 0,
            parent_id: 0,
            name: '',
            description: '',
        }
        for (let key in overrides) {
            new_task[key] = overrides[key];
        }
        return new_task;
    }


    let create_and_add_child = (parent, tag, attributes, funcs, before = false) => {
        let new_el = document.createElement(tag);
        if (before) {
            parent.insertBefore(new_el, parent.firstChild);
        } else {
            parent.appendChild(new_el);
        }

        for (let key in attributes) {
            new_el[key] = attributes[key];
        }
        if (funcs) {
            for (let func of funcs) {
                func(new_el);
            }
        }
        return new_el;
    };


    let create_fake_tasks = () => {
        let tasks = [];
        let i = 1;
        for (; i < 10; i++) {
            let i_minus_one = i - 1;
            tasks.push(new_task({
                id: i,
                parent_id: i_minus_one,
                name: `child of ${i_minus_one} name`,
                description: `child of ${i_minus_one} description`,
            }));
        }
        let j = 8;
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


    let load_fake_tasks = () => {
        tasks = create_fake_tasks();
        rebuild_data_div()
    };


    let download_string = (fname, datastring) => {
        if (!download_anchor) {
            download_anchor = create_and_add_child(body, 'a', {
                href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(datastring),
            });
            download_anchor.style.display = 'none';
        }
        download_anchor.download = fname;
        download_anchor.click();
    }

    let download_json = () => {
        let tasks_str = JSON.stringify(tasks);
        download_string('db.json', tasks_str);
    }

    let download_csv = (quote = quote_char, coma = column_separator) => {
        let str = '';
        for (let key in tasks[0]) {
            str += key + coma;
        }
        str = str.substr(0, str.length - 1) + row_separator;

        for (let row of tasks) {
            for (let key in row) {
                let value = row[key];
                str += value + coma;
            }
            str = str.substr(0, str.length - 1) + row_separator;
        }
        download_string('db.csv', str);
    }


    let csv_text_parse = (text, prow_separator = row_separator, pcolumn_separator = column_separator, pquote_char = quote_char) => {
        let rows = text.split(prow_separator);
        let head = rows.shift().split(pcolumn_separator);
        let data = {};
        let result = [];
        for (let row_txt of rows) {
            let row_arr = row_txt.split(pcolumn_separator);
            let count = 0;
            for (let key of head) {
                let val = row_arr[count];
                if (typeof val == 'string' && val.startsWith(pquote_char)) {
                    val = val.substr(1, val.length - 2);
                }
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
        print(file);
        let reader = new FileReader();
        reader.onload = (evt) => {
            let txt_data = reader.result;
            let tmp = null;
            try {
                tasks = JSON.parse(txt_data);
                print('sucess loading json');
                print(tasks);

            } catch (e) {
                tasks = csv_text_parse(txt_data);
                print('sucess loading csv');
                print(tasks);
            }
            assemble_page();
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
        let expire_date = new Date();
        // adds on thousand years from now
        expire_date.setDate(expire_date.getDate() + 365 * 1000);
        let cookie = ['data=', JSON.stringify(tasks), '; domain=', window.location.host.toString().split(':')[0], '; path=/; expires="' + (expire_date.toGMTString()) + '"'].join('');
        // print(cookie);
        document.cookie = cookie;
        // print('\n');
        // print(document.cookie);
    }


    let load_from_cookies = () => {
        var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
        if (result) {
            result = JSON.parse(result[1]);
        }
        // print(result);
        tasks = result;
        rebuild_data_div();
    }


    let save_to_local_storage = () => {
        localStorage.setItem("data", JSON.stringify(tasks));
    };


    let load_from_local_storage = () => {
        tasks = JSON.parse(localStorage.getItem("data"));
        rebuild_data_div()
    };


    let add_child_task = (parent_div, parent_task) => {
        let parent_id = parent_task.id;
        let new_task = {
            id: ++max_id,
            parent_id: parent_id,
            name: `child of ${parent_id} name`,
            description: `child of ${parent_id} description`,
        }
        tasks.push(new_task);
        make_sub_div(new_task, parent_div, true);
    };


    let make_sub_div = (task_obj, parent_div, insert_before = false) => {
        let id = task_obj.id;
        if (id > max_id) {
            max_id = id;
        }
        let container_div_id = 'id_task_' + id;
        let form_id = 'id_task_' + id + '_form';
        odd_row = !odd_row;
        let container_div = create_and_add_child(parent_div, 'div', {
            id: container_div_id,
        }, null, insert_before);

        let classList = container_div.classList;
        classList.add((odd_row ? 'odd_row' : 'even_row'));
        classList.add('idented');
        classList.add('container');
        // classList has add, remove and toggle

        let form_div = create_and_add_child(container_div, 'div');
        classList = form_div.classList;
        classList.add('form');
        classList.add('card');



        /**/let id_span = create_and_add_child(form_div, 'label', { textContent: `Task ${id}` });
        let current_form = create_and_add_child(form_div, 'form', { id: form_id });
        let label_name = create_and_add_child(current_form, 'label', { textContent: 'Name:' });
        let input_name = create_and_add_child(current_form, 'input', { type: 'text', value: task_obj.name });
        let label_description = create_and_add_child(current_form, 'label', { textContent: 'Description:' });
        // <textarea name="" id="" cols="30" rows="10"></textarea>
        let input_description = create_and_add_child(current_form, 'textarea', { type: 'text', value: task_obj.description, rows: 2, cols: 100 });
        let add_child_task_button = create_and_add_child(form_div, 'input', { type: 'button', value: 'add child task', onclick: () => add_child_task(children_div, task_obj) });


        let hide_show_children_button = create_and_add_child(form_div, 'input', {
            type: 'button',
            value: 'hide child tasks'
        });
        hide_show_children_button.onclick = function () {
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
        };

        let children_div = create_and_add_child(container_div, 'div');
        classList = children_div.classList;
        classList.add('children');

        let child_tasks = tasks.filter((i) => 'parent_id' in i && i.parent_id == task_obj.id);
        for (let child_task of child_tasks) {
            make_sub_div(child_task, children_div)
        }
    };


    let rebuild_data_div = () => {
        data_div.innerHTML = null;

        let root_tasks = tasks.filter((i) => i.parent_id < 1);

        for (let root_task of root_tasks) {
            make_sub_div(root_task, data_div)
        }
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

        let upload_data_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'upload data', onclick: upload_file });

        let load_fake_Tasks_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load fake data', onclick: load_fake_tasks });

        let load_from_local_storage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from local storage', onclick: load_from_local_storage });

        let load_from_cookies_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'load from cookies', onclick: load_from_cookies });

        let save_to_cookies_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to cookies', onclick: save_to_cookies });

        let save_to_local_storage_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'save to local storage', onclick: save_to_local_storage });

        let download_json_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'download json', onclick: download_json });

        let download_csv_button = create_and_add_child(menu_div, 'input', { type: 'button', value: 'download csv', onclick: download_csv });

        /**/create_and_add_child(root_div, 'span', { textContent: 'id_root_div' }, null, true);
    };


    let assemble_page = () => {
        tasks = [new_task({
            id: 1,
            parent_id: 0,
            name: 'root task name',
            description: 'root task description',
        }),];
        rebuild_menu_div();
        rebuild_data_div();
    }


    let main = () => {
        print('MAIN BEGIN');
        assemble_page();
        print('MAIN END');
    }


    main();
})();


/*
add child task
delete current task with children
move up on siblings list
move down on siblings list
make up on hierarchy
reparent to id
*/