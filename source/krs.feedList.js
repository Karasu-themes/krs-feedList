/*! krs-feedList.js v1.0 - karasu themes©2019 | MIT License */

class FeedList {
	constructor (userOption) {
		// Variables
		let self = this,
			BODY = document.body,
			CALLBACK_NAME = 'feedLists',
			CONFIG = {
				selector: document.getElementById('krs-feedLists'), //selector html dónde se incrustarán los datos
				home_url: window.location.protocol + '//' + window.location.hostname, //URL principal sin el slash final
				label: '', //Etiqueta
				thumbnail: 's200-c', //tamaño imagenes
				length: 4, //Total de entradas a mostrar
				render: 'default', //estructura html de los items,
				loader: this.loader(), //Estructura de cargando
				summary:  64,  //Cantidad de texto a mostrar en el resumen
				callback: ''
			}

			// Variables
			let option = this.mergeObject(CONFIG, userOption),
				label = option.label ? "/-/" + option.label : "",
				itemLength = option.length ? `&max-results=${option.length}` : "&max-results=6";

			// insertamos en el body el script
			let $fetchURL = `${option.home_url}/feeds/posts/default${label}?alt=json-in-script&callback=${CALLBACK_NAME}`+itemLength;
			BODY.appendChild(this.script($fetchURL));

			// agregamos el loader
			option.selector.innerHTML=option.loader;

			// la función que mostrará los items en pantalla
			window[CALLBACK_NAME] = function(json){
				let post = json.feed.entry,
					items = "";
					option.selector.innerHTML="";
					if (typeof post != "undefined") {
						for (var i = 0; i < post.length; i++) {
							items += self.render(self.renderManagementItem(option.render), post[i], option);
						}
						option.selector.innerHTML = self.renderContent(items, option);
					} else {
						option.selector.innerHTML = `<div class="krs-feedList__messages">El blog ${self.getHostname(option.home_url)} no tiene entradas públicadas o está en modo privado.</div>`;
					}
			}
	}

	// Nos permite renderizar la estructura html del contenedor
	render(data, post, option){
		return data.replace(/TITLE|URL|IMAGE|SUMMARY|TAG|CATEGORY|TIMESTAMP/g,element=>{
			switch(element){
				case 'TITLE':
					return post.title.$t;
				break;
				case 'URL':
					return this.getLink(post)
				break;
				case 'IMAGE':
					return this.getThumbnail(post.media$thumbnail.url, option);
				break;
				case 'SUMMARY':
					return this.getSummary(post, option);
				case 'TAG':
					let tag = this.getTags(post),
						category = "";
					for (var i = 0; i < tag.length; i++) {
						category += `<a href="${option.home_url+"search/label/"+tag[i]}">${tag[i]}</a>`
					}
					return category;
				case 'CATEGORY':
					return this.getTags(post)[0];
				case 'TIMESTAMP':
					return this.getTimestamp(post);
				break;
			}
		})
	}

	// Devuelve la url del item actual
	getLink(data){
		let url = data.link;
		for (var i = 0; i < url.length; i++) {
			if (url[i].rel == "alternate") {
				return url[i].href
			}
		}
	}

	// Devuelve la imagen del item actual
	getThumbnail(image, option){
		if (image) {
			return image.replace('s72-c', option.thumbnail)
		}
	}
	// Devuelve el resumen del item actual
	getSummary(data, option){
		let cleanHTML = /(<([^>]+)>)/g,
			summary = (data.content ? data.content : data.summary).$t.replace(cleanHTML, '');
		return summary.substr(0, option.summary) + "...";
	}
	// Devuelve las etiquetas del item actual.
	getTags(data){
		let category = [];
		for (var i = 0; i < data.category.length; i++) {
			category[i] = data.category[i].term
		}
		return category
	}
	// Devuelve la fecha de públicación
	getTimestamp(data){
		let published = new Date( data.published.$t ).toLocaleDateString('es-ES')
		return published
	}

	getHostname(uri){
		let a = document.createElement('a');
			a.href=uri;
		return a.hostname;
	}

	// Gestiona la estructura de los items
	renderManagementItem(mode){
		switch (mode) {
			case 'default':
				console.log(typeof mode)
				return this.renderItems();
				break;
			case 'overlay':
				console.log(typeof mode)
				return this.renderItemsOverlay();
				break;
			default:
				let type = typeof mode;
				if (type == "function") {
					return mode();
				} else {
					return this.renderItems;
				}
				break;
		}
	}

	// Estructura general
	renderContent(item, option){
		let html = `<div class="krs-feedList MODE">ITEM</div>`;
		return html.replace(/MODE|ITEM/g, element=>{
			switch(element){
				case 'ITEM':
					return item;
				break;
				case 'MODE':
					let type = typeof option.render;
					if (type == "function") return "custom"
					if (type == "string") return option.render
				break;
			}
		});
	}

	// Nos permite renderizar la estructura html de los items
	renderItems() {
		let html="";
		html+='<div class="krs-feedList-item">';
		html+='<div class="krs-feedList-item__image"><img src="IMAGE" alt="TITLE"></div>';
		html+='<div class="krs-feedList-item__content">';
		html+='<a href="URL" target="_blank" class="krs-feedList-item__title">TITLE</a>';
		html+= '<p class="krs-feedList-item__summary">SUMMARY</p>';
		html+='</div>';
		html+='</div>';
		return html;
	}

	// Estructura overlay
	renderItemsOverlay(){
		let html="";
		html+='<div class="krs-feedList-item">';
		html+='<div class="krs-feedList-item__image">';
		html+='<a href="URL" target="_blank"><img src="IMAGE" alt="TITLE"></a>';
		html+='<span class="krs-feedList-item__title">TITLE</span>';
		html+='</div>';
		html+='<div class="krs-feedList-item__content">';
		html+='<div class="krs-feedList-item__meta">';
		html+='<span class="tags">CATEGORY</span>';
		html+='<span class="timestamp"> TIMESTAMP</span>';
		html+='</div>';
		html+='<p class="krs-feedList-item__summary">SUMMARY</p>';
		html+='</div>';
		html+='</div>';
		return html
	}

	loader(){
		return '<div class="krs-feedList__loader"><span class="krs-feedList__spinner"></span></div>'
	}

	// Genera una etiqueta script para ser insertada
	script(src){
		let script = document.createElement('script');
			script.src=src;
		return script
	}

	// Mezcla las opciones por defecto con las del usuario
	mergeObject(source, properties){
		var property;
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}
		return source;
	}

	debug(){

	}

}