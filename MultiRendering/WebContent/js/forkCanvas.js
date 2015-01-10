// data representation of graphics 2d surface (canvas)

'use strict';

// ANTS_TAG : also add here determining of
// Object.seal/Object.defineProperties/Object.freeze - to provide more strict
// usage
// ANTS_TAG : add equals method
var WU, workerUtility, CU, commonUtility, TU, testUtility, RM, resourcesManager;

Function.prototype.inheritsFrom = function(parentClassOrObject) {
    'use strict';
    if (parentClassOrObject.constructor == Function) {
        // Normal Inheritance
        this.prototype = new parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    }
    else {
        // Pure Virtual Inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
};

CU = commonUtility = (function() {
    'use strict';
    // internal engine variables
    // --------------------------------------------------------------------------
    var Logger, existingConsole, inWorker/* , performance */;
    
    // internal engine function
    // --------------------------------------------------------------------------
    
    // does support browser console API
    existingConsole = (!!self.console);
    // does support browser Worker API
    inWorker = !(typeof window !== "undefined" && this === window);
    
    Logger = {
        info : function() {
            if (existingConsole) {
                console.info(arguments);
            }
        },
        error : function() {
            if (existingConsole) {
                console.error(arguments);
            }
        },
        warn : function() {
            if (existingConsole) {
                console.warn(arguments);
            }
        },
        debug : function() {
            if (existingConsole) {
                console.debug(arguments);
            }
        },
        log : function() {
            if (existingConsole) {
                console.log(arguments);
            }
        },
        type : function() {
            return "commonUtility.Logger";
        }
    };
    
    // virtual object
    return {
        logger : Logger,
        isWorker : inWorker,
        hasConsole : existingConsole
    };
    
})();

TU = testUtility = (function() {
    "use strict";
    // ANTS_TAG : use object performance
    // ANTS_TAG : should have start ,end and useful computation of timing per
    // task
    // also should evaluate average timing
    return {};
})();

WU = workerUtility = (function() {
    'use strict';
    // ANTS_TAG : try also implement leaner approximation
    // ANTS_TAG : add here saving data into hard drive through the
    // URL.createObject method, provide smart manager, to get possibility
    // discard memory through the URL.revokeObject
    
    // library exceptions
    // --------------------------------------------------------------------------
    
    function NoninvertibleTransformException(message) {
        this.message = message;
        this.name = "Transform exception";
    }
    
    function NonExistingCoordinatesException(message) {
        this.message = message;
        this.name = "Bitmap exception";
    }
    
    function WrongArgumentException(message) {
        this.message = message;
        this.name = "Wrong argument exception";
    }
    
    // Utility function
    // --------------------------------------------------------------------------
    
    // some smallest number
    var EPSILON = 0.00001;
    
    // transparent black;
    var DEFAULT_COLOR = 0x00000000;
    
    // multiply matrix on other matrix
    // ANTS_TAG : change this stuff - > create prototype method into
    // AffineTransform object!
    function multiplyMtrx(one11, one12, one21, one22, onex, oney, two11, two12, two21, two22, twox, twoy) {
        // maybe better add last parameters as AffineTransform and set this
        // value to it?
        return new AffineTransform(one11 * two11 + one21 * two12, one12 * two11 + one22 * two12, one11 * two21 + one21 * two22,
            one12 * two21 + one22 * two22, one11 * twox + one21 * twoy + onex, one12 * twox + one22 * twoy + oney);
    }
    
    // return true array of splitted arguments
    function splitArguments() {
        var splitedArray, ii;
        if (!arguments[0]) {
            throw new WrongArgumentException("Can't parse arguments, cause it doesn't exist!");
        }
        splitedArray = new Array();
        for (ii = 0; ii < arguments[0].length; ii++) {
            splitedArray.push(arguments[0][ii]);
        }
        return splitedArray;
    }
    
    // computed index of point according to global transformation
    function approximateIndex(x, y, transform, width, height, inverse) {
        var point;
        
        if (isNaN(x) || isNaN(y)) {
            throw new WrongArgumentException("Should properly define coordinates!");
        }
        if (isNaN(width) || isNaN(height)) {
            throw new WrongArgumentException("Should properly define size!");
        }
        if (!(transform !== 'undefined' && transform.type && transform.type() === "workerUtility.AffineTransform")) {
            throw new WrongArgumentException("You should pass into this function affine transformation!");
        }
        inverse = (inverse !== 'undefined') ? inverse : true;
        
        if (inverse) {
            point = transform.inverseTransform(x, y);
        }
        else {
            point = transform.transform(x, y);
        }
        // nearest
        point.round();
        
        if ((point.getX() + 1) >= width) {
            point.setX(width - 2);
        }
        if ((point.getY() + 1) >= height) {
            point.setY(height - 2);
        }
        if (point.getX() < 0) {
            point.setX(0);
        }
        if (point.getY() < 0) {
            point.setY(0);
        }
        return bitmapBytesIndex(point.getX(), point.getY(), width);
    }
    
    // define index of element into array according to image location
    function bitmapIndex(x, y, width) {
        return (y * width + x);
    }
    
    // define index of element into array of 32 bits values per element
    function bitmapBytesIndex(x, y, width) {
        return (bitmapIndex(x, y, width) * 4);
    }
    
    // Immutable wrappers!
    // --------------------------------------------------------------------------
    
    // ANTS_TAG : figure out their API and input values into currently created
    // classes!
    
    function ImmutablePoint() {
        'use strict';
        if (this !== "undefined" ^ this !== self) {
            throw new WrongArgumentException("Can't call this function as constructor");
        }
        
        if (arguments.length !== 1 || arguments[0] === 'undefined' || arguments[0].constructor !== Point) {
            throw new WrongArgumentException("Can't wrap non existing or wrong type than Point object!");
        }
        
        return (function() {
            'use strict';
            var point;
            point = arguments[0];
            
            return {
                toString : function() {
                    return point.toString();
                },
                valueOf : function() {
                    return point.toString();
                },
                type : function() {
                    return "Interface of : " + point.type();
                },
                x : function() {
                    return point.getX();
                },
                y : function() {
                    return point.getY();
                },
                roundX : function() {
                    return Math.round(point.getX());
                },
                roundY : function() {
                    return Math.round(point.getY());
                }
            };
        }(arguments[0]));
        
    }
    
    function ImmutableMessage() {
        'use strict';
        if (this !== "undefined" ^ this !== self) {
            throw new WrongArgumentException("Can't call this function as constructor");
        }
        
        if (arguments.length !== 1 || arguments[0] === 'undefined' || arguments[0].constructor !== Message) {
            throw new WrongArgumentException("Can't wrap non existing or wrong type than Point object!");
        }
        
        return (function() {
            'use strict';
            var msg;
            msg = arguments[0];
            
            return {
                toString : function() {
                    return msg.toString();
                },
                valueOf : function() {
                    return msg.toString();
                },
                type : function() {
                    return "Interface of : " + msg.type();
                },
                getMsg : function() {
                    return msg.getMsg();
                },
                setMsg : function(val) {
                    if (val === "undefined" || val.constructor !== String) {
                        throw new WrongArgumentException("The message should be string type and non empty!");
                    }
                    return msg.setMsg(val);
                }
            };
        }(arguments[0]));
        
    }
    
    function ImmutableRectangle() {
        'use strict';
        if (this !== "undefined" ^ this !== self) {
            throw new WrongArgumentException("Can't call this function as constructor");
        }
        
        if (arguments.length !== 1 || arguments[0] === 'undefined' || arguments[0].constructor !== Rectangle) {
            throw new WrongArgumentException("Can't wrap non existing or wrong type than Point object!");
        }
        
        return (function() {
            'use strict';
            var rect;
            rect = arguments[0];
            
            return {
                toString : function() {
                    return rect.toString();
                },
                valueOf : function() {
                    return rect.toString();
                },
                type : function() {
                    return "Interface of : " + rect.type();
                },
                x : function() {
                    return rect.getX();
                },
                y : function() {
                    return rect.getY();
                },
                width : function() {
                    return rect.getWidth();
                },
                height : function() {
                    return rect.getHeight();
                }
            };
        }(arguments[0]));
        
    }
    
    function ImmutableTransform() {
        'use strict';
        if (this !== "undefined" ^ this !== self) {
            throw new WrongArgumentException("Can't call this function as constructor");
        }
        
        if (arguments.length !== 1 || arguments[0] === 'undefined' || arguments[0].constructor !== AffineTransform) {
            throw new WrongArgumentException("Can't wrap non existing or wrong type than Point object!");
        }
        
        return (function() {
            'use strict';
            var transform;
            transform = arguments[0];
            
            return {
                toString : function() {
                    return transform.toString();
                },
                valueOf : function() {
                    return transform.toString();
                },
                type : function() {
                    return "Interface of : " + transform.type();
                },
                m11 : function() {
                    return transform.getM11();
                },
                m12 : function() {
                    return transform.getM12();
                },
                m21 : function() {
                    return transform.getM21();
                },
                m22 : function() {
                    return transform.getM22();
                },
                tx : function() {
                    return transform.getTx();
                },
                ty : function() {
                    return transform.getTy();
                },
                uniformScale : function() {
                    return transform.uniformScale();
                },
                scaleX : function() {
                    return transform.getScaleX();
                },
                scaleY : function() {
                    return transform.getScaleY();
                },
                rotation : function() {
                    return transform.getRotation();
                },
                transform : function(x, y) {
                    return transform.transform(x, y);
                },
                transformX : function(x, y) {
                    return transform.transformX(x, y);
                },
                transformY : function(x, y) {
                    return transform.transformY(x, y);
                },
                inverse : function() {
                    return transform.inverse();
                },
                inverseTransform : function(x, y) {
                    return transform.inverseTransform(x, y);
                },
                inverseTransformX : function(x, y) {
                    return transform.inverseTransformX(x, y);
                },
                inverseTransformY : function(x, y) {
                    return transform.inverseTransformY(x, y);
                },
                bytes : function() {
                    return transform.getBytes();
                }
            };
        }(arguments[0]));
        
    }
    
    function ImmutableCanvas() {
        'use strict';
        if (this !== "undefined" ^ this !== self) {
            throw new WrongArgumentException("Can't call this function as constructor");
        }
        
        if (arguments.length !== 1 || arguments[0] === 'undefined' || arguments[0].constructor !== Canvas) {
            throw new WrongArgumentException("Can't wrap non existing or wrong type than Point object!");
        }
        
        return (function() {
            'use strict';
            var canvas;
            canvas = arguments[0];
            
            return {
                toString : function() {
                    return canvas.toString();
                },
                valueOf : function() {
                    return canvas.toString();
                },
                type : function() {
                    return "Interface of : " + canvas.type();
                },
                width : function() {
                    return canvas.width();
                },
                height : function() {
                    return canvas.height();
                },
                getImageData : function(x, y, width, height) {
                    return canvas.getImageData(x, y, width, height);
                },
                origin : function() {
                    return canvas.getOrigin();
                },
                originX : function() {
                    return canvas.getOriginX();
                },
                originY : function() {
                    return canvas.getOriginY();
                },
                alpha : function() {
                    return canvas.getAlpha();
                },
                transform : function() {
                    return ImmutableTransform(canvas.affineTM().clone());
                }
            };
        }(arguments[0]));
        
    }
    
    // ANTS_TAG : implement other function and improve them!
    
    // Message object
    // --------------------------------------------------------------------------
    
    // transfer object between threads
    function Message() {
        var msg = "", args;
        
        args = splitArguments(arguments);
        
        if (args.length === 1 && args[0].length) {
            args = args[0];
        }
        
        if (args.length === 1) {
            msg = (args[0] && args[0].constructor === String) ? args[0] : "";
        }
        
        this.getMsg = function() {
            return msg;
        };
        
        this.setMsg = function(value) {
            msg = value;
        };
    }
    
    Message.prototype.toString = function() {
        return (" Message object : [ " + this.getMsg() + " ].");
    };
    
    Message.prototype.clone = function() {
        return new Message(this.getMsg());
    };
    
    Message.prototype.type = function() {
        return "workerUtility.Message";
    };
    
    // Rectangle object
    // --------------------------------------------------------------------------
    // ANTS_TAG : wide implementation
    function Rectangle() {
        var x, y, width, height, args;
        
        args = splitArguments(arguments);
        
        if (args.length === 1 && args[0].length) {
            args = args[0];
        }
        
        x = (!isNaN((args[0])) ? agrs[0] : 0);
        y = (!isNaN((args[1])) ? agrs[1] : 0);
        width = (!isNaN((args[2])) ? agrs[2] : 1);
        height = (!isNaN((args[3])) ? agrs[3] : 1);
        
        this.getX = function() {
            return x;
        };
        
        this.setX = function(value) {
            if (!isNaN(value)) {
                x = value;
            }
        };
        
        this.getY = function() {
            return y;
        };
        
        this.setY = function(value) {
            if (!isNaN(value)) {
                y = value;
            }
        };
        
        this.getWidth = function() {
            return width;
        };
        
        this.setWidth = function(value) {
            if (!isNaN(value)) {
                width = value;
            }
        };
        
        this.getHeight = function() {
            return height;
        };
        
        this.setHeight = function(value) {
            if (!isNaN(value)) {
                height = value;
            }
        };
        
    }
    
    Rectangle.prototype.toString = function() {
        return "Rectangle location : [ " + this.getX() + " : " + this.getY() + " ] , size [ " + this.getWidth() + " : "
            + this.getHeight() + " ].";
    };
    
    Rectangle.prototype.clone = function() {
        return new Rectangle(this.getX(), this.getY(), this.getWidth(), this.getHeight());
    };
    
    // Point object
    // --------------------------------------------------------------------------
    
    // contains data of location point
    function Point() {
        var x = 0, y = 0, args;
        
        args = splitArguments(arguments);
        
        if (args.length === 1 && args[0].length) {
            args = args[0];
        }
        
        if (args.length === 2) {
            x = (!isNaN(args[0]) && args[0].constructor === Number) ? args[0] : 0;
            y = (!isNaN(args[1]) && args[1].constructor === Number) ? args[1] : 0;
        }
        
        this.getX = function() {
            return x;
        };
        
        this.setX = function(value) {
            x = value;
        };
        
        this.getY = function() {
            return y;
        };
        
        this.setY = function(value) {
            y = value;
        };
    }
    
    Point.prototype.toString = function() {
        return (" Point [ " + this.getX() + " : " + this.getY() + " ].");
    };
    
    Point.prototype.set = function(x, y) {
        if (isNaN(x) || isNaN(y)) {
            throw new WrongArgumentException("You must supplied proper values of coordinate to point!");
        }
        this.setX(x);
        this.setY(y);
    };
    
    Point.prototype.roundX = function() {
        // rounded X value to closest integer
        this.setX(Math.round(this.getX()));
    };
    
    Point.prototype.roundY = function() {
        // rounded Y value to closest integer
        this.setY(Math.round(this.getY()));
    };
    
    Point.prototype.round = function() {
        // rounded values to closest integer
        this.setX(Math.round(this.getX()));
        this.setY(Math.round(this.getY()));
    };
    
    Point.prototype.type = function() {
        return "workerUtility.Point";
    };
    
    Point.prototype.clone = function() {
        return new Point(this.getX(), this.getY());
    };
    
    // Affine transformation
    // --------------------------------------------------------------------------
    function AffineTransform() {
        // ANTS_TAG : should also cached current values for angle, scale for
        // better performance.
        var m11, m12, m21, m22, tx, ty, dataView, args/*
                                                         * , scaleX = 1, scaleY =
                                                         * 1, rotation = 0,
                                                         * shearX = 0, shearY =
                                                         * 0
                                                         */;
        
        args = splitArguments(arguments);
        
        if (args.length === 1 && args[0].length) {
            args = args[0];
        }
        
        if (args.length === 1 && args[0] && args[0].constructor === ArrayBuffer && args[0].byteLength === 24) {
            dataView = new DataView(args[0]);
            m11 = dataView.getFloat32(0);
            m12 = dataView.getFloat32(4);
            m21 = dataView.getFloat32(8);
            m22 = dataView.getFloat32(12);
            tx = dataView.getFloat32(16);
            ty = dataView.getFloat32(20);
            dataView = null;
        }
        else {
            if (args.length === 1 && args[0] && args[0].type && args[0].type() === "workerUtility.AffineTransform") {
                m11 = args[0].getM11();
                m12 = args[0].getM12();
                m21 = args[0].getM21();
                m22 = args[0].getM22();
                tx = args[0].getTx();
                ty = args[0].getTy();
            }
            else {
                m11 = ((args[0] && args[0].constructor === Number) ? args[0] : 1);
                m12 = ((args[1] && args[1].constructor === Number) ? args[1] : 0);
                m21 = ((args[2] && args[2].constructor === Number) ? args[2] : 0);
                m22 = ((args[3] && args[3].constructor === Number) ? args[3] : 1);
                tx = ((args[4] && args[4].constructor === Number) ? args[4] : 0);
                ty = ((args[5] && args[5].constructor === Number) ? args[5] : 0);
            }
        }
        
        this.getM11 = function() {
            return m11;
        };
        
        this.setM11 = function(val) {
            m11 = val;
        };
        
        this.getM12 = function() {
            return m12;
        };
        
        this.setM12 = function(val) {
            m12 = val;
        };
        
        this.getM21 = function() {
            return m21;
        };
        
        this.setM21 = function(val) {
            m21 = val;
        };
        
        this.getM22 = function() {
            return m22;
        };
        
        this.setM22 = function(val) {
            m22 = val;
        };
        
        this.getTx = function() {
            return tx;
        };
        
        this.setTx = function(val) {
            tx = val;
        };
        
        this.getTy = function() {
            return ty;
        };
        
        this.setTy = function(val) {
            ty = val;
        };
        
        dataView = null;
    }
    
    AffineTransform.prototype.toString = function() {
        return "Matrix : [ " + this.getM11() + ", " + this.getM12() + ", " + this.getM21() + ", " + this.getM22() + ", "
            + this.getTx() + ", " + this.getTy() + " ]";
    };
    
    AffineTransform.prototype.getBytes = function() {
        // each object will be serialized to 24 bytes (Float32Array)
        var bytes = new Float32Array(6);
        bytes[0] = this.getM11();
        bytes[1] = this.getM12();
        bytes[2] = this.getM21();
        bytes[3] = this.getM22();
        bytes[4] = this.getTx();
        bytes[5] = this.getTy();
        return bytes.buffer;
    };
    
    AffineTransform.prototype.type = function() {
        return "workerUtility.AffineTransform";
    };
    
    AffineTransform.prototype.scale = function(x, y) {
        if (arguments.length === 1) {
            this.setTransform(multiplyMtrx(this.getM11(), this.getM12(), this.getM21(), this.getM22(), this.getTx(),
                this.getTy(), arguments[0], 0, 0, arguments[0], 0, 0));
        }
        else {
            this.setTransform(multiplyMtrx(this.getM11(), this.getM12(), this.getM21(), this.getM22(), this.getTx(),
                this.getTy(), x, 0, 0, y, 0, 0));
        }
    };
    
    AffineTransform.prototype.scaleX = function(x) {
        this.setTransform(multiplyMtrx(this.getM11(), this.getM12(), this.getM21(), this.getM22(), this.getTx(), this.getTy(), x,
            0, 0, 1, 0, 0));
    };
    
    AffineTransform.prototype.scaleY = function(y) {
        this.setTransform(multiplyMtrx(this.getM11(), this.getM12(), this.getM21(), this.getM22(), this.getTx(), this.getTy(), 1,
            0, 0, y, 0, 0));
    };
    
    AffineTransform.prototype.rotate = function(angle) {
        var sin, cos;
        sin = Math.sin(angle);
        cos = Math.cos(angle);
        this.setTransform(multiplyMtrx(this.getM11(), this.getM12(), this.getM21(), this.getM22(), this.getTx(), this.getTy(),
            cos, sin, -sin, cos, 0, 0));
    };
    
    AffineTransform.prototype.translate = function(x, y) {
        this.setTransform(multiplyMtrx(this.getM11(), this.getM12(), this.getM21(), this.getM22(), this.getTx(), this.getTy(), 1,
            0, 0, 1, x, y));
    };
    
    AffineTransform.prototype.translateX = function(x) {
        this.setTransform(multiplyMtrx(this.getM11(), this.getM12(), this.getM21(), this.getM22(), this.getTx(), this.getTy(), 1,
            0, 0, 1, x, 0));
    };
    
    AffineTransform.prototype.translateY = function(y) {
        this.setTransform(multiplyMtrx(this.getM11(), this.getM12(), this.getM21(), this.getM22(), this.getTx(), this.getTy(), 1,
            0, 0, 1, 0, y));
    };
    
    AffineTransform.prototype.set = function(m11, m12, m21, m22, tx, ty) {
        this.setM11(m11);
        this.setM12(m12);
        this.setM21(m21);
        this.setM22(m22);
        this.setTx(tx);
        this.setTy(ty);
    };
    
    AffineTransform.prototype.setTransform = function(transform) {
        if (transform && transform.type && transform.type() === "workerUtility.AffineTransform") {
            this.set(transform.getM11(), transform.getM12(), transform.getM21(), transform.getM22(), transform.getTx(), transform
                    .getTy());
        }
        else {
            throw new WrongArgumentException("The supplied object is not a transform matrix!");
        }
    };
    
    AffineTransform.prototype.tx = function() {
        return this.getTx();
    };
    
    AffineTransform.prototype.ty = function() {
        return this.getTy();
    };
    
    AffineTransform.prototype.uniformScale = function() {
        var cp;
        
        cp = this.getM11() * this.getM22() - this.getM12() * this.getM21();
        
        return ((cp < 0) ? -Math.sqrt(-cp) : Math.sqrt(cp));
    };
    
    AffineTransform.prototype.getScaleX = function() {
        return Math.sqrt(this.getM11() * this.getM11() + this.getM12() * this.getM12());
    };
    
    AffineTransform.prototype.getScaleY = function() {
        return Math.sqrt(this.getM21() * this.getM21() + this.getM22() * this.getM22());
    };
    
    AffineTransform.prototype.clone = function() {
        return new AffineTransform(this.getM11(), this.getM12(), this.getM21(), this.getM22(), this.getTx(), this.getTy());
    };
    
    AffineTransform.prototype.getRotation = function() {
        var temp11, temp12, temp21, temp22, ii, tempOb11 = 0, tempOb12 = 0, tempOb21, tempOb22, det, hrdet, det11, det12, det21, det22;
        temp11 = this.getM11();
        temp12 = this.getM12();
        temp21 = this.getM21();
        temp22 = this.getM22();
        for (ii = 0; ii < 10; ii++) {
            
            tempOb11 = temp11;
            tempOb21 = temp21;
            tempOb12 = temp12;
            tempOb22 = temp22;
            
            det = tempOb11 * tempOb22 - tempOb21 * tempOb12;
            
            if (det === 0) {
                commonUtility.logger.error("The determinant equals zero!");
                throw new NoninvertibleTransformException("The determinant equals zero!");
            }
            
            hrdet = 0.5 / det;
            
            temp11 = +tempOb22 * hrdet + tempOb11 * 0.5;
            temp21 = -tempOb12 * hrdet + tempOb21 * 0.5;
            
            temp12 = -tempOb21 * hrdet + tempOb12 * 0.5;
            tempOb22 = +tempOb11 * hrdet + tempOb11 * 0.5;
            
            det11 = temp11 - tempOb11;
            det21 = temp21 - tempOb21;
            det12 = temp12 - tempOb12;
            det22 = temp22 - tempOb22;
            
            if ((det11 * det11 + det21 * det21 + det12 * det12 + det22 * det22) < EPSILON) {
                break;
            }
        }
        
        return Math.atan2(tempOb12, tempOb11);
        
    };
    
    AffineTransform.prototype.setScale = function() {
        if (arguments.lemgth === 1 && arguments[0].constructor === Number) {
            if (arguments[0] <= 0) {
                commonUtility.logger.error("Try setted zero or negative scale parameters : " + arguments[0]);
                throw new WrongArgumentException("Try setted zero or negative scale parameters : " + arguments[0]);
            }
            this.setScaleX(arguments[0]);
            this.setScaleY(arguments[0]);
        }
        else {
            if (arguments.lemgth === 2 && arguments[0].constructor === Number && arguments[1].constructor === Number) {
                if (arguments[0] <= 0 || arguments[1] <= 0) {
                    commonUtility.logger.error("Try setted zero or negative scale parameters : [ " + arguments[0] + " : "
                        + arguments[1] + " ].");
                    throw new WrongArgumentException("Try setted zero or negative scale parameters : [ " + arguments[0] + " : "
                        + arguments[1] + " ].");
                }
                this.setScaleX(arguments[0]);
                this.setScaleY(arguments[1]);
            }
            else {
                commonUtility.logger.error("Setted wrong type or amount of parameters into scale function!");
                throw new WrongArgumentException("Setted wrong type or amount of parameters into scale function!");
            }
        }
    };
    
    AffineTransform.prototype.setScaleX = function(x) {
        var mult;
        mult = x / this.getScaleX();
        this.setM11(this.getM11() * mult);
        this.setM12(this.getM12() * mult);
    };
    
    AffineTransform.prototype.setScaleY = function(y) {
        var mult;
        mult = y / this.getScaleY();
        this.setM21(this.getM21() * mult);
        this.setM22(this.getM22() * mult);
    };
    
    AffineTransform.prototype.setRotate = function(angle) {
        var sx, sy, sina, cosa;
        sx = this.getScaleX();
        sy = this.getScaleY();
        sina = Math.sin(angle);
        cosa = Math.cos(angle);
        this.setM11(cosa * sx);
        this.setM12(sina * sx);
        this.setM21(-sina * sy);
        this.setM22(cosa * sy);
    };
    
    AffineTransform.prototype.setTranslate = function(x, y) {
        this.setTx(x);
        this.setTy(y);
    };
    
    AffineTransform.prototype.setTranslateX = function(x) {
        this.setTx(x);
    };
    
    AffineTransform.prototype.setTranslateY = function(y) {
        this.setTy(y);
    };
    
    AffineTransform.prototype.transform = function(x, y) {
        // transform point into current affine system
        return new Point((this.getM11() * x + this.getM21() * y + this.getTx()), (this.getM12() * x + this.getM22() * y + this
                .getTy()));
    };
    
    AffineTransform.prototype.inverse = function() {
        // inversed affine transformation
        var det;
        det = this.getM11() * this.getM22() - this.getM12() * this.getM21();
        if (det === 0) {
            commonUtility.logger.error("The determinant equals zero!");
            throw new NoninvertibleTransformException("The determinant equals zero!");
        }
        det = (1 / det);
        return new AffineTransform(+this.getM22() * det, -this.getM21 * det, -this.getM12() * det, +this.getM11() * det, (this
                .getM21()
            * this.getTy() - this.getM22() * this.getTx())
            * det, (this.getM12() * this.getTx() - this.getM11() * this.getTy()) * det);
    };
    
    AffineTransform.prototype.inverseTransform = function(x, y) {
        // inversed transform point into current affine system
        var det;
        
        if (isNaN(x) || isNaN(y)) {
            commonUtility.logger.error("You should properly set arguments!");
            throw new WrongArgumentException("You should properly set arguments!");
        }
        
        x = x - this.getTx();
        y = y - this.getTy();
        
        det = this.getM11() * this.getM22() - this.getM12() * this.getM21();
        if (det === 0) {
            commonUtility.logger.error("The determinant equals zero!");
            throw new NoninvertibleTransformException("The determinant equals zero!");
        }
        det = (1 / det);
        return new Point((x * this.getM22() - y * this.getM21()) * det, (y * this.getM11() - x * this.getM12()) * det);
    };
    
    AffineTransform.prototype.inverseTransformX = function(x, y) {
        // inversed transform point into current affine system
        var det;
        
        if (isNaN(x) || isNaN(y)) {
            commonUtility.logger.error("You should properly set arguments!");
            throw new WrongArgumentException("You should properly set arguments!");
        }
        
        x = x - this.getTx();
        y = y - this.getTy();
        
        det = this.getM11() * this.getM22() - this.getM12() * this.getM21();
        if (det === 0) {
            commonUtility.logger.error("The determinant equals zero!");
            throw new NoninvertibleTransformException("The determinant equals zero!");
        }
        det = (1 / det);
        return ((x * this.getM22() - y * this.getM21()) * det);
    };
    
    AffineTransform.prototype.inverseTransformY = function(x, y) {
        // inversed transform point into current affine system
        var det;
        
        if (isNaN(x) || isNaN(y)) {
            commonUtility.logger.error("You should properly set arguments!");
            throw new WrongArgumentException("You should properly set arguments!");
        }
        
        x = x - this.getTx();
        y = y - this.getTy();
        
        det = this.getM11() * this.getM22() - this.getM12() * this.getM21();
        if (det === 0) {
            commonUtility.logger.error("The determinant equals zero!");
            throw new NoninvertibleTransformException("The determinant equals zero!");
        }
        det = (1 / det);
        return ((y * this.getM11() - x * this.getM12()) * det);
    };
    
    AffineTransform.prototype.transformX = function(x, y) {
        // transform point y coordinates into current affine system
        return (this.getM11() * x + this.getM21() * y + this.getTx());
    };
    
    AffineTransform.prototype.transformY = function(x, y) {
        // transform point x coordinates into current affine system
        return (this.getM12() * x + this.getM22() * y + this.getTy());
    };
    
    // canvas implementation
    // --------------------------------------------------------------------------
    // ANTS_TAG : maybe better add here also DataView variable?
    // represent data of graphics 2d context and manipulation on it, even in
    // web-worker
    // ANTS_TAG : create additional constructor from supplied canvas object.
    function Canvas() {
        var buffer, canvasWidth, canvasHeight, transform, dataView, ii, args, originPoint, alpha;
        
        args = splitArguments(arguments);
        
        if (args.length === 1 && args[0].length) {
            args = args[0];
        }
        
        // ANTS_TAG : change after serialization changes!
        if (args[0] && args[0].constructor === ArrayBuffer && args[0].byteLength > 29) {
            dataView = new DataView(args[0]);
            canvasWidth = dataView.getFloat32(0);
            canvasHeight = (dataView.byteLength - 28) / (canvasWidth << 2);
            transform = new AffineTransform(dataView.getFloat32(dataView.byteLength - 24), dataView
                    .getFloat32(dataView.byteLength - 20), dataView.getFloat32(dataView.byteLength - 16), dataView
                    .getFloat32(dataView.byteLength - 12), dataView.getFloat32(dataView.byteLength - 8), dataView
                    .getFloat32(dataView.byteLength - 4));
            buffer = new DataView(new ArrayBuffer((canvasHeight * canvasWidth) << 2));
            
            for (ii = 4; ii < (dataView.byteLength - 24); ii += 4) {
                buffer.setUint32(ii - 4, dataView.getUint32(ii));
            }
            buffer = buffer.buffer;
            // ANTS_TAG : temporary stub!
            originPoint = new Point(0, 0);
            alpha = 1;
            dataView = null;
        }
        else {
            canvasWidth = (!isNaN(args[0]) ? args[0] : 1);
            canvasHeight = (!isNaN(args[1]) ? args[1] : 1);
            buffer = ((args[2] && (args[2].constructor === ArrayBuffer)) ? args[2] : new ArrayBuffer(
                (canvasHeight * canvasWidth) << 2));
            transform = ((args[3] && args[3].type && args[3].type() === "workerUtility.AffineTransform")
                ? args[3]
                : new AffineTransform());
            originPoint = ((args[4] && args[4].type && args[4].type() === "workerUtility.Point") ? args[4] : new Point());
            alpha = ((!isNaN(args[5]) && args[5].constructor === Number) ? args[5] : 1);
        }
        
        if (alpha > 1 || alpha < 0) {
            commonUtility.logger.warn("Alpha parameter could be in range [0;1]. You set up : " + alpha);
            // throw new WrongArgumentException("Alpha parameter could be in
            // range [0;1]. You set up : " + alpha);
            alpha = 1;
        }
        
        this.affineTM = function() {
            return transform;
        };
        
        this.internalWidth = function() {
            return canvasWidth;
        };
        
        this.internalHeight = function() {
            return canvasHeight;
        };
        
        this.arrayBuffer = function() {
            return buffer;
        };
        this.origin = function() {
            return originPoint;
        };
        this.getAlpha = function() {
            return alpha;
        };
        this.setAlpha = function(value) {
            if (isNaN(value) || value.c !== Number.constructor) {
                throw new WrongArgumentException("Please proper set up input argument of alpha paramener!");
            }
            if (value > 1 || value < 0) {
                commonUtility.logger.warn("Alpha parameter could be in range [0;1]. You set up : " + alpha);
                // throw new WrongArgumentException("Alpha parameter could be in
                // range [0;1]. You set up : " + alpha);
                alpha = 1;
                return;
            }
            alpha = value;
        };
    }
    
    Canvas.prototype.toString = function() {
        return "Canvas object : [width = " + this.internalWidth() + " x height = " + this.internalHeight() + " ]\n"
            + this.affineTM().toString();
    };
    
    Canvas.prototype.setOrigin = function(value) {
        if (value === 'undefined' || value.constructor === Point) {
            throw new WrongArgumentException("You must supplied Point instance to setup origin!");
        }
        // ANTS_TAG : recompute affine matrix!
        this.origin().set(value.getX(), value.getY());
    };
    
    Canvas.prototype.setOriginX = function(value) {
        if (isNaN(value)) {
            throw new WrongArgumentException("You must supplied Point instance to setup origin!");
        }
        // ANTS_TAG : recompute affine matrix!
        this.origin().setX(value.getX());
    };
    
    Canvas.prototype.setOriginY = function(value) {
        if (isNaN(value)) {
            throw new WrongArgumentException("You must supplied Point instance to setup origin!");
        }
        // ANTS_TAG : recompute affine matrix!
        this.origin().setY(value.getY());
    };
    
    Canvas.prototype.getOrigin = function(value) {
        return ImmutablePoint(this.origin());
    };
    
    Canvas.prototype.getOriginX = function(value) {
        return this.origin().getX();
    };
    
    Canvas.prototype.getOriginY = function(value) {
        return this.origin().getY();
    };
    
    Canvas.prototype.draw = function(canvas, x, y, width, height, sx, sy, sw, sh) {
        var dataView, canvasDataView, ii, jj, thisIndex, canvasIndex;
        if (!(canvas && canvas.type() === "workerUtility.ForkCanvasObject")) {
            commonUtility.logger.error("You have setted empty or mismatched element(should be forkcanvas object)!");
            throw new WrongArgumentException("You have setted empty or mismatched element(should be forkcanvas object)!");
        }
        if (width === 0 || height === 0 || sw === 0 || sh === 0) {
            // nothing to draw
            commonUtility.logger.warn("The size of an drawing area or source size is zero!");
            return;
        }
        
        x = (!isNaN(x) ? x : this.affineTM().transformX(0, 0));
        y = (!isNaN(y) ? y : this.affineTM().transformY(0, 0));
        width = (!isNaN(width) ? width : this.width());
        height = (!isNaN(height) ? height : this.height());
        sx = (!isNaN(sx) ? sx : canvas.affineTM().transformX(0, 0));
        sy = (!isNaN(sy) ? sy : canvas.affineTM().transformY(0, 0));
        sw = (!isNaN(sw) ? sw : canvas.width());
        sh = (!isNaN(sh) ? sh : canvas.height());
        
        if (x < 0 || y < 0 || width < 0
            || ((x + width) > this.affineTM().transformX(this.internalWidth(), this.internalHeight())) || height < 0
            || ((y + height) > this.affineTM().transformY(this.internalWidth(), this.internalHeight()))) {
            commonUtility.logger.warn("You have setted mismatched arguments!");
        }
        if (sx < 0 || sy < 0 || sw < 0 || sh < 0
            || ((sx + sw) > canvas.affineTM().transformX(canvas.internalWidth(), canvas.internalHeight()))
            || ((sy + sh) > canvas.affineTM().transformY(canvas.internalWidth(), canvas.internalHeight()))) {
            commonUtility.logger.warn("You have setted mismatched arguments!");
        }
        
        dataView = new DataView(this.arrayBuffer());
        canvasDataView = new DataView(canvas.arrayBuffer());
        
        for (jj = 0; jj < height; jj++) {
            for (ii = 0; ii < width; ii++) {
                // nearest
                thisIndex = approximateIndex((jj + y), (ii + x), this.affineTM(), this.internalWidth(), this.internalHeight());
                canvasIndex = approximateIndex((jj * sh / height + sx), (ii * sw / width + sx), canvas.affineTM(), canvas
                        .internalWidth(), canvas.internalHeight());
                dataView.setUint32(thisIndex, (dataView.getUint32(thisIndex) | canvasDataView.getUint32(canvasIndex)));
            }
        }
        
    };
    
    // draw text on canvas
    Canvas.prototype.drawText = function(text, options, x, y, width, height) {
        // ANTS_TAG : implement me!
    };
    
    Canvas.prototype.putImageData = function(imageData, x, y, width, height) {
        var dataView, inDataView, index, currRow, init;
        
        if (width === 0 || height === 0) {
            // nothing to draw
            commonUtility.logger.warn("The size of an drawing area or source size is zero!");
            return;
        }
        
        x = (!isNaN(x) ? x : 0);
        y = (!isNaN(y) ? y : 0);
        width = (!isNaN(width) ? width : this.internalWidth());
        height = (!isNaN(height) ? height : this.internalHeight());
        
        if (x < 0 || y < 0 || (width < 0) || (height < 0) || (x + width) > this.internalWidth()
            || (y + height) > this.internalHeight()) {
            commonUtility.logger.error("You tried setting image data into non existing coordinates!");
            throw new NonExistingCoordinatesException("You tried setting image data into non existing coordinates!");
        }
        if (!(imageData && imageData.constructor === ArrayBuffer)) {
            commonUtility.logger.error("You have setting empty argument or wrong type of variable!");
            throw new WrongArgumentException("You have setting empty argument or wrong type of variable!");
        }
        if (imageData.byteLength != (((width * height) * 4))) {
            commonUtility.logger.error("Inconsistance of arguments! The width and height don't appropriate to ArrayBuffer!");
            throw new WrongArgumentException("Inconsistance of arguments! The width and height don't appropriate to ArrayBuffer!");
        }
        
        dataView = new DataView(this.arrayBuffer());
        inDataView = new DataView(imageData);
        index = 0;
        currRow = 0;
        init = y * this.internalWidth() + x;
        while (((currRow + index) * 4) < imageData.byteLength) {
            dataView.setUint32(((init + index) * 4), inDataView.getUint32(((currRow + index) * 4)));
            index++;
            if (index >= width) {
                currRow += width;
                init += this.internalWidth();
                index = 0;
            }
        }
        dataView = null;
        inDataView = null;
    };
    
    Canvas.prototype.getImageData = function(x, y, width, height) {
        var buffer, dataView, internalDataView, index, currRow, init;
        
        if (width === 0 || height === 0) {
            // nothing to draw
            commonUtility.logger.warn("The size of an drawing area or source size is zero!");
            return;
        }
        
        x = (!isNaN(x) ? x : 0);
        y = (!isNaN(y) ? y : 0);
        width = (!isNaN(width) ? width : this.internalWidth());
        height = (!isNaN(height) ? height : this.internalHeight());
        
        if (x < 0 || y < 0 || (width < 0) || (height < 0) || (x + width) > this.internalWidth()
            || (y + height) > this.internalHeight()) {
            commonUtility.logger.error("You tried setting image data into non existing coordinates!");
            throw new NonExistingCoordinatesException("You tried setting image data into non existing coordinates!");
        }
        
        buffer = new ArrayBuffer((width * height) * 4);
        dataView = new DataView(buffer);
        internalDataView = new DataView(this.arrayBuffer());
        index = 0;
        currRow = 0;
        init = y * this.internalWidth() + x;
        while (((index + currRow) * 4) < buffer.byteLength) {
            dataView.setUint32(((currRow + index) * 4), internalDataView.getUint32(((init + index) * 4)));
            index++;
            if (index >= width) {
                currRow += width;
                init += this.internalWidth();
                index = 0;
            }
        }
        internalDataView = null;
        dataView = null;
        return buffer;
    };
    
    Canvas.prototype.drawLine = function() {
        // ANTS_TAG : implement me!
    };
    
    Canvas.prototype.clip = function() {
        // ANTS_TAG : implement me!
    };
    
    Canvas.prototype.save = function() {
        // ANTS_TAG : implement me!
    };
    
    Canvas.prototype.restore = function() {
        // ANTS_TAG : implement me!
    };
    
    Canvas.prototype.transform = function() {
        return this.affineTM();
    };
    
    Canvas.prototype.type = function() {
        return "workerUtility.ForkCanvasObject";
    };
    
    Canvas.prototype.scale = function(scaleX, scaleY) {
        this.affineTM().scale(scaleX, scaleY);
    };
    
    Canvas.prototype.scaleX = function(scaleX) {
        this.affineTM().scaleX(scaleX);
    };
    
    Canvas.prototype.scaleY = function(scaleY) {
        this.affineTM().scaleY(scaleY);
    };
    
    Canvas.prototype.rotate = function(angle) {
        this.affineTM().rotate(angle);
    };
    
    Canvas.prototype.translate = function(x, y) {
        this.affineTM().translate(x, y);
    };
    
    Canvas.prototype.translateX = function(x) {
        this.affineTM().translateX(x);
    };
    
    Canvas.prototype.translateY = function(y) {
        this.affineTM().translateY(y);
    };
    
    Canvas.prototype.setTransform = function(transform) {
        this.affineTM().setTransform(transform);
    };
    
    Canvas.prototype.setTransform = function(m11, m12, m21, m22, tx, ty) {
        this.affineTM().set(m11, m12, m21, m22, tx, ty);
    };
    
    Canvas.prototype.getBytes = function() {
        // ANTS_TAG : add here new serealization rules(new properties)!!!
        // return serialized ArrayBuffer of this object
        // first 4 bytes should contains width of canvas object, to
        // get possibility know subsequent arrays of bitmap = width*height*4
        // and last 24 bytes is affine transform of an object!
        var serializedObject, dataView, bufferView, bufferLength, index, ii;
        bufferLength = this.arrayBuffer().byteLength;
        serializedObject = new ArrayBuffer(28 + bufferLength);
        
        dataView = new DataView(serializedObject, 0);
        
        dataView.setFloat32(0, this.width());
        index = bufferLength + 4;
        bufferView = new DataView(this.arrayBuffer());
        
        // ANTS_TAG : try change this implementation on more efficient copy!
        for (ii = 4; ii < index; ii += 4) {
            dataView.setUint32(ii, bufferView.getUint32((ii - 4)));
        }
        
        // last 24 bytes contains affine transform
        dataView.setFloat32(index, this.affineTM().getM11());
        index += 4;
        dataView.setFloat32(index, this.affineTM().getM12());
        index += 4;
        dataView.setFloat32(index, this.affineTM().getM21());
        index += 4;
        dataView.setFloat32(index, this.affineTM().getM22());
        index += 4;
        dataView.setFloat32(index, this.affineTM().getTx());
        index += 4;
        dataView.setFloat32(index, this.affineTM().getTy());
        
        return dataView.buffer;
    };
    
    // fill canvas accroding to input values, color pattern : rgba
    Canvas.prototype.drawColor = function(color, x, y, width, height) {
        var dataView, init, index, end;
        if (width === 0 || height === 0) {
            commonUtility.logger.warn("The size of drawable region is zero -> skip action");
            return;
        }
        color = ((!isNaN(color)) ? color : DEFAULT_COLOR);
        x = ((!isNaN(x)) ? x : 0);
        y = ((!isNaN(y)) ? y : 0);
        width = ((!isNaN(width)) ? width : this.internalWidth());
        height = ((!isNaN(height)) ? height : this.internalHeight());
        
        if (x < 0 || y < 0 || width < 0 || ((x + width) > this.internalWidth()) || height < 0
            || ((y + height) > this.internalHeight())) {
            commonUtility.logger.error("You have setted mismatched arguments!");
            throw new WrongArgumentException("You have setted mismatched arguments!");
        }
        
        dataView = new DataView(this.arrayBuffer());
        
        init = y * this.internalWidth() + x;
        end = (y + (height - 1)) * this.internalWidth() + x + (width - 1);
        index = 0;
        while ((init + index) < end) {
            dataView.setUint32(((init + index) * 4), color);
            index++;
            if (index >= width) {
                init += this.internalWidth();
                index = 0;
            }
        }
        dataView = null;
    };
    
    Canvas.prototype.width = function() {
        return (this.internalWidth() * this.affineTM().getScaleX());
    };
    
    Canvas.prototype.height = function() {
        return (this.internalHeight() * this.affineTM().getScaleY());
    };
    
    Canvas.prototype.clone = function() {
        // ANTS_TAG : should also create and copy array buffer
        return new Canvas(this.internalWidth(), this.internalHeight(), this.arrayBuffer(), this.affineTM().clone());
    };
    
    // --------------------------------------------------------------------------
    
    // virtual class
    // ANTS_TAG : in future should be re-implemented for better performance,
    // should return pure virtual instance.
    // ANTS_TAG : should think up about constructor restriction of function
    return {
        createCanvas : function() {
            return new Canvas(arguments);
        },
        createTransform : function() {
            return new AffineTransform(arguments);
        },
        createPoint : function() {
            return new Point(arguments);
        }
    };
    
})();

RM = resourcesManager = (function() {
    'use strict';
    var ctx;
    // ANTS_TAG : API : provide possibility create image's bitmaps for main
    // Thread, load from URL, create URL for object with method getBytes
    
    // initializing
    // --------------------------------------------------------------------------
    if (!CU.isWorker) {
        // in window thread
        ctx = document.createElement("canvas").getContext("2d");
    }
    else {
        ctx = false;
    }
    
    // Library exceptions
    // --------------------------------------------------------------------------
    
    function WrongExecutionThreadException(message) {
        this.message = message;
        this.name = "Wrong argument exception";
    }
    
    function WrongArgumentException(message) {
        this.message = message;
        this.name = "Wrong execution thread exception";
    }
    
    // Utility functions
    // --------------------------------------------------------------------------
    
    // create Canvas object from supplied url of image (window Thread)
    function createBitmap(url) {
        var img;
        if (url === "undefined" || url.constructor !== String) {
            throw new WrongArgumentException("Can't load image of empty url!");
        }
        if (ctx) {
            // ANTS_TAG : what about width and height?
            img = document.createElement("img");
            img.src = url;
            // ctx.canvas.width = 1;
            // ctx.canvas.height = 1;
            ctx.drawImage(img);
        }
        else {
            throw new WrongExecutionThreadException("You can't use CanvasRenderingContext2D object into worker thread!");
        }
        img = null;
    }
    
    // should create blob URL
    function serializeObject(instance) {
        // ANTS_TAG : implement me!
    }
    
    // loads blob object, from input url
    function loadObject(url) {
        // ANTS_TAG : implement me!
    }
    
    // Resource object
    // --------------------------------------------------------------------------
    
    function Resource() {
        // ANTS_TAG : implement me!
    }
    
    Resource.prototype.toString = function() {
        // ANTS_TAG : implement me!
        return "Resource : ";
    };
    
    return {

    };
})();
