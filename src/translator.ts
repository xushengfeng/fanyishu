import "../css/css.css";
import CryptoJS from "crypto-js";
import fetchJSONP from "fetch-jsonp";

const s = new URLSearchParams(decodeURIComponent(location.search));

var text = s.get("text") || "";
var mode = s.get("m") || "默认";

var api_id = JSON.parse(localStorage.getItem("fanyi"));
const t_api_id = {
    youdao: { appid: "", key: "" },
    baidu: { appid: "", key: "" },
    deepl: { key: "" },
    caiyun: { token: "" },
    bing: { key: "" },
};
if (!api_id) {
    localStorage.setItem("fanyi", JSON.stringify(t_api_id));
} else {
    api_id = Object.assign(t_api_id, api_id);
    localStorage.setItem("fanyi", JSON.stringify(api_id));
}
function get_v(id: string) {
    return document.getElementById(id) as HTMLInputElement;
}
function load_setting() {
    get_v("baidu_appid").value = api_id.baidu.appid;
    get_v("baidu_key").value = api_id.baidu.key;
    get_v("youdao_appid").value = api_id.youdao.appid;
    get_v("youdao_key").value = api_id.youdao.key;
    get_v("deepl_key").value = api_id.deepl.key;
    get_v("caiyun_key").value = api_id.caiyun.token;
    get_v("bing_key").value = api_id.bing.key;
}
load_setting();

function save_setting() {
    api_id.baidu.appid = get_v("baidu_appid").value;
    api_id.baidu.key = get_v("baidu_key").value;
    api_id.youdao.appid = get_v("youdao_appid").value;
    api_id.youdao.key = get_v("youdao_key").value;
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
    youdao: {
        t: "有道",
        lan: [
            "auto",
            "zh_hans",
            "zh_hant",
            "en",
            "jp",
            "ko_kr",
            "fr",
            "es",
            "pt",
            "it",
            "ru",
            "vi",
            "de",
            "ar",
            "id",
            "af",
            "bs",
            "bg",
            "yue",
            "ca",
            "hr",
            "cs",
            "da",
            "nl",
            "et",
            "fj",
            "fi",
            "el",
            "ht",
            "he",
            "hi",
            "mww",
            "hu",
            "sw",
            "tlh",
            "lv",
            "lt",
            "ms",
            "mt",
            "no",
            "fa",
            "pl",
            "otq",
            "ro",
            "sr_cyrl",
            "sr_latn",
            "sk",
            "sl",
            "sv",
            "ty",
            "th",
            "to",
            "tr",
            "uk",
            "ur",
            "cy",
            "yua",
            "sq",
            "am",
            "hy",
            "az",
            "bn",
            "eu",
            "be",
            "ceb",
            "co",
            "eo",
            "tl",
            "fy",
            "gl",
            "ka",
            "gu",
            "ha",
            "haw",
            "is",
            "ig",
            "ga",
            "jw",
            "kn",
            "kk",
            "km",
            "ku",
            "ky",
            "lo",
            "la",
            "lb",
            "mk",
            "mg",
            "ml",
            "mi",
            "mr",
            "mn",
            "my",
            "ne",
            "ny",
            "ps",
            "pa",
            "sm",
            "gd",
            "st",
            "sn",
            "sd",
            "si",
            "so",
            "su",
            "tg",
            "ta",
            "te",
            "uz",
            "xh",
            "yi",
            "yo",
            "zu",
        ],
        lan2lan: {
            zh_hans: "zh-CHS",
            zh_hant: "zh-CHT",
            jp: "ja",
            ko_kr: "ko",
            sr_cyrl: "sr-Cyrl",
            sr_latn: "sr-Latn",
        },
    },
    baidu: {
        t: "百度",
        lan: [
            "auto",
            "zh_hans",
            "zh_hant",
            "en",
            "yue",
            "wyw",
            "jp",
            "ko_kr",
            "fr",
            "es",
            "th",
            "ar",
            "ru",
            "pt",
            "de",
            "it",
            "el",
            "nl",
            "pl",
            "bg",
            "et",
            "da",
            "fi",
            "cs",
            "ro",
            "sl",
            "sv",
            "hu",
            "vi",
        ],
        lan2lan: {
            zh_hans: "zh",
            zh_hant: "cht",
            jp: "jp",
            ko_kr: "kor",
            fr: "fra",
            es: "spa",
            ar: "ara",
            bg: "bul",
            et: "est",
            da: "dan",
            fi: "fin",
            ro: "rom",
            sl: "slo",
            sv: "swe",
            vi: "vie",
        },
    },
    deepl: { t: "Deepl", lan: [], lan2lan: {} },
    caiyun: {
        t: "彩云",
        lan: ["auto", "zh_hans", "en", "jp"],
        lan2lan: {
            zh_hans: "zh",
            jp: "ja",
        },
    },
    bing: { t: "必应", lan: [], lan2lan: {} },
};

function to_e_lan(lan: string, e: string) {
    return o[e].lan2lan[lan] || lan;
}

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
    id: { zh_hans: "印尼文" },
    af: { zh_hans: "南非荷兰语" },
    bs: { zh_hans: "波斯尼亚语" },
    ca: { zh_hans: "加泰隆语" },
    hr: { zh_hans: "克罗地亚语" },
    fj: { zh_hans: "斐济语" },
    ht: { zh_hans: "海地克里奥尔语" },
    he: { zh_hans: "希伯来语" },
    hi: { zh_hans: "印地语" },
    mww: { zh_hans: "白苗语" },
    sw: { zh_hans: "斯瓦希里语" },
    tlh: { zh_hans: "克林贡语" },
    lv: { zh_hans: "拉脱维亚语" },
    lt: { zh_hans: "立陶宛语" },
    ms: { zh_hans: "马来语" },
    mt: { zh_hans: "马耳他语" },
    no: { zh_hans: "挪威语" },
    fa: { zh_hans: "波斯语" },
    otq: { zh_hans: "克雷塔罗奥托米语" },
    sr_cyrl: { zh_hans: "塞尔维亚语(西里尔文)" },
    sr_latn: { zh_hans: "塞尔维亚语(拉丁文)" },
    sk: { zh_hans: "斯洛伐克语" },
    ty: { zh_hans: "塔希提语" },
    to: { zh_hans: "汤加语" },
    tr: { zh_hans: "土耳其语" },
    uk: { zh_hans: "乌克兰语" },
    ur: { zh_hans: "乌尔都语" },
    cy: { zh_hans: "威尔士语" },
    yua: { zh_hans: "尤卡坦玛雅语" },
    sq: { zh_hans: "阿尔巴尼亚语" },
    am: { zh_hans: "阿姆哈拉语" },
    hy: { zh_hans: "亚美尼亚语" },
    az: { zh_hans: "阿塞拜疆语" },
    bn: { zh_hans: "孟加拉语" },
    eu: { zh_hans: "巴斯克语" },
    be: { zh_hans: "白俄罗斯语" },
    ceb: { zh_hans: "宿务语" },
    co: { zh_hans: "科西嘉语" },
    eo: { zh_hans: "世界语" },
    tl: { zh_hans: "菲律宾语" },
    fy: { zh_hans: "弗里西语" },
    gl: { zh_hans: "加利西亚语" },
    ka: { zh_hans: "格鲁吉亚语" },
    gu: { zh_hans: "古吉拉特语" },
    ha: { zh_hans: "豪萨语" },
    haw: { zh_hans: "夏威夷语" },
    is: { zh_hans: "冰岛语" },
    ig: { zh_hans: "伊博语" },
    ga: { zh_hans: "爱尔兰语" },
    jw: { zh_hans: "爪哇语" },
    kn: { zh_hans: "卡纳达语" },
    kk: { zh_hans: "哈萨克语" },
    km: { zh_hans: "高棉语" },
    ku: { zh_hans: "库尔德语" },
    ky: { zh_hans: "柯尔克孜语" },
    lo: { zh_hans: "老挝语" },
    la: { zh_hans: "拉丁语" },
    lb: { zh_hans: "卢森堡语" },
    mk: { zh_hans: "马其顿语" },
    mg: { zh_hans: "马尔加什语" },
    ml: { zh_hans: "马拉雅拉姆语" },
    mi: { zh_hans: "毛利语" },
    mr: { zh_hans: "马拉地语" },
    mn: { zh_hans: "蒙古语" },
    my: { zh_hans: "缅甸语" },
    ne: { zh_hans: "尼泊尔语" },
    ny: { zh_hans: "齐切瓦语" },
    ps: { zh_hans: "普什图语" },
    pa: { zh_hans: "旁遮普语" },
    sm: { zh_hans: "萨摩亚语" },
    gd: { zh_hans: "苏格兰盖尔语" },
    st: { zh_hans: "塞索托语" },
    sn: { zh_hans: "修纳语" },
    sd: { zh_hans: "信德语" },
    si: { zh_hans: "僧伽罗语" },
    so: { zh_hans: "索马里语" },
    su: { zh_hans: "巽他语" },
    tg: { zh_hans: "塔吉克语" },
    ta: { zh_hans: "泰米尔语" },
    te: { zh_hans: "泰卢固语" },
    uz: { zh_hans: "乌兹别克语" },
    xh: { zh_hans: "南非科萨语" },
    yi: { zh_hans: "意第绪语" },
    yo: { zh_hans: "约鲁巴语" },
    zu: { zh_hans: "南非祖鲁语" },
};

type item_type = { id: string; e: string; from: string; to: string; children?: item_type[] };

let trees: { [id: string]: item_type[] } = JSON.parse(localStorage.getItem("trees"));
if (!trees) {
    trees = { 默认: [{ id: "a", e: "caiyun", from: "cn", to: "en" }] };
}
if (!trees[mode]) mode = "默认";
let tree: item_type[] = trees[mode];

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
            l.push({ e: el.e, from: el.from.value, to: el.to.value, id: el.id, children: el.子翻译器 });
        });
    }
    return l;
}

function tree_change() {
    tree = get_tree(document.getElementById("translators"));
    trees[mode] = tree;
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

        let has_value = null as HTMLElement;
        this.more.querySelectorAll(":scope > *").forEach((el: HTMLElement) => {
            let value = el.getAttribute("value") || el.innerText;
            el.onclick = () => {
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

        for (let i in o) {
            let op = document.createElement("option");
            op.innerText = o[i].t;
            op.value = i;
            this.t.append(op);
        }

        this.reload_lan();
        this.t.oninput = () => {
            this.reload_lan();
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
        bar.append(this.zt, this.t, this.from, this.to);

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
            t.id = "x";
            this.after(t);
            t.e = this.t.value;
            t.from_lan = this.from.value;
            tree_change();
        };
        add_c.onclick = () => {
            let t = document.createElement("e-translator") as item;
            t.id = "x";
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

    reload_lan() {
        if (this.t.value) {
            const from_lan = this.from.value;
            this.from.innerHTML = "";
            this.from.load();
            this.to.innerHTML = "";
            this.to.load();
            for (let i of o[this.t.value].lan) {
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
                break;
            }
        }
        if (!has_lan) {
            this.set_zt("w");
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
            this.set_zt("w");
        } else {
            this.set_zt("n");
        }
    }

    set text(t: string) {
        let e = this.t.value;
        engine(e, t, to_e_lan(this.from.value, e), to_e_lan(this.to.value, e))
            .then((v) => {
                console.log(v);
                this.c.querySelectorAll(":scope > e-translator").forEach((el: item) => {
                    el.text = v;
                });
                this.zt.querySelector("div").innerText = v;
                this.set_zt("o");

                if (!this.c.querySelector("e-translator")) {
                    let div = document.createElement("div");
                    div.innerText = v;
                    text_result.append(div);
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
    text_result.innerHTML = "";
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
                {
                    if (!api_id.youdao.appid || !api_id.youdao.key) return;
                    let appKey = api_id.youdao.appid;
                    let key = api_id.youdao.key;
                    let salt = String(new Date().getTime());
                    let curtime = String(Math.round(new Date().getTime() / 1000));
                    let str1 = appKey + truncate(text) + salt + curtime + key;
                    let sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
                    let data = {
                        q: text,
                        appKey: appKey,
                        salt: salt,
                        from: from,
                        to: to,
                        sign: sign,
                        signType: "v3",
                        curtime: curtime,
                    };
                    fetchJSONP("https://openapi.youdao.com/api?" + new URLSearchParams(data).toString())
                        .then((v) => v.json())
                        .then((t) => {
                            re(t.translation.join("\n"));
                        })
                        .catch(rj);

                    function truncate(q: string) {
                        var len = q.length;
                        if (len <= 20) return q;
                        return q.substring(0, 10) + len + q.substring(len - 10, len);
                    }
                }
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
