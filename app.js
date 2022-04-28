const Os = require("os");
const os = Os.type();
const fs = require("fs");
const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK("__input_your_key__", "__input_your_key__");

var image = os.includes("Windows") ? fs.readdirSync(`${__dirname}\\Image`) : fs.readdirSync(`${__dirname}/Image`);
var metadata = os.includes("Windows") ? fs.readdirSync(`${__dirname}\\Metadata`) : fs.readdirSync(`${__dirname}/Metadata`);

const pinFromFS = async file => {
    if (os.includes("Windows")) {
        return pinata.pinFromFS(`${__dirname}\\Image\\${file}`).then(res => {
            var json = JSON.parse(fs.readFileSync(`${__dirname}\\Metadata\\${file.split(".")[0]}.json`, "utf8"));
            json.image = `ipfs://${res["IpfsHash"]}`;
            fs.writeFileSync(`${__dirname}\\Metadata\\${file.split(".")[0]}.json`, JSON.stringify(json));

            if (!fs.readFileSync(`${__dirname}\\out\\Image.csv`).includes(res["IpfsHash"]))
                fs.appendFileSync(`${__dirname}\\out\\Image.csv`, `${file},${res["IpfsHash"]}\n`);
        });
    } else {
        return pinata.pinFromFS(`${__dirname}/Image/${file}`).then(res => {
            var json = JSON.parse(fs.readFileSync(`${__dirname}/Metadata/${file.split(".")[0]}.json`, "utf8"));
            json.image = `ipfs://${res["IpfsHash"]}`;
            fs.writeFileSync(`${__dirname}/Metadata/${file.split(".")[0]}.json`, JSON.stringify(json));

            if (!fs.readFileSync(`${__dirname}/out/Image.csv`).includes(res["IpfsHash"]))
                fs.appendFileSync(`${__dirname}/out/Image.csv`, `${file},${res["IpfsHash"]}\n`);
        });
    }
};

const pinFromFS2 = async file => {
    if (os.includes("Windows")) {
        return pinata.pinFromFS(`${__dirname}\\Metadata\\${file}`).then(res => {
            if (!fs.readFileSync(`${__dirname}\\out\\Metadata.csv`).includes(res["IpfsHash"]))
                fs.appendFileSync(`${__dirname}\\out\\Metadata.csv`, `${file},${res["IpfsHash"]}\n`);
        });
    } else {
        return pinata.pinFromFS(`${__dirname}/Metadata/${file}`).then(res => {
            if (!fs.readFileSync(`${__dirname}/out/Metadata.csv`).includes(res["IpfsHash"]))
                fs.appendFileSync(`${__dirname}/out/Metadata.csv`, `${file},${res["IpfsHash"]}\n`);
        });
    }
};

(async () => {
    var max = 5;

    for (var i = 0; i <= Math.floor(image.length / max); i++) {
        var tmp = image.slice(i * max, (i + 1) * max);
        tmp = tmp.map(data =>
            pinFromFS(data).catch(err => {
                console.log("pass");
                return "";
            })
        );

        var list = await Promise.all(tmp);
        console.log(
            `이미지 등록 현황 : ${
                os.includes("Windows")
                    ? fs.readFileSync(`${__dirname}\\out\\Image.csv`, "utf8").split("\n").length - 1
                    : fs.readFileSync(`${__dirname}/out/Image.csv`, "utf8").split("\n").length - 1
            } / ${image.length}`
        );
    }

    for (var i = 0; i <= Math.floor(metadata.length / max); i++) {
        var tmp = metadata.slice(i * max, (i + 1) * max);
        tmp = tmp.map(data =>
            pinFromFS2(data).catch(err => {
                console.log("pass");
                return "";
            })
        );

        var list = await Promise.all(tmp);
        console.log(
            `메타데이터 등록 현황 : ${
                os.includes("Windows")
                    ? fs.readFileSync(`${__dirname}\\out\\Metadata.csv`, "utf8").split("\n").length - 1
                    : fs.readFileSync(`${__dirname}/out/Image.csv`, "utf8").split("\n").length - 1
            } / ${metadata.length}`
        );
    }
})();
