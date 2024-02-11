document.addEventListener('DOMContentLoaded', () => {
    const markdown_raw_file = fetch(document.getElementById('url').textContent);
    window['markdown'].ready.then(markdown => {
        markdown_raw_file.then(resp => {
            resp.text().then(data => {
                let md_content = document.getElementById('markdown_fillContent')
                md_content.innerHTML = markdown.parse(data.replace(/---\n[\s\S]*?\n---\n/, ''));
                if(!__isMobile)TOC(md_content)
            })
        });
    })

})

function TOC(markdown_content) {
    let tocList = markdown_content.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let liList = [];
    let toc = document.querySelector("#toc");
    tocList.forEach((v, i) => {
        let pid = '_' + Date.now().toString(36) + Math.random().toString(36).replace(/[\s\S]{3}/, '');
        v.id = pid;
        const H = v.nodeName[1];
        let li = document.createElement('li');
        li.classList.add(`li-${H}`);
        li.setAttribute('pid', pid);
        li.textContent = v.textContent;
        li.addEventListener("click", () => {
            window.scrollBy({ top: v.getBoundingClientRect().y, behavior: "smooth" });
        });
        toc.appendChild(li);
        liList.push(li);
    })
    let tocArr = Array.from(tocList);
    const removeClass = () => {
        liList.forEach(v => v.classList.remove("active"));
    }
    const update = () => {
        for (let i = 0; i < tocArr.length; i++) {
            let v = tocArr[i];
            let rect = v.getBoundingClientRect();
            let top = rect.top + rect.height;
            if (top > 0) {
                removeClass();
                let li = liList[i];
                li.classList.add('active');
                toc.style.setProperty('--g-start',li.offsetTop+li.getBoundingClientRect().height-5+'px');
                toc.style.setProperty('--g-end',li.offsetTop+li.getBoundingClientRect().height+5+'px');
                break;
            } else {
            }
        }
    }
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                update();
                ticking = false;
            })
        }
        ticking = true;
    });
    update();

}