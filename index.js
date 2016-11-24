var express = require('express'),
    bodyParser = require('body-parser'),
    querystring = require('querystring'),
    request = require('request');

var PORT = (process.env.PORT || 5000),
    AUTH_TOKEN_LINE = process.env.AUTH_TOKEN_LINE,
    WEBHOOK_LINE = ('/' + process.env.WEBHOOK_LINE || '/webhook_line');

var app = express();
app.use(bodyParser.json());

app.set('port', PORT);

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

function replyBack(token, msg) {
    // multiline message
    if(msg !== undefined) {
        msg = msg.replace(/\n/g, " ");
    }
    var queryUrl = 'http://api.asksusi.com/susi/chat.json?q=' + encodeURI(msg);
    var message = '',
    options = {
        url: queryUrl,
        json: true
    };

    request(options, function (error, response, body) {
        console.log('Susi response:', JSON.stringify(body));
        if (!error && response.statusCode == 200) {
            message = body.answers[0].actions[0].expression;
        } else {
            message = 'Oops, Looks like Susi is taking a break, She will be back soon';
        }

        var replyMsg = {
            replyToken: token,
            messages: [
            {
                type: "text",
                text: message
            }
            ]
        };
        var options = {
            uri: 'https://api.line.me/v2/bot/message/reply',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AUTH_TOKEN_LINE
            },
            json: replyMsg
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('Token:', e.replyToken);
                console.log('Sent:', message);
            }
        });
    });
}

app.get('/', function(request, response) {
    response.send('Susi says Hello.');
});

app.post(WEBHOOK_LINE, function(request, response) {
    console.log('Data:', JSON.stringify(request.body));
    for(e of request.body.events) {
        replyBack(e.replyToken , e.message.text);
    }
    response.send('Not a right place to visit.');
});

app.listen(PORT, function() {
    console.log('Node app is running on port ', PORT);
});


