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

const setting = document.getElementById("设置");
document.getElementById("exit_setting").onclick = () => {
    setting.classList.add("setting_hide");
};
document.getElementById("show_setting").onclick = () => {
    setting.classList.remove("setting_hide");
};

document.querySelector("textarea").value = text || "";

document.querySelector("textarea").oninput = () => {
    text = document.querySelector("textarea").value;
    translate(text);
};

var language = "zh_hans";

let o = {
    youdao: { t: "有道", lan: {} },
    baidu: {
        t: "百度",
        lan: {
            auto: "auto",
            zh_hans: "zh",
            zh_hant: "cht",
            en: "en",
            yue: "yue",
            wyw: "wyw",
            jp: "jp",
            ko_kr: "kor",
            fr: "fra",
            es: "spa",
            th: "th",
            ar: "ara",
            ru: "ru",
            pt: "pt",
            de: "de",
            it: "it",
            el: "el",
            nl: "nl",
            pl: "pl",
            bg: "bul",
            et: "est",
            da: "dan",
            fi: "fin",
            cs: "cs",
            ro: "rom",
            sl: "slo",
            sv: "swe",
            hu: "hu",
            vi: "vie",
        },
    },
    deepl: { t: "Deepl", lan: {} },
    caiyun: {
        t: "彩云",
        lan: {
            auto: "auto",
            zh_hans: "zh",
            en: "en",
            jp: "ja",
        },
    },
    bing: { t: "必应", lan: {} },
};

const lan = {
    auto: { zh_hans: "自动" },
    zh_hans: { zh_hans: "简体中文" },
    zh_hant: { zh_hans: "繁体中文" },
    en: { zh_hans: "英语" },
    yue: { zh_hans: "粤语" },
    wyw: { zh_hans: "文言文" },
    jp: { zh_hans: "日语" },
    ko_kr: { zh_hans: "韩语" },
    fr: { zh_hans: "法语" },
    es: { zh_hans: "西班牙语" },
    th: { zh_hans: "泰语" },
    ar: { zh_hans: "阿拉伯语" },
    ru: { zh_hans: "俄语" },
    pt: { zh_hans: "葡萄牙语" },
    de: { zh_hans: "德语" },
    it: { zh_hans: "意大利语" },
    el: { zh_hans: "希腊语" },
    nl: { zh_hans: "荷兰语" },
    pl: { zh_hans: "波兰语" },
    bg: { zh_hans: "保加利亚语" },
    et: { zh_hans: "爱沙尼亚语" },
    da: { zh_hans: "丹麦语" },
    fi: { zh_hans: "芬兰语" },
    cs: { zh_hans: "捷克语" },
    ro: { zh_hans: "罗马尼亚语" },
    sl: { zh_hans: "斯洛文尼亚语" },
    sv: { zh_hans: "瑞典语" },
    hu: { zh_hans: "匈牙利语" },
    vi: { zh_hans: "越南语" },
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
        t.from.value = i.from;
        t.to.value = i.to;
    }
}

function get_tree(pel: HTMLElement) {
    let l = [] as item_type[];
    if (pel.querySelector(":scope > e-translator")) {
        pel.querySelectorAll(":scope > e-translator").forEach((el: item) => {
            l.push({ e: el.e, from: "", to: "", id: el.id, children: el.子翻译器 });
        });
    }
    return l;
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

        this.more = document.createElement("div");
        this.more.classList.add("e-select-more");
        this.more.innerHTML = this.innerHTML;

        this.show = document.createElement("div");
        this.show.classList.add("e-select-show");
        this.load();
        shadow.append(this.show);
        shadow.append(this.more);

        this.more.classList.add("e-select-hide");

        this.show.onclick = () => {
            this.more.classList.toggle("e-select-hide");
        };

        this.tabIndex = 0;
        this.onblur = () => {
            this.more.classList.add("e-select-hide");
        };
    }

    load() {
        this.more.innerHTML = this.innerHTML;

        if (this.more.querySelector(":scope > *")) {
            this.show.innerHTML = this.more.querySelector(":scope > *").innerHTML;
            this.more.querySelector(":scope > *").classList.add("e-select-selected");
        }

        this.more.querySelectorAll(":scope > *").forEach((el: HTMLElement) => {
            el.onclick = () => {
                this.show.innerHTML = el.innerHTML;
                this.more.querySelectorAll(".e-select-selected").forEach((i) => {
                    i.classList.remove("e-select-selected");
                });
                el.classList.add("e-select-selected");
                let value = el.getAttribute("value") || el.innerText;
                this._value = value;
                this.more.classList.add("e-select-hide");
                this.dispatchEvent(new Event("input"));
            };
        });
    }
    set value(t: string) {
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

        for (let i in o) {
            let op = document.createElement("option");
            op.innerText = o[i].t;
            op.value = i;
            this.t.append(op);
        }

        this.reload_lan();
        this.t.oninput = () => {
            this.reload_lan();
        };

        this.set_zt("n");

        this.append(main);
        main.append(bar);
        bar.append(this.zt, this.t, this.from, this.to);

        this.from.oninput = () => {
            this.check_from(this.from.value);
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
            t.id = "x";
            this.after(t);
            t.e = this.t.value;
            t.from_lan = this.from.value;
        };
        add_c.onclick = () => {
            let t = document.createElement("e-translator") as item;
            t.id = "x";
            this.c.append(t);
            t.e = this.t.value;
            t.from_lan = this.to.value;
        };
        rm.onclick = () => {
            if (document.querySelectorAll("e-translator").length > 1) this.remove();
        };
    }

    reload_lan() {
        if (this.t.value) {
            const from_lan = this.from.value;
            this.from.innerHTML = "";
            this.from.load();
            this.to.innerHTML = "";
            this.to.load();
            for (let i in o[this.t.value].lan) {
                let o = document.createElement("option");
                o.value = i;
                o.innerText = lan[i][language];
                this.from.append(o);
                this.from.load();
                if (i != "auto") {
                    this.to.append(o.cloneNode(true));
                    this.to.load();
                }
            }
            this.from_lan = from_lan;
        }
    }

    set_zt(type: "e" | "w" | "o" | "n", text?: string) {
        this.zt.classList.remove("zt_normal");
        this.zt.classList.remove("zt_waring");
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
            case "w":
                this.zt.classList.add("zt_waring");
                break;
            default:
                break;
        }
    }

    set from_lan(t: string) {
        let has_lan = false;
        for (let i in o[this.t.value].lan) {
            if (i == t) {
                has_lan = true;
                this.from.value = t;
                break;
            }
        }
        if (!has_lan) {
            this.set_zt("w");
        }
        this.check_from(t);
    }

    check_from(t: string) {
        if (
            this.parentElement != document.getElementById("translators") &&
            t != "auto" &&
            t != (this.parentElement.parentElement as item).to.value
        ) {
            this.set_zt("w");
        } else {
            this.set_zt("n");
        }
    }

    set text(t: string) {
        let lans = o[this.t.value].lan;
        engine(this.t.value, t, lans[this.from.value], lans[this.to.value])
            .then((v) => {
                console.log(v);
                this.c.querySelectorAll(":scope > e-translator").forEach((el: item) => {
                    el.text = v;
                });
                this.set_zt("o");
            })
            .catch((e) => {
                this.set_zt("e");
            });
    }

    set e(t: string) {
        this.t.value = t;
        this.reload_lan();
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

function translate(text: string) {
    for (let i of tree) {
        get_item(i.id).text = text;
    }
}

render_tree(tree, document.getElementById("translators"));

translate(text);

function engine(e: string, text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
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
                    })
                    .catch(rj);
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
                    )}&from=${from}&to=${to}&appid=${appid}&salt=${salt}&sign=${sign}`
                )
                    .then((v) => v.json())
                    .then((t) => {
                        let l = t.trans_result.map((v) => v.dst);
                        re(l.join("\n"));
                    })
                    .catch(rj);
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
                        re(l.join("\n"));
                    })
                    .catch(rj);
                break;
            case "caiyun":
                if (!api_id.caiyun.token) return;
                let url = "http://api.interpreter.caiyunai.com/v1/translator";
                let token = api_id.caiyun.token;
                let payload = {
                    source: text.split("\n"),
                    trans_type: `${from}2${to}`,
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
                        re(t.target.join("\n"));
                    })
                    .catch(rj);
                break;
            case "bing":
                if (!api_id.bing.key) return;
                fetch(
                    `https://api.cognitive.microsofttranslator.com/translate?${new URLSearchParams({
                        "api-version": "3.0",
                        from: from,
                        to: to,
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
                        re(t[0].translations[0].text);
                    })
                    .catch(rj);
                break;

            default:
                break;
        }
    });
}

import MD5 from "blueimp-md5";
