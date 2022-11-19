import "../css/css.css";
import CryptoJS from "crypto-js";
import fetchJSONP from "fetch-jsonp";

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
    api_id = t_api_id;
} else {
    api_id = Object.assign(t_api_id, api_id);
    localStorage.setItem("fanyi", JSON.stringify(api_id));
}
function get_v(id: string) {
    return document.getElementById(id) as HTMLInputElement;
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

const delay_el = document.getElementById("延时") as HTMLInputElement;

function load_setting() {
    load_trees();
    get_v("baidu_appid").value = api_id.baidu.appid;
    get_v("baidu_key").value = api_id.baidu.key;
    get_v("youdao_appid").value = api_id.youdao.appid;
    get_v("youdao_key").value = api_id.youdao.key;
    get_v("deepl_key").value = api_id.deepl.key;
    get_v("caiyun_key").value = api_id.caiyun.token;
    get_v("bing_key").value = api_id.bing.key;
    delay_el.value = localStorage.getItem("delay") || "1";
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

var language = "zh-Hans";

let o: { [lan: string]: { t: string; lan: string[]; target_lang?: string[]; lan2lan: object; icon: string } } = {
    youdao: {
        t: "有道",
        icon: youdao_svg,
        lan: [
            "auto",
            "zh-Hans",
            "zh-Hant",
            "en",
            "ja",
            "ko-Kr",
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
            "sr-Cyrl",
            "sr-Latn",
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
            "zh-Hans": "zh-CHS",
            "zh-Hant": "zh-CHT",
            "ko-Kr": "ko",
        },
    },
    baidu: {
        t: "百度",
        icon: baidu_svg,
        lan: [
            "auto",
            "zh-Hans",
            "zh-Hant",
            "en",
            "yue",
            "lzh",
            "ja",
            "ko-Kr",
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
            "zh-Hans": "zh",
            "zh-Hant": "cht",
            "ko-Kr": "kor",
            lzh: "wyw",
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
    deepl: {
        t: "Deepl",
        icon: deepl_svg,
        lan: [
            "auto",
            "bg",
            "cs",
            "da",
            "de",
            "el",
            "en",
            "es",
            "et",
            "fi",
            "fr",
            "hu",
            "id",
            "it",
            "ja",
            "lt",
            "lv",
            "nl",
            "pl",
            "pt",
            "ro",
            "ru",
            "sk",
            "sl",
            "sv",
            "tr",
            "uk",
            "zh",
        ],
        target_lang: [
            "bg",
            "cs",
            "da",
            "de",
            "el",
            "en",
            "en-Gb",
            "en-Us",
            "es",
            "et",
            "fi",
            "fr",
            "hu",
            "id",
            "it",
            "ja",
            "lt",
            "lv",
            "nl",
            "pl",
            "pt",
            "pt-Br",
            "pt-PT",
            "ro",
            "ru",
            "sk",
            "sl",
            "sv",
            "tr",
            "uk",
            "zh",
        ],
        lan2lan: {
            auto: "",
            bg: "BG",
            cs: "CS",
            da: "DA",
            de: "DE",
            el: "EL",
            en: "EN",
            "en-Gb": "EN-GB",
            "en-Us": "EN-US",
            es: "ES",
            et: "ET",
            fi: "FI",
            fr: "FR",
            hu: "HU",
            id: "ID",
            it: "IT",
            ja: "JA",
            lt: "LT",
            lv: "LV",
            nl: "NL",
            pl: "PL",
            pt: "PT",
            "pt-Br": "PT-BR",
            "pt-PT": "PT-PT",
            ro: "RO",
            ru: "RU",
            sk: "SK",
            sl: "SL",
            sv: "SV",
            tr: "TR",
            uk: "UK",
            zh: "ZH",
        },
    },
    caiyun: {
        t: "彩云",
        icon: caiyun_svg,
        lan: ["auto", "zh", "en", "ja"],
        lan2lan: {},
    },
    bing: {
        t: "必应",
        icon: bing_svg,
        lan: [
            "af",
            "am",
            "ar",
            "as",
            "az",
            "ba",
            "bg",
            "bn",
            "bo",
            "bs",
            "ca",
            "cs",
            "cy",
            "da",
            "de",
            "dv",
            "el",
            "en",
            "es",
            "et",
            "eu",
            "fa",
            "fi",
            "fil",
            "fj",
            "fo",
            "fr",
            "fr-CA",
            "ga",
            "gl",
            "gu",
            "he",
            "hi",
            "hr",
            "hsb",
            "ht",
            "hu",
            "hy",
            "id",
            "ikt",
            "is",
            "it",
            "iu",
            "iu-Latn",
            "ja",
            "ka",
            "kk",
            "km",
            "kmr",
            "kn",
            "ko",
            "ku",
            "ky",
            "lo",
            "lt",
            "lv",
            "lzh",
            "mg",
            "mi",
            "mk",
            "ml",
            "mn-Cyrl",
            "mn-Mong",
            "mr",
            "ms",
            "mt",
            "mww",
            "my",
            "nb",
            "ne",
            "nl",
            "or",
            "otq",
            "pa",
            "pl",
            "prs",
            "ps",
            "pt",
            "pt-PT",
            "ro",
            "ru",
            "sk",
            "sl",
            "sm",
            "so",
            "sq",
            "sr-Cyrl",
            "sr-Latn",
            "sv",
            "sw",
            "ta",
            "te",
            "th",
            "ti",
            "tk",
            "tlh-Latn",
            "tlh-Piqd",
            "to",
            "tr",
            "tt",
            "ty",
            "ug",
            "uk",
            "ur",
            "uz",
            "vi",
            "yua",
            "yue",
            "zh-Hans",
            "zh-Hant",
            "zu",
        ],
        lan2lan: {},
    },
};

function to_e_lan(lan: string, e: string) {
    return o[e].lan2lan[lan] || lan;
}

const lan = {
    auto: { "zh-Hans": "自动" },
    zh: { "zh-Hans": "中文" },
    "zh-Hans": { "zh-Hans": "简体中文" },
    "zh-Hant": { "zh-Hans": "繁体中文" },
    en: { "zh-Hans": "英语" },
    "en-Gb": { "zh-Hans": "英语（英国）" },
    "en-Us": { "zh-Hans": "英语（美国）" },
    yue: { "zh-Hans": "粤语" },
    lzh: { "zh-Hans": "文言文" },
    as: { "zh-Hans": "阿萨姆语" },
    ba: { "zh-Hans": "巴什基尔语" },
    bo: { "zh-Hans": "藏语" },
    dv: { "zh-Hans": "迪维希语" },
    fil: { "zh-Hans": "菲律宾语" },
    fo: { "zh-Hans": "法罗语" },
    "fr-CA": { "zh-Hans": "法语 (加拿大)" },
    hsb: { "zh-Hans": "上索布语" },
    ikt: { "zh-Hans": "Inuinnaqtun" },
    iu: { "zh-Hans": "因纽特语" },
    "iu-Latn": { "zh-Hans": "Inuktitut (Latin)" },
    kmr: { "zh-Hans": "库尔德语 (北)" },
    ko: { "zh-Hans": "韩语" },
    "mn-Cyrl": { "zh-Hans": "西里尔蒙古文" },
    "mn-Mong": { "zh-Hans": "传统蒙文" },
    nb: { "zh-Hans": "书面挪威语" },
    or: { "zh-Hans": "奥里亚语" },
    prs: { "zh-Hans": "达里语" },
    ti: { "zh-Hans": "提格利尼亚语" },
    tk: { "zh-Hans": "土库曼语" },
    "tlh-Latn": { "zh-Hans": "克林贡语 (拉丁文)" },
    "tlh-Piqd": { "zh-Hans": "克林贡语 (pIqaD)" },
    tt: { "zh-Hans": "鞑靼语" },
    ug: { "zh-Hans": "维吾尔语" },
    ja: { "zh-Hans": "日语" },
    "ko-Kr": { "zh-Hans": "韩语" },
    fr: { "zh-Hans": "法语" },
    es: { "zh-Hans": "西班牙语" },
    th: { "zh-Hans": "泰语" },
    ar: { "zh-Hans": "阿拉伯语" },
    ru: { "zh-Hans": "俄语" },
    pt: { "zh-Hans": "葡萄牙语" },
    "pt-Br": { "zh-Hans": "葡萄牙语（巴西）" },
    "pt-PT": { "zh-Hans": "葡萄牙语（不包括巴西葡萄牙语）" },
    de: { "zh-Hans": "德语" },
    it: { "zh-Hans": "意大利语" },
    el: { "zh-Hans": "希腊语" },
    nl: { "zh-Hans": "荷兰语" },
    pl: { "zh-Hans": "波兰语" },
    bg: { "zh-Hans": "保加利亚语" },
    et: { "zh-Hans": "爱沙尼亚语" },
    da: { "zh-Hans": "丹麦语" },
    fi: { "zh-Hans": "芬兰语" },
    cs: { "zh-Hans": "捷克语" },
    ro: { "zh-Hans": "罗马尼亚语" },
    sl: { "zh-Hans": "斯洛文尼亚语" },
    sv: { "zh-Hans": "瑞典语" },
    hu: { "zh-Hans": "匈牙利语" },
    vi: { "zh-Hans": "越南语" },
    id: { "zh-Hans": "印尼文" },
    af: { "zh-Hans": "南非荷兰语" },
    bs: { "zh-Hans": "波斯尼亚语" },
    ca: { "zh-Hans": "加泰隆语" },
    hr: { "zh-Hans": "克罗地亚语" },
    fj: { "zh-Hans": "斐济语" },
    ht: { "zh-Hans": "海地克里奥尔语" },
    he: { "zh-Hans": "希伯来语" },
    hi: { "zh-Hans": "印地语" },
    mww: { "zh-Hans": "白苗语" },
    sw: { "zh-Hans": "斯瓦希里语" },
    tlh: { "zh-Hans": "克林贡语" },
    lv: { "zh-Hans": "拉脱维亚语" },
    lt: { "zh-Hans": "立陶宛语" },
    ms: { "zh-Hans": "马来语" },
    mt: { "zh-Hans": "马耳他语" },
    no: { "zh-Hans": "挪威语" },
    fa: { "zh-Hans": "波斯语" },
    otq: { "zh-Hans": "克雷塔罗奥托米语" },
    "sr-Cyrl": { "zh-Hans": "塞尔维亚语(西里尔文)" },
    "sr-Latn": { "zh-Hans": "塞尔维亚语(拉丁文)" },
    sk: { "zh-Hans": "斯洛伐克语" },
    ty: { "zh-Hans": "塔希提语" },
    to: { "zh-Hans": "汤加语" },
    tr: { "zh-Hans": "土耳其语" },
    uk: { "zh-Hans": "乌克兰语" },
    ur: { "zh-Hans": "乌尔都语" },
    cy: { "zh-Hans": "威尔士语" },
    yua: { "zh-Hans": "尤卡坦玛雅语" },
    sq: { "zh-Hans": "阿尔巴尼亚语" },
    am: { "zh-Hans": "阿姆哈拉语" },
    hy: { "zh-Hans": "亚美尼亚语" },
    az: { "zh-Hans": "阿塞拜疆语" },
    bn: { "zh-Hans": "孟加拉语" },
    eu: { "zh-Hans": "巴斯克语" },
    be: { "zh-Hans": "白俄罗斯语" },
    ceb: { "zh-Hans": "宿务语" },
    co: { "zh-Hans": "科西嘉语" },
    eo: { "zh-Hans": "世界语" },
    tl: { "zh-Hans": "菲律宾语" },
    fy: { "zh-Hans": "弗里西语" },
    gl: { "zh-Hans": "加利西亚语" },
    ka: { "zh-Hans": "格鲁吉亚语" },
    gu: { "zh-Hans": "古吉拉特语" },
    ha: { "zh-Hans": "豪萨语" },
    haw: { "zh-Hans": "夏威夷语" },
    is: { "zh-Hans": "冰岛语" },
    ig: { "zh-Hans": "伊博语" },
    ga: { "zh-Hans": "爱尔兰语" },
    jw: { "zh-Hans": "爪哇语" },
    kn: { "zh-Hans": "卡纳达语" },
    kk: { "zh-Hans": "哈萨克语" },
    km: { "zh-Hans": "高棉语" },
    ku: { "zh-Hans": "库尔德语" },
    ky: { "zh-Hans": "柯尔克孜语" },
    lo: { "zh-Hans": "老挝语" },
    la: { "zh-Hans": "拉丁语" },
    lb: { "zh-Hans": "卢森堡语" },
    mk: { "zh-Hans": "马其顿语" },
    mg: { "zh-Hans": "马尔加什语" },
    ml: { "zh-Hans": "马拉雅拉姆语" },
    mi: { "zh-Hans": "毛利语" },
    mr: { "zh-Hans": "马拉地语" },
    mn: { "zh-Hans": "蒙古语" },
    my: { "zh-Hans": "缅甸语" },
    ne: { "zh-Hans": "尼泊尔语" },
    ny: { "zh-Hans": "齐切瓦语" },
    ps: { "zh-Hans": "普什图语" },
    pa: { "zh-Hans": "旁遮普语" },
    sm: { "zh-Hans": "萨摩亚语" },
    gd: { "zh-Hans": "苏格兰盖尔语" },
    st: { "zh-Hans": "塞索托语" },
    sn: { "zh-Hans": "修纳语" },
    sd: { "zh-Hans": "信德语" },
    si: { "zh-Hans": "僧伽罗语" },
    so: { "zh-Hans": "索马里语" },
    su: { "zh-Hans": "巽他语" },
    tg: { "zh-Hans": "塔吉克语" },
    ta: { "zh-Hans": "泰米尔语" },
    te: { "zh-Hans": "泰卢固语" },
    uz: { "zh-Hans": "乌兹别克语" },
    xh: { "zh-Hans": "南非科萨语" },
    yi: { "zh-Hans": "意第绪语" },
    yo: { "zh-Hans": "约鲁巴语" },
    zu: { "zh-Hans": "南非祖鲁语" },
} as { [lan: string]: { "zh-Hans": string } };

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

        for (let i in o) {
            let op = document.createElement("div");
            op.innerHTML = `<img src="${o[i].icon}" style="width:1.4em">`;
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
                if (!lan[i]) {
                    console.log(i);
                    continue;
                }

                o.innerText = lan[i][language];
                this.from.append(o);
                this.from.load();
            }
            for (let i of o[this.t.value].target_lang || o[this.t.value].lan) {
                let o = document.createElement("option");
                o.value = i;
                o.innerText = lan[i][language];
                if (i != "auto") {
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
        for (let i in o[this.t.value].lan) {
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
        engine(e, t, to_e_lan(this.from.value, e), to_e_lan(this.to.value, e))
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

function engine(e: string, text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
        switch (e) {
            case "youdao":
                youdao(text, from, to).then(re).catch(rj);
                break;
            case "baidu":
                baidu(text, from, to).then(re).catch(rj);
                break;
            case "deepl":
                deepl(text, from, to).then(re).catch(rj);
                break;
            case "caiyun":
                caiyun(text, from, to).then(re).catch(rj);
                break;
            case "bing":
                bing(text, from, to).then(re).catch(rj);
                break;
            default:
                rj(() => {
                    console.error("引擎不存在");
                });
                break;
        }
    });
}

import MD5 from "blueimp-md5";

function baidu(text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
        if (!api_id.baidu.appid || !api_id.baidu.key) return;
        let appid = api_id.baidu.appid;
        let key = api_id.baidu.key;
        let salt = new Date().getTime();
        let str1 = appid + text + salt + key;
        let sign = MD5(str1);
        fetchJSONP(
            `https://api.fanyi.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(
                text
            )}&from=${from}&to=${to}&appid=${appid}&salt=${salt}&sign=${sign}`
        )
            .then((v) => v.json())
            .then((t) => {
                let l = t.trans_result.map((v) => v.dst);
                re(l.join("\n"));
            })
            .catch(rj);
    });
}

function youdao(text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
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
    });
}

function deepl(text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
        if (!api_id.deepl.key) return;
        fetch("https://api-free.deepl.com/v2/translate", {
            body: `text=${encodeURIComponent(text)}${from ? "&source_lang=" + from : ""}&target_lang=${to}`,
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
    });
}

function caiyun(text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
        if (!api_id.caiyun.token) return;
        let url = "https://api.interpreter.caiyunai.com/v1/translator";
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
    });
}

function bing(text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
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
    });
}
