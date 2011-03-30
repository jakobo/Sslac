var VERSION = "0.0.1",
    smoosh = require('smoosh'),
    fs = require('fs');

smoosh.make('config/smoosh.json');

var copyright = fs.readFileSync('./src/copyright.js', 'utf8'),
    sslac     = fs.readFileSync('./tmp/sslac.js', 'utf8'),
    sslacMin  = fs.readFileSync('./tmp/sslac.min.js', 'utf8') + ";";

fs.writeFileSync('./artifacts/sslac-'+VERSION+'.js', [copyright, sslac].join(''), 'utf8');
fs.writeFileSync('./artifacts/sslac-'+VERSION+'.min.js', [copyright, sslacMin].join(''), 'utf8');
