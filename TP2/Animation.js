/**
 * Abstract contructor
 */
var Animation = function() {
    if(this.constructor === Animation)
        throw new Error("Can't instantiate abstract class!");
};

/**
 * Abstract method
 */
Animation.prototype.animate = function(deltaTime){
    throw new Error("animete is an abstract method!");
};