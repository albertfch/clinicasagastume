/**
 * KineticJS JavaScript Library v3.9.8
 * http://www.kineticjs.com/
 * Copyright 2012, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: Jun 03 2012
 *
 * Copyright (C) 2011 - 2012 by Eric Rowell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var Kinetic={};

Kinetic.GlobalObject={
    stages:[],
    idCounter:0,
    tempNodes:[],
    animations:[],
    animIdCounter:0,
    animRunning:!1,
    maxDragTimeInterval:20,
    frame:{
        time:0,
        timeDiff:0,
        lastTime:0
    },
    drag:{
        moving:!1,
        node:undefined,
        offset:{
            x:0,
            y:0
        },
        lastDrawTime:0
    },
    extend:function(a,b){
        for(var c in b.prototype)b.prototype.hasOwnProperty(c)&&a.prototype[c]===undefined&&(a.prototype[c]=b.prototype[c])
    },
    _pullNodes:function(a){
        var b=this.tempNodes;
        for(var c=0;c<b.length;c++){
            var d=b[c];
            d.getStage()!==undefined&&d.getStage()._id===a._id&&(a._addId(d),a._addName(d),this.tempNodes.splice(c,1),c-=1)
        }
    },
    _addAnimation:function(a){
        a.id=this.animIdCounter++,this.animations.push(a)
    },
    _removeAnimation:function(a){
        var b=a.id,c=this.animations;
        for(var d=0;d<c.length;d++)if(c[d].id===b)return this.animations.splice(d,1),!1
    },
    _runFrames:function(){
        var a={};
    
        for(var b=0;b<this.animations.length;b++){
            var c=this.animations[b];
            c.node&&c.node._id!==undefined&&(a[c.node._id]=c.node),c.func(this.frame)
        }
        for(var d in a)a[d].draw()
    },
    _updateFrameObject:function(){
        var a=new Date,b=a.getTime();
        this.frame.lastTime===0?this.frame.lastTime=b:(this.frame.timeDiff=b-this.frame.lastTime,this.frame.lastTime=b,this.frame.time+=this.frame.timeDiff)
    },
    _animationLoop:function(){
        if(this.animations.length>0){
            this._updateFrameObject(),this._runFrames();
            var a=this;
            requestAnimFrame(function(){
                a._animationLoop()
            })
        }else this.animRunning=!1,this.frame.lastTime=0
    },
    _handleAnimation:function(){
        var a=this;
        this.animRunning?this.frame.lastTime=0:(this.animRunning=!0,a._animationLoop())
    },
    _isElement:function(a){
        return!!a&&a.nodeType==1
    },
    _isFunction:function(a){
        return!!(a&&a.constructor&&a.call&&a.apply)
    },
    _isArray:function(a){
        return a.length!==undefined
    },
    _isObject:function(a){
        return a===Object(a)
    },
    _isNumber:function(a){
        return Object.prototype.toString.call(a)=="[object Number]"
    },
    _hasMethods:function(a){
        var b=[];
        for(var c in a)this._isFunction(a[c])&&b.push(c);return b.length>0
    },
    _getXY:function(a){
        if(this._isNumber(a))return{
            x:a,
            y:a
        };
    
        if(this._isArray(a)){
            if(a.length===1){
                var b=a[0];
                if(this._isNumber(b))return{
                    x:b,
                    y:b
                };
            
                if(this._isArray(b))return{
                    x:b[0],
                    y:b[1]
                };
                
                if(this._isObject(b))return b
            }else if(a.length>=2)return{
                x:a[0],
                y:a[1]
            }
        }else if(this._isObject(a))return a;
        return{
            x:0,
            y:0
        }
    },
    _getSize:function(a){
        if(this._isNumber(a))return{
            width:a,
            height:a
        };
    
        if(this._isArray(a))if(a.length===1){
            var b=a[0];
            if(this._isNumber(b))return{
                width:b,
                height:b
            };
        
            if(this._isArray(b)){
                if(b.length>=4)return{
                    width:b[2],
                    height:b[3]
                };
                
                if(b.length>=2)return{
                    width:b[0],
                    height:b[1]
                }
            }else if(this._isObject(b))return b
        }else{
            if(a.length>=4)return{
                width:a[2],
                height:a[3]
            };
            
            if(a.length>=2)return{
                width:a[0],
                height:a[1]
            }
        }else if(this._isObject(a))return a;
        return{
            width:0,
            height:0
        }
    },
    _getPoints:function(a){
        if(a===undefined)return[];
        if(this._isObject(a[0]))return a;
        var b=[];
        for(var c=0;c<a.length;c+=2)b.push({
            x:a[c],
            y:a[c+1]
        });
        return b
    },
    _setAttr:function(a,b,c){
        c!==undefined&&(a[b]=c)
    }
},window.requestAnimFrame=function(a){
    return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){
        window.setTimeout(a,1e3/60)
    }
}(),Kinetic.Node=function(a){
    this.defaultNodeAttrs={
        visible:!0,
        listening:!0,
        name:undefined,
        alpha:1,
        x:0,
        y:0,
        scale:{
            x:1,
            y:1
        },
        rotation:0,
        centerOffset:{
            x:0,
            y:0
        },
        dragConstraint:"none",
        dragBounds:{},
        draggable:!1,
        selected:!1            


    },this.setDefaultAttrs(this.defaultNodeAttrs),this.eventListeners={},this.setAttrs(a)
},Kinetic.Node.prototype={
    on:function(a,b){
        var c=a.split(" ");
        for(var d=0;d<c.length;d++){
            var e=c[d],f=e,g=f.split("."),h=g[0],i=g.length>1?g[1]:"";
            this.eventListeners[h]||(this.eventListeners[h]=[]),this.eventListeners[h].push({
                name:i,
                handler:b
            })
        }
    },
    off:function(a){
        var b=a.split(" ");
        for(var c=0;c<b.length;c++){
            var d=b[c],e=d,f=e.split("."),g=f[0];
            if(this.eventListeners[g]&&f.length>1){
                var h=f[1];
                for(var i=0;i<this.eventListeners[g].length;i++)if(this.eventListeners[g][i].name===h){
                    this.eventListeners[g].splice(i,1),this.eventListeners[g].length===0&&(this.eventListeners[g]=undefined);
                    break
                }
            }else this.eventListeners[g]=undefined
        }
    },
    getAttrs:function(){
        return this.attrs
    },
    setDefaultAttrs:function(a){
   
        this.attrs===undefined&&(this.attrs={});
        if(a)for(var b in a)this.attrs[b]===undefined&&(this.attrs[b]=a[b])
    },
    setAttrs:function(a){
        var b=Kinetic.GlobalObject,c=this;
        if(a!==undefined){
            function d(a,e){
                for(var f in e){
                    var g=e[f];
                    a[f]===undefined&&(a[f]={});
                    if(b._isObject(g)&&!b._isArray(g)&&!b._isElement(g)&&!b._hasMethods(g))a[f]===undefined&&(a[f]={}),d(a[f],g);else switch(f){
                        case"draggable":
                            c.draggable(e[f]);
                            break;
                        case"listening":
                            c.listen(e[f]);
                            break;
                        case"rotationDeg":
                            a.rotation=e[f]*Math.PI/180;
                            break;
                        case"centerOffset":
                            var h=b._getXY(g);
                            b._setAttr(a[f],"x",h.x),b._setAttr(a[f],"y",h.y);
                            break;
                        case"offset":
                            var h=b._getXY(g);
                            b._setAttr(a[f],"x",h.x),b._setAttr(a[f],"y",h.y);
                            break;
                        case"scale":
                            var h=b._getXY(g);
                            b._setAttr(a[f],"x",h.x),b._setAttr(a[f],"y",h.y);
                            break;
                        case"points":
                            a[f]=b._getPoints(g);
                            break;
                        case"crop":
                            var h=b._getXY(g),i=b._getSize(g);
                            b._setAttr(a[f],"x",h.x),b._setAttr(a[f],"y",h.y),b._setAttr(a[f],"width",i.width),b._setAttr(a[f],"height",i.height);
                            break;
                        default:
                            a[f]=e[f]
                    }
                }
            }
            d(this.attrs,a)
        }
    },
    isVisible:function(){
        return this.getParent()&&!this.getParent().isVisible()?!1:this.attrs.visible
    },
    isSelected:function(){
        return this.getParent()&&!this.getParent().isSelected()?1:this.attrs.selected
    },
    setSelected:function(b){
        this.attrs.selected=b
    },
    show:function(){
        this.attrs.visible=!0
    },
    hide:function(){
        this.attrs.visible=!1
    },
    getZIndex:function(){
        return this.index
    },
    getAbsoluteZIndex:function(){
        function e(b){
            var f=[];
            for(var g=0;g<b.length;g++){
                var h=b[g];
                d++,h.nodeType!=="Shape"&&(f=f.concat(h.getChildren())),h._id===c._id&&(g=b.length)
            }
            f.length>0&&f[0].getLevel()<=a&&e(f)
        }
        var a=this.getLevel(),b=this.getStage(),c=this,d=0;
        return c.nodeType!=="Stage"&&e(c.getStage().getChildren()),d
    },
    getLevel:function(){
        var a=0,b=this.parent;
        while(b)a++,b=b.parent;
        return a
    },
    setScale:function(){
        this.setAttrs({
            scale:arguments
        })
    },
    getScale:function(){
        return this.attrs.scale
    },
    setPosition:function(){
        var a=Kinetic.GlobalObject._getXY(arguments);
        this.setAttrs(a)
    },
    setX:function(a){
        this.attrs.x=a
    },
    setY:function(a){
        this.attrs.y=a
    },
    getX:function(){
        return this.attrs.x
    },
    getY:function(){
        return this.attrs.y
    },
    setDetectionType:function(a){
        this.attrs.detectionType=a
    },
    getDetectionType:function(){
        return this.attrs.detectionType
    },
    getPosition:function(){
        return{
            x:this.attrs.x,
            y:this.attrs.y
        }
    },
    getAbsolutePosition:function(){
        return this.getAbsoluteTransform().getTranslation()
    },
    setAbsolutePosition:function(){
        var a=Kinetic.GlobalObject._getXY(arguments),b=this.attrs.rotation,c={
            x:this.attrs.scale.x,
            y:this.attrs.scale.y
        },d={
            x:this.attrs.centerOffset.x,
            y:this.attrs.centerOffset.y
        };
        
        this.attrs.rotation=0,this.attrs.scale={
            x:1,
            y:1
        };
    
        var e=this.getAbsoluteTransform();
        e.invert(),e.translate(a.x,a.y),a={
            x:this.attrs.x+e.getTranslation().x,
            y:this.attrs.y+e.getTranslation().y
        },this.setPosition(a.x,a.y),this.rotate(b),this.attrs.scale={
            x:c.x,
            y:c.y
        }
    },
    move:function(a,b){
        this.attrs.x+=a,this.attrs.y+=b
    },
    setRotation:function(a){
        this.attrs.rotation=a
    },
    setRotationDeg:function(a){
        this.attrs.rotation=a*Math.PI/180
    },
    getRotation:function(){
        return this.attrs.rotation
    },
    getRotationDeg:function(){
        return this.attrs.rotation*180/Math.PI
    },
    rotate:function(a){
        this.attrs.rotation+=a
    },
    rotateDeg:function(a){
        this.attrs.rotation+=a*Math.PI/180
    },
    listen:function(a){
        this.attrs.listening=a
    },
    moveToTop:function(){
        var a=this.index;
        this.parent.children.splice(a,1),this.parent.children.push(this),this.parent._setChildrenIndices()
    },
    moveUp:function(){
        var a=this.index;
        this.parent.children.splice(a,1),this.parent.children.splice(a+1,0,this),this.parent._setChildrenIndices()
    },
    moveDown:function(){
        var a=this.index;
        a>0&&(this.parent.children.splice(a,1),this.parent.children.splice(a-1,0,this),this.parent._setChildrenIndices())
    },
    moveToBottom:function(){
        var a=this.index;
        this.parent.children.splice(a,1),this.parent.children.unshift(this),this.parent._setChildrenIndices()
    },
    setZIndex:function(a){
        var b=this.index;
        this.parent.children.splice(b,1),this.parent.children.splice(a,0,this),this.parent._setChildrenIndices()
    },
    setAlpha:function(a){
        this.attrs.alpha=a
    },
    getAlpha:function(){
        return this.attrs.alpha
    },
    getAbsoluteAlpha:function(){
        var a=1,b=this;
        while(b.nodeType!=="Stage")a*=b.attrs.alpha,b=b.parent;
        return a
    },
    draggable:function(a){
        this.attrs.draggable!==a&&(a?this._listenDrag():this._dragCleanup(),this.attrs.draggable=a)
    },
    isDragging:function(){
        var a=Kinetic.GlobalObject;
        return a.drag.node!==undefined&&a.drag.node._id===this._id&&a.drag.moving
    },
    moveTo:function(a){
        var b=this.parent;
        b.children.splice(this.index,1),b._setChildrenIndices(),a.children.push(this),this.index=a.children.length-1,this.parent=a,a._setChildrenIndices()
    },
    getParent:function(){
        return this.parent
    },
    getLayer:function(){
        return this.nodeType==="Layer"?this:this.getParent().getLayer()
    },
    getStage:function(){
        return this.nodeType==="Stage"?this:this.getParent()===undefined?undefined:this.getParent().getStage()
    },
    getName:function(){
        return this.attrs.name
    },
    getId:function(){
        return this.attrs.id
    },
    simulate:function(a){
        var b=this.eventListeners[a];
        for(var c=0;c<b.length;c++)b[c].handler.call(this)
    },
    setCenterOffset:function(){
        this.setAttrs({
            centerOffset:arguments
        })
    },
    getCenterOffset:function(){
        return this.attrs.centerOffset
    },
    transitionTo:function(a){
        var b=Kinetic.GlobalObject;
        this.transAnim!==undefined&&(b._removeAnimation(this.transAnim),this.transAnim=undefined);
        var c=this.nodeType==="Stage"?this:this.getLayer(),d=this,e=new Kinetic.Transition(this,a),f={
            func:function(){
                e._onEnterFrame()
            },
            node:c
        };
    
        return this.transAnim=f,b._addAnimation(f),e.onFinished=function(){
            b._removeAnimation(f),d.transAnim=undefined,a.callback!==undefined&&a.callback(),f.node.draw()
        },e.start(),b._handleAnimation(),e
    },
    setDragConstraint:function(a){
        this.attrs.dragConstraint=a
    },
    getDragConstraint:function(){
        return this.attrs.dragConstraint
    },
    setDragBounds:function(a){
        this.attrs.dragBounds=a
    },
    getDragBounds:function(){
        return this.attrs.dragBounds
    },
    getAbsoluteTransform:function(){
        var a=new Kinetic.Transform,b=[],c=this.parent;
        b.unshift(this);
        while(c)b.unshift(c),c=c.parent;
        for(var d=0;d<b.length;d++){
            var e=b[d],f=e.getTransform();
            a.multiply(f)
        }
        return a
    },
    getTransform:function(){
        var a=new Kinetic.Transform;
        return(this.attrs.x!==0||this.attrs.y!==0)&&a.translate(this.attrs.x,this.attrs.y),this.attrs.rotation!==0&&a.rotate(this.attrs.rotation),(this.attrs.scale.x!==1||this.attrs.scale.y!==1)&&a.scale(this.attrs.scale.x,this.attrs.scale.y),a
    },
    _listenDrag:function(){
        this._dragCleanup();
        var a=Kinetic.GlobalObject,b=this;
        this.on("mousedown.initdrag touchstart.initdrag",function(a){
            b._initDrag()
        })
    },
    _initDrag:function(){
        var a=Kinetic.GlobalObject,b=this.getStage(),c=b.getUserPosition();
        if(c){
            var d=this.getTransform().getTranslation(),e=this.getAbsoluteTransform().getTranslation();
            a.drag.node=this,a.drag.offset.x=c.x-this.getAbsoluteTransform().getTranslation().x,a.drag.offset.y=c.y-this.getAbsoluteTransform().getTranslation().y
        }
    },
    _dragCleanup:function(){
        this.off("mousedown.initdrag"),this.off("touchstart.initdrag")
    },
    _handleEvents:function(a,b){
        this.nodeType==="Shape"&&(b.shape=this);
        var c=this.getStage();
        this._handleEvent(this,c.mouseoverShape,c.mouseoutShape,a,b)
    },
    _handleEvent:function(a,b,c,d,e){
        var f=a.eventListeners,g=!0;
        d==="mouseover"&&c&&c._id===a._id?g=!1:d==="mouseout"&&b&&b._id===a._id&&(g=!1);
        if(f[d]&&g){
            var h=f[d];
            for(var i=0;i<h.length;i++)h[i].handler.apply(a,[e])
        }
        var j=b?b.parent:undefined,k=c?c.parent:undefined;
        !e.cancelBubble&&a.parent&&a.parent.nodeType!=="Stage"&&this._handleEvent(a.parent,j,k,d,e)
    }
},Kinetic.Container=function(){
    this.children=[]
},Kinetic.Container.prototype={
    getChildren:function(){
        return this.children
    },
    removeChildren:function(){
        while(this.children.length>0)this.remove(this.children[0])
    },
    add:function(a){
        a._id=Kinetic.GlobalObject.idCounter++,a.index=this.children.length,a.parent=this,this.children.push(a);
        var b=a.getStage();
        if(b===undefined){
            var c=Kinetic.GlobalObject;
            c.tempNodes.push(a)
        }else{
            b._addId(a),b._addName(a);
            var c=Kinetic.GlobalObject;
            c._pullNodes(b)
        }
        return this._add!==undefined&&this._add(a),this
    },
    remove:function(a){
        if(a&&a.index!==undefined&&this.children[a.index]._id==a._id){
            var b=this.getStage();
            b!==undefined&&(b._removeId(a),b._removeName(a));
            var c=Kinetic.GlobalObject;
            for(var d=0;d<c.tempNodes.length;d++){
                var e=c.tempNodes[d];
                if(e._id===a._id){
                    c.tempNodes.splice(d,1);
                    break
                }
            }
            this.children.splice(a.index,1),this._setChildrenIndices();
            if(a.children)for(var d=0;d<a.children.length;d++)a.remove(a.children[d]);
            this._remove!==undefined&&this._remove(a)
        }
        return this
    },
    get:function(a){
        var b=this.getStage(),c,d=a.slice(1);
        if(a.charAt(0)==="#")c=b.ids[d]!==undefined?[b.ids[d]]:[];
        else{
            if(a.charAt(0)!==".")return a==="Shape"||a==="Group"||a==="Layer"?this._getNodes(a):!1;
            c=b.names[d]!==undefined?b.names[d]:[]
        }
        var e=[];
        for(var f=0;f<c.length;f++){
            var g=c[f];
            this.isAncestorOf(g)&&e.push(g)
        }
        return e
    },
    isAncestorOf:function(a){
        if(this.nodeType==="Stage")return!0;
        var b=a.getParent();
        while(b){
            if(b._id===this._id)return!0;
            b=b.getParent()
        }
        return!1
    },
    _getNodes:function(a){
        function c(d){
            var e=d.getChildren();
            for(var f=0;f<e.length;f++){
                var g=e[f];
                g.nodeType===a?b.push(g):g.nodeType!=="Shape"&&c(g)
            }
        }
        var b=[];
        return c(this),b
    },
    _drawChildren:function(){
        var a=this.getStage(),b=this.children;
        for(var c=0;c<b.length;c++){
            var d=b[c];
            d.nodeType==="Shape"?d.isVisible()&&a.isVisible()&&d._draw(d.getLayer()):d.draw()
        }
    },
    _setChildrenIndices:function(){
        if(this.nodeType==="Stage"){
            var a=this.content.children,b=a[0],c=a[1];
            this.content.innerHTML="",this.content.appendChild(b),this.content.appendChild(c)
        }
        for(var d=0;d<this.children.length;d++)this.children[d].index=d,this.nodeType==="Stage"&&this.content.appendChild(this.children[d].canvas)
    }
},Kinetic.Stage=function(a){
    this.setDefaultAttrs({
        width:400,
        height:200,
        throttle:80
    }),this.nodeType="Stage",this.lastEventTime=0,typeof a.container=="string"&&(a.container=document.getElementById(a.container)),Kinetic.Container.apply(this,[]),Kinetic.Node.apply(this,[a]),this.content=document.createElement("div"),this.dblClickWindow=400,this._setStageDefaultProperties(),this._id=Kinetic.GlobalObject.idCounter++,this._buildDOM(),this._listen(),this._prepareDrag();
    var b=Kinetic.GlobalObject;
    b.stages.push(this),this._addId(this),this._addName(this)
},Kinetic.Stage.prototype={
    onFrame:function(a){
        var b=Kinetic.GlobalObject;
        this.anim={
            func:a
        }
    },
    start:function(){
        if(!this.animRunning){
            var a=Kinetic.GlobalObject;
            a._addAnimation(this.anim),a._handleAnimation(),this.animRunning=!0
        }
    },
    stop:function(){
        var a=Kinetic.GlobalObject;
        a._removeAnimation(this.anim),this.animRunning=!1
    },
    draw:function(){
        this._drawChildren()
    },
    setSize:function(){
        var a=Kinetic.GlobalObject._getSize(arguments);
        this.setAttrs(a),this.attrs.width=Math.round(this.attrs.width),this.attrs.height=Math.round(this.attrs.height);
        var b=this.attrs.width,c=this.attrs.height;
        this.content.style.width=b+"px",this.content.style.height=c+"px",this.bufferLayer.getCanvas().width=b,this.bufferLayer.getCanvas().height=c,this.pathLayer.getCanvas().width=b,this.pathLayer.getCanvas().height=c;
        var d=this.children;
        for(var e=0;e<d.length;e++){
            var f=d[e];
            f.getCanvas().width=b,f.getCanvas().height=c,f.draw()
        }
    },
    getSize:function(){
        return{
            width:this.attrs.width,
            height:this.attrs.height
        }
    },
    clear:function(){
        var a=this.children;
        for(var b=0;b<a.length;b++)a[b].clear()
    },
    toDataURL:function(a,b,c){
        function h(g){
            var i=f[g].getCanvas().toDataURL(),j=new Image;
            j.onload=function(){
                e.drawImage(this,0,0),g++;
                if(g<f.length)h(g);else try{
                    a(d.getCanvas().toDataURL(b,c))
                }catch(i){
                    a(d.getCanvas().toDataURL())
                }
            },j.src=i
        }
        var d=this.bufferLayer,e=d.getContext(),f=this.children,g=this;
        d.clear(),h(0)
    },
    toJSON:function(){
        function b(c){
            var d={},e=c.attrs;
            for(var f in e){
                var g=e[f];
                if(a._isFunction(g)||a._isElement(g)||a._hasMethods(g))e[f]=undefined
            }
            d.attrs=e,d.nodeType=c.nodeType,d.shapeType=c.shapeType;
            if(c.nodeType!=="Shape"){
                d.children=[];
                var h=c.getChildren();
                for(var i=0;i<h.length;i++){
                    var j=h[i];
                    d.children.push(b(j))
                }
            }
            return d
        }
        var a=Kinetic.GlobalObject;
        return JSON.stringify(b(this))
    },
    reset:function(){
        this.removeChildren(),this._setStageDefaultProperties(),this.setAttrs(this.defaultNodeAttrs)
    },
    load:function(a){
        function b(a,c){
            var d=c.children;
            if(d!==undefined)for(var e=0;e<d.length;e++){
                var f=d[e],g;
                f.nodeType==="Shape"?f.shapeType===undefined?g="Shape":g=f.shapeType:g=f.nodeType;
                var h=new Kinetic[g](f.attrs);
                a.add(h),b(h,f)
            }
        }
        this.reset();
        var c=JSON.parse(a);
        this.attrs=c.attrs,b(this,c),this.draw()
    },
    getMousePosition:function(a){
        return this.mousePos
    },
    getTouchPosition:function(a){
        return this.touchPos
    },
    getUserPosition:function(a){
        return this.getTouchPosition()||this.getMousePosition()
    },
    getContainer:function(){
        return this.attrs.container
    },
    getContent:function(){
        return this.content
    },
    getStage:function(){
        return this
    },
    getWidth:function(){
        return this.attrs.width
    },
    getHeight:function(){
        return this.attrs.height
    },
    getIntersections:function(){
        var a=Kinetic.GlobalObject._getXY(arguments),b=[],c=this.get("Shape");
        for(var d=0;d<c.length;d++){
            var e=c[d];
            e.intersects(a)&&b.push(e)
        }
        return b
    },
    getDOM:function(){
        return this.content
    },
    _remove:function(a){
        try{
            this.content.removeChild(a.canvas)
        }catch(b){}
    },
    _add:function(a){
        a.canvas.width=this.attrs.width,a.canvas.height=this.attrs.height,a.draw(),this.content.appendChild(a.canvas),a.lastDrawTime=0
    },
    _detectEvent:function(a,b){
        var c=Kinetic.GlobalObject.drag.moving,d=Kinetic.GlobalObject,e=this.getUserPosition(),f=a.eventListeners;
        this.targetShape&&a._id===this.targetShape._id&&(this.targetFound=!0);
        if(a.isVisible()&&e!==undefined&&a.intersects(e)){
            if(!c&&this.mouseDown)return this.mouseDown=!1,this.clickStart=!0,a._handleEvents("mousedown",b),!0;
            if(this.mouseUp)return this.mouseUp=!1,a._handleEvents("mouseup",b),this.clickStart&&(!d.drag.moving||!d.drag.node)&&(a._handleEvents("click",b),a.inDoubleClickWindow&&a._handleEvents("dblclick",b),a.inDoubleClickWindow=!0,setTimeout(function(){
                a.inDoubleClickWindow=!1
            },this.dblClickWindow)),!0;
            if(!c&&this.touchStart)return this.touchStart=!1,this.tapStart=!0,a._handleEvents("touchstart",b),!0;
            if(this.touchEnd)return this.touchEnd=!1,a._handleEvents("touchend",b),this.tapStart&&(!d.drag.moving||!d.drag.node)&&(a._handleEvents("tap",b),a.inDoubleClickWindow&&a._handleEvents("dbltap",b),a.inDoubleClickWindow=!0,setTimeout(function(){
                a.inDoubleClickWindow=!1
            },this.dblClickWindow)),!0;
            if(!c&&this._isNewTarget(a,b))return this.mouseoutShape&&(this.mouseoverShape=a,this.mouseoutShape._handleEvents("mouseout",b),this.mouseoverShape=undefined),a._handleEvents("mouseover",b),this._setTarget(a),!0;
            if(!c&&this.mouseMove)return a._handleEvents("mousemove",b),!0;
            if(!c&&this.touchMove)return a._handleEvents("touchmove",b),!0
        }else if(!c&&this.targetShape&&this.targetShape._id===a._id)return this._setTarget(undefined),this.mouseoutShape=a,!0;
        return!1
    },
    _setTarget:function(a){
        this.targetShape=a,this.targetFound=!0
    },
    _isNewTarget:function(a,b){
        if(!this.targetShape||!this.targetFound&&a._id!==this.targetShape._id){
            if(this.targetShape){
                var c=this.targetShape.eventListeners;
                c&&(this.mouseoutShape=this.targetShape)
            }
            return!0
        }
        return!1
    },
    _traverseChildren:function(a,b){
        var c=a.children;
        for(var d=c.length-1;d>=0;d--){
            var e=c[d];
            if(e.attrs.listening)if(e.nodeType==="Shape"){
                var f=this._detectEvent(e,b);
                if(f)return!0
            }else{
                var f=this._traverseChildren(e,b);
                if(f)return!0
            }
        }
        return!1
    },
    _handleStageEvent:function(a){
        var b=new Date,c=b.getTime();
        this.lastEventTime=c;
        var d=Kinetic.GlobalObject;
        a||(a=window.event),this._setMousePosition(a),this._setTouchPosition(a),this.pathLayer.clear(),this.targetFound=!1;
        var e=!1;
        for(var f=this.children.length-1;f>=0;f--){
            var g=this.children[f];
            g.isVisible()&&f>=0&&g.attrs.listening&&this._traverseChildren(g,a)&&(f=-1,e=!0)
        }!e&&this.mouseoutShape&&(this.mouseoutShape._handleEvents("mouseout",a),this.mouseoutShape=undefined)
    },
    _listen:function(){
        var a=Kinetic.GlobalObject,b=this;
        this.content.addEventListener("mousedown",function(a){
            b.mouseDown=!0,b.mouseUp=!1,b.mouseMove=!1,b._handleStageEvent(a),b.attrs.draggable&&b._initDrag()
        },!1),this.content.addEventListener("mousemove",function(a){
            var c=b.attrs.throttle,d=new Date,e=d.getTime(),f=e-b.lastEventTime,g=1e3/c;
            f>=g&&(b.mouseDown=!1,b.mouseUp=!1,b.mouseMove=!0,b._handleStageEvent(a))
        },!1),this.content.addEventListener("mouseup",function(a){
            b.mouseDown=!1,b.mouseUp=!0,b.mouseMove=!1,b._handleStageEvent(a),b.clickStart=!1
        },!1),this.content.addEventListener("mouseover",function(a){
            b._handleStageEvent(a)
        },!1),this.content.addEventListener("mouseout",function(a){
            var c=b.targetShape;
            c&&(c._handleEvents("mouseout",a),b.targetShape=undefined),b.mousePos=undefined
        },!1),this.content.addEventListener("touchstart",function(a){
            a.preventDefault(),b.touchStart=!0,b.touchEnd=!1,b.touchMove=!1,b._handleStageEvent(a),b.attrs.draggable&&b._initDrag()
        },!1),this.content.addEventListener("touchmove",function(a){
            var c=b.attrs.throttle,d=new Date,e=d.getTime(),f=e-b.lastEventTime,g=1e3/c;
            f>=g&&(a.preventDefault(),b.touchStart=!1,b.touchEnd=!1,b.touchMove=!0,b._handleStageEvent(a))
        },!1),this.content.addEventListener("touchend",function(a){
            b.touchStart=!1,b.touchEnd=!0,b.touchMove=!1,b._handleStageEvent(a),b.tapStart=!1
        },!1)
    },
    _setMousePosition:function(a){
        var b=a.offsetX||a.clientX-this._getContentPosition().left+window.pageXOffset,c=a.offsetY||a.clientY-this._getContentPosition().top+window.pageYOffset;
        this.mousePos={
            x:b,
            y:c
        }
    },
    _setTouchPosition:function(a){
        if(a.touches!==undefined&&a.touches.length===1){
            var b=a.touches[0],c=b.clientX-this._getContentPosition().left+window.pageXOffset,d=b.clientY-this._getContentPosition().top+window.pageYOffset;
            this.touchPos={
                x:c,
                y:d
            }
        }
    },
    _getContentPosition:function(){
        var a=this.content,b=0,c=0;
        while(a&&a.tagName!=="BODY")b+=a.offsetTop-a.scrollTop,c+=a.offsetLeft-a.scrollLeft,a=a.offsetParent;
        return{
            top:b,
            left:c
        }
    },
    _modifyPathContext:function(a){
        a.stroke=function(){},a.fill=function(){},a.fillRect=function(b,c,d,e){
            a.rect(b,c,d,e)
        },a.strokeRect=function(b,c,d,e){
            a.rect(b,c,d,e)
        },a.drawImage=function(){},a.fillText=function(){},a.strokeText=function(){}
    },
    _endDrag:function(a){
        var b=Kinetic.GlobalObject;
        b.drag.node&&b.drag.moving&&(b.drag.moving=!1,b.drag.node._handleEvents("dragend",a)),b.drag.node=undefined
    },
    _prepareDrag:function(){
        var a=this;
        this._onContent("mousemove touchmove",function(b){
            var c=Kinetic.GlobalObject,d=c.drag.node;
            if(d){
                var e=a.getUserPosition(),f=d.attrs.dragConstraint,g=d.attrs.dragBounds,h={
                    x:d.attrs.x,
                    y:d.attrs.y
                },i={
                    x:e.x-c.drag.offset.x,
                    y:e.y-c.drag.offset.y
                };
                
                g.left!==undefined&&i.x<g.left&&(i.x=g.left),g.right!==undefined&&i.x>g.right&&(i.x=g.right),g.top!==undefined&&i.y<g.top&&(i.y=g.top),g.bottom!==undefined&&i.y>g.bottom&&(i.y=g.bottom),d.setAbsolutePosition(i),f==="horizontal"?d.attrs.y=h.y:f==="vertical"&&(d.attrs.x=h.x),c.drag.node.nodeType==="Stage"?c.drag.node.draw():c.drag.node.getLayer().draw(),c.drag.moving||(c.drag.moving=!0,c.drag.node._handleEvents("dragstart",b)),c.drag.node._handleEvents("dragmove",b)
            }
        },!1),this._onContent("mouseup touchend mouseout",function(b){
            a._endDrag(b)
        })
    },
    _buildDOM:function(){
        this.content.style.position="relative",this.content.style.display="inline-block",this.content.className="kineticjs-content",this.attrs.container.appendChild(this.content),this.bufferLayer=new Kinetic.Layer({
            name:"bufferLayer"
        }),this.pathLayer=new Kinetic.Layer({
            name:"pathLayer"
        }),this.bufferLayer.parent=this,this.pathLayer.parent=this,this._modifyPathContext(this.pathLayer.context),this.bufferLayer.getCanvas().style.display="none",this.pathLayer.getCanvas().style.display="none",this.bufferLayer.canvas.className="kineticjs-buffer-layer",this.content.appendChild(this.bufferLayer.canvas),this.pathLayer.canvas.className="kineticjs-path-layer",this.content.appendChild(this.pathLayer.canvas),this.setSize(this.attrs.width,this.attrs.height)
    },
    _addId:function(a){
        a.attrs.id!==undefined&&(this.ids[a.attrs.id]=a)
    },
    _removeId:function(a){
        a.attrs.id!==undefined&&(this.ids[a.attrs.id]=undefined)
    },
    _addName:function(a){
        var b=a.attrs.name;
        b!==undefined&&(this.names[b]===undefined&&(this.names[b]=[]),this.names[b].push(a))
    },
    _removeName:function(a){
        if(a.attrs.name!==undefined){
            var b=this.names[a.attrs.name];
            if(b!==undefined){
                for(var c=0;c<b.length;c++){
                    var d=b[c];
                    d._id===a._id&&b.splice(c,1)
                }
                b.length===0&&(this.names[a.attrs.name]=undefined)
            }
        }
    },
    _onContent:function(a,b){
        var c=a.split(" ");
        for(var d=0;d<c.length;d++){
            var e=c[d];
            this.content.addEventListener(e,b,!1)
        }
    },
    _setStageDefaultProperties:function(){
        this.targetShape=undefined,this.targetFound=!1,this.mouseoverShape=undefined,this.mouseoutShape=undefined,this.mousePos=undefined,this.mouseDown=!1,this.mouseUp=!1,this.mouseMove=!1,this.clickStart=!1,this.touchPos=undefined,this.touchStart=!1,this.touchEnd=!1,this.touchMove=!1,this.tapStart=!1,this.ids={},this.names={},this.anim=undefined,this.animRunning=!1
    }
},Kinetic.GlobalObject.extend(Kinetic.Stage,Kinetic.Container),Kinetic.GlobalObject.extend(Kinetic.Stage,Kinetic.Node),Kinetic.Layer=function(a){
    this.setDefaultAttrs({
        throttle:80
    }),this.nodeType="Layer",this.lastDrawTime=0,this.beforeDrawFunc=undefined,this.afterDrawFunc=undefined,this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.canvas.style.position="absolute",Kinetic.Container.apply(this,[]),Kinetic.Node.apply(this,[a])
},Kinetic.Layer.prototype={
    draw:function(){
        var a=this.attrs.throttle,b=new Date,c=b.getTime(),d=c-this.lastDrawTime,e=1e3/a;
        if(d>=e)this._draw(),this.drawTimeout!==undefined&&(clearTimeout(this.drawTimeout),this.drawTimeout=undefined);
        else if(this.drawTimeout===undefined){
            var f=this;
            this.drawTimeout=setTimeout(function(){
                f.draw()
            },17)
        }
    },
    setThrottle:function(a){
        this.attrs.throttle=a
    },
    getThrottle:function(){
        return this.attrs.throttle
    },
    beforeDraw:function(a){
        this.beforeDrawFunc=a
    },
    afterDraw:function(a){
        this.afterDrawFunc=a
    },
    clear:function(){
        var a=this.getContext(),b=this.getCanvas();
        a.clearRect(0,0,b.width,b.height)
    },
    getCanvas:function(){
        return this.canvas
    },
    getContext:function(){
        return this.context
    },
    _draw:function(){
        var a=new Date,b=a.getTime();
        this.lastDrawTime=b,this.beforeDrawFunc!==undefined&&this.beforeDrawFunc.call(this),this.clear(),this.isVisible()&&(this.attrs.drawFunc!==undefined&&this.attrs.drawFunc.call(this),this._drawChildren()),this.afterDrawFunc!==undefined&&this.afterDrawFunc.call(this)
    }
},Kinetic.GlobalObject.extend(Kinetic.Layer,Kinetic.Container),Kinetic.GlobalObject.extend(Kinetic.Layer,Kinetic.Node),Kinetic.Group=function(a){
    this.nodeType="Group",Kinetic.Container.apply(this,[]),Kinetic.Node.apply(this,[a])
},Kinetic.Group.prototype={
    draw:function(){
        this.attrs.visible&&this._drawChildren()
    }
},Kinetic.GlobalObject.extend(Kinetic.Group,Kinetic.Container),Kinetic.GlobalObject.extend(Kinetic.Group,Kinetic.Node),Kinetic.Shape=function(a){
    this.setDefaultAttrs({
        fill:undefined,
        stroke:undefined,
        strokeWidth:undefined,
        lineJoin:undefined,
        detectionType:"path",
        shadow:{
            blur:10,
            alpha:1,
            offset:{
                x:0,
                y:0
            }
        }
    }),this.data=[],this.nodeType="Shape",this.appliedShadow=!1,Kinetic.Node.apply(this,[a])
},Kinetic.Shape.prototype={
    getContext:function(){
        return this.tempLayer===undefined?null:this.tempLayer.getContext()
    },
    getCanvas:function(){
        return this.tempLayer.getCanvas()
    },
    stroke:function(){
        var a=!1,b=this.getContext();
        b.save();
        if(!!this.attrs.stroke||!!this.attrs.strokeWidth){
            this.appliedShadow||(a=this._applyShadow());
            var c=this.attrs.stroke?this.attrs.stroke:"black",d=this.attrs.strokeWidth?this.attrs.strokeWidth:2;
            b.lineWidth=d,b.strokeStyle=c,b.stroke()
        }
        b.restore(),a&&this.stroke()
    },
    fill:function(){
        var a=!1,b=this.getContext();
        b.save();
        var c=this.attrs.fill;
        if(!!c){
            this.appliedShadow||(a=this._applyShadow());
            var d=c.start,e=c.end,f=null;
            if(typeof c=="string")f=this.attrs.fill,b.fillStyle=f,b.fill();
            else if(c.image!==undefined){
                var g=c.repeat===undefined?"repeat":c.repeat;
                f=b.createPattern(c.image,g),b.save(),c.offset!==undefined&&b.translate(c.offset.x,c.offset.y),b.fillStyle=f,b.fill(),b.restore()
            }else if(d.radius===undefined&&e.radius===undefined){
                var b=this.getContext(),h=b.createLinearGradient(d.x,d.y,e.x,e.y),i=c.colorStops;
                for(var j=0;j<i.length;j+=2)h.addColorStop(i[j],i[j+1]);
                f=h,b.fillStyle=f,b.fill()
            }else if(d.radius!==undefined&&e.radius!==undefined){
                var b=this.getContext(),h=b.createRadialGradient(d.x,d.y,d.radius,e.x,e.y,e.radius),i=c.colorStops;
                for(var j=0;j<i.length;j+=2)h.addColorStop(i[j],i[j+1]);
                f=h,b.fillStyle=f,b.fill()
            }else f="black",b.fillStyle=f,b.fill()
        }
        b.restore(),a&&this.fill()
    },
    fillText:function(a,b,c){
        var d=!1,e=this.getContext();
        e.save(),this.attrs.textFill!==undefined&&(this.appliedShadow||(d=this._applyShadow()),e.fillStyle=this.attrs.textFill,e.fillText(a,b,c)),e.restore(),d&&this.fillText(a,b,c)
    },
    strokeText:function(a,b,c){
        var d=!1,e=this.getContext();
        e.save();
        if(this.attrs.textStroke!==undefined||this.attrs.textStrokeWidth!==undefined)this.appliedShadow||(d=this._applyShadow()),this.attrs.textStroke===undefined?this.attrs.textStroke="black":this.attrs.textStrokeWidth===undefined&&(this.attrs.textStrokeWidth=2),e.lineWidth=this.attrs.textStrokeWidth,e.strokeStyle=this.attrs.textStroke,e.strokeText(a,b,c);
        e.restore(),d&&this.strokeText(a,b,c)
    },
    drawImage:function(){
        var a=!1,b=this.getContext();
        b.save();
        var c=arguments;
        if(c.length===5||c.length===9){
            this.appliedShadow||(a=this._applyShadow());
            switch(c.length){
                case 5:
                    b.drawImage(c[0],c[1],c[2],c[3],c[4]);
                    break;
                case 9:
                    b.drawImage(c[0],c[1],c[2],c[3],c[4],c[5],c[6],c[7],c[8])
            }
        }
        b.restore(),a&&this.drawImage.apply(this,arguments)
    },
    applyLineJoin:function(){
        var a=this.getContext();
        this.attrs.lineJoin!==undefined&&(a.lineJoin=this.attrs.lineJoin)
    },
    _applyShadow:function(){
        var a=this.getContext(),b=this.attrs.shadow;
        if(b!==undefined){
            var c=this.getAbsoluteAlpha(),d=this.attrs.shadow.alpha;
            if(d!==undefined&&b.color!==undefined)return a.globalAlpha=d*c,a.shadowColor=b.color,a.shadowBlur=b.blur,a.shadowOffsetX=b.offset.x,a.shadowOffsetY=b.offset.y,this.appliedShadow=!0,!0
        }
        return!1
    },
    setFill:function(a){
        this.setAttrs({
            fill:a
        })
    },
    getFill:function(){
        return this.attrs.fill
    },
    setStroke:function(a){
        this.attrs.stroke=a
    },
    getStroke:function(){
        return this.attrs.stroke
    },
    setLineJoin:function(a){
        this.attrs.lineJoin=a
    },
    getLineJoin:function(){
        return this.attrs.lineJoin
    },
    setStrokeWidth:function(a){
        this.attrs.strokeWidth=a
    },
    getStrokeWidth:function(){
        return this.attrs.strokeWidth
    },
    setShadow:function(a){
        this.setAttrs({
            shadow:a
        })
    },
    getShadow:function(){
        return this.attrs.shadow
    },
    setDrawFunc:function(a){
        this.attrs.drawFunc=a
    },
    saveData:function(){
        var a=this.getStage(),b=a.attrs.width,c=a.attrs.height,d=a.bufferLayer,e=d.getContext();
        d.clear(),this._draw(d);
        var f=e.getImageData(0,0,b,c);
        this.data=f.data
    },
    clearData:function(){
        this.data=[]
    },
    intersects:function(){
        var a=Kinetic.GlobalObject._getXY(arguments),b=this.getStage();
        if(this.attrs.detectionType==="path"){
            var c=b.pathLayer,d=c.getContext();
            return this._draw(c),d.isPointInPath(a.x,a.y)
        }
        var e=b.attrs.width,f=this.data[(e*a.y+a.x)*4+3];
        return f!==undefined&&f!==0
    },
    _draw:function(a){
        if(a!==undefined&&this.attrs.drawFunc!==undefined){
            var b=a.getStage(),c=a.getContext(),d=[],e=this.parent;
            d.unshift(this);
            while(e)d.unshift(e),e=e.parent;
            c.save();
            for(var f=0;f<d.length;f++){
                var g=d[f],h=g.getTransform();
                (g.attrs.centerOffset.x!==0||g.attrs.centerOffset.y!==0)&&h.translate(-1*g.attrs.centerOffset.x,-1*g.attrs.centerOffset.y);
                var i=h.getMatrix();
                c.transform(i[0],i[1],i[2],i[3]
                    ,i[4],i[5])
            }
            this.tempLayer=a,this.getAbsoluteAlpha()!==1&&(c.globalAlpha=this.getAbsoluteAlpha()),this.applyLineJoin(),this.appliedShadow=!1,this.attrs.drawFunc.call(this),c.restore()
        }
    }
},Kinetic.GlobalObject.extend(Kinetic.Shape,Kinetic.Node),Kinetic.Rect=function(a){
    this.setDefaultAttrs({
        width:0,
        height:0,
        cornerRadius:0
    }),this.shapeType="Rect",a.drawFunc=function(){
        var a=this.getContext();
        a.beginPath(),this.attrs.cornerRadius===0?a.rect(0,0,this.attrs.width,this.attrs.height):(a.moveTo(this.attrs.cornerRadius,0),a.lineTo(this.attrs.width-this.attrs.cornerRadius,0),a.arc(this.attrs.width-this.attrs.cornerRadius,this.attrs.cornerRadius,this.attrs.cornerRadius,Math.PI*3/2,0,!1),a.lineTo(this.attrs.width,this.attrs.height-this.attrs.cornerRadius),a.arc(this.attrs.width-this.attrs.cornerRadius,this.attrs.height-this.attrs.cornerRadius,this.attrs.cornerRadius,0,Math.PI/2,!1),a.lineTo(this.attrs.cornerRadius,this.attrs.height),a.arc(this.attrs.cornerRadius,this.attrs.height-this.attrs.cornerRadius,this.attrs.cornerRadius,Math.PI/2,Math.PI,!1),a.lineTo(0,this.attrs.cornerRadius),a.arc(this.attrs.cornerRadius,this.attrs.cornerRadius,this.attrs.cornerRadius,Math.PI,Math.PI*3/2,!1)),a.closePath(),this.fill(),this.stroke()
    },Kinetic.Shape.apply(this,[a])
},Kinetic.Rect.prototype={
    setWidth:function(a){
        this.attrs.width=a
    },
    getWidth:function(){
        return this.attrs.width
    },
    setHeight:function(a){
        this.attrs.height=a
    },
    getHeight:function(){
        return this.attrs.height
    },
    setSize:function(){
        var a=Kinetic.GlobalObject._getSize(arguments);
        this.setAttrs(a)
    },
    getSize:function(){
        return{
            width:this.attrs.width,
            height:this.attrs.height
        }
    },
    setCornerRadius:function(a){
        this.attrs.cornerRadius=a
    },
    getCornerRadius:function(){
        return this.attrs.cornerRadius
    }
},Kinetic.GlobalObject.extend(Kinetic.Rect,Kinetic.Shape),Kinetic.Circle=function(a){
    this.setDefaultAttrs({
        radius:0
    }),this.shapeType="Circle",a.drawFunc=function(){
        var a=this.getCanvas(),b=this.getContext();
        b.beginPath(),b.arc(0,0,this.attrs.radius,0,Math.PI*2,!0),b.closePath(),this.fill(),this.stroke()
    },Kinetic.Shape.apply(this,[a])
},Kinetic.Circle.prototype={
    setRadius:function(a){
        this.attrs.radius=a
    },
    getRadius:function(){
        return this.attrs.radius
    }
},Kinetic.GlobalObject.extend(Kinetic.Circle,Kinetic.Shape),Kinetic.Image=function(a){
    this.setDefaultAttrs({
        crop:{
            x:0,
            y:0,
            width:undefined,
            height:undefined
        }
    }),this.shapeType="Image",a.drawFunc=function(){
        if(this.attrs.image!==undefined){
            var a=this.attrs.width!==undefined?this.attrs.width:this.attrs.image.width,b=this.attrs.height!==undefined?this.attrs.height:this.attrs.image.height,c=this.attrs.crop.x,d=this.attrs.crop.y,e=this.attrs.crop.width,f=this.attrs.crop.height,g=this.getCanvas(),h=this.getContext();
            h.beginPath(),h.rect(0,0,a,b),h.closePath(),this.fill(),this.stroke(),e!==undefined&&f!==undefined?this.drawImage(this.attrs.image,c,d,e,f,0,0,a,b):this.drawImage(this.attrs.image,0,0,a,b)
        }
    },Kinetic.Shape.apply(this,[a])
},Kinetic.Image.prototype={
    setImage:function(a){
        this.attrs.image=a
    },
    getImage:function(){
        return this.attrs.image
    },
    setWidth:function(a){
        this.attrs.width=a
    },
    getWidth:function(){
        return this.attrs.width
    },
    setHeight:function(a){
        this.attrs.height=a
    },
    getHeight:function(){
        return this.attrs.height
    },
    setSize:function(){
        var a=Kinetic.GlobalObject._getSize(arguments);
        this.setAttrs(a)
    },
    getSize:function(){
        return{
            width:this.attrs.width,
            height:this.attrs.height
        }
    },
    getCrop:function(){
        return this.attrs.crop
    },
    setCrop:function(){
        this.setAttrs({
            crop:arguments
        })
    }
},Kinetic.GlobalObject.extend(Kinetic.Image,Kinetic.Shape),Kinetic.Sprite=function(a){
    this.setDefaultAttrs({
        index:0,
        frameRate:17
    }),a.drawFunc=function(){
        if(this.attrs.image!==undefined){
            var a=this.getContext(),b=this.attrs.animation,c=this.attrs.index,d=this.attrs.animations[b][c];
            a.beginPath(),a.rect(0,0,d.width,d.height),a.closePath(),this.drawImage(this.attrs.image,d.x,d.y,d.width,d.height,0,0,d.width,d.height)
        }
    },Kinetic.Shape.apply(this,[a])
},Kinetic.Sprite.prototype={
    start:function(){
        var a=this,b=this.getLayer();
        this.interval=setInterval(function(){
            a._updateIndex(),b.draw(),a.afterFrameFunc&&a.attrs.index===a.afterFrameIndex&&a.afterFrameFunc()
        },1e3/this.attrs.frameRate)
    },
    stop:function(){
        clearInterval(this.interval)
    },
    afterFrame:function(a,b){
        this.afterFrameIndex=a,this.afterFrameFunc=b
    },
    setAnimation:function(a){
        this.attrs.animation=a
    },
    setAnimations:function(a){
        this.attrs.animations=a
    },
    getAnimations:function(){
        return this.attrs.animations
    },
    getAnimation:function(){
        return this.attrs.animation
    },
    setIndex:function(a){
        this.attrs.index=a
    },
    _updateIndex:function(){
        var a=this.attrs.index,b=this.attrs.animation;
        a<this.attrs.animations[b].length-1?this.attrs.index++:this.attrs.index=0
    }
},Kinetic.GlobalObject.extend(Kinetic.Sprite,Kinetic.Shape),Kinetic.Polygon=function(a){
    this.setDefaultAttrs({
        points:[]
    }),this.shapeType="Polygon",a.drawFunc=function(){
        var a=this.getContext();
        a.beginPath(),a.moveTo(this.attrs.points[0].x,this.attrs.points[0].y);
        for(var b=1;b<this.attrs.points.length;b++)a.lineTo(this.attrs.points[b].x,this.attrs.points[b].y);
        a.closePath(),this.fill(),this.stroke()
    },Kinetic.Shape.apply(this,[a])
},Kinetic.Polygon.prototype={
    setPoints:function(a){
        this.setAttrs({
            points:a
        })
    },
    getPoints:function(){
        return this.attrs.points
    }
},Kinetic.GlobalObject.extend(Kinetic.Polygon,Kinetic.Shape),Kinetic.RegularPolygon=function(a){
    this.setDefaultAttrs({
        radius:0,
        sides:0
    }),this.shapeType="RegularPolygon",a.drawFunc=function(){
        var a=this.getContext();
        a.beginPath(),a.moveTo(0,0-this.attrs.radius);
        for(var b=1;b<this.attrs.sides;b++){
            var c=this.attrs.radius*Math.sin(b*2*Math.PI/this.attrs.sides),d=-1*this.attrs.radius*Math.cos(b*2*Math.PI/this.attrs.sides);
            a.lineTo(c,d)
        }
        a.closePath(),this.fill(),this.stroke()
    },Kinetic.Shape.apply(this,[a])
},Kinetic.RegularPolygon.prototype={
    setRadius:function(a){
        this.attrs.radius=a
    },
    getRadius:function(){
        return this.attrs.radius
    },
    setSides:function(a){
        this.attrs.sides=a
    },
    getSides:function(){
        return this.attrs.sides
    }
},Kinetic.GlobalObject.extend(Kinetic.RegularPolygon,Kinetic.Shape),Kinetic.Star=function(a){
    this.setDefaultAttrs({
        numPoints:0,
        innerRadius:0,
        outerRadius:0
    }),this.shapeType="Star",a.drawFunc=function(){
        var a=this.getContext();
        a.beginPath(),a.moveTo(0,0-this.attrs.outerRadius);
        for(var b=1;b<this.attrs.numPoints*2;b++){
            var c=b%2===0?this.attrs.outerRadius:this.attrs.innerRadius,d=c*Math.sin(b*Math.PI/this.attrs.numPoints),e=-1*c*Math.cos(b*Math.PI/this.attrs.numPoints);
            a.lineTo(d,e)
        }
        a.closePath(),this.fill(),this.stroke()
    },Kinetic.Shape.apply(this,[a])
},Kinetic.Star.prototype={
    setNumPoints:function(a){
        this.attrs.numPoints=a
    },
    getNumPoints:function(){
        return this.attrs.numPoints
    },
    setOuterRadius:function(a){
        this.attrs.outerRadius=a
    },
    getOuterRadius:function(){
        return this.attrs.outerRadius
    },
    setInnerRadius:function(a){
        this.attrs.innerRadius=a
    },
    getInnerRadius:function(){
        return this.attrs.innerRadius
    }
},Kinetic.GlobalObject.extend(Kinetic.Star,Kinetic.Shape),Kinetic.Text=function(a){
    this.setDefaultAttrs({
        fontFamily:"Calibri",
        text:"",
        fontSize:12,
        align:"left",
        verticalAlign:"top",
        padding:0,
        fontStyle:"normal",
        width:"auto",
        detectionType:"pixel"
    }),this.shapeType="Text",a.drawFunc=function(){
        var a=this.getContext();
        a.font=this.attrs.fontStyle+" "+this.attrs.fontSize+"pt "+this.attrs.fontFamily,a.textBaseline="middle";
        var b=this.getTextHeight(),c=this.attrs.width==="auto"?this.getTextWidth():this.attrs.width,d=this.attrs.padding,e=0,f=0,g=this;
        switch(this.attrs.align){
            case"center":
                e=c/-2-d;
                break;
            case"right":
                e=-1*c-d
        }
        switch(this.attrs.verticalAlign){
            case"middle":
                f=b/-2-d;
                break;
            case"bottom":
                f=-1*b-d
        }
        a.save(),a.beginPath(),a.rect(e,f,c+d*2,b+d*2),a.closePath(),this.fill(),this.stroke(),a.restore();
        var h=d+e,i=b/2+d+f;
        a.save(),this.attrs.width!=="auto"&&(a.beginPath(),a.rect(e,f,c+d,b+d*2),a.closePath(),a.clip()),this.fillText(this.attrs.text,h,i),this.strokeText(this.attrs.text,h,i),a.restore()
    },Kinetic.Shape.apply(this,[a])
},Kinetic.Text.prototype={
    setFontFamily:function(a){
        this.attrs.fontFamily=a
    },
    getFontFamily:function(){
        return this.attrs.fontFamily
    },
    setFontSize:function(a){
        this.attrs.fontSize=a
    },
    getFontSize:function(){
        return this.attrs.fontSize
    },
    setFontStyle:function(a){
        this.attrs.fontStyle=a
    },
    getFontStyle:function(){
        return this.attrs.fontStyle
    },
    setTextFill:function(a){
        this.attrs.textFill=a
    },
    getTextFill:function(){
        return this.attrs.textFill
    },
    setTextStroke:function(a){
        this.attrs.textStroke=a
    },
    getTextStroke:function(){
        return this.attrs.textStroke
    },
    setTextStrokeWidth:function(a){
        this.attrs.textStrokeWidth=a
    },
    getTextStrokeWidth:function(){
        return this.attrs.textStrokeWidth
    },
    setPadding:function(a){
        this.attrs.padding=a
    },
    getPadding:function(){
        return this.attrs.padding
    },
    setAlign:function(a){
        this.attrs.align=a
    },
    getAlign:function(){
        return this.attrs.align
    },
    setVerticalAlign:function(a){
        this.attrs.verticalAlign=a
    },
    getVerticalAlign:function(){
        return this.attrs.verticalAlign
    },
    setText:function(a){
        this.attrs.text=a
    },
    getText:function(){
        return this.attrs.text
    },
    getTextWidth:function(){
        return this.getTextSize().width
    },
    getTextHeight:function(){
        return this.getTextSize().height
    },
    getTextSize:function(){
        var a=this.getContext();
        if(!a){
            var b=document.createElement("canvas");
            a=b.getContext("2d")
        }
        a.save(),a.font=this.attrs.fontStyle+" "+this.attrs.fontSize+"pt "+this.attrs.fontFamily;
        var c=a.measureText(this.attrs.text);
        return a.restore(),{
            width:c.width,
            height:parseInt(this.attrs.fontSize,10)
        }
    },
    getWidth:function(){
        return this.attrs.width
    },
    setWidth:function(a){
        this.attrs.width=a
    }
},Kinetic.GlobalObject.extend(Kinetic.Text,Kinetic.Shape),Kinetic.Line=function(a){
    this.setDefaultAttrs({
        points:[],
        lineCap:"butt",
        dashArray:[],
        detectionType:"pixel"
    }),this.shapeType="Line",a.drawFunc=function(){
        var a=this.getContext(),b={};
        
        a.beginPath(),a.moveTo(this.attrs.points[0].x,this.attrs.points[0].y);
        for(var c=1;c<this.attrs.points.length;c++){
            var d=this.attrs.points[c].x,e=this.attrs.points[c].y;
            if(this.attrs.dashArray.length>0){
                var f=this.attrs.points[c-1].x,g=this.attrs.points[c-1].y;
                this._dashedLine(f,g,d,e,this.attrs.dashArray)
            }else a.lineTo(d,e)
        }!this.attrs.lineCap||(a.lineCap=this.attrs.lineCap),this.stroke()
    },Kinetic.Shape.apply(this,[a])
},Kinetic.Line.prototype={
    setPoints:function(a){
        this.setAttrs({
            points:a
        })
    },
    getPoints:function(){
        return this.attrs.points
    },
    setLineCap:function(a){
        this.attrs.lineCap=a
    },
    getLineCap:function(){
        return this.attrs.lineCap
    },
    setDashArray:function(a){
        this.attrs.dashArray=a
    },
    getDashArray:function(){
        return this.attrs.dashArray
    },
    _dashedLine:function(a,b,c,d,e){
        var f=this.getContext(),g=e.length,h=c-a,i=d-b,j=h>i,k=j?i/h:h/i;
        k>9999?k=9999:k<-9999&&(k=-9999);
        var l=Math.sqrt(h*h+i*i),m=0,n=!0;
        while(l>=.1&&m<1e4){
            var o=e[m++%g];
            o===0&&(o=.001),o>l&&(o=l);
            var p=Math.sqrt(o*o/(1+k*k));
            j?(a+=h<0&&i<0?p*-1:p,b+=h<0&&i<0?k*p*-1:k*p):(a+=h<0&&i<0?k*p*-1:k*p,b+=h<0&&i<0?p*-1:p),f[n?"lineTo":"moveTo"](a,b),l-=o,n=!n
        }
        f.moveTo(c,d)
    }
},Kinetic.GlobalObject.extend(Kinetic.Line,Kinetic.Shape),Kinetic.Path=function(a){
    this.shapeType="Path",this.dataArray=[],a.drawFunc=function(){
        var a=this.getContext(),b=this.dataArray;
        a.beginPath();
        for(var c=0;c<b.length;c++){
            var d=b[c].command,e=b[c].points;
            switch(d){
                case"L":
                    a.lineTo(e[0],e[1]);
                    break;
                case"M":
                    a.moveTo(e[0],e[1]);
                    break;
                case"C":
                    a.bezierCurveTo(e[0],e[1],e[2],e[3],e[4],e[5]);
                    break;
                case"Q":
                    a.quadraticCurveTo(e[0],e[1],e[2],e[3]);
                    break;
                case"z":
                    a.closePath()
            }
        }
        this.fill(),this.stroke()
    },Kinetic.Shape.apply(this,[a]),this.dataArray=this.getDataArray()
},Kinetic.Path.prototype={
    getDataArray:function(){
        var a=this.attrs.data,b=["m","M","l","L","v","V","h","H","z","Z","c","C","q","Q","t","T","s","S"];
        a=a.replace(new RegExp(" ","g"),",");
        for(var c=0;c<b.length;c++)a=a.replace(new RegExp(b[c],"g"),"|"+b[c]);
        var d=a.split("|"),e=[],f=0,g=0;
        for(var c=1;c<d.length;c++){
            var h=d[c],i=h.charAt(0);
            h=h.slice(1),h=h.replace(new RegExp(",-","g"),"-"),h=h.replace(new RegExp("-","g"),",-");
            var j=h.split(",");
            j.length>0&&j[0]===""&&j.shift();
            for(var k=0;k<j.length;k++)j[k]=parseFloat(j[k]);
            while(j.length>0){
                if(isNaN(j[0]))break;
                var l=undefined,m=[];
                switch(i){
                    case"l":
                        f+=j.shift(),g+=j.shift(),l="L",m.push(f,g);
                        break;
                    case"L":
                        f=j.shift(),g=j.shift(),m.push(f,g);
                        break;
                    case"m":
                        f+=j.shift(),g+=j.shift(),l="M",m.push(f,g),i="l";
                        break;
                    case"M":
                        f=j.shift(),g=j.shift(),l="M",m.push(f,g),i="L";
                        break;
                    case"h":
                        f+=j.shift(),l="L",m.push(f,g);
                        break;
                    case"H":
                        f=j.shift(),l="L",m.push(f,g);
                        break;
                    case"v":
                        g+=j.shift(),l="L",m.push(f,g);
                        break;
                    case"V":
                        g=j.shift(),l="L",m.push(f,g);
                        break;
                    case"C":
                        m.push(j.shift(),j.shift(),j.shift(),j.shift()),f=j.shift(),g=j.shift(),m.push(f,g);
                        break;
                    case"c":
                        m.push(f+j.shift(),g+j.shift(),f+j.shift(),g+j.shift()),f+=j.shift(),g+=j.shift(),l="C",m.push(f,g);
                        break;
                    case"S":
                        var n=f,o=g,p=e[e.length-1];
                        p.command==="C"&&(n=f+(f-p.points[2]),o=g+(g-p.points[3])),m.push(n,o,j.shift(),j.shift()),f=j.shift(),g=j.shift(),l="C",m.push(f,g);
                        break;
                    case"s":
                        var n=f,o=g,p=e[e.length-1];
                        p.command==="C"&&(n=f+(f-p.points[2]),o=g+(g-p.points[3])),m.push(n,o,f+j.shift(),g+j.shift()),f+=j.shift(),g+=j.shift(),l="C",m.push(f,g);
                        break;
                    case"Q":
                        m.push(j.shift(),j.shift()),f=j.shift(),g=j.shift(),m.push(f,g);
                        break;
                    case"q":
                        m.push(f+j.shift(),g+j.shift()),f+=j.shift(),g+=j.shift(),l="Q",m.push(f,g);
                        break;
                    case"T":
                        var n=f,o=g,p=e[e.length-1];
                        p.command==="Q"&&(n=f+(f-p.points[0]),o=g+(g-p.points[1])),f=j.shift(),g=j.shift(),l="Q",m.push(n,o,f,g);
                        break;
                    case"t":
                        var n=f,o=g,p=e[e.length-1];
                        p.command==="Q"&&(n=f+(f-p.points[0]),o=g+(g-p.points[1])),f+=j.shift(),g+=j.shift(),l="Q",m.push(n,o,f,g)
                }
                e.push({
                    command:l||i,
                    points:m
                })
            }(i==="z"||i==="Z")&&e.push({
                command:"z",
                points:[]
            })
        }
        return e
    },
    getData:function(){
        return this.attrs.data
    },
    setData:function(a){
        this.attrs.data=a,this.dataArray=this.getDataArray()
    }
},Kinetic.GlobalObject.extend(Kinetic.Path,Kinetic.Shape),Kinetic.Transform=function(){
    this.m=[1,0,0,1,0,0]
},Kinetic.Transform.prototype={
    translate:function(a,b){
        this.m[4]+=this.m[0]*a+this.m[2]*b,this.m[5]+=this.m[1]*a+this.m[3]*b
    },
    scale:function(a,b){
        this.m[0]*=a,this.m[1]*=a,this.m[2]*=b,this.m[3]*=b
    },
    rotate:function(a){
        var b=Math.cos(a),c=Math.sin(a),d=this.m[0]*b+this.m[2]*c,e=this.m[1]*b+this.m[3]*c,f=this.m[0]*-c+this.m[2]*b,g=this.m[1]*-c+this.m[3]*b;
        this.m[0]=d,this.m[1]=e,this.m[2]=f,this.m[3]=g
    },
    getTranslation:function(){
        return{
            x:this.m[4],
            y:this.m[5]
        }
    },
    multiply:function(a){
        var b=this.m[0]*a.m[0]+this.m[2]*a.m[1],c=this.m[1]*a.m[0]+this.m[3]*a.m[1],d=this.m[0]*a.m[2]+this.m[2]*a.m[3],e=this.m[1]*a.m[2]+this.m[3]*a.m[3],f=this.m[0]*a.m[4]+this.m[2]*a.m[5]+this.m[4],g=this.m[1]*a.m[4]+this.m[3]*a.m[5]+this.m[5];
        this.m[0]=b,this.m[1]=c,this.m[2]=d,this.m[3]=e,this.m[4]=f,this.m[5]=g
    },
    invert:function(){
        var a=1/(this.m[0]*this.m[3]-this.m[1]*this.m[2]),b=this.m[3]*a,c=-this.m[1]*a,d=-this.m[2]*a,e=this.m[0]*a,f=a*(this.m[2]*this.m[5]-this.m[3]*this.m[4]),g=a*(this.m[1]*this.m[4]-this.m[0]*this.m[5]);
        this.m[0]=b,this.m[1]=c,this.m[2]=d,this.m[3]=e,this.m[4]=f,this.m[5]=g
    },
    getMatrix:function(){
        return this.m
    }
},Kinetic.Transition=function(a,b){
    function d(a,b){
        for(var e in a)e!=="duration"&&e!=="easing"&&e!=="callback"&&(Kinetic.GlobalObject._isObject(a[e])?d(a[e],b[e]):c._add(c._getTween(b,e,a[e])))
    }
    this.node=a,this.config=b,this.tweens=[];
    var c=this;
    d(b,a.attrs);
    var e=0;
    for(var f=0;f<this.tweens.length;f++){
        var g=this.tweens[f];
        g.onFinished=function(){
            e++,e>=c.tweens.length&&c.onFinished()
        }
    }
},Kinetic.Transition.prototype={
    start:function(){
        for(var a=0;a<this.tweens.length;a++)this.tweens[a].start()
    },
    stop:function(){
        for(var a=0;a<this.tweens.length;a++)this.tweens[a].stop()
    },
    resume:function(){
        for(var a=0;a<this.tweens.length;a++)this.tweens[a].resume()
    },
    _onEnterFrame:function(){
        for(var a=0;a<this.tweens.length;a++)this.tweens[a].onEnterFrame()
    },
    _add:function(a){
        this.tweens.push(a)
    },
    _getTween:function(a,b,c){
        var d=this.config,e=this.node,f=d.easing;
        f===undefined&&(f="linear");
        var g=new Kinetic.Tween(e,function(c){
            a[b]=c
        },Kinetic.Tweens[f],a[b],c,d.duration);
        return g
    }
},Kinetic.Tween=function(a,b,c,d,e,f){
    this._listeners=[],this.addListener(this),this.obj=a,this.propFunc=b,this.begin=d,this._pos=d,this.setDuration(f),this.isPlaying=!1,this._change=0,this.prevTime=0,this.prevPos=0,this.looping=!1,this._time=0,this._position=0,this._startTime=0,this._finish=0,this.name="",this.func=c,this.setFinish(e)
},Kinetic.Tween.prototype={
    setTime:function(a){
        this.prevTime=this._time,a>this.getDuration()?this.looping?(this.rewind(a-this._duration),this.update(),this.broadcastMessage("onLooped",{
            target:this,
            type:"onLooped"
        })):(this._time=this._duration,this.update(),this.stop(),this.broadcastMessage("onFinished",{
            target:this,
            type:"onFinished"
        })):a<0?(this.rewind(),this.update()):(this._time=a,this.update())
    },
    getTime:function(){
        return this._time
    },
    setDuration:function(a){
        this._duration=a===null||a<=0?1e5:a
    },
    getDuration:function(){
        return this._duration
    },
    setPosition:function(a){
        this.prevPos=this._pos,this.propFunc(a),this._pos=a,this.broadcastMessage("onChanged",{
            target:this,
            type:"onChanged"
        })
    },
    getPosition:function(a){
        return a===undefined&&(a=this._time),this.func(a,this.begin,this._change,this._duration)
    },
    setFinish:function(a){
        this._change=a-this.begin
    },
    getFinish:function(){
        return this.begin+this._change
    },
    start:function(){
        this.rewind(),this.startEnterFrame(),this.broadcastMessage("onStarted",{
            target:this,
            type:"onStarted"
        })
    },
    rewind:function(a){
        this.stop(),this._time=a===undefined?0:a,this.fixTime(),this.update()
    },
    fforward:function(){
        this._time=this._duration,this.fixTime(),this.update()
    },
    update:function(){
        this.setPosition(this.getPosition(this._time))
    },
    startEnterFrame:function(){
        this.stopEnterFrame(),this.isPlaying=!0,this.onEnterFrame()
    },
    onEnterFrame:function(){
        this.isPlaying&&this.nextFrame()
    },
    nextFrame:function(){
        this.setTime((this.getTimer()-this._startTime)/1e3)
    },
    stop:function(){
        this.stopEnterFrame(),this.broadcastMessage("onStopped",{
            target:this,
            type:"onStopped"
        })
    },
    stopEnterFrame:function(){
        this.isPlaying=!1
    },
    continueTo:function(a,b){
        this.begin=this._pos,this.setFinish(a),this._duration!==undefined&&this.setDuration(b),this.start()
    },
    resume:function(){
        this.fixTime(),this.startEnterFrame(),this.broadcastMessage("onResumed",{
            target:this,
            type:"onResumed"
        })
    },
    yoyo:function(){
        this.continueTo(this.begin,this._time)
    },
    addListener:function(a){
        return this.removeListener(a),this._listeners.push(a)
    },
    removeListener:function(a){
        var b=this._listeners,c=b.length;
        while(c--)if(b[c]==a)return b.splice(c,1),!0;
        return!1
    },
    broadcastMessage:function(){
        var a=[];
        for(var b=0;b<arguments.length;b++)a.push(arguments[b]);
        var c=a.shift(),d=this._listeners,e=d.length;
        for(var b=0;b<e;b++)d[b][c]&&d[b][c].apply(d[b],a)
    },
    fixTime:function(){
        this._startTime=this.getTimer()-this._time*1e3
    },
    getTimer:function(){
        return(new Date).getTime()-this._time
    }
},Kinetic.Tweens={
    "back-ease-in":function(a,b,c,d,e,f){
        var g=1.70158;
        return c*(a/=d)*a*((g+1)*a-g)+b
    },
    "back-ease-out":function(a,b,c,d,e,f){
        var g=1.70158;
        return c*((a=a/d-1)*a*((g+1)*a+g)+1)+b
    },
    "back-ease-in-out":function(a,b,c,d,e,f){
        var g=1.70158;
        return(a/=d/2)<1?c/2*a*a*(((g*=1.525)+1)*a-g)+b:c/2*((a-=2)*a*(((g*=1.525)+1)*a+g)+2)+b
    },
    "elastic-ease-in":function(a,b,c,d,e,f){
        var g=0;
        return a===0?b:(a/=d)==1?b+c:(f||(f=d*.3),!e||e<Math.abs(c)?(e=c,g=f/4):g=f/(2*Math.PI)*Math.asin(c/e),-(e*Math.pow(2,10*(a-=1))*Math.sin((a*d-g)*2*Math.PI/f))+b)
    },
    "elastic-ease-out":function(a,b,c,d,e,f){
        var g=0;
        return a===0?b:(a/=d)==1?b+c:(f||(f=d*.3),!e||e<Math.abs(c)?(e=c,g=f/4):g=f/(2*Math.PI)*Math.asin(c/e),e*Math.pow(2,-10*a)*Math.sin((a*d-g)*2*Math.PI/f)+c+b)
    },
    "elastic-ease-in-out":function(a,b,c,d,e,f){
        var g=0;
        return a===0?b:(a/=d/2)==2?b+c:(f||(f=d*.3*1.5),!e||e<Math.abs(c)?(e=c,g=f/4):g=f/(2*Math.PI)*Math.asin(c/e),a<1?-0.5*e*Math.pow(2,10*(a-=1))*Math.sin((a*d-g)*2*Math.PI/f)+b:e*Math.pow(2,-10*(a-=1))*Math.sin((a*d-g)*2*Math.PI/f)*.5+c+b)
    },
    "bounce-ease-out":function(a,b,c,d){
        return(a/=d)<1/2.75?c*7.5625*a*a+b:a<2/2.75?c*(7.5625*(a-=1.5/2.75)*a+.75)+b:a<2.5/2.75?c*(7.5625*(a-=2.25/2.75)*a+.9375)+b:c*(7.5625*(a-=2.625/2.75)*a+.984375)+b
    },
    "bounce-ease-in":function(a,b,c,d){
        return c-Kinetic.Tweens["bounce-ease-out"](d-a,0,c,d)+b
    },
    "bounce-ease-in-out":function(a,b,c,d){
        return a<d/2?Kinetic.Tweens["bounce-ease-in"](a*2,0,c,d)*.5+b:Kinetic.Tweens["bounce-ease-out"](a*2-d,0,c,d)*.5+c*.5+b
    },
    "ease-in":function(a,b,c,d){
        return c*(a/=d)*a+b
    },
    "ease-out":function(a,b,c,d){
        return-c*(a/=d)*(a-2)+b
    },
    "ease-in-out":function(a,b,c,d){
        return(a/=d/2)<1?c/2*a*a+b:-c/2*(--a*(a-2)-1)+b
    },
    "strong-ease-in":function(a,b,c,d){
        return c*(a/=d)*a*a*a*a+b
    },
    "strong-ease-out":function(a,b,c,d){
        return c*((a=a/d-1)*a*a*a*a+1)+b
    },
    "strong-ease-in-out":function(a,b,c,d){
        return(a/=d/2)<1?c/2*a*a*a*a*a+b:c/2*((a-=2)*a*a*a*a+2)+b
    },
    linear:function(a,b,c,d){
        return c*a/d+b
    }
};