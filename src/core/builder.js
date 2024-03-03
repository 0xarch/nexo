import { mkdirSync, readFileSync,writeFile } from "fs";
import { dirname, join as join_path } from "path";
import { errno } from "../lib/mod.js";
import { Correspond } from "../lib/file_class.js";
import { Collection } from "./struct.js";
import parsers from "./build_compat.js";
import db from "./database.js";
import Layout from "../lib/class.layout.js";

/**
 * 
 * @param {Collection} theme 
 * @param {Collection} config 
 * @param {Collection} collection 
 * @param {Layout} file
 * @param {{}} option
 */
async function write(collection, file, option) {
    let theme = db.theme;
    let config = db.settings;
    let theme_directory = db.dirs.theme.root;
    let absolute_correspond = new Correspond(
        join_path(db.dirs.theme.layout, file.correspond().from),
        join_path(config.get('public_directory') || config.get('build.public_directory'), file.correspond().to, 'index.html'));

    // _______ get
    let template = readFileSync(absolute_correspond.from).toString();
    let template_type = theme.get('layout.type');
    const opt = file.option();

    // _______ define vars
    let iter = { "MAIN": {} };
    let addition = {};

    // _______ proc
    if (file.has_addition()) {
        let map = file.addition();
        for (let key in map) {
            addition[key] = collection.get(map[key]);
        }
    }
    if (file.is_varias()) {
        if (!opt.varias) {
            errno(8102);
            return;
        }
        iter = {};
        let v_parent = collection.get(opt.varias.parent);
        let time = 0;
        for (let key in v_parent) {
            let iter_key = 'V' + time;
            let varias = {
                enabled: true,
                name: key,
                iter_key,
                value: v_parent[key]
            }
            iter[iter_key] = {
                ...iter[iter_key],
                varias
            };
            time++;
        }
    }

    for (let key in iter) {
        let addition_in_iter = iter[key];
        let path_write_to_prefix = join_path(config.get('public_directory') || config.get('build.public_directory'));
        if (addition_in_iter.varias) {
            let varias = addition_in_iter.varias; varias;//used in eval
            path_write_to_prefix += '/' + eval('`' + file.correspond().to + '`');
        } else {
            path_write_to_prefix = join_path(path_write_to_prefix, file.correspond().to);
        }
        if (file.is_cycling()) {
            if (!opt.cycling) {
                errno(8103);
                return;
            }
            let c_opt = opt.cycling;
            let c_parent = collection.get(c_opt.parent) || new Collection(addition_in_iter).get(c_opt.parent) || new Collection(addition).get(c_opt.parent);
            let cycling_results = cycling(c_parent, c_opt.every, path_write_to_prefix);
            for (let result of cycling_results) {
                proc_final(template_type, template, {
                    basedir: join_path(theme_directory, 'layouts'),
                    filename: file.correspond().from
                }, {
                    ...collection.get_all(),
                    ...addition,
                    ...addition_in_iter,
                    cycling: result,
                }, result.path);
            }
        } else {
            let path = path_write_to_prefix + '/index.html';
            proc_final(template_type, template, {
                basedir: join_path(theme_directory, 'layouts'),
                filename: file.correspond().from
            }, {
                ...collection.get_all(),
                ...addition,
                ...addition_in_iter,
            }, path);
        }
    }
    return;
}

function cycling(parent, every, prefix = '') {
    if (!Array.isArray(parent)) {
        let _arr = [];
        for (let key in parent) {
            _arr.push({ key, value: parent[key] });
        }
        parent = _arr;
    }
    let len = parent.length;
    let results = [];
    for (let i = 0; i * every < len; ++i) {
        let Cycling = {
            enabled: true,
            total: Math.ceil(len / every),
            now: i + 1,
            value: parent.slice(i * every, (i + 1) * every),
            prev_path: join_path(prefix, (i) + '/index.html'),
            next_path: join_path(prefix, (i + 2) + '/index.html'),
            path: join_path(prefix, (i + 1) + '/index.html')
        };
        results.push(Cycling);
    }
    return results;
}

/**
 * 
 * @param { string } type 
 * @param { string } template 
 * @param { {
*  basedir: string,
*  filename: string
* } } options 
* @param { object } provide_variables
* @param { string } path_write_to 
* @returns {'Ok'}
*/
async function proc_final(type,template,options,provide_variables,path_write_to){
    let procer;
    switch(type){
       case 'JADE':
           procer = parsers.pug;
           break;
        default:
            procer = parsers[type.toLowerCase()];
    }
    mkdirSync(dirname(path_write_to),{recursive:true});
    let result = procer(template,options,provide_variables);
    try{
        if(readFileSync(path_write_to).toString() == result) return;
    } catch(e){}
    writeFile(path_write_to,result,(e)=>{if(e)throw e});
    return 'Ok';
}

export {
    write,
    proc_final
}