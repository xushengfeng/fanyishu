import "../css/css.css";

const s = new URLSearchParams(decodeURIComponent(location.search));

var text = s.get("text") || "";
var fl = s.get("from") || "";
var tl = s.get("to") || "";

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

document.querySelector("textarea").value = text || "";

document.querySelector("textarea").oninput = () => {
    text = document.querySelector("textarea").value;
    translate(text, fl, tl);
};

translate(text, fl, tl);

let o = {
    youdao: { t: "有道", f: youdao },
    baidu: { t: "百度", f: baidu },
    deepl: { t: "Deepl", f: deepl },
    caiyun: { t: "彩云", f: caiyun },
    bing: { t: "必应", f: bing },
};

class item extends HTMLElement {
    constructor() {
        super();
    }

    _value = "";
    t: HTMLElement;
    from: HTMLElement;
    to: HTMLElement;

    connectedCallback() {
        var bar = document.createElement("div");
        this.t = document.createElement("div");
        this.from = document.createElement("div");
        this.to = document.createElement("div");
        this.append(bar);
        bar.append(this.t, this.from, this.to);

        let t_list = document.createElement("select");
        for (let i in o) {
            let op = document.createElement("option");
            op.innerText = o[i].t;
            op.value = i;
            t_list.append(op);
        }
        this.t.append(t_list);
    }

    set text(t: string) {
        let f = o[this.t.querySelector("select").value].f;
        f(t, "", "");
    }
}

window.customElements.define("e-translator", item);

function translate(text: string, from: string, to: string) {
    baidu(text, from, to);
    // youdao(text, from, to);
    caiyun(text, from, to);
}

function youdao(text: string, from: string, to: string) {
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
            document.getElementById("youdao").innerText = l.join("\n");
        });
}

function baidu(text: string, from: string, to: string) {
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
}

import MD5 from "blueimp-md5";

function deepl(text: string, from: string, to: string) {
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
}

function caiyun(text: string, from: string, to: string) {
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
}

function bing(text: string, from: string, to: string) {
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
}
