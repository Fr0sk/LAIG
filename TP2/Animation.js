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
Animation.prototype.reply = function() {
    throw new Error("Abstract method!");
}

Animation.prototype.animate = function(deltaTime){
    
};