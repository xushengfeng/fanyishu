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

let engine_config: {
    [name: string]: {
        t: string;
        key: { name: string; text?: string }[];
        help?: { text: string; src: string };
        lan: string[];
        target_lang?: string[];
        lan2lan: object;
        icon: string;
        f: (text: string, from: string, to: string) => Promise<string>;
    };
} = {
    youdao: {
        t: "有道",
        icon: youdao_svg,
        key: [{ name: "appid" }, { name: "key" }],
        help: { text: "有道api申请", src: "https://ai.youdao.com/product-fanyi-text.s" },
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
        f: youdao,
    },
    baidu: {
        t: "百度",
        icon: baidu_svg,
        key: [{ name: "appid" }, { name: "key" }],
        help: { text: "百度api申请", src: "https://fanyi-api.baidu.com/product/11" },
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
        f: baidu,
    },
    deepl: {
        t: "Deepl",
        icon: deepl_svg,
        key: [{ name: "key" }],
        help: { text: "Deepl api申请", src: "https://www.deepl.com/pro-api?cta=header-pro-api" },
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
        f: deepl,
    },
    deeplx: {
        t: "DeeplX",
        icon: deepl_svg,
        key: [{ name: "url" }],
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
        f: deeplx,
    },
    caiyun: {
        t: "彩云",
        icon: caiyun_svg,
        key: [{ name: "token" }],
        help: { text: "彩云api申请", src: "https://docs.caiyunapp.com/blog/2018/09/03/lingocloud-api/" },
        lan: ["auto", "zh", "en", "ja"],
        lan2lan: {},
        f: caiyun,
    },
    bing: {
        t: "必应",
        icon: bing_svg,
        key: [{ name: "key" }],
        help: {
            text: "必应api申请",
            src: "https://learn.microsoft.com/zh-cn/azure/cognitive-services/translator/how-to-create-translator-resource#authentication-keys-and-endpoint-url",
        },
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
        f: bing,
    },
    chatgpt: {
        t: "chatgpt",
        icon: chatgpt_svg,
        key: [{ name: "key" }],
        help: { text: "chatgpt api申请", src: "https://platform.openai.com/account/api-keys" },
        lan: ["auto"],
        lan2lan: {},
        target_lang: ["zh-Hans", "zh-Hant", "en", "ja", "es", "ru", "de", "ko"],
        f: chatgpt,
    },
    niu: {
        t: "小牛翻译",
        icon: niu_svg,
        key: [{ name: "key" }],
        help: { text: "小牛api申请", src: "https://niutrans.com/documents/contents/beginning_guide/6" },
        lan: [
            "sq",
            "ar",
            "am",
            "az",
            "ga",
            "et",
            "or",
            "ba",
            "eu",
            "be",
            "mww",
            "bg",
            "is",
            "pl",
            "bs",
            "fa",
            "tt",
            "da",
            "de",
            "dv",
            "ru",
            "fr",
            "fo",
            "fil",
            "fj",
            "fi",
            "km",
            "fy",
            "gu",
            "ka",
            "kk",
            "ht",
            "ko",
            "ha",
            "nl",
            "ky",
            "gl",
            "ca",
            "cs",
            "kn",
            "co",
            "otq",
            "hr",
            "ku",
            "la",
            "lv",
            "lo",
            "lt",
            "lb",
            "ro",
            "mg",
            "mt",
            "mr",
            "ml",
            "ms",
            "mk",
            "mi",
            "mn",
            "my",
            "bn",
            "af",
            "xh",
            "zu",
            "ne",
            "no",
            "pa",
            "pt",
            "ps",
            "ny",
            "ja",
            "sv",
            "sm",
            "st",
            "si",
            "eo",
            "sk",
            "sl",
            "sw",
            "gd",
            "so",
            "tg",
            "ty",
            "te",
            "ta",
            "th",
            "to",
            "tr",
            "tk",
            "ur",
            "uk",
            "uz",
            "cy",
            "es",
            "he",
            "el",
            "haw",
            "sd",
            "hu",
            "sn",
            "ceb",
            "hy",
            "ig",
            "it",
            "yi",
            "hi",
            "su",
            "id",
            "en",
            "yua",
            "yo",
            "vi",
            "yue",
            "ti",
            "zh",
        ],
        lan2lan: {
            "zh-Hant": "cht",
            // ["acu","agr","ake","amu","ee","ojb","om","os","ifb","aym","knj","ify","acr","amk","bdu","adh","any","cpb","efi","ach","ish","bin","tpi","bsn","ber","bi","bem","pot","br","poh","bam","map","bba","bus","bqp","bnp","bch","bno","bqj","bdh","ptu","bfa","cbl","gbo","bas","bum","pag","bci","bhw","btx","pon","bzj","gug","cha","cv","tn","ts","che","ccp","cdf","tsc","tet","dik","dyu","tbz","mps","tih","duo","ada","dua","tdt","dhv","tiv","djk","enx","nzi","nij","nyn","ndc","ndo","cfm","gur","kea","quw","kg","jy","gub","gof","xsm","krs","guw","swc","gym","me","cnh","hui","hlb","her","quc","gbi","gil","kac","gaa","kik","kmb","cab","kab","cjp","cak","kek","cni","cop","kbh","ckb","ksd","quz","kpg","crh","xal","kbo","keo","cki","pss","kle","qxr","rar","kbp","kam","kqn","wes","rw","rn","ln","lg","dop","rmn","ngl","rug","lsi","ond","loz","lua","lub","lun","rnd","lue","gv","mhr","mam","mo","mni","meu","mah","mrw","mdy","mad","mos","muv","lus","mfe","umb","arn","nhg","azb","quh","lnd","fuv","nop","ntm","nyy","niu","nia","nba","nyu","nav","nyk","pcm","pap","pck","ata","pis","tw","chr","chq","cas","cjk","cce","chk","sr","crs","sg","mrj","jiv","swp","ssx","spy","huv","jmc","srm","sxn","seh","kwy","sop","tzo","tig","tmh","tpm","ctd","tyv","iou","tex","lcm","teo","tvl","tll","tgl","tum","toj","ttj","wal","war","ve","wol","udm","ppk","usp","wlx","prk","wsk","wrs","vun","wls","urh","mau","guc","shi","syc","hwc","hmo","lcp","sid","mbb","shp","ssd","gnw","kyu","hil","jac","ace","jv","ikk","izz","pil","jae","yon","zyb","byr","iso","iba","ilo","ibg","yap","cht","dz","ifa","czt","dtp","bcl","tzh","zne"]
        },
        f: niu,
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
    return engine_config[e].lan2lan[lan] || lan;
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

    reload_lan() {
        if (this.t.value) {
            const from_lan = this.from.value;
            this.from.innerHTML = "";
            this.from.load();
            this.to.innerHTML = "";
            this.to.load();
            let xLan = engine_config[this.t.value].lan.map((i) => lan(i));
            xLan.sort(new Intl.Collator(navigator.language).compare);
            let xTLan: string[] = null;
            if (engine_config[this.t.value].target_lang) {
                xTLan = engine_config[this.t.value].target_lang.map((i) => lan(i));
                xTLan.sort(new Intl.Collator(navigator.language).compare);
            }
            for (let i of xLan) {
                let o = document.createElement("option");
                o.value = i;
                o.innerText = i;
                this.from.append(o);
                this.from.load();
            }
            for (let i of xTLan || xLan) {
                let o = document.createElement("option");
                o.value = i;
                o.innerText = i;
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
        for (let i in engine_config[this.t.value].lan) {
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

function engine(e: string, text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
        if (engine_config[e]) {
            engine_config[e].f(text, from, to).then(re).catch(rj);
        } else {
            rj(() => {
                console.error("引擎不存在");
            });
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
function deeplx(text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
        if (!api_id.deeplx.url) return;
        fetch(api_id.deeplx.url, {
            body: JSON.stringify({
                source_lang: from,
                target_lang: to,
                text: text,
            }),
            method: "POST",
        })
            .then((v) => v.json())
            .then((t) => {
                re(t.data);
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

function chatgpt(text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
        if (!api_id.chatgpt.key) return;
        let systemPrompt = "You are a translation engine that can only translate text and cannot interpret it.";
        let userPrompt = `翻译成${lan(to)}:\n\n${text}`;
        fetch(`https://api.openai.com/v1/chat/completions`, {
            method: "POST",
            headers: { Authorization: `Bearer ${api_id.chatgpt.key}`, "content-type": "application/json" },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                temperature: 0,
                max_tokens: 1000,
                top_p: 1,
                frequency_penalty: 1,
                presence_penalty: 1,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
            }),
        })
            .then((v) => v.json())
            .then((t) => {
                re(t.choices[0].message.content);
            })
            .catch(rj);
    });
}

function niu(text: string, from: string, to: string) {
    return new Promise((re: (text: string) => void, rj) => {
        if (!api_id.niu.key) return;
        const data = {
            from: from,
            to: to,
            apikey: api_id.niu.key,
            src_text: text,
        };

        fetch("https://api.niutrans.com/NiuTransServer/translation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((result) => {
                re(result.tgt_text);
            })
            .catch(rj);
    });
}
