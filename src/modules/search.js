import db from "../core/database.js";
import { writeFile } from "fs";
import { join } from "path";

function generateSearchStrings(){
    let api_conf = db.theme.get('API');
    if (api_conf.searchComponent) {
        let search_config = api_conf.searchComponent;
        let arr = [];
        let title = search_config.includes('title'),
            id = search_config.includes('id'),
            content = search_config.includes('content'),
            date = search_config.includes('date');
        for (let article of db.site.posts) {
            let href = db.file(article.path('website'));
            let atitle = article.title;
            let acontent;
            if(title)acontent+='%%%'+article.title;
            if(id)acontent+='%%%'+article.id;
            if(content)acontent+='%%%'+article.content.replace(/\n/g,' ').replace(/[#*]/g,'');
            if(date)acontent+='%%%'+article.date.toDateString();
            arr.push({'content':acontent,href,atitle});
            //if (title) { arr.push({ 'content': article.title, href, atitle }); }
            //if (id) { arr.push({ 'content': article.id, href, atitle }); }
            //if (content) { arr.push({ 'content': article.content.replace(/\n/g, ' '), href, atitle }); }
            //if (date) { arr.push({ 'content': article.date.toDateString(), href, atitle }); }
        }
        writeFile(join(db.dirs.public, 'searchStrings.json'), JSON.stringify(arr), () => { });
    }
}

export default generateSearchStrings;