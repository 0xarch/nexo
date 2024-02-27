import { word_count } from "./reader.js";
import { warn } from "./mod.js";
import { notFake } from "./closures.js";
import { readFileSync, statSync } from "fs";
import { parse } from "marked";
import Cache from "./class.cache.js";
import { License, Datz } from "./classes.js";

class Post{
    raw_string;
    content;
    html;
    author;
    license;
    category;
    tags;
    keywords;
    id;
    date;
    lastModifiedDate;
    ECMA262Date;
    isTopped = false;
    foreword;
    prevID;
    nextID;
    websitePath;
    publicFilePath;
    transformedTitle;
    pathto = '';
    wordCount = 0;
    title;
    datz;
    old = false;
    property;
    #cache = new Cache;
    getParsed(type){
        switch(type){
            case "foreword":
            case "content":
                // rp stands for 'result of parsing'
                let index = 'rp-'+type;
                if(this.#cache.stored(index))
                    return this.#cache.get(index);
                else {
                    let result = parse(this[type]);
                    this.#cache.set(index,result);
                    return result;
                }
        }
    }
    path(type){
        switch(type){
            case "website":
                return this.#cache.has_or_set('rw-website',`/read/p${this.id}/index.html`);
            case "local":
                return this.#cache.has_or_set('rw-local',`read/p${this.id}/index.html`);
        }
    }
    /**
     * 
     * @param {string} path
     */
    constructor(path){
        let fstat = statSync(path);
        this.lastModifiedDate = fstat.ctime;
        let raw_string = readFileSync(path).toString();
        this.raw_string = raw_string;
        const lines = raw_string.split("\n");
        let getted = {
            title: "Untitled",
            date: '1970-1-1',
            category: " ",
            tags: " ",
            license: 'byncsa'
        };
        let i = 0;
        if (lines[i] === "---") {
            i++;
            while (lines[i] !== "---") {
                let __tempor_val = lines[i].split(":");
                getted[__tempor_val.shift()] = __tempor_val.join(":");
                i++;
            }
            i++;
        }
        this.property = getted;
        let gz = getted.date.split(/[\ \-\.]/).filter(v=>v).map(v=>parseInt(v));
        let moreIndex = lines.indexOf('<!--more-->');
        /*
         * Critical change.
            After 2.0.3, theme should set a part for showing the foreword as it will not be included in the content. 
         */
        if(moreIndex == -1){
            /* No foreword provided */
            this.content = lines.slice(i).join('\n');
        } else {
            this.content = lines.slice(moreIndex).join('\n');
        }
        this.title = getted.title;
        this.category = getted.category.split(" ").filter(notFake);
        this.tags = getted.tags.split(" ").filter(notFake);
        this.foreword = lines.slice(i, (moreIndex !== -1) ?moreIndex :5) .join('\n').replace(/\#*/g,'');
        let fwc = word_count(this.foreword);
        if(fwc <= 1){
            warn(['NO FOREWORD','RED'],[this.title,'MAGENTA','NONE']);
        }else if(fwc < 25){
            warn(['TOO SHORT FOREWORD','YELLOW'],[this.title,'MAGENTA','NONE']);
        }else if(fwc > 200){
            warn(['TOO LONG FOREWORD','RED'],[this.title,'MAGENTA','NONE']);
        }
        if(this.foreword=="") this.foreword = "The author of this article has not yet set the foreword.\n\nCategory(ies): "+this.category.join(", ")+"\n\nTag(s): "+this.tags.join(", ");
        this.isTopped = getted.top?true:false;
        this.date = new Date(getted.date);
        this.license = new License(getted.license||'');
        this.datz = new Datz(...gz);
        this.wordCount = word_count(this.content);
        this.imageUrl = getted.imageUrl||'';
        if(!getted.keywords) this.keywords = this.tags;
        else this.keywords = getted.keywords.split(" ").filter(notFake);
        this.ECMA262Date = this.date.toDateString();
        this.transformedTitle = getted.title.replace(/[\,\.\<\>\ \-\+\=\~\`\?\/\|\\\!\@\#\$\%\^\&\*\(\)\[\]\{\}\:\;\"\'\～\·\「\」\；\：\‘\’\“\”\，\。\《\》\？\！\￥\…\、\（\）]/g,'');
        if(getted.old){
            this.old = true;
            warn(['OLD POST','YELLOW'],[this.title,'MAGENTA']);
        }
    }
    setPath(path){
        this.pathto = path;
    }
    setID(id){
        this.id = id;
    }
    setPrev(id){
        this.prevID = id;
    }
    setNext(id){
        this.nextID = id;
    }
}

export default Post;