import "../css/css.css";

import translator from "xtranslator";

type Engines = keyof typeof translator.e;

import rename_svg from "../assets/icons/rename.svg";
import close_svg from "../assets/icons/close.svg";
import right_svg from "../assets/icons/right.svg";
import yes_svg from "../assets/icons/yes.svg";
import copy_svg from "../assets/icons/copy.svg";

import baidu_svg from "../assets/other/baidu.svg";
import youdao_svg from "../assets/other/youdao.svg";
import bing_svg from "../assets/other/bing.svg";
import deepl_svg from "../assets/other/deepl.svg";
import caiyun_svg from "../assets/other/caiyun.svg";
import chatgpt_svg from "../assets/other/chatgpt.svg";
import niu_svg from "../assets/other/niu.svg";

const s = new URLSearchParams(decodeURIComponent(location.search));

var text = s.get("text") || "";
var index = "0";

type item_type = { id: string; e: string; from: string; to: string; children?: item_type[] };

let trees: { tree: item_type[]; name: string }[] = JSON.parse(localStorage.getItem("trees"));
for (let t in trees) {
    if (trees[t].name == (s.get("m") || "默认")) {
        index = t;
    }
}
if (!trees || !trees.length) {
    trees = [{ name: "默认", tree: [{ id: uuid(), e: "caiyun", from: "cn", to: "en" }] }];
}
let tree: item_type[] = trees[0].tree;

let engine_config: Partial<
    Record<
        Engines,
        {
            t: string;
            key: { name: string; text?: string }[];
            help?: { text: string; src: string };
            icon: string;
        }
    >
> = {
    youdao: {
        t: "有道",
        icon: youdao_svg,
        key: [{ name: "appid" }, { name: "key" }],
        help: { text: "有道api申请", src: "https://ai.youdao.com/product-fanyi-text.s" },
    },
    baidu: {
        t: "百度",
        icon: baidu_svg,
        key: [{ name: "appid" }, { name: "key" }],
        help: { text: "百度api申请", src: "https://fanyi-api.baidu.com/product/11" },
    },
    deepl: {
        t: "Deepl",
        icon: deepl_svg,
        key: [{ name: "key" }],
        help: { text: "Deepl api申请", src: "https://www.deepl.com/pro-api?cta=header-pro-api" },
    },
    deeplx: {
        t: "DeeplX",
        icon: deepl_svg,
        key: [{ name: "url" }],
    },
    caiyun: {
        t: "彩云",
        icon: caiyun_svg,
        key: [{ name: "token" }],
        help: { text: "彩云api申请", src: "https://docs.caiyunapp.com/blog/2018/09/03/lingocloud-api/" },
    },
    bing: {
        t: "必应",
        icon: bing_svg,
        key: [{ name: "key" }],
        help: {
            text: "必应api申请",
            src: "https://learn.microsoft.com/zh-cn/azure/cognitive-services/translator/how-to-create-translator-resource#authentication-keys-and-endpoint-url",
        },
    },
    chatgpt: {
        t: "chatgpt",
        icon: chatgpt_svg,
        key: [{ name: "key" }],
        help: { text: "chatgpt api申请", src: "https://platform.openai.com/account/api-keys" },
    },
    niu: {
        t: "小牛翻译",
        icon: niu_svg,
        key: [{ name: "key" }],
        help: { text: "小牛api申请", src: "https://niutrans.com/documents/contents/beginning_guide/6" },
    },
};

var api_id = JSON.parse(localStorage.getItem("fanyi")) as typeof t_api_id;
const t_api_id = {
    youdao: { appid: "", key: "" },
    baidu: { appid: "", key: "" },
    deepl: { key: "" },
    deeplx: { url: "" },
    caiyun: { token: "" },
    bing: { key: "" },
    chatgpt: { key: "" },
    niu: { key: "" },
};
if (!api_id) {
    localStorage.setItem("fanyi", JSON.stringify(t_api_id));
    api_id = t_api_id;
} else {
    api_id = Object.assign(t_api_id, api_id);
    localStorage.setItem("fanyi", JSON.stringify(api_id));
}
const trees_mane_el = document.getElementById("tree_mana");

function load_trees() {
    trees_mane_el.innerHTML = "";
    let main = document.createElement("div");
    trees.forEach((tree, i) => {
        let div = document.createElement("div");
        let t = document.createElement("span");
        t.innerText = tree.name;
        let rename = document.createElement("div");
        rename.title = "重命名";
        rename.innerHTML = `<img src="${rename_svg}">`;
        rename.onclick = () => {
            tree.name = prompt(tree.name) || tree.name;
            t.innerText = tree.name;
            localStorage.setItem("trees", JSON.stringify(trees));
            reload();
        };
        let ex = document.createElement("div");
        ex.title = "复制到剪贴板";
        ex.innerHTML = `<img src="${right_svg}">`;
        ex.onclick = () => {
            navigator.clipboard.writeText(JSON.stringify(tree));
        };
        let rm = document.createElement("div");
        rm.title = "移除";
        rm.innerHTML = `<img src="${close_svg}">`;
        rm.onclick = () => {
            if (trees.length == 1) return;
            trees = trees.filter((t) => t != tree);
            if (trees.length == Number(index)) {
                index = String(trees.length - 1);
            }
            div.remove();
            localStorage.setItem("trees", JSON.stringify(trees));
            reload();
        };
        div.append(t, rename, ex, rm);
        main.append(div);
    });
    function reload() {
        change_tree.innerHTML = "";
        for (let i in trees) {
            let o = document.createElement("option");
            o.value = i;
            o.innerText = trees[i].name;
            change_tree.append(o);
            change_tree.load();
        }
        change_tree.value = index;
    }
    trees_mane_el.append(main);
    let im_text = document.createElement("textarea");
    im_text.placeholder = "粘贴以导入";
    let add = document.createElement("div");
    add.title = "确认导入";
    add.classList.add("import_tree_b");
    add.innerHTML = `<img src="${yes_svg}">`;
    add.onclick = () => {
        let t: { name: string; tree: item_type[] };
        try {
            t = JSON.parse(im_text.value);
            trees.push(t);
            localStorage.setItem("trees", JSON.stringify(trees));
            reload();
            load_trees();
        } catch (error) {}
        im_text.value = "";
    };
    trees_mane_el.append(im_text, add);
}

const config_el = document.getElementById("密码");
const delay_el = document.getElementById("延时") as HTMLInputElement;

function load_setting() {
    load_trees();
    config_el.innerHTML = `<h2>密码</h2>`;
    for (let i in engine_config) {
        let div = document.createElement("div");
        let name = document.createElement("h3");
        let help = document.createElement("p");
        let helpa = document.createElement("a");

        name.innerText = engine_config[i].t;
        div.append(name);
        if (engine_config[i].help) {
            helpa.href = engine_config[i].help.src;
            helpa.target = "_blank";
            helpa.innerText = engine_config[i].help.text;
            help.append(helpa);
            div.append(help);
        }

        for (let k of engine_config[i].key) {
            let x = document.createElement("div");
            let n = document.createElement("span");
            let input = document.createElement("input");
            n.innerText = k.text || k.name;
            input.value = api_id[i][k.name];
            input.onchange = () => {
                api_id[i][k.name] = input.value;
            };
            x.append(n, input);
            div.append(x);
        }
        config_el.append(div);
    }
    delay_el.value = localStorage.getItem("delay") || "1";
}
load_setting();

function save_setting() {
    localStorage.setItem("fanyi", JSON.stringify(api_id));
    localStorage.setItem("delay", delay_el.value);
    setting.classList.add("setting_hide");
}

const setting = document.getElementById("设置");
document.getElementById("exit_setting").onclick = () => {
    setting.classList.add("setting_hide");
    save_setting();
};
document.getElementById("show_setting").onclick = () => {
    setting.classList.remove("setting_hide");
    load_setting();
};
document.getElementById("down_setting").onclick = () => {
    let a = document.createElement("a");
    let blob = new Blob([JSON.stringify(JSON.parse(localStorage.getItem("fanyi")), null, 4)]);
    a.download = `eSearch-translator-key.json`;
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(String(blob));
};
document.getElementById("up_setting").onclick = () => {
    let file = document.createElement("input");
    file.type = "file";
    file.click();
    file.oninput = () => {
        let reader = new FileReader();
        reader.onload = () => {
            localStorage.setItem("fanyi", <string>reader.result);
            load_setting();
        };
        reader.readAsText(file.files[0]);
    };
};

const textarea = document.querySelector("textarea");
textarea.value = text || "";

textarea.oninput = () => {
    text = textarea.value;
    translate(text);
};

document.getElementById("clear").onclick = () => {
    textarea.value = "";
    textarea.focus();
};

function to_e_lan(lan: string, e: string) {
    return translator.e[e].lan2lan[lan] || lan;
}

let languageName = new Intl.DisplayNames(navigator.language, { type: "language" });
const lan = (l: string) => {
    if (l === "auto") {
        return "*";
    }
    return languageName.of(l);
};

function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        .replace(/[xy]/g, (c) => {
            var r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16).slice(0, 7);
        })
        .slice(0, 7);
}

function render_tree(tree: item_type[], pel: HTMLElement) {
    pel.innerHTML = "";
    for (let i of tree) {
        let t = document.createElement("e-translator") as item;
        t.id = i.id;
        pel.append(t);
        t.e = i.e;
        t.from_lan = i.from;
        t.to.value = i.to;
        if (i.children) t.子翻译器 = i.children;
    }
}

function get_tree(pel: HTMLElement) {
    let l = [] as item_type[];
    if (pel.querySelector(":scope > e-translator")) {
        pel.querySelectorAll(":scope > e-translator").forEach((el: item) => {
            l.push({ e: el.e, from: el.from.value, to: el.to.value, id: el.id, children: el.子翻译器 });
        });
    }
    return l;
}

function tree_change() {
    tree = get_tree(document.getElementById("translators"));
    trees[index].tree = tree;
    localStorage.setItem("trees", JSON.stringify(trees));
}

import css from "../css/css.css";

class select extends HTMLElement {
    constructor() {
        super();
    }

    _value = "";
    more: HTMLElement;
    show: HTMLElement;

    connectedCallback() {
        var shadow = this.attachShadow({ mode: "open" });
        let style = document.createElement("style");
        style.innerHTML = css;
        shadow.append(style);

        this.more = document.querySelector(".e-select-more");

        this.show = document.createElement("div");
        this.show.classList.add("e-select-show");
        this.load();
        shadow.append(this.show);

        this.more.classList.add("e-select-hide");

        this.show.onclick = () => {
            if (this.more.classList.contains("e-select-hide")) {
                this.more.innerHTML = this.innerHTML;
                let rect0 = this.getBoundingClientRect();
                this.more.style.left = rect0.left + "px";
                this.more.style.top = rect0.bottom + "px";
                this.load();
            }
            this.more.classList.toggle("e-select-hide");
        };

        this.tabIndex = 0;
        this.onblur = () => {
            this.more.classList.add("e-select-hide");
        };
    }

    load() {
        this.more.innerHTML = this.innerHTML;

        let has_value = null as HTMLElement;
        this.more.querySelectorAll(":scope > *").forEach((el: HTMLElement) => {
            let value = el.getAttribute("value") || el.innerText;
            el.onpointerdown = () => {
                this.show.innerHTML = el.innerHTML;
                this.more.querySelectorAll(".e-select-selected").forEach((i) => {
                    i.classList.remove("e-select-selected");
                });
                el.classList.add("e-select-selected");
                this._value = value;
                this.more.classList.add("e-select-hide");
                this.dispatchEvent(new Event("input"));
            };
            if (value == this._value) {
                has_value = el;
            }
        });
        if (has_value) {
            has_value.classList.add("e-select-selected");
            this.show.innerHTML = has_value.innerHTML;
        } else {
            if (this.more.querySelector(":scope > *")) {
                this.show.innerHTML = this.more.querySelector(":scope > *").innerHTML;
                this.more.querySelector(":scope > *").classList.add("e-select-selected");
                this._value = this.more.querySelector(":scope > *").getAttribute("value");
            } else {
                this.show.innerHTML = "";
                this._value = null;
            }
        }
    }
    set value(t: string) {
        this.load();
        let xel = null as HTMLElement;
        this.more.querySelectorAll(".e-select-selected").forEach((i) => {
            i.classList.remove("e-select-selected");
        });
        this.more.querySelectorAll(":scope > *").forEach((el: HTMLElement) => {
            let value = el.getAttribute("value") || el.innerText;
            if (value == t) {
                xel = el;
            }
        });
        if (xel) {
            xel.classList.add("e-select-selected");
            this.show.innerHTML = xel.innerHTML;
            this._value = t;
        } else {
            if (this.more.querySelector(":scope > *")) {
                this.show.innerHTML = this.more.querySelector(":scope > *").innerHTML;
                this.more.querySelector(":scope > *").classList.add("e-select-selected");
                this._value = this.more.querySelector(":scope > *").getAttribute("value");
            }
        }
    }
    get value() {
        return this._value;
    }
}

window.customElements.define("e-select", select);

const text_result = document.getElementById("text");

class item extends HTMLElement {
    constructor() {
        super();
    }

    _value = "";
    zt: HTMLElement;
    t: select;
    from: select;
    to: select;
    c: HTMLElement;

    connectedCallback() {
        let main = document.createElement("div");
        let bar = document.createElement("div");
        this.zt = document.createElement("div");
        this.t = document.createElement("e-select") as select;
        this.from = document.createElement("e-select") as select;
        this.to = document.createElement("e-select") as select;

        for (let i in engine_config) {
            let op = document.createElement("div");
            op.innerHTML = `<img src="${engine_config[i].icon}" style="width:1.4em">`;
            op.style.padding = "0.25em";
            op.setAttribute("value", i);
            this.t.append(op);
        }

        this.t.oninput = () => {
            this.reload_lan();
            this.check_e(this.t.value);
            tree_change();
        };

        this.set_zt("n");
        let text = document.createElement("div");
        text.classList.add("text");
        this.zt.append(text);
        this.zt.onclick = (e) => {
            if (e.target == this.zt) text.classList.toggle("text_show");
        };

        this.append(main);
        main.append(bar);
        bar.append(this.t, this.from, this.to, this.zt);

        this.from.oninput = () => {
            this.check_from();
            tree_change();
        };

        this.to.oninput = () => {
            this.c.querySelectorAll(":scope > e-translator").forEach((cel: item) => {
                cel.check_from();
            });
            tree_change();
        };
        this.c = document.createElement("div");
        this.append(this.c);

        let add_b = document.createElement("div"),
            add_c = document.createElement("div"),
            rm = document.createElement("div");
        add_b.classList.add("add_b");
        add_c.classList.add("add_c");
        rm.classList.add("rm");
        main.append(add_b, add_c, rm);

        add_b.onclick = () => {
            let t = document.createElement("e-translator") as item;
            t.id = uuid();
            this.after(t);
            t.e = this.t.value;
            t.from_lan = this.from.value;
            tree_change();
        };
        add_c.onclick = () => {
            let t = document.createElement("e-translator") as item;
            t.id = uuid();
            this.c.append(t);
            t.e = this.t.value;
            t.from_lan = this.to.value;
            tree_change();
        };
        rm.onclick = () => {
            if (document.querySelectorAll("e-translator").length > 1) this.remove();
            tree_change();
        };
    }

    getTV() {
        return this.t.value as Engines;
    }

    reload_lan() {
        if (this.t.value) {
            const from_lan = this.from.value;
            this.from.innerHTML = "";
            this.from.load();
            this.to.innerHTML = "";
            this.to.load();
            let xLan = translator.e[this.getTV()].lan.map((i) => {
                return { lan: i, text: lan(i) };
            });
            xLan.sort((a, b) => new Intl.Collator(navigator.language).compare(a.text, b.text));
            let xTLan: { lan: string; text: string }[] = null;
            if (translator.e[this.getTV()].targetLan) {
                xTLan = translator.e[this.getTV()].targetLan.map((i) => {
                    return { lan: i, text: lan(i) };
                });
                xTLan.sort((a, b) => new Intl.Collator(navigator.language).compare(a.text, b.text));
            }
            for (let i of xLan) {
                let o = document.createElement("option");
                o.value = i.lan;
                o.innerText = i.text;
                this.from.append(o);
                this.from.load();
            }
            for (let i of xTLan || xLan) {
                let o = document.createElement("option");
                o.value = i.lan;
                o.innerText = i.text;
                if (i.lan != "auto") {
                    this.to.append(o.cloneNode(true));
                    this.to.load();
                }
            }
            this.from_lan = from_lan;
        }
    }

    set_zt(type: "e" | "o" | "n", text?: string) {
        this.zt.classList.remove("zt_normal");
        this.zt.classList.remove("zt_ok");
        this.zt.classList.remove("zt_error");
        switch (type) {
            case "e":
                this.zt.classList.add("zt_error");
                break;
            case "n":
                this.zt.classList.add("zt_normal");
                break;
            case "o":
                this.zt.classList.add("zt_ok");
                break;
            default:
                break;
        }
    }

    set from_lan(t: string) {
        let has_lan = false;
        for (let i in translator.e[this.t.value as "bing"].lan) {
            if (i == t) {
                has_lan = true;
                break;
            }
        }
        if (!has_lan) {
            this.from.classList.add("waring");
        }
        this.from.value = t;
        this.check_from();
    }

    check_from() {
        let t = this.from.value;
        if (
            this.parentElement != document.getElementById("translators") &&
            t != "auto" &&
            t != (this.parentElement.parentElement as item).to.value
        ) {
            this.from.classList.add("waring");
        } else {
            this.set_zt("n");
            this.from.classList.remove("waring");
        }
    }

    set text(t: string) {
        let e = this.t.value;
        // super_e 允许外部更改引擎
        ((window["super_e"] as (e: string, text: string, from: string, to: string) => Promise<string>) || engine)(
            e,
            t,
            to_e_lan(this.from.value, e),
            to_e_lan(this.to.value, e)
        )
            .then((v) => {
                console.log(v);
                this.c.querySelectorAll(":scope > e-translator").forEach((el: item) => {
                    el.text = v;
                });
                this.zt.querySelector("div").innerText = v;
                this.set_zt("o");

                if (!this.c.querySelector("e-translator")) {
                    texts.push({ i: this.getBoundingClientRect().y, text: v });
                    show_translate();
                }
            })
            .catch((e) => {
                this.set_zt("e");
                console.error(e);
            });
    }

    set e(t: string) {
        this.t.value = t;
        this.reload_lan();
        this.check_e(t);
    }

    check_e(t: string) {
        let has_k = true;
        for (let i in api_id[t]) {
            if (api_id[t][i] == "") {
                has_k = false;
                break;
            }
        }
        if (!has_k) {
            this.t.classList.add("waring");
        } else {
            this.t.classList.remove("waring");
        }
    }

    get e() {
        return this.t.value;
    }

    set 子翻译器(tree: item_type[]) {
        render_tree(tree, this.c);
    }

    get 子翻译器() {
        return get_tree(this.c);
    }
}

window.customElements.define("e-translator", item);

function get_item(id: string) {
    return document.getElementById(id) as item;
}

let t_time = NaN;

let texts: { i: number; text: string }[] = [];

function translate(text: string) {
    if (!text) {
        text_result.innerHTML = `<div style="height: 100%"></div>`;
        return;
    }

    clearTimeout(t_time);

    const t = Number(localStorage.getItem("delay")) * 1000;
    t_time = setTimeout(() => {
        texts = [];
        text_result.innerHTML = "";
        for (let i of tree) {
            get_item(i.id).text = text;
        }
    }, t || 1000);
}

function show_translate() {
    text_result.innerHTML = "";
    let l = texts.sort((a, b) => a.i - b.i);
    for (let i of l) {
        let div = document.createElement("div");
        div.innerText = i.text;
        let copy = document.createElement("div");
        copy.innerHTML = `<img src="${copy_svg}">`;
        copy.onclick = () => {
            navigator.clipboard.writeText(i.text);
        };
        div.append(copy);
        text_result.append(div);
    }
}

const change_tree = document.getElementById("change_tree") as select;
for (let i in trees) {
    let o = document.createElement("option");
    o.value = i;
    o.innerText = trees[i].name;
    change_tree.append(o);
    change_tree.load();
}
change_tree.value = index;
document.getElementById("change_tree").oninput = () => {
    index = change_tree.value;
    render_tree(trees[change_tree.value].tree, document.getElementById("translators"));
};

document.getElementById("add_tree").onclick = () => {
    index = `新树 ${uuid()}`;
    trees.push({ tree: JSON.parse(JSON.stringify(tree)) as item_type[], name: index });
    let o = document.createElement("option");
    o.value = index;
    o.innerText = index;
    change_tree.append(o);
    change_tree.load();
    change_tree.value = index;
    localStorage.setItem("trees", JSON.stringify(trees));
};

render_tree(tree, document.getElementById("translators"));

translate(text);

function engine(e: "bing", text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
        if (engine_config[e]) {
            translator.e[e].setKeys(Object.values(api_id[e]));
            translator.e[e].run(text, from, to).then(re).catch(rj);
        } else {
            rj(() => {
                console.error("引擎不存在");
            });
        }
    });
}
