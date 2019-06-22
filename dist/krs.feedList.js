'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*! krs-feedList.js v1.1 - karasu themes©2019 | MIT License */

var FeedList = function () {
	function FeedList(userOption) {
		_classCallCheck(this, FeedList);

		// Variables
		var self = this,
		    BODY = document.body,
		    CALLBACK_NAME = 'feedLists',
		    CONFIG = {
			selector: document.getElementById('krs-feedLists'), //selector html dónde se incrustarán los datos
			home_url: window.location.protocol + '//' + window.location.hostname, //URL principal (no usar slash final)
			label: '', //Etiqueta
			thumbnail: 's200-c', //tamaño imagenes
			length: 4, //Total de entradas a mostrar
			render: 'default', //estructura html de los items,
			loader: this.loader(), //Estructura de cargando
			summary: 64 //Cantidad de texto a mostrar en el resumen


			// Variables
		};var option = this.mergeObject(CONFIG, userOption),
		    label = option.label ? "/-/" + option.label : "",
		    itemLength = option.length ? '&max-results=' + option.length : "&max-results=6";

		// insertamos en el body el script
		var $fetchURL = option.home_url + '/feeds/posts/default' + label + '?alt=json-in-script&callback=' + CALLBACK_NAME + itemLength;
		BODY.appendChild(this.script($fetchURL));

		// agregamos el loader
		option.selector.innerHTML = option.loader;

		// la función que mostrará los items en pantalla
		window[CALLBACK_NAME] = function (json) {
			var post = json.feed.entry,
			    items = "";
			option.selector.innerHTML = "";
			if (typeof post != "undefined") {
				for (var i = 0; i < post.length; i++) {
					items += self.render(self.renderManagementItem(option.render), post[i], option);
				}
				option.selector.innerHTML = self.renderContent(items, option);
			} else {
				option.selector.innerHTML = '<div class="krs-feedList__messages">El blog ' + self.getHostname(option.home_url) + ' no tiene entradas p\xFAblicadas o est\xE1 en modo privado.</div>';
			}
		};
	}

	// Nos permite renderizar la estructura html del contenedor


	_createClass(FeedList, [{
		key: 'render',
		value: function render(data, post, option) {
			var _this = this;

			return data.replace(/TITLE|URL|IMAGE|SUMMARY|TAG|CATEGORY|TIMESTAMP/g, function (element) {
				switch (element) {
					case 'TITLE':
						return post.title.$t;
						break;
					case 'URL':
						return _this.getLink(post);
						break;
					case 'IMAGE':
						return _this.getThumbnail(post.media$thumbnail.url, option);
						break;
					case 'SUMMARY':
						return _this.getSummary(post, option);
					case 'TAG':
						var tag = _this.getTags(post),
						    category = "";
						for (var i = 0; i < tag.length; i++) {
							category += '<a href="' + (option.home_url + "search/label/" + tag[i]) + '">' + tag[i] + '</a>';
						}
						return category;
					case 'CATEGORY':
						return _this.getTags(post)[0];
					case 'TIMESTAMP':
						return _this.getTimestamp(post);
						break;
				}
			});
		}

		// Devuelve la url del item actual

	}, {
		key: 'getLink',
		value: function getLink(data) {
			var url = data.link;
			for (var i = 0; i < url.length; i++) {
				if (url[i].rel == "alternate") {
					return url[i].href;
				}
			}
		}

		// Devuelve la imagen del item actual

	}, {
		key: 'getThumbnail',
		value: function getThumbnail(image, option) {
			if (image) {
				return image.replace('s72-c', option.thumbnail);
			}
		}
		// Devuelve el resumen del item actual

	}, {
		key: 'getSummary',
		value: function getSummary(data, option) {
			var cleanHTML = /(<([^>]+)>)/g,
			    summary = (data.content ? data.content : data.summary).$t.replace(cleanHTML, '');
			return summary.substr(0, option.summary) + "...";
		}
		// Devuelve las etiquetas del item actual.

	}, {
		key: 'getTags',
		value: function getTags(data) {
			var category = [];
			for (var i = 0; i < data.category.length; i++) {
				category[i] = data.category[i].term;
			}
			return category;
		}
		// Devuelve la fecha de públicación

	}, {
		key: 'getTimestamp',
		value: function getTimestamp(data) {
			var published = new Date(data.published.$t).toLocaleDateString('es-ES');
			return published;
		}
	}, {
		key: 'getHostname',
		value: function getHostname(uri) {
			var a = document.createElement('a');
			a.href = uri;
			return a.hostname;
		}

		// Gestiona la estructura de los items

	}, {
		key: 'renderManagementItem',
		value: function renderManagementItem(mode) {
			switch (mode) {
				case 'default':
					return this.renderItems();
					break;
				case 'overlay':
					return this.renderItemsOverlay();
					break;
				default:
					var type = typeof mode === 'undefined' ? 'undefined' : _typeof(mode);
					if (type == "function") {
						return mode();
					} else {
						return this.renderItems;
					}
					break;
			}
		}

		// Estructura general

	}, {
		key: 'renderContent',
		value: function renderContent(item, option) {
			var html = '<div class="krs-feedList MODE">ITEM</div>';
			return html.replace(/MODE|ITEM/g, function (element) {
				switch (element) {
					case 'ITEM':
						return item;
						break;
					case 'MODE':
						var type = _typeof(option.render);
						if (type == "function") return "custom";
						if (type == "string") return option.render;
						break;
				}
			});
		}

		// Nos permite renderizar la estructura html de los items

	}, {
		key: 'renderItems',
		value: function renderItems() {
			var html = "";
			html += '<div class="krs-feedList-item">';
			html += '<div class="krs-feedList-item__image"><img src="IMAGE" alt="TITLE"></div>';
			html += '<div class="krs-feedList-item__content">';
			html += '<a href="URL" target="_blank" class="krs-feedList-item__title">TITLE</a>';
			html += '<p class="krs-feedList-item__summary">SUMMARY</p>';
			html += '</div>';
			html += '</div>';
			return html;
		}

		// Estructura overlay

	}, {
		key: 'renderItemsOverlay',
		value: function renderItemsOverlay() {
			var html = "";
			html += '<div class="krs-feedList-item">';
			html += '<div class="krs-feedList-item__image">';
			html += '<a href="URL" target="_blank"><img src="IMAGE" alt="TITLE"></a>';
			html += '<span class="krs-feedList-item__title">TITLE</span>';
			html += '</div>';
			html += '<div class="krs-feedList-item__content">';
			html += '<div class="krs-feedList-item__meta">';
			html += '<span class="tags">CATEGORY</span>';
			html += '<span class="timestamp"> TIMESTAMP</span>';
			html += '</div>';
			html += '<p class="krs-feedList-item__summary">SUMMARY</p>';
			html += '</div>';
			html += '</div>';
			return html;
		}
	}, {
		key: 'loader',
		value: function loader() {
			return '<div class="krs-feedList__loader"><span class="krs-feedList__spinner"></span></div>';
		}

		// Genera una etiqueta script para ser insertada

	}, {
		key: 'script',
		value: function script(src) {
			var script = document.createElement('script');
			script.src = src;
			return script;
		}

		// Mezcla las opciones por defecto con las del usuario

	}, {
		key: 'mergeObject',
		value: function mergeObject(source, properties) {
			var property;
			for (property in properties) {
				if (properties.hasOwnProperty(property)) {
					source[property] = properties[property];
				}
			}
			return source;
		}
	}]);

	return FeedList;
}();