import "../css/css.css";

const s = new URLSearchParams(decodeURIComponent(location.search));

var text = s.get("text") || "";
var mode = s.get("m") || "";

var api_id = JSON.parse(localStorage.getItem("fanyi"));
if (!api_id) {
    api_id = {
        baidu: { appid: "", key: "" },
        deepl: { key: "" },
        caiyun: { token: "" },
        bing: { key: "" },
    };
    localStorage.setItem("fanyi", JSON.stringify(api_id));
}
function get_v(id: string) {
    return document.getElementById(id) as HTMLInputElement;
}
function load_setting() {
    get_v("baidu_appid").value = api_id.baidu.appid;
    get_v("baidu_key").value = api_id.baidu.key;
    get_v("deepl_key").value = api_id.deepl.key;
    get_v("caiyun_key").value = api_id.caiyun.token;
    get_v("bing_key").value = api_id.bing.key;
}
load_setting();

function save_setting() {
    api_id.baidu.appid = get_v("baidu_appid").value;
    api_id.baidu.key = get_v("baidu_key").value;
    api_id.deepl.key = get_v("deepl_key").value;
    api_id.caiyun.token = get_v("caiyun_key").value;
    api_id.bing.key = get_v("bing_key").value;
    localStorage.setItem("fanyi", JSON.stringify(api_id));
}
document.getElementById("save_setting").onclick = save_setting;

document.querySelector("textarea").value = text || "";

document.querySelector("textarea").oninput = () => {
    text = document.querySelector("textarea").value;
    translate(text);
};

let o = {
    youdao: { t: "有道" },
    baidu: { t: "百度" },
    deepl: { t: "Deepl" },
    caiyun: { t: "彩云" },
    bing: { t: "必应" },
};

type item_type = { id: string; e: string; from: string; to: string; children?: item_type[] };

let trees: { [id: string]: item_type[] } = JSON.parse(localStorage.getItem("trees"));
if (!trees) {
    trees = { 默认: [{ id: "a", e: "caiyun", from: "cn", to: "en" }] };
}
let tree: item_type[] = trees[mode] || trees.默认;

function render_tree(tree: item_type[], pel: HTMLElement) {
    for (let i of tree) {
        let t = document.createElement("e-translator") as item;
        t.id = i.id;
        pel.append(t);
        if (i.children) t.子翻译器 = i.children;
        t.e = i.e;
    }
}

class item extends HTMLElement {
    constructor() {
        super();
    }

    _value = "";
    t: HTMLElement;
    from: HTMLElement;
    to: HTMLElement;
    c: HTMLElement;

    connectedCallback() {
        var bar = document.createElement("div");
        this.t = document.createElement("div");
        this.from = document.createElement("div");
        this.to = document.createElement("div");
        this.append(bar);
        bar.append(this.t, this.from, this.to);

        this.c = document.createElement("div");
        this.append(this.c);

        let add_b = document.createElement("div"),
            add_c = document.createElement("div");
        add_b.classList.add("add_b");
        add_c.classList.add("add_c");
        bar.append(add_b, add_c);

        let t_list = document.createElement("select");
        for (let i in o) {
            let op = document.createElement("option");
            op.innerText = o[i].t;
            op.value = i;
            t_list.append(op);
        }
        this.t.append(t_list);

        add_b.onclick = () => {
            let t = document.createElement("e-translator") as item;
            t.id = "x";
            this.after(t);
        };
        add_c.onclick = () => {
            let t = document.createElement("e-translator") as item;
            t.id = "x";
            this.c.append(t);
        };
    }

    set text(t: string) {
        engine(this.t.querySelector("select").value, t, "", "").then((v) => {
            console.log(v);
            this.c.querySelectorAll(":scope > e-translator").forEach((el: item) => {
                el.text = v;
            });
        });
    }

    set e(t: string) {
        this.t.querySelector("select").value = t;
    }

    set 子翻译器(tree: item_type[]) {
        render_tree(tree, this.c);
    }
}

window.customElements.define("e-translator", item);

function get_item(id: string) {
    return document.getElementById(id) as item;
}

function translate(text: string) {
    for (let i of tree) {
        get_item(i.id).text = text;
    }
}

render_tree(tree, document.getElementById("translators"));

translate(text);

function engine(e: string, text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void) => {
        switch (e) {
            case "youdao":
                fetch(`http://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=${encodeURIComponent(text)}`, {
                    method: "GET",
                })
                    .then((v) => v.json())
                    .then((t) => {
                        let l = [];
                        for (let i of t.translateResult) {
                            let t = "";
                            for (let ii of i) {
                                t += ii.tgt;
                            }
                            l.push(t);
                        }
                        re(l.join("\n"));
                    });
                break;
            case "baidu":
                if (!api_id.baidu.appid || !api_id.baidu.key) return;
                let appid = api_id.baidu.appid;
                let key = api_id.baidu.key;
                let salt = new Date().getTime();
                let str1 = appid + text + salt + key;
                let sign = MD5(str1);
                fetch(
                    `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(
                        text
                    )}&from=en&to=zh&appid=${appid}&salt=${salt}&sign=${sign}`
                )
                    .then((v) => v.json())
                    .then((t) => {
                        let l = t.trans_result.map((v) => v.dst);
                        document.getElementById("baidu").innerText = l.join("\n");
                    });
                break;
            case "deepl":
                if (!api_id.deepl.key) return;
                fetch("https://api-free.deepl.com/v2/translate", {
                    body: `text=${encodeURIComponent(text)}&target_lang=${to}`,
                    headers: {
                        Authorization: `DeepL-Auth-Key ${api_id.deepl.key}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    method: "POST",
                })
                    .then((v) => v.json())
                    .then((t) => {
                        let l = t.translations.map((x) => x.text);
                        document.getElementById("deepl").innerText = l.join("\n");
                    });
                break;
            case "caiyun":
                if (!api_id.caiyun.token) return;
                let url = "http://api.interpreter.caiyunai.com/v1/translator";
                let token = api_id.caiyun.token;
                let payload = {
                    source: text.split("\n"),
                    trans_type: "auto2zh",
                    request_id: "demo",
                    detect: true,
                };
                let headers = {
                    "content-type": "application/json",
                    "x-authorization": "token " + token,
                };
                fetch(url, { method: "POST", body: JSON.stringify(payload), headers })
                    .then((v) => v.json())
                    .then((t) => {
                        console.log(t);
                        document.getElementById("caiyun").innerText = t.target.join("\n");
                    });
                break;
            case "bing":
                if (!api_id.bing.key) return;
                fetch(
                    `https://api.cognitive.microsofttranslator.com/translate?${new URLSearchParams({
                        "api-version": "3.0",
                        from: "en",
                        to: "cn",
                    }).toString()}`,
                    {
                        method: "POST",
                        headers: {
                            "Ocp-Apim-Subscription-Key": api_id.bing.key,
                            "Content-type": "application/json",
                            "X-ClientTraceId": crypto.randomUUID(),
                        },
                        body: JSON.stringify([
                            {
                                text: text,
                            },
                        ]),
                    }
                )
                    .then((v) => v.json())
                    .then((t) => {
                        document.getElementById("bing").innerText = t[0].translations[0].text;
                    });
                break;

            default:
                break;
        }
    });
}

import MD5 from "blueimp-md5";
