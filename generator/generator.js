var fs = require('fs');
var path = require('path');
var request = require('request');
var download = require('download');

var templates = {
	sketchjs: loadFile('templates/sketch.js'),
	indexhtml: loadFile('templates/index.html')
}

var libraries = {
	p5js: loadFile('libraries/p5.js'),
	p5domjs: loadFile('libraries/p5.dom.js'),
	p5soundjs: loadFile('libraries/p5.sound.js')
}

var generator = {
	collection: function(collection, opt) {
		var p5rc = {
			name: collection,
			projects: []
		};

		mkdir(collection, function() {
			write(collection + '/.p5rc', JSON.stringify(p5rc, null, 2));
			mkdir(collection + '/libraries', function() {
				write(collection + '/libraries/p5.js', libraries.p5js);
				write(collection + '/libraries/p5.sound.js', libraries.p5soundjs);
				write(collection + '/libraries/p5.dom.js', libraries.p5domjs);
			});
		});
	},
	project: function(project, opt) {
		var p5rc = JSON.parse(fs.readFileSync('.p5rc', 'utf-8'));
		p5rc.projects.push(project);
		write('.p5rc', JSON.stringify(p5rc, null, 2));
		mkdir(project, function() {
			if (opt.es6) {
				write(project + '/sketch.es6', templates.sketchjs);
			}
			else {
				write(project + '/sketch.js', templates.sketchjs);
			}
			write(project + '/index.html', templates.indexhtml);
		});
	},
  update: function() {
    var option = {
      url: 'https://api.github.com/repos/processing/p5.js/releases/latest',
      headers: {
        'User-Agent': 'chiunhau/p5-manager'
      }
    }

    request(option, function(error, res, body) {
      // get latest release tag
      var obj = JSON.parse(body);
      console.log('The latest p5.js release is version ' + obj.tag_name);

      download(libPath(obj.tag_name, 'p5.js'), 'libraries').then(() => {
        console.log('   \033[36mupdated\033[0m : '  + 'p5.js');
      });
      download(libPath(obj.tag_name, 'p5.dom.js'), 'libraries').then(() => {
        console.log('   \033[36mupdated\033[0m : '  + 'p5.dom.js');
      });
      download(libPath(obj.tag_name, 'p5.sound.js'), 'libraries').then(() => {
        console.log('   \033[36mupdated\033[0m : '  + 'p5.sound.js');
      });
    });
  }
}

function libPath(tag, filename) {
  var fullpath = 'https://github.com/processing/p5.js/releases/download/' + tag + '/' + filename;
  console.log('   \033[36mdownloading\033[0m : '  + filename + '...');

  return fullpath
}

// the following code are taken from https://github.com/expressjs/generator

function loadFile(name) {
  return fs.readFileSync(path.join(__dirname, name), 'utf-8');
}

function write(path, str, mode) {
  fs.writeFileSync(path, str, { mode: mode || 0666 });
  console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}

function mkdir(path, fn) {
  fs.mkdir(path, 0755, function(err){
    if (err) throw err;
    console.log('   \033[36mcreate\033[0m : ' + path);
    fn && fn();
  });
}

module.exports = generator;
