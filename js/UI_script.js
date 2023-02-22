
const svg = document.querySelector(".light")
const refresh = document.querySelector(".light > .refresh")
const conteiner = document.querySelector('.conteiner')
//colorID
const [color_main, color_REF] = document.querySelectorAll("#MyGradient > stop")

//power
const power = document.querySelector('.power')
const opaciti = document.querySelector('.opaciti')
const linePower = document.querySelector('.line-power')
const prozPwer = document.querySelector('.line-power > span')
let prozent = 100

let saturation
let ISsaturation = false


let LampOn_OFF = true




function hsvToRgb([h, s, v]) {
    var r, g, b, i, f, p, q, t; h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    s /= 100; v /= 100; if (s == 0) {
        r = g = b = v;
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    h /= 60;
    i = Math.floor(h);
    f = h - i;
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
    switch (i) {
        case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break; case 2: r = p; g = v; b = t; break; case 3: r = p; g = q; b = v; break; case 4: r = t; g = p; b = v; break; default: r = v; g = p; b = q;
    }
    return `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`;
}



function rgbToHsv([r, g, b]) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
        diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(percentRoundFn(s * 100)),
        v: percentRoundFn(v * 100)
    };
}







let JSON_Bady = []

function creatBody(type, instance, value) {
    JSON_Bady.push({
        "type": `devices.capabilities.${type}`,
        "state": {
            "instance": `${instance}`,
            "value": value
        }
    })
}

function setBody() {
    return JSON.stringify({
        "devices": [{
            "id": "5d5ff684-86bf-47c4-8811-36f0253b9709",
            "actions": JSON_Bady
        }]
    })

}



const header = {
    'Access-Control-Allow-Origin': '*',
    "Authorization": 'Bearer y0_AgAAAAAjQiF8AAkY_QAAAADbgvBmqzWIRfE2RwScQTXL5IEvu3S9L6k',
    "Content-Type": "application/json",
}


async function sendApi(url, method, body) {
    JSON_Bady = []
    return respons = await fetch(url, {
        method: method,
        headers: header,
        body: body
    })



}



const setColorOrig = () => color_main.setAttribute('stop-color', color_REF.getAttribute("stop-color"))




svg.addEventListener('click', () => {
    if (svg.classList.contains("on") > 0) {
        svg.classList.add("active")
        creatBody("color_setting", "hsv", rgbToHsv(color_REF.getAttribute('stop-color').replace(/[^0-9,]/g, "").split(",")))
        creatBody("range", "brightness", prozent)

        sendApi("https://api.iot.yandex.net/v1.0/devices/actions", "POST", setBody()).then(el => {
            if (el.ok) {
                svg.classList = ["light"]
                setColorOrig()
            }
            else 
                svg.classList = ["light"]
            

        })
        JSON_Bady = []
    }
})



function setColorOnLamp(color) {
    if (svg.classList.contains('active')) return
    if (color_main.getAttribute('stop-color') != color) {
        svg.classList.add('on')
    } else svg.classList.remove('on')
    color_REF.setAttribute('stop-color', color)

}
function setNamberOnShalu(val) {
    power.style.height = `${val}%`
    prozPwer.innerText = `${val}%`
}

function setSaturation() {
    let a
    if (!ISsaturation) {
        power.style.background = 'rgb(255 255 255)'
        a = prozent

    } else {
        a = rgbToHsv(color_REF.getAttribute('stop-color').replace(/[^0-9,]/g, "").split(","))['s']
        power.style.background = `linear-gradient(180deg, ${color_REF.getAttribute('stop-color')}, rgb(255 255 255))`
    }
    setNamberOnShalu(a)
}


function colorChange() {
    const a = rgbToHsv(color_REF.getAttribute('stop-color').replace(/[^0-9,]/g, "").split(","))
    a['s'] = saturation
    color_REF.setAttribute('stop-color', `rgb(${hsvToRgb(Object.values(a))})`)
}




const panel = document.querySelectorAll('.panel > span')

panel.forEach(el => {
    el.addEventListener('click', (target) => { setColorOnLamp(target.target.style.backgroundColor); setSaturation() })
})

panel.forEach(el => {
    el.addEventListener("contextmenu", () => {
        ISsaturation = !ISsaturation
        setSaturation()


    })
})


function setPower(position) {
    const pr = Math.round((position / 3 - 191) * -1);
    setNamberOnShalu(pr)
    svg.classList.add('on')
    if (ISsaturation) {
        saturation = pr
        colorChange()
    } else prozent = pr

}


let IsMove = false

opaciti.addEventListener('click', el => { if (!IsMove) setPower(el['clientY']) })
linePower.addEventListener("mousedown", () => IsMove = true)
opaciti.addEventListener('mousemove', el => { if (IsMove) setPower(el['clientY']) })
document.addEventListener('mouseup', () => { if (IsMove) IsMove = false })




function getStatLamp() {
    sendApi("https://api.iot.yandex.net/v1.0/devices/5d5ff684-86bf-47c4-8811-36f0253b9709", "GET")
        .then(data => data.json()).then(count => {
            setNamberOnShalu(count['capabilities'][0]['state']['value'])
            let hsv = count['capabilities'][1]['state']['value'];
            console.log(hsv, `rgb(${hsvToRgb([hsv['h'], hsv['s'], 100])})`);
            color_REF.setAttribute('stop-color', `rgb(${hsvToRgb([hsv['h'], hsv['s'], 100])})`)
            setColorOrig()
            document.body.style="filter: blur(0);"
        })


}

getStatLamp()


const exit = document.querySelector('.exit')

exit.addEventListener('click', () => {
    creatBody("on_off", "on", !LampOn_OFF)
    sendApi("https://api.iot.yandex.net/v1.0/devices/actions", "POST", setBody()).then(el => LampOn_OFF = el.ok ? !LampOn_OFF : LampOn_OFF)
})



const hue = document.querySelector('.styled-slider-color')
const ton = document.querySelector('.styled-slider')

let tonVAL = 100
let hueVAL = 180

hue.addEventListener('input', () => {
    hueVAL = hue.value
    setColorOnLamp(`rgb(${hsvToRgb([hueVAL, tonVAL, 100])})`)
})
ton.addEventListener('input', () => {
    tonVAL = ton.value
    setColorOnLamp(`rgb(${hsvToRgb([hueVAL, tonVAL, 100])})`)
})



document.querySelector('.back').addEventListener('click', () => conteiner.className = "conteiner")
document.querySelector('.add-color').addEventListener('click', () => conteiner.className = "conteiner color")

