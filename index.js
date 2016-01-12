var Quagga = require("quagga")
var jQuery = require("jquery")
var Debounce = require("debounce")
var $ = jQuery

var Receipts = {
    2846365: {
        merchant: "Walmart",
        total: "$30.54",
        date: "January 11th, 2016",
        recipient: "Andrew McPherson",
        items: [
            {name: "golden bananas", cost: "$4.99"},
            {name: "magic cucumbers", cost: "$11.99"},
            {name: "a llama", cost: "$13.56"},
        ],
        comment: "You saved $4.01!"
    },
    9471534: {
        merchant: "Julie Darling Donuts",
        total: "$8.99",
        date: "December 21th, 2015",
        recipient: "Andrew McPherson",
        items: [
            {name: "dozens of donuts", cost: "$8.99"},
        ]
    },
    1111111: {
        merchant: "Ace Hardware",
        total: "$12.56",
        date: "February 30th, 201X",
        recipient: "David McPherson",
        items: [
            {name: "too many screws", cost: "$4.99"},
            {name: "hammer", cost: "7.57"}
        ],
        comment: "Never too many screws, right?"
    },
}

var render = function(receipt) {
    return (
        "<h1>" + receipt.merchant + " - " + receipt.total + "</h1>"
        + "<div>Recipient: " + receipt.recipient + "</div>" + "<div>Date of Purchase: " + receipt.date + "</div>"
        + "<br/><ul>" + receipt.items.map(function(item) {
            return "<li><b>" + item.name + "</b> ... " + item.cost + "</li>"
        }).join(" ") + "</ul>"
        + (receipt.comment ? "<br/><div>" + receipt.comment + "</div>" : "")
    )
}

var popup = function(code) {
    if(Receipts[code] != undefined) {
        $("#popup").html(render(Receipts[code]))
        $("#popup").addClass("active").addClass("more")
    } else {
        $("#popup").html("<h1>" + code + "</h1>")
        $("#popup").addClass("active").addClass("less")
    }
}

var unpopup = Debounce(function() {
    $("#popup").removeClass("active").removeClass("more").removeClass("less").html("")
}, 1000)

var collector = Quagga.ResultCollector.create({
    capture: true,
    capacity: 20,
    blacklist: [{code: "2167361334", format: "i2of5"}],
    filter: function(result) {
        return true
    }
})

Quagga.init({
    inputStream: {
        type : "LiveStream",
        constraints: {
            width: 640,
            height: 480,
            facing: "environment"
        }
    },
    locator: {
        patchSize: "medium",
        halfSample: true
    },
    numOfWorkers: 4,
    decoder: {
        readers : ["code_128_reader"]
    },
    locate: true
}, function(error) {
    if(!!error) {
        console.log(error)
    }
    Quagga.registerResultCollector(collector)
    Quagga.start()
})

Quagga.onProcessed(function(result) {
    var drawingCtx = Quagga.canvas.ctx.overlay
    var drawingCanvas = Quagga.canvas.dom.overlay

    if(result) {
        if(result.boxes) {
            drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")))
            result.boxes.filter(function (box) {
                return box !== result.box
            }).forEach(function (box) {
                Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2})
            })
        }

        if(result.box) {
            Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2})
        }

        if(result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3})
        }
    }
})

Quagga.onDetected(function(data) {
    var code = data.codeResult.code

    popup(code)
    unpopup()
})
