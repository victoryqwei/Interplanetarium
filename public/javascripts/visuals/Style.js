import {camera} from '../visuals/Camera.js';

export default class Style {
	constructor(ctx) {
		this.ctx = ctx;
	}

	drawCompass(x, y, base, height, angle, c) {
		let {ctx} = this;

      	ctx.save();
	 	ctx.translate(x, y);
		ctx.rotate(angle);
        ctx.beginPath();
        var path = new Path2D();
	    path.moveTo(-base/2,height/2);
	    path.lineTo(0,-height/2);
	    path.lineTo(base/2,height/2);
	    
	    path.lineTo(0,height/4);
	    path.lineTo(-base/2,height/2);
	    path.lineTo(0,-height/2);
	    ctx.fillStyle = c || "red";
	    ctx.fill(path);

	    ctx.closePath();
        ctx.restore();
    }

	drawTrapezoid(x, y, w, h, i) {
		let {ctx} = this;

		ctx.save();
	    ctx.beginPath();
	    ctx.moveTo(x + i, y);
	    ctx.lineTo(x - i + w, y);
	    ctx.lineTo(x + w, y + h);
	    ctx.lineTo(x, y + h);
	    ctx.lineTo(x + i, y);
	    ctx.lineTo(x - i + w, y);

	    ctx.lineJoin = "miter";
		ctx.strokeStyle = "white";
		ctx.lineWidth = 7;
	    ctx.stroke();
	    ctx.closePath();
	    ctx.restore();
	}


	drawPolygon(x, y, r, s, c, options) {
		let {ctx} = this;

		if (!options)
		options = {};

		ctx.save();
		ctx.beginPath();
		ctx.moveTo (x +  r * Math.cos(0), y +  r *  Math.sin(0));          

		for (var i = 1; i <= s;i += 1) {
		  ctx.lineTo (x + r * Math.cos(i * 2 * Math.PI / s), y + r * Math.sin(i * 2 * Math.PI / s));
		}

		ctx.lineJoin = "miter";
		ctx.strokeStyle = c || "white";
		ctx.lineWidth = 7;
		ctx.stroke();
	    ctx.closePath();
	    ctx.restore();
	}

	drawCircle(x, y, r, c, options) {
		let {ctx} = this;

		if (!options)
			options = {};

		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * Math.PI, false);
	    ctx.fillStyle = c || 'red';
	    ctx.globalAlpha = options.alpha || 1;
	    if (options.glow)
	    	ctx.shadowBlur = options.glowWidth || 100;
	    if (options.glowColor)
			ctx.shadowColor = options.glowColor || 'aqua';
		if (options.fill || options.fill == undefined)
	    	ctx.fill();
	    ctx.shadowBlur = 0;
	    ctx.lineWidth = options.outlineWidth || 1;
	    ctx.strokeStyle = options.outlineColor || 'black';
	    if (options.outline)
	    	ctx.stroke();
	    ctx.closePath();
	    ctx.restore();
	}

	drawRectangle(x, y, w, h, c, options) {
		let {ctx} = this;

		if (!options)
			options = {};

		ctx.save();
		ctx.translate(x, y);
		ctx.beginPath();
		ctx.rect(0, 0, w, h);
		ctx.fillStyle = c || 'black';
		ctx.globalAlpha = options.alpha || 1;
		if (options.fill == undefined || options.fill)
			ctx.fill();
		ctx.strokeStyle = options.outlineColor || "black";
		ctx.lineWidth = options.outlineWidth || 1;
		if (options.outline)
			ctx.stroke();
		ctx.closePath();
		ctx.restore();
	}

	// Draw rectangle but centered
	drawRect(x, y, w, h, d, c, options) {
		let {ctx} = this;

		if (!options)
			options = {};

		ctx.save();
		ctx.translate(x, y)
		ctx.rotate(d);
		ctx.beginPath();

		ctx.rect(-w/2, -h/2, w, h);
		ctx.fillStyle = c || 'grey';
		ctx.globalAlpha = options.alpha || 1;
			ctx.fill();
		ctx.globalAlpha = 1;

		ctx.closePath();
		ctx.resetTransform();
		ctx.restore();
	}

	drawRoundedRect(x, y, w, h, r, c, options) {
		let {ctx} = this;

		if (!options)
			options = {};
		
		// Draw rounded rectangle
	    ctx.beginPath();
	    ctx.moveTo(x+r, y);
	    ctx.lineTo(x+w-r, y);
	    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
	    ctx.lineTo(x+w, y+h-r);
	    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
	    ctx.lineTo(x+r, y+h);
	    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
	    ctx.lineTo(x, y+r);
	    ctx.quadraticCurveTo(x, y, x+r, y);
	    ctx.fillStyle = c || 'grey';
		ctx.globalAlpha = options.alpha || 1;
			ctx.fill();
		ctx.globalAlpha = 1;
	}
	
	drawRotatedRoundedRect(x, y, w, h, r, c, d, options) {
		let {ctx} = this;

		if (!options)
			options = {};

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(d);
		
		ctx.moveTo(-w/2+r, -h/2);
	    ctx.lineTo(-w/2+w-r, -h/2);
	    ctx.quadraticCurveTo(-w/2+w, -h/2+0, -w/2+w, -h/2+0+r);
	   	ctx.lineTo(-w/2+w, -h/2+h-r);
	    ctx.quadraticCurveTo(-w/2+w, -h/2+h, -w/2+w-r, -h/2+h);
	    ctx.lineTo(-w/2+r, -h/2+h);
	    ctx.quadraticCurveTo(-w/2, -h/2+h, -w/2, -h/2+h-r);
	    ctx.lineTo(-w/2, -h/2+r);
	    ctx.quadraticCurveTo(-w/2, -h/2, -w/2+r, -h/2);

	    ctx.fillStyle = c || 'grey';
		ctx.globalAlpha = options.alpha || 1;
		ctx.lineWidth = 3*camera.zoom;
			ctx.fill();
		ctx.globalAlpha = 1;

		ctx.closePath();
		ctx.resetTransform();
		ctx.restore();
	}
	
	drawStar(cx, cy, spikes, outerRadius, innerRadius) {
		let {ctx} = this;

	    var rot = Math.PI / 2 * 3;
	    var x = cx;
	    var y = cy;
	    var step = Math.PI / spikes;

	    ctx.strokeSyle = "#000";
	    ctx.beginPath();
	    ctx.moveTo(cx, cy - outerRadius)
	    for (i = 0; i < spikes; i++) {
	        x = cx + Math.cos(rot) * outerRadius;
	        y = cy + Math.sin(rot) * outerRadius;
	        ctx.lineTo(x, y)
	        rot += step

	        x = cx + Math.cos(rot) * innerRadius;
	        y = cy + Math.sin(rot) * innerRadius;
	        ctx.lineTo(x, y)
	        rot += step
	    }
	    ctx.lineTo(cx, cy - outerRadius)
	    ctx.closePath();
	    ctx.fillStyle='white';
	    ctx.fill();

	}

	drawCheckmark(x, y, size, width) {
		let {ctx} = this;

		ctx.beginPath();
		ctx.moveTo(x-size, y);
		ctx.lineTo(x,y+size);
		ctx.lineTo(x+size*2,y-size);
		ctx.lineWidth = width;
		ctx.strokeStyle = '#fff';
		ctx.stroke();
		ctx.closePath(); 
	}

	drawImage(img, x, y, w, h, angle) {
		let {ctx} = this;

		ctx.beginPath();
		ctx.translate(x, y);
		ctx.rotate(angle);
		ctx.drawImage(img, -w, -h, w*2, h*2);
		ctx.resetTransform();
		ctx.closePath();
	}

	drawCircleImage(img, x, y, r, angle) {
		let {ctx} = this;

		ctx.translate(x, y)
		ctx.rotate(angle);
		ctx.drawImage(img, -r, -r, r*2, r*2);
		ctx.resetTransform();
	}

	drawLine(x1, y1, x2, y2, color, thickness, cap, alpha) {
		let {ctx} = this;

		ctx.beginPath();
		ctx.lineWidth = thickness;
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.globalAlpha = alpha || 1;
		ctx.strokeStyle = color || "black";
		ctx.lineCap = cap || "default";
		ctx.stroke();
		ctx.globalAlpha = 1;
		ctx.closePath();
	}

	drawText(text, x, y, font, color, align, baseline, alpha) {
		let {ctx} = this;

		let options = {};
		if (font instanceof Object) {
			options = font;
		}
		ctx.beginPath();
		ctx.font = options.font || font || "20px Arial";
		ctx.fillStyle = options.color || color || "red";
		ctx.textAlign = options.align || align || "default";
		ctx.globalAlpha = alpha || 1;
		ctx.textBaseline = options.baseline || baseline || "default";
		ctx.fillText(text, x, y);
		ctx.globalAlpha = 1;
		ctx.closePath();
	}

	drawArrow(x1, y1, x2, y2, thickness, color, alpha, cap){
		let {ctx} = this;

		ctx.beginPath();
		ctx.lineWidth = thickness || 2;
		ctx.strokeStyle = color || "black";
		ctx.globalAlpha = alpha || 1;
		ctx.lineCap = cap || "butt";
	    var headlen = 10;   // length of head in pixels
	    var angle = Math.atan2(y2-y1,x2-x1);
	    ctx.moveTo(x1, y1);
	    ctx.lineTo(x2, y2);
	    ctx.lineTo(x2-headlen*Math.cos(angle-Math.PI/6),y2-headlen*Math.sin(angle-Math.PI/6));
	    ctx.moveTo(x2, y2);
	    ctx.lineTo(x2-headlen*Math.cos(angle+Math.PI/6),y2-headlen*Math.sin(angle+Math.PI/6));
	    ctx.stroke();
	    ctx.closePath();
	    ctx.globalAlpha = 1;
	}

	drawTriangle(x, y, base, height, angle, color) {
		let {ctx} = this;
	 	
	 	ctx.save();
	 	ctx.translate(x, y)
		ctx.rotate(angle);
		ctx.beginPath();

	    var path =new Path2D();
	    path.moveTo(-base/2,height/2);
	    path.lineTo(0,-height/2);
	    path.lineTo(base/2,height/2);
	    path.lineTo(-base/2,height/2);
	    path.lineTo(0,-height/2);
	    ctx.miterLimit = 10;
	    ctx.lineJoin = "miter";
	    ctx.lineWidth = 7;
	    ctx.fillStyle = color || "black";
	    ctx.strokeStyle = color || "black";
	    ctx.fill(path);

	   	ctx.closePath();
		ctx.resetTransform();
		ctx.restore();
	}

	drawWarning(x, y, base, height, angle, color, alpha) {
		let {ctx} = this;
	 	
	 	ctx.save();
	 	ctx.translate(x, y)
		ctx.rotate(angle);
		ctx.beginPath();
		ctx.globalAlpha = alpha || 1;
	    var path =new Path2D();
	    path.moveTo(-base/2,height/2);
	    path.lineTo(0,-height/2);
	    path.lineTo(base/2,height/2);
	    path.lineTo(-base/2,height/2);
	    path.lineTo(0,-height/2);
	    ctx.miterLimit = 10;
	    ctx.lineJoin = "miter";
	    ctx.lineWidth = 15;
	    ctx.fillStyle = color || "black";
	    ctx.strokeStyle = color || "black";
	    ctx.lineJoin = "round";
	    ctx.fill(path);
	    ctx.stroke(path);

	    this.drawText("!", 0, height/6, "bold " + height/1.7 + "px Arial", "white", "center", "middle", 1);

	   	ctx.closePath();
		ctx.resetTransform();
		ctx.restore();
	}
}